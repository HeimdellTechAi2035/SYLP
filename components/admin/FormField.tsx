export function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
  min,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  step?: string;
  min?: string | number;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        step={step}
        min={min}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
      />
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={rows} className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
    </div>
  );
}

export function FormSelect({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm bg-white">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function FormCheckbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="rounded border-ink/30" />
      {label}
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="submit" className="px-6 py-2.5 rounded-full bg-rose-dark text-cream font-semibold text-sm hover:bg-ink transition-colors">
      {children}
    </button>
  );
}
