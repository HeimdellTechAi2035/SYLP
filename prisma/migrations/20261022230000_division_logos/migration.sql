-- Give each division its official logo (only where one hasn't been set in Admin).
UPDATE "Division" SET "image" = '/brand/divisions/preston-patriots.png',            "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'preston-patriots'            AND "image" IS NULL;
UPDATE "Division" SET "image" = '/brand/divisions/merseyside-patriots.png',         "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'merseyside-patriots'         AND "image" IS NULL;
UPDATE "Division" SET "image" = '/brand/divisions/greater-manchester-patriots.png', "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'greater-manchester-patriots' AND "image" IS NULL;
UPDATE "Division" SET "image" = '/brand/divisions/blackpool-patriots.png',          "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'blackpool-patriots'          AND "image" IS NULL;
UPDATE "Division" SET "image" = '/brand/divisions/southport-patriots.png',          "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'southport-patriots'          AND "image" IS NULL;
