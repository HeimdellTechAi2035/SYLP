import StaffForm from "@/components/admin/StaffForms";
export const dynamic = "force-dynamic";
export const metadata = { title: "Activate staff account", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function AcceptInvite({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token } = await searchParams; return <main className="max-w-lg mx-auto p-5"><h1 className="text-2xl mb-5">Activate your SYLP staff account</h1><StaffForm token={token ?? ""} /></main>; }
