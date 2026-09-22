"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

// Accepts a plain string for the common "Bu kayıt silinsin mi?" case, or a
// full ConfirmOptions object when a caller needs a custom title/labels
// (e.g. the unsaved-changes leave guard in ArticleForm).
export type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

// Mounted once in DashboardShell — replaces every window.confirm() in the
// CMS with this branded dialog. resolveRef holds the Promise's resolver
// between the confirm() call and whichever button the user clicks.
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(typeof opts === "string" ? { message: opts } : opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function settle(result: boolean) {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmDialog
          title={options.title ?? "Emin misiniz?"}
          message={options.message}
          confirmLabel={options.confirmLabel ?? "Sil"}
          cancelLabel={options.cancelLabel ?? "Vazgeç"}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
