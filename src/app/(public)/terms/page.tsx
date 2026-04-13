import { PageHeader } from '@/components/ui/page-header';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Условия использования"
        subtitle="Черновик для учебного проекта. Замените содержимое перед публикацией."
      />
      <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
        <p className="text-muted">
          Здесь могут быть изложены правила использования сервиса бронирования: ограничение
          ответственности, порядок бронирования и отмены, поведение пользователей и менеджеров.
        </p>
        <p className="text-muted">
          Текущая версия приложения предназначена для демонстрации функциональности и не является
          публичной офертой.
        </p>
      </div>
    </div>
  );
}
