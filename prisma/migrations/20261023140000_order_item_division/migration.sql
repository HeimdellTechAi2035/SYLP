-- Record which division each sold item belongs to, so every division's sales stay separate.
ALTER TABLE "OrderItem" ADD COLUMN "divisionId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "divisionName" TEXT;
CREATE INDEX "OrderItem_divisionId_idx" ON "OrderItem"("divisionId");

-- Fill in past sales from the product each item was for.
UPDATE "OrderItem" oi
SET "divisionId" = d."id", "divisionName" = d."name"
FROM "Product" p
JOIN "Division" d ON d."id" = p."divisionId"
WHERE oi."productId" = p."id" AND oi."divisionId" IS NULL;
