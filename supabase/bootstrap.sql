-- =====================================================================
-- Portfolio Studio — premier super-admin
--
-- À exécuter UNE FOIS, après avoir créé votre propre compte dans
-- Supabase → Authentication → Users → Add user (avec mot de passe).
--
-- Remplacez les deux valeurs ci-dessous, puis Run.
-- =====================================================================

do $$
declare
  admin_email text := 'votre.email@exemple.com';  -- ← votre email
  admin_slug  text := 'votre-pseudo';             -- ← votre adresse : site.com/votre-pseudo
  uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(admin_email);
  if uid is null then
    raise exception 'Aucun compte avec l''email %. Créez-le d''abord dans Authentication → Users.', admin_email;
  end if;

  insert into public.admins (user_id) values (uid) on conflict do nothing;

  insert into public.portfolios (owner, slug)
  values (uid, admin_slug)
  on conflict (owner) do nothing;

  raise notice 'C''est fait : % est super-admin, portfolio à l''adresse /%', admin_email, admin_slug;
end $$;
