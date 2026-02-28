-- Link each booking request to the availability slot it was booked against.
-- ON DELETE SET NULL so deleting/amending a slot doesn't remove booking history.
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS availability_slot_id UUID REFERENCES availability_slots(id) ON DELETE SET NULL;
