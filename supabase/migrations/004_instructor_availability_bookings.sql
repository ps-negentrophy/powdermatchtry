-- Create instructor record when user signs up as instructor
CREATE OR REPLACE FUNCTION public.handle_new_instructor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'instructor' THEN
    INSERT INTO public.instructors (user_id, display_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_instructor
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_instructor();

-- Instructor availability: dates when instructor can teach
CREATE TABLE instructor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instructor_id, available_date)
);

CREATE INDEX idx_instructor_availability_instructor ON instructor_availability(instructor_id);
CREATE INDEX idx_instructor_availability_date ON instructor_availability(available_date);

-- Booking requests: student requests a lesson from instructor
CREATE TABLE booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  requested_time_slot TEXT, -- e.g. "09:00-10:00" or "morning"
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_booking_requests_instructor ON booking_requests(instructor_id);
CREATE INDEX idx_booking_requests_student ON booking_requests(student_id);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_booking_requests_date ON booking_requests(requested_date);

-- RLS
ALTER TABLE instructor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Instructor can manage own availability
CREATE POLICY "Instructors manage own availability" ON instructor_availability
  FOR ALL USING (
    instructor_id IN (SELECT id FROM instructors WHERE user_id = auth.uid())
  );

-- Instructors can read their booking requests
CREATE POLICY "Instructors read own bookings" ON booking_requests
  FOR SELECT USING (
    instructor_id IN (SELECT id FROM instructors WHERE user_id = auth.uid())
  );

-- Instructors can update (accept/decline/complete) their booking requests
CREATE POLICY "Instructors update own bookings" ON booking_requests
  FOR UPDATE USING (
    instructor_id IN (SELECT id FROM instructors WHERE user_id = auth.uid())
  );

-- Students can read their own booking requests
CREATE POLICY "Students read own bookings" ON booking_requests
  FOR SELECT USING (student_id = auth.uid());

-- Students can create booking requests for themselves
CREATE POLICY "Students create own booking requests" ON booking_requests
  FOR INSERT WITH CHECK (auth.uid() = student_id);
