import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ApperIcon from '@/components/ApperIcon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AuthLayout from './AuthLayout';

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) setError(sessionError.message);
      setReady(Boolean(data.session));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
    } catch (err) {
      setError(err?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Password reset" icon="CheckCircle">
        <div className="rounded-xl border bg-muted/30 p-5 text-center space-y-4">
          <div className="size-12 rounded-full bg-success/10 flex items-center justify-center mx-auto"><ApperIcon name="CheckCircle" size={24} className="text-success" /></div>
          <p className="text-sm text-foreground">Your password has been reset successfully.</p>
          <Button asChild className="w-full h-9"><Link to="/login">Sign in</Link></Button>
        </div>
      </AuthLayout>
    );
  }

  if (!ready) {
    return (
      <AuthLayout title="Reset password" icon="KeyRound">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">This reset link is invalid or has expired.</p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button asChild className="w-full h-9"><Link to="/forgot-password">Request a new link</Link></Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password" description="Enter your new password below." icon="KeyRound">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="space-y-1">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-9 pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"><ApperIcon name={showPassword ? 'EyeOff' : 'Eye'} size={16} /></button>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-9 pr-10" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"><ApperIcon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} /></button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="pt-2"><Button type="submit" disabled={loading} className="w-full h-9">{loading ? 'Resetting…' : 'Reset password'}</Button></div>
      </form>
    </AuthLayout>
  );
}
