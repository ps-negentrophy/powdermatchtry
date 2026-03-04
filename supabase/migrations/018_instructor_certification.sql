-- Add certification fields to instructors (required before 020 trigger update)
ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS certification_body   TEXT,
  ADD COLUMN IF NOT EXISTS certification_number TEXT;
