-- Every division gets its own version of every product in the shop:
-- Hoodie, T-Shirt, Keyring, Tracksuit, Mug, Phone Case, Wallet and Gift Set.
-- Each one is COPIED from the live product it's based on (price, description, material,
-- sizes, gift-set contents...), renamed for the division. Hoodies and tees get a photo with the
-- division's crest on them; other items show the division's logo until their photos are added.
-- They're ordinary products afterwards: everything is editable in Admin -> Products.
-- Products whose original doesn't exist are simply skipped. Safe to re-run (ON CONFLICT DO NOTHING).

-- Preston Patriots
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_pre_hd','preston-patriots-hoodie','PRE-HD','Preston Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),b."price",0,true,'/products/divisions/preston-patriots-hoodie.jpg',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-hoodie'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_hd','prod_pre_hd','/products/divisions/preston-patriots-hoodie.jpg','Preston Patriots Hoodie with the Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_pre_hd_' || v."id", 'prod_pre_hd', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'PRE-HD-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-hoodie' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_hd_s','prod_pre_hd','S','S','PRE-HD-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_hd_m','prod_pre_hd','M','M','PRE-HD-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_hd_l','prod_pre_hd','L','L','PRE-HD-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_hd_xl','prod_pre_hd','XL','XL','PRE-HD-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_hd_xxl','prod_pre_hd','XXL','XXL','PRE-HD-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_pre_ts','preston-patriots-t-shirt','PRE-TS','Preston Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),b."price",0,true,'/products/divisions/preston-patriots-t-shirt.jpg',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-t-shirt'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_ts','prod_pre_ts','/products/divisions/preston-patriots-t-shirt.jpg','Preston Patriots T Shirt with the Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_pre_ts_' || v."id", 'prod_pre_ts', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'PRE-TS-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-t-shirt' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_ts_s','prod_pre_ts','S','S','PRE-TS-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_ts_m','prod_pre_ts','M','M','PRE-TS-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_ts_l','prod_pre_ts','L','L','PRE-TS-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_ts_xl','prod_pre_ts','XL','XL','PRE-TS-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_ts_xxl','prod_pre_ts','XXL','XXL','PRE-TS-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_pre_kr','preston-patriots-keyring','PRE-KR','Preston Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),b."price",0,true,'/brand/divisions/preston-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-keyring'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_kr','prod_pre_kr','/brand/divisions/preston-patriots.png','Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_kr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_pre_kr_' || v."id", 'prod_pre_kr', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'PRE-KR-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-keyring' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_kr')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_pre_tr','preston-patriots-tracksuit','PRE-TR','Preston Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),b."price",0,true,'/brand/divisions/preston-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-track-suit'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_tr','prod_pre_tr','/brand/divisions/preston-patriots.png','Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_tr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_pre_tr_' || v."id", 'prod_pre_tr', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'PRE-TR-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-track-suit' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_tr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_tr_s','prod_pre_tr','S','S','PRE-TR-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_tr_m','prod_pre_tr','M','M','PRE-TR-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_tr_l','prod_pre_tr','L','L','PRE-TR-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_tr_xl','prod_pre_tr','XL','XL','PRE-TR-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_tr_xxl','prod_pre_tr','XXL','XXL','PRE-TR-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_pre_mg','preston-patriots-mug','PRE-MG','Preston Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),b."price",0,true,'/brand/divisions/preston-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-enamel-mug'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_mg','prod_pre_mg','/brand/divisions/preston-patriots.png','Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_mg')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_pre_mg_' || v."id", 'prod_pre_mg', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'PRE-MG-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-enamel-mug' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_mg')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_pre_pc','preston-patriots-phone-case','PRE-PC','Preston Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),b."price",0,true,'/brand/divisions/preston-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-phone-case'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_pc','prod_pre_pc','/brand/divisions/preston-patriots.png','Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_pc')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_pre_pc_' || v."id", 'prod_pre_pc', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'PRE-PC-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-phone-case' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_pc')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_pre_wl','preston-patriots-wallet','PRE-WL','Preston Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),b."price",0,true,'/brand/divisions/preston-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-engraved-wallet'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_wl','prod_pre_wl','/brand/divisions/preston-patriots.png','Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_wl')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_pre_wl_' || v."id", 'prod_pre_wl', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'PRE-WL-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-engraved-wallet' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_wl')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_pre_gs','preston-patriots-gift-set','PRE-GS','Preston Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'),b."price",0,true,'/brand/divisions/preston-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'starter-pack-gift-set'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_gs','prod_pre_gs','/brand/divisions/preston-patriots.png','Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_gs')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_pre_gs_' || v."id", 'prod_pre_gs', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Preston Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'PRE-GS-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'starter-pack-gift-set' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_gs')
ON CONFLICT DO NOTHING;
INSERT INTO "GiftSetItem" ("id","giftSetId","componentId","quantity")
SELECT 'gsi_prod_pre_gs_' || gi."id", 'prod_pre_gs',
       COALESCE((SELECT "id" FROM "Product" WHERE "id" = CASE comp."slug" WHEN 'sylp-hoodie' THEN 'prod_pre_hd' WHEN 'sylp-t-shirt' THEN 'prod_pre_ts' WHEN 'sylp-keyring' THEN 'prod_pre_kr' WHEN 'sylp-track-suit' THEN 'prod_pre_tr' WHEN 'sylp-enamel-mug' THEN 'prod_pre_mg' WHEN 'sylp-phone-case' THEN 'prod_pre_pc' WHEN 'sylp-engraved-wallet' THEN 'prod_pre_wl' END), gi."componentId"), gi."quantity"
