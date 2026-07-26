/**
 * Portfolio Builder Studio - Application Logic
 */

// Global state for images
const imageAssets = {
  avatar: '',
  projects: {} // idx -> base64
};

let currentTheme = 'minimalist';
let currentCVTemplate = 'modern';
let previewMode = 'portfolio';
let isRestoringDraft = false;

// Default Demo Data
const defaultData = {
  profile: {
    name: 'Alexandre Martin',
    title: 'Développeur Web & Mobile',
    tagline: 'Spécialiste React & architectures résilientes',
    avatarAlt: 'Portrait d\'Alexandre Martin',
    website: 'https://alexandre-martin.dev',
    relocation: 'Disponible pour relocalisation / Hybride',
    bio: 'Passionné par l\'architecture logicielle et les interfaces interactives. J\'aide les entreprises à transformer leurs idées en produits numériques d\'exception.',
    email: 'alexandre.martin@example.com',
    phone: '+33 6 12 34 56 78',
    age: '28',
    experience: '6',
    location: 'Paris, France',
    address: '12 Rue de la Paix, 75002 Paris',
    availability: 'Immédiate',
    contract: 'Freelance / CDI / Alternance',
    languages: 'Français (Natif), Anglais (C1, Technique)',
    hobbies: 'Voyages, Photographie, Boxe, Échecs',
    github: 'https://github.com/alexandremartin',
    linkedin: 'https://linkedin.com/in/alexandremartin',
    twitter: 'https://twitter.com/alexandre',
    facebook: 'https://facebook.com/alexandre.martin'
  },
  skills: [
    { name: 'JavaScript / TypeScript', level: 95 },
    { name: 'React / Next.js', level: 90 },
    { name: 'CSS & Animations (Vanilla)', level: 85 },
    { name: 'Node.js & API REST', level: 80 }
  ],
  projects: [
    {
      title: 'SaaS Dashboard Financier',
      description: 'Une plateforme d\'analyse financière en temps réel avec des graphiques interactifs et un mode sombre complet.',
      category: 'Développement Web',
      technologies: 'React, Chart.js, HSL CSS',
      liveUrl: 'https://example.com/demo',
      githubUrl: 'https://github.com/alexandremartin/dashboard',
      image: '',
      date: '2024 (3 mois)',
      role: 'Solo (Fullstack)',
      videoUrl: 'https://youtube.com/watch?v=demo1'
    },
    {
      title: 'Application E-Commerce',
      description: 'Application d\'achat de vêtements en ligne avec intégration de Stripe, gestion du panier et catalogue dynamique.',
      category: 'Mobile / PWA',
      technologies: 'React, Service Workers, Stripe API',
      liveUrl: 'https://example.com/shop',
      githubUrl: 'https://github.com/alexandremartin/shop',
      image: '',
      date: '2023 (6 mois)',
      role: 'Lead Frontend',
      videoUrl: ''
    }
  ],
  timeline: [
    {
      role: 'Développeur Fullstack Lead',
      organization: 'TechAgency Paris',
      startDate: '2024',
      endDate: 'Présent',
      description: 'Conception d\'architectures frontend modernes et encadrement d\'une équipe de développeurs.',
      achievements: 'Amélioration de 35% des temps de chargement LCP. Encadrement de 4 développeurs frontend.'
    },
    {
      role: 'Développeur Front-End',
      organization: 'WebStudio Lyon',
      startDate: '2022',
      endDate: '2024',
      description: 'Développement de composants UI complexes et intégration pixel-perfect de designs Figma.',
      achievements: 'Intégration de plus de 50 maquettes Figma. Développement d\'une bibliothèque de composants réutilisables.'
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      authority: 'Amazon Web Services',
      date: '2024'
    },
    {
      name: 'Professional Scrum Master I',
      authority: 'Scrum.org',
      date: '2023'
    }
  ],
  design: {
    accentColor: '#6366f1',
    secondaryColor: '#ec4899'
  }
};

// -------------------------------------------------------------
// LIFE CYCLE EVENTS
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  if (localStorage.getItem('portfolio_studio_draft')) {
    loadDraftFromLocalStorage();
  } else {
    loadDefaultData();
  }
  setupEventListeners();
  triggerUpdate();
});

// -------------------------------------------------------------
// AUTHENTICATION MANAGEMENT
// -------------------------------------------------------------


// -------------------------------------------------------------
// TAB NAVIGATION
// -------------------------------------------------------------
function initTabs() {
  // Legacy - now handled by switchTab()
  switchTab('about');
}

function switchTab(tabName) {
  // Map tab names to section IDs
  const sectionMap = {
    about: 'sec-about',
    skills: 'sec-skills',
    projects: 'sec-projects',
    timeline: 'sec-timeline',
    education: 'sec-education',
    design: 'sec-design',
    cv: 'sec-cv',
    export: 'sec-export',
    extras: 'sec-extras'
  };

  const targetId = sectionMap[tabName];
  if (!targetId) return;

  // Update all editor sections visibility
  document.querySelectorAll('.editor-section').forEach(sec => {
    if (sec.id === targetId) {
      sec.classList.add('active');
      sec.style.display = '';
    } else {
      sec.classList.remove('active');
      sec.style.display = 'none';
    }
  });

  // Update nav active states
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  const activeTab = document.getElementById('tab-' + tabName);
  if (activeTab) activeTab.classList.add('active');
}

