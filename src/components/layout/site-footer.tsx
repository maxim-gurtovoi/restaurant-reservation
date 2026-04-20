import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { SITE_FOOTER_META } from '@/lib/site-footer-meta';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

const footerLinkClass =
  'text-sm text-muted transition-colors duration-150 hover:text-foreground';

const sectionTitleClass =
  'text-[11px] font-semibold uppercase tracking-widest text-muted';

export function SiteFooter({ locale = 'ru' }: { locale?: Locale }) {
  const year = new Date().getFullYear();
  const { authorName, university } = SITE_FOOTER_META;
  const showAuthorBlock = Boolean(authorName || university);
  const t = getMessages(locale);

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
              <Image
                src="/logo-mark.png"
                alt="TableFlow"
                width={276}
                height={339}
                sizes="40px"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-muted">
              {t.footer.description}
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-3" aria-label={t.footer.navTitle}>
            <p className={sectionTitleClass}>{t.footer.navTitle}</p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href={ROUTES.restaurants} className={footerLinkClass}>
                  {t.appShell.restaurants}
                </Link>
              </li>
              <li>
                <Link href={`${ROUTES.home}#how-it-works`} className={footerLinkClass}>
                  {t.footer.howItWorks}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav className="space-y-3" aria-label={t.footer.docsTitle}>
            <p className={sectionTitleClass}>{t.footer.docsTitle}</p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href={ROUTES.privacy} className={footerLinkClass}>
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href={ROUTES.terms} className={footerLinkClass}>
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Project / author */}
          <div className="space-y-3">
            <p className={sectionTitleClass}>{t.footer.projectTitle}</p>
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
                <p className="text-xs leading-relaxed">{t.footer.educationalProject}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
