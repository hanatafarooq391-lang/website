-- ============================================================
--  VIAURA — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES (extends Supabase auth.users) ──────────────────
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  role        TEXT DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE products (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  collection    TEXT NOT NULL,
  gender        TEXT NOT NULL CHECK (gender IN ('men','women','kids','unisex')),
  description   TEXT NOT NULL,
  long_desc     TEXT,
  price         DECIMAL(10,2) NOT NULL,
  bottle_color  TEXT DEFAULT '#333333',
  bg_color      TEXT DEFAULT '#f5ede0',
  neck_color    TEXT,
  notes         TEXT[] DEFAULT '{}',
  sizes         TEXT[] DEFAULT '{50ml}',
  stock         INTEGER DEFAULT 0,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active','draft','archived')),
  featured      BOOLEAN DEFAULT FALSE,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── ORDERS ──────────────────────────────────────────────────
CREATE TABLE orders (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number    TEXT UNIQUE NOT NULL,
  user_id         UUID REFERENCES profiles(id),
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled','refunded')),
  subtotal        DECIMAL(10,2) NOT NULL,
  shipping        DECIMAL(10,2) DEFAULT 0,
  gift_wrap       DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  stripe_payment_intent TEXT,
  stripe_session_id     TEXT,
  shipping_address      JSONB,
  notes           TEXT,
  is_first_order  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── ORDER ITEMS ─────────────────────────────────────────────
CREATE TABLE order_items (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id  UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  size        TEXT,
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- ── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  verified    BOOLEAN DEFAULT FALSE,
  approved    BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── SITE SETTINGS ───────────────────────────────────────────
CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Default site settings
INSERT INTO site_settings (key, value) VALUES
  ('hero', '{"headline":"The Art of\\nInvisible Luxury","subtext":"Each fragrance is a manuscript\\nwritten in scent","cta":"Explore Collection","tagline":"Haute Parfumerie · Est. 2024"}'),
  ('brand', '{"name":"VIAURA","email":"hello@viaura.com","shipping_notice":"Complimentary worldwide delivery on all orders","featured_label":"Signature Picks"}'),
  ('features', '[{"title":"Aged to Perfection","text":"Raw materials matured 12–36 months"},{"title":"Natural Extracts","text":"100% ethically harvested botanicals"},{"title":"Free Shipping","text":"Complimentary worldwide delivery"},{"title":"Luxury Packaging","text":"Gilded ribbon & sealing wax"}]');

-- ── AUTO UPDATE updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── PRODUCT RATING VIEW ─────────────────────────────────────
CREATE VIEW product_ratings AS
SELECT
  product_id,
  COUNT(*)::INTEGER                               AS review_count,
  ROUND(AVG(rating)::NUMERIC, 1)                  AS avg_rating
FROM reviews
WHERE approved = TRUE
GROUP BY product_id;

-- ── ORDER NUMBER GENERATOR ───────────────────────────────────
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'VIA-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Products: everyone can read active products
CREATE POLICY "Anyone reads active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Admins manage products"       ON products FOR ALL   USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders: users see their own orders; admins see all
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert orders"   ON orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins manage orders"  ON orders FOR ALL   USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order items: follow order access
CREATE POLICY "Users read own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Insert order items" ON order_items FOR INSERT WITH CHECK (TRUE);

-- Reviews: anyone reads approved; users write own
CREATE POLICY "Anyone reads approved reviews" ON reviews FOR SELECT USING (approved = TRUE);
CREATE POLICY "Users insert reviews"          ON reviews FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins manage reviews"         ON reviews FOR ALL   USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Site settings: anyone reads; admins write
CREATE POLICY "Anyone reads settings" ON site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins write settings" ON site_settings FOR ALL   USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ── SEED PRODUCTS ───────────────────────────────────────────
INSERT INTO products (name, slug, collection, gender, description, long_desc, price, bottle_color, bg_color, neck_color, notes, sizes, stock, featured) VALUES
('Soir de Soie',    'soir-de-soie',   'Nuit',    'men',   'Black oud, dark rose, smoked amber',     'A commanding nocturnal composition opening with black oud before softening into vintage rose petals. Aged amber resin in the dry-down.',     189, '#2a1f1a', '#f5ede0', '#3a2a22', ARRAY['Black Oud','Dark Rose','Smoked Amber','Sandalwood'],   ARRAY['30ml','50ml','100ml'], 42, TRUE),
('Lumière Blanche', 'lumiere-blanche','Jour',    'women', 'White musk, jasmine, cedar milk',         'A luminous cloud-like fragrance on the softest white musk. Jasmine floats on milky cedar.',                                               165, '#c8bdb0', '#f0f4f7', '#b8ada0', ARRAY['White Musk','Jasmine','Cedar Milk','Neroli'],           ARRAY['30ml','50ml','100ml'], 38, TRUE),
('Bois Sacré',      'bois-sacre',     'Terroir', 'men',   'Sandalwood, vetiver, aged patchouli',     'Single-origin Mysore sandalwood with sun-dried vetiver and 3-year cold-stored patchouli.',                                               210, '#8b6e4e', '#f5f0e8', '#7a5e3e', ARRAY['Sandalwood','Vetiver','Aged Patchouli','Cedarwood'],    ARRAY['50ml','100ml'],       27, TRUE),
('Rosée du Matin',  'rosee-du-matin', 'Floral',  'women', 'Dew rose, peony, soft neroli',            'Captured at dawn when dew clings to petals. Peony heart and neroli veil.',                                                               145, '#d4a0a8', '#fdf0f2', '#c49098', ARRAY['Dew Rose','Peony','Neroli','Bergamot'],                 ARRAY['30ml','50ml','100ml'], 55, FALSE),
('L''Ambre Noir',   'l-ambre-noir',   'Oriental','men',   'Labdanum, myrrh, black pepper',           'Deeply resinous oriental. Labdanum and myrrh with sharp black pepper.',                                                                  225, '#1a1208', '#f5f0e5', '#2a2010', ARRAY['Labdanum','Myrrh','Black Pepper','Benzoin'],            ARRAY['50ml','100ml'],       19, FALSE),
('Petit Prince',    'petit-prince',   'Doux',    'kids',  'Apple blossom, cotton candy, soft musk',  'Playful yet refined. Apple blossom and cotton candy over gentle musk safe for young skin.',                                               89,  '#a8d8b8', '#f0faf4', '#98c8a8', ARRAY['Apple Blossom','Cotton Candy','Soft Musk','Peach'],     ARRAY['30ml','50ml'],        60, FALSE),
('Encens Royal',    'encens-royal',   'Oriental','men',   'Frankincense, benzoin, vanilla smoke',    'Sacred Omani frankincense. Benzoin heart, transcendental vanilla smoke dry-down.',                                                       240, '#9a7040', '#f7f2ea', '#8a6030', ARRAY['Frankincense','Benzoin','Vanilla Smoke','Oud'],          ARRAY['50ml','100ml'],       22, TRUE);


-- ============================================================
--  FIX: Make profiles insert work even without trigger
--  Run this if you get 500 errors on signup
-- ============================================================

-- Allow users to insert their own profile (in case trigger is slow)
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also allow anon insert for profile creation during signup
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ── HELPER: decrement stock safely ──────────────────────────
CREATE OR REPLACE FUNCTION decrement_stock(p_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(stock - qty, 0)
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
--  STORAGE: Image uploads ke liye
--  Supabase Dashboard → Storage → New Bucket mein bhi kar sakte hain
-- ============================================================

-- Storage bucket banao (ya Dashboard se banao)
INSERT INTO storage.buckets (id, name, public)
VALUES ('viaura-images', 'viaura-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'viaura-images');

-- Admin upload policy
CREATE POLICY "Anyone can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'viaura-images');

-- Delete policy
CREATE POLICY "Anyone can delete images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'viaura-images');


-- ============================================================
--  ADD: images array, sale_price, discount fields to products
-- ============================================================
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS images       TEXT[]         DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sale_price   DECIMAL(10,2)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS discount_pct INTEGER        DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sale_label   TEXT           DEFAULT NULL;

-- ── COLLECTIONS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Admin manages collections" ON collections FOR ALL USING (true);

-- Insert default collections
INSERT INTO collections (name, slug, description, sort_order) VALUES
  ('Sale',    'sale',    'Discounted fragrances', 0),
  ('Nuit',    'nuit',    'Night fragrances',      1),
  ('Jour',    'jour',    'Day fragrances',         2),
  ('Floral',  'floral',  'Floral collection',      3),
  ('Oriental','oriental','Oriental fragrances',    4),
  ('Terroir', 'terroir', 'Earthy fragrances',      5),
  ('Doux',    'doux',    'Gentle fragrances',      6)
ON CONFLICT (slug) DO NOTHING;
