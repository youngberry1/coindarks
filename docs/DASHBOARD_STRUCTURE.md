# 📊 Dashboard Structure Guide

## Overview

The user dashboard has been restructured into **modular, reusable components** for better scalability and maintainability. This design makes it easy to add new features without cluttering the main dashboard file.

---

## 🏗️ Component Architecture

### **Main Dashboard Page**
**File**: `app/(protected)/dashboard/page.tsx`

**Responsibilities**:
- Fetch user data from database
- Fetch KYC status
- Fetch activity data (TODO: implement)
- Compose dashboard layout using components

**Key Features**:
- ✅ Real KYC status from database
- ✅ Dynamic welcome message with user's first name
- ✅ Modular component composition
- ✅ TODO markers for future data integration

---

## 📦 Dashboard Components

### 1. **KYCCard** (`components/dashboard/KYCCard.tsx`)

**Purpose**: Dynamic KYC verification card that adapts based on user's KYC status

**Props**:
- `kycStatus`: Current KYC status (UNVERIFIED, PENDING, APPROVED, REJECTED)
- `userName`: User's first name for personalization

**Behavior by Status**:

| Status | Title | Description | Button Text | Button Link |
|--------|-------|-------------|-------------|-------------|
| **UNVERIFIED** | Verification Centre | Upgrade security and increase limits | Start Verification | `/dashboard/kyc/submit` |
| **PENDING** | Verification Pending | Under review (24-48 hours) | Check Status | `/dashboard/kyc/status` |
| **APPROVED** | Verification Complete | Fully verified with enhanced limits | View Benefits | `/dashboard/kyc/status` |
| **REJECTED** | Verification Required | Review feedback and resubmit | Resubmit KYC | `/dashboard/kyc/submit` |

**Features**:
- ✅ Functional navigation links
- ✅ Dynamic styling based on status
- ✅ Animated background icon
- ✅ Personalized messaging

---

### 2. **StatCard** (`components/dashboard/StatCard.tsx`)

**Purpose**: Reusable metric display card

**Props**:
- `label`: Metric name (e.g., "Active Orders")
- `value`: Main value to display (e.g., "3")
- `subValue`: Additional context (e.g., "+1 in last 24h")
- `icon`: Lucide icon component
- `color`: Icon color class (e.g., "text-blue-500")
- `bg`: Background color class (e.g., "bg-blue-500/10")

**Usage Example**:
```tsx
<StatCard
  label="Active Orders"
  value="3"
  subValue="+1 in last 24h"
  icon={History}
  color="text-blue-500"
  bg="bg-blue-500/10"
/>
```

**Future Stats to Add**:
- Total wallet balance
- Pending withdrawals
- Completed trades this month
- Average transaction time
- Referral earnings

---

### 3. **RecentActivity** (`components/dashboard/RecentActivity.tsx`)

**Purpose**: Display recent transactions/orders

**Props**:
- `activities`: Array of activity objects

**Activity Object Shape**:
```typescript
{
  type: 'buy' | 'sell';
  asset: string;        // e.g., "BTC", "ETH"
  amount: string;       // e.g., "+$250.00"
  date: string;         // e.g., "Oct 12, 10:45 AM"
  status: string;       // e.g., "Completed", "Processing"
}
```

**Features**:
- ✅ Empty state handling (shows message when no activity)
- ✅ Functional "View All" link to `/dashboard/orders`
- ✅ Color-coded by transaction type (buy = green, sell = red)
- ✅ Animated icons on hover

**TODO**: Connect to real order/transaction data from database

---

### 4. **SupportCard** (`components/dashboard/SupportCard.tsx`)

**Purpose**: Quick access to support

**Features**:
- ✅ Functional link to `/support` (create this page later)
- ✅ 24/7 availability messaging
- ✅ Consistent styling with dashboard theme

**Future Enhancements**:
- Add live chat integration
- Show support ticket count
- Display response time estimate

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Page (Server)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─ auth() → Get session
                              │
                              ├─ getUserById() → Get user data
                              │    ↓
                              │    Returns: firstName, lastName, kycStatus, etc.
                              │
                              ├─ getKYCStatus() → Get KYC details
                              │    ↓
                              │    Returns: KYC submission data
                              │
                              └─ TODO: getRecentOrders() → Get activity
                                   ↓
                                   Returns: Recent transactions
                              
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Render Components (Client)                 │
├─────────────────────────────────────────────────────────────┤
│  • StatCard (x3) - Display metrics                          │
│  • KYCCard - Dynamic KYC status card                        │
│  • RecentActivity - Transaction history                     │
│  • SupportCard - Help & support                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Adding New Features

### **Example: Adding a "Quick Exchange" Card**

1. **Create Component**:
```tsx
// components/dashboard/QuickExchangeCard.tsx
'use client';

export function QuickExchangeCard() {
  return (
    <div className="glass-morphism rounded-3xl p-8 border border-white/5">
      <h3 className="text-xl font-bold mb-4">Quick Exchange</h3>
      {/* Exchange form here */}
    </div>
  );
}
```

