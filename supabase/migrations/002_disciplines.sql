-- Disciplines: ski, snowboard, etc.
CREATE TABLE disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_zh TEXT,
  name_ja TEXT,
  display_order INT DEFAULT 0
);

-- Instructor <-> Disciplines (many-to-many)
CREATE TABLE instructor_disciplines (
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  discipline_id UUID REFERENCES disciplines(id) ON DELETE CASCADE,
  PRIMARY KEY (instructor_id, discipline_id)
);

CREATE INDEX idx_instructor_disciplines_discipline ON instructor_disciplines(discipline_id);