FROM "GiftSetItem" gi JOIN "Product" base ON base."id" = gi."giftSetId" JOIN "Product" comp ON comp."id" = gi."componentId"
WHERE base."slug" = 'starter-pack-gift-set' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_gs')
ON CONFLICT DO NOTHING;

-- Merseyside Patriots
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_mer_hd','merseyside-patriots-hoodie','MER-HD','Merseyside Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),b."price",0,true,'/products/divisions/merseyside-patriots-hoodie.jpg',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-hoodie'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_hd','prod_mer_hd','/products/divisions/merseyside-patriots-hoodie.jpg','Merseyside Patriots Hoodie with the Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_mer_hd_' || v."id", 'prod_mer_hd', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'MER-HD-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-hoodie' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_hd_s','prod_mer_hd','S','S','MER-HD-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_hd_m','prod_mer_hd','M','M','MER-HD-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_hd_l','prod_mer_hd','L','L','MER-HD-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_hd_xl','prod_mer_hd','XL','XL','MER-HD-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_hd_xxl','prod_mer_hd','XXL','XXL','MER-HD-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_mer_ts','merseyside-patriots-t-shirt','MER-TS','Merseyside Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),b."price",0,true,'/products/divisions/merseyside-patriots-t-shirt.jpg',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-t-shirt'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_ts','prod_mer_ts','/products/divisions/merseyside-patriots-t-shirt.jpg','Merseyside Patriots T Shirt with the Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_mer_ts_' || v."id", 'prod_mer_ts', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'MER-TS-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-t-shirt' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_ts_s','prod_mer_ts','S','S','MER-TS-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_ts_m','prod_mer_ts','M','M','MER-TS-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_ts_l','prod_mer_ts','L','L','MER-TS-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_ts_xl','prod_mer_ts','XL','XL','MER-TS-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_ts_xxl','prod_mer_ts','XXL','XXL','MER-TS-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_mer_kr','merseyside-patriots-keyring','MER-KR','Merseyside Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),b."price",0,true,'/brand/divisions/merseyside-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-keyring'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_kr','prod_mer_kr','/brand/divisions/merseyside-patriots.png','Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_kr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_mer_kr_' || v."id", 'prod_mer_kr', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'MER-KR-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-keyring' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_kr')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_mer_tr','merseyside-patriots-tracksuit','MER-TR','Merseyside Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),b."price",0,true,'/brand/divisions/merseyside-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-track-suit'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_tr','prod_mer_tr','/brand/divisions/merseyside-patriots.png','Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_tr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_mer_tr_' || v."id", 'prod_mer_tr', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'MER-TR-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-track-suit' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_tr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_tr_s','prod_mer_tr','S','S','MER-TR-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_tr_m','prod_mer_tr','M','M','MER-TR-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_tr_l','prod_mer_tr','L','L','MER-TR-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_tr_xl','prod_mer_tr','XL','XL','MER-TR-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_tr_xxl','prod_mer_tr','XXL','XXL','MER-TR-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_mer_mg','merseyside-patriots-mug','MER-MG','Merseyside Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),b."price",0,true,'/brand/divisions/merseyside-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-enamel-mug'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_mg','prod_mer_mg','/brand/divisions/merseyside-patriots.png','Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_mg')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_mer_mg_' || v."id", 'prod_mer_mg', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'MER-MG-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-enamel-mug' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_mg')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_mer_pc','merseyside-patriots-phone-case','MER-PC','Merseyside Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),b."price",0,true,'/brand/divisions/merseyside-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-phone-case'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_pc','prod_mer_pc','/brand/divisions/merseyside-patriots.png','Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_pc')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_mer_pc_' || v."id", 'prod_mer_pc', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'MER-PC-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-phone-case' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_pc')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_mer_wl','merseyside-patriots-wallet','MER-WL','Merseyside Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),b."price",0,true,'/brand/divisions/merseyside-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-engraved-wallet'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_wl','prod_mer_wl','/brand/divisions/merseyside-patriots.png','Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_wl')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_mer_wl_' || v."id", 'prod_mer_wl', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'MER-WL-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-engraved-wallet' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_wl')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_mer_gs','merseyside-patriots-gift-set','MER-GS','Merseyside Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'),b."price",0,true,'/brand/divisions/merseyside-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'starter-pack-gift-set'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_gs','prod_mer_gs','/brand/divisions/merseyside-patriots.png','Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_gs')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_mer_gs_' || v."id", 'prod_mer_gs', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Merseyside Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'MER-GS-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'starter-pack-gift-set' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_gs')
ON CONFLICT DO NOTHING;
INSERT INTO "GiftSetItem" ("id","giftSetId","componentId","quantity")
SELECT 'gsi_prod_mer_gs_' || gi."id", 'prod_mer_gs',
       COALESCE((SELECT "id" FROM "Product" WHERE "id" = CASE comp."slug" WHEN 'sylp-hoodie' THEN 'prod_mer_hd' WHEN 'sylp-t-shirt' THEN 'prod_mer_ts' WHEN 'sylp-keyring' THEN 'prod_mer_kr' WHEN 'sylp-track-suit' THEN 'prod_mer_tr' WHEN 'sylp-enamel-mug' THEN 'prod_mer_mg' WHEN 'sylp-phone-case' THEN 'prod_mer_pc' WHEN 'sylp-engraved-wallet' THEN 'prod_mer_wl' END), gi."componentId"), gi."quantity"
