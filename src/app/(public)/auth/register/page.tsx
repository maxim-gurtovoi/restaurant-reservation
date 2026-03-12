import { PageHeader } from '@/components/ui/page-header';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  return (
    <div className="max-w-md space-y-6">
      <PageHeader
        title="Create an account"
        subtitle="Register to start booking tables."
      />
      <RegisterForm />
    </div>
  );
}

