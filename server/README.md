# OSU_Bachelor_Thesis - Server

Server part of the OSU Bachelor's Thesis "Digitization of school timetables for teaching rooms" (2023/24)

## Development

### Prerequisites

You need to have installed:

-   [nvm](https://github.com/nvm-sh/nvm),
-   [Docker](https://www.docker.com/),
-   [pnpm](https://pnpm.io/)

### Getting started

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
