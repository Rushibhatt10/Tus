import React from "react";

export function Card({ className = "", ...props }) {
  const base = "rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm";
  return <div className={`${base} ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`p-4 border-b border-neutral-200 dark:border-neutral-800 ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }) {
  return <div className={`p-4 border-t border-neutral-200 dark:border-neutral-800 ${className}`} {...props} />;
}


