-- Finish the rename: swap the old shop name for "NorthWest Patriots" in content
-- that lives in the database (homepage, policies, FAQs, site settings, "why shop"
-- features). Only text containing the old name is touched; everything stays
-- editable in Admin.

UPDATE "HomepageContent" SET
  "announcementBarText" = regexp_replace("announcementBarText", 'Support Your Local Patriot', 'NorthWest Patriots', 'gi'),
  "heroTitle"           = regexp_replace("heroTitle",           'Support Your Local Patriot', 'NorthWest Patriots', 'gi'),
  "heroSubtitle"        = regexp_replace("heroSubtitle",        'Support Your Local Patriot', 'NorthWest Patriots', 'gi'),
  "storyTitle"          = regexp_replace("storyTitle",          'Support Your Local Patriot', 'NorthWest Patriots', 'gi'),
  "storyBody"           = regexp_replace("storyBody",           'Support Your Local Patriot', 'NorthWest Patriots', 'gi'),
  "giftSectionTitle"    = regexp_replace("giftSectionTitle",    'Support Your Local Patriot', 'NorthWest Patriots', 'gi'),
  "giftSectionBody"     = regexp_replace("giftSectionBody",     'Support Your Local Patriot', 'NorthWest Patriots', 'gi');

-- Point the hero's "Shop Hoodies" button at the division picker instead.
UPDATE "HomepageContent" SET "heroCtaPrimaryLabel" = 'Choose your division', "heroCtaPrimaryHref" = '/#divisions'
WHERE "heroCtaPrimaryHref" IN ('/collections/hoodies', '/shop?category=hoodies');

UPDATE "Policy" SET "body" = regexp_replace(regexp_replace("body", 'Support Your Local Patriot \("SYLP"\)', 'NorthWest Patriots', 'g'), 'Support Your Local Patriot', 'NorthWest Patriots', 'gi')
WHERE "body" ~* 'Support Your Local Patriot';
UPDATE "Policy" SET "title" = regexp_replace("title", 'Support Your Local Patriot', 'NorthWest Patriots', 'gi') WHERE "title" ~* 'Support Your Local Patriot';

UPDATE "FaqItem" SET
  "question" = regexp_replace("question", 'Support Your Local Patriot', 'NorthWest Patriots', 'gi'),
  "answer"   = regexp_replace("answer",   'Support Your Local Patriot', 'NorthWest Patriots', 'gi')
WHERE "question" ~* 'Support Your Local Patriot' OR "answer" ~* 'Support Your Local Patriot';

UPDATE "HomepageFeature" SET
  "title" = regexp_replace("title", 'Support Your Local Patriot', 'NorthWest Patriots', 'gi'),
  "body"  = regexp_replace("body",  'Support Your Local Patriot', 'NorthWest Patriots', 'gi')
WHERE "title" ~* 'Support Your Local Patriot' OR "body" ~* 'Support Your Local Patriot';

UPDATE "SiteSettings" SET "businessName" = 'NorthWest Patriots' WHERE "businessName" ~* 'Support Your Local Patriot|Preston Patriot$';

-- The original SYLP-branded products are replaced by each division's own
-- version. Archive them (hidden from the shop, kept for past orders); any of
-- them can be switched back to Active in Admin -> Products.
UPDATE "Product" SET "status" = 'ARCHIVED', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" IN ('sylp-hoodie', 'sylp-t-shirt', 'sylp-keyring', 'sylp-track-suit', 'sylp-enamel-mug', 'sylp-phone-case', 'sylp-engraved-wallet', 'starter-pack-gift-set')
  AND "divisionId" IS NULL AND "status" = 'ACTIVE';
