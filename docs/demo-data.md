# Demo Data

`supabase/seed.sql` contains local/development seed data for MVP testing.

It creates:

- one demo organization
- temperature, cleaning and receiving control types
- demo control objects and field definitions
- completed control runs
- one open deviation for inspector/report testing

The seed is idempotent and uses fixed UUIDs so it can be run more than once in a local or disposable development database.

Do not run this seed against production unless you intentionally want demo data there.

Typical local use:

```bash
supabase db reset
```

or apply the file manually to a local development database.
