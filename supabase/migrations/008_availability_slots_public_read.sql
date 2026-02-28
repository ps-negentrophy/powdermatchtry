-- Allow unauthenticated (anon) users to read availability slots
-- so the public "Find Instructor" page can filter by date.
CREATE POLICY "Public can read availability slots" ON availability_slots
  FOR SELECT USING (true);
