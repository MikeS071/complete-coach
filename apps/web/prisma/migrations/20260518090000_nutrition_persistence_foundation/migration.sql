-- Nutrition persistence foundation for Ticket 015A.

CREATE TABLE "food_library_items" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT,
  "scope" "library_scope" NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "serving_size" TEXT NOT NULL,
  "calories" INTEGER NOT NULL,
  "protein_g" DECIMAL(8,2) NOT NULL,
  "carbs_g" DECIMAL(8,2) NOT NULL,
  "fat_g" DECIMAL(8,2) NOT NULL,
  "fiber_g" DECIMAL(8,2),
  "metadata" JSONB,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "food_library_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "food_scope_organization_consistency" CHECK (
    ("scope" = 'global' AND "organization_id" IS NULL) OR
    ("scope" = 'private' AND "organization_id" IS NOT NULL)
  )
);

CREATE INDEX "food_library_items_scope_idx" ON "food_library_items" ("scope");
CREATE INDEX "food_library_items_organization_id_name_idx" ON "food_library_items" ("organization_id", "name");
CREATE INDEX "food_library_items_organization_id_category_idx" ON "food_library_items" ("organization_id", "category");
CREATE INDEX "food_library_items_created_by_user_id_idx" ON "food_library_items" ("created_by_user_id");

ALTER TABLE "food_library_items" ADD CONSTRAINT "food_library_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_library_items" ADD CONSTRAINT "food_library_items_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
