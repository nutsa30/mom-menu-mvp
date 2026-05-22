-- Step 1: Convert enum columns to plain text
ALTER TABLE "Child" ALTER COLUMN "ageGroup" TYPE text USING "ageGroup"::text;
ALTER TABLE "MealPlan" ALTER COLUMN "ageGroup" TYPE text USING "ageGroup"::text;
ALTER TABLE "Dish" ALTER COLUMN "ageGroups" TYPE text[] USING "ageGroups"::text[];

-- Step 2: Rename values in data
UPDATE "Child" SET "ageGroup" = CASE "ageGroup"
  WHEN 'BABY'      THEN 'FROM_6'
  WHEN 'TODDLER'   THEN 'FROM_9'
  WHEN 'PRESCHOOL' THEN 'FROM_24'
  ELSE 'FROM_24'
END;

UPDATE "MealPlan" SET "ageGroup" = CASE "ageGroup"
  WHEN 'BABY'      THEN 'FROM_6'
  WHEN 'TODDLER'   THEN 'FROM_9'
  WHEN 'PRESCHOOL' THEN 'FROM_24'
  ELSE 'FROM_24'
END;

UPDATE "Dish" SET "ageGroups" = ARRAY(
  SELECT CASE v
    WHEN 'BABY'      THEN 'FROM_6'
    WHEN 'TODDLER'   THEN 'FROM_9'
    WHEN 'PRESCHOOL' THEN 'FROM_24'
    ELSE 'FROM_24'
  END
  FROM unnest("ageGroups") AS v
);

-- Step 3: Drop old enum
DROP TYPE "AgeGroup";

-- Step 4: Create new enum with 4 open-ended age groups
CREATE TYPE "AgeGroup" AS ENUM ('FROM_6', 'FROM_9', 'FROM_12', 'FROM_24');

-- Step 5: Cast text columns back to new enum
ALTER TABLE "Child" ALTER COLUMN "ageGroup" TYPE "AgeGroup" USING "ageGroup"::"AgeGroup";
ALTER TABLE "MealPlan" ALTER COLUMN "ageGroup" TYPE "AgeGroup" USING "ageGroup"::"AgeGroup";
ALTER TABLE "Dish" ALTER COLUMN "ageGroups" TYPE "AgeGroup"[] USING "ageGroups"::"AgeGroup"[];
