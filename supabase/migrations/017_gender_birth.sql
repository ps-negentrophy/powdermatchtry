-- Add gender and birth year/month to students
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS gender       TEXT CHECK (gender IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS birth_year   INTEGER,
  ADD COLUMN IF NOT EXISTS birth_month  INTEGER;

-- Add gender and birth year/month to instructors
ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS gender       TEXT CHECK (gender IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS birth_year   INTEGER,
  ADD COLUMN IF NOT EXISTS birth_month  INTEGER;

-- Update student auto-create trigger to capture gender and birth fields from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_student()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'student' THEN
    INSERT INTO public.students (user_id, display_name, gender, birth_year, birth_month)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      NULLIF(NEW.raw_user_meta_data->>'gender', ''),
      NULLIF(NEW.raw_user_meta_data->>'birth_year',  '')::INTEGER,
      NULLIF(NEW.raw_user_meta_data->>'birth_month', '')::INTEGER
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update instructor auto-create trigger to capture gender and birth fields from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_instructor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'instructor' THEN
    INSERT INTO public.instructors (user_id, display_name, gender, birth_year, birth_month)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      NULLIF(NEW.raw_user_meta_data->>'gender', ''),
      NULLIF(NEW.raw_user_meta_data->>'birth_year',  '')::INTEGER,
      NULLIF(NEW.raw_user_meta_data->>'birth_month', '')::INTEGER
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
