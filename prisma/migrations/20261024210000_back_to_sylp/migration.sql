-- Back to Support Your Local Patriot (SYLP): one shop, no divisions for now.
-- Divisions are switched off and their products taken off sale. Nothing is
-- deleted, so past orders and each division's sales history stay intact, and
-- any of it can be switched back on in Admin.

UPDATE "Division" SET "isActive" = false, "updatedAt" = CURRENT_TIMESTAMP WHERE "isActive" = true;

UPDATE "Product" SET "status" = 'ARCHIVED', "updatedAt" = CURRENT_TIMESTAMP
WHERE "divisionId" IS NOT NULL AND "status" <> 'ARCHIVED';

-- Policies: the business name, then the lines that described divisions.
UPDATE "Policy" SET "body" = replace("body", 'NorthWest Patriots is a trading name of', 'Support Your Local Patriot ("SYLP") is a trading name of')
WHERE "body" LIKE '%NorthWest Patriots is a trading name of%';
UPDATE "Policy" SET "body" = replace("body",
  'We sell merchandise for the NorthWest Patriots divisions (Preston, Merseyside, Greater Manchester, Blackpool and Southport). Each division has its own range carrying its crest.',
  'We sell Support Your Local Patriot (SYLP) apparel, accessories and gifts.');
UPDATE "Policy" SET "body" = replace("body", 'including items that are printed or made to order with a division''s crest', 'including items that are printed or made to order');
UPDATE "Policy" SET "body" = replace("body", 'This includes our division ranges, even though they''re made to order.', 'This includes items that are made to order.');
UPDATE "Policy" SET "body" = replace("body", 'Division crests and some product photos contain text', 'Our logo and some product photos contain text');
UPDATE "Policy" SET
  "body"  = regexp_replace("body",  'North ?West Patriots', 'Support Your Local Patriot', 'gi'),
  "title" = regexp_replace("title", 'North ?West Patriots', 'Support Your Local Patriot', 'gi'),
  "lastUpdated" = CURRENT_TIMESTAMP
WHERE "body" ~* 'North ?West Patriots' OR "title" ~* 'North ?West Patriots' OR "body" LIKE '%Support Your Local Patriot ("SYLP")%';

UPDATE "HomepageContent" SET
  "announcementBarText" = regexp_replace("announcementBarText", 'North ?West Patriots', 'Support Your Local Patriot', 'gi'),
  "heroTitle"           = regexp_replace("heroTitle",           'North ?West Patriots', 'Support Your Local Patriot', 'gi'),
  "heroSubtitle"        = regexp_replace("heroSubtitle",        'North ?West Patriots', 'Support Your Local Patriot', 'gi'),
  "storyTitle"          = regexp_replace("storyTitle",          'North ?West Patriots', 'Support Your Local Patriot', 'gi'),
  "storyBody"           = regexp_replace("storyBody",           'North ?West Patriots', 'Support Your Local Patriot', 'gi'),
  "giftSectionTitle"    = regexp_replace("giftSectionTitle",    'North ?West Patriots', 'Support Your Local Patriot', 'gi'),
  "giftSectionBody"     = regexp_replace("giftSectionBody",     'North ?West Patriots', 'Support Your Local Patriot', 'gi');

-- The hero button pointed at the division boxes; point it at the shop again.
UPDATE "HomepageContent" SET "heroCtaPrimaryLabel" = 'Shop now', "heroCtaPrimaryHref" = '/shop'
WHERE "heroCtaPrimaryHref" = '/#divisions';

UPDATE "FaqItem" SET
  "question" = regexp_replace("question", 'North ?West Patriots', 'Support Your Local Patriot', 'gi'),
  "answer"   = regexp_replace("answer",   'North ?West Patriots', 'Support Your Local Patriot', 'gi')
WHERE "question" ~* 'North ?West Patriots' OR "answer" ~* 'North ?West Patriots';

UPDATE "HomepageFeature" SET
  "title" = regexp_replace("title", 'North ?West Patriots', 'Support Your Local Patriot', 'gi'),
  "body"  = regexp_replace("body",  'North ?West Patriots', 'Support Your Local Patriot', 'gi')
WHERE "title" ~* 'North ?West Patriots' OR "body" ~* 'North ?West Patriots';

UPDATE "SiteSettings" SET "businessName" = 'Support Your Local Patriot' WHERE "businessName" ~* 'North ?West Patriots';
