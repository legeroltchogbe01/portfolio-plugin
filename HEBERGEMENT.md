# Mettre Portfolio Studio en ligne avec comptes

Ce guide met en place la version hébergée :

- vous êtes **super-admin** et vous invitez vos clients ;
- chaque client se connecte à **son espace admin** pour modifier son portfolio (infos, photo, projets, CV) ;
- chaque portfolio publié est visible à l'adresse **`votre-site.onrender.com/pseudo`**.

Comptez environ 30 minutes. Tout se fait depuis le navigateur, sans ligne de commande.

| Brique | Rôle | Coût |
|---|---|---|
| **Supabase** | Comptes, base de données, stockage des photos | Gratuit pour démarrer |
| **Render** | Héberge le site (éditeur et pages publiques) | Gratuit (site statique) |
| **Gmail ou Brevo** | Envoi des emails d'invitation | Gratuit pour de petits volumes |

---

## 1. Créer le projet Supabase

1. Créez un compte sur [supabase.com](https://supabase.com), puis **New project**.
2. Donnez-lui un nom (ex. `portfolio-studio`) et un mot de passe de base de données (gardez-le de côté).
3. Pour la région, prenez la plus proche de vos visiteurs (depuis le Bénin, une région européenne comme *West EU* est un bon choix).
4. Attendez 1 à 2 minutes que le projet soit prêt.

## 2. Créer les tables et les règles de sécurité

1. Menu de gauche → **SQL Editor** → **New query**.
2. Copiez **tout** le contenu de [`supabase/schema.sql`](supabase/schema.sql), collez-le, puis cliquez sur **Run**.
3. Le message attendu est « Success. No rows returned ».

Ce script crée les tables, le stockage des photos et toutes les règles d'accès : un client ne voit et ne modifie que son propre portfolio. Ces règles sont vérifiées par des tests automatiques (`npm run test:db`).

## 3. Régler la connexion

Menu **Authentication** :

1. **Sign In / Providers** → désactivez **Allow new users to sign up**. Seules les personnes invitées pourront avoir un compte.
2. **URL Configuration** :
   - **Site URL** : l'adresse de votre site Render, par exemple `https://portfolio-studio.onrender.com`. Si vous ne l'avez pas encore, revenez la remplir après l'étape 7.
   - **Redirect URLs** : ajoutez la même adresse suivie de `/**`, par exemple `https://portfolio-studio.onrender.com/**`.

## 4. Déployer la fonction d'invitation

1. Menu **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Nom de la fonction : **`invite-user`** (exactement).
3. Remplacez le code d'exemple par le contenu de [`supabase/functions/invite-user/index.ts`](supabase/functions/invite-user/index.ts).
4. Cliquez sur **Deploy function**.

La fonction vérifie que l'appelant est super-admin, envoie l'invitation et crée le portfolio du client. La clé secrète lui est fournie automatiquement par Supabase : elle n'apparaît jamais dans le site.

## 5. Configurer l'envoi des emails (indispensable pour les invitations)

Le serveur d'emails intégré à Supabase sert uniquement aux tests : il n'écrit qu'aux membres de votre équipe Supabase, au maximum 2 fois par heure. **Sans cette étape, vos clients ne recevront pas leurs invitations.**

Menu **Authentication** → **Emails** → **SMTP Settings** → activez **Enable custom SMTP**, puis choisissez l'une des deux options.

**Option A — Gmail (le plus simple, pour quelques invitations par jour)**

1. Sur votre compte Google : activez la validation en deux étapes, puis créez un **mot de passe d'application** (Compte Google → Sécurité → Mots de passe des applications).
2. Dans Supabase, remplissez :
   - Sender email : votre adresse Gmail
   - Sender name : `Portfolio Studio`
   - Host : `smtp.gmail.com`, Port : `587`
   - Username : votre adresse Gmail
   - Password : le mot de passe d'application (16 caractères)

**Option B — Brevo (plus professionnel, nécessite un nom de domaine)**

1. Créez un compte [Brevo](https://www.brevo.com) et vérifiez votre expéditeur ou votre domaine.
2. Dans Supabase, remplissez :
   - Host : `smtp-relay.brevo.com`, Port : `587`
   - Username : l'identifiant SMTP affiché par Brevo
   - Password : une **clé SMTP** Brevo (pas une clé API)

**Mettre les emails en français.** Une fois le SMTP activé, l'onglet **Templates** devient modifiable. Exemple pour **Invite user** :

- Sujet : `Votre espace portfolio vous attend`
- Corps :
  ```html
  <h2>Bienvenue !</h2>
  <p>Un espace a été créé pour que vous puissiez gérer votre portfolio en ligne.</p>
  <p><a href="{{ .ConfirmationURL }}">Choisir mon mot de passe</a></p>
  <p>Ce lien est valable 24 heures.</p>
  ```

Faites de même pour **Reset password** (sujet : « Réinitialiser votre mot de passe »).

> **Pas encore de SMTP ?** Vous pouvez quand même ajouter un client à la main avec [`supabase/add-client.sql`](supabase/add-client.sql). Vous créez son compte avec un mot de passe provisoire, puis vous le lui transmettez.

## 6. Créer votre compte super-admin

1. **Authentication** → **Users** → **Add user** → **Create new user**.
2. Saisissez votre email et un mot de passe, cochez **Auto Confirm User**, puis validez.
3. **SQL Editor** → **New query** → collez [`supabase/bootstrap.sql`](supabase/bootstrap.sql).
4. Remplacez `votre.email@exemple.com` et `votre-pseudo` par vos valeurs, puis cliquez sur **Run**.

Vous êtes maintenant super-admin, avec votre propre portfolio à l'adresse `/votre-pseudo`.

## 7. Renseigner `config.js` et déployer sur Render

1. Dans Supabase → **Project Settings** → **API** (ou **API Keys**), relevez :
   - la **Project URL** (ex. `https://abcdefgh.supabase.co`) ;
   - la **Publishable key** (ou, sur un ancien projet, la clé **anon public**).
2. Dans le dépôt GitHub, modifiez [`config.js`](config.js) :
   ```js
   window.PORTFOLIO_CONFIG = {
     supabaseUrl: 'https://abcdefgh.supabase.co',
     supabaseKey: 'sb_publishable_…',
     siteUrl: 'https://portfolio-studio.onrender.com'
   };
   ```
   Ces deux valeurs sont publiques par conception : la sécurité repose sur les règles de l'étape 2. **Ne mettez jamais la clé secrète (secret / service_role) dans ce fichier.**
3. Sur [render.com](https://render.com) → **New** → **Blueprint** → choisissez le dépôt `portfolio-plugin`. Render lit [`render.yaml`](render.yaml) et crée le site avec les bonnes règles.

   *Si le site existe déjà sur Render* : ouvrez-le → **Redirects/Rewrites** → ajoutez la règle Source `/:slug`, Destination `/portfolio.html`, Action **Rewrite**.
4. Revenez à l'étape 3 si vous n'aviez pas encore l'adresse Render.

## 8. Vérifier

1. Ouvrez `https://votre-site.onrender.com` : l'écran de connexion s'affiche.
2. Connectez-vous avec votre compte super-admin.
3. Remplissez votre profil, puis cliquez sur **Publier** (en haut de l'aperçu).
4. Ouvrez `https://votre-site.onrender.com/votre-pseudo` : votre portfolio s'affiche.
5. Onglet **Comptes** → invitez un client avec une adresse email à vous, pour tester. L'email arrive, le lien permet de choisir un mot de passe, puis le client arrive dans son espace.

---

## Au quotidien

- **Inviter un client** : onglet **Comptes** → nom, email, adresse → **Envoyer l'invitation**.
- **Modifier le portfolio d'un client** : onglet **Comptes** → **Modifier**. Un bandeau rappelle quel portfolio vous modifiez.
- **Un client a oublié son mot de passe** : il clique sur « Mot de passe oublié ? » sur l'écran de connexion.
- **Supprimer un client** : Supabase → Authentication → Users → supprimez l'utilisateur. Son portfolio et sa page publique disparaissent avec lui.
- **Sauvegarde** : chaque client peut exporter ses données (onglet **Exporter**). Côté Supabase, les sauvegardes automatiques dépendent de votre offre.

## Bon à savoir

- **Mise en veille** : un projet Supabase gratuit est mis en pause après 7 jours sans activité. Supabase prévient par email avant, et on le relance depuis le tableau de bord sans perte de données. Des portfolios visités régulièrement suffisent à le garder actif.
- **Référencement Google** : les pages publiques sont affichées par JavaScript. Google les indexe, mais l'aperçu sur WhatsApp ou LinkedIn (titre et image) est moins riche qu'avec un site exporté en ZIP. Un rendu côté serveur pourra être ajouté plus tard si nécessaire.
- **Photos** : elles sont redimensionnées dans le navigateur (800 px pour le profil, 1 200 px pour les projets) avant l'envoi, ce qui limite l'espace utilisé.
