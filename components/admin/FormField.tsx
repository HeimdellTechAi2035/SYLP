import { adminFieldHelp } from "@/lib/admin-guidance";
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
  help,
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
  help?: string;
}) {
  const fieldId = id ?? name;
  const tip = help ?? adminFieldHelp[name];
  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium mb-1">{label}</label>
      <input
        id={fieldId}
        aria-describedby={tip ? `${fieldId}-help` : undefined}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        step={step}
        min={min}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink/15 px-3 py-2 text-base sm:text-sm"
      />
      {tip && <p id={`${fieldId}-help`} className="text-xs text-ink-soft mt-1 leading-relaxed">{tip}</p>}
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  id,
  defaultValue,
  rows = 3,
  help,
}: {
  label: string;
  name: string;
  id?: string;
  defaultValue?: string;
  rows?: number;
  help?: string;
}) {
  const fieldId = id ?? name;
  const tip = help ?? adminFieldHelp[name];
  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium mb-1">{label}</label>
      <textarea aria-describedby={tip ? `${fieldId}-help` : undefined} id={fieldId} name={name} defaultValue={defaultValue} rows={rows} className="w-full rounded-lg border border-ink/15 px-3 py-2 text-base sm:text-sm" />
      {tip && <p id={`${fieldId}-help`} className="text-xs text-ink-soft mt-1 leading-relaxed">{tip}</p>}
    </div>
  );
}

export function FormSelect({
  label,
  name,
  id,
  defaultValue,
  options,
  help,
}: {
  label: string;
  name: string;
  id?: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  help?: string;
}) {
  const fieldId = id ?? name;
  const tip = help ?? adminFieldHelp[name];
  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium mb-1">{label}</label>
      <select aria-describedby={tip ? `${fieldId}-help` : undefined} id={fieldId} name={name} defaultValue={defaultValue} className="w-full rounded-lg border border-ink/15 px-3 py-2 text-base sm:text-sm bg-blush">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {tip && <p id={`${fieldId}-help`} className="text-xs text-ink-soft mt-1 leading-relaxed">{tip}</p>}
    </div>
  );
}

export function FormCheckbox({ label, name, defaultChecked, help }: { label: string; name: string; defaultChecked?: boolean; help?: string }) {
  const tip = help ?? adminFieldHelp[name];
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="rounded border-ink/30" />
      <span>{label}{tip && <span className="block text-xs text-ink-soft mt-1">{tip}</span>}</span>
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
