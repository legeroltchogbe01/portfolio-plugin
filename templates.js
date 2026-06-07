/**
 * Portfolio Studio - Templates Engine
 * This file contains the template layouts, styling, and the compiler logic
 * to build the client-side portfolios.
 */

// Helper to strip base64 data URLs for ZIP exports
function extractImageInfo(dataUrl, defaultName) {
  if (!dataUrl) return null;
  if (dataUrl.startsWith('data:')) {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (matches) {
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      return {
        ext: ext,
        base64: matches[2],
        filename: `${defaultName}.${ext}`,
        path: `images/${defaultName}.${ext}`
      };
    }
  }
  return null;
}

// Helper to compile personal recruitment specifications beautifully based on the active theme
function getPersonalSpecsHtml(p, themeId) {
  const specs = [];
  if (p.age) specs.push({ label: 'Âge', value: `${p.age} ans`, icon: 'fa-calendar-alt' });
  if (p.experience) specs.push({ label: 'Expérience', value: `${p.experience} ans`, icon: 'fa-briefcase' });
  if (p.location) specs.push({ label: 'Localisation', value: p.location, icon: 'fa-map-marker-alt' });
  if (p.availability) specs.push({ label: 'Disponibilité', value: p.availability, icon: 'fa-clock' });
  if (p.contract) specs.push({ label: 'Contrat', value: p.contract, icon: 'fa-file-contract' });
  if (p.languages) specs.push({ label: 'Langues', value: p.languages, icon: 'fa-language' });
  if (p.hobbies) specs.push({ label: 'Loisirs', value: p.hobbies, icon: 'fa-heart' });
  
  if (p.phone) {
    const cleanPhone = p.phone.replace(/[^0-9+]/g, '');
    const isWhatsapp = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}` : '#';
    specs.push({ 
      label: 'WhatsApp', 
      value: `<a href="${isWhatsapp}" target="_blank" class="spec-link">${p.phone}</a>`, 
      icon: 'fa-whatsapp' 
    });
  }

  if (specs.length === 0) return '';

  if (themeId === 'developer') {
    const rows = specs.map(s => {
      const cleanVal = s.value.includes('<a') ? p.phone : s.value;
      return `  ${s.label.toLowerCase().padEnd(15)}: "${cleanVal}",`;
    }).join('\n');
    return `\n<div class="terminal-specs-block">\n<span class="cyan">const</span> personal_details = {\n${rows}\n};</div>`;
  }

  const items = specs.map(s => `
    <div class="spec-item">
      <div class="spec-icon"><i class="fas ${s.icon}"></i></div>
      <div class="spec-content">
        <span class="spec-label">${s.label}</span>
        <span class="spec-value">${s.value}</span>
      </div>
    </div>
  `).join('');

  return `<div class="specs-grid theme-${themeId}">${items}</div>`;
}

// Generate the portfolio contents
function generatePortfolio(data, themeId, isExport = false) {
  // 1. Process images
  const images = [];
  let avatarPath = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
  
  const avatarInfo = extractImageInfo(data.profile.avatar, 'avatar');
  if (avatarInfo) {
    images.push(avatarInfo);
    avatarPath = isExport ? avatarInfo.path : data.profile.avatar;
  } else if (data.profile.avatar) {
    avatarPath = data.profile.avatar; // absolute URL if provided
  }

  // Project images
  const processedProjects = data.projects.map((project, idx) => {
    let projectImagePath = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600';
    const imgInfo = extractImageInfo(project.image, `project-${idx}`);
    if (imgInfo) {
      images.push(imgInfo);
      projectImagePath = isExport ? imgInfo.path : project.image;
    } else if (project.image) {
      projectImagePath = project.image;
    }
    return { ...project, imagePath: projectImagePath };
  });

  // 2. Select theme templates
  let html = '';
  let css = '';
  let js = '';

  if (themeId === 'minimalist') {
    ({ html, css, js } = getMinimalistTemplate(data, avatarPath, processedProjects));
  } else if (themeId === 'creative') {
    ({ html, css, js } = getCreativeTemplate(data, avatarPath, processedProjects));
  } else if (themeId === 'developer') {
    ({ html, css, js } = getDeveloperTemplate(data, avatarPath, processedProjects));
  } else if (themeId === 'brutalist') {
    ({ html, css, js } = getBrutalistTemplate(data, avatarPath, processedProjects));
  } else if (themeId === 'editorial') {
    ({ html, css, js } = getEditorialTemplate(data, avatarPath, processedProjects));
  } else {
    ({ html, css, js } = getMinimalistTemplate(data, avatarPath, processedProjects));
  }

  return { html, css, js, images };
}

// -------------------------------------------------------------
// 1. MODERN MINIMALIST TEMPLATE
// -------------------------------------------------------------
function getMinimalistTemplate(data, avatarPath, projects) {
  const p = data.profile;
  const accent = data.design.accentColor || '#6366f1';
  
  // Render Skills
  const skillsHtml = data.skills.map(s => `
    <div class="skill-item reveal" data-tilt data-tilt-max="15" data-tilt-glare="true" data-tilt-max-glare="0.1">
      <span class="skill-name">${s.name}</span>
      <div class="skill-bar-container">
        <div class="skill-bar" style="width: ${s.level}%"></div>
      </div>
    </div>
  `).join('');

  // Render Projects
  const projectsHtml = projects.map(p => `
    <div class="project-card reveal" data-tilt data-tilt-max="5" data-tilt-glare="true" data-tilt-max-glare="0.1">
      <div class="project-img-container">
        <img src="${p.imagePath}" alt="${p.title}" class="project-img" loading="lazy">
      </div>
      <div class="project-info">
        <span class="project-tag">${p.category || 'Project'}</span>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-tech">
          ${(p.technologies || '').split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')}
        </div>
        <div class="project-links">
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="proj-link"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
          ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="proj-link"><i class="fab fa-github"></i> Source</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  // Render Timeline (Experience & Education)
  const timelineHtml = data.timeline.map(t => `
    <div class="timeline-item reveal">
      <div class="timeline-meta">
        <span class="timeline-period">${t.startDate} - ${t.endDate || 'Présent'}</span>
        <span class="timeline-org">${t.organization}</span>
      </div>
      <div class="timeline-content">
        <h4 class="timeline-role">${t.role}</h4>
        <p class="timeline-desc">${t.description}</p>
      </div>
    </div>
  `).join('');

  // Social Links
  const socialHtml = `
    ${p.github ? `<a href="${p.github}" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>` : ''}
    ${p.linkedin ? `<a href="${p.linkedin}" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
    ${p.twitter ? `<a href="${p.twitter}" target="_blank" aria-label="Twitter"><i class="fab fa-twitter"></i></a>` : ''}
    ${p.facebook ? `<a href="${p.facebook}" target="_blank" aria-label="Facebook"><i class="fab fa-facebook"></i></a>` : ''}
    ${p.email ? `<a href="mailto:${p.email}" aria-label="Email"><i class="fas fa-envelope"></i></a>` : ''}
  `;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name} | Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="header">
    <div class="container header-container">
      <a href="#" class="logo">${p.name || 'Portfolio'}</a>
      <nav class="nav">
        <a href="#about">À Propos</a>
        <a href="#projects">Projets</a>
        <a href="#experience">Parcours</a>
        <a href="#contact">Contact</a>
      </nav>
      <button class="menu-toggle" aria-label="Toggle Menu">
        <span></span>
        <span></span>
      </button>
    </div>
  </header>

  <main>
    <!-- HERO SECTION -->
    <section class="hero" id="about">
      <div class="container hero-container">
        <div class="hero-text">
          <span class="hero-subtitle">${p.title || 'Bienvenue sur mon site'}</span>
          <h1 class="hero-title">${p.name}</h1>
          <p class="hero-desc">${p.bio || 'Je conçois et développe des expériences web épurées.'}</p>
          ${getPersonalSpecsHtml(p, 'minimalist')}
          <div class="hero-actions">
            <a href="#contact" class="btn btn-primary">Me contacter</a>
            <a href="#projects" class="btn btn-secondary">Voir mes projets</a>
          </div>
          <div class="hero-socials">
            ${socialHtml}
          </div>
        </div>
        <div class="hero-image-wrapper">
          <img src="${avatarPath}" alt="${p.name}" class="hero-image">
        </div>
      </div>
    </section>

    <!-- SKILLS SECTION -->
    <section class="skills">
      <div class="container">
        <h2 class="section-title">Mes Compétences</h2>
        <div class="skills-grid">
          ${skillsHtml || '<p>Aucune compétence saisie pour le moment.</p>'}
        </div>
      </div>
    </section>

    <!-- PROJECTS SECTION -->
    <section class="projects" id="projects">
      <div class="container">
        <h2 class="section-title">Mes Projets Récents</h2>
        <div class="projects-grid">
          ${projectsHtml || '<p>Aucun projet saisi pour le moment.</p>'}
        </div>
      </div>
    </section>

    <!-- TIMELINE SECTION -->
    <section class="experience" id="experience">
      <div class="container">
        <h2 class="section-title">Mon Parcours</h2>
        <div class="timeline">
          ${timelineHtml || '<p>Aucune expérience saisie pour le moment.</p>'}
        </div>
      </div>
    </section>

    <!-- CONTACT SECTION -->
    <section class="contact" id="contact">
      <div class="container contact-container">
        <div class="contact-card">
          <h2 class="contact-title">Discutons de votre projet</h2>
          <p class="contact-desc">Je suis toujours ouvert à de nouvelles opportunités ou collaborations. Envoyez-moi un message !</p>
          ${p.email ? `<a href="mailto:${p.email}" class="btn btn-primary btn-large">${p.email}</a>` : ''}
          <div class="contact-socials">
            ${socialHtml}
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${p.name}. Tous droits réservés.</p>
    </div>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js"></script>
  <script src="script.js"></script>
</body>
</html>`;

  const css = `:root {
  --bg-color: #fafafa;
  --text-color: #171717;
  --text-muted: #666666;
  --accent-color: ${accent};
  --card-bg: #ffffff;
  --border-color: #e5e5e5;
  --font-title: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: var(--font-body);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(250, 250, 250, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  z-index: 100;
  transition: all 0.3s;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.logo {
  font-family: var(--font-title);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  text-decoration: none;
  letter-spacing: -0.5px;
}

.nav {
  display: flex;
  gap: 2.5rem;
}

.nav a {
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav a:hover {
  color: var(--accent-color);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  flex-direction: column;
  gap: 6px;
}

.menu-toggle span {
  display: block;
  width: 25px;
  height: 2px;
  background-color: var(--text-color);
  transition: 0.3s;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 0.75rem 1.75rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-primary {
  background-color: var(--accent-color);
  color: #ffffff;
  border: 1px solid var(--accent-color);
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: rgba(0, 0, 0, 0.03);
  transform: translateY(-2px);
}

.btn-large {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

/* Hero Section */
.hero {
  padding: 180px 0 100px 0;
}

.hero-container {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
  gap: 4rem;
}

.hero-subtitle {
  color: var(--accent-color);
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-size: 0.85rem;
  display: block;
  margin-bottom: 1rem;
}

.hero-title {
  font-family: var(--font-title);
  font-size: 3.5rem;
  line-height: 1.15;
  font-weight: 700;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
}

.hero-desc {
  font-size: 1.15rem;
  color: var(--text-muted);
  margin-bottom: 2.5rem;
  max-width: 550px;
}

/* Specs Grid */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 2rem;
  margin: 2rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1.5rem 0;
}
.spec-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.spec-icon {
  font-size: 1.15rem;
  color: var(--accent-color);
  width: 24px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spec-content {
  display: flex;
  flex-direction: column;
}
.spec-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 0.5px;
}
.spec-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
}
.spec-link {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 700;
}
.spec-link:hover {
  text-decoration: underline;
}

.hero-actions {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 3rem;
}

.hero-socials {
  display: flex;
  gap: 1.5rem;
}

.hero-socials a {
  color: var(--text-muted);
  font-size: 1.3rem;
  transition: color 0.2s, transform 0.2s;
}

.hero-socials a:hover {
  color: var(--accent-color);
  transform: translateY(-3px);
}

.hero-image-wrapper {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  aspect-ratio: 1;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.hero-image-wrapper:hover .hero-image {
  transform: scale(1.05);
}

/* Sections */
section {
  padding: 100px 0;
}

.section-title {
  font-family: var(--font-title);
  font-size: 2.25rem;
  margin-bottom: 4rem;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 40px;
  height: 3px;
  background-color: var(--accent-color);
  margin: 1rem auto 0 auto;
}

/* Skills */
.skills {
  border-top: 1px solid var(--border-color);
  background-color: #f6f6f6;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem 4rem;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skill-name {
  font-weight: 500;
  font-size: 1rem;
}

.skill-bar-container {
  height: 6px;
  background-color: #e5e5e5;
  border-radius: 3px;
  overflow: hidden;
}

.skill-bar {
  height: 100%;
  background-color: var(--accent-color);
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.1, 0.8, 0.2, 1);
}

/* Projects */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
}

.project-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05);
}

.project-img-container {
  aspect-ratio: 16/9;
  overflow: hidden;
  border-bottom: 1px solid var(--border-color);
}

.project-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.project-card:hover .project-img {
  transform: scale(1.04);
}

.project-info {
  padding: 2rem;
}

.project-tag {
  color: var(--accent-color);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.project-title {
  font-family: var(--font-title);
  font-size: 1.5rem;
  margin: 0.5rem 0 1rem 0;
}

.project-desc {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  min-height: 70px;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tech-tag {
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.project-links {
  display: flex;
  gap: 1.5rem;
}

.proj-link {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: color 0.2s;
}

.proj-link:hover {
  color: var(--accent-color);
}

/* Timeline */
.timeline {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  padding-left: 2rem;
  border-left: 2px solid var(--border-color);
}

.timeline-item {
  position: relative;
  margin-bottom: 3.5rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -2.35rem;
  top: 0.3rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--accent-color);
  border: 4px solid var(--bg-color);
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.timeline-period {
  font-weight: 600;
  color: var(--accent-color);
}

.timeline-org {
  color: var(--text-muted);
  font-weight: 500;
}

.timeline-role {
  font-family: var(--font-title);
  font-size: 1.35rem;
  margin-bottom: 0.75rem;
}

.timeline-desc {
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* Contact */
.contact {
  background-color: #171717;
  color: #ffffff;
}

.contact-container {
  display: flex;
  justify-content: center;
}

.contact-card {
  text-align: center;
  max-width: 600px;
}

.contact-title {
  font-family: var(--font-title);
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.contact-desc {
  color: #a3a3a3;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
}

.contact .btn-primary {
  margin-bottom: 2.5rem;
}

.contact-socials {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.contact-socials a {
  color: #a3a3a3;
  font-size: 1.5rem;
  transition: color 0.2s, transform 0.2s;
}

.contact-socials a:hover {
  color: #ffffff;
  transform: translateY(-3px);
}

/* Footer */
.footer {
  padding: 2.5rem 0;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Animations */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
}
.reveal.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
.hero-subtitle::after {
  content: '|';
  animation: blink 0.7s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Responsive */
@media (max-width: 900px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
  
  .hero-image-wrapper {
    order: -1;
    max-width: 320px;
    margin: 0 auto;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-socials {
    justify-content: center;
  }
  
  .skills-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .header-container {
    height: 70px;
  }
  
  .nav {
    display: none; /* simple hidden layout for mobile template */
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .timeline-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}`;

  const js = `// Interactive Animations
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      toggle.classList.toggle('active');
    });
  }

  // Typewriter effect
  const title = document.querySelector('.hero-subtitle');
  if (title) {
    const text = title.textContent;
    title.textContent = '';
    let i = 0;
    function typeWriter() {
      if (i < text.length) {
        title.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
      }
    }
    setTimeout(typeWriter, 500);
  }

  // Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});`;

  return { html, css, js };
}

// -------------------------------------------------------------
// 2. CREATIVE GRADIENT / GLASSMORPHISM TEMPLATE
// -------------------------------------------------------------
function getCreativeTemplate(data, avatarPath, projects) {
  const p = data.profile;
  const gradientStart = data.design.accentColor || '#ec4899';
  const gradientEnd = data.design.secondaryColor || '#8b5cf6';

  const skillsHtml = data.skills.map(s => `
    <div class="skill-card reveal" data-tilt data-tilt-max="10" data-tilt-glare="true" data-tilt-max-glare="0.2">
      <div class="skill-icon-placeholder">
        <i class="fas fa-code"></i>
      </div>
      <h3 class="skill-name">${s.name}</h3>
      <span class="skill-level">${s.level}% Expertise</span>
      <div class="skill-progress-track">
        <div class="skill-progress-bar" style="width: ${s.level}%"></div>
      </div>
    </div>
  `).join('');

  const projectsHtml = projects.map(p => `
    <div class="creative-project-card reveal" data-tilt data-tilt-max="5" data-tilt-glare="true" data-tilt-max-glare="0.2">
      <div class="creative-project-image">
        <img src="${p.imagePath}" alt="${p.title}">
        <div class="project-overlay">
          <div class="project-links">
            ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" aria-label="Demo"><i class="fas fa-external-link-alt"></i></a>` : ''}
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>` : ''}
          </div>
        </div>
      </div>
      <div class="creative-project-body">
        <span class="category-badge">${p.category || 'Conception'}</span>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="tech-tags">
          ${(p.technologies || '').split(',').map(t => `<span>${t.trim()}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  const timelineHtml = data.timeline.map(t => `
    <div class="timeline-block reveal">
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <span class="time-range">${t.startDate} - ${t.endDate || 'Présent'}</span>
        <h3>${t.role}</h3>
        <h4>${t.organization}</h4>
        <p>${t.description}</p>
      </div>
    </div>
  `).join('');

  const socialHtml = `
    ${p.github ? `<a href="${p.github}" target="_blank"><i class="fab fa-github"></i></a>` : ''}
    ${p.linkedin ? `<a href="${p.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>` : ''}
    ${p.twitter ? `<a href="${p.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
    ${p.facebook ? `<a href="${p.facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>` : ''}
    ${p.email ? `<a href="mailto:${p.email}"><i class="fas fa-envelope"></i></a>` : ''}
  `;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name} | Portfolio Créatif</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- BACKGROUND GRADIENT ORBS -->
  <div class="bg-orb orb-1"></div>
  <div class="bg-orb orb-2"></div>
  <div class="bg-orb orb-3"></div>

  <header class="header">
    <div class="container header-wrap">
      <a href="#" class="brand-logo">${p.name || 'Studio'}</a>
      <nav class="nav-links">
        <a href="#about">À Propos</a>
        <a href="#competences">Compétences</a>
        <a href="#travaux">Projets</a>
        <a href="#parcours">Parcours</a>
        <a href="#contact" class="nav-btn">Me Contacter</a>
      </nav>
    </div>
  </header>

  <main>
    <!-- HERO -->
    <section class="hero-section" id="about">
      <div class="container hero-grid">
        <div class="hero-content">
          <div class="badge-accent">Disponible pour de nouveaux projets</div>
          <h1 class="hero-heading">Je crée des <span class="gradient-text">expériences d'exception</span>.</h1>
          <p class="hero-lead">${p.bio || 'Je suis ' + p.name + ', concepteur de produits numériques et ingénieur créatif.'}</p>
          ${getPersonalSpecsHtml(p, 'creative')}
          <div class="hero-cta-group">
            <a href="#travaux" class="btn btn-filled">Explorer mes projets</a>
            <a href="#contact" class="btn btn-outline">Discuter</a>
          </div>
          <div class="hero-socials-bar">
            ${socialHtml}
          </div>
        </div>
        <div class="hero-visual">
          <div class="image-border-glow">
            <img src="${avatarPath}" alt="${p.name}" class="avatar-img">
          </div>
        </div>
      </div>
    </section>

    <!-- SKILLS -->
    <section class="skills-section" id="competences">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Compétences</span>
          <h2>Mon Expertise Technique</h2>
        </div>
        <div class="skills-carousel">
          ${skillsHtml || '<p>Aucune compétence.</p>'}
        </div>
      </div>
    </section>

    <!-- PROJECTS -->
    <section class="projects-section" id="travaux">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Créations</span>
          <h2>Projets Sélectionnés</h2>
        </div>
        <div class="projects-masonry">
          ${projectsHtml || '<p>Aucun projet disponible.</p>'}
        </div>
      </div>
    </section>

    <!-- TIMELINE -->
    <section class="timeline-section" id="parcours">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Expérience</span>
          <h2>Mon Parcours Professionnel</h2>
        </div>
        <div class="timeline-flow">
          ${timelineHtml || '<p>Aucun événement.</p>'}
        </div>
      </div>
    </section>

    <!-- CONTACT -->
    <section class="contact-section" id="contact">
      <div class="container">
        <div class="glass-contact-card">
          <h2>Prêt à donner vie à vos projets ?</h2>
          <p>Discutons de vos besoins et concevons quelque chose d'incroyable ensemble.</p>
          ${p.email ? `<a href="mailto:${p.email}" class="btn-gradient-fill">Envoyer un Email <i class="fas fa-arrow-right"></i></a>` : ''}
          <div class="contact-social-icons">
            ${socialHtml}
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${p.name}. Conçu avec passion.</p>
    </div>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js"></script>
  <script src="script.js"></script>
</body>
</html>`;

  const css = `:root {
  --bg-dark: #0b0f19;
  --text-light: #f3f4f6;
  --text-gray: #9ca3af;
  --grad-start: ${gradientStart};
  --grad-end: ${gradientEnd};
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.07);
  --glass-glow: rgba(139, 92, 246, 0.15);
  --font-jakarta: 'Plus Jakarta Sans', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-light);
  font-family: var(--font-jakarta);
  overflow-x: hidden;
  position: relative;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Background Orbs */
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  z-index: -1;
  opacity: 0.4;
}

.orb-1 {
  top: 10%;
  right: -5%;
  width: 400px;
  height: 400px;
  background: var(--grad-start);
}

.orb-2 {
  top: 45%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: var(--grad-end);
}

.orb-3 {
  bottom: 5%;
  right: 10%;
  width: 350px;
  height: 350px;
  background: var(--grad-start);
}

/* Animations */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
}
.reveal.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
.cursor-glow {
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glass-glow) 0%, transparent 60%);
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9999;
  transition: left 0.1s ease-out, top 0.1s ease-out;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--glass-border);
  background-color: rgba(11, 15, 25, 0.7);
}

.header-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 90px;
}

.brand-logo {
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  color: #ffffff;
  background: linear-gradient(135deg, var(--grad-start), var(--grad-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-gray);
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #ffffff;
}

.nav-links .nav-btn {
  background: linear-gradient(135deg, var(--grad-start), var(--grad-end));
  color: #ffffff;
  padding: 0.6rem 1.5rem;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.nav-links .nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
}

/* Hero Section */
.hero-section {
  padding: 200px 0 120px 0;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 5rem;
  align-items: center;
}

.badge-accent {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--grad-start);
  margin-bottom: 1.5rem;
}

.hero-heading {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -2px;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, var(--grad-start), var(--grad-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-lead {
  font-size: 1.2rem;
  color: var(--text-gray);
  margin-bottom: 3rem;
  font-weight: 400;
  max-width: 600px;
}

/* Specs Grid - Creative Glassmorphism */
.specs-grid.theme-creative {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
  margin-bottom: 2.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: 1.25rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  max-width: 600px;
}
.specs-grid.theme-creative .spec-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.specs-grid.theme-creative .spec-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(236, 72, 153, 0.2);
  color: var(--grad-start);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}
.specs-grid.theme-creative .spec-content {
  display: flex;
  flex-direction: column;
}
.specs-grid.theme-creative .spec-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: var(--text-gray);
  font-weight: 700;
  letter-spacing: 0.5px;
}
.specs-grid.theme-creative .spec-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
}
.specs-grid.theme-creative .spec-link {
  color: var(--grad-end);
  text-decoration: underline;
}

.hero-cta-group {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 3.5rem;
}

.btn {
  padding: 0.9rem 2.2rem;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.btn-filled {
  background-color: #ffffff;
  color: var(--bg-dark);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.1);
}

.btn-filled:hover {
  background-color: var(--text-light);
  transform: translateY(-3px);
}

.btn-outline {
  border: 2px solid var(--glass-border);
  color: #ffffff;
  background-color: transparent;
}

.btn-outline:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: #ffffff;
  transform: translateY(-3px);
}

.hero-socials-bar {
  display: flex;
  gap: 1.5rem;
}

.hero-socials-bar a {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-light);
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.3s;
}

.hero-socials-bar a:hover {
  background: linear-gradient(135deg, var(--grad-start), var(--grad-end));
  color: #ffffff;
  transform: translateY(-4px) rotate(8deg);
}

.hero-visual {
  display: flex;
  justify-content: center;
}

.image-border-glow {
  padding: 10px;
  border-radius: 30px;
  background: linear-gradient(135deg, var(--grad-start), var(--grad-end));
  box-shadow: 0 20px 50px var(--glass-glow);
  max-width: 360px;
}

.avatar-img {
  width: 100%;
  height: auto;
  border-radius: 20px;
  display: block;
}

/* Sections Header */
section {
  padding: 100px 0;
}

.section-header {
  margin-bottom: 4rem;
  text-align: center;
}

.section-tag {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--grad-start);
  display: block;
  margin-bottom: 0.5rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -1px;
}

/* Skills */
.skills-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}

.skill-card {
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: 2.5rem 2rem;
  border-radius: 24px;
  transition: all 0.3s;
}

.skill-card:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--grad-start);
  transform: translateY(-5px);
}

.skill-icon-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(236, 72, 153, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--grad-start);
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.skill-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.skill-level {
  font-size: 0.85rem;
  color: var(--text-gray);
  margin-bottom: 1.5rem;
  display: block;
}

.skill-progress-track {
  height: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
}

.skill-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--grad-start), var(--grad-end));
  border-radius: 10px;
}

/* Projects */
.projects-masonry {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
}

.creative-project-card {
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.3s;
}

.creative-project-card:hover {
  border-color: var(--grad-end);
  box-shadow: 0 15px 30px var(--glass-glow);
  transform: translateY(-5px);
}

.creative-project-image {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
}

.creative-project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.creative-project-card:hover .creative-project-image img {
  transform: scale(1.05);
}

.project-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(11, 15, 25, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.creative-project-image:hover .project-overlay {
  opacity: 1;
}

.project-overlay .project-links {
  display: flex;
  gap: 1.5rem;
}

.project-overlay .project-links a {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ffffff;
  color: var(--bg-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  text-decoration: none;
  transition: transform 0.2s;
}

.project-overlay .project-links a:hover {
  transform: scale(1.1);
  background-color: var(--grad-start);
  color: #ffffff;
}

.creative-project-body {
  padding: 2rem;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  background-color: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: var(--grad-end);
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.creative-project-body h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.creative-project-body p {
  color: var(--text-gray);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  min-height: 50px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tags span {
  font-size: 0.8rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-light);
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-weight: 500;
}

/* Timeline */
.timeline-flow {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.timeline-flow::before {
  content: '';
  position: absolute;
  left: 31px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--grad-start), var(--grad-end));
  opacity: 0.3;
}

.timeline-block {
  display: flex;
  align-items: flex-start;
  margin-bottom: 3.5rem;
  position: relative;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--grad-start), var(--grad-end));
  border: 4px solid var(--bg-dark);
  margin-left: 24px;
  margin-right: 32px;
  position: relative;
  z-index: 10;
  box-shadow: 0 0 10px var(--grad-start);
  margin-top: 1.25rem;
}

.timeline-card {
  flex: 1;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: 2rem;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.timeline-card:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.time-range {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--grad-start);
  display: block;
  margin-bottom: 0.5rem;
}

.timeline-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.timeline-card h4 {
  font-size: 0.95rem;
  color: var(--text-gray);
  margin-bottom: 1rem;
  font-weight: 500;
}

.timeline-card p {
  color: var(--text-gray);
  font-size: 0.95rem;
}

/* Contact */
.glass-contact-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid var(--glass-border);
  border-radius: 32px;
  padding: 4.5rem 3rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
  position: relative;
}

.glass-contact-card h2 {
  font-size: 2.75rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -1px;
}

.glass-contact-card p {
  color: var(--text-gray);
  font-size: 1.15rem;
  margin-bottom: 3rem;
}

.btn-gradient-fill {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem 2.75rem;
  border-radius: 50px;
  background: linear-gradient(135deg, var(--grad-start), var(--grad-end));
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.05rem;
  box-shadow: 0 10px 25px rgba(236, 72, 153, 0.4);
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-gradient-fill:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(236, 72, 153, 0.5);
}

.contact-social-icons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 3.5rem;
}

.contact-social-icons a {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-gray);
  text-decoration: none;
  transition: all 0.3s;
}

.contact-social-icons a:hover {
  color: #ffffff;
  border-color: #ffffff;
  transform: translateY(-2px);
}

/* Footer */
.footer {
  padding: 3rem 0;
  text-align: center;
  border-top: 1px solid var(--glass-border);
  color: var(--text-gray);
  font-size: 0.9rem;
}

/* Mobile responsive */
@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3.5rem;
  }
  
  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .hero-visual {
    order: -1;
  }
  
  .image-border-glow {
    max-width: 280px;
  }
  
  .hero-heading {
    font-size: 3rem;
  }
  
  .projects-masonry {
    grid-template-columns: 1fr;
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .nav-links {
    display: none;
  }
  
  .hero-heading {
    font-size: 2.25rem;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
  
  .glass-contact-card {
    padding: 3rem 1.5rem;
  }
  
  .glass-contact-card h2 {
    font-size: 1.8rem;
  }
  
  .timeline-block {
    flex-direction: column;
  }
  
  .timeline-dot {
    margin-left: 24px;
    margin-bottom: 1rem;
    margin-top: 0;
  }
  
  .timeline-card {
    width: 100%;
  }
}`;

  const js = `// Creative Interactive Animations
document.addEventListener('DOMContentLoaded', () => {
  // Custom Cursor Glow
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  // Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});`;

  return { html, css, js };
}

// -------------------------------------------------------------
// 3. DARK TERMINAL / DEVELOPER TEMPLATE
// -------------------------------------------------------------
function getDeveloperTemplate(data, avatarPath, projects) {
  const p = data.profile;
  const terminalColor = data.design.accentColor || '#10b981'; // Default green

  const skillsHtml = data.skills.map(s => `
    <div class="terminal-skill-row">
      <span class="term-lbl">${s.name}:</span>
      <span class="term-bar">[${'='.repeat(Math.round(s.level / 10))}${' '.repeat(10 - Math.round(s.level / 10))}]</span>
      <span class="term-val">${s.level}%</span>
    </div>
  `).join('');

  const projectsHtml = projects.map((p, idx) => `
    <div class="terminal-card reveal" data-tilt data-tilt-max="5" data-tilt-glare="true" data-tilt-max-glare="0.2">
      <div class="card-top">
        <span class="card-dot"></span>
        <span class="card-dot"></span>
        <span class="card-dot"></span>
        <span class="card-title">project_${idx}.sh</span>
      </div>
      <div class="card-body">
        <div class="card-img-wrap">
          <img src="${p.imagePath}" alt="${p.title}" class="terminal-card-img">
        </div>
        <h3 class="proj-title">> ${p.title}</h3>
        <p class="proj-desc"># ${p.description}</p>
        <div class="proj-tech">
          <span>tech_stack = [${(p.technologies || '').split(',').map(t => `"${t.trim()}"`).join(', ')}]</span>
        </div>
        <div class="proj-links">
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="term-btn">> ./run_demo</a>` : ''}
          ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="term-btn">> ./git_clone</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  const timelineHtml = data.timeline.map((t, idx) => `
    <div class="log-entry">
      <span class="log-time">[${t.startDate} - ${t.endDate || 'PRESENT'}]</span>
      <span class="log-level">[INFO]</span>
      <span class="log-msg">Role: ${t.role} @ ${t.organization} - ${t.description}</span>
    </div>
  `).join('');

  const socialHtml = `
    ${p.github ? `<li>github: <a href="${p.github}" target="_blank">"${p.github}"</a></li>` : ''}
    ${p.linkedin ? `<li>linkedin: <a href="${p.linkedin}" target="_blank">"${p.linkedin}"</a></li>` : ''}
    ${p.twitter ? `<li>twitter: <a href="${p.twitter}" target="_blank">"${p.twitter}"</a></li>` : ''}
    ${p.facebook ? `<li>facebook: <a href="${p.facebook}" target="_blank">"${p.facebook}"</a></li>` : ''}
    ${p.email ? `<li>email: <a href="mailto:${p.email}">"${p.email}"</a></li>` : ''}
  `;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name} | Developer Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="terminal-bg-grid"></div>

  <div class="terminal-container">
    <!-- WINDOW HEADER -->
    <header class="terminal-header">
      <div class="header-dots">
        <span class="dot close"></span>
        <span class="dot minimize"></span>
        <span class="dot maximize"></span>
      </div>
      <div class="header-tab">guest@${p.name.toLowerCase().replace(/\s+/g, '')}: ~</div>
    </header>

    <main class="terminal-body">
      <!-- HERO -->
      <section class="term-section reveal">
        <div class="hero-layout">
          <div class="hero-left">
            <div class="typing-container">
              <span class="prompt">guest@${p.name.toLowerCase().replace(/\s+/g, '')}:~$</span>
              <span class="typed-text">whoami</span>
            </div>
            <div class="profile-block">
              <h2>${p.name}</h2>
              <h3>// ${p.title || 'Fullstack Engineer'}</h3>
              <p class="bio-text">"${p.bio || 'Developer compiling high performance solutions.'}"</p>
            </div>
            <div class="contacts-block">
              <span class="cyan">const</span> contact_info = {
              <ul>
                ${socialHtml}
              </ul>
              };
            </div>
            ${getPersonalSpecsHtml(p, 'developer')}
          </div>
          <div class="hero-right">
            <div class="term-avatar-wrap">
              <img src="${avatarPath}" alt="${p.name}" class="term-avatar">
            </div>
          </div>
        </div>
      </section>

      <!-- SKILLS -->
      <section class="term-section reveal" id="skills">
        <div class="prompt-bar">
          <span class="prompt">guest@${p.name.toLowerCase().replace(/\s+/g, '')}:~$</span>
          <span class="typed-text">cat skills.json</span>
        </div>
        <div class="skills-term-grid">
          ${skillsHtml || '<p># No skills found.</p>'}
        </div>
      </section>

      <!-- PROJECTS -->
      <section class="term-section reveal" id="projects">
        <div class="prompt-bar">
          <span class="prompt">guest@${p.name.toLowerCase().replace(/\s+/g, '')}:~$</span>
          <span class="typed-text">ls -la ./projects/</span>
        </div>
        <div class="projects-term-grid">
          ${projectsHtml || '<p># No projects found.</p>'}
        </div>
      </section>

      <!-- EXPERIENCES -->
      <section class="term-section reveal" id="experiences">
        <div class="prompt-bar">
          <span class="prompt">guest@${p.name.toLowerCase().replace(/\s+/g, '')}:~$</span>
          <span class="typed-text">tail -n 100 system.log</span>
        </div>
        <div class="terminal-logs">
          ${timelineHtml || '<p># Log empty.</p>'}
        </div>
      </section>

      <!-- CONTACT ACTIONS -->
      <section class="term-section reveal" id="contact">
        <div class="prompt-bar">
          <span class="prompt">guest@${p.name.toLowerCase().replace(/\s+/g, '')}:~$</span>
          <span class="typed-text">ssh contact@${p.name.toLowerCase().replace(/\s+/g, '')}.io</span>
        </div>
        <div class="contact-term-box">
          <p class="term-alert">*** SECURE CONNECTION ESTABLISHED ***</p>
          <p>Ready to collaborate ? Send an email to establish connection.</p>
          ${p.email ? `<a href="mailto:${p.email}" class="term-btn blink-btn">>> CONNECT_NOW</a>` : ''}
        </div>
      </section>
    </main>

    <footer class="terminal-footer">
      <span>Exit code: 0</span>
      <span>UTF-8</span>
    </footer>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js"></script>
  <script src="script.js"></script>
</body>
</html>`;

  const css = `:root {
  --term-bg: #0f172a;
  --term-text: #e2e8f0;
  --term-accent: ${terminalColor};
  --term-cyan: #38bdf8;
  --term-yellow: #f59e0b;
  --term-darker: #020617;
  --term-border: #334155;
  --font-mono: 'Fira Code', monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--term-darker);
  color: var(--term-text);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 2rem 1rem;
  overflow-x: hidden;
  position: relative;
}

.terminal-bg-grid {
  position: fixed;
  inset: 0;
  background-image: 
    linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
  z-index: -1;
}

.terminal-container {
  max-width: 1000px;
  margin: 0 auto;
  background-color: var(--term-bg);
  border: 1px solid var(--term-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

/* Window Header */
.terminal-header {
  background-color: #1e293b;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  position: relative;
  border-bottom: 1px solid var(--term-border);
}

.header-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.close { background-color: #ef4444; }
.dot.minimize { background-color: #eab308; }
.dot.maximize { background-color: #22c55e; }

.header-tab {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Terminal Body */
.terminal-body {
  padding: 2rem;
}

.term-section {
  margin-bottom: 3.5rem;
}

/* Prompts */
.prompt-bar, .typing-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
  padding-bottom: 0.5rem;
}

.prompt {
  color: var(--term-accent);
  font-weight: bold;
}

.typed-text {
  color: var(--term-yellow);
  position: relative;
}

.typed-text::after {
  content: '';
  display: inline-block;
  width: 8px;
  height: 15px;
  background-color: var(--term-accent);
  margin-left: 4px;
  animation: blink 1s infinite;
}

/* Hero Section Info */
.hero-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2.5rem;
  align-items: center;
}

.profile-block {
  margin: 1.5rem 0;
}

.profile-block h2 {
  font-size: 2.2rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.profile-block h3 {
  font-size: 1.2rem;
  color: var(--term-accent);
  font-weight: 500;
  margin-bottom: 1rem;
}

.bio-text {
  color: #94a3b8;
  font-style: italic;
}

.contacts-block {
  background-color: var(--term-darker);
  padding: 1.5rem;
  border-radius: 6px;
  border-left: 3px solid var(--term-accent);
  margin-bottom: 1.5rem;
}

.terminal-specs-block {
  background-color: var(--term-darker);
  padding: 1.5rem;
  border-radius: 6px;
  border-left: 3px solid var(--term-cyan);
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #94a3b8;
  white-space: pre-wrap;
}

.terminal-specs-block .cyan {
  color: var(--term-cyan);
}

.contacts-block ul {
  list-style: none;
  padding-left: 1.5rem;
  margin-top: 0.5rem;
}

.contacts-block li {
  color: #94a3b8;
}

.contacts-block a {
  color: var(--term-yellow);
  text-decoration: none;
}

.contacts-block a:hover {
  text-decoration: underline;
}

.cyan { color: var(--term-cyan); }

/* Avatar */
.term-avatar-wrap {
  width: 100%;
  max-width: 250px;
  margin: 0 auto;
  border: 1px solid var(--term-accent);
  padding: 8px;
  background-color: var(--term-darker);
}

.term-avatar {
  width: 100%;
  height: auto;
  display: block;
  filter: grayscale(100%) contrast(120%);
}

/* Skills */
.skills-term-grid {
  background-color: var(--term-darker);
  padding: 2rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.terminal-skill-row {
  display: grid;
  grid-template-columns: 180px 150px 80px;
  align-items: center;
}

.term-lbl {
  color: var(--term-cyan);
}

.term-bar {
  color: var(--term-accent);
}

.term-val {
  color: var(--term-yellow);
}

/* Projects grid */
.projects-term-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.terminal-card {
  background-color: var(--term-darker);
  border: 1px solid var(--term-border);
  border-radius: 6px;
  overflow: hidden;
}

.card-top {
  background-color: #1e293b;
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  gap: 6px;
  border-bottom: 1px solid var(--term-border);
}

.card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--term-border);
}

.card-title {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-left: 8px;
}

.card-body {
  padding: 1.5rem;
}

.card-img-wrap {
  aspect-ratio: 16/9;
  overflow: hidden;
  border: 1px solid var(--term-border);
  margin-bottom: 1rem;
}

.terminal-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(80%) contrast(110%);
}

.proj-title {
  font-size: 1.15rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.proj-desc {
  color: #64748b;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  min-height: 50px;
}

.proj-tech {
  color: var(--term-cyan);
  font-size: 0.8rem;
  margin-bottom: 1.5rem;
}

.proj-links {
  display: flex;
  gap: 1rem;
}

.term-btn {
  display: inline-block;
  padding: 0.4rem 1rem;
  background-color: transparent;
  color: var(--term-accent);
  border: 1px solid var(--term-accent);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
  border-radius: 4px;
}

.term-btn:hover {
  background-color: var(--term-accent);
  color: var(--term-darker);
  transform: translateY(-2px);
}

/* Experiences / Logs */
.terminal-logs {
  background-color: var(--term-darker);
  padding: 1.5rem;
  border-radius: 6px;
  height: 250px;
  overflow-y: auto;
  border: 1px solid var(--term-border);
}

.log-entry {
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(255,255,255,0.02);
  padding-bottom: 0.5rem;
}

.log-time {
  color: var(--term-yellow);
}

.log-level {
  color: var(--term-accent);
  margin: 0 0.5rem;
}

.log-msg {
  color: #94a3b8;
}

/* Contact ssh */
.contact-term-box {
  background-color: var(--term-darker);
  border: 1px solid var(--term-accent);
  padding: 2.5rem;
  border-radius: 6px;
  text-align: center;
}

.term-alert {
  color: var(--term-yellow);
  font-weight: bold;
  margin-bottom: 1rem;
}

.contact-term-box p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.blink-btn {
  animation: border-glow 1.5s infinite alternate;
}

/* Footer styling */
.terminal-footer {
  background-color: #1e293b;
  height: 35px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  font-size: 0.75rem;
  color: #64748b;
  border-top: 1px solid var(--term-border);
}

/* Animations */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
}
.reveal.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
.cursor-glow {
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%);
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9999;
  transition: left 0.1s ease-out, top 0.1s ease-out;
}
@keyframes blink {
  50% { opacity: 0; }
}

@keyframes border-glow {
  from { box-shadow: 0 0 5px var(--term-accent); }
  to { box-shadow: 0 0 15px var(--term-accent); }
}

/* Responsive */
@media (max-width: 800px) {
  .hero-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .term-avatar-wrap {
    order: -1;
  }
  
  .projects-term-grid {
    grid-template-columns: 1fr;
  }
  
  .terminal-skill-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}`;

  const js = `// Developer Interactive Animations
document.addEventListener('DOMContentLoaded', () => {
  // Custom Neon Glow
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  // Typewriter for terminal prompt
  const types = document.querySelectorAll('.typed-text');
  types.forEach((el, index) => {
    const text = el.textContent;
    el.textContent = '';
    setTimeout(() => {
      let i = 0;
      function typeWriter() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 40);
        }
      }
      typeWriter();
    }, 500 + (index * 300));
  });

  // Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});`;

  return { html, css, js };
}

// -------------------------------------------------------------
// 4. NEO-BRUTALISM TEMPLATE
// -------------------------------------------------------------
function getBrutalistTemplate(data, avatarPath, projects) {
  const p = data.profile;
  const accent = data.design.accentColor || '#facc15';
  
  const skillsHtml = data.skills.map(s => `
    <div class="skill-tag-brutal reveal">${s.name} <span class="skill-lvl-brutal">${s.level}%</span></div>
  `).join('');

  const projectsHtml = projects.map(p => `
    <div class="project-card-brutal reveal">
      <div class="project-img-brutal">
        <img src="${p.imagePath}" alt="${p.title}">
      </div>
      <div class="project-details-brutal">
        <span class="project-tag-brutal">${p.category || 'PROJET'}</span>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="tech-box-brutal">
          ${(p.technologies || '').split(',').map(t => `<span>${t.trim()}</span>`).join('')}
        </div>
        <div class="links-box-brutal">
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="btn-brutal-small">VISITER</a>` : ''}
          ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="btn-brutal-small">CODE</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  const timelineHtml = data.timeline.map(t => `
    <div class="timeline-row-brutal reveal">
      <div class="time-meta-brutal">${t.startDate} - ${t.endDate || 'PRÉSENT'}</div>
      <div class="time-body-brutal">
        <h4>${t.role} <span>@ ${t.organization}</span></h4>
        <p>${t.description}</p>
      </div>
    </div>
  `).join('');

  const socialHtml = `
    ${p.github ? `<a href="${p.github}" target="_blank" class="btn-brutal-small"><i class="fab fa-github"></i> GitHub</a>` : ''}
    ${p.linkedin ? `<a href="${p.linkedin}" target="_blank" class="btn-brutal-small"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
    ${p.twitter ? `<a href="${p.twitter}" target="_blank" class="btn-brutal-small"><i class="fab fa-twitter"></i> Twitter</a>` : ''}
    ${p.facebook ? `<a href="${p.facebook}" target="_blank" class="btn-brutal-small"><i class="fab fa-facebook-f"></i> Facebook</a>` : ''}
    ${p.email ? `<a href="mailto:${p.email}" class="btn-brutal-small"><i class="fas fa-envelope"></i> Email</a>` : ''}
  `;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name} | Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <header class="header-brutal">
      <div class="logo-brutal">${p.name}</div>
      <div class="subtitle-brutal">// ${p.title}</div>
    </header>

    <section class="hero-brutal reveal">
      <div class="hero-grid-brutal">
        <div class="hero-text-brutal">
          <h1 class="hero-title-brutal">BONJOUR, JE CONÇOIS DES PROJETS.</h1>
          <p class="hero-bio-brutal">"${p.bio || 'Bienvenue sur mon site brutaliste.'}"</p>
          ${getPersonalSpecsHtml(p, 'brutalist')}
          <div class="hero-links-brutal">
            ${socialHtml}
          </div>
        </div>
        <div class="hero-avatar-brutal">
          <img src="${avatarPath}" alt="${p.name}">
        </div>
      </div>
    </section>

    <section class="section-brutal">
      <h2 class="title-brutal">COMPÉTENCES</h2>
      <div class="skills-wrap-brutal">
        ${skillsHtml || '<p>Aucune compétence.</p>'}
      </div>
    </section>

    <section class="section-brutal">
      <h2 class="title-brutal">PROJETS SÉLECTIONNÉS</h2>
      <div class="projects-grid-brutal">
        ${projectsHtml || '<p>Aucun projet disponible.</p>'}
      </div>
    </section>

    <section class="section-brutal">
      <h2 class="title-brutal">PARCOURS</h2>
      <div class="timeline-brutal">
        ${timelineHtml || '<p>Aucune timeline.</p>'}
      </div>
    </section>

    <footer class="footer-brutal">
      <p>&copy; ${new Date().getFullYear()} ${p.name} - Tous droits réservés.</p>
    </footer>
  </div>
  <script src="script.js"></script>
</body>
</html>`;

  const css = `:root {
  --bg-color: #fafaf9;
  --text-color: #000000;
  --accent-color: ${accent};
  --border-thick: 3px solid #000000;
  --shadow-thick: 5px 5px 0px #000000;
  --font-brutal: 'Lexend', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: var(--font-brutal);
  line-height: 1.5;
  padding: 2rem 0;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.header-brutal {
  border: var(--border-thick);
  box-shadow: var(--shadow-thick);
  background: #ffffff;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  border-radius: 4px;
}

.logo-brutal {
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
}

.subtitle-brutal {
  font-size: 1rem;
  font-weight: 500;
}

/* Hero */
.hero-brutal {
  border: var(--border-thick);
  box-shadow: var(--shadow-thick);
  background: var(--accent-color);
  padding: 3rem 2.5rem;
  margin-bottom: 2.5rem;
  border-radius: 4px;
}

.hero-grid-brutal {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2.5rem;
  align-items: center;
}

.hero-title-brutal {
  font-size: 2.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 0px #fff;
}

.hero-bio-brutal {
  font-size: 1.1rem;
  font-weight: 500;
  background: white;
  padding: 1.5rem;
  border: var(--border-thick);
  box-shadow: 4px 4px 0 #000;
  margin-bottom: 2rem;
  border-radius: 4px;
}

/* Specs Grid - Brutalist */
.specs-grid.theme-brutalist {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  background: white;
  border: var(--border-thick);
  box-shadow: 4px 4px 0 #000;
  padding: 1.5rem;
  border-radius: 4px;
}
.specs-grid.theme-brutalist .spec-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.specs-grid.theme-brutalist .spec-icon {
  width: 36px;
  height: 36px;
  border: 2px solid #000;
  background: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #000;
  box-shadow: 2px 2px 0 #000;
}
.specs-grid.theme-brutalist .spec-content {
  display: flex;
  flex-direction: column;
}
.specs-grid.theme-brutalist .spec-label {
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #4b5563;
}
.specs-grid.theme-brutalist .spec-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #000;
}
.specs-grid.theme-brutalist .spec-link {
  color: #000;
  text-decoration: underline;
  text-decoration-thickness: 2px;
}
.specs-grid.theme-brutalist .spec-link:hover {
  background: var(--accent-color);
}

.hero-links-brutal {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-avatar-brutal {
  border: var(--border-thick);
  box-shadow: 4px 4px 0 #000;
  border-radius: 4px;
  overflow: hidden;
  background: white;
}

.hero-avatar-brutal img {
  width: 100%;
  height: auto;
  display: block;
}

/* Buttons */
.btn-brutal-small {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: var(--border-thick);
  box-shadow: 2px 2px 0 #000;
  color: black;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: 4px;
}

.btn-brutal-small:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #000;
}

.btn-brutal-small:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #000;
}

/* Sections */
.section-brutal {
  margin-bottom: 2.5rem;
}

.title-brutal {
  display: inline-block;
  font-size: 1.5rem;
  font-weight: 900;
  background: #000;
  color: #fff;
  padding: 0.4rem 1.2rem;
  margin-bottom: 1.5rem;
  transform: rotate(-1.5deg);
}

/* Skills */
.skills-wrap-brutal {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  border: var(--border-thick);
  box-shadow: var(--shadow-thick);
  background: white;
  padding: 2rem;
  border-radius: 4px;
}

.skill-tag-brutal {
  border: var(--border-thick);
  background: #f3f4f6;
  padding: 0.5rem 1.25rem;
  font-weight: 700;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 2px 2px 0 #000;
}

.skill-lvl-brutal {
  background: var(--accent-color);
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
  font-size: 0.75rem;
}

/* Projects */
.projects-grid-brutal {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
}

.project-card-brutal {
  background: white;
  border: var(--border-thick);
  box-shadow: var(--shadow-thick);
  border-radius: 4px;
  overflow: hidden;
}

.project-img-brutal {
  border-bottom: var(--border-thick);
  aspect-ratio: 16/9;
  overflow: hidden;
}

.project-img-brutal img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-details-brutal {
  padding: 1.5rem;
}

.project-tag-brutal {
  display: inline-block;
  background: var(--accent-color);
  font-size: 0.75rem;
  font-weight: 900;
  padding: 0.25rem 0.5rem;
  border: 1px solid #000;
  margin-bottom: 0.75rem;
  border-radius: 2px;
}

.project-details-brutal h3 {
  font-size: 1.35rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
}

.project-details-brutal p {
  font-size: 0.9rem;
  color: #4b5563;
  margin-bottom: 1rem;
  min-height: 50px;
}

.tech-box-brutal {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.tech-box-brutal span {
  font-size: 0.75rem;
  font-weight: 700;
  background: #f3f4f6;
  border: 1px solid #000;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
}

.links-box-brutal {
  display: flex;
  gap: 1rem;
}

/* Timeline */
.timeline-brutal {
  border: var(--border-thick);
  box-shadow: var(--shadow-thick);
  background: white;
  padding: 2rem;
  border-radius: 4px;
}

.timeline-row-brutal {
  display: grid;
  grid-template-columns: 200px 1fr;
  padding: 1.5rem 0;
  border-bottom: 2px dashed #e5e7eb;
}

.timeline-row-brutal:last-child {
  border-bottom: none;
}

.time-meta-brutal {
  font-weight: 900;
  color: var(--accent-color);
  text-shadow: 1px 1px 0px #000;
  font-size: 1.1rem;
}

.time-body-brutal h4 {
  font-size: 1.15rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
}

.time-body-brutal h4 span {
  font-weight: 500;
  color: #4b5563;
}

.time-body-brutal p {
  font-size: 0.9rem;
  color: #374151;
}

/* Footer */
.footer-brutal {
  border-top: var(--border-thick);
  padding: 1.5rem 0;
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 800px) {
  .hero-grid-brutal {
    grid-template-columns: 1fr;
  }
  
  .hero-avatar-brutal {
    max-width: 250px;
    margin: 0 auto;
  }
  
  .projects-grid-brutal {
    grid-template-columns: 1fr;
  }
  
  .timeline-row-brutal {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Animations */
.reveal {
  opacity: 0;
  transform: translate(15px, 15px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}
.reveal.reveal-visible {
  opacity: 1;
  transform: translate(0, 0);
}
.reveal-visible {
  opacity: 1 !important;
  transform: translate(0, 0) !important;
}`;

  const js = `// Brutalist animations
document.addEventListener('DOMContentLoaded', () => {
  // Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});`;

  return { html, css, js };
}

// -------------------------------------------------------------
// 5. CHIC EDITORIAL TEMPLATE
// -------------------------------------------------------------
function getEditorialTemplate(data, avatarPath, projects) {
  const p = data.profile;
  const accent = data.design.accentColor || '#78350f';
  
  const skillsHtml = data.skills.map(s => `
    <div class="skill-item-edit reveal">
      <span class="skill-name-edit">${s.name}</span>
      <span class="skill-dot-separator"></span>
      <span class="skill-level-edit">${s.level}%</span>
    </div>
  `).join('');

  const projectsHtml = projects.map(p => `
    <div class="project-card-edit reveal">
      <div class="project-img-edit">
        <img src="${p.imagePath}" alt="${p.title}">
      </div>
      <div class="project-info-edit">
        <span class="project-category-edit">${p.category || 'PRODUIT'}</span>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <span class="tech-stack-edit">${p.technologies || ''}</span>
        <div class="project-links-edit">
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank">Aperçu <i class="fas fa-arrow-right"></i></a>` : ''}
          ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank">Code source</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  const timelineHtml = data.timeline.map(t => `
    <div class="timeline-row-edit reveal">
      <div class="time-period-edit">${t.startDate} — ${t.endDate || 'Aujourd\'hui'}</div>
      <div class="time-details-edit">
        <h3>${t.role}</h3>
        <h4>${t.organization}</h4>
        <p>${t.description}</p>
      </div>
    </div>
  `).join('');

  const socialHtml = `
    ${p.github ? `<a href="${p.github}" target="_blank">GitHub</a>` : ''}
    ${p.linkedin ? `<a href="${p.linkedin}" target="_blank">LinkedIn</a>` : ''}
    ${p.twitter ? `<a href="${p.twitter}" target="_blank">Twitter</a>` : ''}
    ${p.email ? `<a href="mailto:${p.email}">Email</a>` : ''}
  `;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name} | Journal de Projets</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="editorial-container">
    
    <header class="editorial-header">
      <div class="brand-log-edit">${p.name}</div>
      <nav class="nav-edit">
        <a href="#about">Journal</a>
        <a href="#projects">Réalisations</a>
        <a href="#experience">Parcours</a>
      </nav>
    </header>

    <main>
      <!-- INTRO HERO -->
      <section class="hero-edit reveal" id="about">
        <div class="hero-wrap-edit">
          <div class="hero-intro-edit">
            <span class="editorial-edition">Édition en Ligne</span>
            <h1>Index de travaux et direction technique par ${p.name}.</h1>
            <p class="editorial-bio">"${p.bio || 'Architecte de solutions en ligne et concepteur.'}"</p>
            ${getPersonalSpecsHtml(p, 'editorial')}
            <div class="editorial-socials">
              ${socialHtml}
            </div>
          </div>
          <div class="hero-portrait-edit">
            <img src="${avatarPath}" alt="${p.name}">
          </div>
        </div>
      </section>

      <!-- SKILLS / COMPETENCES -->
      <section class="section-edit" id="competences">
        <h2 class="sec-title-edit">Disciplines & Compétences</h2>
        <div class="skills-grid-edit">
          ${skillsHtml || '<p>Aucune donnée.</p>'}
        </div>
      </section>

      <!-- PROJECTS -->
      <section class="section-edit" id="projects">
        <h2 class="sec-title-edit">Projets Sélectionnés</h2>
        <div class="projects-list-edit">
          ${projectsHtml || '<p>Aucun projet référencé.</p>'}
        </div>
      </section>

      <!-- TIMELINE -->
      <section class="section-edit" id="experience">
        <h2 class="sec-title-edit">Chronologie</h2>
        <div class="timeline-list-edit">
          ${timelineHtml || '<p>Aucun événement.</p>'}
        </div>
      </section>
    </main>

    <footer class="editorial-footer">
      <p>&copy; ${new Date().getFullYear()} — ${p.name}. Document assemblé avec soin.</p>
    </footer>

  </div>
  <script src="script.js"></script>
</body>
</html>`;

  const css = `:root {
  --bg-edit: #fcfbf7;
  --text-edit: #1c1917;
  --text-muted: #57534e;
  --accent-edit: ${accent};
  --border-fine: 1px solid #d6d3d1;
  --font-serif: 'Merriweather', serif;
  --font-sans: 'Inter', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-edit);
  color: var(--text-edit);
  font-family: var(--font-sans);
  line-height: 1.7;
}

.editorial-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.editorial-header {
  padding: 3rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: var(--border-fine);
}

.brand-log-edit {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.nav-edit {
  display: flex;
  gap: 2rem;
}

.nav-edit a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-edit a:hover {
  color: var(--accent-edit);
}

/* Hero Section */
.hero-edit {
  padding: 5rem 0;
  border-bottom: var(--border-fine);
}

.hero-wrap-edit {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 4rem;
  align-items: center;
}

.editorial-edition {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--accent-edit);
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.hero-intro-edit h1 {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  line-height: 1.25;
  font-weight: 300;
  margin-bottom: 2rem;
}

.editorial-bio {
  font-size: 1.05rem;
  color: var(--text-muted);
  font-style: italic;
  margin-bottom: 2.5rem;
  font-family: var(--font-serif);
}

/* Specs Grid - Editorial */
.specs-grid.theme-editorial {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  border-top: var(--border-fine);
  border-bottom: var(--border-fine);
  padding: 1.5rem 0;
}
.specs-grid.theme-editorial .spec-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.specs-grid.theme-editorial .spec-icon {
  font-size: 1.1rem;
  color: var(--accent-edit);
}
.specs-grid.theme-editorial .spec-content {
  display: flex;
  flex-direction: column;
}
.specs-grid.theme-editorial .spec-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
}
.specs-grid.theme-editorial .spec-value {
  font-size: 0.9rem;
  font-family: var(--font-serif);
  color: var(--text-edit);
}
.specs-grid.theme-editorial .spec-link {
  color: var(--text-edit);
  text-decoration: underline;
  text-decoration-color: var(--accent-edit);
  transition: color 0.2s;
}
.specs-grid.theme-editorial .spec-link:hover {
  color: var(--accent-edit);
}

.editorial-socials {
  display: flex;
  gap: 1.5rem;
}

.editorial-socials a {
  color: var(--text-edit);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: underline;
  transition: color 0.2s;
}

.editorial-socials a:hover {
  color: var(--accent-edit);
}

.hero-portrait-edit {
  border: var(--border-fine);
  padding: 8px;
  background: white;
}

.hero-portrait-edit img {
  width: 100%;
  height: auto;
  display: block;
  filter: sepia(20%);
}

/* General Section layout */
.section-edit {
  padding: 5rem 0;
  border-bottom: var(--border-fine);
}

.sec-title-edit {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 400;
  margin-bottom: 3rem;
  position: relative;
}

/* Skills */
.skills-grid-edit {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem 3rem;
}

.skill-item-edit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px dashed #e8e6e3;
  padding-bottom: 0.5rem;
}

.skill-name-edit {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: 1.05rem;
}

.skill-dot-separator {
  flex-grow: 1;
}

.skill-level-edit {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-edit);
}

/* Projects */
.projects-list-edit {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.project-card-edit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.project-card-edit:nth-child(even) {
  direction: rtl;
}

.project-card-edit:nth-child(even) .project-info-edit {
  direction: ltr;
}

.project-img-edit {
  border: var(--border-fine);
  padding: 6px;
  background: white;
}

.project-img-edit img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.project-info-edit h3 {
  font-family: var(--font-serif);
  font-size: 1.6rem;
  margin-bottom: 0.75rem;
  font-weight: 400;
}

.project-category-edit {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--accent-edit);
  letter-spacing: 1px;
  display: block;
  margin-bottom: 0.5rem;
}

.project-info-edit p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.tech-stack-edit {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 1.5rem;
  font-family: var(--font-serif);
  font-style: italic;
}

.project-links-edit {
  display: flex;
  gap: 1.5rem;
}

.project-links-edit a {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-edit);
  text-decoration: none;
  border-bottom: 1px solid var(--text-edit);
  transition: color 0.2s, border-color 0.2s;
}

.project-links-edit a:hover {
  color: var(--accent-edit);
  border-color: var(--accent-edit);
}

/* Timeline */
.timeline-list-edit {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.timeline-row-edit {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 2rem;
}

.time-period-edit {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-style: italic;
  color: var(--accent-edit);
}

.time-details-edit h3 {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 0.25rem;
}

.time-details-edit h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-details-edit p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* Footer */
.editorial-footer {
  padding: 4rem 0;
  text-align: center;
  font-family: var(--font-serif);
  font-size: 0.85rem;
  color: var(--text-muted);
  border-top: var(--border-fine);
}

/* Responsive */
@media (max-width: 800px) {
  .hero-wrap-edit {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .hero-portrait-edit {
    max-width: 280px;
    margin: 0 auto;
    order: -1;
  }
  
  .project-card-edit {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .project-card-edit:nth-child(even) {
    direction: ltr;
  }
  
  .timeline-row-edit {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .skills-grid-edit {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Animations */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}`;

  const js = `// Editorial animations
document.addEventListener('DOMContentLoaded', () => {
  // Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
      }
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});`;

  return { html, css, js };
}

// -------------------------------------------------------------
// CV (A4 PRINT) TEMPLATE GENERATOR & ROUTER
// -------------------------------------------------------------
function generateCVTemplate(data) {
  const tpl = data.design.cvTemplate || 'modern';
  if (tpl === 'classic') return getCVClassic(data);
  if (tpl === 'minimalist') return getCVMinimalist(data);
  if (tpl === 'terminal') return getCVTerminal(data);
  if (tpl === 'split') return getCVSplit(data);
  if (tpl === 'academic') return getCVAcademic(data);
  if (tpl === 'executive') return getCVExecutive(data);
  if (tpl === 'startup') return getCVStartup(data);
  if (tpl === 'twotone') return getCVTwoTone(data);
  if (tpl === 'artistic') return getCVArtistic(data);
  return getCVModern(data);
}

function getCVModern(data) {
  const p = data.profile;
  const accentColor = data.design.cvAccent || data.design.accentColor || '#6366f1';
  
  // Format avatar
  let avatarPath = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
  if (p.avatar) {
    avatarPath = p.avatar;
  }

  const skillsHtml = data.skills.map(s => `
    <div class="cv-skill">
      <span class="cv-skill-name">${s.name}</span>
      <div class="cv-skill-bar-bg">
        <div class="cv-skill-bar" style="width: ${s.level}%"></div>
      </div>
    </div>
  `).join('');

  const timelineHtml = data.timeline.map(t => `
    <div class="cv-timeline-item">
      <div class="cv-timeline-date">${t.startDate} - ${t.endDate || 'Présent'}</div>
      <div class="cv-timeline-content">
        <h4>${t.role}</h4>
        <h5>${t.organization}</h5>
        <p>${t.description}</p>
      </div>
    </div>
  `).join('');

  const projectsHtml = data.projects.map(proj => `
    <div class="cv-project-item">
      <h4>${proj.title} <span>| ${proj.category}</span></h4>
      <p>${proj.description}</p>
      ${proj.technologies ? `<p class="cv-tech"><strong>Technologies:</strong> ${proj.technologies}</p>` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${p.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --cv-accent: ${accentColor};
      --cv-text: #333333;
      --cv-light: #666666;
      --cv-bg: #ffffff;
      --cv-sidebar: #f8f9fa;
      --cv-border: #e9ecef;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      color: var(--cv-text);
      background: #e5e7eb;
      font-size: 11pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .cv-page {
      width: 210mm;
      min-height: 297mm;
      background: var(--cv-bg);
      margin: 2rem auto;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: row;
      overflow: hidden;
      position: relative;
    }
    
    /* LEFT SIDEBAR */
    .cv-sidebar {
      width: 32%;
      background-color: var(--cv-sidebar);
      padding: 2.5rem 1.5rem;
      border-right: 1px solid var(--cv-border);
      display: flex;
      flex-direction: column;
    }
    
    .cv-avatar {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      margin: 0 auto 1.5rem auto;
      display: block;
    }
    
    .cv-contact-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      color: var(--cv-text);
      word-break: break-word;
    }
    
    .cv-contact-item i {
      color: var(--cv-accent);
      width: 16px;
      text-align: center;
    }
    
    .cv-section-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--cv-text);
      border-bottom: 2px solid var(--cv-accent);
      padding-bottom: 0.25rem;
      margin: 2rem 0 1rem 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .cv-section-title-alt {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--cv-accent);
      margin: 2rem 0 1rem 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .cv-skill {
      margin-bottom: 0.75rem;
    }
    .cv-skill-name {
      font-size: 0.85rem;
      font-weight: 600;
      display: block;
      margin-bottom: 0.25rem;
    }
    .cv-skill-bar-bg {
      height: 4px;
      background-color: #dee2e6;
      border-radius: 2px;
      overflow: hidden;
    }
    .cv-skill-bar {
      height: 100%;
      background-color: var(--cv-accent);
    }
    
    .cv-info-list {
      list-style: none;
      font-size: 0.85rem;
      color: var(--cv-text);
    }
    .cv-info-list li {
      margin-bottom: 0.5rem;
    }
    .cv-info-list strong {
      display: block;
      color: var(--cv-accent);
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    
    /* RIGHT MAIN CONTENT */
    .cv-main {
      width: 68%;
      padding: 3rem 2.5rem;
      display: flex;
      flex-direction: column;
    }
    
    .cv-header-name {
      font-size: 2.8rem;
      font-weight: 800;
      line-height: 1.1;
      color: var(--cv-text);
      margin-bottom: 0.25rem;
      letter-spacing: -1px;
    }
    
    .cv-header-title {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--cv-accent);
      margin-bottom: 1.5rem;
    }
    
    .cv-bio {
      font-size: 0.95rem;
      color: var(--cv-light);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    /* Timeline */
    .cv-timeline-item {
      display: flex;
      margin-bottom: 1.5rem;
      page-break-inside: avoid;
    }
    .cv-timeline-date {
      width: 120px;
      flex-shrink: 0;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--cv-accent);
      padding-right: 1rem;
    }
    .cv-timeline-content {
      border-left: 2px solid var(--cv-border);
      padding-left: 1rem;
      position: relative;
    }
    .cv-timeline-content::before {
      content: '';
      position: absolute;
      left: -5px;
      top: 5px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--cv-accent);
    }
    .cv-timeline-content h4 {
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 0.15rem;
    }
    .cv-timeline-content h5 {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--cv-light);
      margin-bottom: 0.5rem;
    }
    .cv-timeline-content p {
      font-size: 0.9rem;
      color: var(--cv-text);
    }
    
    /* Projects */
    .cv-project-item {
      margin-bottom: 1.25rem;
      page-break-inside: avoid;
    }
    .cv-project-item h4 {
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .cv-project-item h4 span {
      font-weight: 400;
      color: var(--cv-light);
      font-size: 0.9rem;
    }
    .cv-project-item p {
      font-size: 0.9rem;
      color: var(--cv-text);
    }
    .cv-tech {
      margin-top: 0.25rem;
      font-size: 0.8rem !important;
      color: var(--cv-light) !important;
    }
    
    @media print {
      body {
        background: transparent;
        margin: 0;
        padding: 0;
      }
      .cv-page {
        margin: 0;
        box-shadow: none;
        width: 100%;
        min-height: 100%;
      }
      @page {
        size: A4;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="cv-page">
    <aside class="cv-sidebar">
      ${avatarPath ? `<img src="${avatarPath}" alt="Avatar" class="cv-avatar">` : ''}
      
      <div style="margin-bottom: 2rem;">
        ${p.email ? `<div class="cv-contact-item"><i class="fas fa-envelope"></i> ${p.email}</div>` : ''}
        ${p.phone ? `<div class="cv-contact-item"><i class="fas fa-phone"></i> ${p.phone}</div>` : ''}
        ${p.address ? `<div class="cv-contact-item"><i class="fas fa-map-marker-alt"></i> ${p.address}</div>` : ''}
        ${p.linkedin ? `<div class="cv-contact-item"><i class="fab fa-linkedin"></i> ${p.linkedin.replace('https://','')}</div>` : ''}
        ${p.github ? `<div class="cv-contact-item"><i class="fab fa-github"></i> ${p.github.replace('https://','')}</div>` : ''}
      </div>
      
      ${data.skills.length > 0 ? `
      <h3 class="cv-section-title">Compétences</h3>
      <div>${skillsHtml}</div>
      ` : ''}
      
      <h3 class="cv-section-title">Informations</h3>
      <ul class="cv-info-list">
        ${p.languages ? `<li><strong>Langues</strong> ${p.languages}</li>` : ''}
        ${p.availability ? `<li><strong>Disponibilité</strong> ${p.availability}</li>` : ''}
        ${p.contract ? `<li><strong>Contrat recherché</strong> ${p.contract}</li>` : ''}
        ${p.hobbies ? `<li><strong>Loisirs</strong> ${p.hobbies}</li>` : ''}
      </ul>
    </aside>
    
    <main class="cv-main">
      <h1 class="cv-header-name">${p.name || 'Nom Prénom'}</h1>
      <h2 class="cv-header-title">${p.title || 'Votre Titre Professionnel'}</h2>
      
      ${p.bio ? `<p class="cv-bio">${p.bio}</p>` : ''}
      
      ${data.timeline.length > 0 ? `
      <h3 class="cv-section-title-alt">Expérience & Formation</h3>
      <div class="cv-timeline">
        ${timelineHtml}
      </div>
      ` : ''}
      
      ${data.projects.length > 0 ? `
      <h3 class="cv-section-title-alt">Projets Récents</h3>
      <div class="cv-projects">
        ${projectsHtml}
      </div>
      ` : ''}
      
    </main>
  </div>
</body>
</html>`;
}
function getCVClassic(data) {
  const p = data.profile;
  const accentColor = data.design.cvAccent || data.design.accentColor || '#333333';
  
  const skillsHtml = data.skills.map(s => s.name).join(' &bull; ');

  const timelineHtml = data.timeline.map(t => `
    <div class="cv-timeline-item">
      <div class="cv-timeline-meta">
        <span class="cv-date">${t.startDate} - ${t.endDate || 'Présent'}</span>
        <span class="cv-org">${t.organization}</span>
      </div>
      <div class="cv-timeline-content">
        <h4>${t.role}</h4>
        <p>${t.description}</p>
      </div>
    </div>
  `).join('');

  const projectsHtml = data.projects.map(proj => `
    <div class="cv-project-item">
      <h4>${proj.title} <span style="font-weight: normal; font-size: 0.9em; color: #555;">| ${proj.category}</span></h4>
      <p>${proj.description}</p>
      ${proj.technologies ? `<p class="cv-tech"><strong>Tech:</strong> ${proj.technologies}</p>` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>CV - ${p.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --cv-accent: ${accentColor};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #e5e7eb;
      font-family: 'Open Sans', sans-serif;
      color: #222;
      font-size: 10pt;
      line-height: 1.6;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .cv-page {
      width: 210mm;
      min-height: 297mm;
      background: #fff;
      margin: 2rem auto;
      padding: 20mm 20mm;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .cv-header {
      text-align: center;
      border-bottom: 2px solid var(--cv-accent);
      padding-bottom: 15mm;
      margin-bottom: 10mm;
    }
    .cv-name {
      font-family: 'Lora', serif;
      font-size: 28pt;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 5px;
      color: var(--cv-accent);
    }
    .cv-title {
      font-size: 14pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #555;
      margin-bottom: 15px;
    }
    .cv-contact {
      font-size: 9pt;
      color: #444;
    }
    .cv-section {
      margin-bottom: 10mm;
    }
    .cv-section-title {
      font-family: 'Lora', serif;
      font-size: 14pt;
      color: var(--cv-accent);
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    .cv-timeline-item {
      display: flex;
      margin-bottom: 15px;
    }
    .cv-timeline-meta {
      width: 45mm;
      flex-shrink: 0;
      padding-right: 5mm;
    }
    .cv-date {
      display: block;
      font-weight: 600;
      font-size: 9.5pt;
    }
    .cv-org {
      display: block;
      color: #666;
      font-style: italic;
      font-size: 9pt;
    }
    .cv-timeline-content h4 {
      font-size: 11pt;
      margin-bottom: 3px;
    }
    .cv-project-item {
      margin-bottom: 15px;
    }
    .cv-project-item h4 {
      font-size: 11pt;
      margin-bottom: 3px;
    }
    .cv-tech {
      font-size: 8.5pt;
      color: #666;
      margin-top: 3px;
    }
    @media print {
      body { background: transparent; margin: 0; }
      .cv-page { margin: 0; box-shadow: none; }
      @page { size: A4; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="cv-page">
    <div class="cv-header">
      <h1 class="cv-name">${p.name || 'Nom Prénom'}</h1>
      <h2 class="cv-title">${p.title || 'Profession'}</h2>
      <div class="cv-contact">
        ${[p.email, p.phone, p.location].filter(Boolean).join(' | ')}<br>
        ${[p.linkedin, p.github].filter(Boolean).map(l => l.replace('https://', '')).join(' | ')}
      </div>
    </div>
    
    ${p.bio ? `
    <div class="cv-section">
      <h3 class="cv-section-title">Profil</h3>
      <p>${p.bio}</p>
    </div>
    ` : ''}
    
    ${data.timeline.length > 0 ? `
    <div class="cv-section">
      <h3 class="cv-section-title">Expérience & Formation</h3>
      ${timelineHtml}
    </div>
    ` : ''}
    
    ${data.skills.length > 0 ? `
    <div class="cv-section">
      <h3 class="cv-section-title">Compétences</h3>
      <p style="line-height: 1.8;">${skillsHtml}</p>
    </div>
    ` : ''}
    
    ${data.projects.length > 0 ? `
    <div class="cv-section">
      <h3 class="cv-section-title">Projets Sélectionnés</h3>
      ${projectsHtml}
    </div>
    ` : ''}
  </div>
</body>
</html>`;
}

function getCVMinimalist(data) {
  const p = data.profile;
  const accentColor = data.design.cvAccent || data.design.accentColor || '#000000';
  
  const skillsHtml = data.skills.map(s => `<span class="cv-tag">${s.name}</span>`).join('');

  const timelineHtml = data.timeline.map(t => `
    <div class="cv-item">
      <div class="cv-item-header">
        <h4>${t.role}</h4>
        <span class="cv-date">${t.startDate} &mdash; ${t.endDate || 'Présent'}</span>
      </div>
      <div class="cv-org">${t.organization}</div>
      <p>${t.description}</p>
    </div>
  `).join('');

  const projectsHtml = data.projects.map(proj => `
    <div class="cv-item">
      <div class="cv-item-header">
        <h4>${proj.title}</h4>
      </div>
      <div class="cv-org">${proj.category}</div>
      <p>${proj.description}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>CV - ${p.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --cv-accent: ${accentColor};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f1f5f9;
      font-family: 'Outfit', sans-serif;
      color: #0f172a;
      font-size: 10pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .cv-page {
      width: 210mm;
      min-height: 297mm;
      background: #fff;
      margin: 2rem auto;
      padding: 25mm;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      display: grid;
      grid-template-columns: 1fr;
      gap: 15mm;
    }
    .cv-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10mm;
    }
    .cv-name {
      font-size: 36pt;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -1px;
      color: var(--cv-accent);
    }
    .cv-title {
      font-size: 16pt;
      font-weight: 300;
      color: #64748b;
      margin-top: 5px;
    }
    .cv-contact {
      text-align: right;
      font-size: 9pt;
      color: #475569;
    }
    .cv-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 15mm;
    }
    .cv-section-title {
      font-size: 12pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #94a3b8;
      margin-bottom: 10mm;
    }
    .cv-item {
      margin-bottom: 8mm;
    }
    .cv-item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .cv-item-header h4 {
      font-size: 12pt;
      font-weight: 600;
    }
    .cv-date {
      font-size: 9pt;
      color: var(--cv-accent);
      font-weight: 600;
    }
    .cv-org {
      font-size: 10pt;
      color: #64748b;
      margin-bottom: 5px;
    }
    .cv-item p {
      font-size: 9.5pt;
      color: #334155;
    }
    .cv-tag {
      display: inline-block;
      padding: 3px 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 50px;
      font-size: 9pt;
      margin: 0 5px 8px 0;
      color: #475569;
    }
    @media print {
      body { background: transparent; margin: 0; }
      .cv-page { margin: 0; box-shadow: none; }
      @page { size: A4; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="cv-page">
    <div class="cv-header">
      <div>
        <h1 class="cv-name">${p.name || 'Nom Prénom'}</h1>
        <h2 class="cv-title">${p.title || 'Profession'}</h2>
      </div>
      <div class="cv-contact">
        ${p.email}<br>
        ${p.phone}<br>
        ${p.location}
      </div>
    </div>
    
    <div class="cv-grid">
      <div class="cv-main-col">
        ${data.timeline.length > 0 ? `
        <div class="cv-section">
          <h3 class="cv-section-title">Parcours</h3>
          ${timelineHtml}
        </div>
        ` : ''}
        
        ${data.projects.length > 0 ? `
        <div class="cv-section">
          <h3 class="cv-section-title" style="margin-top: 15mm;">Projets</h3>
          ${projectsHtml}
        </div>
        ` : ''}
      </div>
      
      <div class="cv-side-col">
        ${p.bio ? `
        <div class="cv-section">
          <h3 class="cv-section-title">Bio</h3>
          <p style="font-size: 9.5pt; color: #334155;">${p.bio}</p>
        </div>
        ` : ''}
        
        ${data.skills.length > 0 ? `
        <div class="cv-section" style="margin-top: 15mm;">
          <h3 class="cv-section-title">Compétences</h3>
          <div>${skillsHtml}</div>
        </div>
        ` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function getCVTerminal(data) {
  const p = data.profile;
  const accent = data.design.cvAccent || '#22c55e';
  
  const skills = data.skills.map(s => `> ${s.name} [${s.level}%]`).join('<br>');
  const timeline = data.timeline.map(t => `<div style="margin-bottom:10px;">> [ ${t.startDate} - ${t.endDate || 'NOW'} ] ${t.role} @ ${t.organization}<br>  ${t.description}</div>`).join('');
  const projects = data.projects.map(p => `<div style="margin-bottom:10px;">> ./run ${p.title.replace(/\s+/g, '_')}<br>  [${p.category}] ${p.description}</div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CV Terminal</title>
  <style>
    :root { --accent: ${accent}; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f172a; color: #cbd5e1; font-family: 'Courier New', Courier, monospace; font-size: 10pt; line-height: 1.4; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .cv-page { width: 210mm; min-height: 297mm; background: #0f172a; margin: 0 auto; padding: 20mm; overflow: hidden; }
    .hdr { border-bottom: 1px dashed #475569; padding-bottom: 10px; margin-bottom: 15px; }
    .title { color: var(--accent); font-size: 24pt; font-weight: bold; }
    h3 { color: var(--accent); margin: 15px 0 5px 0; font-size: 12pt; border-bottom: 1px solid #334155; display: inline-block;}
    .blink { animation: blinker 1s linear infinite; }
    @keyframes blinker { 50% { opacity: 0; } }
    @media print { body { background: #0f172a; } .cv-page { margin: 0; } @page { size: A4; margin: 0; } }
  </style>
</head>
<body>
  <div class="cv-page">
    <div class="hdr">
      <div class="title">${p.name || 'USER'}@system:~#</div>
      <div style="color:#94a3b8; margin-top:5px;">ROLE: ${p.title || 'Developer'}<br>CONTACT: ${p.email} | ${p.phone} | ${p.location}</div>
    </div>
    
    <h3>> whoami</h3>
    <div style="margin-bottom:15px;">${p.bio || 'Loading bio...'}</div>
    
    <h3>> cat skills.txt</h3>
    <div style="margin-bottom:15px;">${skills}</div>
    
    <h3>> tail -f timeline.log</h3>
    <div>${timeline}</div>
    
    <h3>> ls -la projects/</h3>
    <div>${projects}</div>
    <br>
    <div style="color: var(--accent);">> <span class="blink">&#9608;</span></div>
  </div>
</body>
</html>`;
}

function getCVSplit(data) {
  const p = data.profile;
  const accent = data.design.cvAccent || '#3b82f6';
  
  const skills = data.skills.map(s => `<span style="display:inline-block; background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:12px; margin:2px 4px 2px 0; font-size:8pt;">${s.name}</span>`).join('');
  const timeline = data.timeline.map(t => `<div style="margin-bottom:15px;"><div style="font-weight:bold; color:${accent};">${t.role}</div><div style="font-size:9pt; color:#666;">${t.organization} | ${t.startDate} - ${t.endDate||'Présent'}</div><p style="font-size:9pt; margin-top:3px;">${t.description}</p></div>`).join('');
  const projects = data.projects.map(p => `<div style="margin-bottom:15px;"><div style="font-weight:bold;">${p.title}</div><p style="font-size:9pt; color:#444;">${p.description}</p></div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background: #eee; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .cv-page { width: 210mm; min-height: 297mm; background: #fff; margin: 0 auto; display: flex; }
    .left { width: 35%; background: ${accent}; color: #fff; padding: 20mm 15mm; }
    .right { width: 65%; padding: 20mm 15mm; }
    h1 { font-size: 28pt; line-height: 1; margin-bottom: 5px; }
    h2 { font-size: 12pt; font-weight: normal; opacity: 0.9; margin-bottom: 20px; }
    h3 { font-size: 14pt; border-bottom: 2px solid ${accent}; display: inline-block; margin: 20px 0 10px 0; color: #222; }
    .left h3 { color: #fff; border-bottom-color: rgba(255,255,255,0.3); }
    @media print { .cv-page { margin: 0; } @page { size: A4; margin: 0; } }
  </style>
</head>
<body>
  <div class="cv-page">
    <div class="left">
      ${p.avatar ? `<img src="${p.avatar}" style="width:100px; height:100px; border-radius:50%; margin-bottom:15px; border:3px solid rgba(255,255,255,0.5);">` : ''}
      <h1>${p.name}</h1>
      <h2>${p.title}</h2>
      <div style="font-size:9pt; line-height:1.6; margin-bottom:20px;">${p.email}<br>${p.phone}<br>${p.location}</div>
      <h3>Bio</h3>
      <p style="font-size:9pt; opacity:0.9;">${p.bio}</p>
      <h3>Compétences</h3>
      <div>${skills}</div>
    </div>
    <div class="right">
      <h3>Parcours</h3>
      ${timeline}
      <h3>Projets</h3>
      ${projects}
    </div>
  </div>
</body>
</html>`;
}

function getCVAcademic(data) {
  const p = data.profile;
  const timeline = data.timeline.map(t => `<div style="margin-bottom:10px;"><strong>${t.role}</strong>, <em>${t.organization}</em> (${t.startDate} - ${t.endDate||'Présent'})<br>${t.description}</div>`).join('');
  const skills = data.skills.map(s => s.name).join(', ');
  
  return `<html>
<head>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family: 'Times New Roman', Times, serif; }
    body { background: #fff; color: #000; font-size: 11pt; line-height: 1.3; }
    .cv-page { width: 210mm; min-height: 297mm; padding: 25mm 20mm; margin: 0 auto; }
    h1 { text-align: center; font-size: 20pt; text-transform: uppercase; margin-bottom: 5px; }
    .contact { text-align: center; font-size: 10pt; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px; }
    h2 { font-size: 12pt; text-transform: uppercase; border-bottom: 1px solid #000; margin: 15px 0 10px 0; }
    @media print { @page { size: A4; margin: 0; } }
  </style>
</head>
<body>
  <div class="cv-page">
    <h1>${p.name}</h1>
    <div class="contact">${p.address} | ${p.email} | ${p.phone}</div>
    ${p.bio ? `<h2>Résumé</h2><p>${p.bio}</p>` : ''}
    <h2>Expérience et Formation</h2>${timeline}
    <h2>Compétences</h2><p>${skills}</p>
  </div>
</body>
</html>`;
}

function getCVExecutive(data) {
  const p = data.profile;
  const accent = data.design.cvAccent || '#334155';
  const timeline = data.timeline.map(t => `
    <div style="margin-bottom:15px; display:flex;">
      <div style="width:120px; font-weight:bold; color:${accent}; font-size:10pt;">${t.startDate} - ${t.endDate||'Présent'}</div>
      <div style="flex:1;">
        <div style="font-weight:bold; font-size:12pt; margin-bottom:2px;">${t.role}</div>
        <div style="color:#555; margin-bottom:5px; font-size:10pt;">${t.organization}</div>
        <div style="font-size:10pt; line-height:1.5;">${t.description}</div>
      </div>
    </div>`).join('');
    
  return `<html>
<head>
  <style>
    * { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing:border-box; margin:0; padding:0; }
    body { background:#fff; color:#333; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;}
    .cv-page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 25px; }
    h1 { font-size: 32pt; font-weight: 300; letter-spacing: 2px; color:${accent}; }
    .title { font-size: 14pt; font-weight: bold; margin-top: 5px; text-transform: uppercase; color:#666; }
    .contact { margin-top: 10px; font-size: 10pt; color: #444; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px 0; }
    h2 { font-size: 16pt; color: ${accent}; border-bottom: 2px solid ${accent}; margin: 25px 0 15px 0; padding-bottom: 5px; }
    @media print { @page { size: A4; margin: 0; } }
  </style>
</head>
<body>
  <div class="cv-page">
    <div class="header">
      <h1>${p.name}</h1>
      <div class="title">${p.title}</div>
      <div class="contact">${[p.email, p.phone, p.location, p.linkedin].filter(Boolean).join(' &nbsp;&bull;&nbsp; ')}</div>
    </div>
    ${p.bio ? `<h2>Profil Executif</h2><p style="font-size:11pt; line-height:1.6;">${p.bio}</p>` : ''}
    <h2>Expérience Professionnelle</h2>${timeline}
  </div>
</body>
</html>`;
}

function getCVStartup(data) {
  const p = data.profile;
  const accent = data.design.cvAccent || '#10b981';
  const skills = data.skills.map(s => `<span style="background:${accent}22; color:${accent}; padding:4px 10px; border-radius:20px; font-size:9pt; font-weight:bold; margin:0 5px 5px 0; display:inline-block;">${s.name}</span>`).join('');
  const timeline = data.timeline.map(t => `
    <div style="background:#f8fafc; border-radius:10px; padding:15px; margin-bottom:15px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
        <strong style="font-size:11pt;">${t.role}</strong>
        <span style="color:#64748b; font-size:9pt; background:#e2e8f0; padding:2px 8px; border-radius:10px;">${t.startDate} - ${t.endDate||'Présent'}</span>
      </div>
      <div style="color:${accent}; font-weight:600; font-size:9.5pt; margin-bottom:8px;">${t.organization}</div>
      <p style="font-size:9.5pt; color:#475569;">${t.description}</p>
    </div>`).join('');

  return `<html>
<head>
  <style>
    * { font-family: 'Segoe UI', system-ui, sans-serif; box-sizing:border-box; margin:0; padding:0; }
    body { background:#fff; color:#1e293b; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;}
    .cv-page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; }
    .header { display:flex; align-items:center; gap:20px; margin-bottom:30px; }
    .avatar { width:100px; height:100px; border-radius:30px; object-fit:cover; box-shadow: 4px 4px 0 ${accent}; }
    h1 { font-size: 28pt; font-weight: 800; color:#0f172a; line-height:1; margin-bottom:5px;}
    .title { font-size: 14pt; color:${accent}; font-weight:600;}
    .contact { font-size: 9pt; color:#64748b; margin-top:10px; }
    h2 { font-size: 14pt; margin: 20px 0 15px 0; display:flex; align-items:center; gap:10px; }
    h2::after { content:''; flex:1; height:2px; background:#f1f5f9; border-radius:2px; }
    @media print { @page { size: A4; margin: 0; } }
  </style>
</head>
<body>
  <div class="cv-page">
    <div class="header">
      ${p.avatar ? `<img src="${p.avatar}" class="avatar">` : ''}
      <div>
        <h1>${p.name}</h1>
        <div class="title">${p.title}</div>
        <div class="contact">${[p.email, p.phone, p.location].filter(Boolean).join(' | ')}</div>
      </div>
    </div>
    <h2>À Propos</h2>
    <p style="font-size:10pt; color:#475569; line-height:1.6;">${p.bio}</p>
    <h2>Expertise</h2>
    <div>${skills}</div>
    <h2>Parcours</h2>
    ${timeline}
  </div>
</body>
</html>`;
}

function getCVTwoTone(data) {
  const p = data.profile;
  const accent = data.design.cvAccent || '#1e293b';
  const timeline = data.timeline.map(t => `
    <div style="margin-bottom:20px; border-left:2px solid ${accent}; padding-left:15px; position:relative;">
      <div style="position:absolute; left:-6px; top:0; width:10px; height:10px; border-radius:50%; background:${accent};"></div>
      <div style="font-weight:bold; font-size:12pt; color:#111;">${t.role}</div>
      <div style="font-size:10pt; color:#666; margin-bottom:5px;">${t.organization} | ${t.startDate} - ${t.endDate||'Présent'}</div>
      <p style="font-size:10pt; line-height:1.5; color:#333;">${t.description}</p>
    </div>`).join('');
  const skills = data.skills.map(s => `<div style="margin-bottom:8px;"><div style="font-size:9pt; margin-bottom:2px;">${s.name}</div><div style="height:4px; background:rgba(255,255,255,0.2);"><div style="height:100%; background:#fff; width:${s.level}%;"></div></div></div>`).join('');

  return `<html>
<head>
  <style>
    * { font-family: 'Helvetica', sans-serif; box-sizing:border-box; margin:0; padding:0; }
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;}
    .cv-page { width: 210mm; min-height: 297mm; display:flex; margin: 0 auto; background:#fff;}
    .sidebar { width: 65mm; background: ${accent}; color: #fff; padding: 20mm 10mm; min-height: 297mm; }
    .main { flex: 1; padding: 20mm 15mm; }
    h1 { font-size: 26pt; margin-bottom:5px; color:#111; }
    h2.job { font-size: 14pt; color: ${accent}; margin-bottom:20px; font-weight:normal; }
    h3.side { font-size:12pt; text-transform:uppercase; letter-spacing:1px; margin:25px 0 15px 0; border-bottom:1px solid rgba(255,255,255,0.3); padding-bottom:5px; }
    h3.main-tit { font-size:16pt; color:${accent}; text-transform:uppercase; margin:25px 0 20px 0; letter-spacing:1px; }
    @media print { @page { size: A4; margin: 0; } }
  </style>
</head>
<body>
  <div class="cv-page">
    <div class="sidebar">
      ${p.avatar ? `<img src="${p.avatar}" style="width:100%; border-radius:50%; margin-bottom:20px; border:4px solid rgba(255,255,255,0.1);">` : ''}
      <h3 class="side">Contact</h3>
      <div style="font-size:9pt; line-height:1.8;">${p.phone}<br>${p.email}<br>${p.location}</div>
      <h3 class="side">Compétences</h3>
      ${skills}
    </div>
    <div class="main">
      <h1>${p.name}</h1>
      <h2 class="job">${p.title}</h2>
      <p style="font-size:10.5pt; line-height:1.6; color:#444;">${p.bio}</p>
      <h3 class="main-tit">Expérience</h3>
      ${timeline}
    </div>
  </div>
</body>
</html>`;
}

function getCVArtistic(data) {
  const p = data.profile;
  const accent = data.design.cvAccent || '#d946ef';
  const skills = data.skills.map(s => `<span style="color:${accent}; border:1px solid ${accent}; padding:3px 8px; border-radius:4px; font-size:8pt; margin:0 5px 5px 0; display:inline-block;">${s.name}</span>`).join('');
  const timeline = data.timeline.map(t => `<div style="margin-bottom:20px;"><div style="font-size:14pt; font-weight:bold; color:#111;">${t.role}</div><div style="color:${accent}; font-weight:bold; font-size:10pt; margin-bottom:5px;">${t.organization} // ${t.startDate} - ${t.endDate||'Présent'}</div><p style="font-size:10pt; color:#555; line-height:1.6;">${t.description}</p></div>`).join('');

  return `<html>
<head>
  <style>
    * { font-family: 'Georgia', serif; box-sizing:border-box; margin:0; padding:0; }
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;}
    .cv-page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; background: linear-gradient(135deg, #fff 0%, #fdf4ff 100%); }
    .header { text-align:right; margin-bottom:30px; position:relative; }
    .header::before { content:''; position:absolute; right:0; bottom:-10px; width:50mm; height:4px; background:${accent}; }
    h1 { font-size: 40pt; font-weight:normal; letter-spacing: -2px; color:#111; line-height:1;}
    .title { font-family:sans-serif; font-size: 12pt; text-transform:uppercase; letter-spacing:3px; color:${accent}; margin-top:10px; }
    .grid { display:grid; grid-template-columns: 1fr 2fr; gap: 15mm; }
    h2 { font-size: 18pt; font-style:italic; margin-bottom:15px; color:#222; }
    @media print { @page { size: A4; margin: 0; } }
  </style>
</head>
<body>
  <div class="cv-page">
    <div class="header">
      <h1>${p.name}</h1>
      <div class="title">${p.title}</div>
    </div>
    <div class="grid">
      <div>
        <h2>Contact</h2>
        <div style="font-family:sans-serif; font-size:9pt; line-height:2; color:#444; margin-bottom:30px;">
          ${p.email}<br>${p.phone}<br>${p.location}
        </div>
        <h2>Savoir-faire</h2>
        <div style="font-family:sans-serif;">${skills}</div>
      </div>
      <div>
        <h2>Biographie</h2>
        <p style="font-family:sans-serif; font-size:10pt; color:#444; line-height:1.6; margin-bottom:30px;">${p.bio}</p>
        <h2>Parcours</h2>
        <div style="font-family:sans-serif;">${timeline}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
