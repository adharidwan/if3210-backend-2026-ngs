CREATE TABLE IF NOT EXISTS "livestream_sessions" (
  "stream_id" varchar(64) PRIMARY KEY NOT NULL,
  "family_id" integer NOT NULL REFERENCES "families"("id") ON DELETE cascade,
  "host_user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "host_display_name" varchar(255) NOT NULL,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "stopped_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_livestream_sessions_family_id_started_at" ON "livestream_sessions" USING btree ("family_id", "started_at" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "idx_livestream_sessions_family_id" ON "livestream_sessions" USING btree ("family_id");