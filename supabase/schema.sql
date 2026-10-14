-- =====================================================================
-- Portfolio Studio — schéma de la base Supabase
--
-- À exécuter une fois dans Supabase : SQL Editor → New query → coller → Run.
-- Le script peut être relancé sans risque (il ne supprime aucune donnée).
--
-- Principe de sécurité (Row Level Security) :
--   • portfolios            : brouillons PRIVÉS, visibles par leur propriétaire et les super-admins
--   • published_portfolios  : versions PUBLIÉES, lisibles par tout le monde (c'est le site public)
--   • admins                : liste des super-admins (ajoutés à la main, voir bootstrap.sql)
--   • bucket « media »      : photos publiques ; chacun n'écrit que dans son propre dossier
-- =====================================================================


-- ---------------------------------------------------------------------
-- Super-admins
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- Portfolios (brouillons privés)
-- ---------------------------------------------------------------------
create table if not exists public.portfolios (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null unique references auth.users (id) on delete cascade,
  slug        text not null unique,
  draft       jsonb not null default '{}'::jsonb,
  theme       text not null default 'signature',
  cv_template text not null default 'modern',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Adresse publique : site.com/<slug>
  constraint slug_format check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$'),
  constraint slug_reserved check (slug not in (
    'admin', 'api', 'app', 'assets', 'auth', 'cv', 'images', 'index', 'login', 'logout',
    'media', 'p', 'portfolio', 'public', 'settings', 'static', 'studio', 'super', 'www'
  ))
);

-- ---------------------------------------------------------------------
-- Portfolios publiés (lecture publique)
-- ---------------------------------------------------------------------
create table if not exists public.published_portfolios (
  slug         text primary key references public.portfolios (slug) on update cascade on delete cascade,
  owner        uuid not null references auth.users (id) on delete cascade,
  data         jsonb not null,
  theme        text not null,
  cv_template  text not null default 'modern',
  published_at timestamptz not null default now()
);

-- Mise à jour automatique de updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists portfolios_touch on public.portfolios;
create trigger portfolios_touch
  before update on public.portfolios
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Droits : on part de zéro, puis on n'accorde que le nécessaire
-- ---------------------------------------------------------------------
revoke all on public.admins, public.portfolios, public.published_portfolios from anon, authenticated;

grant select on public.admins to authenticated;

grant select, delete on public.portfolios to authenticated;
-- Un utilisateur ne peut modifier que le contenu, jamais le propriétaire ni l'adresse (slug)
grant update (draft, theme, cv_template) on public.portfolios to authenticated;

grant select on public.published_portfolios to anon, authenticated;
grant insert, update, delete on public.published_portfolios to authenticated;

alter table public.admins enable row level security;
alter table public.portfolios enable row level security;
alter table public.published_portfolios enable row level security;

-- admins : chacun voit s'il est admin ; les admins voient la liste
drop policy if exists admins_select on public.admins;
create policy admins_select on public.admins
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- portfolios : le propriétaire et les super-admins
drop policy if exists portfolios_select on public.portfolios;
create policy portfolios_select on public.portfolios
  for select to authenticated
  using (owner = auth.uid() or public.is_admin());

drop policy if exists portfolios_update on public.portfolios;
create policy portfolios_update on public.portfolios
  for update to authenticated
  using (owner = auth.uid() or public.is_admin())
  with check (owner = auth.uid() or public.is_admin());

drop policy if exists portfolios_delete on public.portfolios;
create policy portfolios_delete on public.portfolios
  for delete to authenticated
  using (public.is_admin());

-- published_portfolios : lecture publique ; publication par le propriétaire
-- du portfolio correspondant (même slug, même propriétaire) ou un super-admin
drop policy if exists published_select on public.published_portfolios;
create policy published_select on public.published_portfolios
  for select to anon, authenticated
  using (true);

drop policy if exists published_insert on public.published_portfolios;
create policy published_insert on public.published_portfolios
  for insert to authenticated
  with check (exists (
    select 1 from public.portfolios p
    where p.slug = published_portfolios.slug
      and p.owner = published_portfolios.owner
      and (p.owner = auth.uid() or public.is_admin())
  ));

drop policy if exists published_update on public.published_portfolios;
create policy published_update on public.published_portfolios
  for update to authenticated
  using (owner = auth.uid() or public.is_admin())
  with check (exists (
    select 1 from public.portfolios p
    where p.slug = published_portfolios.slug
      and p.owner = published_portfolios.owner
      and (p.owner = auth.uid() or public.is_admin())
  ));

drop policy if exists published_delete on public.published_portfolios;
create policy published_delete on public.published_portfolios
  for delete to authenticated
  using (owner = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- Liste des comptes pour l'espace super-admin (avec l'email de chacun)
-- ---------------------------------------------------------------------
create or replace function public.admin_list_portfolios()
returns table (
  id uuid,
  slug text,
  owner uuid,
  email text,
  name text,
  updated_at timestamptz,
  published_at timestamptz,
  last_sign_in_at timestamptz,
  invited_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux super-admins' using errcode = '42501';
  end if;
  return query
    select p.id, p.slug, p.owner, u.email::text,
           coalesce(p.draft #>> '{profile,name}', '')::text,
           p.updated_at, pub.published_at, u.last_sign_in_at, u.invited_at
    from public.portfolios p
    join auth.users u on u.id = p.owner
    left join public.published_portfolios pub on pub.slug = p.slug
    order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_portfolios() from public, anon;
grant execute on function public.admin_list_portfolios() to authenticated;

-- ---------------------------------------------------------------------
-- Stockage des photos : bucket public « media », un dossier par utilisateur
-- (chemin : media/<id utilisateur>/<fichier>)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists media_select on storage.objects;
create policy media_select on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists media_insert on storage.objects;
create policy media_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists media_update on storage.objects;
create policy media_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists media_delete on storage.objects;
create policy media_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
