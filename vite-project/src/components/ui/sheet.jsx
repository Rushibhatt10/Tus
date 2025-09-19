import React, { useEffect } from "react";

export function Sheet({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => onOpenChange(false)}
      />
      <div
        className={`absolute left-0 top-0 h-full w-80 max-w-[85%] transform bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-xl transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className = "", ...props }) {
  return <div className={`p-4 border-b border-neutral-200 dark:border-neutral-800 ${className}`} {...props} />;
}

export function SheetContent({ className = "", ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}


