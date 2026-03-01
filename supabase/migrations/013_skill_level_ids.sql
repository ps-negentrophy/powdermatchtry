-- Replace the single skill_level_id column with an array so instructors can
-- specify multiple skill levels per availability slot (consistent with all other
-- condition columns which are already UUID arrays).
ALTER TABLE availability_slots
  ADD COLUMN IF NOT EXISTS skill_level_ids UUID[] NOT NULL DEFAULT '{}';

-- Migrate existing data: wrap the existing single value into the new array.
UPDATE availability_slots
SET skill_level_ids = ARRAY[skill_level_id]
WHERE skill_level_id IS NOT NULL;
