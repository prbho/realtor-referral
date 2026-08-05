-- Backfill legacy Supabase avatar URLs to the new R2 public domain.
-- Run this after the R2 bucket is serving the uploaded files.
-- Preview affected rows first if needed:
-- SELECT id, image FROM "User" WHERE image ~ '^https://[^/]+/storage/v1/object/public/avatars/';

UPDATE "User"
SET "image" = regexp_replace(
	"image",
	'^https://[^/]+/storage/v1/object/public/avatars/',
	'https://bucket.regalpdc.com/realtor-referral/avatars/'
)
WHERE "image" ~ '^https://[^/]+/storage/v1/object/public/avatars/';
