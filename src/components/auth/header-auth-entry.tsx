'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { AuthModal } from '@/components/auth/auth-modal';

export function HeaderAuthEntry({ locale = 'ru' }: { locale?: Locale }) {
  const [modalOpen, setModalOpen] = useState(false);
  const t = getMessages(locale);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
          className="h-10 shrink-0 gap-1.5 rounded-full border border-border/75 bg-surface px-4 text-sm font-semibold text-foreground hover:border-[#17191F] hover:bg-[#17191F] hover:text-white"
          onClick={() => setModalOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path
              d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.314 0-6 2.015-6 4.5 0 .276.224.5.5.5h11a.5.5 0 00.5-.5c0-2.485-2.686-4.5-6-4.5z"
              fill="currentColor"
            />
          </svg>
          <span>{t.common.login}</span>
        </Button>
      </div>
      <AuthModal
        key={modalOpen ? 'open' : 'closed'}
        open={modalOpen}
        initialMode="login"
        locale={locale}
        idPrefix="header-modal-"
        titleId="auth-modal-title"
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
