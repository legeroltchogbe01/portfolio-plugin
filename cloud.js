/**
 * Portfolio Studio — mode hébergé (Supabase)
 *
 * Actif seulement si config.js contient l'URL et la clé du projet Supabase.
 * Gère la connexion, la sauvegarde du brouillon en base, l'envoi des photos,
 * la publication et l'espace super-admin (invitations, liste des comptes).
 *
 * app.js appelle StudioCloud.start() qui renvoie un « backend » :
 *   load(), save(state), uploadImage(dataUrl, kind), attach(api)
 */
(function () {
  'use strict';

  const cfg = window.PORTFOLIO_CONFIG || {};
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseKey);

  // Type de lien reçu par email (invitation, mot de passe oublié) : à lire
  // AVANT de créer le client, qui nettoie l'adresse.
  const hash = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  const linkType = hash.get('type') || query.get('type');
  const linkError = hash.get('error_description') || query.get('error_description');

  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.prototype.slice.call((el || document).querySelectorAll(sel));
  const esc = s => (window.PortfolioEngine ? window.PortfolioEngine.esc(s) : String(s));
  const siteUrl = () => (cfg.siteUrl || location.origin).replace(/\/$/, '');
  const adminUrl = () => siteUrl() + location.pathname.replace(/index\.html$/, '');

  let client = null;
  let user = null;
  let isAdmin = false;
  let portfolio = null;      // ligne de la table portfolios en cours d'édition
  let published = null;      // { published_at } ou null
  let dirtySincePublish = false;
  let api = null;            // fonctions fournies par app.js

  /* ==========================================================
     Écran de connexion
     ========================================================== */

  function showAuth(view, message, isError) {
    $('#auth-screen').hidden = false;
    $$('[data-auth-view]').forEach(f => { f.hidden = f.dataset.authView !== view; });
    const msg = $('#auth-message');
    msg.hidden = !message;
    msg.textContent = message || '';
    msg.classList.toggle('error', !!isError);
    const first = $('[data-auth-view="' + view + '"] input');
    if (first) setTimeout(() => first.focus(), 50);
  }

  function hideAuth() {
    $('#auth-screen').hidden = true;
  }

  function translateError(err) {
    const m = (err && (err.message || err.error_description || err.error)) || String(err || '');
    if (/invalid login credentials/i.test(m)) return 'Email ou mot de passe incorrect.';
    if (/email not confirmed/i.test(m)) return 'Votre email n’est pas encore confirmé : utilisez le lien reçu par email.';
    if (/rate limit|too many/i.test(m)) return 'Trop de tentatives. Patientez quelques minutes.';
    if (/password should be|weak password|at least/i.test(m)) return 'Mot de passe trop faible : au moins 8 caractères.';
    if (/expired|invalid.*(link|token)|otp/i.test(m)) return 'Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.';
    if (/failed to fetch|network/i.test(m)) return 'Connexion impossible. Vérifiez votre accès à Internet.';
    return m || 'Une erreur est survenue.';
  }

  function busy(form, on) {
    $$('button, input', form).forEach(el => { el.disabled = on; });
  }

  /** Attend que l'utilisateur soit connecté (et ait choisi un mot de passe si besoin). */
  function waitForLogin() {
    return new Promise(resolve => {
      $$('[data-auth-goto]').forEach(b => b.addEventListener('click', () => showAuth(b.dataset.authGoto)));

      $('#login-form').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.currentTarget;
        busy(form, true);
        const { data, error } = await client.auth.signInWithPassword({
          email: $('#login-email').value.trim(),
          password: $('#login-password').value
        });
        busy(form, false);
        if (error) return showAuth('login', translateError(error), true);
        resolve(data.user);
      });

      $('#forgot-form').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.currentTarget;
        busy(form, true);
        const { error } = await client.auth.resetPasswordForEmail($('#forgot-email').value.trim(), { redirectTo: adminUrl() });
        busy(form, false);
        if (error) return showAuth('forgot', translateError(error), true);
        showAuth('login', 'Si un compte existe pour cet email, un lien vient d’être envoyé. Pensez à regarder dans les indésirables.');
      });

      $('#password-form').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.currentTarget;
        const a = $('#new-password').value;
        const b = $('#new-password-2').value;
        if (a.length < 8) return showAuth('password', 'Au moins 8 caractères.', true);
        if (a !== b) return showAuth('password', 'Les deux mots de passe ne correspondent pas.', true);
        busy(form, true);
        const { data, error } = await client.auth.updateUser({ password: a });
        busy(form, false);
        if (error) return showAuth('password', translateError(error), true);
        history.replaceState(null, '', location.pathname + location.search.replace(/([?&])type=[^&]*/, '$1'));
        resolve(data.user);
      });

      // Session déjà ouverte ?
      client.auth.getSession().then(({ data }) => {
        const session = data && data.session;
        if (linkError) return showAuth('login', translateError({ message: linkError }), true);
        if (session && (linkType === 'invite' || linkType === 'recovery')) return showAuth('password');
        if (session) return resolve(session.user);
        showAuth('login');
      });

      client.auth.onAuthStateChange(event => {
        if (event === 'PASSWORD_RECOVERY') showAuth('password');
      });
    });
  }

  /* ==========================================================
     Données
     ========================================================== */

  async function loadPortfolio() {
    const wanted = query.get('edit');
    let req = client.from('portfolios').select('*');
    req = wanted && isAdmin ? req.eq('id', wanted) : req.eq('owner', user.id);
    const { data, error } = await req.maybeSingle();
    if (error) throw error;
    return data;
  }

  async function refreshPublished() {
    const { data } = await client.from('published_portfolios').select('published_at').eq('slug', portfolio.slug).maybeSingle();
    published = data;
    dirtySincePublish = !published || new Date(portfolio.updated_at) > new Date(published.published_at);
    renderPublishBar();
  }

  function renderPublishBar() {
    const status = $('#publish-status');
    const view = $('#view-live');
    const url = siteUrl() + '/' + portfolio.slug;
    view.href = url;
    view.hidden = !published;
    if (!published) {
      status.innerHTML = '<i class="fas fa-circle" aria-hidden="true"></i> Pas encore publié';
      status.className = 'publish-status draft';
    } else if (dirtySincePublish) {
      status.innerHTML = '<i class="fas fa-circle" aria-hidden="true"></i> Modifications non publiées';
      status.className = 'publish-status pending';
    } else {
      status.innerHTML = '<i class="fas fa-circle-check" aria-hidden="true"></i> En ligne : <a target="_blank" rel="noopener"></a>';
      status.className = 'publish-status live';
      const a = $('a', status);
      a.href = url;
      a.textContent = url.replace(/^https?:\/\//, '');
    }
  }

  function dataUrlToBlob(dataUrl) {
    const [head, b64] = dataUrl.split(',');
    const mime = (head.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  const backend = {
    mode: 'cloud',

    async load() {
      const d = portfolio.draft && Object.keys(portfolio.draft).length ? portfolio.draft : null;
      return { theme: portfolio.theme, cvTemplate: portfolio.cv_template, data: d, empty: !d || !d.projects };
    },

    async save(state) {
      const { data, error } = await client.from('portfolios')
        .update({ draft: state.data, theme: state.theme, cv_template: state.cvTemplate })
        .eq('id', portfolio.id)
        .select('updated_at')
        .single();
      if (error) throw error;
      portfolio.updated_at = data.updated_at;
      if (published) { dirtySincePublish = true; renderPublishBar(); }
    },

    async uploadImage(dataUrl, kind) {
      const path = portfolio.owner + '/' + kind + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.jpg';
      const { error } = await client.storage.from('media').upload(path, dataUrlToBlob(dataUrl), {
        contentType: 'image/jpeg', cacheControl: '31536000', upsert: false
      });
      if (error) throw error;
      return client.storage.from('media').getPublicUrl(path).data.publicUrl;
    },

    attach(appApi) {
      api = appApi;
      setupUi();
    }
  };

  /* ==========================================================
     Publication
     ========================================================== */

  async function publish() {
    const btn = $('#publish-btn');
    btn.disabled = true;
    try {
      await api.flush(); // termine la sauvegarde en cours
      const payload = api.payload();
      // Les références ne s'affichent que sur le CV : on ne les rend pas publiques.
      delete payload.references;
      const { error } = await client.from('published_portfolios').upsert({
        slug: portfolio.slug,
        owner: portfolio.owner,
        data: payload,
        theme: api.state.theme,
        cv_template: api.state.cvTemplate,
        published_at: new Date().toISOString()
      }, { onConflict: 'slug' });
      if (error) throw error;
      await refreshPublished();
      dirtySincePublish = false;
      renderPublishBar();
      api.toast('Portfolio publié : ' + siteUrl().replace(/^https?:\/\//, '') + '/' + portfolio.slug);
    } catch (err) {
      console.error(err);
      api.toast('Publication impossible : ' + translateError(err), 'error');
    } finally {
      btn.disabled = false;
    }
  }

  /* ==========================================================
     Espace super-admin
     ========================================================== */

  function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  async function loadAccounts() {
    const list = $('#accounts-list');
    const { data, error } = await client.rpc('admin_list_portfolios');
    if (error) {
      list.innerHTML = '<p class="empty">Impossible de charger les comptes : ' + esc(translateError(error)) + '</p>';
      return;
    }
    if (!data.length) {
      list.innerHTML = '<p class="empty">Aucun portfolio pour le moment.</p>';
      return;
    }
    list.innerHTML = '';
    data.forEach(row => {
      const url = siteUrl() + '/' + row.slug;
      const state = row.published_at
        ? '<span class="pill live">En ligne</span>'
        : (row.last_sign_in_at ? '<span class="pill">Brouillon</span>' : '<span class="pill pending">Invitation envoyée</span>');
      const card = document.createElement('div');
      card.className = 'account-row';
      card.innerHTML =
        '<div class="account-main">' +
          '<strong>' + esc(row.name || row.email) + '</strong>' + state +
          '<span class="account-meta">' + esc(row.email) + ' · modifié le ' + esc(fmtDate(row.updated_at)) + '</span>' +
          '<a class="account-link" target="_blank" rel="noopener"></a>' +
        '</div>' +
        '<div class="account-actions">' +
          '<button type="button" class="btn btn-secondary btn-sm" data-copy><i class="fas fa-link" aria-hidden="true"></i> Copier le lien</button>' +
          '<a class="btn btn-secondary btn-sm" data-edit><i class="fas fa-pen" aria-hidden="true"></i> Modifier</a>' +
        '</div>';
      const link = $('.account-link', card);
      link.href = url;
      link.textContent = url.replace(/^https?:\/\//, '');
      $('[data-edit]', card).href = '?edit=' + encodeURIComponent(row.id);
      $('[data-copy]', card).addEventListener('click', () => {
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
          .then(() => api.toast('Lien copié.'))
          .catch(() => api.toast(url));
      });
      list.appendChild(card);
    });
  }

  async function invite(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const slugEl = $('#invite-slug');
    slugEl.value = slugEl.value.trim().toLowerCase();
    if (!form.reportValidity()) return;
    busy(form, true);
    try {
      const { data, error } = await client.functions.invoke('invite-user', {
        body: {
          name: $('#invite-name').value.trim(),
          email: $('#invite-email').value.trim(),
          slug: slugEl.value,
          redirectTo: adminUrl()
        }
      });
      if (error) {
        let message = error.message;
        try { const body = await error.context.json(); if (body && body.error) message = body.error; } catch (_) {}
        if (/Failed to send a request|not found|404/i.test(message)) {
          message = 'La fonction « invite-user » n’est pas déployée sur Supabase (voir HEBERGEMENT.md, étape 4).';
        }
        throw new Error(message);
      }
      api.toast('Invitation envoyée à ' + data.email + '.');
      form.reset();
      loadAccounts();
    } catch (err) {
      api.toast(err.message || 'Invitation impossible.', 'error');
    } finally {
      busy(form, false);
    }
  }

  function slugify(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  }

  /* ==========================================================
     Interface du mode hébergé
     ========================================================== */

  function setupUi() {
    document.body.classList.add('is-cloud');
    $$('.cloud-only').forEach(el => { el.hidden = false; });
    $$('.admin-only').forEach(el => { el.hidden = !isAdmin; });
    $('#account-email').textContent = user.email;
    $('#reset-btn').hidden = true;

    $('#logout-btn').addEventListener('click', async () => {
      await api.flush().catch(() => {});
      await client.auth.signOut();
      location.href = location.pathname;
    });

    $('#publish-btn').addEventListener('click', publish);

    if (portfolio.owner !== user.id) {
      $('#editing-banner').hidden = false;
      $('#editing-name').textContent = (portfolio.draft && portfolio.draft.profile && portfolio.draft.profile.name) || portfolio.slug;
    }

    if (isAdmin) {
      $('#slug-prefix').textContent = siteUrl().replace(/^https?:\/\//, '') + '/';
      $('#invite-form').addEventListener('submit', invite);
      $('#invite-name').addEventListener('input', e => {
        const slug = $('#invite-slug');
        if (!slug.dataset.touched) slug.value = slugify(e.target.value);
      });
      $('#invite-slug').addEventListener('input', e => { e.target.dataset.touched = '1'; });
      $('.nav-item[data-tab="accounts"]').addEventListener('click', loadAccounts);
    }

    renderPublishBar();
    refreshPublished();
  }

  /* ==========================================================
     Démarrage
     ========================================================== */

  async function start() {
    if (!window.supabase || !window.supabase.createClient) {
      showAuth('login', 'Impossible de charger Supabase. Vérifiez votre connexion Internet puis rechargez la page.', true);
      throw new Error('supabase-js non chargé');
    }
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    showAuth('loading');
    user = await waitForLogin();
    showAuth('loading');

    const { data: adminRow } = await client.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
    isAdmin = !!adminRow;

    portfolio = await loadPortfolio();
    if (!portfolio) {
      showAuth('login', isAdmin && query.get('edit')
        ? 'Ce portfolio est introuvable.'
        : 'Aucun portfolio n’est associé à ce compte. Contactez la personne qui vous a invité.', true);
      $('[data-auth-view="login"]').hidden = true;
      const out = document.createElement('button');
      out.className = 'btn btn-secondary btn-block';
      out.textContent = 'Se déconnecter';
      out.onclick = async () => { await client.auth.signOut(); location.href = location.pathname; };
      $('#auth-message').after(out);
      throw new Error('Aucun portfolio');
    }

    hideAuth();
    return backend;
  }

  window.StudioCloud = { enabled, start };
})();
