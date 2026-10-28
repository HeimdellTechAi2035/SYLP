import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";
const state = vi.hoisted(() => ({ cookies: new Map<string,string>(), admin: null as null | Record<string,unknown> }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (key:string) => state.cookies.has(key) ? {value:state.cookies.get(key)} : undefined, set:vi.fn(), delete:vi.fn() }) }));
vi.mock("next/navigation", () => ({redirect:vi.fn()}));
vi.mock("@/lib/prisma", () => ({ prisma: {adminUser: {findUnique: async () => state.admin}} }));
import { getAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { getCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-auth";
const secret = new TextEncoder().encode("isolated-launch-test-key-never-production");
async function token(audience:string) { return new SignJWT({sub:"test-user",email:"test@example.com"}).setProtectedHeader({alg:"HS256"}).setAudience(audience).setExpirationTime("1h").sign(secret); }
beforeEach(() => { process.env.SESSION_SECRET="isolated-launch-test-key-never-production"; state.cookies.clear();state.admin=null; });
describe("session purpose separation", () => {
 it("rejects a valid customer token placed under the admin cookie",async()=>{state.cookies.set(ADMIN_SESSION_COOKIE,await token("sylp-customer"));expect(await getAdminSession()).toBeNull();});
 it("rejects an admin token placed under the customer cookie",async()=>{state.cookies.set(CUSTOMER_SESSION_COOKIE,await token("sylp-admin"));expect(await getCustomerSession()).toBeNull();});
 it("rejects an admin token whose admin record no longer exists",async()=>{state.cookies.set(ADMIN_SESSION_COOKIE,await token("sylp-admin"));expect(await getAdminSession()).toBeNull();});
 it("returns a current admin record rather than stale token claims",async()=>{state.admin={id:"test-user",email:"test@example.com",name:"Owner",role:"OWNER",mustChangePassword:true,active:true,sessionVersion:0};state.cookies.set(ADMIN_SESSION_COOKIE,await token("sylp-admin"));expect((await getAdminSession())?.mustChangePassword).toBe(true);});
 it("rejects disabled users even with a valid token",async()=>{state.admin={id:"test-user",role:"STAFF",active:false,sessionVersion:0};state.cookies.set(ADMIN_SESSION_COOKIE,await token("sylp-admin"));expect(await getAdminSession()).toBeNull();});
 it("revokes old sessions after a reset or disable/re-enable",async()=>{state.admin={id:"test-user",role:"STAFF",active:true,sessionVersion:2};state.cookies.set(ADMIN_SESSION_COOKIE,await token("sylp-admin"));expect(await getAdminSession()).toBeNull();});
 it("rejects unrecognised admin roles",async()=>{state.admin={id:"test-user",role:"CUSTOMER",active:true,sessionVersion:0};state.cookies.set(ADMIN_SESSION_COOKIE,await token("sylp-admin"));expect(await getAdminSession()).toBeNull();});
});
