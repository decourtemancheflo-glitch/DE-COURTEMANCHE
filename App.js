// =============================================
// app.js — Portfolio Florian DC
// =============================================

// --- Menu Burger ---
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const overlay = document.getElementById('nav-overlay');
const navClose = document.getElementById('nav-close');

function openMenu() {
  nav.classList.add('is-open');
  overlay?.classList.add('is-visible');
  burger?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  // Focus premier lien
  const firstLink = nav.querySelector('a');
  firstLink?.focus();
}

function closeMenu() {
  nav.classList.remove('is-open');
  overlay?.classList.remove('is-visible');
  burger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  burger?.focus();
}

burger?.addEventListener('click', () => {
  const isOpen = nav.classList.contains('is-open');
  isOpen ? closeMenu() : openMenu();
});

navClose?.addEventListener('click', closeMenu);
overlay?.addEventListener('click', closeMenu);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
});

// Trap focus dans le menu mobile
nav?.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const focusable = nav.querySelectorAll('a, button');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
});

// --- Thème persistant ---
const root = document.documentElement;
const KEY = 'theme-dark';
const toggle = document.getElementById('themeToggle');

const saved = localStorage.getItem(KEY) === '1';
root.classList.toggle('theme-dark', saved);
if (toggle) toggle.checked = saved;

toggle?.addEventListener('change', (e) => {
  const v = e.target.checked;
  root.classList.toggle('theme-dark', v);
  localStorage.setItem(KEY, v ? '1' : '0');
});

// --- Compteur de caractères ---
const msg = document.getElementById('message');
const restant = document.getElementById('restant');
msg?.addEventListener('input', () => {
  if (!restant) return;
  const max = msg.maxLength || 280;
  restant.textContent = max - msg.value.length;
});

// --- Validation live ---
const form = document.getElementById('contact-form');
if (form) {
  const fields = {
    nom: form.querySelector('#nom'),
    email: form.querySelector('#email'),
    message: form.querySelector('#message'),
  };

  Object.values(fields).forEach(el => {
    if (!el) return;
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') validateField(el);
    });
  });
}

function validateField(el) {
  if (!el) return true;
  removeError(el);
  let valid = true;

  if (el.id === 'nom' && !el.value.trim()) {
    showError(el, 'Le nom est requis.');
    valid = false;
  } else if (el.id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
    showError(el, 'Adresse email invalide.');
    valid = false;
  } else if (el.id === 'message' && el.value.trim().length < 10) {
    showError(el, 'Le message doit faire au moins 10 caractères.');
    valid = false;
  }

  el.setAttribute('aria-invalid', String(!valid));
  return valid;
}

function showError(el, msg) {
  const p = document.createElement('p');
  p.setAttribute('role', 'alert');
  p.className = 'field-error';
  p.style.cssText = 'color:#d93030;font-size:.83rem;margin-top:.3rem;';
  p.textContent = msg;
  el.insertAdjacentElement('afterend', p);
}

function removeError(el) {
  const next = el.nextElementSibling;
  if (next?.getAttribute('role') === 'alert') next.remove();
}

// --- Envoi formulaire via Formspree (AJAX) ---
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validation complète
    const fields = ['nom', 'email', 'message'].map(id => form.querySelector('#' + id)).filter(Boolean);
    let allValid = true;
    fields.forEach(el => { if (!validateField(el)) allValid = false; });
    if (!allValid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoading = submitBtn?.querySelector('.btn-loading');
    const successBox = document.getElementById('form-success');
    const errorBox = document.getElementById('form-error');

    // État chargement
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.hidden = true;
    if (btnLoading) btnLoading.hidden = false;
    if (successBox) successBox.hidden = true;
    if (errorBox) errorBox.hidden = true;

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.reset();
        if (restant) restant.textContent = '280';
        if (successBox) successBox.hidden = false;
        successBox?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        if (errorBox) errorBox.hidden = false;
      }
    } catch {
      if (errorBox) errorBox.hidden = false;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.hidden = false;
      if (btnLoading) btnLoading.hidden = true;
    }
  });
}

// --- Chargement projets JSON (page projets) ---
async function chargerProjets() {
  const root = document.getElementById('liste-projets');
  // On ne recharge pas si les projets sont déjà en HTML statique
  const hasStaticCards = root?.querySelectorAll('.carte').length > 0;
  if (!root || hasStaticCards) return;

  try {
    const res = await fetch('projets.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    root.innerHTML = '';
    for (const p of data) {
      const card = document.createElement('article');
      card.className = 'carte';
      card.dataset.tag = p.tag;
      card.innerHTML = `
        <div class="carte-img-wrap">
          <img src="${p.img}" alt="${p.titre}" loading="lazy">
          <span class="carte-tag">${p.tag}</span>
        </div>
        <div class="carte-body">
          <h3>${p.titre}</h3>
          <p>${p.desc}</p>
          <a href="#" class="btn btn-primary">Voir →</a>
        </div>
      `;
      root.appendChild(card);
    }
  } catch (err) {
    console.error('Erreur chargement projets:', err);
  }
}

chargerProjets();

// --- Année footer ---
document.querySelectorAll('#annee').forEach(el => {
  el.textContent = new Date().getFullYear();
});