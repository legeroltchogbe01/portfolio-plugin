/**
 * Portfolio Studio — configuration
 *
 * Laissez vide pour utiliser l'éditeur en local (données dans le navigateur).
 * Renseignez votre projet Supabase pour activer les comptes, l'espace admin
 * et la publication en ligne (voir HEBERGEMENT.md).
 *
 * Ces deux valeurs sont publiques par nature : la sécurité repose sur les
 * règles d'accès de la base (supabase/schema.sql), pas sur leur secret.
 * Ne mettez JAMAIS ici la clé secrète (secret / service_role).
 */
window.PORTFOLIO_CONFIG = {
  // Supabase → Project Settings → API → Project URL
  supabaseUrl: '',
  // Supabase → Project Settings → API Keys → Publishable key (ou l'ancienne « anon public »)
  supabaseKey: '',
  // Adresse publique du site, sans barre finale (ex. https://mon-studio.onrender.com).
  // Vide = l'adresse actuelle du navigateur.
  siteUrl: ''
};
