# Database Seeding

## Purpose of `supabase/seed.sql`

The `supabase/seed.sql` file contains SQL statements to create initial users in the Supabase authentication system. This file is used to populate the database with default users for development and testing purposes.

## Two Ways to Run

### Using psql

```bash
DATABASE_URL=postgres://user:password@host:port/database npm run db:seed:psql
```

### Using Supabase CLI

```bash
SUPABASE_DB_URL=postgres://user:password@host:port/database npm run db:seed:supabase
```

## ⚠️ Important Warnings

### Do NOT run seeds inside Netlify builds or Next build steps

Seeding should be a manual step or a separate CI job with the right DB credentials. Never run seeds during site build time as this can cause build failures and security issues.

### Database Access Requirements

Seeding `auth.users` requires elevated database access. Use the service role or admin database URL, never the anon key. The anon key does not have sufficient permissions to create users in the authentication system.

## Default Users Created

The seed script creates three default users:

- **Admin**: `admin@simuladores.com` / `admin123`
- **Editor**: `editor@simuladores.com` / `editor123`
- **Viewer**: `viewer@simuladores.com` / `viewer123`

## Security Notes

These are default passwords for development only. In production:

1. Change all default passwords
2. Use strong, unique passwords
3. Implement proper password policies
4. Consider enabling two-factor authentication

## Troubleshooting

If seeding fails:

1. Verify database connection string is correct
2. Ensure you're using service role credentials (not anon key)
3. Check that the database user has sufficient permissions
4. Verify the `supabase/seed.sql` file exists and is readable
