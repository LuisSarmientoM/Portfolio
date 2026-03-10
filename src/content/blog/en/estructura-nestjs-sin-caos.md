---
title: How to structure your NestJS app without losing your mind
description: A practical guide to common NestJS structures and when to use each one.
date: 2025-06-05
tags:
  - NestJS
  - Software architecture
  - Backend
  - Code structure
---

When you look at a modern NestJS application, you will usually see a clean, modular codebase. But there is one important truth: **there is no single correct way** to organize a NestJS project.

You can find many articles and templates with different folder structures. Some are very opinionated, others are flexible. None is universal. Some work great for enterprise projects but feel heavy for small apps. Others are simple and effective... until the app grows.

So what is the best structure? The one that matches **your team**, **your workflow**, and **your goals**.

In this post, I walk through common approaches, from basic to more advanced, and when each one is useful.

> Use what fits your context.

## 1) Types-based structure

> "My first NestJS structure". Probably true for most of us.

This is the simplest option for early-stage or very small projects. You organize by file type: controllers in one folder, services in another, DTOs in another.

```text
src/
├── controllers/    # Application controllers
├── services/       # Core business logic
├── utils/          # Shared utilities
├── main.ts         # Entry point
└── app.module.ts   # Root module
```

The advantage is clear mental simplicity.

The downside appears when the app grows. Related logic gets spread across many folders and navigation becomes slower.

Use it only if the app will stay small or short-lived.

## 2) Feature-based structure

> A natural step up: organize by what the system does, not by what a file is.

Here, you group by domain/feature (`users`, `auth`, `products`, `orders`). Each module keeps its own controllers, services, and DTOs.

```text
src/
├── commons/
│   ├── pipes/
│   ├── guards/
│   └── interceptors/
├── modules/
│   ├── users/
│   │   ├── dto/
│   │   └── services/
│   └── auth/
│       ├── strategies/
│       └── dto/
├── main.ts
└── app.module.ts
```

Benefits:

- Better feature isolation.
- Easier onboarding.
- Good scalability for small and medium teams.

Trade-offs:

- Repeated subfolders (`dto`, `services`) in many modules.
- Can still degrade without naming discipline.

Still, this is often the best middle ground.

## 3) Screaming Architecture

> "Do not tell me where technically, tell me what business capability this is."

This approach prioritizes business domains over technical layers. Folder names should "scream" what the product is about.

```text
src/
├── commons/
├── core/
│   ├── users/
│   ├── auth/
│   └── mail/
├── modules/
│   ├── clients/
│   ├── payments/
│   └── invoices/
├── config/
├── models/
├── main.ts
└── app.module.ts
```

Great for larger and long-lived systems with multiple teams.

Cost: you need clear domain boundaries. If the product is still evolving quickly, this can feel over-engineered early on.

## 4) Hexagonal, MVC, and DDD are not just folder templates

These are architectural mindsets, not directory presets.

- **Hexagonal (Ports and Adapters):** separates business core from infrastructure (HTTP, DB, messaging).
- **MVC:** useful in some contexts, but forcing strict MVC inside NestJS is often awkward.
- **DDD:** models code around real business concepts (entities, value objects, bounded contexts).

There is no one-size-fits-all answer. Project size, team maturity, and business complexity matter.

## 5) My current setup: a practical mix

I currently use a mixed structure: not dogmatic, not chaotic. It borrows ideas from stronger architectures while keeping delivery speed.

```text
src/
├── common/
│   ├── auth/
│   ├── decorators/
│   ├── email/
│   │   ├── templates/
│   │   └── email.module.ts
│   ├── filters/
│   ├── interceptors/
│   └── types/
├── config/
│   ├── config.module.ts
│   ├── configuration.ts
│   ├── database.module.ts
│   └── logger.module.ts
├── core/
│   ├── users/
│   └── auth/
├── models/
├── modules/
├── main.ts
└── app.module.ts
```

For example, `email/` lives under `common/` because it is a shared capability, not a business feature.

It is not perfect, but it works. That is what matters.

## Final thoughts

There is no universal "best" structure. There is only the structure that is right for **your context**.

If you are prototyping, keep it simple. If you are scaling with a team, feature/domain structure helps. If your domain is complex, Hexagonal or DDD may be worth the cost.

Try, adapt, and evolve.