// -------------------------------------------------------------
// LOAD INITIAL DEFAULT DATA
// -------------------------------------------------------------
function loadDefaultData() {
  // Profile info
  document.getElementById('profile-name').value = defaultData.profile.name;
  document.getElementById('profile-title').value = defaultData.profile.title;
  document.getElementById('profile-tagline').value = defaultData.profile.tagline || '';
  document.getElementById('profile-avatar-alt').value = defaultData.profile.avatarAlt || '';
  document.getElementById('profile-bio').value = defaultData.profile.bio;
  document.getElementById('profile-email').value = defaultData.profile.email;
  document.getElementById('profile-phone').value = defaultData.profile.phone;
  document.getElementById('profile-website').value = defaultData.profile.website || '';
  document.getElementById('profile-age').value = defaultData.profile.age;
  document.getElementById('profile-experience').value = defaultData.profile.experience;
  document.getElementById('profile-location').value = defaultData.profile.location;
  document.getElementById('profile-relocation').value = defaultData.profile.relocation || '';
  document.getElementById('profile-address').value = defaultData.profile.address;
  document.getElementById('profile-availability').value = defaultData.profile.availability;
  document.getElementById('profile-contract').value = defaultData.profile.contract;
  
  document.getElementById('profile-github').value = defaultData.profile.github;
  document.getElementById('profile-linkedin').value = defaultData.profile.linkedin;
  document.getElementById('profile-twitter').value = defaultData.profile.twitter;
  document.getElementById('profile-facebook').value = defaultData.profile.facebook;

  // Skills
  const skillsContainer = document.getElementById('skills-repeater');
  skillsContainer.innerHTML = '';
  defaultData.skills.forEach(skill => addSkillItem(skill.name, skill.level));
    
  // Default extra fields
  const softSkillsContainer = document.getElementById('soft-skills-repeater');
  if (softSkillsContainer) softSkillsContainer.innerHTML = '';
  addSoftSkillItem('Leadership');
  addSoftSkillItem('Esprit d\'équipe');

  const languagesContainer = document.getElementById('languages-repeater');
  if (languagesContainer) languagesContainer.innerHTML = '';
  addLanguageItem('Français', 'Langue maternelle');
  addLanguageItem('Anglais', 'Courant (C1)');

  const hobbiesContainer = document.getElementById('hobbies-repeater');
  if (hobbiesContainer) hobbiesContainer.innerHTML = '';
  addHobbyItem('Photographie');
  addHobbyItem('Voyages');

  const referencesContainer = document.getElementById('references-repeater');
  if (referencesContainer) referencesContainer.innerHTML = '';
  addReferenceItem('', '', '');

  // Projects
  const projectsContainer = document.getElementById('projects-repeater');
  projectsContainer.innerHTML = '';
  defaultData.projects.forEach(project => addProjectItem(project));

  // Timeline
  const timelineContainer = document.getElementById('timeline-repeater');
  timelineContainer.innerHTML = '';
  defaultData.timeline.forEach(item => addTimelineItem(item));

  // Certifications
  const certsContainer = document.getElementById('certs-repeater');
  if (certsContainer) certsContainer.innerHTML = '';
  (defaultData.certifications || []).forEach(cert => addCertItem(cert.name, cert.authority, cert.date));

  // Design info
  document.getElementById('design-accent').value = defaultData.design.accentColor;
  document.getElementById('accent-hex').innerText = defaultData.design.accentColor;
  document.getElementById('design-secondary').value = defaultData.design.secondaryColor;
  document.getElementById('secondary-hex').innerText = defaultData.design.secondaryColor;
}

function saveDraftToLocalStorage() {
  if (isRestoringDraft) return;
  const data = getFormData();
  data.currentTheme = currentTheme;
  data.currentCVTemplate = currentCVTemplate;
  data.previewMode = previewMode;
  
  try {
    localStorage.setItem('portfolio_studio_draft', JSON.stringify(data));
    const saveStatus = document.getElementById('save-status');
    if (saveStatus) {
      saveStatus.innerText = "Brouillon auto";
      saveStatus.style.color = "";
    }
  } catch (err) {
    console.error("Failed to save draft:", err);
  }
}

