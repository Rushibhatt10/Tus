import React from "react";

export function Badge({ className = "", variant = "default", ...props }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variants = {
    default: "bg-neutral-900 text-white dark:bg-white dark:text-black",
    outline: "border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200",
    success: "bg-green-600 text-white",
    warning: "bg-amber-500 text-black",
    danger: "bg-red-600 text-white",
  };
  return <span className={`${base} ${variants[variant]} ${className}`} {...props} />;
}


