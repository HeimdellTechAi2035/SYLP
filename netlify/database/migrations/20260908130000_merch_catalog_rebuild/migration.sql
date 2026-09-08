-- Rebuilds the catalogue for a general merch line (apparel, drinkware,
-- accessories, stationery, homeware, gift sets) instead of candles/wax
-- melts. Drops the Fragrance model entirely and every candle/wax-melt/
-- fragrance-specific column that referenced it, in favour of generic
-- material/careInstructions fields on Product and the existing
-- size/colour/packSize fields on ProductVariant.
--
-- Dropping a column that carries a foreign key (Product.fragranceId,
-- ProductVariant.fragranceId) implicitly drops that FK constraint in
-- Postgres, so no explicit DROP CONSTRAINT is needed first.

-- Product: drop wax/candle/fragrance-specific columns
ALTER TABLE "Product"
  DROP COLUMN "fragranceId",
  DROP COLUMN "waxType",
  DROP COLUMN "wickType",
  DROP COLUMN "vesselInfo",
  DROP COLUMN "meltFormat",
  DROP COLUMN "piecesCount",
  DROP COLUMN "recommendedUsage",
  DROP COLUMN "storageGuidance",
  DROP COLUMN "candleWeightGrams",
  DROP COLUMN "vesselSize",
  DROP COLUMN "burnInstructions",
  DROP COLUMN "candleCare",
  DROP COLUMN "burnTimeHours",
  DROP COLUMN "firstBurnInstructions",
  DROP COLUMN "wickTrimmingGuidance",
  DROP COLUMN "maxBurnSessionHours",
  DROP COLUMN "allergenInfo",
  DROP COLUMN "clpInfo",
  DROP COLUMN "ingredientsInfo";

-- Product: add generic material/care fields, repoint the productType default
ALTER TABLE "Product"
  ADD COLUMN "material" TEXT,
  ADD COLUMN "careInstructions" TEXT;

ALTER TABLE "Product" ALTER COLUMN "productType" SET DEFAULT 'APPAREL';

-- ProductVariant: drop fragrance/vessel-specific columns
ALTER TABLE "ProductVariant"
  DROP COLUMN "fragranceId",
  DROP COLUMN "vesselStyle";

-- OrderItem: drop the fragrance snapshot field
ALTER TABLE "OrderItem" DROP COLUMN "fragranceName";

-- SiteSettings: repoint the business name default
ALTER TABLE "SiteSettings" ALTER COLUMN "businessName" SET DEFAULT 'Preston Patriot';

-- Fragrance is no longer referenced by anything — drop it last.
DROP TABLE "Fragrance";