function loadDraftFromLocalStorage() {
  const jsonStr = localStorage.getItem('portfolio_studio_draft');
  if (!jsonStr) return;
  try {
    isRestoringDraft = true;
    const draft = JSON.parse(jsonStr);
    
    // Restore profile fields
    const p = draft.profile;
    document.getElementById('profile-name').value = p.name || '';
    document.getElementById('profile-title').value = p.title || '';
    document.getElementById('profile-tagline').value = p.tagline || '';
    document.getElementById('profile-avatar-alt').value = p.avatarAlt || '';
    document.getElementById('profile-bio').value = p.bio || '';
    document.getElementById('profile-email').value = p.email || '';
    document.getElementById('profile-phone').value = p.phone || '';
    document.getElementById('profile-website').value = p.website || '';
    document.getElementById('profile-age').value = p.age || '';
    document.getElementById('profile-experience').value = p.experience || '';
    document.getElementById('profile-location').value = p.location || '';
    document.getElementById('profile-relocation').value = p.relocation || '';
    document.getElementById('profile-address').value = p.address || '';
    document.getElementById('profile-availability').value = p.availability || '';
    document.getElementById('profile-contract').value = p.contract || '';
    document.getElementById('profile-github').value = p.github || '';
    document.getElementById('profile-linkedin').value = p.linkedin || '';
    document.getElementById('profile-twitter').value = p.twitter || '';
    document.getElementById('profile-facebook').value = p.facebook || '';
    
    // Restore profile image assets
    imageAssets.avatar = p.avatar || '';
    const avatarPreview = document.getElementById('avatar-preview');
    if (avatarPreview) {
      if (imageAssets.avatar) {
        avatarPreview.style.backgroundImage = `url(${imageAssets.avatar})`;
        avatarPreview.innerHTML = '';
      } else {
        avatarPreview.style.backgroundImage = '';
        avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
      }
    }
    
    // Restore repeaters
    const skillsContainer = document.getElementById('skills-repeater');
    skillsContainer.innerHTML = '';
    (draft.skills || []).forEach(skill => addSkillItem(skill.name, skill.level));
    
    const softSkillsContainer = document.getElementById('soft-skills-repeater');
    if (softSkillsContainer) softSkillsContainer.innerHTML = '';
    (draft.softSkills || []).forEach(s => addSoftSkillItem(s.name));
    
    const languagesContainer = document.getElementById('languages-repeater');
    if (languagesContainer) languagesContainer.innerHTML = '';
    (draft.languagesList || []).forEach(l => addLanguageItem(l.name, l.level));
    
    const hobbiesContainer = document.getElementById('hobbies-repeater');
    if (hobbiesContainer) hobbiesContainer.innerHTML = '';
    (draft.hobbiesList || []).forEach(h => addHobbyItem(h.name));
    
    const referencesContainer = document.getElementById('references-repeater');
    if (referencesContainer) referencesContainer.innerHTML = '';
    (draft.references || []).forEach(r => addReferenceItem(r.name, r.role, r.contact));
    
    // Restore projects
    imageAssets.projects = {};
    const projectsContainer = document.getElementById('projects-repeater');
    projectsContainer.innerHTML = '';
    (draft.projects || []).forEach(project => {
      addProjectItem(project);
    });

    // Restore timeline
    const timelineContainer = document.getElementById('timeline-repeater');
    timelineContainer.innerHTML = '';
    (draft.experience || draft.timeline || []).forEach(item => addTimelineItem(item));
    
    // Restore education
    const educationContainer = document.getElementById('education-repeater');
    educationContainer.innerHTML = '';
    (draft.education || []).forEach(item => addEducationItem(item));

    // Restore certifications
    const certsContainer = document.getElementById('certs-repeater');
    if (certsContainer) certsContainer.innerHTML = '';
    (draft.certificationsList || []).forEach(c => addCertItem(c.name, c.authority, c.date));
    
    // Restore design settings
    if (draft.design) {
      document.getElementById('design-accent').value = draft.design.accentColor || '#6366f1';
      document.getElementById('accent-hex').innerText = draft.design.accentColor || '#6366f1';
      document.getElementById('design-secondary').value = draft.design.secondaryColor || '#ec4899';
      document.getElementById('secondary-hex').innerText = draft.design.secondaryColor || '#ec4899';
      
      if (document.getElementById('cv-design-accent') && draft.design.cvAccent) {
        document.getElementById('cv-design-accent').value = draft.design.cvAccent;
        document.getElementById('cv-accent-hex').innerText = draft.design.cvAccent;
      }
    }
    
    // Theme & Mode settings
    currentTheme = draft.currentTheme || 'minimalist';
    currentCVTemplate = draft.currentCVTemplate || 'modern';
    previewMode = draft.previewMode || 'portfolio';
    
    // Highlight active cards
    document.querySelectorAll('#sec-design .theme-card').forEach(card => card.classList.remove('selected'));
    const activeThemeCard = document.getElementById(`theme-${currentTheme}`);
    if (activeThemeCard) activeThemeCard.classList.add('selected');
    
    document.querySelectorAll('#sec-cv .theme-card').forEach(card => card.classList.remove('selected'));
    const activeCVCard = document.getElementById(`cv-tpl-${currentCVTemplate}`);
    if (activeCVCard) activeCVCard.classList.add('selected');
    
    const previewSelect = document.getElementById('preview-mode-select');
    if (previewSelect) previewSelect.value = previewMode;
    
  } catch (err) {
    console.error("Failed to load draft:", err);
    showToast("Erreur lors de la récupération du brouillon.", "error");
  } finally {
    isRestoringDraft = false;
  }
}

