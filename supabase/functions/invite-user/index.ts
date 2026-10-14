// =====================================================================
// Portfolio Studio — fonction « invite-user »
//
// Appelée depuis l'espace super-admin (/admin → onglet Comptes).
// Elle vérifie que l'appelant est super-admin, envoie l'email d'invitation
// et crée le portfolio du nouveau client avec son adresse (slug).
//
// Déploiement sans outil en ligne de commande :
//   Supabase → Edge Functions → Deploy a new function → Via Editor
//   Nom : invite-user — coller ce fichier — Deploy.
// La clé secrète est fournie automatiquement à la fonction : elle n'est
// jamais exposée au navigateur.
// =====================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
const RESERVED = new Set([
  'admin', 'api', 'app', 'assets', 'auth', 'cv', 'images', 'index', 'login', 'logout',
  'media', 'p', 'portfolio', 'public', 'settings', 'static', 'studio', 'super', 'www',
]);
const EMAIL = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

/** Clé secrète : nouveau format (SUPABASE_SECRET_KEYS) ou ancien (SERVICE_ROLE). */
function secretKey(): string {
  const keys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (keys) {
    try {
      const parsed = JSON.parse(keys);
      if (parsed.default) return parsed.default;
      const first = Object.values(parsed)[0];
      if (typeof first === 'string') return first;
    } catch (_) { /* on tente l'ancien format */ }
  }
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!legacy) throw new Error('Aucune clé secrète disponible pour la fonction.');
  return legacy;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return reply(405, { error: 'Méthode non autorisée.' });

  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Qui appelle ? (jeton de session envoyé par l'espace admin)
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) return reply(401, { error: 'Connexion requise.' });
    const { data: caller, error: callerError } = await admin.auth.getUser(token);
    if (callerError || !caller?.user) return reply(401, { error: 'Session invalide ou expirée. Reconnectez-vous.' });

    const { data: isAdmin } = await admin
      .from('admins').select('user_id').eq('user_id', caller.user.id).maybeSingle();
    if (!isAdmin) return reply(403, { error: 'Réservé aux super-admins.' });

    // 2. Données reçues
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const slug = String(body.slug || '').trim().toLowerCase();
    const name = String(body.name || '').trim().slice(0, 120);
    const redirectTo = String(body.redirectTo || '').trim();

    if (!EMAIL.test(email)) return reply(400, { error: 'Adresse email invalide.' });
    if (!SLUG.test(slug)) return reply(400, { error: 'Adresse invalide : lettres minuscules, chiffres et tirets uniquement (2 à 40 caractères).' });
    if (RESERVED.has(slug)) return reply(400, { error: `L'adresse « ${slug} » est réservée.` });

    const { data: taken } = await admin.from('portfolios').select('id').eq('slug', slug).maybeSingle();
    if (taken) return reply(409, { error: `L'adresse « ${slug} » est déjà utilisée.` });

    // 3. Invitation (email avec un lien pour choisir son mot de passe)
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: /^https?:\/\//.test(redirectTo) ? redirectTo : undefined,
      data: { name },
    });
    if (inviteError || !invited?.user) {
      const msg = inviteError?.message || '';
      if (/already|registered|exists/i.test(msg)) {
        return reply(409, { error: 'Cette adresse email a déjà un compte.' });
      }
      return reply(400, { error: 'Invitation impossible : ' + (msg || 'erreur inconnue') });
    }

    // 4. Portfolio vide, prérempli avec le nom et l'email
    const { error: insertError } = await admin.from('portfolios').insert({
      owner: invited.user.id,
      slug,
      draft: { profile: { name, email } },
    });
    if (insertError) {
      // On annule l'invitation pour ne pas laisser un compte sans portfolio
      await admin.auth.admin.deleteUser(invited.user.id);
      return reply(400, { error: 'Création du portfolio impossible : ' + insertError.message });
    }

    return reply(200, { ok: true, slug, email });
  } catch (err) {
    console.error(err);
    return reply(500, { error: 'Erreur interne : ' + (err instanceof Error ? err.message : String(err)) });
  }
});
