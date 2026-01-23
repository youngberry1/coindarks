# 🦅 CoinDarks Exchange

> A premium, high-performance Cryptocurrency-to-Fiat bridge tailored for the African market (GHS & NGN). Engineered for institutional-grade security, pixel-perfect responsiveness, and a world-class user experience.

---

## ⚡ Technical Architecture

<div align="center">

| Core | Database | Auth | UI/UX |
| :--- | :--- | :--- | :--- |
| **Next.js 15+ (App Router)** | **Supabase (PostgreSQL)** | **Auth.js v5 (Edge-Ready)** | **Tailwind CSS 4** |
| **TypeScript (Strict)** | **Row Level Security (RLS)** | **Zod Validation** | **Framer Motion** |
| **Turbopack** | **Real-time Price Feeds** | **BcryptJS Encryption** | **Lucide Icons** |

</div>

---

## 💎 Visual identity & Institutional UX

- **Professional Branding**: Custom high-fidelity 3D renders representing security and digital wealth.
- **Glassmorphism Design**: Advanced `backdrop-blur` and high-refraction borders for a premium hardware-wallet aesthetic.
- **Floating Island Navbar**: An adaptive navigation system with built-in **Auth Skeleton Loaders** for a layout-shift-free experience.
- **Tablet-First Precision**: Hand-tuned responsiveness for iPad Pro (1024px), Surface Pro, and ultra-wide displays.
- **Dynamic Theming**: Dark-first architecture with vibrant emerald green and deep blue fintech accents.

---

## 🛠️ Ecosystem Features

### 🔐 Security & Governance
- **Institutional Defense**: Bank-grade AES-256 data protection and physical cold storage integration.
- **Edge-Compatible Auth**: Custom split-config architecture supporting middleware at the edge.
- **Regulatory Rigor**: Engineered for compliance with Ghanaian and Nigerian financial standards.

### 💰 High-Frequency Exchange
- **Quantum Settlements**: Instant GHS/NGN payouts via Mobile Money and Bank Transfers.
- **Live Rate Engine**: Real-time market pulse powered by global liquidity providers.
- **Zero Spread Accuracy**: Transparent, real-time rates with no hidden fees.

### 📱 Premium Mobile Navigation
- **App-Like Drawer**: Completely redesigned mobile menu with a spacious, full-height UI.
- **Usability Focus**: Large-scale touch targets and standardized UI components.

---

## 🏗️ Getting Started

### 1. Prerequisites
- Node.js 18+
- Supabase Project (PostgreSQL)

### 2. Installation & setup
```bash
# Clone and install
git clone https://github.com/your-repo/coindarks.git
npm install

# Start development
npm run dev
```

### 3. Environment Configuration
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

---

## 📂 Project Structure

- `app/` - Next.js App Router (Layouts, Edge-Ready Pages, API handlers).
- `actions/` - Server Actions for type-safe database operations.
- `components/`
  - `layout/` - Global UI (Navbar, Premium Footer).
  - `sections/` - Landing page blocks (Branded Hero, Security, Trust).
  - `ui/` - Atomic Radix-based components.
- `lib/` - Shared utilities (Supabase, Mail, Auth tokens).

---

<div align="center">
  <sub>Built with ❤️ by THE TBX TEAM - Trending Boss Next-Gen Technology.</sub>
</div>
