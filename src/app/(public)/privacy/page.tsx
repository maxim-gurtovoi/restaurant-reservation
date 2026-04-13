import { PageHeader } from '@/components/ui/page-header';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Политика конфиденциальности"
        subtitle="Черновик для учебного проекта. Замените содержимое перед публикацией."
      />
      <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
        <p className="text-muted">
          Здесь может размещаться политика обработки персональных данных. В демо-версии TableFlow
          данные используются только в рамках локальной разработки и тестирования.
        </p>
        <p className="text-muted">
          При необходимости добавьте разделы: какие данные собираются, цели, сроки хранения, права
          пользователя и контакты ответственного лица.
        </p>
      </div>
    </div>
  );
}
