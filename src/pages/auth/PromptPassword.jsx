import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function PromptPassword() {
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [error,setError]=useState('');
  const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(false);
  async function submit(e){
    e.preventDefault(); setError('');
    if(password!==confirm){setError('Passwords do not match');return;}
    setLoading(true);
    try{
      const {error:e}=await supabase.auth.updateUser({password});
      if(e) throw e;
      setDone(true);
    }catch(e){setError(e.message||'Could not set password.');}
    finally{setLoading(false);}
  }
  return <AuthLayout title="Set a password" description="Create a password for your Ledgerly account.">
    {done ? <div className="rounded-xl border bg-muted/30 p-5 text-center"><p className="font-semibold">Password set successfully.</p></div> :
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
      <div className="space-y-1"><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required /></div>
      {error&&<p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" disabled={loading}>{loading?'Saving…':'Set password'}</Button>
    </form>}
  </AuthLayout>;
}
