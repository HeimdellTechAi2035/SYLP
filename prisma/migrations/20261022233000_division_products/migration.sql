-- Starter range: Hoodie, T-Shirt, Phone Case and Mug for every division.
-- Plain data rows, so everything (price, text, photos, sizes, status) is editable in Admin -> Products.
-- ON CONFLICT DO NOTHING keeps this safe if any of these already exist.

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_pre_hd','preston-patriots-hoodie','PRE-HD','Preston Patriots Hoodie','ACTIVE','APPAREL',(SELECT "id" FROM "Category" WHERE "slug" = 'hoodies'),(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),'Heavyweight hoodie with the Preston Patriots crest.','Soft fleece-lined hoodie printed with the official Preston Patriots crest. Printed and packed to order in the UK.',5500,0,true,5,'/brand/divisions/preston-patriots.png','80% cotton, 20% polyester fleece','Machine wash cold, inside out. Do not tumble dry or iron the print.',650,true,false,false,false,'Heavyweight hoodie with the Preston Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_hd','prod_pre_hd','/brand/divisions/preston-patriots.png','Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_hd_s','prod_pre_hd','S','S','PRE-HD-S',0,false,0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_hd_m','prod_pre_hd','M','M','PRE-HD-M',0,true,1 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_hd_l','prod_pre_hd','L','L','PRE-HD-L',0,false,2 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_hd_xl','prod_pre_hd','XL','XL','PRE-HD-XL',0,false,3 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_hd_xxl','prod_pre_hd','XXL','XXL','PRE-HD-XXL',0,false,4 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_hd')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_pre_ts','preston-patriots-t-shirt','PRE-TS','Preston Patriots T-Shirt','ACTIVE','APPAREL',(SELECT "id" FROM "Category" WHERE "slug" = 't-shirts'),(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),'Everyday tee with the Preston Patriots crest.','Classic-fit cotton t-shirt printed with the official Preston Patriots crest. Printed and packed to order in the UK.',2499,0,true,5,'/brand/divisions/preston-patriots.png','100% ringspun cotton','Machine wash cold, inside out. Do not tumble dry.',200,false,false,true,false,'Everyday tee with the Preston Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_ts','prod_pre_ts','/brand/divisions/preston-patriots.png','Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_ts_s','prod_pre_ts','S','S','PRE-TS-S',0,false,0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_ts_m','prod_pre_ts','M','M','PRE-TS-M',0,true,1 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_ts_l','prod_pre_ts','L','L','PRE-TS-L',0,false,2 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_ts_xl','prod_pre_ts','XL','XL','PRE-TS-XL',0,false,3 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_pre_ts_xxl','prod_pre_ts','XXL','XXL','PRE-TS-XXL',0,false,4 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_ts')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_pre_pc','preston-patriots-phone-case','PRE-PC','Preston Patriots Phone Case','ACTIVE','ACCESSORY',(SELECT "id" FROM "Category" WHERE "slug" = 'phone-cases'),(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),'Protective phone case with the Preston Patriots crest.','Slim, shockproof case printed with the official Preston Patriots crest. Tell us your phone model in the order notes at checkout.',1500,0,true,5,'/brand/divisions/preston-patriots.png','Shockproof TPU and polycarbonate',NULL,60,false,false,false,false,'Protective phone case with the Preston Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_pc','prod_pre_pc','/brand/divisions/preston-patriots.png','Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_pc')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_pre_mg','preston-patriots-mug','PRE-MG','Preston Patriots Mug','ACTIVE','DRINKWARE',(SELECT "id" FROM "Category" WHERE "slug" = 'cups'),(SELECT "id" FROM "Division" WHERE "slug" = 'preston-patriots'),'Enamel mug with the Preston Patriots crest.','Durable enamel-coated steel mug printed with the official Preston Patriots crest. Ideal for camping, the brew room or the march.',1200,0,true,5,'/brand/divisions/preston-patriots.png','Enamel-coated steel','Hand wash only — not microwave or dishwasher safe.',350,false,false,false,true,'Enamel mug with the Preston Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_pre_mg','prod_pre_mg','/brand/divisions/preston-patriots.png','Preston Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_pre_mg')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_mer_hd','merseyside-patriots-hoodie','MER-HD','Merseyside Patriots Hoodie','ACTIVE','APPAREL',(SELECT "id" FROM "Category" WHERE "slug" = 'hoodies'),(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),'Heavyweight hoodie with the Merseyside Patriots crest.','Soft fleece-lined hoodie printed with the official Merseyside Patriots crest. Printed and packed to order in the UK.',5500,0,true,5,'/brand/divisions/merseyside-patriots.png','80% cotton, 20% polyester fleece','Machine wash cold, inside out. Do not tumble dry or iron the print.',650,true,false,false,false,'Heavyweight hoodie with the Merseyside Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_hd','prod_mer_hd','/brand/divisions/merseyside-patriots.png','Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_hd_s','prod_mer_hd','S','S','MER-HD-S',0,false,0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_hd_m','prod_mer_hd','M','M','MER-HD-M',0,true,1 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_hd_l','prod_mer_hd','L','L','MER-HD-L',0,false,2 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_hd_xl','prod_mer_hd','XL','XL','MER-HD-XL',0,false,3 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_hd_xxl','prod_mer_hd','XXL','XXL','MER-HD-XXL',0,false,4 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_hd')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_mer_ts','merseyside-patriots-t-shirt','MER-TS','Merseyside Patriots T-Shirt','ACTIVE','APPAREL',(SELECT "id" FROM "Category" WHERE "slug" = 't-shirts'),(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),'Everyday tee with the Merseyside Patriots crest.','Classic-fit cotton t-shirt printed with the official Merseyside Patriots crest. Printed and packed to order in the UK.',2499,0,true,5,'/brand/divisions/merseyside-patriots.png','100% ringspun cotton','Machine wash cold, inside out. Do not tumble dry.',200,false,false,true,false,'Everyday tee with the Merseyside Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_ts','prod_mer_ts','/brand/divisions/merseyside-patriots.png','Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_ts_s','prod_mer_ts','S','S','MER-TS-S',0,false,0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_ts_m','prod_mer_ts','M','M','MER-TS-M',0,true,1 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_ts_l','prod_mer_ts','L','L','MER-TS-L',0,false,2 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_ts_xl','prod_mer_ts','XL','XL','MER-TS-XL',0,false,3 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_mer_ts_xxl','prod_mer_ts','XXL','XXL','MER-TS-XXL',0,false,4 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_ts')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_mer_pc','merseyside-patriots-phone-case','MER-PC','Merseyside Patriots Phone Case','ACTIVE','ACCESSORY',(SELECT "id" FROM "Category" WHERE "slug" = 'phone-cases'),(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),'Protective phone case with the Merseyside Patriots crest.','Slim, shockproof case printed with the official Merseyside Patriots crest. Tell us your phone model in the order notes at checkout.',1500,0,true,5,'/brand/divisions/merseyside-patriots.png','Shockproof TPU and polycarbonate',NULL,60,false,false,false,false,'Protective phone case with the Merseyside Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_pc','prod_mer_pc','/brand/divisions/merseyside-patriots.png','Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_pc')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_mer_mg','merseyside-patriots-mug','MER-MG','Merseyside Patriots Mug','ACTIVE','DRINKWARE',(SELECT "id" FROM "Category" WHERE "slug" = 'cups'),(SELECT "id" FROM "Division" WHERE "slug" = 'merseyside-patriots'),'Enamel mug with the Merseyside Patriots crest.','Durable enamel-coated steel mug printed with the official Merseyside Patriots crest. Ideal for camping, the brew room or the march.',1200,0,true,5,'/brand/divisions/merseyside-patriots.png','Enamel-coated steel','Hand wash only — not microwave or dishwasher safe.',350,false,false,false,true,'Enamel mug with the Merseyside Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_mer_mg','prod_mer_mg','/brand/divisions/merseyside-patriots.png','Merseyside Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_mer_mg')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_gmr_hd','greater-manchester-patriots-hoodie','GMR-HD','Greater Manchester Patriots Hoodie','ACTIVE','APPAREL',(SELECT "id" FROM "Category" WHERE "slug" = 'hoodies'),(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),'Heavyweight hoodie with the Greater Manchester Patriots crest.','Soft fleece-lined hoodie printed with the official Greater Manchester Patriots crest. Printed and packed to order in the UK.',5500,0,true,5,'/brand/divisions/greater-manchester-patriots.png','80% cotton, 20% polyester fleece','Machine wash cold, inside out. Do not tumble dry or iron the print.',650,true,false,false,false,'Heavyweight hoodie with the Greater Manchester Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_hd','prod_gmr_hd','/brand/divisions/greater-manchester-patriots.png','Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_hd_s','prod_gmr_hd','S','S','GMR-HD-S',0,false,0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_hd_m','prod_gmr_hd','M','M','GMR-HD-M',0,true,1 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_hd_l','prod_gmr_hd','L','L','GMR-HD-L',0,false,2 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_hd_xl','prod_gmr_hd','XL','XL','GMR-HD-XL',0,false,3 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_hd_xxl','prod_gmr_hd','XXL','XXL','GMR-HD-XXL',0,false,4 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_hd')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_gmr_ts','greater-manchester-patriots-t-shirt','GMR-TS','Greater Manchester Patriots T-Shirt','ACTIVE','APPAREL',(SELECT "id" FROM "Category" WHERE "slug" = 't-shirts'),(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),'Everyday tee with the Greater Manchester Patriots crest.','Classic-fit cotton t-shirt printed with the official Greater Manchester Patriots crest. Printed and packed to order in the UK.',2499,0,true,5,'/brand/divisions/greater-manchester-patriots.png','100% ringspun cotton','Machine wash cold, inside out. Do not tumble dry.',200,false,false,true,false,'Everyday tee with the Greater Manchester Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_ts','prod_gmr_ts','/brand/divisions/greater-manchester-patriots.png','Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_ts_s','prod_gmr_ts','S','S','GMR-TS-S',0,false,0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_ts_m','prod_gmr_ts','M','M','GMR-TS-M',0,true,1 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_ts_l','prod_gmr_ts','L','L','GMR-TS-L',0,false,2 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_ts_xl','prod_gmr_ts','XL','XL','GMR-TS-XL',0,false,3 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_gmr_ts_xxl','prod_gmr_ts','XXL','XXL','GMR-TS-XXL',0,false,4 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_ts')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_gmr_pc','greater-manchester-patriots-phone-case','GMR-PC','Greater Manchester Patriots Phone Case','ACTIVE','ACCESSORY',(SELECT "id" FROM "Category" WHERE "slug" = 'phone-cases'),(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),'Protective phone case with the Greater Manchester Patriots crest.','Slim, shockproof case printed with the official Greater Manchester Patriots crest. Tell us your phone model in the order notes at checkout.',1500,0,true,5,'/brand/divisions/greater-manchester-patriots.png','Shockproof TPU and polycarbonate',NULL,60,false,false,false,false,'Protective phone case with the Greater Manchester Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_pc','prod_gmr_pc','/brand/divisions/greater-manchester-patriots.png','Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_pc')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_gmr_mg','greater-manchester-patriots-mug','GMR-MG','Greater Manchester Patriots Mug','ACTIVE','DRINKWARE',(SELECT "id" FROM "Category" WHERE "slug" = 'cups'),(SELECT "id" FROM "Division" WHERE "slug" = 'greater-manchester-patriots'),'Enamel mug with the Greater Manchester Patriots crest.','Durable enamel-coated steel mug printed with the official Greater Manchester Patriots crest. Ideal for camping, the brew room or the march.',1200,0,true,5,'/brand/divisions/greater-manchester-patriots.png','Enamel-coated steel','Hand wash only — not microwave or dishwasher safe.',350,false,false,false,true,'Enamel mug with the Greater Manchester Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_gmr_mg','prod_gmr_mg','/brand/divisions/greater-manchester-patriots.png','Greater Manchester Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_gmr_mg')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_blk_hd','blackpool-patriots-hoodie','BLK-HD','Blackpool Patriots Hoodie','ACTIVE','APPAREL',(SELECT "id" FROM "Category" WHERE "slug" = 'hoodies'),(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),'Heavyweight hoodie with the Blackpool Patriots crest.','Soft fleece-lined hoodie printed with the official Blackpool Patriots crest. Printed and packed to order in the UK.',5500,0,true,5,'/brand/divisions/blackpool-patriots.png','80% cotton, 20% polyester fleece','Machine wash cold, inside out. Do not tumble dry or iron the print.',650,true,false,false,false,'Heavyweight hoodie with the Blackpool Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_hd','prod_blk_hd','/brand/divisions/blackpool-patriots.png','Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_hd_s','prod_blk_hd','S','S','BLK-HD-S',0,false,0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_hd_m','prod_blk_hd','M','M','BLK-HD-M',0,true,1 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_hd_l','prod_blk_hd','L','L','BLK-HD-L',0,false,2 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_hd_xl','prod_blk_hd','XL','XL','BLK-HD-XL',0,false,3 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_hd_xxl','prod_blk_hd','XXL','XXL','BLK-HD-XXL',0,false,4 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_hd')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_blk_ts','blackpool-patriots-t-shirt','BLK-TS','Blackpool Patriots T-Shirt','ACTIVE','APPAREL',(SELECT "id" FROM "Category" WHERE "slug" = 't-shirts'),(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),'Everyday tee with the Blackpool Patriots crest.','Classic-fit cotton t-shirt printed with the official Blackpool Patriots crest. Printed and packed to order in the UK.',2499,0,true,5,'/brand/divisions/blackpool-patriots.png','100% ringspun cotton','Machine wash cold, inside out. Do not tumble dry.',200,false,false,true,false,'Everyday tee with the Blackpool Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_ts','prod_blk_ts','/brand/divisions/blackpool-patriots.png','Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_ts_s','prod_blk_ts','S','S','BLK-TS-S',0,false,0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_ts_m','prod_blk_ts','M','M','BLK-TS-M',0,true,1 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_ts_l','prod_blk_ts','L','L','BLK-TS-L',0,false,2 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_ts_xl','prod_blk_ts','XL','XL','BLK-TS-XL',0,false,3 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_blk_ts_xxl','prod_blk_ts','XXL','XXL','BLK-TS-XXL',0,false,4 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_ts')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_blk_pc','blackpool-patriots-phone-case','BLK-PC','Blackpool Patriots Phone Case','ACTIVE','ACCESSORY',(SELECT "id" FROM "Category" WHERE "slug" = 'phone-cases'),(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),'Protective phone case with the Blackpool Patriots crest.','Slim, shockproof case printed with the official Blackpool Patriots crest. Tell us your phone model in the order notes at checkout.',1500,0,true,5,'/brand/divisions/blackpool-patriots.png','Shockproof TPU and polycarbonate',NULL,60,false,false,false,false,'Protective phone case with the Blackpool Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_pc','prod_blk_pc','/brand/divisions/blackpool-patriots.png','Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_pc')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_blk_mg','blackpool-patriots-mug','BLK-MG','Blackpool Patriots Mug','ACTIVE','DRINKWARE',(SELECT "id" FROM "Category" WHERE "slug" = 'cups'),(SELECT "id" FROM "Division" WHERE "slug" = 'blackpool-patriots'),'Enamel mug with the Blackpool Patriots crest.','Durable enamel-coated steel mug printed with the official Blackpool Patriots crest. Ideal for camping, the brew room or the march.',1200,0,true,5,'/brand/divisions/blackpool-patriots.png','Enamel-coated steel','Hand wash only — not microwave or dishwasher safe.',350,false,false,false,true,'Enamel mug with the Blackpool Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_blk_mg','prod_blk_mg','/brand/divisions/blackpool-patriots.png','Blackpool Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_blk_mg')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_sth_hd','southport-patriots-hoodie','STH-HD','Southport Patriots Hoodie','ACTIVE','APPAREL',(SELECT "id" FROM "Category" WHERE "slug" = 'hoodies'),(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),'Heavyweight hoodie with the Southport Patriots crest.','Soft fleece-lined hoodie printed with the official Southport Patriots crest. Printed and packed to order in the UK.',5500,0,true,5,'/brand/divisions/southport-patriots.png','80% cotton, 20% polyester fleece','Machine wash cold, inside out. Do not tumble dry or iron the print.',650,true,false,false,false,'Heavyweight hoodie with the Southport Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_hd','prod_sth_hd','/brand/divisions/southport-patriots.png','Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_hd_s','prod_sth_hd','S','S','STH-HD-S',0,false,0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_hd_m','prod_sth_hd','M','M','STH-HD-M',0,true,1 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_hd_l','prod_sth_hd','L','L','STH-HD-L',0,false,2 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_hd_xl','prod_sth_hd','XL','XL','STH-HD-XL',0,false,3 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_hd_xxl','prod_sth_hd','XXL','XXL','STH-HD-XXL',0,false,4 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_hd')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_sth_ts','southport-patriots-t-shirt','STH-TS','Southport Patriots T-Shirt','ACTIVE','APPAREL',(SELECT "id" FROM "Category" WHERE "slug" = 't-shirts'),(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),'Everyday tee with the Southport Patriots crest.','Classic-fit cotton t-shirt printed with the official Southport Patriots crest. Printed and packed to order in the UK.',2499,0,true,5,'/brand/divisions/southport-patriots.png','100% ringspun cotton','Machine wash cold, inside out. Do not tumble dry.',200,false,false,true,false,'Everyday tee with the Southport Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_ts','prod_sth_ts','/brand/divisions/southport-patriots.png','Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_ts_s','prod_sth_ts','S','S','STH-TS-S',0,false,0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_ts_m','prod_sth_ts','M','M','STH-TS-M',0,true,1 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_ts_l','prod_sth_ts','L','L','STH-TS-L',0,false,2 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_ts_xl','prod_sth_ts','XL','XL','STH-TS-XL',0,false,3 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
ON CONFLICT DO NOTHING;
INSERT INTO "ProductVariant" ("id","productId","name","size","sku","stockQuantity","isDefault","sortOrder")
SELECT 'var_prod_sth_ts_xxl','prod_sth_ts','XXL','XXL','STH-TS-XXL',0,false,4 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_ts')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_sth_pc','southport-patriots-phone-case','STH-PC','Southport Patriots Phone Case','ACTIVE','ACCESSORY',(SELECT "id" FROM "Category" WHERE "slug" = 'phone-cases'),(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),'Protective phone case with the Southport Patriots crest.','Slim, shockproof case printed with the official Southport Patriots crest. Tell us your phone model in the order notes at checkout.',1500,0,true,5,'/brand/divisions/southport-patriots.png','Shockproof TPU and polycarbonate',NULL,60,false,false,false,false,'Protective phone case with the Southport Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_pc','prod_sth_pc','/brand/divisions/southport-patriots.png','Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_pc')
ON CONFLICT DO NOTHING;

