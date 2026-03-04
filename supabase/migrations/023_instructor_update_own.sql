-- Allow instructors to update their own row (e.g. sync certification from signup metadata)
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

-- Instructors can read and update their own row
CREATE POLICY "Instructors read own row" ON instructors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Instructors update own row" ON instructors
  FOR UPDATE USING (user_id = auth.uid());

-- Public read for Find Instructor page (anon key)
CREATE POLICY "Public can read active instructors" ON instructors
  FOR SELECT USING (is_active = true);