2. **Import in Dashboard**:
```tsx
import { QuickExchangeCard } from '@/components/dashboard/QuickExchangeCard';
```

3. **Add to Layout**:
```tsx
<div className="space-y-8">
  <KYCCard kycStatus={kycStatus} userName={firstName} />
  <QuickExchangeCard /> {/* New card */}
  <SupportCard />
</div>
```

---

### **Example: Adding a "Wallet Balance" Stat**

1. **Fetch Data** (in dashboard page):
```tsx
const walletBalance = await getWalletBalance(session.user.id);
```

2. **Add to Stats Array**:
```tsx
const stats = [
  // ... existing stats
  {
    label: 'Wallet Balance',
    value: `$${walletBalance.toFixed(2)}`,
    subValue: 'Available funds',
    icon: Wallet,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
];
```

That's it! The `StatCard` component handles the rest.

---

## 📝 TODO: Data Integration

### **Current State**
- ✅ KYC status: **Connected to database**
- ✅ User name: **Connected to database**
- ⏳ Active orders: **Hardcoded to "0"**
- ⏳ Total volume: **Hardcoded to "$0.00"**
- ⏳ Recent activity: **Empty array**

### **Next Steps**

#### 1. **Connect Active Orders**
```tsx
// In dashboard page
const activeOrders = await getActiveOrders(session.user.id);

const stats = [
  {
    label: 'Active Orders',
    value: activeOrders.length.toString(),
    subValue: `+${activeOrders.filter(o => o.createdAt > yesterday).length} in last 24h`,
    // ...
  },
];
```

#### 2. **Connect Total Volume**
```tsx
const totalVolume = await getTotalVolume(session.user.id);

const stats = [
  {
    label: 'Total Volume',
    value: `$${totalVolume.amount.toFixed(2)}`,
    subValue: `${totalVolume.count} transactions`,
    // ...
  },
];
```

#### 3. **Connect Recent Activity**
```tsx
const recentOrders = await getRecentOrders(session.user.id, { limit: 5 });

const recentActivities = recentOrders.map(order => ({
  type: order.route === 'CRYPTO_TO_FIAT' ? 'sell' : 'buy',
  asset: order.fromCurrency,
  amount: `${order.route === 'CRYPTO_TO_FIAT' ? '-' : '+'}$${order.amount}`,
  date: format(order.createdAt, 'MMM dd, hh:mm a'),
  status: order.status,
}));
```

---

## 🎨 Design Principles

### **Modularity**
- Each component is self-contained
- Easy to test and maintain
- Reusable across different pages

### **Scalability**
- Adding new features doesn't require modifying existing components
- Clear separation of concerns
- TODO markers guide future development

### **Consistency**
- All components use the same styling system (glass-morphism, rounded-3xl, etc.)
- Consistent spacing and typography
- Unified color scheme

### **Performance**
- Server components fetch data
- Client components handle interactivity
- Minimal client-side JavaScript

---

## 🔧 Maintenance Guide

### **When to Create a New Component**

Create a new component when:
- ✅ The feature will be reused in multiple places
- ✅ The code block is getting too large (>50 lines)
- ✅ The feature has its own state or logic
- ✅ You want to test it independently

### **When to Keep Code Inline**

Keep code inline when:
- ✅ It's a one-time use case
- ✅ It's very simple (<10 lines)
- ✅ It's tightly coupled to the parent component

---

## 📚 File Structure

```
app/(protected)/dashboard/
└── page.tsx                 ← Main dashboard (server component)

components/dashboard/
├── KYCCard.tsx             ← Dynamic KYC status card
├── StatCard.tsx            ← Reusable metric card
├── RecentActivity.tsx      ← Transaction history
└── SupportCard.tsx         ← Help & support

Future additions:
components/dashboard/
├── QuickExchangeCard.tsx   ← Quick exchange widget
├── WalletCard.tsx          ← Wallet overview
├── ReferralCard.tsx        ← Referral program
└── NotificationsCard.tsx   ← Recent notifications
```

---

## ✅ Benefits of This Structure

1. **Easy to Understand**: Each component has a single, clear purpose
2. **Easy to Extend**: Add new cards without touching existing code
3. **Easy to Test**: Components can be tested in isolation
4. **Easy to Maintain**: Changes to one component don't affect others
5. **Easy to Reuse**: Components can be used in other dashboards (admin, finance, etc.)

---

## 🎯 Summary

The dashboard is now:
- ✅ **Modular**: 4 reusable components
- ✅ **Functional**: KYC button works with real data
- ✅ **Scalable**: Easy to add new features
- ✅ **Maintainable**: Clear structure and documentation
- ✅ **Future-Ready**: TODO markers guide next steps

**Next Steps**:
1. Create the `/dashboard/kyc/submit` page (KYC submission form)
2. Create the `/dashboard/kyc/status` page (KYC status viewer)
3. Connect real order/transaction data
4. Add more dashboard widgets as needed
