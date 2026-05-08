-- Rename legacy slug to canonical short slug.
-- Safe to run multiple times.
UPDATE "Restaurant"
SET "slug" = 'la-placinte'
WHERE "slug" = 'la-placinte-stefan-cel-mare'
  AND NOT EXISTS (
    SELECT 1
    FROM "Restaurant" r2
    WHERE r2."slug" = 'la-placinte'
  );
