-- Allow students to delete (cancel) their own pending booking requests.
-- Only pending requests can be cancelled; accepted/completed/declined ones are locked.
CREATE POLICY "Students can cancel own pending bookings" ON booking_requests
  FOR DELETE USING (
    student_id = auth.uid()
    AND status = 'pending'
  );
