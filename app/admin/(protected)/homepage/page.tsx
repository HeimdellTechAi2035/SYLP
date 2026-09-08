import { getHomepageContent, getHomepageFeatures } from "@/lib/settings";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormTextarea, SubmitButton } from "@/components/admin/FormField";
import { updateHomepageContent, addHomepageFeature, removeHomepageFeature } from "@/lib/actions/admin/homepage";

export default async function AdminHomepagePage() {
  const [content, features] = await Promise.all([getHomepageContent(), getHomepageFeatures("WHY_SHOP")]);

  return (
    <div>
      <AdminPageHeader title="Homepage" />

      <form action={updateHomepageContent} className="space-y-8 max-w-2xl mb-12">
        <fieldset className="space-y-4">
          <legend className="font-semibold text-lg mb-2">Announcement Bar</legend>
          <FormField label="Announcement bar text" name="announcementBarText" defaultValue={content.announcementBarText ?? ""} />
        </fieldset>

        <fieldset className="space-y-4 border-t border-ink/10 pt-6">
          <legend className="font-semibold text-lg mb-2">Hero</legend>
          <FormField label="Hero title" name="heroTitle" defaultValue={content.heroTitle ?? ""} />
          <FormTextarea label="Hero subtitle" name="heroSubtitle" defaultValue={content.heroSubtitle ?? ""} />
          <FormField label="Hero image URL" name="heroImage" defaultValue={content.heroImage ?? ""} />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Primary CTA label" name="heroCtaPrimaryLabel" defaultValue={content.heroCtaPrimaryLabel ?? ""} />
            <FormField label="Primary CTA link" name="heroCtaPrimaryHref" defaultValue={content.heroCtaPrimaryHref ?? ""} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Secondary CTA label" name="heroCtaSecondaryLabel" defaultValue={content.heroCtaSecondaryLabel ?? ""} />
            <FormField label="Secondary CTA link" name="heroCtaSecondaryHref" defaultValue={content.heroCtaSecondaryHref ?? ""} />
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-ink/10 pt-6">
          <legend className="font-semibold text-lg mb-2">Our Story</legend>
          <FormField label="Story title" name="storyTitle" defaultValue={content.storyTitle ?? ""} />
          <FormTextarea label="Story body" name="storyBody" defaultValue={content.storyBody ?? ""} rows={5} />
          <FormField label="Story image URL" name="storyImage" defaultValue={content.storyImage ?? ""} />
        </fieldset>

        <fieldset className="space-y-4 border-t border-ink/10 pt-6">
          <legend className="font-semibold text-lg mb-2">Gift Section</legend>
          <FormField label="Gift section title" name="giftSectionTitle" defaultValue={content.giftSectionTitle ?? ""} />
          <FormTextarea label="Gift section body" name="giftSectionBody" defaultValue={content.giftSectionBody ?? ""} />
          <FormField label="Gift section image URL" name="giftSectionImage" defaultValue={content.giftSectionImage ?? ""} />
        </fieldset>

        <SubmitButton>Save Homepage Content</SubmitButton>
      </form>

      <div className="max-w-2xl border-t border-ink/10 pt-6">
        <h2 className="font-semibold text-lg mb-4">&ldquo;Why Shop&rdquo; Features</h2>
        <ul className="space-y-2 mb-4">
          {features.map((f) => (
            <li key={f.id} className="flex items-center justify-between bg-blush rounded-lg px-4 py-2 text-sm">
              <span>{f.title} — {f.body}</span>
              <form action={removeHomepageFeature}>
                <input type="hidden" name="id" value={f.id} />
                <button type="submit" className="text-rose-dark text-xs underline">Remove</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addHomepageFeature} className="grid sm:grid-cols-3 gap-3">
          <FormField label="Icon (sparkles/package/gift/shield/truck)" name="icon" />
          <FormField label="Title" name="title" required />
          <FormField label="Body" name="body" />
          <div className="sm:col-span-3">
            <SubmitButton>Add Feature</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
