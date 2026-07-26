const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load templates.js code
const code = fs.readFileSync(path.join(__dirname, '../templates.js'), 'utf8');

// Create sandbox context
const context = {
  console: console,
};
vm.createContext(context);
vm.runInContext(code, context);

// Verify functions are loaded
const { escapeHtml, deepEscape, generatePortfolio, generateCVTemplate } = context;

const mockData = {
  profile: {
    name: 'Alexandre Martin',
    title: 'Développeur <script>alert("XSS")</script>',
    tagline: 'Slogan pro <script>',
    avatarAlt: 'Portrait alt text',
    website: 'https://alexandre-martin.dev',
    relocation: 'Relocatable <script>',
    bio: 'Bio text <img src="x" onerror="alert(1)">',
    email: 'alex@example.com',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANS'
  },
  skills: [
    { name: 'JavaScript', level: 95 }
  ],
  projects: [
    { 
      title: 'Project 1 <script>', 
      description: 'Desc', 
      liveUrl: 'https://live.com', 
      githubUrl: 'https://git.com',
      image: 'data:image/png;base64,iVBORw0',
      date: '2024 (3 mois)',
      role: 'Solo (Fullstack)',
      videoUrl: 'https://youtube.com/watch?v=demo1'
    }
  ],
  timeline: [
    {
      role: 'Dev',
      organization: 'Corp',
      startDate: '2020',
      endDate: '2022',
      description: 'Done stuff',
      achievements: 'Accomplished +30% perf'
    }
  ],
  education: [],
  certificationsList: [
    { name: 'AWS Certified <script>', authority: 'AWS', date: '2024' }
  ],
  design: {
    accentColor: '#6366f1',
    secondaryColor: '#ec4899'
  }
};

try {
  // 1. Test escapeHtml
  if (typeof escapeHtml !== 'function') throw new Error('escapeHtml is not defined');
  if (escapeHtml('<script>') !== '&lt;script&gt;') throw new Error('escapeHtml failed to escape HTML tag');
  console.log('✔ escapeHtml test passed.');

  // 2. Test deepEscape
  if (typeof deepEscape !== 'function') throw new Error('deepEscape is not defined');
  const escapedData = deepEscape(mockData);
  if (escapedData.profile.title.includes('<script>')) throw new Error('deepEscape failed to escape nested string');
  if (escapedData.profile.tagline.includes('<script>')) throw new Error('deepEscape failed to escape tagline');
  if (escapedData.profile.relocation.includes('<script>')) throw new Error('deepEscape failed to escape relocation');
  if (escapedData.certificationsList[0].name.includes('<script>')) throw new Error('deepEscape failed to escape certifications');
  if (escapedData.profile.avatar !== mockData.profile.avatar) throw new Error('deepEscape broke base64 avatar prefix');
  if (escapedData.projects[0].image !== mockData.projects[0].image) throw new Error('deepEscape broke project base64 image prefix');
  console.log('✔ deepEscape test passed.');

  // 3. Test portfolio compiling & XSS safety
  const themes = ['minimalist', 'creative', 'developer', 'brutalist', 'editorial', 'corporate'];
  themes.forEach(theme => {
    const res = generatePortfolio(mockData, theme);
    if (!res.html || !res.css) throw new Error(`generatePortfolio failed for theme: ${theme}`);
    if (res.html.includes('<script>alert') || res.html.includes('onerror="alert')) {
      throw new Error(`generatePortfolio output contains unescaped HTML in theme: ${theme}`);
    }
    console.log(`✔ generatePortfolio passed for theme: ${theme}`);
  });

  // 4. Test CV template compiling & XSS safety
  const cvTemplates = ['modern', 'classic', 'minimalist', 'terminal', 'split', 'academic', 'executive', 'startup', 'twotone', 'artistic'];
  cvTemplates.forEach(tpl => {
    const mockCVData = { ...mockData, design: { ...mockData.design, cvTemplate: tpl } };
    const html = generateCVTemplate(mockCVData);
    if (!html) throw new Error(`generateCVTemplate failed for template: ${tpl}`);
    if (html.includes('<script>alert') || html.includes('onerror="alert')) {
      throw new Error(`generateCVTemplate output contains unescaped HTML in template: ${tpl}`);
    }
    console.log(`✔ generateCVTemplate passed for template: ${tpl}`);
  });

  console.log('\n★ All compiler test assertions completed successfully!');
} catch (err) {
  console.error('\n❌ Test execution failed:', err.message);
  process.exit(1);
}
