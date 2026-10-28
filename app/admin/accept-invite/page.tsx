import StaffForm from "@/components/admin/StaffForms";
export const dynamic = "force-dynamic";
export const metadata = { title: "Activate staff account", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function AcceptInvite({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
 const { token } = await searchParams;
 const valid = typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
 return <main className="max-w-lg mx-auto p-5"><h1 className="text-2xl mb-5">Activate your SYLP staff account</h1><p className="mb-5">Open the private activation link in your invitation email. Invitations expire after 48 hours. If you need a replacement, ask the SYLP owner to resend your invitation.</p>{valid && <StaffForm token={token} />}</main>;
}
