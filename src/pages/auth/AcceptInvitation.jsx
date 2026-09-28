import AuthLayout from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AcceptInvitation() {
  return <AuthLayout title="Accept invitation" icon="UserPlus" description="Invitation-based team access is not enabled for this personal finance account.">
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Sign in with your Ledgerly account to continue.</p>
      <Button asChild className="w-full"><Link to="/login">Go to sign in</Link></Button>
    </div>
  </AuthLayout>;
}
