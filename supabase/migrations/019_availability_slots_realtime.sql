-- Enable Realtime for availability_slots so the Find Instructor page
-- can sync when instructors add or delete slots
ALTER PUBLICATION supabase_realtime ADD TABLE availability_slots;
