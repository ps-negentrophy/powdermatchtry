-- Availability slots: each slot combines a date range + teaching conditions.
-- Instructors can save multiple slots (e.g. different resorts/periods).
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  discipline_ids UUID[] NOT NULL DEFAULT '{}',
  resort_ids UUID[] NOT NULL DEFAULT '{}',
  language_ids UUID[] NOT NULL DEFAULT '{}',
  skill_level_id UUID REFERENCES skill_levels(id) ON DELETE SET NULL,
  improvement_area_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Instructors can fully manage their own slots
CREATE POLICY "Instructors manage own availability slots" ON availability_slots
  FOR ALL USING (
    instructor_id IN (SELECT id FROM instructors WHERE user_id = auth.uid())
  );

CREATE INDEX idx_availability_slots_instructor ON availability_slots(instructor_id);
CREATE INDEX idx_availability_slots_dates ON availability_slots(start_date, end_date);
