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
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd slooze-food-ordering
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Start the backend
```bash
npm run start:dev
```

6. Install frontend dependencies (new terminal)
```bash
cd frontend
npm install
```

7. Start the frontend
```bash
npm run dev
```

8. Open http://localhost:3000 in your browser

## 📁 Project Structure

```
slooze-food-ordering/
├── backend/          # NestJS GraphQL API
│   ├── prisma/       # Database schema & migrations
│   └── src/          # Source code
├── frontend/         # Next.js application
│   └── src/          # Source code
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

GraphQL Playground is available at `http://localhost:4000/graphql` when running the backend.

## 📄 License

© Slooze. All Rights Reserved.
