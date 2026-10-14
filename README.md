# Portfolio Studio

Un éditeur qui tourne entièrement dans le navigateur : on remplit son profil, ses projets et son parcours, on voit le résultat en direct, puis on télécharge **un site web prêt à publier** et **un CV en PDF**.

Aucun serveur, aucun compte : les données restent dans le navigateur de l'utilisateur.

## Fonctionnalités

- **Aperçu en direct**, en version ordinateur (rendu réel à 1 280 px) ou mobile.
- **4 thèmes soignés**, chacun avec un mode clair et un mode sombre que le visiteur peut basculer :
  - *Signature* — sombre et chaleureux, typographie expressive.
  - *Épuré* — clair et sobre, pour le conseil, la finance, le corporate.
  - *Éditorial* — serif et tons papier, mise en page de magazine.
  - *Terminal* — monospace, esprit console, pour les profils techniques.
- **Couleur d'accent libre** : le contraste est corrigé automatiquement pour rester lisible (WCAG AA) dans les deux modes.
- **4 modèles de CV A4** (Moderne, Classique/ATS, Minimaliste, Élégant). Un CV long continue sur la page suivante au lieu d'être coupé.
- **Texte riche simple** : dans les descriptions, une ligne qui commence par `-` devient une puce.
- **Compétences par domaine** (pas de barres de pourcentage), savoir-être, langues, centres d'intérêt, certifications, références (CV uniquement).
- **Réordonner** projets, expériences et compétences avec les flèches.
- **Sauvegarde automatique** dans le navigateur, plus **export / import JSON** pour garder ou transférer ses données.
- **Export ZIP** : `index.html`, `styles.css`, `script.js` et `images/`, avec balises SEO et de partage, favicon, menu mobile, accessibilité clavier.

## Sécurité

Tout ce que l'utilisateur saisit est échappé avant d'être inséré dans le HTML. Les liens sont filtrés : seuls `http` et `https` passent, `javascript:` et `data:` sont refusés. Une adresse comme `github.com/moi` est complétée en `https://github.com/moi`. Les champs invalides sont signalés en rouge dans l'éditeur.

## Démarrer

Ouvrir `index.html` dans un navigateur suffit. Pour un fonctionnement identique à la mise en ligne :

```bash
npm start        # sert le dossier sur http://127.0.0.1:8080
npm test         # lance les tests du moteur (Node 18+, aucune dépendance)
```

## Organisation du code

```text
index.html   Interface de l'éditeur
styles.css   Styles de l'éditeur
app.js       Logique de l'éditeur : état, formulaires, aperçu, exports
engine.js    Moteur : normalisation des données, sécurité, HTML/CSS/JS du portfolio
themes.js    Les thèmes (polices, palettes clair/sombre, complément de CSS)
cv.js        Les modèles de CV
tests/       Tests du moteur
```

Le principe : **une seule structure HTML pour tous les thèmes**. Un thème ne contient que du style, si bien qu'une correction dans `engine.js` profite à tous.

### Ajouter un thème

Copier un bloc dans `themes.js`, changer `id` et `name`, puis ajuster les polices, les deux palettes et le CSS complémentaire. Il apparaît automatiquement dans l'éditeur, et les tests le vérifient.

## Mettre en ligne

**L'éditeur** est un site statique. Le fichier `render.yaml` permet de le déployer sur Render ; GitHub Pages, Netlify ou Vercel fonctionnent aussi.

**Un portfolio exporté** se publie de trois façons :

- **GitHub Pages** : déposer le contenu du ZIP dans un dépôt, puis activer *Settings → Pages* sur la branche `main`.
- **Netlify** : glisser le dossier décompressé sur app.netlify.com/drop.
- **Vercel** : importer le dossier comme projet statique.

## Migration depuis la version 1

Les brouillons de l'ancienne version sont repris automatiquement, et les anciens thèmes et modèles de CV sont remplacés par le plus proche :

| Ancien thème | Nouveau thème |
|---|---|
| Créatif, Néo-Brutaliste | Signature |
| Minimaliste, Corporate | Épuré |
| Développeur | Terminal |
| Éditorial | Éditorial |

Le niveau en pourcentage des compétences n'est plus utilisé.