INSERT INTO "Product" ("id","slug","sku","name","status","productType","categoryId","divisionId","shortDescription","description","price","stockQuantity","madeToOrder","productionTimeDays","mainImage","material","careInstructions","netWeightGrams","featured","bestSeller","isNew","giftable","metaDescription","updatedAt")
VALUES ('prod_sth_mg','southport-patriots-mug','STH-MG','Southport Patriots Mug','ACTIVE','DRINKWARE',(SELECT "id" FROM "Category" WHERE "slug" = 'cups'),(SELECT "id" FROM "Division" WHERE "slug" = 'southport-patriots'),'Enamel mug with the Southport Patriots crest.','Durable enamel-coated steel mug printed with the official Southport Patriots crest. Ideal for camping, the brew room or the march.',1200,0,true,5,'/brand/divisions/southport-patriots.png','Enamel-coated steel','Hand wash only — not microwave or dishwasher safe.',350,false,false,false,true,'Enamel mug with the Southport Patriots crest.',CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
INSERT INTO "ProductImage" ("id","productId","url","altText","sortOrder")
SELECT 'img_prod_sth_mg','prod_sth_mg','/brand/divisions/southport-patriots.png','Southport Patriots crest',0 WHERE EXISTS (SELECT 1 FROM "Product" WHERE "id" = 'prod_sth_mg')
ON CONFLICT DO NOTHING;

