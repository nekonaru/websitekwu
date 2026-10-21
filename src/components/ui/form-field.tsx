"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: LucideIcon;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  minLength?: number;
  hint?: string;
}

/**
 * Kolom formulir dengan gaya seragam: label, ikon, pesan galat, dan
 * penanda aksesibilitas untuk pembaca layar.
 */
export function FormField({
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  error,
  required,
  autoComplete,
  placeholder,
  minLength,
  hint,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-heading">
        {label} {required && <span className="text-danger-600">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [error ? errorId : null, hint ? hintId : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`w-full rounded-xl border bg-white py-3 text-heading shadow-soft transition-shadow duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-4 ${
            Icon ? "pl-11 pr-4" : "px-4"
          } ${
            error
              ? "border-danger-500 focus:border-danger-500 focus:ring-red-100"
              : "border-border focus:border-primary focus:ring-orange-100"
          }`}
        />
      </div>

      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs font-medium text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
