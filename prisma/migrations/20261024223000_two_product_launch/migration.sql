-- Two-product launch. Archive old lines; keep every order and existing size option.
DO $$ BEGIN
IF (SELECT count(*) FROM "Product" WHERE slug IN ('sylp-hoodie','sylp-t-shirt')) <> 2 THEN
 RAISE EXCEPTION 'Launch requires the existing SYLP hoodie and t-shirt records; no substitute products created';
END IF; END $$;
UPDATE "Product" SET status='ARCHIVED', "updatedAt"=CURRENT_TIMESTAMP WHERE slug NOT IN ('sylp-hoodie','sylp-t-shirt');
UPDATE "Division" SET "isActive"=false;
UPDATE "Category" SET "isActive"=(slug IN ('hoodies','t-shirts'));
UPDATE "SiteSettings" SET "freeDeliveryThreshold"=5001, "updatedAt"=CURRENT_TIMESTAMP;
UPDATE "DeliveryZone" SET "freeThreshold"=5001;
DELETE FROM "ProductRelation";
UPDATE "ProductVariant" SET "priceOverride"=NULL, colour='Black' WHERE "productId" IN (SELECT id FROM "Product" WHERE slug IN ('sylp-hoodie','sylp-t-shirt'));
DELETE FROM "ProductImage" WHERE "productId" IN (SELECT id FROM "Product" WHERE slug IN ('sylp-hoodie','sylp-t-shirt'));
UPDATE "Product" SET name='SYLP Knight Hoodie', price=3799, "salePrice"=NULL, "saleActive"=false, status='ACTIVE', "divisionId"=NULL, "productType"='APPAREL', "mainImage"='/products/sylp-hoodie-launch.jpg', "socialImage"='/products/sylp-hoodie-launch.jpg', "shortDescription"='A black pullover hoodie with an SYLP chest design and a statement knight artwork across the back.', description='A black pullover hoodie with an SYLP chest design and a statement knight artwork across the back. The design combines the SYLP name, flag details and red, white and silver tones. A hood, front pouch pocket and ribbed cuffs complete the look shown.

One garment per purchase: the image shows front and back views of the same item. Images are design mock-ups; print scale, placement and screen colours may vary slightly. Choose from the size options shown. For measurements or fabric composition, contact us before ordering; we do not claim an unverified fit or fabric specification.

Printed and packed to order in the UK. The existing dispatch estimate is shown on the site. UK postage is calculated at checkout; free standard UK postage applies when the goods subtotal after discounts is over £50, excluding delivery.', material=NULL, dimensions=NULL, "netWeightGrams"=NULL, "careInstructions"='Follow the sewn-in care label. Wash inside out with similar colours on a cool gentle cycle where the label allows. Do not iron directly on the print. Avoid tumble drying unless the garment label permits it.', "madeToOrder"=true, "continueSellingOOS"=false, featured=true, "bestSeller"=false, "isNew"=true, giftable=false, "giftMessageEnabled"=false, "giftPackagingAvailable"=false, "seoTitle"='SYLP Knight Hoodie | £37.99', "metaDescription"='SYLP Knight Hoodie in black with SYLP chest artwork and knight back design. £37.99. UK delivery; free standard postage on orders over £50.', "stripeSyncStatus"='PENDING', "updatedAt"=CURRENT_TIMESTAMP WHERE slug='sylp-hoodie';
UPDATE "Category" SET image='/products/sylp-hoodie-launch.jpg', description='SYLP Knight Hoodie in black with front and back artwork.' WHERE slug='hoodies';
UPDATE "Product" SET name='SYLP Knight T-Shirt', price=2699, "salePrice"=NULL, "saleActive"=false, status='ACTIVE', "divisionId"=NULL, "productType"='APPAREL', "mainImage"='/products/sylp-tshirt-launch.jpg', "socialImage"='/products/sylp-tshirt-launch.jpg', "shortDescription"='A black short-sleeve crew-neck t-shirt with an SYLP chest design and a statement knight artwork across the back.', description='A black short-sleeve crew-neck t-shirt with an SYLP chest design and a statement knight artwork across the back. The design combines the SYLP name, flag details and red, white and silver tones. Wear the matching design on its own or alongside the SYLP Knight Hoodie.

One garment per purchase: the image shows front and back views of the same item. Images are design mock-ups; print scale, placement and screen colours may vary slightly. Choose from the size options shown. For measurements or fabric composition, contact us before ordering; we do not claim an unverified fit or fabric specification.

