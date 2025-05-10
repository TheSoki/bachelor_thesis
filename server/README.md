# Bachelor Thesis - Server

Server part of the bachelor thesis "Digitization of school timetables for teaching rooms" at University of Ostrava

## Development

### Prerequisites

You need to have installed:

- [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm),
- [Docker](https://www.docker.com/),
- [pnpm](https://pnpm.io/)

### Getting started

Setup environment variables.

```
cp .env.example .env
```

And update them accordingly to your environment.

Use Volta to install node and pnpm.

```
volta install node@20.10.0 pnpm@9.1.0
```

or use nvm

```bash
nvm install
```

```bash
nvm use
```

Setup database docker.

```
docker-compose -f docker-compose.local.yaml up -d
```

Install dependencies.

```
pnpm i
```

Apply migrations.

```
pnpm run migrate:up
```

Seed database.

```
pnpm run migrate:seed
```

Now you can run the app.

```
pnpm run dev
```

### Add Components

We use [shadcn-ui](https://ui.shadcn.com) as our styling framework. This command will create a basic `button` that you can later edit at `/src/client/shadcn/ui/button.tsx`.

```bash
npx shadcn@latest add button
```

A list of all components can be found [here](https://ui.shadcn.com/docs/components/button).

### Static Code Analysis

Check by running:

```bash
pnpm run integrate
```

### Formatting

To format, either set "Format on Save" in VSCode or run:

```bash
pnpm run format
```

### Environment Variables

To add environment variables, add them to `.env.example` file with values that will work for local development.

### Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end (E2E) testing.

#### Seeding for Testing

Seed the database with test data specifically for E2E tests:

```bash
pnpm run migrate:seed:test
```

This will populate the database with a test dataset used as the base for end-to-end testing.

#### Running E2E Tests

Before running the E2E tests, install the Playwright dependencies:

```bash
pnpm exec playwright install
```

To execute the E2E tests, use:

```bash
pnpm run test:e2e
```

To run tests interactively in the Playwright UI for debugging purposes, use:

```bash
pnpm run test:e2e:ui
```

The Playwright UI provides a visual interface for debugging and stepping through tests.

## Production

Run docker-compose.

```
docker-compose -f docker-compose.prod.yaml up -d
```

Run migrations.

```
docker-compose -f docker-compose.prod.yaml exec server pnpm run migrate:up
```

Seed database.

```
docker-compose -f docker-compose.prod.yaml exec server pnpm run migrate:seed
```
