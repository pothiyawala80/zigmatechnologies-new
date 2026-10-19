/* ============================================================
   ZIGMA UI — shared interactive layer used by every design.
   Needs: assets/site-config.js and assets/projects.js loaded first.

   Hooks you can put in the HTML:
     data-planner="Cloud"     → opens the project planner (optionally pre-selects a service)
     data-industry="Retail"   → opens the planner with that industry pre-selected
     data-pi="0"              → opens project #0 in the detail pop-up
     <div id="zu-contact">    → contact cards + smart form are rendered here
     <div id="zu-faq">        → FAQ accordion is rendered here
   ============================================================ */
(function(){
'use strict';
const C = window.ZIGMA_CONFIG || {};
const EMAIL = C.email || 'contact@zigmatechnologiessolutions.com';
const PHONE = C.phone || '';
const WA = (C.whatsapp || '').replace(/\D/g,'');
const PROJECTS = window.ZIGMA_PROJECTS || [];
const reduced = !!window.ZIGMA_REDUCED;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const store = {
  get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } },
  set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
  del(k){ try { localStorage.removeItem(k); } catch(e){} }
};
const waLink = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
const mailLink = (subject, body) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const ICON = {
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z"/></svg>',
  motion:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M3 12h3M18 12h3M12 3v3M12 18v3"/></svg>',
  still:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
};

/* ---------------- toast ---------------- */
const toastEl = document.createElement('div'); toastEl.className = 'zu-toast'; toastEl.setAttribute('role','status'); toastEl.setAttribute('aria-live','polite');
document.body.appendChild(toastEl);
let toastT;
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(()=>toastEl.classList.remove('on'), 2400); }
async function copy(text, msg){
  try { await navigator.clipboard.writeText(text); toast(msg || 'Copied!'); }
  catch(e){ const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); toast(msg || 'Copied!'); }catch(_){ toast(text); } t.remove(); }
}

/* ---------------- skip link + progress ---------------- */
const main = $('main');
if (main){ if (!main.id) main.id = 'main'; const sk = document.createElement('a'); sk.className='zu-skip'; sk.href='#'+main.id; sk.textContent='Skip to content'; document.body.prepend(sk); }
const prog = document.createElement('div'); prog.className = 'zu-progress'; document.body.appendChild(prog);