FROM "GiftSetItem" gi JOIN "Product" base ON base."id" = gi."giftSetId" JOIN "Product" comp ON comp."id" = gi."componentId"
WHERE base."slug" = 'starter-pack-gift-set' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_gs')
ON CONFLICT DO NOTHING;

-- Greater Manchester Patriots
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_gmr_hd','greater-manchester-patriots-hoodie','GMR-HD','Greater Manchester Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),b."price",0,true,'/products/divisions/greater-manchester-patriots-hoodie.jpg',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-hoodie'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_hd','prod_gmr_hd','/products/divisions/greater-manchester-patriots-hoodie.jpg','Greater Manchester Patriots Hoodie with the Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_gmr_hd_' || v."id", 'prod_gmr_hd', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'GMR-HD-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-hoodie' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_hd_s','prod_gmr_hd','S','S','GMR-HD-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_hd_m','prod_gmr_hd','M','M','GMR-HD-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_hd_l','prod_gmr_hd','L','L','GMR-HD-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_hd_xl','prod_gmr_hd','XL','XL','GMR-HD-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_hd_xxl','prod_gmr_hd','XXL','XXL','GMR-HD-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_gmr_ts','greater-manchester-patriots-t-shirt','GMR-TS','Greater Manchester Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),b."price",0,true,'/products/divisions/greater-manchester-patriots-t-shirt.jpg',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-t-shirt'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_ts','prod_gmr_ts','/products/divisions/greater-manchester-patriots-t-shirt.jpg','Greater Manchester Patriots T Shirt with the Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_gmr_ts_' || v."id", 'prod_gmr_ts', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'GMR-TS-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-t-shirt' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_ts_s','prod_gmr_ts','S','S','GMR-TS-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_ts_m','prod_gmr_ts','M','M','GMR-TS-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_ts_l','prod_gmr_ts','L','L','GMR-TS-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_ts_xl','prod_gmr_ts','XL','XL','GMR-TS-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_ts_xxl','prod_gmr_ts','XXL','XXL','GMR-TS-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_gmr_kr','greater-manchester-patriots-keyring','GMR-KR','Greater Manchester Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),b."price",0,true,'/brand/divisions/greater-manchester-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-keyring'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_kr','prod_gmr_kr','/brand/divisions/greater-manchester-patriots.png','Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_kr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_gmr_kr_' || v."id", 'prod_gmr_kr', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'GMR-KR-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-keyring' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_kr')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_gmr_tr','greater-manchester-patriots-tracksuit','GMR-TR','Greater Manchester Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),b."price",0,true,'/brand/divisions/greater-manchester-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-track-suit'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_tr','prod_gmr_tr','/brand/divisions/greater-manchester-patriots.png','Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_tr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_gmr_tr_' || v."id", 'prod_gmr_tr', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'GMR-TR-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-track-suit' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_tr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_tr_s','prod_gmr_tr','S','S','GMR-TR-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_tr_m','prod_gmr_tr','M','M','GMR-TR-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_tr_l','prod_gmr_tr','L','L','GMR-TR-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_tr_xl','prod_gmr_tr','XL','XL','GMR-TR-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_tr_xxl','prod_gmr_tr','XXL','XXL','GMR-TR-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_gmr_mg','greater-manchester-patriots-mug','GMR-MG','Greater Manchester Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),b."price",0,true,'/brand/divisions/greater-manchester-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-enamel-mug'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_mg','prod_gmr_mg','/brand/divisions/greater-manchester-patriots.png','Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_mg')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_gmr_mg_' || v."id", 'prod_gmr_mg', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'GMR-MG-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-enamel-mug' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_mg')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_gmr_pc','greater-manchester-patriots-phone-case','GMR-PC','Greater Manchester Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),b."price",0,true,'/brand/divisions/greater-manchester-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-phone-case'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_pc','prod_gmr_pc','/brand/divisions/greater-manchester-patriots.png','Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_pc')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_gmr_pc_' || v."id", 'prod_gmr_pc', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'GMR-PC-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-phone-case' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_pc')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_gmr_wl','greater-manchester-patriots-wallet','GMR-WL','Greater Manchester Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),b."price",0,true,'/brand/divisions/greater-manchester-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-engraved-wallet'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_wl','prod_gmr_wl','/brand/divisions/greater-manchester-patriots.png','Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_wl')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_gmr_wl_' || v."id", 'prod_gmr_wl', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'GMR-WL-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-engraved-wallet' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_wl')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_gmr_gs','greater-manchester-patriots-gift-set','GMR-GS','Greater Manchester Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'),b."price",0,true,'/brand/divisions/greater-manchester-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'starter-pack-gift-set'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_gs','prod_gmr_gs','/brand/divisions/greater-manchester-patriots.png','Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_gs')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_gmr_gs_' || v."id", 'prod_gmr_gs', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Greater Manchester Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'GMR-GS-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'starter-pack-gift-set' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_gs')
ON CONFLICT DO NOTHING;
INSERT INTO "GiftSetItem" ("id","giftSetId","componentId","quantity")
SELECT 'gsi_prod_gmr_gs_' || gi."id", 'prod_gmr_gs',
       COALESCE((SELECT "id" FROM "Product" WHERE "id" = CASE comp."slug" WHEN 'sylp-hoodie' THEN 'prod_gmr_hd' WHEN 'sylp-t-shirt' THEN 'prod_gmr_ts' WHEN 'sylp-keyring' THEN 'prod_gmr_kr' WHEN 'sylp-track-suit' THEN 'prod_gmr_tr' WHEN 'sylp-enamel-mug' THEN 'prod_gmr_mg' WHEN 'sylp-phone-case' THEN 'prod_gmr_pc' WHEN 'sylp-engraved-wallet' THEN 'prod_gmr_wl' END), gi."componentId"), gi."quantity"