function resetToDefaultData() {
  if (confirm("Voulez-vous réinitialiser le formulaire avec les données de démonstration ? Tout votre brouillon actuel sera écrasé.")) {
    localStorage.removeItem('portfolio_studio_draft');
    
    // Clear image assets
    imageAssets.avatar = '';
    imageAssets.projects = {};
    
    const avatarPreview = document.getElementById('avatar-preview');
    if (avatarPreview) {
      avatarPreview.style.backgroundImage = '';
      avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    loadDefaultData();
    triggerUpdate();
    showToast("Données réinitialisées avec succès.", "success");
  }
}

function setupEventListeners() {
  // Input changes triggers live-update
  const generalInputs = document.querySelectorAll('.editor-section input, .editor-section textarea');
  generalInputs.forEach(input => {
    input.addEventListener('input', triggerUpdate);
  });
}

// -------------------------------------------------------------
// REPEATER COMPONENT BUILDERS (DOM)
// -------------------------------------------------------------

// 1. Skill Repeater
function addSkillItem(name = '', level = 50) {
  const container = document.getElementById('skills-repeater');
  const cardId = 'skill-' + Date.now() + Math.random().toString(36).substr(2, 4);

  const card = document.createElement('div');
  card.className = 'repeater-card';
  card.id = cardId;
  card.innerHTML = `
    <div class="repeater-card-header">
      <span class="repeater-card-title"><i class="fas fa-cog"></i> Compétence</span>
      <button class="btn-delete-item" onclick="removeRepeaterItem('${cardId}')" title="Supprimer">
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Nom de la compétence</label>
        <input type="text" class="form-control skill-input-name" placeholder="ex: JavaScript" value="${name}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Niveau de maîtrise (${level}%)</label>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <input type="range" class="form-control skill-input-level" min="10" max="100" step="5" value="${level}" 
            oninput="this.parentElement.querySelector('.level-val').innerText = this.value + '%'; triggerUpdate()">
          <span class="level-val" style="font-weight: 600; width: 45px;">${level}%</span>
        </div>
      </div>
    </div>
  `;
  container.appendChild(card);
  triggerUpdate();
}

// 2. Project Repeater
function addProjectItem(project = {}) {
  const container = document.getElementById('projects-repeater');
  const cardId = 'project-' + Date.now() + Math.random().toString(36).substr(2, 4);
  const title = project.title || '';
  const desc = project.description || '';
  const cat = project.category || '';
  const tech = project.technologies || '';
  const live = project.liveUrl || '';
  const git = project.githubUrl || '';
  const base64Img = project.image || '';
  const date = project.date || '';
  const role = project.role || '';
  const videoUrl = project.videoUrl || '';

  const card = document.createElement('div');
  card.className = 'repeater-card';
  card.id = cardId;
  card.innerHTML = `
    <div class="repeater-card-header">
      <span class="repeater-card-title"><i class="fas fa-briefcase"></i> Fiche Projet</span>
      <button class="btn-delete-item" onclick="removeRepeaterItem('${cardId}')" title="Supprimer">
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group form-group-full">
        <label>Image de couverture du projet</label>
        <div class="upload-wrapper">
          <div id="${cardId}-preview" class="preview-thumb" style="${base64Img ? `background-image: url(${base64Img})` : ''}">
            ${base64Img ? '' : '<i class="fas fa-image"></i>'}
          </div>
          <div class="upload-actions">
            <label for="${cardId}-upload" class="upload-btn-label">Importer l'image</label>
            <input type="file" id="${cardId}-upload" class="file-input project-image-input" accept="image/*" 
              onchange="previewProjectImage(this, '${cardId}-preview', '${cardId}')">
            <span class="upload-hint">Format PNG/JPG conseillé (max 2Mo)</span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Titre du projet</label>
        <input type="text" class="form-control proj-input-title" placeholder="ex: Site E-commerce" value="${title}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Catégorie</label>
        <input type="text" class="form-control proj-input-category" placeholder="ex: Web Design / Mobile" value="${cat}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Date / Durée du projet</label>
        <input type="text" class="form-control proj-input-date" placeholder="ex: 2024 (3 mois)" value="${date}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Rôle joué dans le projet</label>
        <input type="text" class="form-control proj-input-role" placeholder="ex: Lead Developer / Solo" value="${role}" oninput="triggerUpdate()">
      </div>
      <div class="form-group form-group-full">
        <label>Description du projet</label>
        <textarea class="form-control proj-input-desc" rows="3" placeholder="Décrivez en quelques lignes ce que fait le projet et vos accomplissements..." oninput="triggerUpdate()">${desc}</textarea>
      </div>
      <div class="form-group form-group-full">
        <label>Technologies utilisées (séparées par virgules)</label>
        <input type="text" class="form-control proj-input-tech" placeholder="ex: React, Tailwind, Node.js" value="${tech}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Lien Live Demo</label>
        <input type="url" class="form-control proj-input-live" placeholder="https://..." value="${live}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Lien Source Code (GitHub)</label>
        <input type="url" class="form-control proj-input-github" placeholder="https://github.com/..." value="${git}" oninput="triggerUpdate()">
      </div>
      <div class="form-group form-group-full">
        <label>Lien Vidéo Démo (YouTube/Vimeo)</label>
        <input type="url" class="form-control proj-input-video" placeholder="https://youtube.com/watch?v=..." value="${videoUrl}" oninput="triggerUpdate()">
      </div>
    </div>
  `;
  container.appendChild(card);
  
  if (base64Img) {
    imageAssets.projects[cardId] = base64Img;
  }
  triggerUpdate();
}

function addTimelineItem(item = {}) {
  const container = document.getElementById('timeline-repeater');
  const cardId = 'timeline-' + Date.now() + Math.random().toString(36).substr(2, 4);
  const role = item.role || '';
  const org = item.organization || '';
  const start = item.startDate || '';
  const end = item.endDate || '';
  const desc = item.description || '';
  const achievements = item.achievements || '';

  const card = document.createElement('div');
  card.className = 'repeater-card';
  card.id = cardId;
  card.innerHTML = `
    <div class="repeater-card-header">
      <span class="repeater-card-title"><i class="fas fa-briefcase"></i> Expérience Professionnelle</span>
      <button class="btn-delete-item" onclick="removeRepeaterItem('${cardId}')" title="Supprimer">
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Titre / Rôle</label>
        <input type="text" class="form-control time-input-role" placeholder="ex: Développeur Web" value="${role}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Entreprise</label>
        <input type="text" class="form-control time-input-org" placeholder="ex: TechCorp" value="${org}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Date de début (MM/YYYY)</label>
        <input type="text" class="form-control time-input-start" placeholder="ex: 09/2021" value="${start}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Date de fin</label>
        <input type="text" class="form-control time-input-end" placeholder="ex: Présent" value="${end}" oninput="triggerUpdate()">
      </div>
      <div class="form-group form-group-full">
        <label>Description des réalisations</label>
        <textarea class="form-control time-input-desc" rows="3" placeholder="Qu'avez-vous réalisé ?" oninput="triggerUpdate()">${desc}</textarea>
      </div>
      <div class="form-group form-group-full">
        <label>Réalisations clés & indicateurs (ATS-friendly, ex: +30% perf)</label>
        <textarea class="form-control time-input-achievements" rows="2" placeholder="ex: Amélioration des temps de réponse de 30%..." oninput="triggerUpdate()">${achievements}</textarea>
      </div>
    </div>
  `;
  container.appendChild(card);
}

function addCertItem(name = '', authority = '', date = '') {
  const container = document.getElementById('certs-repeater');
  if (!container) return;
  const cardId = 'cert-' + Date.now() + Math.random().toString(36).substr(2, 4);

  const card = document.createElement('div');
  card.className = 'repeater-card';
  card.id = cardId;
  card.innerHTML = `
    <div class="repeater-card-header">
      <span class="repeater-card-title"><i class="fas fa-certificate"></i> Certification</span>
      <button class="btn-delete-item" onclick="removeRepeaterItem('${cardId}')" title="Supprimer">
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Nom de la certification</label>
        <input type="text" class="form-control cert-input-name" placeholder="ex: AWS Certified" value="${name}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Organisme émetteur</label>
        <input type="text" class="form-control cert-input-authority" placeholder="ex: Amazon Web Services" value="${authority}" oninput="triggerUpdate()">
      </div>
      <div class="form-group form-group-full">
        <label>Date / Année d'obtention</label>
        <input type="text" class="form-control cert-input-date" placeholder="ex: 2024" value="${date}" oninput="triggerUpdate()">
      </div>
    </div>
  `;
  container.appendChild(card);
  triggerUpdate();
}

function addEducationItem(item = {}) {
  const container = document.getElementById('education-repeater');
  const cardId = 'education-' + Date.now() + Math.random().toString(36).substr(2, 4);
  const degree = item.degree || '';
  const inst = item.institution || '';
  const start = item.startDate || '';
  const end = item.endDate || '';

  const card = document.createElement('div');
  card.className = 'repeater-card';
  card.id = cardId;
  card.innerHTML = `
    <div class="repeater-card-header">
      <span class="repeater-card-title"><i class="fas fa-graduation-cap"></i> Formation / Diplôme</span>
      <button class="btn-delete-item" onclick="removeRepeaterItem('${cardId}')" title="Supprimer">
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Diplôme / Spécialité</label>
        <input type="text" class="form-control edu-input-degree" placeholder="ex: Master Informatique" value="${degree}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Établissement</label>
        <input type="text" class="form-control edu-input-inst" placeholder="ex: Sorbonne Université" value="${inst}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Année de début</label>
        <input type="text" class="form-control edu-input-start" placeholder="ex: 2018" value="${start}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Année d'obtention</label>
        <input type="text" class="form-control edu-input-end" placeholder="ex: 2020" value="${end}" oninput="triggerUpdate()">
      </div>
    </div>
  `;
  container.appendChild(card);
}


function addSoftSkillItem(name = '') {
  const container = document.getElementById('soft-skills-repeater');
  if (!container) return;
  const cardId = 'softskill-' + Date.now() + Math.random().toString(36).substr(2, 4);
  const card = document.createElement('div');
  card.className = 'repeater-card';
  card.id = cardId;
  card.innerHTML = `
    <div class="repeater-card-header">
      <span class="repeater-card-title"><i class="fas fa-comment-dots"></i> Soft Skill</span>
      <button class="btn-delete-item" onclick="removeRepeaterItem('${cardId}')" title="Supprimer"><i class="fas fa-trash"></i></button>
    </div>
    <div class="form-grid">
      <div class="form-group form-group-full">
        <label>Compétence (Ex: Leadership)</label>
        <input type="text" class="form-control softskill-input-name" placeholder="Soft Skill" value="${name}" oninput="triggerUpdate()">
      </div>
    </div>
  `;
  container.appendChild(card);
  triggerUpdate();
}

function addLanguageItem(name = '', level = '') {
  const container = document.getElementById('languages-repeater');
  if (!container) return;
  const cardId = 'lang-' + Date.now() + Math.random().toString(36).substr(2, 4);
  const card = document.createElement('div');
  card.className = 'repeater-card';
  card.id = cardId;
  card.innerHTML = `
    <div class="repeater-card-header">
      <span class="repeater-card-title"><i class="fas fa-language"></i> Langue</span>
      <button class="btn-delete-item" onclick="removeRepeaterItem('${cardId}')" title="Supprimer"><i class="fas fa-trash"></i></button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Langue</label>
        <input type="text" class="form-control lang-input-name" placeholder="Ex: Anglais" value="${name}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Niveau</label>
        <input type="text" class="form-control lang-input-level" placeholder="Ex: Courant (C1)" value="${level}" oninput="triggerUpdate()">
      </div>
    </div>
  `;
  container.appendChild(card);
  triggerUpdate();
}

function addHobbyItem(name = '') {
  const container = document.getElementById('hobbies-repeater');
  if (!container) return;
  const cardId = 'hobby-' + Date.now() + Math.random().toString(36).substr(2, 4);
  const card = document.createElement('div');
  card.className = 'repeater-card';
  card.id = cardId;
  card.innerHTML = `
    <div class="repeater-card-header">
      <span class="repeater-card-title"><i class="fas fa-heart"></i> Centre d'intérêt</span>
      <button class="btn-delete-item" onclick="removeRepeaterItem('${cardId}')" title="Supprimer"><i class="fas fa-trash"></i></button>
    </div>
    <div class="form-grid">
      <div class="form-group form-group-full">
        <label>Loisir / Passion</label>
        <input type="text" class="form-control hobby-input-name" placeholder="Ex: Photographie" value="${name}" oninput="triggerUpdate()">
      </div>
    </div>
  `;
  container.appendChild(card);
  triggerUpdate();
}

function addReferenceItem(name = '', role = '', contact = '') {
  const container = document.getElementById('references-repeater');
  if (!container) return;
  const cardId = 'ref-' + Date.now() + Math.random().toString(36).substr(2, 4);
  const card = document.createElement('div');
  card.className = 'repeater-card';
  card.id = cardId;
  card.innerHTML = `
    <div class="repeater-card-header">
      <span class="repeater-card-title"><i class="fas fa-id-badge"></i> Référence</span>
      <button class="btn-delete-item" onclick="removeRepeaterItem('${cardId}')" title="Supprimer"><i class="fas fa-trash"></i></button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Nom</label>
        <input type="text" class="form-control ref-input-name" placeholder="Ex: Jean Dupont" value="${name}" oninput="triggerUpdate()">
      </div>
      <div class="form-group">
        <label>Poste & Entreprise</label>
        <input type="text" class="form-control ref-input-role" placeholder="Ex: CTO @ TechCorp" value="${role}" oninput="triggerUpdate()">
      </div>
      <div class="form-group form-group-full">
        <label>Contact (Email / Tel)</label>
        <input type="text" class="form-control ref-input-contact" placeholder="Ex: jean.dupont@email.com / +33..." value="${contact}" oninput="triggerUpdate()">
      </div>
    </div>
  `;
  container.appendChild(card);
  triggerUpdate();
}

function removeRepeaterItem(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.remove();
    // clean images
    if (cardId.startsWith('project-') && imageAssets.projects[cardId]) {
      delete imageAssets.projects[cardId];
    }
    triggerUpdate();
  }
}

