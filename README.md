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
   ADMIN_EMAIL="mahmudkishor9@gmail.com"
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
*Note: The seed script uses `Argon2id` password hashing and is completely idempotent (safe to run multiple times without duplicating records).*

### 4. Running the Application

Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Best Practices

- **Argon2id Hashing**: Admin passwords are strictly hashed using `Argon2id` before database storage.
- **HTTP-Only Cookies & JWT**: Sessions are managed with signed JWT tokens inside HTTP-only, secure, SameSite cookies.
- **Server/Client Isolation**: Database connection logic and Prisma instances are isolated from client components using `import "server-only"`.
- **Environment Protection**: Sensitive keys (`DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`) are server-only and excluded from version control via `.gitignore`.

---

## 🔑 Authentication APIs

- `POST /api/auth/login`: Admin authentication endpoint.
- `GET /api/auth/me`: Returns current authenticated admin session.
- `POST /api/auth/logout`: Invalidates session and clears HTTP-only cookie.
- `POST /api/auth/change-password`: Protected password update endpoint (Argon2id).

---

## 📁 Album APIs

- `GET /api/albums`: Retrieve all albums with photo count (Public).
- `GET /api/albums/:id`: Retrieve single album details by ID with photo count (Public).
- `POST /api/albums`: Create a new album (Admin Only).
- `PUT /api/albums/:id`: Edit album metadata (Admin Only).
- `DELETE /api/albums/:id`: Delete empty album. Returns `409 Conflict` if album contains photos (Admin Only).

---

## ☁️ Photo Upload & Storage APIs

- `POST /api/photos/upload`: Multipart image upload endpoint (Admin Only). Uploads validated binary images to Cloudinary (`family-photo-gallery/{env}/albums/{albumId}/photos`) and persists photo metadata & transformation URLs to Neon PostgreSQL.
- `GET /api/photos`: Paginated, searchable, album-filterable photo list endpoint (Public).
- `GET /api/photos/:id`: Retrieve single photo details (Public).
- `PUT /api/photos/:id`: Edit photo metadata or relocate to another album (Admin Only).
- `DELETE /api/photos/:id`: Single photo deletion endpoint. Removes asset from Cloudinary and deletes database record (Admin Only).
- `POST /api/photos/bulk-delete`: Bulk photo deletion endpoint (Admin Only).
- `POST /api/photos/bulk-move`: Bulk photo album reassignment endpoint (Admin Only).

## 👥 Family Member / People APIs

- `GET /api/people`: Retrieve all family member profiles (Public).
- `GET /api/people/:id`: Retrieve single family member profile by ID (Public).
- `POST /api/people`: Create a new family member profile (Admin Only).
- `PUT /api/people/:id`: Edit family member profile (Admin Only).
- `DELETE /api/people/:id`: Delete family member profile (Admin Only).

---

## 🛡️ Admin vs. Public Data Strategy

- **Admin Management Pages**: Strictly render live data from Neon PostgreSQL. When a database table is empty (`0` items), Admin UI renders a clean empty state. **Admin pages never fall back to mock data.**
- **Public Presentation Pages**: Load live database data first. If the database is empty, public presentation pages fall back to demo content to maintain visual aesthetics.

---

## 📌 Phase Status

- [x] **Phase 1**: Backend Foundation & Shared Architecture
- [x] **Phase 2**: Database Architecture, Prisma Schema & Neon PostgreSQL
- [x] **Phase 3**: Admin Authentication & Security
- [x] **Phase 4**: Album Management & Project Git Hygiene
- [x] **Phase 5**: Photo Upload & Storage Integration (Cloudinary)
- [x] **Phase 6**: Photo Management, Cloudinary Asset Lifecycle & Verification
- [x] **Phase 7**: End-to-End Frontend ↔ Backend Integration & Real Data Persistence

