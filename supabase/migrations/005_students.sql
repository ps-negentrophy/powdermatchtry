-- Students table: mirrors instructors pattern, stores student-specific data
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own record" ON students
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students update own record" ON students
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students insert own record" ON students
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger: create student record on signup when role = 'student'
CREATE OR REPLACE FUNCTION public.handle_new_student()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'student' THEN
    INSERT INTO public.students (user_id, display_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_student
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_student();

-- Backfill existing student users who signed up before this migration
INSERT INTO public.students (user_id, display_name)
SELECT p.id, p.display_name
FROM public.profiles p
WHERE p.role = 'student'
ON CONFLICT (user_id) DO NOTHING;
