-- Verification query for the avatar URL backfill.
-- Returns the number of remaining legacy Supabase avatar URLs in User.image.

SELECT COUNT(*) AS remaining_legacy_avatar_urls
FROM "User"
WHERE "image" ~ '^https://[^/]+/storage/v1/object/public/avatars/';
