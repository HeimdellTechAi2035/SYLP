import { getSiteSettings } from "@/lib/settings";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import { updateSiteSettings } from "@/lib/actions/admin/settings";
import PasswordChangeForm from "@/components/admin/PasswordChangeForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <AdminPageHeader title="Site Settings" />

      <form action={updateSiteSettings} className="space-y-6 max-w-xl mb-12">
        <FormField label="Business name" name="businessName" defaultValue={settings.businessName} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Support email" name="supportEmail" type="email" defaultValue={settings.supportEmail ?? ""} />
          <FormField label="Support phone" name="supportPhone" defaultValue={settings.supportPhone ?? ""} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Free delivery threshold (£)" name="freeDeliveryThreshold" type="number" step="0.01" min="0" defaultValue={settings.freeDeliveryThreshold ? (settings.freeDeliveryThreshold / 100).toFixed(2) : undefined} />
          <FormField label="Standard delivery price (£)" name="standardDeliveryPrice" type="number" step="0.01" min="0" defaultValue={(settings.standardDeliveryPrice / 100).toFixed(2)} required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Estimated dispatch time" name="estimatedDispatchDays" defaultValue={settings.estimatedDispatchDays ?? ""} />
          <FormField label="Estimated delivery time" name="estimatedDeliveryDays" defaultValue={settings.estimatedDeliveryDays ?? ""} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Instagram URL" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
          <FormField label="Facebook URL" name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
        </div>
        <FormField label="TikTok URL" name="tiktokUrl" defaultValue={settings.tiktokUrl ?? ""} />
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Google Analytics Measurement ID" name="gaMeasurementId" defaultValue={settings.gaMeasurementId ?? ""} />
          <FormField label="Meta Pixel ID" name="metaPixelId" defaultValue={settings.metaPixelId ?? ""} />
        </div>
        <FormCheckbox label="Maintenance mode" name="maintenanceMode" defaultChecked={settings.maintenanceMode} />
        <SubmitButton>Save Settings</SubmitButton>
      </form>

      <div className="border-t border-ink/10 pt-6">
        <h2 className="font-semibold text-lg mb-4">Change Admin Password</h2>
        <PasswordChangeForm />
      </div>
    </div>
  );
}
