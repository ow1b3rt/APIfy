# APIfy

APIfy is a modular backend starter built with Node.js, Express, PostgreSQL,
Drizzle ORM, Zod, JWT authentication, and role-based access control.

Start with a secure core backend and pull only the features your project needs.
Routes and database schema exports are regenerated automatically whenever a
feature is added or removed.

## What you get

Every APIfy project starts with:

- Express 5 application structure
- PostgreSQL with Drizzle ORM
- Authentication using access and refresh tokens
- Signed, HTTP-only authentication cookies
- Users and role-based authorization
- Media uploads
- Request validation with Zod
- Search, filtering, and pagination utilities
- Centralized error handling
- Dynamic feature route discovery
- Generated Drizzle schema exports
- Docker Compose configuration for PostgreSQL
- Admin creation and password-management commands

## Requirements

- Bash
- Git
- Node.js 20 or newer
- pnpm
- Docker and Docker Compose, if using the included PostgreSQL container
- OpenSSL, recommended for automatic secret generation

## Install the CLI

Download the latest release:

```bash
curl -fL \
  https://github.com/ow1b3rt/apify/releases/latest/download/apify.sh \
  -o apify.sh

chmod +x apify.sh
```

Alternatively, install it as a global command:

```bash
sudo install -m 0755 apify.sh /usr/local/bin/apify
```

You can then use either `./apify.sh` or `apify` in the examples below.

## Create a backend

Start the interactive initializer:

```bash
./apify.sh init my-backend
```

APIfy clones the source repository, installs the core, asks which optional
features you want, generates the schema index, creates `.env`, and copies the
CLI into the generated project.

Create a project non-interactively:

```bash
./apify.sh init my-backend \
  --features blogs,notices,education \
  --install \
  --git
```

Available initialization options:

| Option | Effect |
|---|---|
| `--features <list>` | Installs a comma- or space-separated feature list |
| `--features all` | Installs every optional feature |
| `--install` | Runs `pnpm install` after initialization |
| `--git` | Initializes a fresh Git repository for the generated project |

The cloned APIfy Git history is removed before the new project is returned.

## Core features

These features are always installed:

| Feature | Responsibility |
|---|---|
| `auth` | Login, logout, refresh tokens, current-user endpoint |
| `users` | User management, roles, password hashing |
| `media` | Media records and controlled file uploads |

Core features cannot be removed.

## Optional features

| Feature | Description | Automatic dependencies |
|---|---|---|
| `authors` | Author profiles connected to users | Core users |
| `blogs` | Draft/published blogs, ownership and SEO fields | `authors` |
| `careers` | Job applications and uploaded résumés | `jobs` |
| `contact` | Public contact submissions | None |
| `countries` | Country content | None |
| `education` | Students, classes and registrations | Installed as one bundle |
| `events` | Event content | Core media |
| `jobs` | Job listings | Core media |
| `layouts` | JSON frontend-layout storage | None |
| `notices` | Notices with optional media | Core media |
| `nrb` | Nepal Rastra Bank foreign-exchange endpoint | None |
| `partners` | Partner records and logos | Core media |
| `successProfiles` | Student success profiles by country | `countries` |
| `visitors` | Visitor inquiry records | None |

## Manage features

Run feature commands from inside the generated project.

List available and installed features:

```bash
./apify.sh list
```

Add one feature:

```bash
./apify.sh add blogs
```

Add multiple features:

```bash
./apify.sh add blogs notices contact
```

Comma-separated names also work:

```bash
./apify.sh add blogs,notices,contact
```

`pull` is an alias for `add`:

```bash
./apify.sh pull careers
```

The longer feature syntax is also supported:

```bash
./apify.sh feature add visitors
./apify.sh feature pull notices
./apify.sh feature remove visitors
./apify.sh feature list
```

Remove a feature:

```bash
./apify.sh remove notices
```

APIfy refuses to remove a feature while another installed feature depends on
it. For example, remove `careers` before removing `jobs`:

```bash
./apify.sh remove careers
./apify.sh remove jobs
```

After every addition or removal, APIfy regenerates:

