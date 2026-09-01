import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormTextarea, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import { updatePolicy } from "@/lib/actions/admin/policies";

export default async function AdminPoliciesPage() {
  const policies = await prisma.policy.findMany({ orderBy: { title: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Policies" />
      <p className="text-sm text-ink-soft mb-6">
        Every policy starts as a draft placeholder. Replace the body text with reviewed, accurate wording, then untick &ldquo;Draft&rdquo; to remove the warning banner shown on the public page.
      </p>
      <div className="space-y-4">
        {policies.map((policy) => {
          const bound = updatePolicy.bind(null, policy.id);
          return (
            <details key={policy.id} className="bg-white rounded-xl p-4">
              <summary className="cursor-pointer font-medium flex justify-between items-center">
                {policy.title}
                <span className="text-xs text-ink-soft">{policy.isDraft ? "Draft" : "Published"}</span>
              </summary>
              <form action={bound} className="space-y-4 mt-4">
                <FormField label="Title" name="title" defaultValue={policy.title} required />
                <FormTextarea label="Body" name="body" defaultValue={policy.body} rows={10} />
                <FormCheckbox label="Draft (shows a warning banner to visitors)" name="isDraft" defaultChecked={policy.isDraft} />
                <SubmitButton>Save</SubmitButton>
              </form>
            </details>
          );
        })}
      </div>
    </div>
  );
}
