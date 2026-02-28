/**
 * Seed script for initial data.
 * Run with: npm run db:seed
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * For now, this outputs SQL you can run manually in Supabase SQL Editor
 * until the Supabase project is configured.
 */

const seedSql = `
-- Seed regions
INSERT INTO regions (slug, name_en, name_zh, name_ja, display_order) VALUES
  ('hokkaido', 'Hokkaido', '北海道', '北海道', 0);

-- Seed resorts (Niseko, Rusutsu, Kiroro)
INSERT INTO resorts (region_id, slug, name_en, name_zh, name_ja, description_en, is_active, display_order)
SELECT r.id, 'niseko', 'Niseko', '二世古', 'ニセコ',
  'Niseko United: Annupuri, Niseko Village, Grand Hirafu, Hanazono. World-renowned powder snow.',
  true, 0 FROM regions r WHERE r.slug = 'hokkaido';

INSERT INTO resorts (region_id, slug, name_en, name_zh, name_ja, description_en, is_active, display_order)
SELECT r.id, 'rusutsu', 'Rusutsu', '留寿都', 'ルスツ',
  'Rusutsu Resort. Family-friendly with excellent tree runs and consistent snowfall.',
  true, 1 FROM regions r WHERE r.slug = 'hokkaido';

INSERT INTO resorts (region_id, slug, name_en, name_zh, name_ja, description_en, is_active, display_order)
SELECT r.id, 'kiroro', 'Kiroro', '喜乐乐', 'キロロ',
  'Kiroro Resort. Deep powder, uncrowded slopes, and a relaxed atmosphere.',
  true, 2 FROM regions r WHERE r.slug = 'hokkaido';

-- Seed languages
INSERT INTO languages (code, name_en, name_zh, name_ja, display_order) VALUES
  ('en', 'English', '英语', '英語', 0),
  ('zh', 'Simplified Chinese', '简体中文', '簡体中国語', 1),
  ('ja', 'Japanese', '日语', '日本語', 2),
  ('ko', 'Korean', '韩语', '韓国語', 3);

-- Seed skill levels
INSERT INTO skill_levels (slug, name_en, name_zh, name_ja, display_order) VALUES
  ('beginner', 'Beginner', '入门', '初級', 0),
  ('intermediate', 'Intermediate', '中级', '中級', 1),
  ('advanced', 'Advanced', '进阶', '上級', 2),
  ('expert', 'Expert', '高级', 'エキスパート', 3);

-- Seed improvement areas
INSERT INTO improvement_areas (slug, name_en, name_zh, name_ja, display_order) VALUES
  ('basics', 'Basics & fundamentals', '基础与基本功', '基礎・基本', 0),
  ('carving', 'Carving & turns', '刻滑与转弯', 'カービング・ターン', 1),
  ('moguls', 'Moguls', '蘑菇道', 'モーグル', 2),
  ('off_piste', 'Off-piste & powder', '野雪与粉雪', 'オフピステ・パウダー', 3),
  ('park', 'Park & freestyle', '公园与自由式', 'パーク・フリースタイル', 4),
  ('racing', 'Racing & gates', '竞速与旗门', 'レース・旗門', 5),
  ('safety', 'Safety & mountain etiquette', '安全与滑雪礼仪', '安全・山のマナー', 6);
`;

console.log("Copy and run this SQL in your Supabase SQL Editor:\n");
console.log(seedSql);
console.log("\nOr set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local to run programmatically.");