// -------------------------------------------------------------
// DESIGN MANAGEMENT
// -------------------------------------------------------------
function selectTheme(themeId) {
  currentTheme = themeId;
  
  // Update selection UI for portfolio themes only
  const themeCards = document.querySelectorAll('#sec-design .theme-card');
  themeCards.forEach(card => card.classList.remove('selected'));
  
  document.getElementById(`theme-${themeId}`).classList.add('selected');
  const themeNames = {
    minimalist: 'Minimaliste Moderne',
    creative: 'Créatif Dégradé',
    developer: 'Terminal Développeur',
    brutalist: 'Néo-Brutaliste Pop',
    editorial: 'Chic Éditorial'
  };
  showToast(`Thème activé : ${themeNames[themeId] || themeId}.`, 'success');
  
  previewMode = 'portfolio';
  const sel = document.getElementById('preview-mode-select');
  if(sel) sel.value = 'portfolio';
  
  triggerUpdate();
}

function applyPreset(accentColor, secondaryColor, presetName) {
  document.getElementById('design-accent').value = accentColor;
  document.getElementById('design-secondary').value = secondaryColor;
  
  document.getElementById('accent-hex').innerText = accentColor;
  document.getElementById('secondary-hex').innerText = secondaryColor;
  
  showToast(`Palette appliquée : ${presetName}.`, 'success');
  triggerUpdate();
}

