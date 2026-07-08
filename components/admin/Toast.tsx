"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Kind = "ok" | "err";
interface Toast {
  id: number;
  msg: string;
  kind: Kind;
}

const ToastCtx = createContext<(msg: string, kind?: Kind) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((msg: string, kind: Kind = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto rounded-md border px-4 py-2 text-sm shadow-plate ${
              t.kind === "ok"
                ? "border-copper/40 bg-[#173a2c] text-cream"
                : "border-red-400/50 bg-[#4a1d1d] text-red-100"
            }`}
          >
            {t.kind === "ok" ? "✓ " : "⚠ "}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
