"use client";

import { useFormStatus } from "react-dom";

/** Submit button that shows it's working while a slow server action runs. */
export default function PendingSubmit({
  children,
  pendingText,
  formAction,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      aria-busy={pending}
      className={
        className ??
        "w-full sm:w-auto px-6 py-3 rounded-full bg-rose text-ink font-semibold text-sm hover:bg-rose-dark transition-colors disabled:opacity-60"
      }
    >
      {pending ? pendingText : children}
    </button>
  );
}
