import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { SITE_FOOTER_META } from '@/lib/site-footer-meta';

const footerLinkClass =
  'text-sm text-muted transition-colors duration-150 hover:text-foreground';

const sectionTitleClass =
  'text-[11px] font-semibold uppercase tracking-widest text-muted';

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { authorName, university } = SITE_FOOTER_META;
  const showAuthorBlock = Boolean(authorName || university);

  return (
    <footer className="mt-auto border-t border-border/80 bg-surface-soft/60">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Identity */}
          <div className="space-y-3 lg:max-w-xs">
            <Link
              href={ROUTES.home}
              className="inline-flex items-center"
            >
              <img
                src="/logo-mark.png"
                alt="TableFlow"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-muted">
              Система бронирования столиков с регистрацией по QR-коду.
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-3" aria-label="Навигация в подвале">
            <p className={sectionTitleClass}>Разделы</p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href={ROUTES.restaurants} className={footerLinkClass}>
                  Рестораны
                </Link>
              </li>
              <li>
                <Link href={`${ROUTES.home}#how-it-works`} className={footerLinkClass}>
                  Как это работает
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav className="space-y-3" aria-label="Правовая информация">
            <p className={sectionTitleClass}>Документы</p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href={ROUTES.privacy} className={footerLinkClass}>
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href={ROUTES.terms} className={footerLinkClass}>
                  Условия использования
                </Link>
              </li>
            </ul>
          </nav>

          {/* Project / author */}
          <div className="space-y-3">
            <p className={sectionTitleClass}>Проект</p>
            <div className="space-y-1.5 text-sm text-muted">
              <p>
                <span className="text-foreground/90">TableFlow</span>
                {' · '}
                <time dateTime={String(year)}>{year}</time>
              </p>
              {showAuthorBlock ? (
                <>
                  {authorName ? (
                    <p className="leading-relaxed text-foreground/85">{authorName}</p>
                  ) : null}
                  {university ? <p className="leading-relaxed">{university}</p> : null}
                </>
              ) : (
                <p className="text-xs leading-relaxed">Учебный проект (диплом).</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
