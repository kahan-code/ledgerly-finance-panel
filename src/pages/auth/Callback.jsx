import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const finish = async () => {
      try {
        const { error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (active) navigate('/dashboard', { replace: true });
      } catch (err) {
        if (active) setError(err?.message || 'Unable to complete sign-in.');
      }
    };

    finish();
    return () => { active = false; };
  }, [navigate]);

  return (
    <div className="min-h-svh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        {error ? (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <button className="text-sm text-primary hover:underline" onClick={() => navigate('/login')}>Back to sign in</button>
          </>
        ) : (
          <>
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Completing sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
}
