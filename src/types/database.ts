export interface Region {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string | null;
  name_ja: string | null;
  display_order: number;
}

export interface Resort {
  id: string;
  region_id: string | null;
  slug: string;
  name_en: string;
  name_zh: string | null;
  name_ja: string | null;
  description_en: string | null;
  description_zh: string | null;
  description_ja: string | null;
  is_active: boolean;
  display_order: number;
  metadata: Record<string, unknown>;
}

export interface Language {
  id: string;
  code: string;
  name_en: string;
  name_zh: string | null;
  name_ja: string | null;
}

export interface SkillLevel {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string | null;
  name_ja: string | null;
}

export interface ImprovementArea {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string | null;
  name_ja: string | null;
}

export interface Discipline {
  id: string;
  slug: string;
  name_en: string;
  name_zh: string | null;
  name_ja: string | null;
}

export interface Instructor {
  id: string;
  display_name: string;
  bio_en: string | null;
  bio_zh: string | null;
  bio_ja: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_active: boolean;
}

export interface InstructorWithRelations extends Instructor {
  resorts: Resort[];
  languages: Language[];
  skill_levels: SkillLevel[];
  improvement_areas: ImprovementArea[];
  disciplines: Discipline[];
}

export interface MatchFilters {
  resortId?: string;
  languageId?: string;
  skillLevelId?: string;
  improvementAreaId?: string;
}
