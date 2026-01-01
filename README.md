# We See You - Anonymous Abuse Reporting Platform

A community-powered platform for anonymously reporting abusive social media accounts on Instagram and X (Twitter).

## Features

- 🔒 **100% Anonymous Reporting** - Your identity is never revealed
- 🛡️ **Community Alerts** - Receive notifications when accounts are flagged by multiple users
- 📱 **Multi-Platform Support** - Report accounts on Instagram and X
- 👥 **Moderation Dashboard** - Admin tools for reviewing and verifying reports
- 🔔 **Real-time Notifications** - In-app alerts for community safety

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account

### Setup

1. Clone the repository:

```bash
git clone https://github.com/Mohan-dhee/we_see_you.git
cd we_see_you
```

2. Install dependencies:

```bash
npm install
```

3. Create a Supabase project at [supabase.com](https://supabase.com)

4. Run the database schema:

   - Go to SQL Editor in your Supabase dashboard
   - Copy and run the contents of `supabase/schema.sql`

5. Configure Google OAuth:

   - Go to Authentication > Providers > Google in Supabase
   - Follow the setup instructions to configure Google OAuth

6. Create `.env.local`:

```bash
cp .env.example .env.local
```

7. Fill in your Supabase credentials in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

8. Run the development server:

```bash
npm run dev
```

9. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

- **profiles** - User profiles with display names and preferences
- **accounts** - Flagged social media accounts
- **reports** - Individual abuse reports
- **notifications** - User notifications for community alerts
- **audit_logs** - Moderator action logging

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## License

MIT License - See LICENSE file for details.
