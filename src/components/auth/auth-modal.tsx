'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

type AuthMode = 'login' | 'register';

type AuthModalProps = {
  open: boolean;
  initialMode?: AuthMode;
  locale?: Locale;
  idPrefix: string;
  titleId: string;
  onClose: () => void;
};

// `createPortal(..., document.body)` needs the DOM, so we gate rendering until
// the client mount has happened. `useSyncExternalStore` is React 19's idiomatic
// way to read a "value that differs between server and client" without any
// state-in-effect ping-pong.
const subscribeNoop = () => () => {};
const getIsClient = () => true;
const getIsServer = () => false;

export function AuthModal({
  open,
  initialMode = 'login',
  locale = 'ru',
  idPrefix,
  titleId,
  onClose,
}: AuthModalProps) {
  const mounted = useSyncExternalStore(subscribeNoop, getIsClient, getIsServer);
  // Reset to `initialMode` across open/close cycles is handled by the caller
  // via `key={modalOpen ? 'open' : 'closed'}` — see `header-auth-entry.tsx`
  // and `register-modal-trigger.tsx`. Within a single open session the user
  // can still freely switch between login/register via the footer links.
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const t = getMessages(locale);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open, onClose]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        aria-label={t.common.closeModal}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(92vh,720px)] w-full max-w-md flex-col rounded-t-2xl border border-border/60 bg-surface shadow-card-strong sm:max-h-[min(90vh,680px)] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/50 px-5 py-4">
          <div className="min-w-0 space-y-0.5">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight text-foreground">
              {mode === 'login' ? t.common.login : t.common.register}
            </h2>
            <p className="text-xs text-muted">
              {mode === 'login'
                ? locale === 'ro'
                  ? 'Rămâi pe pagină — poți trece la înregistrare mai jos.'
                  : 'Оставайтесь на странице — ниже можно перейти к регистрации.'
                : locale === 'ro'
                  ? 'Creează un cont și continuă din același loc.'
                  : 'Создайте аккаунт и продолжите с того же места.'}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-soft hover:text-foreground"
            aria-label={t.common.close}
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {mode === 'login' ? (
            <>
              <LoginForm idPrefix={idPrefix} embedInModal onAuthenticated={onClose} />
              <p className="mt-4 text-center text-sm text-muted">
                {t.common.noAccount}{' '}
                <button
                  type="button"
                  className="cursor-pointer font-medium text-accent-text underline underline-offset-2 hover:text-primary"
                  onClick={() => setMode('register')}
                >
                  {t.common.signUpAction}
                </button>
              </p>
            </>
          ) : (
            <>
              <RegisterForm idPrefix={idPrefix} embedInModal onAuthenticated={onClose} />
              <p className="mt-4 text-center text-sm text-muted">
                {t.common.haveAccount}{' '}
                <button
                  type="button"
                  className="cursor-pointer font-medium text-accent-text underline underline-offset-2 hover:text-primary"
                  onClick={() => setMode('login')}
                >
                  {t.common.signInAction}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

