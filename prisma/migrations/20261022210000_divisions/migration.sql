-- NorthWest Patriots divisions: each division has its own merch.

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Division_slug_key" ON "Division"("slug");

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "divisionId" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Starting divisions (editable afterwards in Admin -> Divisions)
INSERT INTO "Division" ("id", "slug", "name", "description", "sortOrder", "isActive", "updatedAt") VALUES
  ('div_preston',            'preston-patriots',            'Preston Patriots',            'Official merch for the Preston division.',            1, true, CURRENT_TIMESTAMP),
  ('div_merseyside',         'merseyside-patriots',         'Merseyside Patriots',         'Official merch for the Merseyside division.',         2, true, CURRENT_TIMESTAMP),
  ('div_greater_manchester', 'greater-manchester-patriots', 'Greater Manchester Patriots', 'Official merch for the Greater Manchester division.', 3, true, CURRENT_TIMESTAMP),
  ('div_blackpool',          'blackpool-patriots',          'Blackpool Patriots',          'Official merch for the Blackpool division.',          4, true, CURRENT_TIMESTAMP),
  ('div_southport',          'southport-patriots',          'Southport Patriots',          'Official merch for the Southport division.',          5, true, CURRENT_TIMESTAMP);
