-- Replace the single booked_skill_level_id with an array so multiple
-- skill levels (as stored in availability_slots.skill_level_ids) can be snapshotted.

ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS booked_skill_level_ids UUID[] NOT NULL DEFAULT '{}';

-- Back-fill: move any existing single value into the new array column.
UPDATE booking_requests
SET booked_skill_level_ids = ARRAY[booked_skill_level_id]
WHERE booked_skill_level_id IS NOT NULL
  AND array_length(booked_skill_level_ids, 1) IS NULL;
