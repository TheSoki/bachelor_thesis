# OSU_Bachelor_Thesis - Server

Server part of the OSU Bachelor's Thesis "Digitization of school timetables for teaching rooms" (2023/24)

## Development

### Prerequisites

You need to have installed:

-   [nvm](https://github.com/nvm-sh/nvm),
-   [Docker](https://www.docker.com/),
-   [pnpm](https://pnpm.io/)

### Getting started

Setup environment variables.

```
cp .env.example .env
```

And update them accordingly to your environment.

Use nvm to install node.

```
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
