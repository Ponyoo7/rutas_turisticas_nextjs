BEGIN;

ALTER TABLE users
DROP COLUMN IF EXISTS favorite_routes;

CREATE TABLE IF NOT EXISTS user_favorite_routes (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id integer NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, route_id)
);

CREATE INDEX IF NOT EXISTS user_favorite_routes_route_id_idx
  ON user_favorite_routes (route_id);

CREATE INDEX IF NOT EXISTS user_favorite_routes_user_id_created_at_idx
  ON user_favorite_routes (user_id, created_at DESC);

COMMIT;
