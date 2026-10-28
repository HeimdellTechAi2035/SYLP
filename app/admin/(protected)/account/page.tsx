import { requireAdminSession } from "@/lib/auth";
import PasswordChangeForm from "@/components/admin/PasswordChangeForm";
export default async function AccountPage() { const session = await requireAdminSession(true); return <div><h1 className="text-2xl mb-5">My account</h1><p className="mb-5">{session.name} · {session.role}{session.mustChangePassword && " — change your password before continuing."}</p><PasswordChangeForm /></div>; }
