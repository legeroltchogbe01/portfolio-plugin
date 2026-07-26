# Portfolio Builder Studio

Portfolio Builder Studio is a client-side interactive tool designed to construct professional web portfolios and Curriculum Vitaes (CV). It follows a "live form to live preview" workspace design, enabling users to enter their credentials and view, customize, and export their work instantly.

---

## Features

- **Live Interactive Preview**: Instantly updates a nested iframe as you type into form fields, utilizing a debounce mechanism to avoid UI lag.
- **6 Portfolio Themes**:
  - *Minimaliste Moderne*: Clean, structured, modern layout.
  - *Créatif Dégradé*: Vibrant colors, glassmorphic card effects, and subtle animations.
  - *Terminal Développeur*: Retro CLI/code terminal appearance.
  - *Néo-Brutaliste Pop*: Thick borders, flat saturated colors, and retro pop shadows.
  - *Chic Éditorial*: Literary Serif aesthetics, light crème tones.
  - *Corporate / Sobre*: Formal, clean design with steel-blue/white tones, ideal for corporate or financial sectors.
- **Dark/Light Mode Toggle**: Built-in interactive floating switcher in all generated portfolios to dynamically swap CSS theme modes.
- **Advanced Recruiter-Impact Fields**:
  - *Slogan / Accroche* (tagline) and *Texte alternatif photo* (alt) on profile card.
  - *Site Web Personnel / Blog* and *Mobilité / Relocalisation* inputs.
  - *Certifications Repeater* for AWS, Scrum Master, or language certificates.
  - *Chiffres clés / Réalisations chiffrées* (+30% performance) inside experience timelines.
  - *Dates, rôles (solo/team), et démonstrations vidéos* inside project cards.
- **10 ATS-Friendly CV Layouts**: Customizable templates (Modern, Classic, Split, Academic, Startup, Two-Tone, Artistic, etc.) exportable directly to PDF.
- **Robust Auto-Save Drafts**: Automatically saves the user's progress to `localStorage` on change. The status of the draft is visible in the sidebar, with an option to restore default demo data.
- **Image Optimization**: Automatically validates image format and uses an off-screen `<canvas>` to downscale and compress images client-side (to JPEG, quality 80%) on upload, saving space and preventing browser localStorage quota issues.
- **Export Packages**: Exports a standalone, deployable web ZIP package containing pure `index.html`, `styles.css`, `script.js` assets, and local image folders, ready for deployment on platforms like Vercel, Netlify, or GitHub Pages.

---

## Folder Structure

```text
portfolio-plugin/
├── index.html          # Workspace user interface & editor layouts
├── styles.css          # Studio main stylesheet (glassmorphic dark mode)
├── app.js              # Application state, image scaling, validation, and auto-save
├── templates.js        # Engine for sanitizing and compiling HTML/CSS/JS outputs
├── scripts/
│   ├── README.md       # Dev scripts instructions
│   └── inject_templates.js # Utility for patching compiled template bundles
└── tests/
    └── test.js         # Basic node-based automated compilation assertions
```

---

## Getting Started

### Prerequisites
To run the builder interface, you only need a modern web browser. 

### Starting the Local Server
For the live preview and exports to work correctly across all browsers, it is recommended to run the project using a local HTTP server:
```bash
# Start a simple server using npx
npx http-server
```
Once the server is running, navigate to `http://127.0.0.1:8080` in your web browser.

---

## Deployment
Portfolios exported using the "Télécharger le ZIP" option can be deployed immediately:
1. Extract the downloaded `.zip` file.
2. Upload the extracted folder to **Vercel**, **Netlify**, or configure it as a **GitHub Pages** repository.
