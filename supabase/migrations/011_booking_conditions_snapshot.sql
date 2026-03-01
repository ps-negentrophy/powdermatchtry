-- Snapshot the teaching conditions onto the booking row at creation time.
-- This means conditions survive even after the linked availability slot is
-- deleted/amended when the instructor accepts the booking.
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS booked_discipline_ids      UUID[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS booked_resort_ids          UUID[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS booked_language_ids        UUID[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS booked_skill_level_id      UUID    REFERENCES skill_levels(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS booked_improvement_area_ids UUID[] NOT NULL DEFAULT '{}';

-- Back-fill existing bookings that are still linked to a slot (pending requests)
UPDATE booking_requests br
SET
  booked_discipline_ids       = s.discipline_ids,
  booked_resort_ids           = s.resort_ids,
  booked_language_ids         = s.language_ids,
  booked_skill_level_id       = s.skill_level_id,
  booked_improvement_area_ids = s.improvement_area_ids
FROM availability_slots s
WHERE br.availability_slot_id = s.id;
