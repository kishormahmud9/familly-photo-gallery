# Family Photo Gallery

A private family photo management and gallery platform built with Next.js 16 App Router, TypeScript, Prisma ORM, and Neon PostgreSQL.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide Icons.
- **Backend & Database**: Next.js Route Handlers, TypeScript, Prisma ORM 7, Neon PostgreSQL.
- **Validation & Safety**: Zod schema validation, `@prisma/adapter-pg`, `server-only` guards.

---

## 🏗️ Architecture & Database Design

### System Overview
```
Client (App Router Pages)
        ↓
Next.js Route Handlers (/api/*)
        ↓
Validation Layer (Zod Schemas & Primitives)
        ↓
Service Layer (Business Logic)
        ↓
Repository / Data Access Layer
        ↓
Prisma Client (Singleton & PG Adapter)
        ↓
Neon PostgreSQL Database
```

### Entity Relationship Model
```
┌──────────────┐
│    Admin     │ (System Administrator Account)
├──────────────┤
│ id (cuid)    │
│ email (UQ)   │
│ password     │
│ name         │
│ role         │
└──────────────┘

┌──────────────┐             ┌──────────────┐
│    Album     │ 1         * │    Photo     │
├──────────────┼────────────<├──────────────┤
│ id (cuid)    │             │ id (cuid)    │
│ title        │             │ albumId (FK) │
│ description  │             │ imageUrl     │
│ coverUrl     │             │ thumbUrl     │
│ eventDate    │             │ filename     │
│ createdAt    │             │ title        │
│ updatedAt    │             │ description  │
└──────────────┘             │ createdAt    │
                             │ updatedAt    │
                             └──────────────┘
```

- **Storage Separation**: PostgreSQL stores photo metadata and relational links. Binary image assets are hosted externally.
- **Safe Relational Integrity**: Photo records belong strictly to an `Album` (`onDelete: Restrict`). Album deletion is guarded to prevent accidental loss of associated photos.
- **CUID Primary Keys**: Collision-resistant, URL-safe cuid keys across all models (`Admin`, `Album`, `Photo`).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or later
- **Package Manager**: `npm`
- **Database**: Neon PostgreSQL connection URL

### 1. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your Neon PostgreSQL connection string in `.env`:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<neon-hostname>/<dbname>?sslmode=require"
   ```
3. (Optional) Set seed credentials for initial admin setup:
   ```env
   ADMIN_EMAIL="admin@familyphoto.local"
   ADMIN_PASSWORD="your-secure-password"
   ```

### 2. Database Migration & Client Generation

Run the Prisma migration to synchronize your Neon database schema:
```bash
npx prisma migrate dev
```

Generate the Prisma Client:
```bash
npx prisma generate
```

### 3. Database Seeding

To create or verify the initial admin account (using credentials from `.env`):
```bash
npx prisma db seed
```
*Note: The seed script uses `bcryptjs` password hashing and is completely idempotent (safe to run multiple times without duplicating records).*

### 4. Running the Application

Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Best Practices

- **Zero Plaintext Passwords**: Admin passwords are strictly hashed using `bcrypt` (12 rounds) before database storage.
- **Server/Client Isolation**: Database connection logic and Prisma instances are isolated from client components using `import "server-only"`.
- **Environment Protection**: Sensitive keys (`DATABASE_URL`, `ADMIN_PASSWORD`) are server-only and excluded from version control via `.gitignore`.

---

## 📌 Phase Status

- [x] **Phase 1**: Backend Foundation & Shared Architecture
- [x] **Phase 2**: Database Architecture, Prisma Schema & Neon PostgreSQL
- [ ] **Phase 3**: Authentication & Authorization (Next Phase)
- [ ] **Phase 4**: Photo Upload & Storage Integration
- [ ] **Phase 5**: Album & Photo Management APIs
- [ ] **Phase 6**: Public & Admin Frontend Integration