function selectCVTemplate(templateId) {
  currentCVTemplate = templateId;
  
  const cvCards = document.querySelectorAll('#sec-cv .theme-card');
  cvCards.forEach(card => card.classList.remove('selected'));
  
  const selectedCard = document.getElementById(`cv-tpl-${templateId}`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }
  
  previewMode = 'cv';
  const sel = document.getElementById('preview-mode-select');
  if(sel) sel.value = 'cv';
  
  triggerUpdate();
}

// -------------------------------------------------------------
// IMAGE FILE READING (BASE64) & COMPRESSION
// -------------------------------------------------------------
function resizeAndCompressImage(file, maxWidth, maxHeight, quality, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Export as data URL (JPEG format)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(compressedDataUrl);
    };
    img.onerror = function() {
      showToast("Impossible de lire l'image.", "error");
    };
    img.src = e.target.result;
  };
  reader.onerror = function() {
    showToast("Erreur lors de la lecture du fichier.", "error");
  };
  reader.readAsDataURL(file);
}

function previewImage(input, previewId) {
  const file = input.files[0];
  if (!file) return;

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    showToast("Format d'image non supporté (PNG, JPG, WEBP, GIF recommandés).", "error");
    input.value = '';
    return;
  }

  showToast("Optimisation de l'image...", "success");

  resizeAndCompressImage(file, 800, 800, 0.8, (compressedDataUrl) => {
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.style.backgroundImage = `url(${compressedDataUrl})`;
      preview.innerHTML = ''; // Clear icon placeholder
    }
    
    // Save to global assets
    imageAssets.avatar = compressedDataUrl;
    triggerUpdate();
    showToast("Image importée et optimisée !", "success");
  });
}

function previewProjectImage(input, previewId, cardId) {
  const file = input.files[0];
  if (!file) return;

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    showToast("Format d'image non supporté (PNG, JPG, WEBP, GIF recommandés).", "error");
    input.value = '';
    return;
  }

  showToast("Optimisation de l'image...", "success");

  resizeAndCompressImage(file, 800, 800, 0.8, (compressedDataUrl) => {
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.style.backgroundImage = `url(${compressedDataUrl})`;
      preview.innerHTML = ''; // Clear icon
    }
    
    // Store image
    imageAssets.projects[cardId] = compressedDataUrl;
    triggerUpdate();
    showToast("Image importée et optimisée !", "success");
  });
}

