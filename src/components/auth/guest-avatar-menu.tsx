'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type GuestAvatarMenuProps = {
  /** Called when user chooses Sign in from the menu (opens auth modal). */
  onOpenSignIn: () => void;
};

export function GuestAvatarMenu({ onOpenSignIn }: GuestAvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const onMouseDown = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as Node;
      if (!root.contains(target)) setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [open]);

  const handleSignIn = () => {
    setOpen(false);
    onOpenSignIn();
  };

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="ghost"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="h-9 w-9 shrink-0 cursor-pointer rounded-full p-0 transition-all duration-150 ease-in-out hover:scale-[1.03] hover:shadow-sm"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-surface-soft text-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          >
            <path
              d="M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-2 w-52 overflow-hidden rounded-xl border border-border/55 bg-surface shadow-card"
        >
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 ease-in-out hover:bg-surface hover:font-semibold"
            onClick={() => setOpen(false)}
          >
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 ease-in-out hover:bg-surface hover:font-semibold"
            onClick={() => setOpen(false)}
          >
            Settings
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 ease-in-out hover:bg-surface hover:font-semibold"
            onClick={handleSignIn}
          >
            Sign in
          </button>
        </div>
      ) : null}
    </div>
  );
}
