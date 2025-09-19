import React from "react";

export function Dot({ show = false, className = "" }) {
  if (!show) return null;
  return <span className={`inline-block h-2 w-2 rounded-full bg-red-600 ${className}`} />;
}


