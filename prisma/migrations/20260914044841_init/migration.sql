-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "credits" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "job_type" TEXT NOT NULL,
    "prompt" TEXT,
    "negative_prompt" TEXT,
    "style" TEXT NOT NULL DEFAULT 'realistic',
    "resolution" TEXT NOT NULL DEFAULT 'standard',
    "dimensions" JSONB,
    "source_image_url" TEXT,
    "hf_model" TEXT,
    "internal_job_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "output_url" TEXT,
    "output_format" TEXT,
    "thumbnail_url" TEXT,
    "openscad_code" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_models" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "generation_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled Model',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "generation_id" TEXT,
    "event" TEXT NOT NULL,
    "ip_address" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "last_used" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "generations_user_id_idx" ON "generations"("user_id");

-- CreateIndex
CREATE INDEX "generations_status_idx" ON "generations"("status");

-- CreateIndex
CREATE INDEX "generations_created_at_idx" ON "generations"("created_at" DESC);

-- CreateIndex
CREATE INDEX "saved_models_user_id_idx" ON "saved_models"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_models_user_id_generation_id_key" ON "saved_models"("user_id", "generation_id");

-- CreateIndex
CREATE INDEX "usage_logs_user_id_idx" ON "usage_logs"("user_id");

-- CreateIndex
CREATE INDEX "usage_logs_event_idx" ON "usage_logs"("event");

-- CreateIndex
CREATE INDEX "usage_logs_created_at_idx" ON "usage_logs"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_models" ADD CONSTRAINT "saved_models_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_models" ADD CONSTRAINT "saved_models_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
