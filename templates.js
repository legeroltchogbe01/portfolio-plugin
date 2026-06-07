/**
 * Portfolio Studio - Templates Engine
 * This file contains the template layouts, styling, and the compiler logic
 * to build the client-side portfolios.
 */

function extractImageInfo(dataUrl, defaultName) {
  if (!dataUrl) return null;
  if (dataUrl.startsWith('data:')) {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (matches) {
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      return { ext: ext, base64: matches[2], filename: `${defaultName}.${ext}`, path: `images/${defaultName}.${ext}` };
    }
  }
  return null;
}

function getCVAvatar(src, style) {
  if (src && src.trim() !== '') {
    return `<img src="${src}" style="${style}">`;
  }
  return `<div style="${style};background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#94a3b8;flex-shrink:0;"><i class="fas fa-user"></i></div>`;
}

function getCVModern(data) {
  const p = data.profile;
  const accent = data.design.cvAccent || '#6366f1';
  
  const skills = (data.skills||[]).map(s => `
    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-size:10.5pt;margin-bottom:3px;"><span>${s.name}</span><span>${s.level}%</span></div>
      <div style="height:4px;background:#e2e8f0;border-radius:2px;"><div style="height:100%;width:${s.level}%;background:${accent};border-radius:2px;"></div></div>
    </div>`).join('');
    
  const softSkills = (data.softSkills||[]).map(s => `<span style="display:inline-block;background:rgba(255,255,255,0.1);padding:4px 10px;border-radius:12px;font-size:9.5pt;margin:0 5px 5px 0;">${s.name}</span>`).join('');
  const languages = (data.languagesList||[]).map(l => `<div style="margin-bottom:6px;"><strong>${l.name}</strong><br><span style="opacity:0.8;font-size:9.5pt;">${l.level}</span></div>`).join('');
  const hobbies = (data.hobbiesList||[]).map(h => `<span style="display:inline-block;padding:2px 0; font-size:10.5pt;">• ${h.name}</span><br>`).join('');
  const references = (data.references||[]).map(r => `<div style="margin-bottom:10px;"><strong>${r.name}</strong><br><span style="font-size:10.5pt;color:#475569;">${r.role}</span><br><span style="font-size:9.5pt;opacity:.9;">${r.contact}</span></div>`).join('');

  const exp = (data.experience||[]).map(t => `<div style="position:relative; padding-left:20px; margin-bottom:20px; border-left:2px solid #e2e8f0;">
    <div style="position:absolute; width:10px; height:10px; border-radius:50%; background:${accent}; left:-6px; top:5px;"></div>
    <div style="font-size:12.5pt; font-weight:bold; color:#1e293b;">${t.role}</div>
    <div style="color:${accent}; font-weight:600; font-size:10.5pt; margin-bottom:5px;">${t.organization} | ${t.startDate} - ${t.endDate||'Pr&#233;sent'}</div>
    <p style="font-size:10.5pt; color:#475569; line-height:1.6;">${t.description}</p>
  </div>`).join('');
  
  const edu = (data.education||[]).map(e => `<div style="margin-bottom:15px;">
    <div style="font-weight:bold; color:#1e293b; font-size:11.5pt;">${e.degree}</div>
    <div style="color:${accent}; font-size:10.5pt;">${e.institution} | ${e.startDate} - ${e.endDate}</div>
  </div>`).join('');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>CV - ${p.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root { --cv-accent: ${accent}; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Inter',sans-serif; background:#f1f5f9; font-size:11.5pt; line-height:1.65; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .cv-page { width:210mm; min-height:297mm; background:#fff; margin:0 auto; display:flex; }
    .cv-sidebar { width:65mm; background:#1e293b; color:#fff; padding:20mm 10mm; flex-shrink:0; }
    .cv-main { flex:1; padding:20mm 15mm; }
    h1 { font-size:32pt; font-weight:800; line-height:1.1; color:#0f172a; }
    h2.cv-title { font-size:15pt; font-weight:400; color:var(--cv-accent); margin-bottom:15px; }
    h3.sec { font-size:12pt; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:20px 0 10px 0; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.2); color:#fff; }
    h3.sec-main { font-size:15pt; font-weight:800; color:var(--cv-accent); text-transform:uppercase; letter-spacing:1px; margin:20px 0 12px 0; }
    .contact-line { font-size:9.5pt; opacity:.9; margin-bottom:4px; display:flex; align-items:center; gap:6px; }
    @media print { body { background:transparent; } .cv-page { margin:0; } @page { size:A4; margin:0; } }
  </style></head>
  <body><div class="cv-page">
    <div class="cv-sidebar">
      ${getCVAvatar(p.avatar, 'width:110px;height:110px;border-radius:50%;object-fit:cover;border:4px solid '+accent+';display:block;margin:0 auto 15px;')}
      <h3 class="sec">Contact</h3>
      ${p.email ? `<div class="contact-line"><i class="fas fa-envelope" style="width:12px;"></i> ${p.email}</div>` : ''}
      ${p.phone ? `<div class="contact-line"><i class="fas fa-phone" style="width:12px;"></i> ${p.phone}</div>` : ''}
      ${p.location ? `<div class="contact-line"><i class="fas fa-map-marker-alt" style="width:12px;"></i> ${p.location}</div>` : ''}
      ${p.linkedin ? `<div class="contact-line"><i class="fab fa-linkedin" style="width:12px;"></i> ${p.linkedin.replace('https://','')}</div>` : ''}
      ${p.github ? `<div class="contact-line"><i class="fab fa-github" style="width:12px;"></i> ${p.github.replace('https://','')}</div>` : ''}
      
      ${skills ? `<h3 class="sec">Hard Skills</h3>${skills}` : ''}
      ${softSkills ? `<h3 class="sec">Soft Skills</h3><div style="margin-top:10px;">${softSkills}</div>` : ''}
      ${languages ? `<h3 class="sec">Langues</h3>${languages}` : ''}
      ${hobbies ? `<h3 class="sec">Loisirs</h3>${hobbies}` : ''}
    </div>
    <div class="cv-main">
      <h1>${p.name}</h1>
      <h2 class="cv-title">${p.title}</h2>
      ${p.bio ? `<p style="margin-bottom:20px; color:#334155;">${p.bio}</p>` : ''}
      
      ${exp ? `<h3 class="sec-main">Exp&#233;riences</h3>${exp}` : ''}
      ${edu ? `<h3 class="sec-main">Formation</h3>${edu}` : ''}
      ${references ? `<h3 class="sec-main">R&#233;f&#233;rences</h3>${references}` : ''}
    </div>
  </div></body></html>`;
}

function getCVClassic(data) {
  const p = data.profile;
  const accent = data.design.cvAccent || '#0f172a';
  
  const skills = (data.skills||[]).map(s => s.name).join(' • ');
  const softSkills = (data.softSkills||[]).map(s => s.name).join(' • ');
  const languages = (data.languagesList||[]).map(l => `${l.name} (${l.level})`).join(' | ');
  const references = (data.references||[]).map(r => `<div style="flex:1;"><strong>${r.name}</strong> - ${r.role} <br> ${r.contact}</div>`).join('');
  const hobbies = (data.hobbiesList||[]).map(h => h.name).join(' • ');
  
  const exp = (data.experience||[]).map(t => `<div style="margin-bottom:15px;">
    <div style="display:flex; justify-content:space-between; align-items:baseline;">
      <strong style="font-size:12.5pt; color:#111;">${t.role}</strong>
      <span style="font-weight:bold; font-size:10.5pt; color:${accent};">${t.startDate} - ${t.endDate||'Pr&#233;sent'}</span>
    </div>
    <div style="font-style:italic; font-size:11.5pt; margin-bottom:5px;">${t.organization}</div>
    <p style="font-size:10.5pt; color:#333;">${t.description}</p>
  </div>`).join('');
  
  const edu = (data.education||[]).map(e => `<div style="margin-bottom:10px;">
    <div style="display:flex; justify-content:space-between;">
      <strong style="font-size:11.5pt;">${e.degree}</strong>
      <span style="color:${accent};">${e.startDate} - ${e.endDate}</span>
    </div>
    <div style="font-style:italic;">${e.institution}</div>
  </div>`).join('');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>CV - ${p.name}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Times New Roman',Times,serif; font-size:11.5pt; line-height:1.65; color:#222; background:#e5e7eb; }
    .cv-page { width:210mm; min-height:297mm; background:#fff; margin:0 auto; padding:25mm; }
    h1 { font-size:30pt; color:${accent}; text-align:center; text-transform:uppercase; letter-spacing:2px; margin-bottom:5px; }
    .subtitle { text-align:center; font-size:15pt; font-style:italic; margin-bottom:15px; }
    .contact { text-align:center; font-size:10.5pt; border-bottom:2px solid ${accent}; padding-bottom:15px; margin-bottom:20px; }
    h3.sec { font-size:14pt; color:${accent}; text-transform:uppercase; border-bottom:1px solid #ccc; margin:20px 0 10px 0; padding-bottom:3px; }
    @media print { body { background:transparent; } .cv-page { margin:0; padding:20mm; } @page { size:A4; margin:0; } }
  </style></head>
  <body><div class="cv-page">
    <div style="display:flex; align-items:center; justify-content:center; gap:20px; margin-bottom:10px;">
      ${getCVAvatar(p.avatar, 'width:80px;height:80px;border-radius:5px;object-fit:cover;')}
      <div>
        <h1>${p.name}</h1>
        <div class="subtitle">${p.title}</div>
      </div>
    </div>
    <div class="contact">
      ${p.email} | ${p.phone} | ${p.location}
    </div>
    ${p.bio ? `<p style="text-align:justify; margin-bottom:20px;">${p.bio}</p>` : ''}
    
    ${exp ? `<h3 class="sec">Exp&#233;riences Professionnelles</h3>${exp}` : ''}
    ${edu ? `<h3 class="sec">Formation</h3>${edu}` : ''}
    ${references ? `<h3 class="sec">R&#233;f&#233;rences</h3><div style="display:flex;gap:20px;flex-wrap:wrap;">${references}</div>` : ''}
    
    ${skills ? `<h3 class="sec">Hard Skills</h3><p>${skills}</p>` : ''}
    ${softSkills ? `<h3 class="sec">Soft Skills</h3><p>${softSkills}</p>` : ''}
    ${languages ? `<h3 class="sec">Langues</h3><p>${languages}</p>` : ''}
    ${hobbies ? `<h3 class="sec">Loisirs</h3><p>${hobbies}</p>` : ''}
  </div></body></html>`;
}

function getCVMinimalist(data) {
  const p = data.profile;
  const accent = data.design.cvAccent || '#000000';
  
  const skills = (data.skills||[]).map(s => `<span style="border:1px solid #e2e8f0; padding:3px 8px; border-radius:4px; font-size:9.5pt; margin:0 5px 5px 0; display:inline-block;">${s.name}</span>`).join('');
  const softSkills = (data.softSkills||[]).map(s => `<span style="border:1px solid #e2e8f0; padding:3px 8px; border-radius:4px; font-size:9.5pt; margin:0 5px 5px 0; display:inline-block;">${s.name}</span>`).join('');
  const languages = (data.languagesList||[]).map(l => `<div>${l.name} <span style="color:#94a3b8;font-size:10pt;">(${l.level})</span></div>`).join('');
  const hobbies = (data.hobbiesList||[]).map(h => `<div style="margin-bottom:4px;">• ${h.name}</div>`).join('');
  const references = (data.references||[]).map(r => `<div style="margin-bottom:10px;"><strong>${r.name}</strong><br><span style="font-size:10.5pt;color:#64748b;">${r.role}</span><br><span style="font-size:9.5pt;">${r.contact}</span></div>`).join('');

  const exp = (data.experience||[]).map(t => `<div style="display:flex; margin-bottom:20px;">
    <div style="width:130px; flex-shrink:0; font-size:10.5pt; color:${accent}; font-weight:600;">${t.startDate} -<br>${t.endDate||'Pr&#233;sent'}</div>
    <div>
      <div style="font-weight:700; font-size:12.5pt;">${t.role}</div>
      <div style="color:#64748b; font-size:11.5pt; margin-bottom:5px;">${t.organization}</div>
      <p style="font-size:10.5pt; color:#475569;">${t.description}</p>
    </div>
  </div>`).join('');
  
  const edu = (data.education||[]).map(e => `<div style="display:flex; margin-bottom:15px;">
    <div style="width:130px; flex-shrink:0; font-size:10.5pt; color:${accent}; font-weight:600;">${e.startDate} - ${e.endDate}</div>
    <div>
      <div style="font-weight:700; font-size:11.5pt;">${e.degree}</div>
      <div style="color:#64748b;">${e.institution}</div>
    </div>
  </div>`).join('');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>CV - ${p.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Outfit',sans-serif; color:#0f172a; font-size:11.5pt; line-height:1.65; background:#f8fafc; }
    .cv-page { width:210mm; min-height:297mm; background:#fff; margin:0 auto; padding:25mm; }
    h1 { font-size:36pt; font-weight:800; letter-spacing:-1px; color:${accent}; }
    h2 { font-size:16pt; font-weight:400; color:#64748b; margin-bottom:20px; }
    h3.sec { font-size:10.5pt; text-transform:uppercase; letter-spacing:2px; color:#94a3b8; margin:30px 0 15px 0; border-bottom:1px solid #f1f5f9; padding-bottom:5px;}
    .grid { display:grid; grid-template-columns:2fr 1fr; gap:40px; }
    @media print { body { background:transparent; } .cv-page { margin:0; padding:20mm; } @page { size:A4; margin:0; } }
  </style></head>
  <body><div class="cv-page">
    <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid ${accent}; padding-bottom:20px; margin-bottom:30px;">
      <div style="display:flex; align-items:center; gap:20px;">
        ${getCVAvatar(p.avatar, 'width:80px;height:80px;border-radius:16px;object-fit:cover;')}
        <div>
          <h1>${p.name}</h1>
          <h2>${p.title}</h2>
        </div>
      </div>
      <div style="text-align:right; font-size:10pt; color:#475569;">
        ${p.email}<br>${p.phone}<br>${p.location}
      </div>
    </div>
    
    <div class="grid">
      <div>
        ${p.bio ? `<p style="font-size:11.5pt; color:#334155;">${p.bio}</p>` : ''}
        ${exp ? `<h3 class="sec">Parcours Professionnel</h3>${exp}` : ''}
        ${edu ? `<h3 class="sec">Formation</h3>${edu}` : ''}
        ${references ? `<h3 class="sec">R&#233;f&#233;rences</h3>${references}` : ''}
      </div>
      <div>
        ${skills ? `<h3 class="sec">Hard Skills</h3><div style="margin-bottom:20px;">${skills}</div>` : ''}
        ${softSkills ? `<h3 class="sec">Soft Skills</h3><div style="margin-bottom:20px;">${softSkills}</div>` : ''}
        ${languages ? `<h3 class="sec">Langues</h3><div style="margin-bottom:20px;">${languages}</div>` : ''}
        ${hobbies ? `<h3 class="sec">Loisirs</h3>${hobbies}` : ''}
      </div>
    </div>
  </div></body></html>`;
}

function getCVTerminal(data) { return getCVMinimalist(data); }
function getCVSplit(data) { return getCVModern(data); }
function getCVAcademic(data) { return getCVClassic(data); }
function getCVExecutive(data) { return getCVModern(data); }
function getCVStartup(data) { return getCVMinimalist(data); }
function getCVTwoTone(data) { return getCVModern(data); }
function getCVArtistic(data) { return getCVMinimalist(data); }

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
