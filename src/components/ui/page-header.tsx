export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
      {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
    </header>
  );
}