FROM "GiftSetItem" gi JOIN "Product" base ON base."id" = gi."giftSetId" JOIN "Product" comp ON comp."id" = gi."componentId"
WHERE base."slug" = 'starter-pack-gift-set' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_gs')
ON CONFLICT DO NOTHING;

-- Blackpool Patriots
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_blk_hd','blackpool-patriots-hoodie','BLK-HD','Blackpool Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),b."price",0,true,'/products/divisions/blackpool-patriots-hoodie.jpg',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-hoodie'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_hd','prod_blk_hd','/products/divisions/blackpool-patriots-hoodie.jpg','Blackpool Patriots Hoodie with the Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_blk_hd_' || v."id", 'prod_blk_hd', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'BLK-HD-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-hoodie' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_hd_s','prod_blk_hd','S','S','BLK-HD-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_hd_m','prod_blk_hd','M','M','BLK-HD-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_hd_l','prod_blk_hd','L','L','BLK-HD-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_hd_xl','prod_blk_hd','XL','XL','BLK-HD-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_hd_xxl','prod_blk_hd','XXL','XXL','BLK-HD-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_blk_ts','blackpool-patriots-t-shirt','BLK-TS','Blackpool Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),b."price",0,true,'/products/divisions/blackpool-patriots-t-shirt.jpg',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-t-shirt'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_ts','prod_blk_ts','/products/divisions/blackpool-patriots-t-shirt.jpg','Blackpool Patriots T Shirt with the Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_blk_ts_' || v."id", 'prod_blk_ts', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'BLK-TS-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-t-shirt' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_ts_s','prod_blk_ts','S','S','BLK-TS-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_ts_m','prod_blk_ts','M','M','BLK-TS-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_ts_l','prod_blk_ts','L','L','BLK-TS-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_ts_xl','prod_blk_ts','XL','XL','BLK-TS-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_ts_xxl','prod_blk_ts','XXL','XXL','BLK-TS-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_blk_kr','blackpool-patriots-keyring','BLK-KR','Blackpool Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),b."price",0,true,'/brand/divisions/blackpool-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-keyring'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_kr','prod_blk_kr','/brand/divisions/blackpool-patriots.png','Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_kr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_blk_kr_' || v."id", 'prod_blk_kr', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'BLK-KR-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-keyring' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_kr')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_blk_tr','blackpool-patriots-tracksuit','BLK-TR','Blackpool Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),b."price",0,true,'/brand/divisions/blackpool-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-track-suit'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_tr','prod_blk_tr','/brand/divisions/blackpool-patriots.png','Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_tr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_blk_tr_' || v."id", 'prod_blk_tr', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'BLK-TR-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-track-suit' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_tr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_tr_s','prod_blk_tr','S','S','BLK-TR-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_tr_m','prod_blk_tr','M','M','BLK-TR-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_tr_l','prod_blk_tr','L','L','BLK-TR-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_tr_xl','prod_blk_tr','XL','XL','BLK-TR-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_tr_xxl','prod_blk_tr','XXL','XXL','BLK-TR-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_blk_mg','blackpool-patriots-mug','BLK-MG','Blackpool Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),b."price",0,true,'/brand/divisions/blackpool-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-enamel-mug'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_mg','prod_blk_mg','/brand/divisions/blackpool-patriots.png','Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_mg')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_blk_mg_' || v."id", 'prod_blk_mg', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'BLK-MG-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-enamel-mug' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_mg')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_blk_pc','blackpool-patriots-phone-case','BLK-PC','Blackpool Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),b."price",0,true,'/brand/divisions/blackpool-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-phone-case'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_pc','prod_blk_pc','/brand/divisions/blackpool-patriots.png','Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_pc')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_blk_pc_' || v."id", 'prod_blk_pc', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'BLK-PC-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-phone-case' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_pc')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_blk_wl','blackpool-patriots-wallet','BLK-WL','Blackpool Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),b."price",0,true,'/brand/divisions/blackpool-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-engraved-wallet'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_wl','prod_blk_wl','/brand/divisions/blackpool-patriots.png','Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_wl')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_blk_wl_' || v."id", 'prod_blk_wl', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'BLK-WL-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-engraved-wallet' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_wl')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_blk_gs','blackpool-patriots-gift-set','BLK-GS','Blackpool Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'),b."price",0,true,'/brand/divisions/blackpool-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'starter-pack-gift-set'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_gs','prod_blk_gs','/brand/divisions/blackpool-patriots.png','Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_gs')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_blk_gs_' || v."id", 'prod_blk_gs', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Blackpool Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'BLK-GS-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'starter-pack-gift-set' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_gs')
ON CONFLICT DO NOTHING;
INSERT INTO "GiftSetItem" ("id","giftSetId","componentId","quantity")
SELECT 'gsi_prod_blk_gs_' || gi."id", 'prod_blk_gs',
       COALESCE((SELECT "id" FROM "Product" WHERE "id" = CASE comp."slug" WHEN 'sylp-hoodie' THEN 'prod_blk_hd' WHEN 'sylp-t-shirt' THEN 'prod_blk_ts' WHEN 'sylp-keyring' THEN 'prod_blk_kr' WHEN 'sylp-track-suit' THEN 'prod_blk_tr' WHEN 'sylp-enamel-mug' THEN 'prod_blk_mg' WHEN 'sylp-phone-case' THEN 'prod_blk_pc' WHEN 'sylp-engraved-wallet' THEN 'prod_blk_wl' END), gi."componentId"), gi."quantity"
