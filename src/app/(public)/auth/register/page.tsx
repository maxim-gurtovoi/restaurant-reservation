import { PageHeader } from '@/components/ui/page-header';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  return (
    <div className="max-w-md space-y-6">
      <PageHeader
        title="Регистрация"
        subtitle="Создайте аккаунт, чтобы бронировать столики."
      />
      <RegisterForm />
    </div>
  );
}

