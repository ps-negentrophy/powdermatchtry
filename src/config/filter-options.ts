import type { Resort, Language, SkillLevel, ImprovementArea, Discipline } from "@/types/database";

/**
 * Filter options for the "Find Instructor" page.
 * Edit this file to add, remove, or change options for each dropdown.
 * When Supabase is configured, data from the database overrides these defaults.
 */

export const DEFAULT_RESORTS: Resort[] = [
  { id: "1", slug: "niseko", name_en: "Niseko", name_zh: "二世古", name_ja: "ニセコ", region_id: null, description_en: null, description_zh: null, description_ja: null, is_active: true, display_order: 0, metadata: {} },
  { id: "2", slug: "rusutsu", name_en: "Rusutsu", name_zh: "留寿都", name_ja: "ルスツ", region_id: null, description_en: null, description_zh: null, description_ja: null, is_active: true, display_order: 1, metadata: {} },
  { id: "3", slug: "kiroro", name_en: "Kiroro", name_zh: "喜乐乐", name_ja: "キロロ", region_id: null, description_en: null, description_zh: null, description_ja: null, is_active: true, display_order: 2, metadata: {} },
];

export const DEFAULT_LANGUAGES: Language[] = [
  { id: "1", code: "en", name_en: "English", name_zh: "英语", name_ja: "英語" },
  { id: "2", code: "zh", name_en: "Simplified Chinese", name_zh: "简体中文", name_ja: "簡体中国語" },
  { id: "3", code: "ja", name_en: "Japanese", name_zh: "日语", name_ja: "日本語" },
];

export const DEFAULT_SKILL_LEVELS: SkillLevel[] = [
  { id: "1", slug: "beginner", name_en: "Beginner", name_zh: "入门", name_ja: "初級" },
  { id: "2", slug: "intermediate", name_en: "Intermediate", name_zh: "中级", name_ja: "中級" },
  { id: "3", slug: "advanced", name_en: "Advanced", name_zh: "进阶", name_ja: "上級" },
  { id: "4", slug: "expert", name_en: "Expert", name_zh: "高级", name_ja: "エキスパート" },
];

export const DEFAULT_IMPROVEMENT_AREAS: ImprovementArea[] = [
  { id: "1", slug: "basics", name_en: "Basics & fundamentals", name_zh: "基础与基本功", name_ja: "基礎・基本" },
  { id: "2", slug: "carving", name_en: "Carving & turns", name_zh: "刻滑与转弯", name_ja: "カービング・ターン" },
  { id: "3", slug: "moguls", name_en: "Moguls", name_zh: "蘑菇道", name_ja: "モーグル" },
  { id: "4", slug: "off_piste", name_en: "Off-piste & powder", name_zh: "野雪与粉雪", name_ja: "オフピステ・パウダー" },
];

export const DEFAULT_DISCIPLINES: Discipline[] = [
  { id: "1", slug: "ski", name_en: "Ski", name_zh: "双板滑雪", name_ja: "スキー" },
  { id: "2", slug: "snowboard", name_en: "Snowboard", name_zh: "单板滑雪", name_ja: "スノーボード" },
];

