-- When an instructor's auth account is deleted, delete the instructor row
-- (and cascade to availability_slots via existing ON DELETE CASCADE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'instructors_user_id_fkey'
      AND conrelid = 'public.instructors'::regclass
  ) THEN
    ALTER TABLE instructors
      ADD CONSTRAINT instructors_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
