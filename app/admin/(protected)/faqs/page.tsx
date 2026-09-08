import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormTextarea, FormSelect, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import {
  createFaq,
  updateFaq,
  deleteFaq,
  createFaqFromUnansweredQuestion,
  dismissUnansweredQuestion,
} from "@/lib/actions/admin/faqs";

const CATEGORIES = [
  "Products",
  "Sizing",
  "Materials & Care",
  "Safety",
  "Orders",
  "Delivery",
  "Returns",
  "Payments",
  "Gift Sets",
  "Contact",
];

export default async function AdminFaqsPage() {
  const [faqs, unansweredQuestions] = await Promise.all([
    prisma.faqItem.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
    prisma.unansweredQuestion.findMany({
      where: { resolvedFaqId: null },
      orderBy: { askCount: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div>
      <AdminPageHeader title="FAQs & Chatbot" />
      <p className="text-sm text-ink-soft mb-6">
        Published FAQs (below) are used both on the public FAQ page and automatically as chatbot knowledge — no separate
        step needed once you save.
      </p>

      {unansweredQuestions.length > 0 && (
        <section className="mb-12">
          <h2 className="font-semibold text-lg mb-1">Unanswered Questions</h2>
          <p className="text-xs text-ink-soft mb-4">
            Questions the chatbot couldn&apos;t confidently answer. Create an FAQ to teach it — the answer becomes
            chatbot knowledge as soon as you publish it.
          </p>
          <div className="space-y-3">
            {unansweredQuestions.map((q) => (
              <details key={q.id} className="bg-blush rounded-xl p-4">
                <summary className="cursor-pointer flex justify-between items-center gap-4">
                  <span className="text-sm">{q.question}</span>
                  <span className="text-xs text-ink-soft shrink-0">Asked {q.askCount} time{q.askCount === 1 ? "" : "s"}</span>
                </summary>
                <form action={createFaqFromUnansweredQuestion.bind(null, q.id)} className="grid sm:grid-cols-2 gap-4 mt-4">
                  <input type="hidden" name="question" value={q.question} />
                  <div className="sm:col-span-2">
                    <FormTextarea label="Answer" name="answer" id={`unanswered-${q.id}-answer`} rows={3} />
                  </div>
                  <FormSelect label="Category" name="category" id={`unanswered-${q.id}-category`} defaultValue="General" options={[{ value: "General", label: "General" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} />
                  <FormCheckbox label="Publish immediately" name="isActive" defaultChecked />
                  <div className="sm:col-span-2 flex justify-between items-center">
                    <SubmitButton>Create FAQ</SubmitButton>
                    <button type="submit" formAction={dismissUnansweredQuestion} name="id" value={q.id} className="text-xs text-ink-soft underline">
                      Dismiss
                    </button>
                  </div>
                </form>
              </details>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-semibold text-lg mb-4">FAQs</h2>
        <div className="space-y-4 mb-6">
          {faqs.map((faq) => {
            const bound = updateFaq.bind(null, faq.id);
            return (
              <details key={faq.id} className="bg-blush rounded-xl p-4">
                <summary className="cursor-pointer font-medium flex justify-between items-center gap-4">
                  <span className="truncate">{faq.question}</span>
                  <span className={`text-xs shrink-0 ${faq.isActive ? "text-sage" : "text-ink-soft"}`}>{faq.isActive ? "Published" : "Unpublished"}</span>
                </summary>
                <form action={bound} className="grid sm:grid-cols-2 gap-4 mt-4">
                  <input type="hidden" name="faqId" value={faq.id} />
                  <div className="sm:col-span-2">
                    <FormField label="Question" name="question" id={`faq-${faq.id}-question`} defaultValue={faq.question} required />
                  </div>
                  <div className="sm:col-span-2">
                    <FormTextarea label="Answer" name="answer" id={`faq-${faq.id}-answer`} defaultValue={faq.answer} rows={3} />
                  </div>
                  <FormSelect label="Category" name="category" id={`faq-${faq.id}-category`} defaultValue={faq.category} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
                  <FormField label="Display order" name="sortOrder" id={`faq-${faq.id}-sortOrder`} type="number" defaultValue={faq.sortOrder} />
                  <FormCheckbox label="Published" name="isActive" defaultChecked={faq.isActive} />
                  <div className="sm:col-span-2 flex justify-between items-center">
                    <SubmitButton>Save</SubmitButton>
                    <button type="submit" formAction={deleteFaq} className="text-rose-dark text-xs underline">
                      Delete
                    </button>
                  </div>
                </form>
              </details>
            );
          })}
          {faqs.length === 0 && <p className="text-sm text-ink-soft">No FAQs yet.</p>}
        </div>

        <div className="bg-blush rounded-xl p-6 max-w-xl">
          <h3 className="font-semibold mb-4">Add FAQ</h3>
          <form action={createFaq} className="space-y-4">
            <FormField label="Question" name="question" required />
            <FormTextarea label="Answer" name="answer" rows={3} />
            <FormSelect label="Category" name="category" defaultValue={CATEGORIES[0]} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
            <FormField label="Display order" name="sortOrder" type="number" defaultValue={0} />
            <FormCheckbox label="Published" name="isActive" defaultChecked />
            <SubmitButton>Add FAQ</SubmitButton>
          </form>
        </div>
      </section>
    </div>
  );
}
