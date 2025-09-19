import React from "react";

export function Input({ className = "", ...props }) {
  const base = "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-black dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600";
  return <input className={`${base} ${className}`} {...props} />;
}


