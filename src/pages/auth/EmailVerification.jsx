import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { GENERIC_AUTH } from '@/config/app.config';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AuthLayout from './AuthLayout';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resent, setResent] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
      if (verifyError) throw verifyError;
      if (data.user) navigate(GENERIC_AUTH.redirectAfterAuth, { replace: true });
    } catch (err) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResent(false);
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    if (resendError) setError(resendError.message);
    else setResent(true);
  };

  return (
    <AuthLayout
      title="Verify your email"
      description="Enter the verification code sent to your email."
      icon="MailCheck"
    >
      <form onSubmit={handleVerify} className="flex flex-col gap-3">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-9" />
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
            className="h-9 text-center text-lg tracking-widest"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {resent && <p className="text-sm text-success">Code resent successfully.</p>}
        <div className="pt-2">
          <Button type="submit" disabled={loading} className="w-full h-9">
            {loading ? 'Verifying…' : 'Verify email'}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Didn't receive the code?{' '}
        <button
          type="button"
          onClick={handleResend}
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Resend
        </button>
      </p>
    </AuthLayout>
  );
}
