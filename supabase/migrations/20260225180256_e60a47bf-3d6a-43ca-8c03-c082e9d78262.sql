create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  avatar_url   text,
  plan         text default 'free',
  plan_status  text default 'active',
  stripe_id    text unique,
  proofs_used  integer default 0,
  proofs_limit integer default 5,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null,

  constraint profiles_plan_valid check (plan in ('free','starter','pro','elite')),
  constraint profiles_status_valid check (plan_status in ('active','canceled','past_due'))
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();