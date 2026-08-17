CREATE TYPE "HttpMethod" AS ENUM ('GET', 'HEAD');
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'RESOLVED');

CREATE TABLE "users" (
  "id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "monitors" (
  "id" UUID NOT NULL,
  "project_id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "url" VARCHAR(2048) NOT NULL,
  "http_method" "HttpMethod" NOT NULL DEFAULT 'GET',
  "interval_seconds" INTEGER NOT NULL DEFAULT 60,
  "timeout_ms" INTEGER NOT NULL DEFAULT 5000,
  "expected_status_code" INTEGER NOT NULL DEFAULT 200,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "last_checked_at" TIMESTAMP(3),
  "next_check_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lease_expires_at" TIMESTAMP(3),
  "lease_owner" VARCHAR(100),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "check_results" (
  "id" UUID NOT NULL,
  "monitor_id" UUID NOT NULL,
  "status_code" INTEGER,
  "response_time_ms" INTEGER NOT NULL,
  "is_up" BOOLEAN NOT NULL,
  "error_type" VARCHAR(50),
  "error_message" VARCHAR(500),
  "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "check_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "incidents" (
  "id" UUID NOT NULL,
  "monitor_id" UUID NOT NULL,
  "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
  "failure_reason" VARCHAR(500) NOT NULL,
  "active_key" UUID,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMP(3),
  CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");
CREATE INDEX "monitors_project_id_idx" ON "monitors"("project_id");
CREATE INDEX "monitors_is_active_next_check_at_idx" ON "monitors"("is_active", "next_check_at");
CREATE INDEX "check_results_monitor_id_checked_at_idx" ON "check_results"("monitor_id", "checked_at" DESC);
CREATE UNIQUE INDEX "incidents_active_key_key" ON "incidents"("active_key");
CREATE INDEX "incidents_monitor_id_started_at_idx" ON "incidents"("monitor_id", "started_at" DESC);

ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "check_results" ADD CONSTRAINT "check_results_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