```text
db/schema/index.js
```

## Education bundle

Students, classes, and registrations are installed together because they form
one domain boundary:

```bash
./apify.sh add education
```

The following aliases all select the education bundle:

```bash
./apify.sh add students
./apify.sh add classes
./apify.sh add registrations
```

Remove the complete bundle with:

```bash
./apify.sh remove education
```

## Check project consistency

Run the built-in structural check:

```bash
./apify.sh doctor
```

It checks the installed-feature state, verifies required directories, and
regenerates the schema export file.

## Start the backend

```bash
cd my-backend

pnpm install
docker compose up -d
pnpm db:push
pnpm newadmin -- admin@example.com strong-password
pnpm dev
```

The API starts on the port configured in `.env`, which defaults to `5000`.

Check it with:

```bash
curl http://localhost:5000/health
```

## Database commands

Push the schema directly during local development:

```bash
pnpm db:push
```

Generate and apply migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Open Drizzle Studio:

```bash
pnpm db:studio
```

Regenerate the schema barrel manually:

```bash
pnpm schema:index
```

## Admin commands

Create an administrator:

```bash
pnpm newadmin -- admin@example.com strong-password
```

Change an administrator password:

```bash
pnpm passwd -- admin@example.com new-strong-password
```

If the authors feature is installed when an administrator is created, APIfy
also creates the corresponding author profile.

## Environment configuration

Initialization copies `.env.example` to `.env`. When OpenSSL is available,
APIfy generates random values for:

```env
JWT_SECRET=
JWT_REFRESH_SECRET=
COOKIE_SECRET=
```

Review these values before running the project:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://postgres:password@localhost:5432/appify
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=appify

CLIENT_URL=http://localhost:3000
DOMAIN_NAME=http://localhost:5000
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
TRUST_PROXY=false
COOKIE_SAME_SITE=lax
```

Never commit `.env`.

## Use a branch or release

Set `APIFY_REF` to initialize and pull features from a particular branch or
tag:

```bash
APIFY_REF=v1.0.0 ./apify.sh init my-backend
```

Inside the generated project:

```bash
APIFY_REF=v1.0.0 ./apify.sh pull blogs
```

If `APIFY_REF` is omitted, Git uses the repository's default branch.

## Use a fork or private repository

Override the source repository:

```bash
APIFY_REPOSITORY=https://github.com/my-account/apify.git \
  ./apify.sh init my-backend
```

SSH is supported:

```bash
APIFY_REPOSITORY=git@github.com:ow1b3rt/apify.git \
  ./apify.sh init my-backend
```

Private repositories require Git credentials or SSH keys to be configured
before running APIfy.

## Generated structure

```text
my-backend/
├── .apify/
│   └── installed-features
├── common/
├── config/
├── db/
│   └── schema/
│       └── index.js
├── features/
│   ├── auth/
│   ├── media/
│   ├── users/
│   └── ...selected features
├── public/
│   └── uploads/
├── scripts/
├── .env
├── .env.example
├── apify.sh
├── app.js
├── docker-compose.yml
├── drizzle.config.js
├── package.json
└── server.js
```

## How modular loading works

Each active feature owns its routes, schemas, repositories, services,
controllers, policies, and database definitions.

At startup, `features/index.js` discovers route files matching:

```text
*.routes.js
*_routes.js
routes.js
```

If a feature folder is named `notices`, its router is mounted at:

```text
/api/notices
```

Database definitions use static generated exports instead of runtime
top-level `await`, so Drizzle Kit and esbuild can load them reliably.

## Important behavior

- Adding an already installed feature does not overwrite local changes.
- `pull` installs missing features; it does not update installed features.
- Removing a feature deletes its source directory but does not automatically
  drop database tables. Create and review a migration for database removal.
- Feature operations use a temporary sparse Git checkout and clean it up when
  finished.
- Keep using the same `APIFY_REPOSITORY` and `APIFY_REF` overrides for future
  feature pulls when a project was initialized from a fork or release branch.

## Help

```bash
./apify.sh help
./apify.sh --help
./apify.sh -h
```
