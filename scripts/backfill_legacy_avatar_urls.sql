-- One-off backfill for legacy Supabase avatar URLs.
-- Run this once against the production database after R2 is serving the avatar files.
-- Preview the affected rows first if needed:
-- SELECT id, image FROM "User" WHERE image ~ '^https://[^/]+/storage/v1/object/public/avatars/';

BEGIN;

UPDATE "User"
SET "image" = regexp_replace(
  "image",
  '^https://[^/]+/storage/v1/object/public/avatars/',
  'https://bucket.regalpdc.com/realtor-referral/avatars/'
)
WHERE "image" ~ '^https://[^/]+/storage/v1/object/public/avatars/';

COMMIT;
