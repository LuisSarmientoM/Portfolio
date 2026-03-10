---
title: Cómo estructurar tu app de NestJS sin perder la cabeza
description: Una guía práctica de estructuras comunes en NestJS y cuándo usar cada una para escalar sin caos.
date: 2025-06-05
tags:
  - NestJS
  - Arquitectura de software
  - Backend
  - Estructura de código
---

Cuando miras una aplicación moderna en NestJS, normalmente ves una base de código modular y ordenada. Pero hay una verdad importante: **no existe una única forma correcta** de organizar un proyecto NestJS.

Vas a encontrar artículos, templates y repositorios con estructuras distintas: algunas muy opinionadas, otras flexibles. Ninguna es universal. Algunas funcionan perfecto en proyectos enterprise, pero son demasiado para apps pequeñas. Otras son simples y efectivas... hasta que el proyecto crece.

Entonces, ¿cuál es la mejor estructura? La que funciona para **tu equipo**, **tu flujo de trabajo** y **tus objetivos**.

En este post te comparto un recorrido práctico por varias estructuras comunes, de la más básica a enfoques más avanzados, y cuándo conviene usar cada una.

> Usa la que mejor se adapte a tu contexto.

## 1) Estructura por tipo

> "Fue mi primera estructura en NestJS". Probablemente la de casi todos.

Es la opción más simple para proyectos iniciales o muy pequeños. Organizas por tipo de archivo: controladores en un directorio, servicios en otro, DTOs en otro, etc.

```text
src/
├── controllers/    # Controladores de la aplicación
├── services/       # Lógica de negocio principal
├── utils/          # Utilidades compartidas
├── main.ts         # Punto de entrada
└── app.module.ts   # Módulo raíz
```

La ventaja principal es la simplicidad mental: sabes dónde va cada cosa.

El problema aparece cuando escalas. Si crecen los endpoints y los features, la lógica relacionada queda repartida en muchas carpetas, y navegar el proyecto se vuelve más costoso.

Úsala solo si tienes claro que la app será pequeña, temporal o con pocos cambios.

## 2) Estructura por feature

> Un paso natural: organizar por lo que hace cada parte, no por lo que es.

Aquí agrupas por dominio o feature (`users`, `auth`, `products`, `orders`). Dentro de cada módulo viven sus controladores, servicios y DTOs.

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

Ventajas:

- Mejor aislamiento de funcionalidades.
- Onboarding más claro para el equipo.
- Escala bien en proyectos pequeños y medianos.

Trade-offs:

- Se repiten subcarpetas (`dto`, `services`) en muchos módulos.
- Si no hay disciplina de nombres, igual puede degradarse.

Aun así, suele ser el mejor punto de equilibrio cuando sabes que el producto va a crecer.

## 3) Screaming Architecture

> "No me digas dónde está técnicamente, dime qué hace el negocio".

Esta idea prioriza el dominio del negocio por encima de la tecnología. La estructura debe "gritar" de qué trata tu producto.

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

Es ideal para proyectos grandes, de larga vida y con varios equipos. Mejora la separación de responsabilidades a nivel de negocio y facilita trabajo en paralelo.

El costo: necesitas una buena definición de límites de dominio. Si tu producto aún está tomando forma, puede sentirse sobrediseñada al inicio.

## 4) Hexagonal, MVC y DDD no son solo carpetas

Estos enfoques no son plantillas de directorios; son formas de pensar arquitectura.

- **Hexagonal (Ports and Adapters):** separa el core de negocio de infraestructura (HTTP, base de datos, mensajería). Muy útil en sistemas complejos y orientados a testing.
- **MVC:** puede servir en ciertos contextos, pero forzarlo en NestJS no siempre encaja, porque Nest ya separa por módulos/controladores/servicios.
- **DDD (Domain-Driven Design):** modela el código alrededor del negocio real (entidades, value objects, bounded contexts). Brilla en dominios complejos.

No hay una respuesta única. Depende del tamaño del proyecto, del equipo y de las decisiones técnicas de la organización.

## 5) Mi estructura actual: un mix pragmático

Hoy trabajo con una estructura mixta: no 100% académica, pero tampoco caótica. Toma ideas de enfoques robustos sin bloquear velocidad.

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

Por ejemplo, `email/` vive en `common/` porque es una capacidad transversal, no un módulo de negocio. Además usamos eventos internos para desacoplar flujos.

No es perfecta, pero funciona. Y eso es lo importante.

## Cierre

No existe una "mejor" estructura universal. Existe la estructura adecuada para **tu contexto**.

Si estás prototipando, una estructura simple puede ser suficiente. Si estás escalando con equipo, una estructura por feature o por dominio te dará más aire. Si el dominio es complejo, Hexagonal o DDD pueden justificar su costo.

Prueba, adapta y evoluciona. La arquitectura debe ayudarte a entregar mejor software, no convertirse en un fin en sí misma.