// -------------------------------------------------------------
// DATA BINDING & LIVE PREVIEW SYSTEM
// -------------------------------------------------------------
function getFormData() {
  // Color palette updates
  const accentVal = document.getElementById('design-accent').value;
  const secondaryVal = document.getElementById('design-secondary').value;
  document.getElementById('accent-hex').innerText = accentVal;
  document.getElementById('secondary-hex').innerText = secondaryVal;

  // Profile data
  const data = {
    profile: {
      name: document.getElementById('profile-name').value || 'Jean Dupont',
      title: document.getElementById('profile-title').value || 'Profession',
      tagline: document.getElementById('profile-tagline') ? document.getElementById('profile-tagline').value : '',
      avatarAlt: document.getElementById('profile-avatar-alt') ? document.getElementById('profile-avatar-alt').value : '',
      bio: document.getElementById('profile-bio').value || '',
      email: document.getElementById('profile-email').value || '',
      phone: document.getElementById('profile-phone').value || '',
      website: document.getElementById('profile-website') ? document.getElementById('profile-website').value : '',
      age: document.getElementById('profile-age').value || '',
      experience: document.getElementById('profile-experience').value || '',
      location: document.getElementById('profile-location').value || '',
      relocation: document.getElementById('profile-relocation') ? document.getElementById('profile-relocation').value : '',
      address: document.getElementById('profile-address').value || '',
      availability: document.getElementById('profile-availability').value || '',
      contract: document.getElementById('profile-contract').value || '',
      github: document.getElementById('profile-github').value || '',
      linkedin: document.getElementById('profile-linkedin').value || '',
      twitter: document.getElementById('profile-twitter').value || '',
      facebook: document.getElementById('profile-facebook').value || '',
      avatar: imageAssets.avatar || ''
    },
    skills: [],
    projects: [],
    timeline: [],
    experience: [],
    education: [],
    certificationsList: [],
    softSkills: [],
    languagesList: [],
    hobbiesList: [],
    references: [],
    design: {
      accentColor: accentVal,
      secondaryColor: secondaryVal,
      cvAccent: document.getElementById('cv-design-accent') ? document.getElementById('cv-design-accent').value : '#3b82f6',
      cvTemplate: currentCVTemplate
    }
  };

  // Compile Skills
  const skillCards = document.querySelectorAll('#skills-repeater .repeater-card');
  skillCards.forEach(card => {
    const name = card.querySelector('.skill-input-name').value;
    const level = card.querySelector('.skill-input-level').value;
    if (name.trim()) {
      data.skills.push({ name: name.trim(), level: parseInt(level, 10) });
    }
  });

  // Compile Projects
  const projectCards = document.querySelectorAll('#projects-repeater .repeater-card');
  projectCards.forEach(card => {
    const title = card.querySelector('.proj-input-title').value;
    const cat = card.querySelector('.proj-input-category').value;
    const desc = card.querySelector('.proj-input-desc').value;
    const tech = card.querySelector('.proj-input-tech').value;
    const live = card.querySelector('.proj-input-live').value;
    const git = card.querySelector('.proj-input-github').value;
    const cardId = card.id;

    if (title.trim()) {
      data.projects.push({
        title: title.trim(),
        category: cat.trim(),
        description: desc.trim(),
        technologies: tech.trim(),
        liveUrl: live.trim(),
        githubUrl: git.trim(),
        image: imageAssets.projects[cardId] || '',
        date: card.querySelector('.proj-input-date') ? card.querySelector('.proj-input-date').value.trim() : '',
        role: card.querySelector('.proj-input-role') ? card.querySelector('.proj-input-role').value.trim() : '',
        videoUrl: card.querySelector('.proj-input-video') ? card.querySelector('.proj-input-video').value.trim() : ''
      });
    }
  });

  // Compile Experience (ATS)
  const timelineCards = document.querySelectorAll('#timeline-repeater .repeater-card');
  timelineCards.forEach(card => {
    const role = card.querySelector('.time-input-role').value;
    const org = card.querySelector('.time-input-org').value;
    const start = card.querySelector('.time-input-start').value;
    const end = card.querySelector('.time-input-end').value;
    const desc = card.querySelector('.time-input-desc') ? card.querySelector('.time-input-desc').value : '';

    if (role.trim()) {
      const entry = {
        role: role.trim(),
        organization: org.trim(),
        startDate: start.trim(),
        endDate: end.trim(),
        description: desc.trim(),
        achievements: card.querySelector('.time-input-achievements') ? card.querySelector('.time-input-achievements').value.trim() : ''
      };
      data.experience.push(entry);
      data.timeline.push(entry); // backward compat
    }
  });

  // Compile Education (ATS)
  const eduCards = document.querySelectorAll('#education-repeater .repeater-card');
  eduCards.forEach(card => {
    const degree = card.querySelector('.edu-input-degree').value;
    const inst = card.querySelector('.edu-input-inst').value;
    const start = card.querySelector('.edu-input-start').value;
    const end = card.querySelector('.edu-input-end').value;
    if (degree.trim()) {
      data.education.push({
        degree: degree.trim(),
        institution: inst.trim(),
        startDate: start.trim(),
        endDate: end.trim()
      });
    }
  });

  // Compile Certifications
  const certCards = document.querySelectorAll('#certs-repeater .repeater-card');
  certCards.forEach(card => {
    const name = card.querySelector('.cert-input-name').value;
    const auth = card.querySelector('.cert-input-authority').value;
    const date = card.querySelector('.cert-input-date').value;
    if (name.trim()) {
      data.certificationsList.push({
        name: name.trim(),
        authority: auth.trim(),
        date: date.trim()
      });
    }
  });

  // Compile Soft Skills
  const softSkillCards = document.querySelectorAll('#soft-skills-repeater .repeater-card');
  softSkillCards.forEach(card => {
    const name = card.querySelector('.softskill-input-name').value;
    if (name.trim()) {
      data.softSkills.push({ name: name.trim() });
    }
  });

  // Compile Languages
  const langCards = document.querySelectorAll('#languages-repeater .repeater-card');
  langCards.forEach(card => {
    const name = card.querySelector('.lang-input-name').value;
    const level = card.querySelector('.lang-input-level').value;
    if (name.trim()) {
      data.languagesList.push({ name: name.trim(), level: level.trim() });
    }
  });

  // Compile Hobbies
  const hobbyCards = document.querySelectorAll('#hobbies-repeater .repeater-card');
  hobbyCards.forEach(card => {
    const name = card.querySelector('.hobby-input-name').value;
    if (name.trim()) {
      data.hobbiesList.push({ name: name.trim() });
    }
  });

  // Compile References
  const refCards = document.querySelectorAll('#references-repeater .repeater-card');
  refCards.forEach(card => {
    const name = card.querySelector('.ref-input-name').value;
    const role = card.querySelector('.ref-input-role').value;
    const contact = card.querySelector('.ref-input-contact').value;
    if (name.trim()) {
      data.references.push({ name: name.trim(), role: role.trim(), contact: contact.trim() });
    }
  });

  return data;
}

// Throttle preview updates to avoid lag when typing fast
let updateTimeout = null;
function triggerUpdate() {
  if (isRestoringDraft) return;
  
  const saveStatus = document.getElementById('save-status');
  if (saveStatus) {
    saveStatus.innerText = "Enregistrement...";
    saveStatus.style.color = "#fbbf24";
  }
  
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    updatePreview();
    saveDraftToLocalStorage();
  }, 350);
}

function updatePreview() {
  const data = getFormData();
  let htmlContent = '';
  
  if (previewMode === 'portfolio') {
    const compiled = generatePortfolio(data, currentTheme);
    htmlContent = compiled.html;
    htmlContent = htmlContent.replace('<link rel="stylesheet" href="styles.css">', `<style>${compiled.css}</style>`);
    htmlContent = htmlContent.replace('<script src="script.js"></script>', `<script>${compiled.js}</script>`);
  } else {
    htmlContent = generateCVTemplate(data);
  }

  const iframe = document.getElementById('preview-frame');
  if (iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();
    } catch (e) {
      console.error("Iframe write failed, falling back to srcdoc:", e);
      iframe.srcdoc = htmlContent;
    }
  }
}

// Fullscreen opening of compiled content
function isValidUrl(string) {
  if (!string) return true;
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;  
  }
}

