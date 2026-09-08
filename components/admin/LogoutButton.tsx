import { destroyAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function logout() {
  "use server";
  await destroyAdminSession();
  redirect("/admin/login");
}

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="text-ink/80 hover:text-ink underline text-xs">
        Sign out
      </button>
    </form>
  );
}
