import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { FormField, FormCheckbox, SubmitButton } from "@/components/admin/FormField";
import { updateSiteSettings } from "@/lib/actions/admin/settings";
import { updateOrderNotificationSettings, setPushSubscriptionActive } from "@/lib/actions/admin/notifications";
import PasswordChangeForm from "@/components/admin/PasswordChangeForm";
import PushNotificationToggle from "@/components/admin/PushNotificationToggle";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const [session, settings, pushSubscriptions] = await Promise.all([
    requireAdminSession(),
    getSiteSettings(),
    prisma.adminPushSubscription.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

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

      <div className="border-t border-ink/10 pt-6 pb-12">
        <h2 className="font-semibold text-lg mb-4">Order Notifications</h2>

        <div className="max-w-xl space-y-6">
          <div>
            <h3 className="font-medium text-sm mb-3">Email notifications</h3>
            <form action={updateOrderNotificationSettings} className="space-y-3">
              <FormCheckbox
                label="Send new paid orders by email"
                name="orderNotificationEmailEnabled"
                defaultChecked={settings.orderNotificationEmailEnabled}
              />
              <FormField
                label="Send new paid orders to"
                name="orderNotificationEmail"
                type="email"
                placeholder="you@example.com"
                defaultValue={settings.orderNotificationEmail ?? ""}
              />
              <SubmitButton>Save</SubmitButton>
            </form>
          </div>

          <div className="border-t border-ink/10 pt-6">
            <h3 className="font-medium text-sm mb-3">Push notifications</h3>
            <p className="text-xs text-ink-soft mb-3">
              A phone alert whenever a payment completes. No SMS, no phone number needed — this uses your browser&apos;s
              own notification permission on this device.
            </p>
            <PushNotificationToggle />

            {pushSubscriptions.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-medium text-ink-soft mb-2">Registered devices</p>
                <ul className="space-y-2">
                  {pushSubscriptions.map((sub) => (
                    <li key={sub.id} className="flex items-center justify-between bg-blush rounded-lg px-4 py-2 text-sm">
                      <span>
                        {sub.label || "Unnamed device"} —{" "}
                        <span className={sub.active ? "text-sage" : "text-ink-soft"}>{sub.active ? "Active" : "Disabled"}</span>
                      </span>
                      <form action={setPushSubscriptionActive}>
                        <input type="hidden" name="subscriptionId" value={sub.id} />
                        <input type="hidden" name="active" value={(!sub.active).toString()} />
                        <button type="submit" className="text-xs underline text-ink-soft hover:text-rose-dark">
                          {sub.active ? "Disable" : "Enable"}
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-ink/10 pt-6">
        <h2 className="font-semibold text-lg mb-4">Change Admin Password</h2>
        {session.mustChangePassword && (
          <div className="bg-gold/30 border border-ink/20 text-ink text-sm rounded-lg p-3 mb-4">
            For security, please set a new password before continuing to use the admin dashboard.
          </div>
        )}
        <PasswordChangeForm />
      </div>
    </div>
  );
}
