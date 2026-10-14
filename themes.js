/**
 * Portfolio Studio — thèmes
 *
 * Un thème ne contient que du style : polices, palettes clair/sombre, arrondis
 * et un complément de CSS. La structure HTML est commune (engine.js), donc
 * chaque thème bénéficie automatiquement des corrections du moteur.
 *
 * Pour ajouter un thème : copier un bloc, changer l'id, ajuster les valeurs.
 */
(function (root) {
  'use strict';

  const THEMES = {
    /* ------------------------------------------------------------
       Signature : chaleureux, sombre par défaut, très lisible
       ------------------------------------------------------------ */
    signature: {
      id: 'signature',
      name: 'Signature',
      description: 'Sombre et chaleureux, typographie expressive. Le plus polyvalent.',
      swatch: ['#0e0d0b', '#e8743b'],
      accent: '#e8743b',
      accent2: '#f2b84b',
      defaultMode: 'dark',
      fonts: {
        url: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700&display=swap',
        display: "'Bricolage Grotesque', system-ui, sans-serif",
        body: "'Manrope', system-ui, sans-serif"
      },
      headingWeight: 800,
      radius: { sm: '10px', lg: '20px', btn: '999px' },
      light: {
        bg: '#faf7f2', bgAlt: '#f2ede5', surface: '#ffffff', surface2: '#f6f1ea', border: '#e4ddd2',
        text: '#1a1714', textSoft: '#4d463e', textMuted: '#776e63', success: '#23804a',
        shadow: '0 20px 50px -24px rgba(60, 40, 20, 0.25)'
      },
      dark: {
        bg: '#0e0d0b', bgAlt: '#151310', surface: '#1b1814', surface2: '#24201b', border: '#2e2923',
        text: '#f4efe8', textSoft: '#b9b0a4', textMuted: '#8a8177', success: '#5fbf7f',
        shadow: '0 20px 50px -20px rgba(0, 0, 0, 0.6)'
      },
      css: `
.hero-title { font-size: clamp(2.6rem, 6vw, 6rem); }
.hero-tagline { color: var(--accent-text); }
`
    },

    /* ------------------------------------------------------------
       Épuré : clair, sobre, beaucoup d'air — profils corporate
       ------------------------------------------------------------ */
    minimal: {
      id: 'minimal',
      name: 'Épuré',
      description: 'Clair et sobre, beaucoup d’espace. Idéal pour le conseil, la finance, le corporate.',
      swatch: ['#ffffff', '#2563eb'],
      accent: '#2563eb',
      accent2: '#60a5fa',
      defaultMode: 'light',
      fonts: {
        url: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700&family=Inter:wght@400;500;600;700&display=swap',
        display: "'Inter Tight', 'Inter', system-ui, sans-serif",
        body: "'Inter', system-ui, sans-serif"
      },
      headingWeight: 700,
      headingTracking: '-0.03em',
      radius: { sm: '8px', lg: '14px', btn: '10px' },
      wrap: '1320px',
      light: {
        bg: '#ffffff', bgAlt: '#f6f7f9', surface: '#ffffff', surface2: '#f3f4f6', border: '#e5e7eb',
        text: '#0f1115', textSoft: '#3f4652', textMuted: '#6b7280', success: '#15803d',
        shadow: '0 16px 40px -24px rgba(15, 17, 21, 0.25)'
      },
      dark: {
        bg: '#0c0d10', bgAlt: '#121419', surface: '#15171c', surface2: '#1c1f26', border: '#262a33',
        text: '#f3f4f6', textSoft: '#b4bac5', textMuted: '#868d99', success: '#4ade80',
        shadow: '0 16px 40px -20px rgba(0, 0, 0, 0.6)'
      },
      css: `
.hero::before { display: none; }
@media (min-width: 981px) { .hero-grid { grid-template-columns: minmax(0, 1fr) minmax(220px, 360px); } }
.portrait { aspect-ratio: 1; border-radius: 50%; box-shadow: none; }
.hero-title { font-size: clamp(2.4rem, 5vw, 5rem); }
.hero-tagline { color: var(--text-soft); font-family: var(--font-body); font-weight: 500; }
.section-head { border-top: 1px solid var(--border); padding-top: 22px; max-width: none; }
.eyebrow { letter-spacing: .08em; }
.project, .entry, .skill-group, .cert { box-shadow: var(--shadow); border-color: transparent; }
html[data-mode="dark"] .project, html[data-mode="dark"] .entry,
html[data-mode="dark"] .skill-group, html[data-mode="dark"] .cert { border-color: var(--border); box-shadow: none; }
.contact-card { background: var(--bg-alt); border: none; }
@media (max-width: 980px) { .hero-media { max-width: 160px; } }
@media (max-width: 760px) { .hero-media { max-width: 112px; } }
`
    },

    /* ------------------------------------------------------------
       Éditorial : serif, tons papier — créatifs, rédacteurs, design
       ------------------------------------------------------------ */
    editorial: {
      id: 'editorial',
      name: 'Éditorial',
      description: 'Serif élégant et tons papier, mise en page de magazine.',
      swatch: ['#f6f1e7', '#9a3412'],
      accent: '#9a3412',
      accent2: '#c2410c',
      defaultMode: 'light',
      fonts: {
        url: 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Instrument+Sans:wght@400;500;600;700&display=swap',
        display: "'Newsreader', Georgia, serif",
        body: "'Instrument Sans', system-ui, sans-serif"
      },
      headingWeight: 400,
      headingTracking: '-0.01em',
      radius: { sm: '2px', lg: '4px', btn: '2px' },
      light: {
        bg: '#f6f1e7', bgAlt: '#efe8da', surface: '#fbf8f2', surface2: '#efe8da', border: '#d9cfbd',
        text: '#1d1a16', textSoft: '#4a443b', textMuted: '#7a7163', success: '#2f6b3a',
        shadow: 'none'
      },
      dark: {
        bg: '#15130f', bgAlt: '#1b1813', surface: '#1d1a15', surface2: '#26221b', border: '#3a342a',
        text: '#efe8da', textSoft: '#c2b8a6', textMuted: '#948a79', success: '#86c08f',
        shadow: 'none'
      },
      css: `
.hero::before { display: none; }
.hero-title { font-size: clamp(2.6rem, 7.4vw, 7.4rem); line-height: 1; }
.hero-tagline { font-style: italic; color: var(--text-soft); }
.hero-kicker, .eyebrow { font-family: var(--font-body); }
.portrait { box-shadow: none; filter: grayscale(.15) contrast(1.02); }
.section-head h2 { font-size: clamp(2.2rem, 4.4vw, 3.4rem); }
.section-head { border-bottom: 1px solid var(--text); padding-bottom: 18px; max-width: none; }
.project { background: transparent; border: none; border-top: 1px solid var(--border); border-radius: 0; padding-top: 28px; }
.project-media { background: transparent; padding: 0 0 20px; }
.project:first-child .project-media { padding: 0 32px 0 0; }
.project:nth-child(even):last-child .project-media { padding: 0 0 0 32px; }
.project-media img { box-shadow: none; border-radius: 0; }
.project-body, .project:first-child .project-body, .project:nth-child(even):last-child .project-body { padding: 0; }
.project h3 { font-size: 2rem; }
.entry { background: transparent; border: none; border-bottom: 1px solid var(--border); border-radius: 0; padding: 24px 0; }
.entry h3 { font-size: 1.5rem; }
.skill-group, .cert { background: transparent; border: 1px solid var(--border); }
.chips li { background: transparent; border-radius: 2px; }
.contact-card { background: transparent; border-top: 1px solid var(--text); border-bottom: 1px solid var(--text); border-left: none; border-right: none; }
.contact-card h2 { font-style: italic; }
@media (max-width: 980px) {
  .project:first-child .project-media, .project:nth-child(even):last-child .project-media { padding: 0 0 20px; }
}
`
    },

    /* ------------------------------------------------------------
       Terminal : monospace, esprit console — développeurs
       ------------------------------------------------------------ */
    terminal: {
      id: 'terminal',
      name: 'Terminal',
      description: 'Monospace et esprit console, pour les profils techniques.',
      swatch: ['#0b0f14', '#22c55e'],
      accent: '#22c55e',
      accent2: '#38bdf8',
      defaultMode: 'dark',
      fonts: {
        url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap',
        display: "'JetBrains Mono', ui-monospace, monospace",
        body: "'JetBrains Mono', ui-monospace, monospace",
        mono: "'JetBrains Mono', ui-monospace, monospace"
      },
      headingWeight: 700,
      headingTracking: '-0.02em',
      radius: { sm: '4px', lg: '8px', btn: '4px' },
      light: {
        bg: '#f6f8fa', bgAlt: '#eef1f4', surface: '#ffffff', surface2: '#f0f3f6', border: '#d0d7de',
        text: '#1f2328', textSoft: '#424a53', textMuted: '#656d76', success: '#1a7f37',
        shadow: 'none'
      },
      dark: {
        bg: '#0b0f14', bgAlt: '#0f141b', surface: '#111821', surface2: '#16202b', border: '#223040',
        text: '#d6e2f0', textSoft: '#a5b4c6', textMuted: '#6f8298', success: '#4ade80',
        shadow: 'none'
      },
      css: `
body { font-size: .95rem; }
.hero::before { background: radial-gradient(50% 40% at 80% 10%, var(--accent-soft), transparent 70%); }
.hero-kicker::before { content: "$ whoami → "; color: var(--text-muted); }
.hero-title { font-size: clamp(2.1rem, 5.6vw, 3.8rem); }
.hero-title::after { content: "_"; color: var(--accent-text); animation: blink 1.1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.hero-tagline { font-size: clamp(1.05rem, 2vw, 1.3rem); color: var(--text-soft); }
.hero-tagline::before { content: "// "; color: var(--text-muted); }
.eyebrow { text-transform: none; letter-spacing: 0; font-size: .9rem; }
.eyebrow-num { display: none; }
.eyebrow::before { content: "~/"; color: var(--text-muted); }
.section-head h2 { font-size: clamp(1.5rem, 3vw, 2.1rem); }
.portrait { border-radius: var(--radius-lg); filter: saturate(.9); }
.chips li { border-radius: var(--radius-sm); }
.chips li::before { content: "▹ "; color: var(--accent-text); }
.tag { border-radius: var(--radius-sm); }
.rich li::before { content: ">"; width: auto; height: auto; background: none; color: var(--accent-text); top: 0; }
.socials a { border-radius: var(--radius-sm); }
`
    }
  };

  root.PORTFOLIO_THEMES = THEMES;
  if (typeof module !== 'undefined' && module.exports) module.exports = THEMES;
})(typeof window !== 'undefined' ? window : globalThis);
