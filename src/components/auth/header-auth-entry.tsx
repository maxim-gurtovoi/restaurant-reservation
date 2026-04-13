'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GuestAvatarMenu } from '@/components/auth/guest-avatar-menu';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';

type AuthMode = 'login' | 'register';

export function HeaderAuthEntry() {
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!modalOpen) return;
    setMode('login');
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
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
  }, [modalOpen]);

  const modal = modalOpen ? (
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={() => setModalOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative flex max-h-[min(92vh,720px)] w-full max-w-md flex-col rounded-t-2xl border border-border/60 bg-surface shadow-card-strong sm:max-h-[min(90vh,680px)] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/50 px-5 py-4">
          <div className="min-w-0 space-y-0.5">
            <h2 id="auth-modal-title" className="text-lg font-semibold tracking-tight text-foreground">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-xs text-muted">
              {mode === 'login'
                ? 'Stay on this page — you can switch to registration below.'
                : 'Create an account, then continue where you left off.'}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-soft hover:text-foreground"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {mode === 'login' ? (
            <>
              <LoginForm
                idPrefix="header-modal-"
                embedInModal
                onAuthenticated={() => setModalOpen(false)}
              />
              <p className="mt-4 text-center text-sm text-muted">
                No account?{' '}
                <button
                  type="button"
                  className="cursor-pointer font-medium text-accent-text underline underline-offset-2 hover:text-primary"
                  onClick={() => setMode('register')}
                >
                  Create account
                </button>
              </p>
            </>
          ) : (
            <>
              <RegisterForm
                idPrefix="header-modal-"
                embedInModal
                onAuthenticated={() => setModalOpen(false)}
              />
              <p className="mt-4 text-center text-sm text-muted">
                Already registered?{' '}
                <button
                  type="button"
                  className="cursor-pointer font-medium text-accent-text underline underline-offset-2 hover:text-primary"
                  onClick={() => setMode('login')}
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
          className="shrink-0"
          onClick={() => setModalOpen(true)}
        >
          Sign in
        </Button>
        <GuestAvatarMenu onOpenSignIn={() => setModalOpen(true)} />
      </div>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
