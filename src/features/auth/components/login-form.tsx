'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formInputClass, formLabelClass } from '@/lib/form-field-classes';
import { useRouter } from 'next/navigation';

export type LoginFormProps = {
  /** Prefix for input ids (avoids duplicates when modal + auth page both mount). */
  idPrefix?: string;
  /** When true, stay on current route and only refresh server components. */
  embedInModal?: boolean;
  /** Called after successful sign-in (after refresh when embedded). */
  onAuthenticated?: () => void;
  /** Same-origin path after login (ignored when embedInModal). */
  postLoginRedirect?: string | null;
};

export function LoginForm({
  idPrefix = '',
  embedInModal = false,
  onAuthenticated,
  postLoginRedirect,
}: LoginFormProps = {}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailId = `${idPrefix}login-email`;
  const passwordId = `${idPrefix}login-password`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const email = String(formData.get('email') ?? '');
      const password = String(formData.get('password') ?? '');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof json?.error === 'string' ? json.error : 'Не удалось войти');
      }

      if (embedInModal) {
        router.refresh();
        onAuthenticated?.();
      } else {
        const target =
          postLoginRedirect && postLoginRedirect.startsWith('/') && !postLoginRedirect.startsWith('//')
            ? postLoginRedirect
            : '/restaurants';
        router.replace(target);
        router.refresh();
        onAuthenticated?.();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Не удалось войти';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className={formLabelClass} htmlFor={emailId}>
          Электронная почта
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          className={formInputClass}
        />
      </div>
      <div className="space-y-1">
        <label className={formLabelClass} htmlFor={passwordId}>
          Пароль
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={formInputClass}
        />
      </div>
      <Button className="w-full" type="submit" disabled={submitting}>
        {submitting ? 'Вход…' : 'Войти'}
      </Button>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </form>
  );
}

