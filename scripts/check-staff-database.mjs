// This smoke test is destructive only inside an explicitly named disposable CI DB.
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const url = new URL(process.env.DATABASE_URL || 'http://invalid');
assert.equal(url.pathname, '/sylp_staff_test', 'Use the isolated sylp_staff_test database only');
assert.ok(['localhost','127.0.0.1'].includes(url.hostname), 'CI localhost database only');
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url.toString() }) });
try {
 await db.$transaction(async tx => {
  const owner = await tx.adminUser.create({ data: { email:'owner@staff-test.invalid', name:'Test owner', passwordHash:'not-a-login-hash' } });
  assert.equal(owner.active,true); assert.equal(owner.sessionVersion,0); assert.equal(owner.role,'OWNER');
  const staff = await tx.adminUser.create({ data: { email:'staff@staff-test.invalid', name:'Test staff', passwordHash:'not-a-login-hash', role:'STAFF', active:false, inviteHash:'isolated-test-hash', inviteExpiresAt:new Date(Date.now()+60000) } });
  const accept = () => tx.adminUser.updateMany({ where:{role:'STAFF',inviteHash:'isolated-test-hash',inviteExpiresAt:{gt:new Date()}},data:{active:true,inviteHash:null,inviteExpiresAt:null,sessionVersion:{increment:1}} });
  assert.equal((await accept()).count,1); assert.equal((await accept()).count,0);
  const task = await tx.supportTask.create({ data:{entityType:'ContactMessage',entityId:'isolated-test-case',assignedTo:staff.id,followUpAt:new Date(),area:'Preston',helpInterest:'Practical support'} });
  assert.equal(task.area,'Preston'); assert.equal(task.helpInterest,'Practical support');
  await tx.supportEntry.create({ data:{entityType:'ContactMessage',entityId:'isolated-test-case',adminUserId:staff.id,authorName:staff.name,kind:'NOTE',body:'Isolated CI note'} });
  await tx.adminUser.updateMany({ where:{id:staff.id,role:'STAFF'},data:{active:false,sessionVersion:{increment:1}} });
  const disabled = await tx.adminUser.findUnique({ where:{id:staff.id} }); assert.equal(disabled.active,false); assert.equal(disabled.sessionVersion,2);
  assert.equal((await tx.adminUser.updateMany({where:{id:owner.id,role:'STAFF'},data:{active:false}})).count,0);
  assert.equal(await tx.supportEntry.count({where:{entityId:'isolated-test-case'}}),1);
  await tx.supportEntry.deleteMany({where:{entityId:'isolated-test-case'}}); await tx.supportTask.delete({where:{id:task.id}}); await tx.adminUser.deleteMany({where:{id:{in:[owner.id,staff.id]}}});
 });
 console.log('Staff migration, owner defaults, single-use activation, access revocation and support history verified against isolated Postgres.');
} finally { await db.$disconnect(); }
