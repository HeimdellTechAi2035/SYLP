export const staffPages = ["/admin", "/admin/orders", "/admin/messages", "/admin/community", "/admin/account", "/admin/work"];
export function canAccessAdminPage(role: string, path: string) {
  return role === "OWNER" || (role === "STAFF" && staffPages.some(base => path === base || (base !== "/admin" && path.startsWith(`${base}/`))));
}
export function canFulfilOrder(role: string, payment: string, status: string) {
  const allowed = ["NEW", "PAID", "MAKING", "READY_TO_PACK", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"];
  return allowed.includes(status) && (role === "OWNER" || (role === "STAFF" && payment === "PAID" && !["NEW", "PAID", "CANCELLED"].includes(status)));
}
