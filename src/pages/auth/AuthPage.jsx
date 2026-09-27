import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/userSlice';
import { supabase } from '@/lib/supabase';
import { AUTH_PROFILES, GENERIC_AUTH } from '@/config/app.config';
import ApperIcon from '@/components/ApperIcon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AuthLayout from './AuthLayout';

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile: profileParam } = useParams();

  const hasProfiles = AUTH_PROFILES?.length > 0;
  const matchedProfile = hasProfiles && profileParam
    ? AUTH_PROFILES.find((p) => p.key === profileParam)
    : null;

  const redirectAfterAuth = matchedProfile?.redirectAfterAuth ?? GENERIC_AUTH.redirectAfterAuth;
  const authPage = matchedProfile?.authPage;
  const title = mode === 'login'
    ? (authPage?.loginTitle ?? GENERIC_AUTH.loginTitle)
    : (authPage?.signupTitle ?? GENERIC_AUTH.signupTitle);
  const description = mode === 'login'
    ? (authPage?.loginDescription ?? GENERIC_AUTH.loginDescription)
    : (authPage?.signupDescription ?? GENERIC_AUTH.signupDescription);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        if (data.user) {
          dispatch(setUser(data.user));
          navigate(redirectAfterAuth, { replace: true });
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;

        if (data.session && data.user) {
          dispatch(setUser(data.user));
          navigate(redirectAfterAuth, { replace: true });
        } else {
          setMessage('Account created. Check your email to confirm your account, then sign in.');
        }
      }
    } catch (err) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setMessage(null);
    setGoogleLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/callback',
        },
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err?.message || 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout title={title} description={description}>
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={loading || googleLoading}
          className="w-full h-10"
        >
          <span className="mr-2 text-base font-semibold">G</span>
          {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-xs text-muted-foreground">or continue with email</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === 'login' && (
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                <ApperIcon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  <ApperIcon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-primary">{message}</p>}

          <div className="pt-2">
            <Button type="submit" disabled={loading || googleLoading} className="w-full h-9">
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>

      <AuthFooter mode={mode} profilePrefix={profileParam} />
    </AuthLayout>
  );
}

function AuthFooter({ mode, profilePrefix }) {
  const base = profilePrefix ? `/${profilePrefix}` : '';
  return (
    <div className="mt-8">
      <p className="text-[13px] text-center text-muted-foreground">
        {mode === 'login' ? (
          <>Don't have an account?{' '}
            <Link to={`${base}/signup`} className="text-primary font-medium hover:underline underline-offset-4 transition-colors">Sign up</Link>
          </>
        ) : (
          <>Already have an account?{' '}
            <Link to={`${base}/login`} className="text-primary font-medium hover:underline underline-offset-4 transition-colors">Sign in</Link>
          </>
        )}
      </p>
    </div>
  );
}
