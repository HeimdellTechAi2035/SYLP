// One-off owner-authorised production check. Credentials never leave memory.
// No email is sent. Only a synthetic STAFF record and boolean results are used.
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
if (process.env.SYLP_LIVE_STAFF_CHECK !== '1') throw new Error('Explicit live-check flag required');
const databaseUrl=new URL(process.env.DATABASE_URL);
const isolated=databaseUrl.pathname==='/sylp_staff_test'&&['localhost','127.0.0.1'].includes(databaseUrl.hostname)&&process.env.SESSION_SECRET==='isolated-ci-build-session-secret-never-production';
if(process.env.SYLP_CHECK_TEST_ORIGIN&&!isolated) throw new Error('Test origin requires isolated CI database');
const localOrigin=isolated ? process.env.SYLP_CHECK_TEST_ORIGIN : 'http://127.0.0.1:3010';
const publicOrigin=isolated ? localOrigin : 'https://support-your-local-patriot.online';
if(!localOrigin) throw new Error('Missing CI test origin');
const reportDir=path.resolve(process.env.MEDIA_DIR||'media-data','diagnostics');
const reportFile=path.join(reportDir,'staff-signin.json');
try { const previous=JSON.parse(await readFile(reportFile,'utf8')); if(previous.version===1) process.exit(0); } catch {}
const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
const id=`diagnostic-${randomUUID()}`;
const email=`${id}@staff-check.invalid`;
const token=randomBytes(32).toString('hex');
const password=randomBytes(32).toString('base64url');
const report={version:1,checkedAt:new Date().toISOString(),status:'failed',stage:'create',activated:false,local:null,public:null,cleanedUp:false};
let created=false;
const decode=value=>value.replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
async function get(origin,route,cookie) { return fetch(`${origin}${route}`,{redirect:'manual',headers:cookie?{cookie}:{},signal:AbortSignal.timeout(15000)}); }
async function submit(origin,route,fields) {
 const page=await get(origin,route); if(page.status!==200) throw new Error('form unavailable');
 const html=await page.text();const form=new FormData();
 for(const tag of html.match(/<input\b[^>]*>/g)||[]) {
  const attrs=Object.fromEntries([...tag.matchAll(/([\w:$-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
  if(attrs.type==='hidden'&&attrs.name) form.append(attrs.name,attrs.value||'');
 }
 if(![...form.keys()].some(key=>key.startsWith('$ACTION_'))) throw new Error('action missing');
 for(const [key,value] of Object.entries(fields)) form.set(key,value);
 return fetch(`${origin}${route}`,{method:'POST',body:form,redirect:'manual',headers:{origin},signal:AbortSignal.timeout(15000)});
}
async function checkLogin(origin) {
 const result={stage:'login',loginStatus:0,cookieIssued:false,cookieSignatureValid:false,versionMatches:false,dashboardStatus:0,dashboardVisible:false,ownerPageBlocked:false};
 try {
  const response=await submit(origin,'/admin/login',{email,password});result.loginStatus=response.status;
  const setCookie=response.headers.getSetCookie().find(value=>value.startsWith('hbm_admin_session='));
  result.cookieIssued=Boolean(setCookie); if(!setCookie) return result;
  const cookie=setCookie.split(';')[0];const encoded=cookie.slice(cookie.indexOf('=')+1);
  try {
   const {payload}=await jwtVerify(encoded,new TextEncoder().encode(process.env.SESSION_SECRET),{audience:'sylp-admin',algorithms:['HS256']});
   result.cookieSignatureValid=true;
   const current=await db.adminUser.findUnique({where:{id},select:{active:true,sessionVersion:true}});
   result.versionMatches=Boolean(current?.active&&current.sessionVersion===payload.sessionVersion&&payload.sub===id);
  } catch {}
  result.stage='dashboard';
  const dashboard=await get(origin,'/admin',cookie); result.dashboardStatus=dashboard.status;
  result.dashboardVisible=dashboard.status===200&&(await dashboard.text()).includes('Customer service dashboard');
  result.stage='permissions';result.ownerPageBlocked=(await get(origin,'/admin/staff',cookie)).status===404;
  result.stage='complete';
 } catch { /* Record stage only: never print response bodies or credentials. */ }
 return result;
}
try {
 await db.adminUser.create({data:{id,email,name:'Temporary staff sign-in check',role:'STAFF',active:false,passwordHash:'activation-required',inviteHash:createHash('sha256').update(token).digest('hex'),inviteExpiresAt:new Date(Date.now()+300000)}});created=true;
 report.stage='activation';
 await submit(localOrigin,`/admin/accept-invite?token=${token}`,{token,password});
 const active=await db.adminUser.findUnique({where:{id},select:{active:true}});report.activated=Boolean(active?.active);
 if(report.activated) {
  report.stage='local';report.local=await checkLogin(localOrigin);
  report.stage='public';report.public=await checkLogin(publicOrigin);
  report.status=[report.local,report.public].every(r=>r.dashboardVisible&&r.ownerPageBlocked)?'passed':'failed';
 }
 report.stage='complete';
} catch { /* Do not log raw errors: they may contain private request data. */ }
finally {
 try {
  if(created) { await db.auditLog.deleteMany({where:{adminUserId:id}});await db.adminUser.deleteMany({where:{id,email,role:'STAFF'}}); }
  report.cleanedUp=!(await db.adminUser.findUnique({where:{id},select:{id:true}}));
 } catch { report.stage='cleanup';report.status='failed'; }
 await db.$disconnect();
 await mkdir(reportDir,{recursive:true,mode:0o700});
 const temporary=path.join(reportDir,`staff-signin-${randomUUID()}.tmp`);
 await writeFile(temporary,JSON.stringify(report),{mode:0o600});await rename(temporary,reportFile);
 console.log(`Staff sign-in check ${report.status}; temporary account removed: ${report.cleanedUp}`);
}