Printed and packed to order in the UK. The existing dispatch estimate is shown on the site. UK postage is calculated at checkout; free standard UK postage applies when the goods subtotal after discounts is over £50, excluding delivery.', material=NULL, dimensions=NULL, "netWeightGrams"=NULL, "careInstructions"='Follow the sewn-in care label. Wash inside out with similar colours on a cool gentle cycle where the label allows. Do not iron directly on the print. Avoid tumble drying unless the garment label permits it.', "madeToOrder"=true, "continueSellingOOS"=false, featured=true, "bestSeller"=false, "isNew"=true, giftable=false, "giftMessageEnabled"=false, "giftPackagingAvailable"=false, "seoTitle"='SYLP Knight T-Shirt | £26.99', "metaDescription"='SYLP Knight T-Shirt in black with SYLP chest artwork and knight back design. £26.99. UK delivery; free standard postage on orders over £50.', "stripeSyncStatus"='PENDING', "updatedAt"=CURRENT_TIMESTAMP WHERE slug='sylp-t-shirt';
UPDATE "Category" SET image='/products/sylp-tshirt-launch.jpg', description='SYLP Knight T-Shirt in black with front and back artwork.' WHERE slug='t-shirts';
UPDATE "HomepageContent" SET "announcementBarText"='Hoodie £37.99 · T-Shirt £26.99 · Free UK postage on orders over £50', "heroTitle"='Wear your support.', "heroSubtitle"='Two designs. One statement. The black SYLP Knight Hoodie (£37.99) and T-Shirt (£26.99), featuring chest branding and bold knight artwork across the back. Postage added at checkout; free standard UK postage on orders over £50.', "heroImage"='/products/sylp-hoodie-launch.jpg', "heroCtaPrimaryLabel"='Shop the range', "heroCtaPrimaryHref"='/shop', "heroCtaSecondaryLabel"='Delivery & returns', "heroCtaSecondaryHref"='/legal/delivery', "storyTitle"='Support Your Local Patriot', "storyBody"='Our current range keeps things simple: a black SYLP Knight Hoodie and a matching T-Shirt, printed and packed to order in the UK. Choose your item and available size, then pay securely through Stripe. The images show front and back views of each garment; each purchase is for one item.', "storyImage"='/products/sylp-tshirt-launch.jpg', "updatedAt"=CURRENT_TIMESTAMP;
UPDATE "HomepageFeature" SET body='Hoodie £37.99. T-Shirt £26.99. Postage shown before payment.', title='Clear pricing' WHERE "sortOrder"=0 AND section='WHY_SHOP';
UPDATE "HomepageFeature" SET title='Two-piece range', body='Black hoodie and t-shirt with front and back SYLP artwork.' WHERE "sortOrder"=2 AND section='WHY_SHOP';
UPDATE "FaqItem" SET "isActive"=false;
INSERT INTO "FaqItem" (id,question,answer,category,"sortOrder","isActive") VALUES ('sylp-launch-faq-0','What is available?','The SYLP Knight Hoodie is £37.99 and the SYLP Knight T-Shirt is £26.99. Both are black with front and back artwork. Each product image shows two views of one garment, not a two-item bundle.','Products',0,true);
INSERT INTO "FaqItem" (id,question,answer,category,"sortOrder","isActive") VALUES ('sylp-launch-faq-1','How much is postage?','The existing standard UK postage charge is shown at checkout before payment. Standard UK postage is free when the goods subtotal after discounts is over £50, excluding postage. A hoodie and t-shirt together cost £64.98 and qualify.','Products',1,true);
INSERT INTO "FaqItem" (id,question,answer,category,"sortOrder","isActive") VALUES ('sylp-launch-faq-2','Which size should I choose?','Choose from the sizes shown on the product page. Do not assume a particular fit. Contact support@support-your-local-patriot.online before ordering if you need garment measurements or fabric details.','Products',2,true);
INSERT INTO "FaqItem" (id,question,answer,category,"sortOrder","isActive") VALUES ('sylp-launch-faq-3','When will my order arrive?','Items are printed and packed to order. Check the current dispatch estimate in the site footer and allow the delivery time shown at checkout after dispatch. Contact us if your order is needed for a specific date.','Products',3,true);
INSERT INTO "FaqItem" (id,question,answer,category,"sortOrder","isActive") VALUES ('sylp-launch-faq-4','Can I return my order?','For these standard designs, you can notify us of cancellation within 14 days after delivery and then have a further 14 days to return the goods. You pay change-of-mind return postage. Faulty or incorrectly supplied goods are handled at our cost. See Returns & Refunds for full details.','Products',4,true);
INSERT INTO "FaqItem" (id,question,answer,category,"sortOrder","isActive") VALUES ('sylp-launch-faq-5','How do I check my order?','Keep the order number shown after payment. Use Track Your Order with that number and the email used at checkout, or contact support. A customer account is optional.','Products',5,true);
INSERT INTO "FaqItem" (id,question,answer,category,"sortOrder","isActive") VALUES ('sylp-launch-faq-6','How do I care for the print?','Follow the garment care label first. Where permitted, wash inside out on a cool gentle cycle with similar colours. Do not iron directly on the print. Avoid tumble drying unless the label allows it.','Products',6,true);
UPDATE "Policy" SET title='Delivery', body='We currently deliver to the United Kingdom only. The standard postage charge is shown before payment. Free standard UK postage applies when the goods subtotal after discounts is strictly over £50, excluding postage. At £50 exactly, the standard charge applies. A hoodie and t-shirt together cost £64.98 and qualify.

