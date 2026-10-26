# Workvence — Freelance Services Marketplace Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-2EAD33?logo=playwright)](https://playwright.dev/)

**Workvence** is a modern, high-performance freelance services marketplace platform built with **Next.js 16 (App Router)**, **React 19**, and **TypeScript**. It connects clients (buyers) and independent service providers (sellers) worldwide through package discovery, order workflows, milestone deliveries, real-time messaging, and secure escrow payments.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Directory Structure](#directory-structure)
- [License](#license)

---

## Key Features

### 🛒 Buyer Experience
- **Package & Gig Marketplace**: Search, filter, and discover services across dozens of categories with multi-attribute filtering (delivery time, seller level, budget).
- **Custom Order Requests & Job Briefs**: Post project briefs, review seller proposals, and initiate custom contracts.
- **Order Lifecycle & Escrow**: Structured order statuses (pending, in progress, delivered, completed, disputed) with secure escrow payment flows.
- **Reviews & Ratings**: Post-order feedback with detailed seller evaluation metrics.

### 💼 Seller Hub
- **Gig & Package Management**: Interactive multi-step package creator and editor (`/organize`, `/my-packages`) with tier configuration (Basic, Standard, Premium).
- **Earnings & Analytics**: Comprehensive financial dashboards displaying pending clearance, available withdrawals, and historical revenue charts.
- **Portfolio Showcase**: Upload and showcase completed client work, image galleries, and live project links.
- **KYC & Identity Verification**: Government ID verification workflow to earn verified trust badges.

### ⚡ Real-Time Capabilities
- **Direct Messaging**: Low-latency chat via Socket.IO with thread management, real-time typing indicators, unread counters, and file attachments.
- **Live Notifications**: Instant push alerts for order updates, message notifications, and milestone changes.

### 🛡️ Trust & Safety
- **KYC Verification**: Identity document upload, verification review, and badge assignment.
- **Dispute Resolution & Support**: Integrated ticketing system for support requests and dispute settlement.
- **Account Standing Monitoring**: Built-in warning and suspension banners for platform integrity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Standalone Output) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), Custom SF Pro Typography, SASS |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand), [TanStack React Query v5](https://tanstack.com/query) |
| **Animations** | [GSAP](https://greensock.com/gsap/), `@gsap/react` |
| **Icons** | [Lucide React](https://lucide.dev/), [Hugeicons](https://hugeicons.com/), [React Icons](https://react-icons.github.io/react-icons/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/), [SweetAlert2](https://sweetalert2.github.io/) |
| **Real-time** | [Socket.IO Client](https://socket.io/) |
| **Payments** | [Stripe](https://stripe.com/) (`@stripe/stripe-js`, `@stripe/react-stripe-js`) |
| **Testing** | [Playwright](https://playwright.dev/) End-to-End Suite |

---

## Project Architecture

The application adopts a hybrid modular and feature-driven folder structure:

```
src/
├── app/                  # Next.js 16 App Router pages and route groups
│   ├── (auth)/           # Authentication flows: /login, /register, password reset
│   ├── (buyer)/          # Buyer views: favorites, orders
│   ├── (marketing)/      # Public pages: home, /packages, search, categories
│   ├── (seller)/         # Seller tools: /organize, /my-packages, /earnings
│   ├── admin/            # Admin portal
│   ├── briefs/           # Client job briefs & proposal management
│   ├── dashboard/        # Central role-based dashboard router
│   ├── kyc/              # Identity verification submission
│   ├── manage-orders/    # Seller order management table
│   ├── message/          # Real-time chat threads
│   ├── orders/           # Order tracking, delivery acceptance, reviews
│   ├── profile/          # User profile settings & portfolio management
│   └── support/          # Support ticket desk
├── components/           # Reusable atomic UI elements (buttons, inputs, modals, cards)
├── features/             # Domain-specific components (dashboard, gig-card, profile)
├── hooks/                # Custom React hooks (sockets, queries, viewport)
├── services/             # API data services (auth, packages, support)
├── store/                # Zustand global state (user, auth, notification store)
├── types/                # TypeScript type definitions and interfaces
└── utils/                # Axios interceptors, toast helpers, image uploaders
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`, `pnpm` (recommended), or `yarn`

### Installation

Clone the repository and install project dependencies:

```bash
git clone https://github.com/Central-Marketing/Workvence_client.git
cd Workvence_client
npm install
# or
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API Base URLs
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SERVER_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Admin Backend API
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:5000/api/admin
NEXT_PUBLIC_ADMIN_BACKEND_URL=http://localhost:5000

# Third-Party Integrations
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_APPLE_CLIENT_ID=your-apple-client-id
NEXT_PUBLIC_IMGBB_KEY=your-imgbb-api-key

# Feature Flags
NEXT_PUBLIC_ENABLE_KYC_PROMPT=true
```

### Running the Development Server

Start the development server with Turbopack:

```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Compile and bundle the application for production:

```bash
npm run build
npm run start
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the development server at `localhost:3000` |
| `npm run build` | Builds the production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint to verify code quality |
| `npm run test:e2e` | Runs Playwright end-to-end tests |
| `npm run test:e2e:headed` | Runs Playwright tests with visible browser UI |
| `npm run test:e2e:lifecycle` | Runs the full buyer/seller order lifecycle test |
| `npm run test:e2e:payments` | Runs payments, escrow, and dispute test suite |
| `npm run test:e2e:support` | Runs support tickets and security tests |
| `npm run test:journey` | Runs the automated user journey simulation script |

---

## Testing

End-to-end and journey tests are implemented using [Playwright](https://playwright.dev/):

```bash
# Run all end-to-end tests
npx playwright test

# Run a specific test suite
npx playwright test tests/e2e/suite-1-full-lifecycle-journey.spec.ts

# View HTML test report
npx playwright show-report
```

---

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or modification of any part of this repository is strictly prohibited.
