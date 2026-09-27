import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import RootLayout from '@/layouts/RootLayout';
import OwnerLayout from '@/layouts/OwnerLayout';
import PublicLayout from '@/layouts/PublicLayout';
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-background">
    <Loader2 className="size-8 animate-spin text-muted-foreground" />
  </div>
);

const wrap = (Component) => (
  <Suspense fallback={<PageLoader />}><Component /></Suspense>
);

// Auto-discover: eager modules for route metadata + lazy loaders for code-splitting
const pageMods = import.meta.glob('/src/pages/**/*.jsx', { eager: true });
const pageLoaders = import.meta.glob('/src/pages/**/*.jsx');
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

const discoveredRoutes = Object.entries(pageMods)
  .filter(([, mod]) => mod.route)
  .map(([filePath, mod]) => ({
    ...mod.route,
    _component: lazy(pageLoaders[filePath]),
  }));

function buildDiscoveredRoute(r) {
  const isIndex = r.path === '/';
  const config = {
    element: wrap(r._component),
    handle: { access: r.access ?? 'public' },
  };
  if (isIndex) config.index = true;
  else config.path = r.path.replace(/^\//, '');
  return config;
}

// Auth routes (frozen pages — no route export, handled separately)
const AuthPage = lazy(() => import('@/pages/auth/AuthPage'));
const AuthCallback = lazy(() => import('@/pages/auth/Callback'));
const AuthError = lazy(() => import('@/pages/auth/ErrorPage'));
const AuthAccessDenied = lazy(() => import('@/pages/auth/AccessDenied'));
const AuthResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const AuthForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const AuthPromptPassword = lazy(() => import('@/pages/auth/PromptPassword'));
const AuthEmailVerification = lazy(() => import('@/pages/auth/EmailVerification'));
const AuthAcceptInvitation = lazy(() => import('@/pages/auth/AcceptInvitation'));

function buildAuthRoutes() {
  const routes = [];

  const loginEl = (
    <Suspense fallback={<PageLoader />}><AuthPage mode="login" /></Suspense>
  );
  const signupEl = (
    <Suspense fallback={<PageLoader />}><AuthPage mode="signup" /></Suspense>
  );

  routes.push(
    { path: 'login', element: loginEl, handle: { access: 'public' } },
    { path: 'signup', element: signupEl, handle: { access: 'public' } },
    { path: ':profile/login', element: loginEl, handle: { access: 'public' } },
    { path: ':profile/signup', element: signupEl, handle: { access: 'public' } },
  );

  routes.push(
    { path: 'callback', element: wrap(AuthCallback), handle: { access: 'public' } },
    { path: 'access-denied', element: wrap(AuthAccessDenied), handle: { access: 'public' } },
    { path: 'error', element: wrap(AuthError), handle: { access: 'public' } },
    { path: 'forgot-password', element: wrap(AuthForgotPassword), handle: { access: 'public' } },
    { path: 'reset-password', element: wrap(AuthResetPassword), handle: { access: 'public' } },
    { path: 'reset-password/:appId/:fields', element: wrap(AuthResetPassword), handle: { access: 'public' } },
    { path: 'prompt-password/:appId/:emailAddress/:provider', element: wrap(AuthPromptPassword), handle: { access: 'public' } },
    { path: 'verify-email', element: wrap(AuthEmailVerification), handle: { access: 'public' } },
    { path: 'accept-invite', element: wrap(AuthAcceptInvitation), handle: { access: 'public' } },
  );
  return routes;
}

const ownerRoutes = discoveredRoutes.filter((r) => r.layout === 'owner').map(buildDiscoveredRoute);
const publicRoutes = [
  ...discoveredRoutes.filter((r) => r.layout === 'public').map(buildDiscoveredRoute),
  ...buildAuthRoutes(),
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <OwnerLayout />,
        children: [...ownerRoutes],
      },
      {
        element: <PublicLayout />,
        children: [...publicRoutes],
      },
      { path: '*', element: wrap(NotFoundPage) },
    ],
  },
]);
