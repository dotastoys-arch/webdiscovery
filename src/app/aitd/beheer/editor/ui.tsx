'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// Eigen bevestigingsvenster + meldingen. Vervangt window.confirm(), dat in
// sommige (ingebouwde) browsers stil wordt geblokkeerd.

type ConfirmOpts = { title: string; message?: string; confirmLabel?: string; danger?: boolean };
type Toast = { id: number; text: string; actionLabel?: string; onAction?: () => void };

type Ui = {
  confirm: (o: ConfirmOpts) => Promise<boolean>;
  toast: (text: string, action?: { label: string; onClick: () => void }) => void;
};

const UiCtx = createContext<Ui | null>(null);

export function useUi(): Ui {
  const c = useContext(UiCtx);
  if (!c) throw new Error('useUi buiten UiProvider');
  return c;
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const confirm = useCallback(
    (o: ConfirmOpts) => new Promise<boolean>((resolve) => setDialog({ ...o, resolve })),
    []
  );

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback<Ui['toast']>(
    (text, action) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-2), { id, text, actionLabel: action?.label, onAction: action?.onClick }]);
      setTimeout(() => dismiss(id), 7000);
    },
    [dismiss]
  );

  const close = (v: boolean) => {
    dialog?.resolve(v);
    setDialog(null);
  };

  return (
    <UiCtx.Provider value={{ confirm, toast }}>
      {children}
      {dialog && <ConfirmDialog opts={dialog} onClose={close} />}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[300] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center gap-4 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl"
          >
            <span>{t.text}</span>
            {t.actionLabel && (
              <button
                type="button"
                className="font-semibold text-[#8FB4D9] hover:text-white"
                onClick={() => {
                  t.onAction?.();
                  dismiss(t.id);
                }}
              >
                {t.actionLabel}
              </button>
            )}
            <button type="button" aria-label="Sluiten" className="text-slate-400 hover:text-white" onClick={() => dismiss(t.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </UiCtx.Provider>
  );
}

function ConfirmDialog({ opts, onClose }: { opts: ConfirmOpts; onClose: (v: boolean) => void }) {
  const okRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/50 p-6" onMouseDown={() => onClose(false)}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-base font-bold text-[#0B2E52]">
          {opts.title}
        </h2>
        {opts.message && <p className="mt-2 text-sm leading-relaxed text-slate-600">{opts.message}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => onClose(false)} className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Annuleren
          </button>
          <button
            ref={okRef}
            type="button"
            onClick={() => onClose(true)}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${opts.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0B2E52] hover:opacity-90'}`}
          >
            {opts.confirmLabel ?? 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}
