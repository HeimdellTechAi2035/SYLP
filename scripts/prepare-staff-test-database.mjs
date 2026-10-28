// Legacy launch migrations intentionally require an existing two-product catalogue.
// Bootstrap that historical starting state only in the disposable CI database.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
const url = new URL(process.env.DATABASE_URL || 'http://invalid');
assert.equal(url.pathname,'/sylp_staff_test');
assert.ok(['localhost','127.0.0.1'].includes(url.hostname));
const db = new pg.Client({connectionString:url.toString()});
try {
 await db.connect();
 const existing = await db.query(`SELECT to_regclass('public."AdminUser"') AS present`);
 assert.equal(existing.rows[0].present,null,'Bootstrap requires an empty test database');
 await db.query('BEGIN');
 await db.query(await readFile('prisma/migrations/20260903010000_init_postgres/migration.sql','utf8'));
 await db.query(`INSERT INTO "Product" (id,slug,sku,name,price,"updatedAt") VALUES ('ci-hoodie','sylp-hoodie','CI-HOODIE','CI historical hoodie',3799,CURRENT_TIMESTAMP),('ci-shirt','sylp-t-shirt','CI-SHIRT','CI historical shirt',2699,CURRENT_TIMESTAMP)`);
 await db.query('COMMIT');
 console.log('Disposable CI database initialised with historical catalogue fixtures.');
} finally { await db.end(); }
