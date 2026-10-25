-- Keep only the general location on public-facing policy pages.
UPDATE "Policy"
SET body = regexp_replace(
  regexp_replace(body, 'registered office[^.]*PR1[[:space:]]*9DJ', 'based in the Preston area', 'gi'),
  'Preston,[[:space:]]*PR1[[:space:]]*9DJ', 'Preston area', 'gi'
), "lastUpdated" = CURRENT_TIMESTAMP
WHERE body ~* 'PR1[[:space:]]*9DJ';
