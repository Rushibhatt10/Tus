import React, { useEffect } from "react";

export function Modal({ open, onClose, title, children, footer, full = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={
          full
            ? "relative w-[95vw] h-[90vh] max-w-[1400px] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl flex flex-col"
            : "relative w-full max-w-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl"
        }
      >
        {title && (
          <div className={`p-4 border-b border-neutral-200 dark:border-neutral-800 font-semibold ${full ? "sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur" : ""}`}>
            {title}
          </div>
        )}
        <div className={full ? "p-4 overflow-auto flex-1" : "p-4"}>{children}</div>
        {footer && <div className={`p-4 border-t border-neutral-200 dark:border-neutral-800 ${full ? "sticky bottom-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur" : ""}`}>{footer}</div>}
      </div>
    </div>
  );
}


