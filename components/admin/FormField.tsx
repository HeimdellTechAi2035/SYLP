export function FormField({
  label,
  name,
  id,
  type = "text",
  defaultValue,
  required,
  step,
  min,
  placeholder,
}: {
  label: string;
  name: string;
  /** Defaults to `name`. Pass an explicit, unique id whenever this field is rendered
   *  more than once on the same page (e.g. one instance per row in a list plus an
   *  "add new" form) — reusing `name` as `id` in that situation produces duplicate
   *  DOM ids, which is invalid HTML and makes label-to-input association unreliable. */
  id?: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  step?: string;
  min?: string | number;
  placeholder?: string;
}) {
  const fieldId = id ?? name;
  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium mb-1">{label}</label>
      <input
        id={fieldId}
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
  id,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  id?: string;
  defaultValue?: string;
  rows?: number;
}) {
  const fieldId = id ?? name;
  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium mb-1">{label}</label>
      <textarea id={fieldId} name={name} defaultValue={defaultValue} rows={rows} className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" />
    </div>
  );
}

export function FormSelect({
  label,
  name,
  id,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  id?: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  const fieldId = id ?? name;
  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium mb-1">{label}</label>
      <select id={fieldId} name={name} defaultValue={defaultValue} className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm bg-blush">
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
    <button type="submit" className="px-6 py-2.5 rounded-full bg-rose text-ink font-semibold text-sm hover:bg-rose-dark transition-colors">
      {children}
    </button>
  );
}
