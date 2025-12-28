# 🦅 CoinDarks Exchange

> A premium, high-performance Cryptocurrency-to-Fiat bridge tailored for the African market (GHS & NGN). Built with security, speed, and a world-class user experience in mind.

---

## ⚡ Tech Stack

<div align="center">

| Core | Database | Auth | UI/UX |
| :--- | :--- | :--- | :--- |
| **Next.js 16 (App Router)** | **Supabase (PostgreSQL)** | **Auth.js v5 (Beta)** | **Tailwind CSS 4** |
| **TypeScript (Strict)** | **Supabase JS Client** | **BcryptJS** | **Framer Motion** |
| **Turbopack** | **Row Level Security** | **Zod (Validation)** | **Lucide React** |

</div>

---

## 🎨 Visual Identity & UX

- **Glassmorphism Design**: Using advanced `backdrop-blur` and high-refraction borders for a premium hardware-wallet aesthetic.
- **Floating Island Navbar**: An adaptive navigation system that transforms on scroll.
- **Motion Physics**: Orchestrated animations using Framer Motion's `AnimatePresence` and `whileInView` hooks.
- **Dynamic Theming**: Dark-first architecture with vibrant `primary` (#3b82f6) and `secondary` (#8b5cf6) accents.

---

## 🛠️ Key Features

### 🔐 Authentication System (Production Ready)
- **Edge Compatible**: Custom Auth.js split configuration (`auth.config.ts` vs `auth.ts`) to support Next.js Middleware in Edge runtimes.
- **Mandatory Email Verification**: Secure UUID-based verification tokens via Supabase.
- **Zod Schema Validation**: Error-safe registration and login flows.
- **Role-Based Protection**: Built-in middleware for `ADMIN` and `USER` route shielding.

### 💰 Exchange Engine (In Progress)
- **Live Rates**: Real-time GHS/NGN calculation logic.
- **Instant Settlements**: Manual and automated payout triggers for Mobile Money and Bank Transfers.

### 🛡️ Security
- **BcryptJS Hashing**: 12-round salt hashing for password security.
- **Supabase Policies**: Row Level Security (RLS) capable database architecture.
- **Secure Email**: Integration with Resend for transactional emails (Verification, etc.).

---

## 🏗️ Getting Started

### 1. Prerequisites
- Node.js 18+
- Supabase Account & Project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/coindarks.git

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root:
```env
AUTH_SECRET="your-secret"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Mail (Resend)
RESEND_API_KEY="re_..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Database Setup
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Open `docs/supabase_schema.sql` from this project.
3. Copy the contents and run it in the Supabase SQL Editor.
4. (Optional) Run `docs/migration_001_split_names.sql` if you are updating an existing instance.

### 5. Start Development
```bash
npm run dev
```

---

## 📂 Project Structure Documentation

- `app/` - Next.js App Router (Layouts, Pages, API handlers).
  - `(auth)/` - Public authentication pages (Login, Register, Verify).
  - `(protected)/` - Routes requiring a valid session (Dashboard, Profile).
- `actions/` - Server Actions for database operations (Type-safe backend logic).
- `components/`
  - `layout/` - Global components (Navbar, Footer).
  - `sections/` - Landing page blocks (Hero, Features, Trust).
- `lib/` - Shared utility functions (supabase client, mail, tokens).
- `docs/` - Database schemas and SQL migration scripts.

---

<div align="center">
  <sub>Built with ❤️ for the future of African Finance by THE TBX TEAM - Trending Boss Next-Gen Technology.</sub>
</div>
