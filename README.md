# VIAURA — Complete Ecommerce Website
### Next.js + Supabase + Stripe | Storefront + Admin Panel — Ek Hi Folder

---

## 📁 Folder Structure

```
viaura/
├── app/                          ← All pages
│   ├── page.tsx                  ← 🏠 Homepage
│   ├── collection/page.tsx       ← 👗 Men / Women / Kids collection
│   ├── product/[slug]/page.tsx   ← 🧴 Product detail page
│   ├── cart/page.tsx             ← 🛒 Cart page
│   ├── reviews/page.tsx          ← ⭐ Reviews + form
│   ├── checkout/success/page.tsx ← ✅ After payment
│   ├── auth/login/page.tsx       ← 🔐 Login / Register
│   │
│   ├── admin/                    ← 🛠️ ADMIN PANEL
│   │   ├── page.tsx              ←    Dashboard
│   │   ├── products/page.tsx     ←    Products CRUD
│   │   ├── orders/page.tsx       ←    Orders + status
│   │   ├── customers/page.tsx    ←    Customers + LTV
│   │   ├── reviews/page.tsx      ←    Review moderation
│   │   ├── analytics/page.tsx    ←    Analytics
│   │   └── settings/page.tsx     ←    Site settings
│   │
│   └── api/                      ← 🔌 Backend API
│       ├── products/             ←    GET, POST, PATCH, DELETE
│       ├── orders/               ←    Create + Stripe checkout
│       ├── reviews/              ←    Submit reviews
│       ├── settings/             ←    Site settings
│       ├── auth/                 ←    Login / Register
│       └── webhook/stripe/       ←    Payment confirmation
│
├── components/                   ← Reusable components
│   ├── Navbar.tsx                ← Navigation bar
│   ├── ProductCard.tsx           ← Product card
│   ├── CartClient.tsx            ← Cart with Stripe
│   ├── ReviewsClient.tsx         ← Reviews + live form
│   └── admin/                   ← Admin components
│       ├── AdminShell.tsx        ← Sidebar layout
│       ├── AdminProductsClient.tsx
│       ├── AdminOrdersClient.tsx
│       ├── AdminReviewsClient.tsx
│       └── AdminSettingsClient.tsx
│
├── lib/
│   ├── supabase/client.ts        ← Browser Supabase
│   ├── supabase/server.ts        ← Server Supabase
│   ├── stripe.ts                 ← Stripe helper
│   └── store.ts                  ← Cart + Auth state (Zustand)
│
├── supabase/
│   └── schema.sql                ← ⭐ Database setup (run this first!)
│
├── types/index.ts                ← TypeScript types
├── middleware.ts                 ← Route protection
├── .env.example                  ← Copy to .env.local
└── package.json
```

---

## 🚀 Setup — Step by Step

### Step 1: Install dependencies
```bash
npm install
```

### Step 2: Supabase setup (FREE)
1. Go to **https://supabase.com** → Sign up → New project
2. Settings → API → Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **SQL Editor** → New Query
4. Copy everything from `supabase/schema.sql` → Paste → Click **Run**
5. ✅ Tables, data, and security rules created!

### Step 3: Stripe setup (FREE — only % per sale)
1. Go to **https://dashboard.stripe.com** → Get API keys
2. Copy **Publishable Key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy **Secret Key** → `STRIPE_SECRET_KEY`
4. After deploying, go to Webhooks → Add endpoint:
   - URL: `https://yourdomain.com/api/webhook/stripe`
   - Events: `checkout.session.completed`
   - Copy **Webhook Secret** → `STRIPE_WEBHOOK_SECRET`

### Step 4: Environment variables
```bash
cp .env.example .env.local
```
Fill in all values in `.env.local`

### Step 5: Run locally
```bash
npm run dev
```
Open **http://localhost:3000** 🎉

---

## 🔐 Admin Panel Kaise Kholein?

### URL:
```
http://localhost:3000/admin
```

### First time setup:
1. **http://localhost:3000/auth/login** pe jao
2. **Register** tab click karo → account banao
3. Supabase Dashboard → SQL Editor mein yeh run karo:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tumhara@email.com';
```
4. Ab **http://localhost:3000/admin** pe jao → Admin panel khulega ✅
5. Ya Navbar mein **⚙ Admin** button click karo

### Admin Panel Pages:
| Page | URL | Kya karta hai |
|------|-----|---------------|
| Dashboard | /admin | Revenue, orders, stats |
| Products | /admin/products | Add/Edit/Delete products |
| Orders | /admin/orders | Order status update |
| Customers | /admin/customers | Customer list + LTV |
| Reviews | /admin/reviews | Approve/delete reviews |
| Analytics | /admin/analytics | Sales analytics |
| Settings | /admin/settings | Hero text, features edit |

---

## 🌐 Vercel pe Free Deploy

```bash
# Option 1: CLI
npm i -g vercel
vercel

# Option 2: GUI
# vercel.com → New Project → Import GitHub repo → Deploy
```

**Environment variables Vercel mein add karo:**
Vercel Dashboard → Project → Settings → Environment Variables

---

## 💳 Payment Flow

```
Customer → Cart → Checkout
    ↓
POST /api/orders
    ↓ (creates order in DB)
Stripe Checkout page
    ↓ (customer pays)
Webhook: /api/webhook/stripe
    ↓ (order confirmed, stock decremented)
/checkout/success ✅
```

---

## 🆓 Free Tier Limits

| Service  | Free Plan | Enough for |
|----------|-----------|------------|
| Supabase | 500MB DB  | ~10,000 products + orders |
| Vercel   | 100GB/mo  | ~50,000 visitors |
| Stripe   | 0 monthly | Pay % per sale only |
| Resend   | 3k emails | Order confirmations |

---

Made with ✦ for VIAURA Haute Parfumerie
