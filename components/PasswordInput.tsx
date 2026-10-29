"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function PasswordInput({ id, className = "", ...props }: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative block">
      <input
        {...props}
        id={inputId}
        type={visible ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={`${className} min-h-11 pr-20 text-base`}
      />
      <button
        type="button"
        aria-controls={inputId}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        disabled={props.disabled}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-1 top-1/2 -translate-y-1/2 min-h-11 min-w-16 rounded-md px-3 text-sm font-semibold text-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </span>
  );
}
