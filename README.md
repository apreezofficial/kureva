# Kureva — Wishlist & Occasion Platform

Kureva (inspired by Japanese concepts of *kanso* (simplicity), *shibui* (understated beauty), and *ma* (intentional negative space)) is a cozy, modern combination of a wishlist platform, gift registry, occasion planner, and shareable gift collection.

Designed to feel like a beautiful personal story catalog rather than a corporate e-commerce site, Kureva balances clean visual hierarchy with small, delightful interactions.

---

## Technical Architecture

The codebase is split into two independent modules:
1. **`/kureva-api` (Backend)**: Pure Vanilla PHP 8.x REST API utilizing PDO, raw SQL prepared statements, and custom session token auth. Implements server-side SSRF-protected metadata preview parsers (with adapters for Jumia, Amazon, Shopify).
2. **`/kureva-web` (Frontend)**: Next.js 15 App Router, React, TypeScript, and Tailwind CSS. Responsive, mobile-first, and lightweight.

---

## Directory Structure

```
kureva/
├── kureva-api/               # Vanilla PHP REST API
│   ├── database/             # Schema migrations and seeders
│   │   ├── schema.sql
│   │   ├── migrate.php
│   │   └── seed.php
│   ├── public/               # Public entrypoint
│   │   └── index.php
│   └── src/                  # Controllers, Middleware, Services
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       └── services/
└── kureva-web/               # Next.js App Router Frontend
    ├── src/
    │   ├── app/              # Routes & layouts
    │   ├── components/       # Reusable components
    │   └── lib/              # Client API, auth context
    ├── package.json
    └── tailwind.config.js
```

---

## Features Built

- **Cozy & Minimalist UI**: Tailwind theme styled with off-whites, neutral grays, and intentional green accents (`#2F7D57`).
- **Complete Auth System**: Registration, Login, Session Management, and automatic header-token injection.
- **Wishlist CRUD**: Manage private, unlisted, and public collections. Include copy-to-clipboard public link generation.
- **SSRF-Protected URL Preview**: Safe cURL fetcher with manual redirect checking that blocks local IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`, etc.) and cloud metadata endpoints.
- **Gift Reservation & Surprise System**: Visitors can mark items as reserved or purchased, hiding them for future guests while maintaining the surprise for the owner.
- **Occasions & Countdowns**: Digital invitations featuring elegant date countdowns, custom locations, and attaching multiple wishlists.
- **Public Profile Finder**: Discovery profiles resolving dynamic handles (e.g. `kureva.com/@sarah`).

---

## Setup & Running the Application

### 1. Database Setup
Kureva is configured by default to connect to **MySQL/MariaDB** (using `.env` credentials). If a connection fails, it **automatically falls back to a local SQLite database** (`database/database.sqlite`), allowing out-of-the-box operation.

Navigate to `/kureva-api` and run the migration and seeding scripts:
```bash
cd kureva-api

# Run Migrations
php database/migrate.php

# Seed Demo Data (Creates user 'sarah' with password 'kureva123')
php database/seed.php
```

### 2. Start the Backend API
Start PHP's built-in development server on port 8000:
```bash
php -S 127.0.0.1:8000 -t public
```
The API is now running at `http://localhost:8000`.

### 3. Start the Frontend
In another terminal, navigate to `/kureva-web`, install dependencies, and start the development server:
```bash
cd kureva-web
npm install
npm run dev
```
The client is now running at `http://localhost:3000`.

---

## Demo Credentials

You can sign in immediately using:
- **Username / Email**: `sarah` or `sarah@kureva.com`
- **Password**: `kureva123`
