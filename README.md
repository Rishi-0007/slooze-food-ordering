# Slooze Food Ordering Application

A full-stack web-based food ordering application with Role-Based Access Control (RBAC) and country-based relational access.

## 🎯 Features

- **View Restaurants & Menu Items** - Browse available restaurants and their menus
- **Create Orders** - Add food items to cart
- **Checkout & Pay** - Complete orders with saved payment methods
- **Cancel Orders** - Cancel pending orders
- **Manage Payment Methods** - Add/modify payment methods (Admin only)

## 👥 Users & Roles

| Name | Role | Country |
|------|------|---------|
| Nick Fury | Admin | Org-wide |
| Captain Marvel | Manager | India |
| Captain America | Manager | America |
| Thanos | Member | India |
| Thor | Member | India |
| Travis | Member | America |

## 🔐 Role-Based Access Control

| Feature | Admin | Manager | Member |
|---------|-------|---------|--------|
| View restaurants & menu | ✅ | ✅ | ✅ |
| Create order | ✅ | ✅ | ✅ |
| Checkout & pay | ✅ | ✅ | ❌ |
| Cancel order | ✅ | ✅ | ❌ |
| Manage payment methods | ✅ | ❌ | ❌ |

## 🌍 Country-Based Access (Bonus)

Managers and Members can only access restaurants and data within their assigned country.

## 🛠️ Tech Stack

- **Backend**: NestJS · GraphQL · Prisma · PostgreSQL
- **Frontend**: Next.js · TypeScript · Tailwind CSS · Apollo Client

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (recommended) or PostgreSQL installed locally

### Installation


1. Clone the repository
```bash
git clone <repository-url>
cd slooze-food-ordering
```

2. Start the database (using Docker)
```bash
# Start PostgreSQL container
docker-compose up -d
```

3. Set up Backend
```bash
cd backend
npm install
```

4. Configure environment
```bash
cp .env.example .env
# Default config in .env.example works with the Docker setup provided.
# If running PostgreSQL locally without Docker, update DATABASE_URL in .env
```

5. Run database migrations and seed data
```bash
npx prisma migrate dev
npx prisma db seed
```

6. Start the backend server
```bash
npm run start:dev
```

7. Set up Frontend (Open a new terminal)
```bash
# Navigate to frontend directory from root
cd slooze-food-ordering/frontend
npm install
```

8. Start the frontend server
```bash
npm run dev
```

9. Open http://localhost:3000 in your browser

## 📁 Project Structure

```
slooze-food-ordering/
├── backend/          # NestJS GraphQL API
│   ├── prisma/       # Database schema & migrations
│   └── src/          # Source code
├── frontend/         # Next.js application
│   └── src/          # Source code
├── docker-compose.yml # Database configuration
└── README.md
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# E2E tests
cd backend && npm run test:e2e
```

## 📝 API Documentation

- **[Detailed API Documentation](./API_DOCS.md)**
- GraphQL Playground is available at `http://localhost:4000/graphql` when running the backend.

## Purpose

This project is build to submit for the full stack challenge of slooze.