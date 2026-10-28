import { describe, it, expect, vi, beforeEach } from "vitest";
const m=vi.hoisted(()=>({read:vi.fn()}));
vi.mock("node:fs/promises",()=>({readFile:m.read}));
import { GET } from "@/app/api/health/staff-signin/route";
beforeEach(()=>{vi.clearAllMocks();});
describe("temporary live sign-in result",()=>{
 it("returns only status flags, never credentials or account data",async()=>{m.read.mockResolvedValue(JSON.stringify({status:"passed",checkedAt:new Date().toISOString(),stage:"complete",activated:true,cleanedUp:true,password:"secret-password",cookie:"secret-cookie",email:"private@example.test",local:{stage:"complete",loginStatus:303,cookieIssued:true,cookieSignatureValid:true,versionMatches:true,dashboardStatus:200,dashboardVisible:true,ownerPageBlocked:true,password:"nested-secret"},public:null}));const response=await GET();const body=await response.text();expect(response.status).toBe(200);expect(response.headers.get("cache-control")).toContain("no-store");for(const secret of ["secret-password","secret-cookie","private@example.test","nested-secret"])expect(body).not.toContain(secret);expect(JSON.parse(body).local.dashboardVisible).toBe(true);});
 it("does not expose missing or expired results",async()=>{m.read.mockRejectedValueOnce(new Error("missing"));expect((await GET()).status).toBe(404);m.read.mockResolvedValue(JSON.stringify({checkedAt:new Date(Date.now()-7200000).toISOString()}));expect((await GET()).status).toBe(404);});
});
