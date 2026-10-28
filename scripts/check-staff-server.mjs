// Exercises the built server with synthetic records in the disposable CI DB.
import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import { SignJWT } from 'jose';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const url = new URL(process.env.DATABASE_URL || 'http://invalid');
assert.equal(url.pathname, '/sylp_staff_test');
assert.ok(['localhost','127.0.0.1'].includes(url.hostname));
assert.equal(process.env.SESSION_SECRET,'isolated-ci-build-session-secret-never-production');
const db = new PrismaClient({adapter:new PrismaPg({connectionString:url.toString()})});
const origin = 'http://127.0.0.1:3099';
let server;
let errors="";
let stage="starting";
async function cookie(user) {
 const token = await new SignJWT({sub:user.id,role:user.role,sessionVersion:user.sessionVersion,mustChangePassword:false}).setProtectedHeader({alg:'HS256'}).setAudience('sylp-admin').setExpirationTime('5m').sign(new TextEncoder().encode(process.env.SESSION_SECRET));
 return `hbm_admin_session=${token}`;
}
const decode = value => value.replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
async function submitForm(path, fields, auth, containingField) {
 stage=`load form ${path.split("?")[0]}`;
 const page=await request(path,auth);const fullHtml=await page.text();let html=fullHtml;
 if(containingField){html=(html.match(/<form\b[\s\S]*?<\/form>/g)||[]).find(form=>form.includes(`name="${containingField}"`))||"";}
 const form=new FormData();
 for(const tag of html.match(/<input\b[^>]*>/g)||[]) {
  const attrs=Object.fromEntries([...tag.matchAll(/([\w:$-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
  if(attrs.type==='hidden' && attrs.name) form.append(attrs.name,attrs.value||'');
 }

 if(containingField){
  const reference=[...form.keys()].find(key=>key.startsWith('$ACTION_REF_'));
  if(reference){
   const prefix=`$ACTION_${reference.slice('$ACTION_REF_'.length)}:`;
   for(const tag of fullHtml.match(/<input\b[^>]*>/g)||[]){
    const attrs=Object.fromEntries([...tag.matchAll(/([\w:$-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
    if(attrs.name?.startsWith(prefix)&&!form.has(attrs.name))form.append(attrs.name,attrs.value||'');
   }
  }
  console.log('Selected native form metadata:',[...form.keys()].filter(key=>key.startsWith('$ACTION_')).join(', '));
 }
 assert.ok([...form.keys()].some(name=>name.startsWith('$ACTION_')),'Native Server Action metadata must be present');
 for(const [name,value] of Object.entries(fields)) form.set(name,value);
 stage=`submit ${path.split("?")[0]}`;
 return fetch(`${origin}${path}`,{method:'POST',body:form,redirect:'manual',headers:{origin,...(auth?{cookie:auth}:{})},signal:AbortSignal.timeout(30000)});
}
async function request(path, auth) { stage=`get ${path.split("?")[0]}`; return fetch(`${origin}${path}`,{redirect:'manual',headers:auth?{cookie:auth}:{},signal:AbortSignal.timeout(30000)}); }
try {
 const owner = await db.adminUser.create({data:{id:'ci-server-owner',email:'server-owner@staff-test.invalid',name:'CI owner',passwordHash:'not-a-login-hash',role:'OWNER'}});
 const staff = await db.adminUser.create({data:{id:'ci-server-staff',email:'server-staff@staff-test.invalid',name:'CI staff',passwordHash:'not-a-login-hash',role:'STAFF',active:false,inviteHash:createHash('sha256').update('a'.repeat(64)).digest('hex'),inviteExpiresAt:new Date(Date.now()+60000)}});
 await db.contactMessage.create({data:{id:'ci-private-case',name:'Anonymous',email:'',category:'Community: whistleblower',message:JSON.stringify({version:1,reference:'CI-PRIVATE-CASE',data:{kind:'whistleblower',anonymous:true,message:'Synthetic confidential CI case',email:'',name:'',phone:''},files:[],delivery:'NOT_REQUIRED'})}});
 const registrationRecord={version:1,reference:'CI-REGISTER-CASE',data:{kind:'register',anonymous:false,name:'Example helper',email:'helper@staff-test.invalid',area:'Preston',interest:'Community projects',message:'I can help with practical community work.'},files:[],delivery:'NOT_REQUIRED'};
 await db.contactMessage.create({data:{id:'ci-register-case',name:'Example helper',email:'helper@staff-test.invalid',category:'Community: register',message:JSON.stringify(registrationRecord)}});
 server = spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3099'],{stdio:['ignore','ignore','pipe'],env:process.env});
 server.stderr.on('data',chunk=>{errors+=chunk.toString().slice(-1000);});
 let ready=false;
 for(let attempt=0;attempt<40;attempt++) { try { if((await request('/admin/login')).status===200){ready=true;break;} }catch{} await new Promise(resolve=>setTimeout(resolve,500)); }
 assert.ok(ready,`Server did not start: ${errors.slice(-1500)}`);
 const testPassword='Isolated-test-password-123!';
 const activated=await submitForm(`/admin/accept-invite?token=${'a'.repeat(64)}`,{token:'a'.repeat(64),password:testPassword});
 assert.ok([200,303].includes(activated.status),`Activation returned ${activated.status}`);
 const activeStaff=await db.adminUser.findUnique({where:{id:staff.id}});
 assert.equal(activeStaff.active,true,'Activation must enable staff');
 assert.ok(await bcrypt.compare(testPassword,activeStaff.passwordHash),'Chosen password must be saved');
 const login=await submitForm('/admin/login',{email:staff.email,password:testPassword});
 assert.equal(login.status,303,`Real staff login must redirect to dashboard, got ${login.status}: ${(await login.text()).slice(-1000)}`);
 assert.equal(login.headers.get('location'),'/admin');
 const sessionCookie=login.headers.getSetCookie().find(value=>value.startsWith('hbm_admin_session='));
 assert.ok(sessionCookie,'Login must set admin session cookie');
 const staffCookie=sessionCookie.split(';')[0]; const ownerCookie=await cookie(owner);
 assert.equal((await request('/admin',staffCookie)).status,200,'Real sign-in cookie must open dashboard');
 assert.equal((await request('/admin/orders')).status,307);
 for(const path of ['/admin','/admin/orders','/admin/messages','/admin/work','/admin/account','/admin/community/whistleblower']) {
  const response=await request(path,staffCookie); assert.equal(response.status,200,`Staff should access ${path}`);
  const html=await response.text();
  if(path==='/admin'){assert.ok(html.includes('Customer service dashboard'));assert.ok(html.includes('Help for this page')); assert.ok(!html.includes('Total revenue'));assert.ok(!html.includes('Staff Access'));}
  if(path==='/admin/community/whistleblower'){assert.ok(html.includes('Synthetic confidential CI case'));assert.ok(html.includes('No contact email supplied'));assert.ok(html.includes('Handle confidential information'));assert.ok(!html.includes('Ask area + how they can help')); assert.ok(!html.includes('Permanently delete this submission'));}
 }
 for(const path of ['/admin/settings','/admin/staff','/admin/products','/admin/analytics','/admin/customers']) assert.equal((await request(path,staffCookie)).status,404,`Staff must not access ${path}`);
 assert.equal((await request('/api/admin/buyers/export',staffCookie)).status,401);
 const registrationPage=await request('/admin/community/register?record=ci-register-case',staffCookie);
 const registrationHtml=await registrationPage.text();assert.equal(registrationPage.status,200);
 for(const text of ['Quick reply to this message','Confirm details','Ask skills','How they would like to help','Area originally supplied'])assert.ok(registrationHtml.includes(text),`Missing registration guidance: ${text}`);
 await submitForm('/admin/community/register?record=ci-register-case',{area:'Manchester / M1',helpInterest:'Design skills in the evenings',assignedTo:'',followUpAt:'2026-11-02',note:'Synthetic CI follow-up note'},staffCookie,'area');
 const savedDetails=await db.supportTask.findUnique({where:{entityType_entityId:{entityType:'ContactMessage',entityId:'ci-register-case'}}});
 assert.equal(savedDetails?.area,'Manchester / M1');assert.equal(savedDetails?.helpInterest,'Design skills in the evenings');
 assert.equal((await db.contactMessage.findUnique({where:{id:'ci-register-case'}})).message,JSON.stringify(registrationRecord),'Original submission must not be rewritten');

 const staffPage=await request('/admin/staff',ownerCookie); assert.equal(staffPage.status,200); const staffHtml=await staffPage.text(); assert.ok(staffHtml.includes('Create and email invitation')); assert.ok(staffHtml.includes('Business email is not configured'));
 assert.equal((await request('/admin/settings',ownerCookie)).status,200);
 await db.adminUser.update({where:{id:staff.id},data:{active:false,sessionVersion:{increment:1}}});
 assert.equal((await request('/admin/orders',staffCookie)).status,307,'Disabled staff token must stop working');
 await db.adminUser.update({where:{id:staff.id},data:{active:true}});
 assert.equal((await request('/admin/orders',staffCookie)).status,307,'Re-enabling must not resurrect an old token');
 const diagnosticDirectory=await mkdtemp(path.join(tmpdir(),'sylp-staff-check-'));
 try {
  await promisify(execFile)(process.execPath,['deploy/check-live-staff-signin.mjs'],{env:{...process.env,SYLP_LIVE_STAFF_CHECK:'1',SYLP_CHECK_TEST_ORIGIN:origin,MEDIA_DIR:diagnosticDirectory},timeout:60000});
  const diagnostic=JSON.parse(await readFile(path.join(diagnosticDirectory,'diagnostics/staff-signin.json'),'utf8'));
  assert.equal(diagnostic.status,'passed',`Diagnostic failed at ${diagnostic.stage}`);assert.equal(diagnostic.cleanedUp,true);
  assert.equal(await db.adminUser.count({where:{email:{endsWith:'@staff-check.invalid'}}}),0,'Diagnostic account must be removed');
 } finally { await rm(diagnosticDirectory,{recursive:true,force:true}); }
 console.log('Built server verified: staff dashboard and confidential inbox, owner-only pages/APIs, private rendering and immediate session revocation.');
} catch(error) { console.error(`Staff server check failed during: ${stage}`);console.error(errors.slice(-1800)); throw error; } finally {
 server?.kill('SIGTERM');
 await db.supportTask.deleteMany({where:{entityId:'ci-register-case'}});
 await db.supportEntry.deleteMany({where:{entityId:'ci-register-case'}});
 await db.contactMessage.deleteMany({where:{id:{in:['ci-private-case','ci-register-case']}}});
 await db.auditLog.deleteMany({where:{adminUserId:{in:['ci-server-owner','ci-server-staff']}}});
 await db.adminUser.deleteMany({where:{id:{in:['ci-server-owner','ci-server-staff']}}});
 await db.$disconnect();
}
