-- Regions: extensible (Hokkaido, Nagano, etc.)
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_zh TEXT,
  name_ja TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Resorts: data-driven, easy to add new ones
CREATE TABLE resorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES regions(id),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_zh TEXT,
  name_ja TEXT,
  description_en TEXT,
  description_zh TEXT,
  description_ja TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Teaching languages: extensible lookup
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_zh TEXT,
  name_ja TEXT,
  display_order INT DEFAULT 0
);

-- Skill levels
CREATE TABLE skill_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_zh TEXT,
  name_ja TEXT,
  display_order INT DEFAULT 0
);

-- Areas to improve (carving, moguls, off-piste, etc.)
CREATE TABLE improvement_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_zh TEXT,
  name_ja TEXT,
  display_order INT DEFAULT 0
);

-- Instructors
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- link to auth when implemented
  display_name TEXT NOT NULL,
  bio_en TEXT,
  bio_zh TEXT,
  bio_ja TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Instructor <-> Languages (many-to-many)
CREATE TABLE instructor_languages (
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
  PRIMARY KEY (instructor_id, language_id)
);

-- Instructor <-> Resorts (many-to-many)
CREATE TABLE instructor_resorts (
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  resort_id UUID REFERENCES resorts(id) ON DELETE CASCADE,
  PRIMARY KEY (instructor_id, resort_id)
);

-- Instructor skill levels taught
CREATE TABLE instructor_skill_levels (
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  skill_level_id UUID REFERENCES skill_levels(id) ON DELETE CASCADE,
  PRIMARY KEY (instructor_id, skill_level_id)
);

-- Instructor improvement areas (what they specialize in)
CREATE TABLE instructor_improvement_areas (
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  improvement_area_id UUID REFERENCES improvement_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (instructor_id, improvement_area_id)
);

-- Indexes for matching queries
CREATE INDEX idx_instructor_resorts_resort ON instructor_resorts(resort_id);
CREATE INDEX idx_instructor_languages_lang ON instructor_languages(language_id);
CREATE INDEX idx_instructor_skill_levels_level ON instructor_skill_levels(skill_level_id);
CREATE INDEX idx_instructor_improvement_areas_area ON instructor_improvement_areas(improvement_area_id);
