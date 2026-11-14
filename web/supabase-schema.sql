create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  school text,
  school_code text,
  track text,
  independent_student boolean not null default false,
  role text not null default 'student' check (role in ('student', 'admin')),
  is_admin boolean not null default false,
  joined boolean default false,
  progress jsonb default '{}',
  checks jsonb default '{}',
  voted jsonb default '[]',
  answers jsonb default '[]',
  projects jsonb default '[]',
  updated_at timestamptz default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  school text default 'independent',
  school_code text,
  track text,
  independent_student boolean not null default false,
  status text not null default 'active' check (status in ('active', 'pending', 'archived')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.presentations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  presenter_name text not null,
  school text,
  track text,
  file_name text,
  notes text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.presentations enable row level security;
alter table public.app_settings enable row level security;

create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Admins can view all profiles"
on public.profiles for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
  )
);

create policy "Admins can manage all students"
on public.students for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
  )
);

create policy "Admins can manage presentations"
on public.presentations for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
  )
);

create policy "Admins can manage app settings"
on public.app_settings for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    school,
    school_code,
    track,
    independent_student,
    role,
    is_admin,
    joined
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'school',
    new.raw_user_meta_data->>'school_code',
    new.raw_user_meta_data->>'track',
    coalesce((new.raw_user_meta_data->>'independent')::boolean, false),
    'student',
    false,
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create trigger handle_updated_at
before update on public.profiles
for each row
execute procedure moddatetime(updated_at);
