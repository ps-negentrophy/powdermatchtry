-- Add end_date to booking_requests to support date-range lesson requests.
-- Existing rows keep their requested_date as both start and end.
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS end_date DATE;
UPDATE booking_requests SET end_date = requested_date WHERE end_date IS NULL;
