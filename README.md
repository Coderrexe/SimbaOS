# SimbaOS - Personal Command Center

A production-grade personal dashboard for founders and builders. Track goals, tasks, habits, and weekly reviews in one place with intelligent prioritization and momentum tracking.

## Screenshots

![SimbaOS Command Center](images/app1.png)

_The command center with JARVIS-style header, task management, and Pomodoro timer_

## Features

### Core Modules

- **Command Center (Home)**: Your cockpit showing what matters right now
  - Top 3 priorities with smart prioritization
  - Next actions queue (sorted by leverage + urgency)
  - Today's calendar snapshot
  - Alerts for overdue tasks, stagnating projects, habit streaks at risk
  - "One thing to move the needle" suggestion

- **Tasks & Projects**: Notion-like but opinionated
  - Tasks with priority, impact, energy level, context, estimated time
  - Projects with mission, desired outcome, next action, weekly goals
  - Views: Inbox, Today, This Week, Overdue, Waiting On, Deep Work, Quick Wins
  - Frictionless capture bar

- **Goals / OKRs**: Founder-mode goal tracking
  - North Star (long-term identity goals)
  - Quarterly OKRs
  - Weekly commitments
  - Progress tracking with input metrics (hours, iterations, outreach)

- **Habits & Health**: Minimal, useful tracking
  - Track: sleep, exercise, deep work, reading, language, journaling, social
  - Quick daily check-in (<30 seconds)
  - Trend analysis and risk alerts

- **Weekly Review**: The killer feature
  - Guided Sunday flow: wins, what moved the needle, time sinks, lessons
  - Plan next week: 3 outcomes + deep work blocks
  - Historical trends

- **Metrics Dashboard**: Clean charts for what matters
  - Deep work hours (weekly)
  - Output shipped (count of artifacts)
  - Fitness sessions
  - Sleep average
  - Relationships touchpoints
  - **Founder Momentum Score** (computed weekly)

### Algorithmic Features

#### Task Prioritization Engine

Ranks tasks by:

- Impact (1-5)
- Urgency (due date proximity)
- Effort (estimated minutes - favors quick wins)
- Leverage multiplier if linked to goal/OKR
- Stagnation penalty (ignored for many days)

#### Founder Momentum Score

Weekly score (0-100) based on:

- Deep work hours (normalized to 20h/week target)
- Output shipped count (normalized to 5/week)
- Sleep penalty if avg < 7h
- Exercise bonus
- Transparent formula with tunable constants

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS with modern glassmorphic design system
- **Animations**: Framer Motion for complex animations and micro-interactions
- **UI Components**: Radix UI primitives with custom styling
- **Database**: PostgreSQL (Neon/Supabase/Railway compatible)
- **ORM**: Prisma
- **Auth**: NextAuth.js with Google OAuth + credentials provider
- **Icons**: Lucide React
- **Charts**: Recharts
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (local or hosted)

### Installation

1. **Clone the repository**

