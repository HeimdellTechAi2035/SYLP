import assert from "node:assert/strict";

// Read-only checks of the actual public store. No cart, order or payment writes.
const root = "https://support-your-local-patriot.online";
let success = 0, failures = 0;
async function check(label, fn) {
  try { await fn(); success++; console.log("PASS", label); }
  catch (e) { failures++; console.error("FAIL", label, "-", e.message); }
}
async function get(path) {
  return fetch(root + path, {
    headers: { "User-Agent": "SYLP-Live-Shop-Readiness/1.0" },
    signal: AbortSignal.timeout(25000),
  });
}
async function page(path, terms=[]) {
  const r = await get(path);
  assert.equal(r.status, 200, path + " responded " + r.status);
  const html = await r.text();
  assert(!html.includes("Application error: a server-side exception"), path + " crashed");
  for (const term of terms) assert(html.includes(term), path + " missing " + term);
  return r;
}
await check("Homepage displays both prices", () => page("/", ["37.99","26.99"]));
await check("Shop lists only intended product names", () => page("/shop", ["SYLP Knight Hoodie","SYLP Knight T-Shirt","37.99","26.99"]));
await check("Hoodie product page and basket control", () => page("/products/sylp-hoodie", ["37.99","Add to Basket"]));
await check("T-shirt product page and basket control", () => page("/products/sylp-t-shirt", ["26.99","Add to Basket"]));
await check("Empty basket", () => page("/cart", ["Your basket is empty"]));
await check("Empty checkout redirects to basket", async () => {
  const r = await get("/checkout");
  assert.equal(r.status, 200);
  assert.equal(new URL(r.url).pathname, "/cart");
});
await check("Contact page", () => page("/contact"));
await check("FAQ page", () => page("/faq"));
await check("Delivery policy", () => page("/legal/delivery", ["50"]));
await check("Returns policy", () => page("/legal/returns-refunds", ["14 days"]));
await check("Cancellation policy", () => page("/legal/cancellation", ["14 days"]));
await check("Terms and privacy", async () => {
  await page("/legal/terms");
  await page("/legal/privacy");
  await page("/legal/cookies");
});

let catalog;
await check("Public product catalog", async () => {
  const r = await get("/catalog.json");
  assert.equal(r.status, 200);
  catalog = await r.json();
  assert(Array.isArray(catalog.products));
});
if (catalog) {
  await check("Exactly two live products and no legacy divisions", () => {
    assert.deepEqual(catalog.products.map(p => p.id).sort(), ["sylp-hoodie","sylp-t-shirt"]);
    assert.equal(catalog.divisions.length, 0);
  });
  await check("Prices, GBP and size choices", () => {
    const p = Object.fromEntries(catalog.products.map(x => [x.id,x]));
    assert.equal(p["sylp-hoodie"].price.amount, 37.99);
    assert.equal(p["sylp-t-shirt"].price.amount, 26.99);
    for (const v of catalog.products) {
      assert.equal(v.price.currency,"GBP");
      assert.equal(v.available,true, v.id + " unavailable");
      assert(v.options.length>0, v.id + " missing size choices");
      assert(v.options.every(o => o.price === v.price.amount),v.id+" size surcharge");
    }
  });
  await check("UK postage and free shipping strictly over £50", () => {
    assert.equal(catalog.store.currency,"GBP");
    assert(catalog.store.shipsTo.includes("United Kingdom"));
    assert(catalog.delivery.some(z => z.countries.includes("United Kingdom") && z.freeOver?.amount === 50.01));
  });
  await check("Product photographs are available", async () => {
    for (const p of catalog.products) {
      assert(p.image, p.id + " no photo");
      const r=await fetch(p.image,{method:"HEAD",signal:AbortSignal.timeout(25000)});
      assert.equal(r.status,200,p.id+" photo HTTP "+r.status);
      assert((r.headers.get("content-type")||"").startsWith("image/"),p.id+" wrong image type");
    }
  });
  await check("Support contact and key policies provided", () => {
    assert(catalog.store.email?.includes("@"));
    for (const slug of ["delivery","returns-refunds","cancellation","terms","privacy"]) {
      assert(catalog.policies.some(p=>new URL(p.url).pathname==="/legal/"+slug),"missing policy "+slug);
    }
  });
}
console.log("RESULT:",success,"passed,",failures,"failed.");
console.log("Payment authorisation, live Stripe credentials, webhook, order email and dispatch are NOT validated: no checkout transaction was created.");
if(failures) process.exitCode=1;
