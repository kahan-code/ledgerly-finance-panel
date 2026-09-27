import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sdk } from '@/services/sdk';
import { setUser, clearUser, setInitialized } from '@/store/userSlice';
import { verifyRouteAccess } from '@/router/route.utils';
import { APP_CONFIG, AUTH_PROFILES, GENERIC_AUTH } from '@/config/app.config';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within RootLayout');
  return ctx;
}

const AUTH_PAGE_PATTERN = /^\/(([\w-]+)\/)?(login|signup|callback|forgot-password|reset-password|verify-email|accept-invite)/;

export default function RootLayout() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isInitialized } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const matches = useMatches();

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const hasInitRef = useRef(false);

  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;

    let isMounted = true;
    const init = async () => {
      try {
        const currentUser = sdk.session.user();
        if (!isMounted) return;
        if (currentUser) {
          dispatch(setUser(currentUser));
          handlePostAuthNavigation();
        } else {
          dispatch(setInitialized());
        }
      } catch {
        if (isMounted) dispatch(setInitialized());
      }
    };
    init();

    const unsub = sdk.session.subscribe((state) => {
      if (state.status === 'authenticated' && state.user) {
        dispatch(setUser(state.user));
        handlePostAuthNavigation();
      } else if (state.status === 'anonymous') {
        dispatch(clearUser());
      }
    });

    return () => { isMounted = false; unsub(); };
  }, [dispatch]);

  function handlePostAuthNavigation() {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('redirect');
    if (redirectPath) {
      navigateRef.current(redirectPath, { replace: true });
      return;
    }
    const pathname = window.location.pathname;
    const authMatch = pathname.match(AUTH_PAGE_PATTERN);
    if (authMatch) {
      const profileKey = authMatch[2];
      const matched = profileKey && AUTH_PROFILES?.find(p => p.key === profileKey);
      const target = matched?.redirectAfterAuth ?? GENERIC_AUTH?.redirectAfterAuth ?? '/';
      navigateRef.current(target, { replace: true });
    }
  }

  const deepestMatch = matches[matches.length - 1];
  const accessRule = deepestMatch?.handle?.access ?? 'public';

  useEffect(() => {
    if (!isInitialized) return;
    if (!verifyRouteAccess(accessRule, user)) {
      const loginRoute = APP_CONFIG.defaultLoginRoute ?? '/login';
      if (user) {
        navigateRef.current('/access-denied', { replace: true });
      } else {
        const currentPath = location.pathname + location.search;
        navigateRef.current(`${loginRoute}?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
      }
    }
  }, [location.pathname, isInitialized, user, accessRule]);

  const handleLogout = useCallback(async () => {
    await sdk.session.logout();
    dispatch(clearUser());
    navigateRef.current(APP_CONFIG.defaultLoginRoute ?? '/login', { replace: true });
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Connecting…</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ logout: handleLogout, user, isAuthenticated }}>
      <ErrorBoundary fullPage>
        <Outlet />
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}
