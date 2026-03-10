---
title: Construyendo un servicio de email robusto en NestJS
description: Guía práctica para construir un módulo de correo escalable con Handlebars, Nodemailer y enfoque event-driven.
date: 2025-06-14
tags:
  - NestJS
  - Email
  - Nodemailer
  - Handlebars
---

Construir un servicio de correo confiable y escalable es una pieza clave en cualquier aplicación centrada en usuarios. Confirmaciones de registro, recuperación de contraseña, recordatorios y notificaciones personalizadas dependen de esto.

En esta guía te comparto una forma modular y práctica de implementarlo en NestJS.

## 1) Estructura del módulo de mail

Para mantener responsabilidades claras, crea un módulo dedicado en `src/common/email`.

```bash
nest g mo common/email
nest g s common/email/sender
nest g s common/email/template
```

Estructura esperada:

```text
src/
├── common/
│   └── email/
│       ├── sender.service.ts
│       ├── template.service.ts
│       └── templates/
```

## 2) TemplateService con Handlebars

`TemplateService` se encarga de compilar templates dinámicos y cachearlos en memoria.

```bash
npm install handlebars
```

Ejemplo de implementación:

```ts
import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class TemplateService {
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();
  private readonly templatesPath = join(__dirname, 'templates');

  compile(template: string, context: Record<string, any>): { html: string; error: string | null } {
    if (!this.templates.has(template)) {
      const templatePath = join(this.templatesPath, `${template}.hbs`);

      if (!existsSync(templatePath)) {
        return { html: '', error: `Template "${template}" no encontrado` };
      }

      const templateContent = readFileSync(templatePath, 'utf-8');
      this.templates.set(template, handlebars.compile(templateContent));
    }

    const compiledTemplate = this.templates.get(template);
    if (!compiledTemplate) {
      return { html: '', error: `No se pudo recuperar el template compilado "${template}"` };
    }

    try {
      return { html: compiledTemplate(context), error: null };
    } catch (error: any) {
      return { html: '', error: `Error renderizando "${template}": ${error.message}` };
    }
  }
}
```

## 3) Plantilla de correo

Crea `src/common/email/templates/welcome-email.hbs`:

```hbs
<div class="container">
  <h1>Hola, {{name}}!</h1>
  <p>Gracias por registrarte en nuestro servicio. Nos alegra tenerte aquí.</p>
</div>
```

`{{name}}` se reemplaza con el contexto enviado al compilar.

## 4) SenderService con Nodemailer

Para el envío, usa Nodemailer:

```bash
npm install nodemailer @types/nodemailer
```

Ejemplo de servicio:

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { TemplateService } from './template.service';
import { IMailPayload } from './interfaces/mail.interface';

@Injectable()
export class SenderService implements OnModuleInit {
  private transporter: Transporter;

  constructor(private templateService: TemplateService) {}

  async onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    try {
      await this.transporter.verify();
    } catch (error: any) {
      console.error('Falló la verificación del transporter:', error.message);
    }
  }

  async sendEmail(payload: IMailPayload): Promise<boolean> {
    const { to, subject, template, context, attachments, from } = payload;
    const { html, error } = this.templateService.compile(template, context ?? {});

    if (error) {
      console.error(`Error compilando template '${template}': ${error}`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        attachments,
      });

      return true;
    } catch (error: any) {
      console.error(`Error enviando correo con template '${template}': ${error.message}`);
      return false;
    }
  }
}
```

## 5) Contrato de envío (`IMailPayload`)

```ts
export interface IMailPayload {
  to: string | string[];
  from: string;
  subject: string;
  template: string;
  context?: Record<string, any>;
  attachments?: any[];
}
```

## 6) Uso desde controllers o servicios

```ts
@Post('send-welcome')
@HttpCode(HttpStatus.OK)
async sendWelcomeEmail(@Body() data: { name: string; email: string; confirmationLink: string }) {
  const emailSent = await this.senderService.sendEmail({
    to: data.email,
    from: 'no-reply@tuapp.com',
    subject: 'Bienvenido a nuestra plataforma',
    template: 'welcome-email',
    context: {
      name: data.name,
      confirmationLink: data.confirmationLink,
    },
  });

  return emailSent
    ? { message: 'Correo enviado correctamente' }
    : { message: 'No se pudo enviar el correo', status: HttpStatus.INTERNAL_SERVER_ERROR };
}
```

También puedes enviar adjuntos (por ejemplo, facturas) agregando `attachments` al payload.

## Cierre

Con esta estructura separas responsabilidades de forma clara:

- templates y renderizado por un lado,
- envío por otro,
- y uso desde negocio sin acoplamiento fuerte.

Es una base simple y mantenible, lista para evolucionar con colas, reintentos y flujos event-driven más robustos.
