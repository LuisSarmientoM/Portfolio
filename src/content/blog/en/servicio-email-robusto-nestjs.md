---
title: Building a robust email service in NestJS
description: A practical guide to building an email module with Handlebars, Nodemailer, and clean separation of concerns.
date: 2025-06-14
tags:
  - NestJS
  - Email
  - Nodemailer
  - Handlebars
---

Building a reliable and scalable email service is a core requirement in user-centered applications. Registration confirmations, password resets, reminders, and notifications all depend on it.

In this guide, I share a clean and modular way to implement it in NestJS.

## 1) Mail module structure

Create a dedicated module under `src/common/email`:

```bash
nest g mo common/email
nest g s common/email/sender
nest g s common/email/template
```

Expected structure:

```text
src/
├── common/
│   └── email/
│       ├── sender.service.ts
│       ├── template.service.ts
│       └── templates/
```

## 2) TemplateService with Handlebars

`TemplateService` compiles dynamic templates and caches them in memory.

```bash
npm install handlebars
```

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
        return { html: '', error: `Template "${template}" not found` };
      }

      const templateContent = readFileSync(templatePath, 'utf-8');
      this.templates.set(template, handlebars.compile(templateContent));
    }

    const compiledTemplate = this.templates.get(template);
    if (!compiledTemplate) {
      return { html: '', error: `Failed to retrieve compiled template "${template}"` };
    }

    try {
      return { html: compiledTemplate(context), error: null };
    } catch (error: any) {
      return { html: '', error: `Error rendering "${template}": ${error.message}` };
    }
  }
}
```

## 3) Email template

Create `src/common/email/templates/welcome-email.hbs`:

```hbs
<div class="container">
  <h1>Hello, {{name}}!</h1>
  <p>Thanks for signing up for our service. We are excited to have you on board.</p>
</div>
```

`{{name}}` is replaced with the context passed to the compiler.

## 4) SenderService with Nodemailer

Use Nodemailer for transport:

```bash
npm install nodemailer @types/nodemailer
```

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
      console.error('Transport verification failed:', error.message);
    }
  }

  async sendEmail(payload: IMailPayload): Promise<boolean> {
    const { to, subject, template, context, attachments, from } = payload;
    const { html, error } = this.templateService.compile(template, context ?? {});

    if (error) {
      console.error(`Template compilation failed '${template}': ${error}`);
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
      console.error(`Email send failed '${template}': ${error.message}`);
      return false;
    }
  }
}
```

## 5) Payload contract (`IMailPayload`)

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

## 6) Use it in controllers/services

```ts
@Post('send-welcome')
@HttpCode(HttpStatus.OK)
async sendWelcomeEmail(@Body() data: { name: string; email: string; confirmationLink: string }) {
  const emailSent = await this.senderService.sendEmail({
    to: data.email,
    from: 'no-reply@yourapp.com',
    subject: 'Welcome to our platform',
    template: 'welcome-email',
    context: {
      name: data.name,
      confirmationLink: data.confirmationLink,
    },
  });

  return emailSent
    ? { message: 'Email sent successfully' }
    : { message: 'Could not send email', status: HttpStatus.INTERNAL_SERVER_ERROR };
}
```

You can also send attachments (for example invoices) by including `attachments` in the payload.

## Final thoughts

This setup keeps responsibilities clear:

- templates and rendering,
- transport and delivery,
- business usage without tight coupling.

It is a simple, maintainable foundation ready to evolve with queues, retries, and event-driven flows.
