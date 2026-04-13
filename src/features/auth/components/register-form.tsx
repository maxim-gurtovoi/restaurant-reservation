'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formInputClass, formLabelClass } from '@/lib/form-field-classes';
import { useRouter } from 'next/navigation';

export type RegisterFormProps = {
  idPrefix?: string;
  embedInModal?: boolean;
  onAuthenticated?: () => void;
};

export function RegisterForm({
  idPrefix = '',
  embedInModal = false,
  onAuthenticated,
}: RegisterFormProps = {}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameId = `${idPrefix}register-name`;
  const emailId = `${idPrefix}register-email`;
  const passwordId = `${idPrefix}register-password`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const name = String(formData.get('name') ?? '');
      const email = String(formData.get('email') ?? '');
      const password = String(formData.get('password') ?? '');

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof json?.error === 'string' ? json.error : 'Failed to create account');
      }

      if (embedInModal) {
        router.refresh();
        onAuthenticated?.();
      } else {
        router.replace('/restaurants');
        router.refresh();
        onAuthenticated?.();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create account';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className={formLabelClass} htmlFor={nameId}>
          Name
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          required
          autoComplete="name"
          className={formInputClass}
        />
      </div>
      <div className="space-y-1">
        <label className={formLabelClass} htmlFor={emailId}>
          Email
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
          Password
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={formInputClass}
        />
      </div>
      <Button className="w-full" type="submit" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create account'}
      </Button>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </form>
  );
}