/* ---------------- dock ---------------- */
const dock = document.createElement('div'); dock.className = 'zu-dock';
dock.innerHTML = `
  ${C.greeting !== false && WA ? `<div class="zu-bubble" id="zuBubble" role="dialog" aria-label="Chat"><button aria-label="Dismiss">×</button>${esc(C.greetingText||'Hi 👋 Planning a project?')}<br><a href="${waLink('Hi Zigma! I would like to discuss a project.')}" target="_blank" rel="noopener">Chat now →</a></div>` : ''}
  <button class="zu-fab zu-mini zu-top" id="zuTop" aria-label="Back to top"><svg class="ring" viewBox="0 0 56 56"><circle cx="28" cy="28" r="26"/></svg>${ICON.up}<span class="zu-tip">Back to top</span></button>
  ${WA ? `<a class="zu-fab zu-wa" href="${waLink('Hi Zigma! I would like to discuss a project.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ICON.wa}<span class="zu-tip">Chat on WhatsApp</span></a>` : ''}
  <button class="zu-fab zu-plan" data-planner="" aria-label="Plan your project">${ICON.spark}<span class="zu-tip">Plan your project</span></button>`;
document.body.appendChild(dock);
const topBtn = $('#zuTop'), ringC = $('#zuTop circle');
topBtn.onclick = () => window.scrollTo({top:0, behavior: reduced ? 'auto' : 'smooth'});
/* animations on/off — any element with data-zu-motion (e.g. a footer link) */
$$('[data-zu-motion]').forEach(b => { b.textContent = reduced ? 'Animations: off' : 'Animations: on';
  b.addEventListener('click', e => { e.preventDefault(); try { localStorage.setItem('zigma-motion', reduced ? 'on' : 'off'); } catch(_){} location.reload(); }); });
const bubble = $('#zuBubble');
if (bubble){
  bubble.querySelector('button').onclick = () => { bubble.classList.remove('on'); store.set('zigma-bubble', 1); };
  if (!store.get('zigma-bubble')) setTimeout(() => { if (!document.querySelector('.zu-modal.open') && !dock.classList.contains('away')){ bubble.classList.add('on'); store.set('zigma-bubble', 1); setTimeout(() => bubble.classList.remove('on'), 9000); } }, 20000);
}
function onScroll(){
  const h = document.documentElement.scrollHeight - innerHeight;
  const p = h > 0 ? Math.min(1, scrollY / h) : 0;
  prog.style.transform = `scaleX(${p})`;
  topBtn.classList.toggle('on', scrollY > innerHeight * .8);
  ringC.style.strokeDashoffset = 163.4 * (1 - p);
}
addEventListener('scroll', onScroll, {passive:true}); onScroll();
/* get the dock out of the way while typing or when the contact block is on screen */
let typing = false, contactVisible = false;
const dockState = () => dock.classList.toggle('away', typing || contactVisible);
document.addEventListener('focusin', e => { if (e.target.matches('input,textarea,select') && !e.target.closest('.zu-modal')){ typing = true; dockState(); } });
document.addEventListener('focusout', () => { typing = false; setTimeout(dockState, 50); });
/* hide the dock over the contact block and footer so the bottom of the page stays clean */
const quiet = new Set();
if ('IntersectionObserver' in window){
  const qo = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? quiet.add(e.target) : quiet.delete(e.target)); contactVisible = quiet.size > 0; if (contactVisible && bubble) bubble.classList.remove('on'); dockState(); }, {threshold:.05});
  $$('[data-zu-quiet]').forEach(el => qo.observe(el));
}

/* ---------------- active nav link ---------------- */
const navLinks = $$('a[href^="#"]').filter(a => a.closest('nav, header, .links, [data-zu-nav]') && a.getAttribute('href').length > 1);
const secs = [...new Set(navLinks.map(a => a.getAttribute('href')))].map(h => document.querySelector(h)).filter(Boolean);
if ('IntersectionObserver' in window && secs.length){
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ const id = '#' + e.target.id; navLinks.forEach(a => { const on = a.getAttribute('href') === id; a.classList.toggle('is-active', on); if (on) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); }); }
  }), {rootMargin:'-45% 0px -50% 0px'});
  secs.forEach(s => io.observe(s));
}

/* ---------------- modal helper ---------------- */
let lastFocus = null;
function makeModal(cls, label){
  const m = document.createElement('div'); m.className = 'zu-modal ' + cls;
  m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-label', label);
  m.innerHTML = `<div class="zu-back"></div><div class="zu-box"><button class="zu-x" aria-label="Close">✕</button><div class="zu-inner"></div></div>`;
  document.body.appendChild(m);
  m.querySelector('.zu-back').onclick = () => closeModal(m);
  m.querySelector('.zu-x').onclick = () => closeModal(m);
  m.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal(m);
    if (e.key === 'Tab'){
      const f = $$('button:not([disabled]),a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])', m).filter(x => x.offsetParent !== null);
      if (!f.length) return; const first = f[0], last = f[f.length-1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  return m;
}
function openModal(m){
  lastFocus = document.activeElement;
  m.classList.add('open'); document.documentElement.style.overflow = 'hidden';
  if (bubble) bubble.classList.remove('on');
  setTimeout(() => { const f = m.querySelector('.zu-inner button, .zu-inner input, .zu-x'); f && f.focus({preventScroll:true}); }, 60);
}
function closeModal(m){
  m.classList.remove('open'); document.documentElement.style.overflow = '';
  if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
}

/* ---------------- confetti ---------------- */
function confetti(host){
  if (reduced) return;
  const cv = document.createElement('canvas'); cv.className = 'zu-confetti'; host.appendChild(cv);
  const r = host.getBoundingClientRect(); cv.width = r.width; cv.height = r.height;
  const ctx = cv.getContext('2d'); const cs = getComputedStyle(document.documentElement);
  const cols = [cs.getPropertyValue('--ui-acc'), cs.getPropertyValue('--ui-acc2'), '#facc15', '#f472b6', '#34d399'];
  const ps = Array.from({length:120}, () => ({x:r.width/2, y:r.height*.35, vx:(Math.random()-.5)*12, vy:Math.random()*-11-3, s:Math.random()*6+4, c:cols[Math.random()*cols.length|0], a:Math.random()*6, va:(Math.random()-.5)*.3}));
  let f = 0;
  (function tick(){
    ctx.clearRect(0,0,cv.width,cv.height);
    ps.forEach(p => { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); ctx.restore(); });
    if (++f < 140) requestAnimationFrame(tick); else cv.remove();
  })();
}

/* ---------------- send helper (Formspree or email/WhatsApp) ---------------- */
async function submitForm(data){
  if (!C.formEndpoint) return false;
  try {
    const r = await fetch(C.formEndpoint, {method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body: JSON.stringify(data)});
    return r.ok;
  } catch(e){ return false; }
}

/* =========================================================
   PROJECT PLANNER (multi-step wizard)
   ========================================================= */
const SERVICES = [['🌐','Website','Business site, landing page'],['📱','Mobile app','Android & iOS'],['⚙️','Custom software','Web apps, portals, ERP'],['☁️','Cloud','AWS · Azure · GCP'],['🤖','AI & ML','Automation, insights'],['🎨','UI/UX design','Look & feel'],['♾️','DevOps','CI/CD, automation'],['💡','IT consulting','Advice & strategy']];
const INDUSTRIES = ['Healthcare','Real Estate','Retail','Education','Manufacturing','Logistics','Other'];
const TIMES = ['As soon as possible','1–3 months','3–6 months','Flexible'];
const STAGES = ['Just an idea','Have designs / specs','Improve an existing product'];
const plan = Object.assign({services:[], industry:'', timeline:'', stage:'', name:'', email:'', phone:'', company:'', message:''}, store.get('zigma-plan') || {});
let step = 0; const TOTAL = 5;
const pm = makeModal('zu-planner', 'Plan your project');
pm.querySelector('.zu-box').classList.add('zu-plan-box');
const save = () => store.set('zigma-plan', plan);
const optBtn = (val, pressed, inner) => `<button type="button" class="zu-opt" data-v="${esc(val)}" aria-pressed="${pressed}">${inner}</button>`;

function renderPlanner(dir){
  const inner = pm.querySelector('.zu-inner');
  const steps = Array.from({length:TOTAL}, (_,i) => `<i class="${i <= step ? 'done' : ''}"></i>`).join('');
  let body = '';
  if (step === 0){
    body = `<div class="zu-kicker">Step 1 of 4</div><h3 class="zu-h">What can we help you build?</h3><p class="zu-sub">Pick one or more.</p>
      <div class="zu-opts" data-k="services" data-multi="1">${SERVICES.map(([e,n,d]) => optBtn(n, plan.services.includes(n), `<span class="e">${e}</span>${esc(n)}<small>${esc(d)}</small>`)).join('')}</div>`;
  } else if (step === 1){
    body = `<div class="zu-kicker">Step 2 of 4</div><h3 class="zu-h">Which industry are you in?</h3><p class="zu-sub">This helps us bring the right experience.</p>
      <div class="zu-chips" data-k="industry">${INDUSTRIES.map(n => optBtn(n, plan.industry === n, esc(n))).join('')}</div>`;
  } else if (step === 2){
    body = `<div class="zu-kicker">Step 3 of 4</div><h3 class="zu-h">Where are you right now?</h3><p class="zu-sub">No wrong answers.</p>
      <div class="zu-label">Project stage</div><div class="zu-chips" data-k="stage">${STAGES.map(n => optBtn(n, plan.stage === n, esc(n))).join('')}</div>
      <div class="zu-label">When would you like to start?</div><div class="zu-chips" data-k="timeline">${TIMES.map(n => optBtn(n, plan.timeline === n, esc(n))).join('')}</div>`;
  } else if (step === 3){
    body = `<div class="zu-kicker">Step 4 of 4</div><h3 class="zu-h">How can we reach you?</h3><p class="zu-sub">We'll get back to you soon.</p>
      <form id="zuPlanForm" novalidate>
        <div class="zu-grid2">
          ${field('name','text','Your name *', plan.name, 'Please enter your name')}
          ${field('email','email','Email *', plan.email, 'Please enter a valid email')}
          ${field('phone','tel','Phone (optional)', plan.phone)}
          ${field('company','text','Company (optional)', plan.company)}
        </div>
        <div class="zu-field"><textarea name="message" id="zp-message" placeholder=" " maxlength="600">${esc(plan.message)}</textarea><label for="zp-message">Anything else? (optional)</label><span class="zu-count">${plan.message.length}/600</span></div>
      </form>`;
  } else {
    body = `<div class="zu-kicker">Review</div><h3 class="zu-h">Your project brief is ready ✨</h3><p class="zu-sub">Send it the way you prefer — it only takes a click.</p>
      <div class="zu-summary"><dl>
        <dt>Services</dt><dd>${esc(plan.services.join(', ') || '—')}</dd>
        <dt>Industry</dt><dd>${esc(plan.industry || '—')}</dd>
        <dt>Stage</dt><dd>${esc(plan.stage || '—')}</dd>
        <dt>Start</dt><dd>${esc(plan.timeline || '—')}</dd>
        <dt>Contact</dt><dd>${esc(plan.name)} · ${esc(plan.email)}${plan.phone ? ' · ' + esc(plan.phone) : ''}</dd>
        ${plan.company ? `<dt>Company</dt><dd>${esc(plan.company)}</dd>` : ''}
        ${plan.message ? `<dt>Notes</dt><dd>${esc(plan.message)}</dd>` : ''}
      </dl></div>
      <div class="zu-actions">
        ${C.formEndpoint ? `<button class="zu-btn pri" id="zuSendForm">Send brief</button>` : `<a class="zu-btn pri" id="zuSendMail" href="${mailLink('New project brief — ' + (plan.services[0]||'Project'), briefText())}">✉ Send by email</a>`}
        ${WA ? `<a class="zu-btn wa" id="zuSendWa" href="${waLink(briefText())}" target="_blank" rel="noopener">${ICON.wa.replace('<svg','<svg width="18" height="18"')} WhatsApp</a>` : ''}
        <button class="zu-btn" id="zuCopy">Copy brief</button>
      </div>`;
  }
  const done = step === 4;
  inner.innerHTML = `<div class="zu-steps" aria-hidden="true">${steps}</div>
    <div class="zu-stage"><div class="zu-pane on ${dir < 0 ? 'back' : ''}">${body}</div></div>
    <div class="zu-nav">
      <button class="zu-btn" id="zuPrev" ${step === 0 ? 'style="visibility:hidden"' : ''}>← Back</button>
      <span class="hint">${done ? 'Your answers are saved on this device' : 'Press Enter ↵ to continue'}</span>
      ${done ? `<button class="zu-btn" id="zuReset">Start over</button>` : `<button class="zu-btn pri" id="zuNext">${step === 3 ? 'Review →' : 'Continue →'}</button>`}
    </div>`;
  // option clicks
  $$('[data-k]', inner).forEach(group => group.addEventListener('click', e => {
    const b = e.target.closest('.zu-opt'); if (!b) return;
    const k = group.dataset.k, v = b.dataset.v;
    if (group.dataset.multi){ const i = plan[k].indexOf(v); i > -1 ? plan[k].splice(i,1) : plan[k].push(v); b.setAttribute('aria-pressed', plan[k].includes(v)); }
    else { plan[k] = plan[k] === v ? '' : v; $$('.zu-opt', group).forEach(x => x.setAttribute('aria-pressed', x.dataset.v === plan[k])); }
    save(); updateNext();
    if (!group.dataset.multi && step === 1 && plan[k]) setTimeout(() => go(1), 280); // auto-advance on single choice
  }));
  const form = $('#zuPlanForm', inner);
  if (form){
    form.addEventListener('input', e => { const t = e.target; plan[t.name] = t.value; save(); validateField(t, false); updateNext();
      if (t.name === 'message') t.parentElement.querySelector('.zu-count').textContent = t.value.length + '/600'; });
    form.addEventListener('focusout', e => validateField(e.target, true));
  }
  const prev = $('#zuPrev', inner), next = $('#zuNext', inner);
  prev.onclick = () => go(-1);
  if (next) next.onclick = () => { if (step === 3 && !validateAll(form)) return; go(1); };
  const reset = $('#zuReset', inner);
  if (reset) reset.onclick = () => { Object.assign(plan, {services:[], industry:'', timeline:'', stage:'', message:''}); save(); step = 0; renderPlanner(-1); };
  const sentOK = () => { inner.querySelector('.zu-stage').innerHTML = `<div class="zu-done"><div class="big">🎉</div><h3 class="zu-h">Thank you, ${esc(plan.name.split(' ')[0] || 'friend')}!</h3><p class="zu-sub">We've got your brief and will be in touch soon.</p></div>`; confetti(pm.querySelector('.zu-box')); store.del('zigma-plan'); };
  const sm = $('#zuSendMail', inner), sw = $('#zuSendWa', inner), sf = $('#zuSendForm', inner), cp = $('#zuCopy', inner);
  if (sm) sm.addEventListener('click', () => { confetti(pm.querySelector('.zu-box')); toast('Opening your email app…'); });
  if (sw) sw.addEventListener('click', () => { confetti(pm.querySelector('.zu-box')); toast('Opening WhatsApp…'); });
  if (cp) cp.onclick = () => copy(briefText(), 'Brief copied to clipboard');
  if (sf) sf.onclick = async () => { sf.disabled = true; sf.textContent = 'Sending…';
    const ok = await submitForm({_subject:'New project brief', ...plan, services: plan.services.join(', ')});
    if (ok) sentOK(); else { sf.disabled = false; sf.textContent = 'Send brief'; toast('Could not send — please use email or WhatsApp'); } };
  updateNext();
}
function field(name, type, label, val, err){
  return `<div class="zu-field ${val && (name !== 'email' || isEmail(val)) ? 'ok' : ''}"><input id="zp-${name}" name="${name}" type="${type}" placeholder=" " value="${esc(val)}" ${err ? 'required' : ''} autocomplete="${name === 'company' ? 'organization' : name === 'phone' ? 'tel' : name}"><label for="zp-${name}">${label}</label>${err ? `<div class="err">${err}</div>` : ''}</div>`;
}
function validateField(t, strict){
  if (!t || !t.name || !t.closest('.zu-field')) return true;
  const w = t.closest('.zu-field'); let ok = true;
  if (t.required && !t.value.trim()) ok = false;
  if (t.type === 'email' && t.value && !isEmail(t.value)) ok = false;
  if (t.type === 'email' && t.required && !t.value) ok = false;
  if (strict || w.classList.contains('bad')) w.classList.toggle('bad', !ok);
  w.classList.toggle('ok', ok && !!t.value.trim());
  return ok;
}
function validateAll(form){
  let ok = true; $$('input,textarea', form).forEach(i => { if (!validateField(i, true)) ok = false; });
  if (!ok){ const b = form.querySelector('.bad input'); b && b.focus(); }
  return ok;
}
function canNext(){
  if (step === 0) return plan.services.length > 0;
  if (step === 1) return !!plan.industry;
  if (step === 2) return true;
  if (step === 3) return plan.name.trim() && isEmail(plan.email);
  return true;
}
function updateNext(){ const n = $('#zuNext', pm); if (n) n.disabled = !canNext(); }
function go(d){ if (d > 0 && !canNext()) return; step = Math.max(0, Math.min(TOTAL-1, step + d)); renderPlanner(d); const f = pm.querySelector('.zu-pane button, .zu-pane input'); f && f.focus({preventScroll:true}); pm.querySelector('.zu-box').scrollTop = 0; }
function briefText(){
  return `Hi Zigma team! Here's my project brief:\n\n` +
    `• Services: ${plan.services.join(', ') || '-'}\n• Industry: ${plan.industry || '-'}\n• Stage: ${plan.stage || '-'}\n• Start: ${plan.timeline || '-'}\n\n` +
    `Name: ${plan.name}\nEmail: ${plan.email}${plan.phone ? '\nPhone: ' + plan.phone : ''}${plan.company ? '\nCompany: ' + plan.company : ''}` +
    (plan.message ? `\n\nNotes: ${plan.message}` : '');
}
pm.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'A' && !(e.target.classList && e.target.classList.contains('zu-opt'))){
    const n = $('#zuNext', pm); if (n && !n.disabled){ e.preventDefault(); n.click(); }
  }
});
function openPlanner(opts){
  opts = opts || {};
  if (opts.service){ const match = SERVICES.find(s => s[1].toLowerCase() === opts.service.toLowerCase()); if (match && !plan.services.includes(match[1])) plan.services.push(match[1]); }
  if (opts.industry && INDUSTRIES.includes(opts.industry)) plan.industry = opts.industry;
  save();
  step = opts.service ? (opts.industry ? 2 : 1) : (opts.industry ? (plan.services.length ? 2 : 0) : 0);
  renderPlanner(1); openModal(pm);
}

