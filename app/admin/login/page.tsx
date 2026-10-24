import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm bg-blush rounded-2xl shadow-sm p-8">
        <h1 className="font-display text-2xl mb-1 text-center">Support Your Local Patriot</h1>
        <p className="text-center text-ink-soft text-sm mb-6">Admin Dashboard</p>
        <LoginForm />
      </div>
    </div>
  );
}
