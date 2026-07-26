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

// Default Demo Data
const defaultData = {
  profile: {
    name: 'Alexandre Martin',
    title: 'Développeur Web & Mobile',
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
      image: '' // default used by templates if empty
    },
    {
      title: 'Application E-Commerce',
      description: 'Application d\'achat de vêtements en ligne avec intégration de Stripe, gestion du panier et catalogue dynamique.',
      category: 'Mobile / PWA',
      technologies: 'React, Service Workers, Stripe API',
      liveUrl: 'https://example.com/shop',
      githubUrl: 'https://github.com/alexandremartin/shop',
      image: '' // default used by templates if empty
    }
  ],
  timeline: [
    {
      role: 'Développeur Fullstack Lead',
      organization: 'TechAgency Paris',
      startDate: '2024',
      endDate: 'Présent',
      description: 'Conception d\'architectures frontend modernes et encadrement d\'une équipe de développeurs.'
    },
    {
      role: 'Développeur Front-End',
      organization: 'WebStudio Lyon',
      startDate: '2022',
      endDate: '2024',
      description: 'Développement de composants UI complexes et intégration pixel-perfect de designs Figma.'
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
  initAuth();
  initTabs();
  loadDefaultData();
  setupEventListeners();
  triggerUpdate();
});

// -------------------------------------------------------------
// AUTHENTICATION MANAGEMENT
// -------------------------------------------------------------
function initAuth() {
  const isLogged = sessionStorage.getItem('studio_logged');
  const loginOverlay = document.getElementById('login-overlay');
  if (isLogged === 'true') {
    loginOverlay.classList.add('hidden');
  } else {
    loginOverlay.classList.remove('hidden');
  }
}

function handleLogin(event) {
  event.preventDefault();
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  // Simple validation for mock authentication
  if (user === 'admin' && pass === 'admin') {
    sessionStorage.setItem('studio_logged', 'true');
    document.getElementById('login-overlay').classList.add('hidden');
    showToast('Connexion réussie ! Bienvenue dans le studio.', 'success');
  } else {
    showToast('Identifiant ou mot de passe incorrect.', 'error');
  }
}

function handleLogout() {
  sessionStorage.removeItem('studio_logged');
  document.getElementById('login-overlay').classList.remove('hidden');
  showToast('Déconnecté avec succès.', 'success');
}

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
  document.getElementById('profile-bio').value = defaultData.profile.bio;
  document.getElementById('profile-email').value = defaultData.profile.email;
  document.getElementById('profile-phone').value = defaultData.profile.phone;
  document.getElementById('profile-age').value = defaultData.profile.age;
  document.getElementById('profile-experience').value = defaultData.profile.experience;
  document.getElementById('profile-location').value = defaultData.profile.location;
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
  addSoftSkillItem('Leadership');
  addSoftSkillItem('Esprit d\'équipe');
  addLanguageItem('Français', 'Langue maternelle');
  addLanguageItem('Anglais', 'Courant (C1)');
  addHobbyItem('Photographie');
  addHobbyItem('Voyages');
  addReferenceItem('', '', '');

  // Projects
  const projectsContainer = document.getElementById('projects-repeater');
  projectsContainer.innerHTML = '';
  defaultData.projects.forEach(project => addProjectItem(project));

  // Timeline
  const timelineContainer = document.getElementById('timeline-repeater');
  timelineContainer.innerHTML = '';
  defaultData.timeline.forEach(item => addTimelineItem(item));

  // Design info
  document.getElementById('design-accent').value = defaultData.design.accentColor;
  document.getElementById('accent-hex').innerText = defaultData.design.accentColor;
  document.getElementById('design-secondary').value = defaultData.design.secondaryColor;
  document.getElementById('secondary-hex').innerText = defaultData.design.secondaryColor;
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
    </div>
  `;
  container.appendChild(card);
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
// IMAGE FILE READING (BASE64)
// -------------------------------------------------------------
function previewImage(input, previewId) {
  const file = input.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast("L'image est trop volumineuse. (max 2Mo)", "error");
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById(previewId);
    preview.style.backgroundImage = `url(${e.target.result})`;
    preview.innerHTML = ''; // Clear icon placeholder
    
    // Save to global assets
    imageAssets.avatar = e.target.result;
    triggerUpdate();
  };
  reader.readAsDataURL(file);
}

function previewProjectImage(input, previewId, cardId) {
  const file = input.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast("L'image est trop volumineuse. (max 2Mo)", "error");
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById(previewId);
    preview.style.backgroundImage = `url(${e.target.result})`;
    preview.innerHTML = ''; // Clear icon
    
    // Store image
    imageAssets.projects[cardId] = e.target.result;
    triggerUpdate();
  };
  reader.readAsDataURL(file);
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
      bio: document.getElementById('profile-bio').value || '',
      email: document.getElementById('profile-email').value || '',
      phone: document.getElementById('profile-phone').value || '',
      age: document.getElementById('profile-age').value || '',
      experience: document.getElementById('profile-experience').value || '',
      location: document.getElementById('profile-location').value || '',
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
        image: imageAssets.projects[cardId] || ''
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
        description: desc.trim()
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

  return data;
}

// Throttle preview updates to avoid lag when typing fast
let updateTimeout = null;
function triggerUpdate() {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    updatePreview();
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
function openPreviewWindow() {
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
  const data = getFormData();
  const htmlStr = generateCVTemplate(data);
  
  // Parse the generated HTML to extract the styles and the main container
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlStr, 'text/html');
  const cvPage = doc.querySelector('.cv-page');
  const styleEl = doc.querySelector('style');
  
  // Create a hidden container in the body
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.appendChild(styleEl.cloneNode(true));
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

