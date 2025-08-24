-- AlterTable
ALTER TABLE "public"."shop_schedules" DROP CONSTRAINT IF EXISTS "shop_schedules_shop_id_day_of_week_key";
ALTER TABLE "public"."shop_schedules" ADD COLUMN "block_order" INTEGER DEFAULT 1;

-- CreateIndex
DROP INDEX IF EXISTS "public"."idx_shop_schedules_shop_day";
CREATE INDEX "idx_shop_schedules_shop_day_block" ON "public"."shop_schedules"("shop_id", "day_of_week", "block_order");