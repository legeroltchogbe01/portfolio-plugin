/**
 * Tests des règles d'accès de la base (supabase/schema.sql).
 *
 * Utilise PGlite (un vrai PostgreSQL qui tourne dans Node) et simule les
 * schémas « auth » et « storage » de Supabase. Lancer avec :
 *   npm install && npm run test:db
 */
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { PGlite } = require('@electric-sql/pglite');

const SCHEMA = fs.readFileSync(path.join(__dirname, '../supabase/schema.sql'), 'utf8');

// Ce que Supabase fournit déjà : rôles, auth.users, auth.uid(), storage.*
const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (
    id uuid primary key, email text, invited_at timestamptz, last_sign_in_at timestamptz
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  create schema storage;
  create table storage.buckets (
    id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (id serial primary key, bucket_id text, name text);
  create function storage.foldername(name text) returns text[] language sql immutable as $$
    select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
  $$;
  alter table storage.objects enable row level security;
  grant usage on schema storage, public to anon, authenticated;
  grant all on storage.objects to authenticated;
  grant usage, select on all sequences in schema storage to authenticated;
`;

const ADMIN = '00000000-0000-0000-0000-00000000000a';
const AWA = '00000000-0000-0000-0000-00000000000b';
const KOFI = '00000000-0000-0000-0000-00000000000c';

let passed = 0;
let failed = 0;

async function main() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUBS);
  await db.exec(SCHEMA);

  // Jeu de données (en super-utilisateur, comme la fonction d'invitation)
  await db.exec(`
    insert into auth.users (id, email) values
      ('${ADMIN}', 'admin@exemple.com'), ('${AWA}', 'awa@exemple.com'), ('${KOFI}', 'kofi@exemple.com');
    insert into public.admins (user_id) values ('${ADMIN}');
    insert into public.portfolios (owner, slug, draft) values
      ('${AWA}', 'awa', '{"profile":{"name":"Awa"}}'),
      ('${KOFI}', 'kofi', '{"profile":{"name":"Kofi"}}');
  `);

  /** Exécute une requête en tant qu'utilisateur (ou visiteur anonyme si uid est null). */
  async function as(uid, sql, params) {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid || '']);
    await db.exec('set role ' + (uid ? 'authenticated' : 'anon'));
    try {
      return await db.query(sql, params || []);
    } finally {
      await db.exec('reset role');
    }
  }

  async function test(name, fn) {
    try {
      await fn();
      passed++;
      console.log('  ✔ ' + name);
    } catch (err) {
      failed++;
      console.log('  ✘ ' + name + '\n      ' + err.message);
    }
  }

  async function denied(promise, label) {
    try {
      const r = await promise;
      // Avec RLS, une écriture interdite peut aussi « réussir » sans toucher aucune ligne
      if (r && typeof r.affectedRows === 'number' && r.affectedRows === 0) return;
      throw new Error((label || 'opération') + ' aurait dû être refusée');
    } catch (err) {
      if (/aurait dû être refusée/.test(err.message)) throw err;
    }
  }

  console.log('\nBrouillons (privés)');

  await test('un visiteur anonyme ne voit aucun brouillon', async () => {
    await denied(as(null, 'select * from public.portfolios'), 'lecture anonyme');
  });

  await test('Awa ne voit que son propre brouillon', async () => {
    const r = await as(AWA, 'select slug from public.portfolios');
    assert.deepStrictEqual(r.rows.map(x => x.slug), ['awa']);
  });

  await test('Awa peut modifier son brouillon', async () => {
    const r = await as(AWA, `update public.portfolios set draft = '{"profile":{"name":"Awa K"}}', theme = 'minimal' where slug = 'awa'`);
    assert.strictEqual(r.affectedRows, 1);
  });

  await test('Awa ne peut pas modifier le brouillon de Kofi', async () => {
    await denied(as(AWA, `update public.portfolios set draft = '{}' where slug = 'kofi'`), 'modification du brouillon d’un autre');
  });

  await test('Awa ne peut pas changer son adresse (slug) ni son propriétaire', async () => {
    await denied(as(AWA, `update public.portfolios set slug = 'patron' where slug = 'awa'`), 'changement de slug');
    await denied(as(AWA, `update public.portfolios set owner = '${KOFI}' where slug = 'awa'`), 'changement de propriétaire');
  });

  await test('Awa ne peut pas créer ni supprimer de portfolio', async () => {
    await denied(as(AWA, `insert into public.portfolios (owner, slug) values ('${AWA}', 'awa2')`), 'création');
    await denied(as(AWA, `delete from public.portfolios where slug = 'awa'`), 'suppression');
  });

  await test('le super-admin voit et modifie tous les brouillons', async () => {
    const r = await as(ADMIN, 'select slug from public.portfolios order by slug');
    assert.deepStrictEqual(r.rows.map(x => x.slug), ['awa', 'kofi']);
    const u = await as(ADMIN, `update public.portfolios set theme = 'terminal' where slug = 'kofi'`);
    assert.strictEqual(u.affectedRows, 1);
  });

  console.log('\nPublication');

  await test('Awa publie son portfolio', async () => {
    const r = await as(AWA, `insert into public.published_portfolios (slug, owner, data, theme) values ('awa', '${AWA}', '{"profile":{"name":"Awa"}}', 'minimal')`);
    assert.strictEqual(r.affectedRows, 1);
  });

  await test('un visiteur anonyme lit le portfolio publié', async () => {
    const r = await as(null, `select data->'profile'->>'name' as name from public.published_portfolios where slug = 'awa'`);
    assert.strictEqual(r.rows[0].name, 'Awa');
  });

  await test('Awa ne peut pas publier à l’adresse de Kofi', async () => {
    await denied(as(AWA, `insert into public.published_portfolios (slug, owner, data, theme) values ('kofi', '${AWA}', '{}', 'minimal')`), 'publication sur le slug d’un autre');
    await denied(as(AWA, `insert into public.published_portfolios (slug, owner, data, theme) values ('kofi', '${KOFI}', '{}', 'minimal')`), 'publication au nom d’un autre');
  });

  await test('Kofi ne peut ni modifier ni dépublier le portfolio d’Awa', async () => {
    await denied(as(KOFI, `update public.published_portfolios set data = '{}' where slug = 'awa'`), 'modification');
    await denied(as(KOFI, `delete from public.published_portfolios where slug = 'awa'`), 'dépublication');
  });

  await test('Awa met à jour puis dépublie son portfolio', async () => {
    const u = await as(AWA, `update public.published_portfolios set data = '{"profile":{"name":"Awa 2"}}' where slug = 'awa'`);
    assert.strictEqual(u.affectedRows, 1);
    const d = await as(AWA, `delete from public.published_portfolios where slug = 'awa'`);
    assert.strictEqual(d.affectedRows, 1);
  });

  await test('le super-admin peut publier pour Kofi', async () => {
    const r = await as(ADMIN, `insert into public.published_portfolios (slug, owner, data, theme) values ('kofi', '${KOFI}', '{}', 'signature')`);
    assert.strictEqual(r.affectedRows, 1);
  });

  console.log('\nSuper-admin');

  await test('la liste des comptes est réservée aux super-admins', async () => {
    await denied(as(AWA, 'select * from public.admin_list_portfolios()'), 'liste des comptes par un client');
    const r = await as(ADMIN, 'select slug, email from public.admin_list_portfolios() order by slug');
    assert.deepStrictEqual(r.rows, [{ slug: 'awa', email: 'awa@exemple.com' }, { slug: 'kofi', email: 'kofi@exemple.com' }]);
  });

  await test('personne ne peut se déclarer super-admin', async () => {
    await denied(as(AWA, `insert into public.admins (user_id) values ('${AWA}')`), 'auto-promotion');
  });

  console.log('\nPhotos');

  await test('Awa dépose une photo dans son dossier', async () => {
    const r = await as(AWA, `insert into storage.objects (bucket_id, name) values ('media', '${AWA}/avatar.jpg')`);
    assert.strictEqual(r.affectedRows, 1);
  });

  await test('Awa ne peut pas déposer dans le dossier de Kofi', async () => {
    await denied(as(AWA, `insert into storage.objects (bucket_id, name) values ('media', '${KOFI}/piege.jpg')`), 'dépôt chez un autre');
  });

  console.log('\nAdresses');

  await test('les adresses invalides ou réservées sont refusées', async () => {
    for (const bad of ['admin', 'Awa', 'a b', '-awa', 'awa-', 'é', 'x'.repeat(41)]) {
      await denied(db.query(`insert into public.portfolios (owner, slug) values ('${ADMIN}', $1)`, [bad]), 'slug « ' + bad + ' »');
    }
  });

  console.log('\n' + passed + ' tests réussis' + (failed ? ', ' + failed + ' en échec' : '') + '\n');
  process.exit(failed ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