function validateForm() {
  // 1. Required Name Check
  const nameVal = document.getElementById('profile-name').value.trim();
  if (!nameVal) {
    showToast("Le nom complet est requis.", "error");
    switchTab('about');
    document.getElementById('profile-name').focus();
    return false;
  }

  // 2. Email Validation
  const emailVal = document.getElementById('profile-email').value.trim();
  if (emailVal) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      showToast("Veuillez saisir une adresse email valide.", "error");
      switchTab('about');
      document.getElementById('profile-email').focus();
      return false;
    }
  }
  
  // 3. Profile Social URLs Validation
  const urlInputs = [
    { id: 'profile-github', label: 'GitHub du profil' },
    { id: 'profile-linkedin', label: 'LinkedIn du profil' },
    { id: 'profile-twitter', label: 'Twitter du profil' },
    { id: 'profile-facebook', label: 'Facebook du profil' },
    { id: 'profile-website', label: 'Site Web du profil' }
  ];
  
  for (const input of urlInputs) {
    const element = document.getElementById(input.id);
    if (element) {
      const val = element.value.trim();
      if (val && !isValidUrl(val)) {
        showToast(`Le lien ${input.label} doit être une URL valide (ex: https://...).`, "error");
        switchTab('about');
        element.focus();
        return false;
      }
    }
  }

  // 4. Projects URLs Validation
  const projectCards = document.querySelectorAll('#projects-repeater .repeater-card');
  for (let i = 0; i < projectCards.length; i++) {
    const card = projectCards[i];
    const title = card.querySelector('.proj-input-title').value.trim();
    const live = card.querySelector('.proj-input-live').value.trim();
    const git = card.querySelector('.proj-input-github').value.trim();
    const video = card.querySelector('.proj-input-video') ? card.querySelector('.proj-input-video').value.trim() : '';

    if (live && !isValidUrl(live)) {
      showToast(`Le lien de démonstration pour le projet "${title || (i + 1)}" n'est pas valide.`, "error");
      switchTab('projects');
      card.querySelector('.proj-input-live').focus();
      return false;
    }
    if (git && !isValidUrl(git)) {
      showToast(`Le lien GitHub pour le projet "${title || (i + 1)}" n'est pas valide.`, "error");
      switchTab('projects');
      card.querySelector('.proj-input-github').focus();
      return false;
    }
    if (video && !isValidUrl(video)) {
      showToast(`Le lien vidéo pour le projet "${title || (i + 1)}" n'est pas valide.`, "error");
      switchTab('projects');
      card.querySelector('.proj-input-video').focus();
      return false;
    }
  }

  return true;
}

function openPreviewWindow() {
  if (!validateForm()) return;
  const data = getFormData();
  const compiled = generatePortfolio(data, currentTheme);
  
  let htmlContent = compiled.html;
  htmlContent = htmlContent.replace('<link rel="stylesheet" href="styles.css">', `<style>${compiled.css}</style>`);
  htmlContent = htmlContent.replace('<script src="script.js"></script>', `<script>${compiled.js}</script>`);

  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  } else {
    showToast("Impossible d'ouvrir l'aperçu. Veuillez autoriser les popups pour ce site.", "error");
  }
}

// -------------------------------------------------------------
// CV GENERATION SYSTEM
// -------------------------------------------------------------
function getCVHtml() {
  const data = getFormData();
  // Call the template generator from templates.js
  return generateCVTemplate(data);
}

function previewCV() {
  if (!validateForm()) return;
  const html = getCVHtml();
  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
  } else {
    showToast("Impossible d'ouvrir l'aperçu. Veuillez autoriser les popups pour ce site.", "error");
  }
}

function downloadCV() {
  if (!validateForm()) return;
  const data = getFormData();
  const htmlStr = generateCVTemplate(data);
  
  // Parse the generated HTML to extract the styles and the main container
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlStr, 'text/html');
  const cvPage = doc.querySelector('.cv-page');
  const styleElements = doc.querySelectorAll('style');
  
  // Create a hidden container in the body
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  styleElements.forEach(s => container.appendChild(s.cloneNode(true)));
  container.appendChild(cvPage);
  document.body.appendChild(container);
  
  showToast("Génération du PDF en cours...", "success");
  
  // Give it a moment to load any images or fonts
  setTimeout(() => {
    const opt = {
      margin:       0,
      filename:     `CV_${data.profile.name.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Check if html2pdf is available
    if (typeof html2pdf !== 'undefined') {
      html2pdf().set(opt).from(cvPage).save().then(() => {
        document.body.removeChild(container);
        showToast("CV téléchargé avec succès !", "success");
      }).catch(err => {
        console.error(err);
        document.body.removeChild(container);
        showToast("Erreur lors de la génération.", "error");
      });
    } else {
      document.body.removeChild(container);
      showToast("La librairie PDF n'est pas chargée.", "error");
    }
  }, 500);
}

// -------------------------------------------------------------
// ZIP EXPORT COMPILER (CLIENT-SIDE)
// -------------------------------------------------------------
function exportZip() {
  if (!validateForm()) return;
  const data = getFormData();
  const compiled = generatePortfolio(data, currentTheme, true);
  
  const zip = new JSZip();
  
  // Write basic bundle files
  zip.file("index.html", compiled.html);
  zip.file("styles.css", compiled.css);
  zip.file("script.js", compiled.js);
  
  // Create images folder
  const imgFolder = zip.folder("images");
  
  // Bundle files and uploader assets
  compiled.images.forEach(img => {
    // img.base64 is the pure base64 data string
    imgFolder.file(img.filename, img.base64, { base64: true });
  });
  
  showToast("Génération du package ZIP en cours...", "success");
  
  zip.generateAsync({ type: "blob" })
    .then((content) => {
      // Create download trigger
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `portfolio_${data.profile.name.toLowerCase().replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast("Fichier ZIP téléchargé avec succès ! Prêt à être déployé.", "success");
    })
    .catch((err) => {
      console.error(err);
      showToast("Erreur lors de la création du fichier ZIP.", "error");
    });
}

// -------------------------------------------------------------
// NOTIFICATION TOAST
// -------------------------------------------------------------
function showToast(message, type = 'success') {
  const toast = document.getElementById('studio-toast');
  const toastMsg = document.getElementById('toast-message');
  
  // Configure icon
  const icon = toast.querySelector('i');
  if (type === 'success') {
    toast.className = 'toast success show';
    icon.className = 'fas fa-check-circle';
    icon.style.color = '#10b981';
  } else {
    toast.className = 'toast error show';
    icon.className = 'fas fa-exclamation-circle';
    icon.style.color = '#ef4444';
  }

  toastMsg.innerText = message;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

