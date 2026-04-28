ALTER TABLE routes
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS route_images (
  id BIGSERIAL PRIMARY KEY,
  route_id BIGINT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'pending',
  selected_for_cover BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

UPDATE routes
SET description = COALESCE(description, '');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'routes' AND column_name = 'pending_image'
  ) THEN
    INSERT INTO route_images (route_id, image, review_status, selected_for_cover)
    SELECT
      id,
      pending_image,
      CASE
        WHEN image_review_status IN ('approved', 'pending', 'rejected')
          THEN image_review_status
        ELSE 'pending'
      END,
      TRUE
    FROM routes
    WHERE pending_image IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM route_images
        WHERE route_images.route_id = routes.id
          AND route_images.image = routes.pending_image
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'route_images_review_status_check'
  ) THEN
    ALTER TABLE route_images
      ADD CONSTRAINT route_images_review_status_check
      CHECK (review_status IN ('approved', 'pending', 'rejected'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS route_images_route_id_idx
  ON route_images (route_id);

CREATE INDEX IF NOT EXISTS route_images_review_status_idx
  ON route_images (review_status);

CREATE UNIQUE INDEX IF NOT EXISTS route_images_single_cover_candidate_idx
  ON route_images (route_id)
  WHERE selected_for_cover = TRUE;

ALTER TABLE routes
  DROP COLUMN IF EXISTS pending_image;

ALTER TABLE routes
  DROP COLUMN IF EXISTS image_review_status;
