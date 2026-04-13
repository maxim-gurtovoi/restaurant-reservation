import { PageHeader } from '@/components/ui/page-header';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="max-w-md space-y-6">
      <PageHeader
        title="Вход"
        subtitle="Управляйте бронями или работайте с рестораном."
      />
      <LoginForm />
    </div>
  );
}

