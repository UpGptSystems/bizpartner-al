# BizPartner AL

A production-ready full-stack marketplace platform built with Next.js, Express, PostgreSQL, and TypeScript.

## Features

- **Authentication** — JWT + Refresh tokens, Email/Password, OTP verification
- **Role-based Access** — Viewer, Publisher, Admin, Super Admin
- **Marketplace** — Job listings, Real estate, Products, Services
- **Premium Ads** — Featured, Premium, Urgent ad boosts
- **Admin Dashboard** — Listing moderation, user management, analytics
- **Real-time Chat** — Socket.io powered messaging
- **Notifications** — Real-time push notifications via socket
- **Payments** — Stripe subscriptions + one-time payments
- **Search & Filters** — Full-text, price range, location, category
- **Favorites** — Save and manage favorite listings
- **Analytics** — View tracking, event analytics
- **Dark/Light Mode** — System-aware theme switching
- **Responsive** — Mobile-first design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.io |
| Payments | Stripe |
| Storage | Cloudinary |
| State | Zustand + TanStack Query |
| Deploy | Docker + Docker Compose |

## Quick Start

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)

### 2. Setup via Docker (recommended)

```bash
# Clone / enter project
cd nexus-marketplace

# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Fill in environment variables (DATABASE_URL, JWT secrets, Stripe keys, etc.)
nano backend/.env
nano frontend/.env.local

# Start all services
docker compose up -d

# Run migrations & seed
docker exec nexus_backend npx prisma migrate deploy
docker exec nexus_backend npm run db:seed
```

### 3. Manual Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env    # fill in variables
npx prisma migrate dev
npm run db:seed
npm run dev             # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
cp .env.local.example .env.local  # fill in variables
npm run dev             # http://localhost:3000
```

## Default Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@bizpartner.al | Admin@1234 |
| Publisher | publisher@bizpartner.al | Publisher@1234 |

## Project Structure

```
nexus-marketplace/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Complete DB schema
│   │   └── seed.ts            # Data seeder
│   └── src/
│       ├── config/            # DB, logger, cloudinary, env
│       ├── controllers/       # Route handlers
│       ├── middleware/        # Auth, validation, rate limiting
│       ├── routes/            # API route definitions
│       ├── services/          # JWT, email, OTP, upload
│       ├── socket/            # Socket.io real-time
│       └── app.ts             # Express app entry
└── frontend/
    └── src/
        ├── app/               # Next.js App Router
        │   ├── (main)/        # Public pages
        │   ├── (auth)/        # Auth pages
        │   ├── (dashboard)/   # User dashboard
        │   └── (admin)/       # Admin panel
        ├── components/        # Reusable components
        │   ├── ui/            # Base UI components
        │   ├── layout/        # Navbar, Footer
        │   ├── marketplace/   # Listing cards, search
        │   └── providers/     # Query, Socket providers
        ├── hooks/             # React Query hooks
        ├── lib/               # API client, utilities
        ├── store/             # Zustand stores
        └── types/             # TypeScript types
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/refresh` — Refresh token
- `POST /api/auth/logout` — Logout
- `GET  /api/auth/me` — Current user
- `PUT  /api/auth/profile` — Update profile
- `POST /api/auth/verify-email` — Email verification
- `POST /api/auth/forgot-password` — Forgot password
- `POST /api/auth/reset-password` — Reset password

### Listings
- `GET  /api/listings` — Get listings (with filters)
- `GET  /api/listings/featured` — Featured listings
- `GET  /api/listings/:slug` — Get single listing
- `POST /api/listings` — Create listing (auth)
- `PUT  /api/listings/:id` — Update listing (auth)
- `DELETE /api/listings/:id` — Delete listing (auth)
- `POST /api/listings/:id/favorite` — Toggle favorite (auth)
- `GET  /api/listings/favorites` — Get favorites (auth)

### Chat
- `GET  /api/chat/conversations` — Get conversations
- `POST /api/chat/conversations` — Create conversation
- `GET  /api/chat/conversations/:id/messages` — Get messages
- `POST /api/chat/conversations/:id/messages` — Send message

### Payments
- `GET  /api/payments/plans` — Get plans
- `POST /api/payments/checkout` — Stripe checkout
- `POST /api/payments/webhook/stripe` — Stripe webhook
- `GET  /api/payments/my-subscription` — Current subscription

### Admin (ADMIN/SUPER_ADMIN only)
- `GET  /api/admin/stats` — Dashboard stats
- `GET  /api/admin/users` — List users
- `PUT  /api/admin/users/:id/status` — Update user
- `GET  /api/admin/listings` — List all listings
- `PUT  /api/admin/listings/:id/approve` — Approve listing
- `PUT  /api/admin/listings/:id/reject` — Reject listing
- `GET  /api/admin/analytics` — Analytics data

## Environment Variables

See `backend/.env.example` and `frontend/.env.local.example` for all required variables.

## License

MIT — Built with ❤️ for the Albanian market