```bash
cd SimbaOS
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/simbaos?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: Google OAuth (for "Sign in with Google")
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

**Google OAuth Setup** (Optional): See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed instructions on setting up Google Sign-In. You can skip this and use email/password authentication instead.

4. **Set up the database**

Push the Prisma schema to your database:

```bash
npm run db:push
```

Or create and run migrations:

```bash
npm run db:migrate
```

5. **Seed the database** (optional - creates demo user)

```bash
npm run db:seed
```

This creates a demo user:

- Email: `demo@simbaos.com`
- Password: `demo123`

6. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Create a new project on Vercel**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Set up environment variables** in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_URL`: Your production URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET`: Same secret from development (or generate a new one)

4. **Deploy**
   - Vercel will automatically build and deploy
   - Run database migrations after first deploy:
   ```bash
   npx prisma migrate deploy
   ```

### Database Options

**Neon** (Recommended for Vercel):

```bash
# Sign up at neon.tech
# Copy connection string to DATABASE_URL
```

**Supabase**:

```bash
# Sign up at supabase.com
# Create a new project
# Copy Postgres connection string (not the Supabase client URL)
```

**Railway**:

```bash
# Sign up at railway.app
# Create a new PostgreSQL database
# Copy connection string
```

## Data Model Overview

### Core Entities

- **User**: Authentication and tenant isolation
- **Task**: Title, notes, due date, priority (1-5), impact (1-5), energy level, context, status, estimated minutes
- **Project**: Name, mission, desired outcome, next action, stuck reason, weekly goal, status
- **Goal**: Title, description, type (North Star/Quarterly/Weekly), target date, progress (0-100), status
- **Habit**: Name, type, target frequency, unit
- **HabitLog**: Date, value, notes (linked to habit)
- **Metric**: Date, type, value (for tracking deep work, output, sleep, etc.)
- **WeeklyReview**: Week start, wins, moved needle, time sinks, lessons, next week outcomes

All records are scoped to `userId` for multi-tenant support.

## Key Shortcuts

- `Cmd+K` (or `Ctrl+K`): Open command palette (coming soon)
- Quick task capture from any page
- Keyboard navigation in lists

## Export / Import

Export your data:

```
GET /api/export
```

Returns a JSON file with all your data. Save this regularly as backup.

Import functionality: Manual via database (import feature in roadmap).

## Running Tests

```bash
npm test
```

Tests cover:

- Task prioritization algorithm
- Founder momentum score calculation
- Alert generation logic

## Development

### Project Structure

```
SimbaOS/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── auth/           # Auth pages (signin, signup)
│   │   ├── dashboard/      # Main dashboard
│   │   └── ...             # Other pages (tasks, goals, habits, etc.)
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── ...            # Feature components
│   ├── lib/               # Utilities and business logic
│   │   ├── algorithms.ts  # Prioritization & momentum score
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Helper functions
│   └── types/             # TypeScript type definitions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data script
├── tests/                 # Jest tests
└── public/               # Static assets
```

### Database Management

View database in Prisma Studio:

```bash
npm run db:studio
```

Create a new migration:

```bash
npm run db:migrate
```

Reset database (⚠️ deletes all data):

```bash
npx prisma migrate reset
```

## Extending SimbaOS

### Adding a New Metric Type

1. Add to `MetricType` enum in `prisma/schema.prisma`
2. Update momentum score calculation in `src/lib/algorithms.ts`
3. Add UI in metrics dashboard

### Adding a New Habit Type

1. Add to `HabitType` enum in `prisma/schema.prisma`
2. Update habits UI to support new type

### Customizing Prioritization

Edit `calculateTaskPriority()` in `src/lib/algorithms.ts`:

- Adjust weight multipliers
- Add new factors (tags, assignees, etc.)

### Customizing Momentum Score

Edit `calculateFounderMomentumScore()` and `DEFAULT_MOMENTUM_CONFIG` in `src/lib/algorithms.ts`:

- Change target values (e.g., 20h deep work → 30h)
- Adjust weights
- Add new input metrics

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull
```

### Auth Issues

- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear cookies and try again

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Roadmap

- [ ] Command Palette (Cmd+K) with fuzzy search
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Mobile app (React Native)
- [ ] AI-powered suggestions
- [ ] Team/collaboration features
- [ ] Public API
- [ ] Zapier/Make integrations
- [ ] Weekly email digest
- [ ] Dark/light theme toggle

## Philosophy

SimbaOS is designed around these principles:

1. **High signal, low friction**: Capture should be instant, reviews should be quick
2. **Inputs over outcomes**: Track what you control (hours worked) not just results
3. **Transparency**: Show the formulas, make algorithms tunable
4. **Single source of truth**: One place for everything that matters
5. **Founder-optimized**: Built for builders shipping products, not productivity hobbyists

## Contributing

This is a personal project, but suggestions and bug reports are welcome via issues.

## License

MIT License - feel free to fork and customize for your own use.

## Support

For issues or questions:

- Open a GitHub issue
- Check existing issues for solutions

---

**Built for founders who ship.**
