import { PageHeader } from '@/components/ui/page-header';
import { LoginForm } from '@/features/auth/components/login-form';
import { sanitizeInternalNextPath } from '@/lib/auth-redirect';

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = params[key];
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextRaw = firstParam(params, 'next');
  const postLoginRedirect = sanitizeInternalNextPath(nextRaw);

  return (
    <div className="max-w-md space-y-6">
      <PageHeader
        title="Вход"
        subtitle="Управляйте бронями или работайте с рестораном."
      />
      <LoginForm postLoginRedirect={postLoginRedirect} />
    </div>
  );
}
