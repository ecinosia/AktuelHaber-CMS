"use client";

import { Button } from "./Button";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-line bg-surface p-5 flex flex-col gap-3 shadow-lg"
      >
        <h2 id="confirm-dialog-title" className="m-0 text-[15px] font-extrabold font-archivo text-ink">
          {title}
        </h2>
        <p className="m-0 text-[13px] text-body" style={{ fontFamily: "var(--font-public-sans)" }}>
          {message}
        </p>
        <div className="flex justify-end gap-2.5 mt-1.5">
          {/* Explicit type="button" — this dialog can render inside a <form>
              (see ArticleForm), where a button defaults to type="submit". */}
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
