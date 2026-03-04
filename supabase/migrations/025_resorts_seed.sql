-- Replace resorts with new list for Find Instructor and Instructor Dashboard lesson conditions
-- Clear resort_ids in availability_slots (old UUIDs will be invalid after resort replacement)
UPDATE availability_slots SET resort_ids = '{}';

-- Clear instructor_resorts (will be repopulated when instructors update their conditions)
DELETE FROM instructor_resorts;

-- Replace all resorts
DELETE FROM resorts;

-- Insert new resort options
INSERT INTO resorts (id, slug, name_en, name_zh, name_ja, is_active, display_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'niseko-grand-hirafu', 'Niseko Grand Hirafu', NULL, NULL, true, 0),
  ('a1000000-0000-0000-0000-000000000002', 'niseko-hanazono', 'Niseko Hanazono', NULL, NULL, true, 1),
  ('a1000000-0000-0000-0000-000000000003', 'niseko-village', 'Niseko Village', NULL, NULL, true, 2),
  ('a1000000-0000-0000-0000-000000000004', 'niseko-annupuri', 'Niseko Annupuri', NULL, NULL, true, 3),
  ('a1000000-0000-0000-0000-000000000005', 'rusutsu-west-mt', 'Rusutsu West Mt.', NULL, NULL, true, 4),
  ('a1000000-0000-0000-0000-000000000006', 'rusutsu-east-mt', 'Rusutsu East Mt.', NULL, NULL, true, 5),
  ('a1000000-0000-0000-0000-000000000007', 'kiroro', 'Kiroro', NULL, NULL, true, 6),
  ('a1000000-0000-0000-0000-000000000008', 'sapporo-kokusai', 'Sapporo Kokusai', NULL, NULL, true, 7),
  ('a1000000-0000-0000-0000-000000000009', 'sapporo-teine', 'Sapporo Teine', NULL, NULL, true, 8);