Items are printed and packed to order. Our current dispatch estimate is shown in the site footer; delivery time is additional and is shown at checkout where available. These are estimates, not guaranteed arrival dates. We will contact you about significant delays. Unless you expressly agree otherwise, goods will be delivered within 30 days. If we cannot meet an agreed essential deadline, your statutory cancellation and refund rights apply.

Check your address before paying. Contact support@support-your-local-patriot.online promptly about errors, delays, loss or damage. We remain responsible until the goods reach you or someone you nominate, except where you independently appoint a carrier we did not offer. Do not contact the carrier instead of us to obtain your consumer remedy.', "isDraft"=false, "lastUpdated"=CURRENT_TIMESTAMP WHERE slug='delivery';
UPDATE "Policy" SET title='Returns & Refunds', body='These are standard SYLP designs. Printing a standard item after an order is placed does not remove your change-of-mind cancellation rights.

Tell us clearly that you wish to cancel within 14 days after the day you receive your goods (or the last goods in an order delivered separately). Email support@support-your-local-patriot.online with your name, order number and items. No reason or mandatory form is required. Return the goods within a further 14 days. Contact us for the return destination before posting; this does not limit your right to cancel. You pay the direct return postage for a change of mind.

You may inspect and try on the garment as you would in a shop. We may deduct only for diminished value caused by handling beyond what is necessary to establish its nature, characteristics and functioning; original packaging is not a condition of your statutory rights.

We refund the goods and, for a full-order cancellation, the cheapest standard outbound delivery charge within 14 days of receiving the goods back or evidence of return, whichever is earlier. We use your original payment method without a refund fee. Premium delivery extras are not refundable for a change of mind.

For faulty, damaged, wrong or misdescribed goods, contact us promptly. Your Consumer Rights Act 2015 remedies apply, including the short-term right to reject faulty goods within 30 days and applicable repair, replacement, price-reduction or refund rights afterwards. We cover reasonable return costs for these issues. Photographs help but do not replace your legal rights. Nothing in this policy restricts statutory rights.', "isDraft"=false, "lastUpdated"=CURRENT_TIMESTAMP WHERE slug='returns-refunds';
UPDATE "Policy" SET title='Cancellation Policy', body='You may cancel before dispatch and up to 14 days after the day you receive the goods. For one order delivered separately, the period starts after the last goods arrive. The current hoodie and t-shirt are standard designs; their being printed to order does not remove this right.

Email support@support-your-local-patriot.online with a clear cancellation statement. You may use this optional form:

To: Support Your Local Patriot, Heimdell Tech Ai Ltd, support@support-your-local-patriot.online
I hereby give notice that I cancel my contract of sale of the following goods: ____
Ordered on / received on: ____
Name: ____
Address: ____
Order number (if available): ____
Date: ____
Signature (only if sent on paper): ____

If goods have arrived, send them back within 14 days of telling us. You pay change-of-mind return postage. Full details, including refunds of standard outbound delivery, are in Returns & Refunds. Contact us for a return destination; cancellation is effective when you clearly notify us and is not conditional on authorisation.', "isDraft"=false, "lastUpdated"=CURRENT_TIMESTAMP WHERE slug='cancellation';
UPDATE "Policy" SET title='Product Care Guide', body='Always follow the sewn-in garment care label. Where the label permits, turn the garment inside out and use a cool gentle wash with similar colours. Do not iron directly over the artwork. Avoid tumble drying unless the garment label permits it. Do not use bleach on the printed area. Keep away from naked flames.

The photographs are design mock-ups showing the front and back of each garment. Placement, print scale and screen colours may vary slightly. Each purchase is for one garment. Contact support before ordering for fabric composition or measurements if these are not listed. We do not claim unverified fabric blends, garment weights or fit measurements.', "isDraft"=false, "lastUpdated"=CURRENT_TIMESTAMP WHERE slug='product-care';
UPDATE "Policy" SET body=replace(replace(body,'£35','£50'),'apparel, accessories and gifts','hoodies and t-shirts'), "lastUpdated"=CURRENT_TIMESTAMP WHERE slug NOT IN ('delivery','returns-refunds','cancellation','product-care');
UPDATE "Policy" SET body=regexp_replace(body, '5\. Phone cases.*?6\. Delivery', '5. Size selection
Choose an available size before paying. Contact us for measurements before ordering if unsure.

6. Delivery', 's') WHERE slug='terms';
UPDATE "Policy" SET body=replace(body, 'no longer make', 'no longer supply') WHERE slug='terms';

UPDATE "Product" SET "videoUrl"=NULL, "productionTimeDays"=NULL WHERE slug IN ('sylp-hoodie','sylp-t-shirt');
