// Exercises the built server with synthetic records in the disposable CI DB.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
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
async function cookie(user) {
 const token = await new SignJWT({sub:user.id,role:user.role,sessionVersion:user.sessionVersion,mustChangePassword:false}).setProtectedHeader({alg:'HS256'}).setAudience('sylp-admin').setExpirationTime('5m').sign(new TextEncoder().encode(process.env.SESSION_SECRET));
 return `hbm_admin_session=${token}`;
}
const decode = value => value.replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
async function submitForm(path, fields) {
 const page=await request(path);const html=await page.text();
 const form=new FormData();
 for(const tag of html.match(/<input\b[^>]*>/g)||[]) {
  const attrs=Object.fromEntries([...tag.matchAll(/([\w:$-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
  if(attrs.type==='hidden' && attrs.name) form.append(attrs.name,attrs.value||'');
 }
 assert.ok([...form.keys()].some(name=>name.startsWith('$ACTION_')),'Native Server Action metadata must be present');
 for(const [name,value] of Object.entries(fields)) form.set(name,value);
 return fetch(`${origin}${path}`,{method:'POST',body:form,redirect:'manual',headers:{origin},signal:AbortSignal.timeout(15000)});
}
async function request(path, auth) { return fetch(`${origin}${path}`,{redirect:'manual',headers:auth?{cookie:auth}:{},signal:AbortSignal.timeout(15000)}); }
try {
 const owner = await db.adminUser.create({data:{id:'ci-server-owner',email:'server-owner@staff-test.invalid',name:'CI owner',passwordHash:'not-a-login-hash',role:'OWNER'}});
 const staff = await db.adminUser.create({data:{id:'ci-server-staff',email:'server-staff@staff-test.invalid',name:'CI staff',passwordHash:'not-a-login-hash',role:'STAFF',active:false,inviteHash:createHash('sha256').update('a'.repeat(64)).digest('hex'),inviteExpiresAt:new Date(Date.now()+60000)}});
 await db.contactMessage.create({data:{id:'ci-private-case',name:'Anonymous',email:'',category:'Community: whistleblower',message:JSON.stringify({version:1,reference:'CI-PRIVATE-CASE',data:{kind:'whistleblower',anonymous:true,message:'Synthetic confidential CI case',email:'',name:'',phone:''},files:[],delivery:'NOT_REQUIRED'})}});
 server = spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3099'],{stdio:['ignore','ignore','pipe'],env:process.env});
 let errors='';server.stderr.on('data',chunk=>{errors+=chunk.toString().slice(-1000);});
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
  if(path==='/admin'){assert.ok(html.includes('Customer service dashboard'));assert.ok(!html.includes('Total revenue'));assert.ok(!html.includes('Staff Access'));}
  if(path==='/admin/community/whistleblower'){assert.ok(html.includes('Synthetic confidential CI case'));assert.ok(html.includes('No contact email supplied'));assert.ok(!html.includes('Permanently delete this submission'));}
 }
 for(const path of ['/admin/settings','/admin/staff','/admin/products','/admin/analytics','/admin/customers']) assert.equal((await request(path,staffCookie)).status,404,`Staff must not access ${path}`);
 assert.equal((await request('/api/admin/buyers/export',staffCookie)).status,401);
 const staffPage=await request('/admin/staff',ownerCookie); assert.equal(staffPage.status,200); const staffHtml=await staffPage.text(); assert.ok(staffHtml.includes('Create and email invitation')); assert.ok(staffHtml.includes('Business email is not configured'));
 assert.equal((await request('/admin/settings',ownerCookie)).status,200);
 await db.adminUser.update({where:{id:staff.id},data:{active:false,sessionVersion:{increment:1}}});
 assert.equal((await request('/admin/orders',staffCookie)).status,307,'Disabled staff token must stop working');
 await db.adminUser.update({where:{id:staff.id},data:{active:true}});
 assert.equal((await request('/admin/orders',staffCookie)).status,307,'Re-enabling must not resurrect an old token');
 console.log('Built server verified: staff dashboard and confidential inbox, owner-only pages/APIs, private rendering and immediate session revocation.');
} finally {
 server?.kill('SIGTERM');
 await db.contactMessage.deleteMany({where:{id:'ci-private-case'}});
 await db.auditLog.deleteMany({where:{adminUserId:{in:['ci-server-owner','ci-server-staff']}}});
 await db.adminUser.deleteMany({where:{id:{in:['ci-server-owner','ci-server-staff']}}});
 await db.$disconnect();
}