/* =========================================================
   PROJECT DETAIL POP-UP
   ========================================================= */
const prm = makeModal('zu-proj', 'Project details');
let pIdx = 0;
function renderProject(dir){
  const p = PROJECTS[pIdx]; if (!p) return;
  const c = p.color || '#7c5cff';
  const ini = (p.title||'Z').split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase();
  const cover = p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}">` :
    `<div class="gen" style="background:radial-gradient(circle at 25% 25%, ${esc(c)}, transparent 60%),radial-gradient(circle at 80% 85%, ${esc(c)}99, transparent 55%),#0b0b16">${esc(ini)}</div>`;
  const svc = /mobile/i.test(p.category) ? 'Mobile app' : /ai|ml/i.test(p.category) ? 'AI & ML' : /cloud|iot/i.test(p.category) ? 'Cloud' : /ui|ux|design/i.test(p.category) ? 'UI/UX design' : /devops/i.test(p.category) ? 'DevOps' : /consult/i.test(p.category) ? 'IT consulting' : 'Custom software';
  prm.querySelector('.zu-inner').innerHTML = `
    ${PROJECTS.length > 1 ? `<span class="zu-pcount">${pIdx+1} / ${PROJECTS.length}</span><button class="zu-pn prev" aria-label="Previous project">←</button><button class="zu-pn next" aria-label="Next project">→</button>` : ''}
    <div class="zu-pane on ${dir < 0 ? 'back' : ''}">
      <div class="cover">${cover}</div>
      <div class="body">
        <div class="meta"><span>${esc(p.category)}</span>${p.year ? `<span>${esc(p.year)}</span>` : ''}${p.client ? `<span>${esc(p.client)}</span>` : ''}</div>
        <h3>${esc(p.title)}</h3><p class="sum">${esc(p.summary)}</p>
        ${(p.tags||[]).length ? `<div class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="zu-actions">
          ${p.link ? `<a class="zu-btn pri" href="${esc(p.link)}" target="_blank" rel="noopener">View live project ↗</a>` : ''}
          <button class="zu-btn ${p.link ? '' : 'pri'}" data-similar="${esc(svc)}">Start a similar project</button>
        </div>
      </div>
    </div>`;
  const pv = $('.zu-pn.prev', prm), nx = $('.zu-pn.next', prm);
  if (pv) pv.onclick = () => stepProject(-1);
  if (nx) nx.onclick = () => stepProject(1);
  $('[data-similar]', prm).onclick = e => { closeModal(prm); setTimeout(() => openPlanner({service: e.currentTarget.dataset.similar}), 250); };
}
function stepProject(d){ pIdx = (pIdx + d + PROJECTS.length) % PROJECTS.length; renderProject(d); }
function openProject(i){ pIdx = +i || 0; renderProject(1); openModal(prm); }
prm.addEventListener('keydown', e => { if (e.key === 'ArrowRight') stepProject(1); if (e.key === 'ArrowLeft') stepProject(-1); });
let tx0 = null;
prm.addEventListener('touchstart', e => tx0 = e.touches[0].clientX, {passive:true});
prm.addEventListener('touchend', e => { if (tx0 == null) return; const dx = e.changedTouches[0].clientX - tx0; if (Math.abs(dx) > 60) stepProject(dx < 0 ? 1 : -1); tx0 = null; });

/* ---------------- global click delegation ---------------- */
document.addEventListener('click', e => {
  const pl = e.target.closest('[data-planner]');
  if (pl){ e.preventDefault(); openPlanner({service: pl.dataset.planner || ''}); return; }
  const ind = e.target.closest('[data-industry]');
  if (ind){ e.preventDefault(); openPlanner({industry: ind.dataset.industry}); return; }
  const pr = e.target.closest('[data-pi]');
  if (pr && !e.target.closest('a[href^="http"]')){ e.preventDefault(); openProject(pr.dataset.pi); return; }
  const cp = e.target.closest('[data-copy]');
  if (cp){ e.preventDefault(); copy(cp.dataset.copy, cp.dataset.copyMsg || 'Copied!'); }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-pi]:not(a):not(button), [data-planner]:not(a):not(button), [data-industry]:not(a):not(button)')){ e.preventDefault(); e.target.click(); }
});
// make non-button triggers keyboard reachable (also for cards rendered later)
const a11y = () => $$('[data-pi], [data-planner], [data-industry]').forEach(el => { if (!/^(A|BUTTON)$/.test(el.tagName)){ el.tabIndex = 0; el.setAttribute('role','button'); } });
a11y(); new MutationObserver(a11y).observe(document.body, {childList:true, subtree:true});

/* =========================================================
   CONTACT BLOCK + SMART FORM
   ========================================================= */
const host = $('#zu-contact');
if (host){
  host.innerHTML = `<div class="zu-contact">
    <div class="zu-cside">
      <button class="zu-ccard" data-copy="${esc(EMAIL)}" data-copy-msg="Email copied"><span class="ic">✉️</span><span><small>Email</small><b>${esc(EMAIL)}</b></span><span class="act">Copy</span></button>
      ${PHONE ? `<a class="zu-ccard" href="tel:${esc(PHONE.replace(/\s/g,''))}"><span class="ic">📞</span><span><small>Call us</small><b>${esc(PHONE)}</b></span><span class="act">Call</span></a>` : ''}
      ${WA ? `<a class="zu-ccard" href="${waLink('Hi Zigma! I have a question.')}" target="_blank" rel="noopener"><span class="ic">💬</span><span><small>WhatsApp</small><b>Chat with us instantly</b></span><span class="act">Open</span></a>` : ''}
      <button class="zu-ccard" data-planner=""><span class="ic">✨</span><span><small>Not sure where to start?</small><b>Use the 1-minute project planner</b></span><span class="act">Start</span></button>
    </div>
    <form class="zu-form" id="zuContactForm" novalidate>
      <h3>Send us a message</h3><p>We'll get back to you soon.</p>
      <div class="zu-topics" role="group" aria-label="Topic">${['New project','Hiring / Careers','Partnership','Something else'].map((t,i) => `<button type="button" class="zu-opt" data-v="${t}" aria-pressed="${i===0}">${t}</button>`).join('')}</div>
      <div class="zu-grid2">
        <div class="zu-field"><input id="zc-name" name="name" placeholder=" " required autocomplete="name"><label for="zc-name">Your name *</label><div class="err">Please enter your name</div></div>
        <div class="zu-field"><input id="zc-email" name="email" type="email" placeholder=" " required autocomplete="email"><label for="zc-email">Email *</label><div class="err">Please enter a valid email</div></div>
      </div>
      <div class="zu-field"><textarea id="zc-msg" name="message" placeholder=" " required maxlength="800"></textarea><label for="zc-msg">How can we help? *</label><span class="zu-count">0/800</span><div class="err">Tell us a little about it</div></div>
      <div class="zu-send">
        <button type="submit" class="zu-btn pri">${C.formEndpoint ? 'Send message' : '✉ Send by email'}</button>
        ${WA ? `<button type="button" class="zu-btn wa" id="zuFormWa">${ICON.wa.replace('<svg','<svg width="18" height="18"')} Send on WhatsApp</button>` : ''}
      </div>
    </form></div>`;
  const f = $('#zuContactForm'); let topic = 'New project';
  $('.zu-topics', f).addEventListener('click', e => { const b = e.target.closest('.zu-opt'); if (!b) return; topic = b.dataset.v; $$('.zu-topics .zu-opt', f).forEach(x => x.setAttribute('aria-pressed', x === b)); });
  f.addEventListener('input', e => { validateField(e.target, false); if (e.target.name === 'message') f.querySelector('.zu-count').textContent = e.target.value.length + '/800'; });
  f.addEventListener('focusout', e => { if (e.target.value) validateField(e.target, true); });
  const body = () => `${f.message.value.trim()}\n\n— ${f.name.value.trim()} (${f.email.value.trim()})`;
  f.addEventListener('submit', async e => {
    e.preventDefault(); if (!validateAll(f)) return;
    const btn = f.querySelector('[type=submit]');
    if (C.formEndpoint){
      btn.disabled = true; btn.textContent = 'Sending…';
      const ok = await submitForm({_subject: 'Website: ' + topic, topic, name: f.name.value, email: f.email.value, message: f.message.value});
      btn.disabled = false; btn.textContent = 'Send message';
      if (ok){ f.reset(); $$('.zu-field', f).forEach(x => x.classList.remove('ok')); toast('Message sent — thank you! 🎉'); confetti(f); }
      else toast('Could not send — please try email or WhatsApp');
    } else {
      location.href = mailLink(`${topic} — ${f.name.value.trim()}`, body());
      toast('Opening your email app…');
    }
  });
  const fw = $('#zuFormWa');
  if (fw) fw.onclick = () => { if (!validateAll(f)) return; window.open(waLink(`[${topic}] ${body()}`), '_blank', 'noopener'); };
}

/* ---------------- FAQ ---------------- */
const faqHost = $('#zu-faq');
if (faqHost && (C.faq||[]).length){
  faqHost.innerHTML = `<div class="zu-faq">${C.faq.map(([q,a]) => `<details><summary>${esc(q)}<i aria-hidden="true"></i></summary><div class="ans"><p>${esc(a)}</p></div></details>`).join('')}</div>`;
  $$('.zu-faq details', faqHost).forEach(d => {
    const s = d.querySelector('summary'), a = d.querySelector('.ans');
    s.addEventListener('click', e => {
      if (reduced || !a.animate) return;
      e.preventDefault();
      if (d.open){ const h = a.offsetHeight; a.animate([{height:h+'px',opacity:1},{height:'0px',opacity:0}], {duration:300, easing:'ease'}).onfinish = () => d.open = false; }
      else {
        $$('.zu-faq details[open]', faqHost).forEach(o => { if (o !== d) o.open = false; });
        d.open = true; const h = a.offsetHeight; a.animate([{height:'0px',opacity:0},{height:h+'px',opacity:1}], {duration:350, easing:'cubic-bezier(.2,.8,.2,1)'});
      }
    });
  });
}

window.ZigmaUI = {openPlanner, openProject, toast};
})();
