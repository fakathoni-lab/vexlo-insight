-- Create proofs table
create table public.proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  domain text not null,
  keyword text not null,
  score integer not null,
  current_rank integer,
  delta_30 integer,
  ai_overview boolean default false,
  rankings jsonb default '[]'::jsonb,
  narrative text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.proofs enable row level security;

-- RLS policies (restrictive)
create policy "proofs_select_own"
  on public.proofs for select
  using (auth.uid() = user_id);

create policy "proofs_insert_own"
  on public.proofs for insert
  with check (auth.uid() = user_id);

create policy "proofs_delete_own"
  on public.proofs for delete
  using (auth.uid() = user_id);

-- Indexes for Dashboard queries (ORDER BY created_at, WHERE user_id)
create index idx_proofs_user_id on public.proofs(user_id);
create index idx_proofs_created_at on public.proofs(created_at desc);