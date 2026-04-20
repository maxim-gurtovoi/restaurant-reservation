'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/i18n';
import { AuthModal } from '@/components/auth/auth-modal';

type RegisterModalTriggerProps = {
  className?: string;
  label?: string;
  locale?: Locale;
};

export function RegisterModalTrigger({
  className,
  label = 'Бесплатная регистрация',
  locale = 'ru',
}: RegisterModalTriggerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={className}
        aria-haspopup="dialog"
        aria-expanded={modalOpen}
        onClick={() => setModalOpen(true)}
      >
        {label}
      </Button>
      <AuthModal
        key={modalOpen ? 'open' : 'closed'}
        open={modalOpen}
        initialMode="register"
        locale={locale}
        idPrefix="hero-register-modal-"
        titleId="register-modal-title"
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

