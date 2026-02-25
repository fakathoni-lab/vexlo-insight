

# Waitlist Table — SQL Migration Plan

## Schema Review

The SQL is well-structured. Here's my confirmation against your checklist:

| Check | Status |
|-------|--------|
| Does not break existing queries | Yes — no existing tables or queries to conflict with |
| RLS enabled and deny-by-default | Yes — RLS enabled, no policies added (all operations denied by default) |
| No circular foreign keys | Yes — no foreign keys at all |
| UUID primary key + created_at timestamptz default now() | Yes |
| UNIQUE constraints and indexes correct | Yes — unique on email, indexes on email and created_at desc |

## Additional notes on the schema

- **Email format check constraint** — good, prevents junk inserts at the DB level
- **Source enum via check constraint** — locks allowed values to 5 known sources
- **ip_hash column** — useful for rate limiting without storing raw IPs (privacy-friendly)
- **No public insert policy** — correct approach; inserts will go through a Supabase Edge Function using `service_role` key, keeping the table locked from anonymous direct access
- **referrer column** — nullable text, good for tracking where signups come from

## SQL to execute (unchanged from your submission)

```sql
create table public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text default 'landing_page',
  referrer    text,
  ip_hash     text,
  created_at  timestamptz default now() not null,

  constraint waitlist_email_unique unique (email),
  constraint waitlist_email_format check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  constraint waitlist_source_valid check (source in (
    'landing_page','hero_cta','footer_cta','pricing_cta','referral'
  ))
);

create index waitlist_email_idx on public.waitlist (email);
create index waitlist_created_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;
```

## Next steps after migration

1. Create a Supabase Edge Function (`waitlist-signup`) that accepts email + source, hashes the IP, and inserts via `service_role`
2. Wire the CTA form and Hero CTA to call that edge function
3. Add rate limiting logic in the edge function using the `ip_hash` column

Ready to execute when you say **"Run this SQL"**.

