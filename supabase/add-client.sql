-- =====================================================================
-- Portfolio Studio — ajouter un client SANS email d'invitation
--
-- À utiliser si l'envoi d'emails n'est pas encore configuré (voir
-- HEBERGEMENT.md, étape 5).
--
-- 1. Supabase → Authentication → Users → Add user → Create new user
--    Email du client + mot de passe provisoire, cochez « Auto Confirm User ».
-- 2. Remplacez les valeurs ci-dessous, puis Run.
-- 3. Transmettez l'email et le mot de passe provisoire au client.
-- =====================================================================

do $$
declare
  client_email text := 'client@exemple.com';  -- ← email du compte créé à l'étape 1
  client_name  text := 'Prénom Nom';          -- ← nom affiché sur le portfolio
  client_slug  text := 'prenom-nom';          -- ← adresse : site.com/prenom-nom
  uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(client_email);
  if uid is null then
    raise exception 'Aucun compte avec l''email %. Créez-le d''abord dans Authentication → Users.', client_email;
  end if;

  insert into public.portfolios (owner, slug, draft)
  values (uid, client_slug, jsonb_build_object('profile', jsonb_build_object('name', client_name, 'email', client_email)));

  raise notice 'Portfolio créé : /%', client_slug;
end $$;
