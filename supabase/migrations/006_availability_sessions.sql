-- Add session (morning/afternoon/night) to instructor_availability
-- and change unique constraint from (instructor_id, date) to (instructor_id, date, session)

-- Drop the old unique constraint
ALTER TABLE instructor_availability
  DROP CONSTRAINT IF EXISTS instructor_availability_instructor_id_available_date_key;

-- Add session column (default existing rows to 'morning' to satisfy NOT NULL)
ALTER TABLE instructor_availability
  ADD COLUMN session TEXT NOT NULL DEFAULT 'morning'
  CHECK (session IN ('morning', 'afternoon', 'night'));

-- Add new unique constraint covering all three dimensions
ALTER TABLE instructor_availability
  ADD CONSTRAINT instructor_availability_instructor_date_session_key
  UNIQUE (instructor_id, available_date, session);