FROM "GiftSetItem" gi JOIN "Product" base ON base."id" = gi."giftSetId" JOIN "Product" comp ON comp."id" = gi."componentId"
WHERE base."slug" = 'starter-pack-gift-set' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_gs')
ON CONFLICT DO NOTHING;

-- Southport Patriots
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_sth_hd','southport-patriots-hoodie','STH-HD','Southport Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),b."price",0,true,'/products/divisions/southport-patriots-hoodie.jpg',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-hoodie'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_hd','prod_sth_hd','/products/divisions/southport-patriots-hoodie.jpg','Southport Patriots Hoodie with the Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_sth_hd_' || v."id", 'prod_sth_hd', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'STH-HD-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-hoodie' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_hd_s','prod_sth_hd','S','S','STH-HD-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_hd_m','prod_sth_hd','M','M','STH-HD-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_hd_l','prod_sth_hd','L','L','STH-HD-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_hd_xl','prod_sth_hd','XL','XL','STH-HD-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_hd_xxl','prod_sth_hd','XXL','XXL','STH-HD-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-hoodie')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_sth_ts','southport-patriots-t-shirt','STH-TS','Southport Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),b."price",0,true,'/products/divisions/southport-patriots-t-shirt.jpg',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-t-shirt'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_ts','prod_sth_ts','/products/divisions/southport-patriots-t-shirt.jpg','Southport Patriots T Shirt with the Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_sth_ts_' || v."id", 'prod_sth_ts', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'STH-TS-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-t-shirt' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_ts_s','prod_sth_ts','S','S','STH-TS-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_ts_m','prod_sth_ts','M','M','STH-TS-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_ts_l','prod_sth_ts','L','L','STH-TS-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_ts_xl','prod_sth_ts','XL','XL','STH-TS-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_ts_xxl','prod_sth_ts','XXL','XXL','STH-TS-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-t-shirt')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_sth_kr','southport-patriots-keyring','STH-KR','Southport Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),b."price",0,true,'/brand/divisions/southport-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-keyring'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_kr','prod_sth_kr','/brand/divisions/southport-patriots.png','Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_kr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_sth_kr_' || v."id", 'prod_sth_kr', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'STH-KR-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-keyring' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_kr')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_sth_tr','southport-patriots-tracksuit','STH-TR','Southport Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),b."price",0,true,'/brand/divisions/southport-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-track-suit'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_tr','prod_sth_tr','/brand/divisions/southport-patriots.png','Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_tr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_sth_tr_' || v."id", 'prod_sth_tr', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'STH-TR-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-track-suit' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_tr')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_tr_s','prod_sth_tr','S','S','STH-TR-S',0,false,0
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_tr_m','prod_sth_tr','M','M','STH-TR-M',0,false,1
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_tr_l','prod_sth_tr','L','L','STH-TR-L',0,false,2
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_tr_xl','prod_sth_tr','XL','XL','STH-TR-XL',0,false,3
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_tr_xxl','prod_sth_tr','XXL','XXL','STH-TR-XXL',0,false,4
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_tr')
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId" WHERE b."slug" = 'sylp-track-suit')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_sth_mg','southport-patriots-mug','STH-MG','Southport Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),b."price",0,true,'/brand/divisions/southport-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-enamel-mug'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_mg','prod_sth_mg','/brand/divisions/southport-patriots.png','Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_mg')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_sth_mg_' || v."id", 'prod_sth_mg', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'STH-MG-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-enamel-mug' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_mg')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_sth_pc','southport-patriots-phone-case','STH-PC','Southport Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),b."price",0,true,'/brand/divisions/southport-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-phone-case'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_pc','prod_sth_pc','/brand/divisions/southport-patriots.png','Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_pc')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_sth_pc_' || v."id", 'prod_sth_pc', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'STH-PC-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-phone-case' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_pc')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_sth_wl','southport-patriots-wallet','STH-WL','Southport Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),b."price",0,true,'/brand/divisions/southport-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'sylp-engraved-wallet'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_wl','prod_sth_wl','/brand/divisions/southport-patriots.png','Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_wl')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_sth_wl_' || v."id", 'prod_sth_wl', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'STH-WL-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'sylp-engraved-wallet' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_wl')
ON CONFLICT DO NOTHING;
INSERT INTO "Product" ("id","slug","sku","name","status","divisionId","shortDescription","description","metaDescription","price","stockQuantity","madeToOrder","mainImage","updatedAt","productType","categoryId","salePrice","costPrice","saleActive","lowStockThreshold","continueSellingOOS","productionTimeDays","packagingProfileId","videoUrl","material","careInstructions","netWeightGrams","dimensions","safetyWarnings","supplierManufacturerDetails","featured","bestSeller","isNew","seasonal","giftable","giftPackagingAvailable","giftMessageEnabled")
SELECT 'prod_sth_gs','southport-patriots-gift-set','STH-GS','Southport Patriots' || ' ' || regexp_replace(b."name", '^\s*(Support Your Local Patriot|NorthWest Patriots|North West Patriots)\s*', '', 'i'),'ACTIVE',(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."description", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),regexp_replace(b."shortDescription", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'),b."price",0,true,'/brand/divisions/southport-patriots.png',CURRENT_TIMESTAMP,b."productType",b."categoryId",b."salePrice",b."costPrice",b."saleActive",b."lowStockThreshold",b."continueSellingOOS",b."productionTimeDays",b."packagingProfileId",b."videoUrl",b."material",b."careInstructions",b."netWeightGrams",b."dimensions",b."safetyWarnings",b."supplierManufacturerDetails",b."featured",b."bestSeller",b."isNew",b."seasonal",b."giftable",b."giftPackagingAvailable",b."giftMessageEnabled"
FROM "Product" b WHERE b."slug" = 'starter-pack-gift-set'
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_gs','prod_sth_gs','/brand/divisions/southport-patriots.png','Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_gs')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","colour","packSize","isGiftOption","sku","priceOverride","stockQuantity","isDefault","sortOrder","packagingProfileId")
SELECT 'var_prod_sth_gs_' || v."id", 'prod_sth_gs', regexp_replace(v."name", '(Support Your Local Patriot|NorthWest Patriots|North West Patriots)', 'Southport Patriots', 'gi'), v."size", v."colour", v."packSize", v."isGiftOption",
       'STH-GS-' || row_number() OVER (ORDER BY v."sortOrder", v."id"), v."priceOverride", 0, v."isDefault", v."sortOrder", v."packagingProfileId"
FROM "ProductVariant" v JOIN "Product" b ON b."id" = v."productId"
WHERE b."slug" = 'starter-pack-gift-set' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_gs')
ON CONFLICT DO NOTHING;
INSERT INTO "GiftSetItem" ("id","giftSetId","componentId","quantity")
SELECT 'gsi_prod_sth_gs_' || gi."id", 'prod_sth_gs',
       COALESCE((SELECT "id" FROM "Product" WHERE "id" = CASE comp."slug" WHEN 'sylp-hoodie' THEN 'prod_sth_hd' WHEN 'sylp-t-shirt' THEN 'prod_sth_ts' WHEN 'sylp-keyring' THEN 'prod_sth_kr' WHEN 'sylp-track-suit' THEN 'prod_sth_tr' WHEN 'sylp-enamel-mug' THEN 'prod_sth_mg' WHEN 'sylp-phone-case' THEN 'prod_sth_pc' WHEN 'sylp-engraved-wallet' THEN 'prod_sth_wl' END), gi."componentId"), gi."quantity"
FROM "GiftSetItem" gi JOIN "Product" base ON base."id" = gi."giftSetId" JOIN "Product" comp ON comp."id" = gi."componentId"
WHERE base."slug" = 'starter-pack-gift-set' AND EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_gs')
ON CONFLICT DO NOTHING;

