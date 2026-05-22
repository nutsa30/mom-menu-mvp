-- Migrate SCHOOL → PRESCHOOL in all existing data before dropping the enum value
UPDATE "Dish" SET "ageGroups" = array_replace("ageGroups", 'SCHOOL'::"AgeGroup", 'PRESCHOOL'::"AgeGroup");
UPDATE "Child" SET "ageGroup" = 'PRESCHOOL'::"AgeGroup" WHERE "ageGroup" = 'SCHOOL'::"AgeGroup";
UPDATE "MealPlan" SET "ageGroup" = 'PRESCHOOL'::"AgeGroup" WHERE "ageGroup" = 'SCHOOL'::"AgeGroup";

-- Recreate enum without SCHOOL value
CREATE TYPE "AgeGroup_new" AS ENUM ('BABY', 'TODDLER', 'PRESCHOOL');

ALTER TABLE "Child" ALTER COLUMN "ageGroup" TYPE "AgeGroup_new" USING "ageGroup"::text::"AgeGroup_new";
ALTER TABLE "MealPlan" ALTER COLUMN "ageGroup" TYPE "AgeGroup_new" USING "ageGroup"::text::"AgeGroup_new";
ALTER TABLE "Dish" ALTER COLUMN "ageGroups" TYPE "AgeGroup_new"[] USING "ageGroups"::text[]::"AgeGroup_new"[];

DROP TYPE "AgeGroup";
ALTER TYPE "AgeGroup_new" RENAME TO "AgeGroup";
