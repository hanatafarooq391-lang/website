-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS collections (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  type        TEXT DEFAULT 'custom',  -- 'gender' | 'custom' | 'sale'
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read collections"  ON collections FOR SELECT USING (true);
CREATE POLICY "Anyone manage collections" ON collections FOR ALL  USING (true);

-- Default collections
INSERT INTO collections (name, slug, type, sort_order) VALUES
  ('Men',      'men',      'gender', 1),
  ('Women',    'women',    'gender', 2),
  ('Kids',     'kids',     'gender', 3),
  ('Sale',     'sale',     'sale',   4),
  ('Nuit',     'nuit',     'custom', 5),
  ('Jour',     'jour',     'custom', 6),
  ('Floral',   'floral',   'custom', 7),
  ('Oriental', 'oriental', 'custom', 8)
ON CONFLICT (slug) DO NOTHING;
