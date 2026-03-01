-- Allow any authenticated user to read any profile row.
-- display_name is public-facing (shown to instructors on booking cards, etc.)
-- The existing "Users can update own profile" policy still restricts writes.
CREATE POLICY "Authenticated users can read any profile"
  ON profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');
