import { PageHeader } from '@/components/ui/page-header';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="max-w-md space-y-6">
      <PageHeader
        title="Sign in"
        subtitle="Access your reservations or manage your restaurant."
      />
      <LoginForm />
    </div>
  );
}

