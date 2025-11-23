# DCS360 - Data Capability Solutions

A modern [Next.js 16](https://nextjs.org) application deployed on [Cloudflare Workers](https://workers.cloudflare.com/) with [OpenNext](https://opennext.js.org/cloudflare).

## 🚀 Tech Stack

- **Framework**: Next.js 16 with React 19
- **UI Library**: Ant Design with custom theming
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: Cloudflare Access
- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Validation**: Zod

## 📋 Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd project-mat
npm install
```

### 2. Environment Configuration

Create a `.env.local` file from the example:

```bash
cp .env.example .env.local
```

Edit `.env.local` for local development:

```bash
# Enable local development without Cloudflare Access
LOCAL_DEV_IDENTITY_ENABLED=true
LOCAL_DEV_USER_EMAIL=dev@dcs360.local
LOCAL_DEV_USER_NAME=Local Developer
```

> ⚠️ **Security Note**: NEVER commit `.env.local` to version control. It's already in `.gitignore`.

### 3. Database Setup

#### Local Development

Generate and apply database migrations locally:

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to local D1 database
npm run db:migrate:local
```

This creates a local SQLite database at `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/...`

#### Production

Apply migrations to production D1:

```bash
# Apply migrations to production
npm run db:migrate:prod
```

> 💡 **Note**: Make sure your D1 database exists in Cloudflare before running production migrations.

### 4. Cloudflare Configuration

The project uses Cloudflare D1 and R2. Make sure these are configured in `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "project-mat-db",
      "database_id": "your-database-id"
    }
  ],
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "project-mat-storage"
    }
  ]
}
```

Create these resources in Cloudflare Dashboard or via Wrangler:

```bash
# Create D1 database
wrangler d1 create project-mat-db

# Create R2 bucket
wrangler r2 bucket create project-mat-storage
```

## 🏃 Development

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

> 💡 The app uses Turbopack for fast hot-reloading.

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server (local)
npm run lint         # Run ESLint
npm run preview      # Preview on Cloudflare runtime locally
npm run deploy       # Build and deploy to Cloudflare
npm run upload       # Build and upload (no deployment)
```

### Database Scripts

```bash
npm run db:generate        # Generate migrations from schema
npm run db:migrate:local   # Apply migrations locally
npm run db:migrate:prod    # Apply migrations to production
npm run cf-typegen         # Generate Cloudflare types
```

## 🧪 Testing

Visit [http://localhost:3000/test-db](http://localhost:3000/test-db) to test:
- D1 database operations (CRUD)
- R2 file uploads
- Server actions with validation

> ⚠️ This page is automatically disabled in production unless `ENABLE_TEST_DB_PAGE=true` is set.

## 📦 Project Structure

```
project-mat/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── contracts/       # Data contracts page
│   │   ├── products/        # Data products page
│   │   ├── teams/           # Teams page
│   │   ├── settings/        # Settings page
│   │   ├── test-db/         # Database test page
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Dashboard
│   │   └── error.tsx        # Error boundary
│   ├── components/          # React components
│   │   ├── AppShell.tsx     # Main app shell with nav
│   │   └── views/           # Page view components
│   ├── db/                  # Database layer
│   │   ├── client.ts        # Database client
│   │   └── schema.ts        # Drizzle schema
│   └── lib/                 # Utilities
│       ├── auth.ts          # Authentication
│       ├── env.ts           # Environment validation
│       ├── logger.ts        # Logging utility
│       ├── result.ts        # Result type pattern
│       ├── theme.ts         # Theme constants
│       └── user.ts          # User types
├── migrations/              # Database migrations
├── public/                  # Static assets
├── wrangler.jsonc          # Cloudflare configuration
├── drizzle.config.ts       # Drizzle configuration
├── next.config.ts          # Next.js configuration
└── open-next.config.ts     # OpenNext configuration
```

## 🔒 Security Features

- ✅ Input validation with Zod schemas
- ✅ File upload restrictions (type, size)
- ✅ SQL injection protection (Drizzle ORM)
- ✅ XSS protection (React escaping)
- ✅ Production-only endpoints protection
- ✅ Environment variable validation
- ✅ Error boundaries for graceful failures
- ✅ Server-only code isolation

## 🎨 Features

- **Dark Mode**: Toggle between light/dark themes (persisted in localStorage)
- **Responsive Design**: Mobile-first with Ant Design components
- **Server Actions**: Type-safe form submissions with validation
- **Error Handling**: Global error boundaries and loading states
- **Authentication**: Cloudflare Access integration with local dev fallback
- **Database**: Type-safe database queries with Drizzle ORM
- **File Storage**: R2 bucket integration for file uploads

## 🚢 Deployment

### Deploy to Cloudflare

```bash
npm run deploy
```

This will:
1. Build the Next.js application
2. Generate OpenNext output optimized for Cloudflare Workers
3. Deploy to Cloudflare Workers

### Environment Variables in Production

Set production environment variables in Cloudflare Dashboard:
- Navigate to Workers & Pages > your-project > Settings > Variables
- Add any required environment variables (if any)

### Custom Domain

Configure your custom domain in `wrangler.jsonc`:

```jsonc
{
  "routes": [
    {
      "pattern": "yourdomain.com",
      "custom_domain": true
    }
  ]
}
```

## 📚 Learn More

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### Cloudflare
- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

### Drizzle ORM
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Test locally: `npm run dev`
5. Test on Cloudflare runtime: `npm run preview`
6. Submit a pull request

## 📝 License

[Add your license here]
