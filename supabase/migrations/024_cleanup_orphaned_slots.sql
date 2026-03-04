-- Remove orphaned availability slots (slots whose instructor no longer exists)
-- Run this if you have slots pointing to deleted instructors
DELETE FROM availability_slots
WHERE instructor_id NOT IN (SELECT id FROM instructors);
