# Healthcare SaaS Platform

Production-grade Healthcare SaaS platform built with:

- Next.js (Frontend)
- NestJS (Backend)
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- Docker
- Kubernetes
- Cloudflare
- Stripe + PayPal
- OpenSearch
- Socket.IO
- OpenAI
- Cloudflare R2

---

# Architecture Overview

Frontend:
- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- React Query
- TanStack Table

Backend:
- NestJS
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- JWT Authentication
- RBAC
- Multi-tenancy
- WebSockets
- OpenSearch
- AI Services

Infrastructure:
- Docker
- Kubernetes
- Cloudflare
- GitHub Actions
- Observability stack

---

# Project Structure

```bash
apps/
├── web/                 # Next.js frontend
├── api/                 # NestJS backend
packages/
├── ui/                  # Shared UI library
├── config/              # Shared configs
├── types/               # Shared TypeScript types
infrastructure/
├── docker/
├── kubernetes/
├── terraform/
```

---

# Local Development Setup

## 1. Clone Repository

```bash
git clone <repository-url>
cd healthcare-saas
```

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Environment Variables

Create:

```bash
apps/api/.env
apps/web/.env.local
```

Example backend environment:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/healthcare
JWT_SECRET=supersecret
REDIS_HOST=localhost
OPENAI_API_KEY=your_key
R2_ENDPOINT=your_endpoint
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
```

---

# Docker Setup

Start infrastructure:

```bash
docker compose up -d
```

Services:
- PostgreSQL
- Redis
- OpenSearch
- Mailhog

---

# Database Setup

Run Prisma migrations:

```bash
cd apps/api

npx prisma migrate dev
npx prisma generate
```

---

# Running the Application

Frontend:

```bash
cd apps/web
pnpm dev
```

Backend:

```bash
cd apps/api
pnpm start:dev
```

---

# Authentication Features

- Email/password login
- Registration
- JWT auth
- Refresh tokens
- Google OAuth
- RBAC
- Multi-tenant isolation

---

# Billing Features

- Stripe subscriptions
- Stripe Connect
- PayPal integration
- Webhook handling
- Subscription management

---

# Realtime Features

- WebSocket architecture
- Live notifications
- Organization rooms
- Presence systems

---

# AI Features

- AI summarization
- RAG pipelines
- Embeddings
- Vector search
- AI document processing

---

# Storage Features

- Cloudflare R2
- Signed upload URLs
- File metadata tracking
- Multi-tenant file isolation

---

# Search Features

- OpenSearch integration
- Full-text search
- Fuzzy search
- Global search architecture

---

# Production Features

- Kubernetes deployment
- CI/CD pipelines
- Observability
- Rate limiting
- Security hardening
- Audit logging
- Feature flags

---

# Recommended Commands

Lint:

```bash
pnpm lint
```

Tests:

```bash
pnpm test
```

Build:

```bash
pnpm build
```

---

# Deployment Targets

Recommended:
- Frontend → Vercel
- Backend → Kubernetes
- Database → Managed PostgreSQL
- Redis → Managed Redis
- Storage → Cloudflare R2

---

# Recommended Future Improvements

- HIPAA compliance workflows
- Advanced analytics
- AI copilots
- OCR pipelines
- Healthcare interoperability
- Event sourcing
- Advanced audit trails

---

# License

Private enterprise SaaS project.
