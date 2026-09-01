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
      <button type="submit" className="text-cream/70 hover:text-cream underline text-xs">
        Sign out
      </button>
    </form>
  );
}
