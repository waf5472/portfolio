/* Portfolio — script.js */

// Copyright year
document.getElementById('year').textContent = new Date().getFullYear();

// ── Mobile nav ───────────────────────────────────────────────
const toggle   = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

toggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  });
});

// ── Active nav link ──────────────────────────────────────────
const sections   = document.querySelectorAll('section[id]');
const anchors    = document.querySelectorAll('.nav-links a[href^="#"]');

const activateNav = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      anchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, {
  rootMargin: `-${getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-h').trim()} 0px -55% 0px`
});

sections.forEach(s => activateNav.observe(s));

// ── Scroll reveal ─────────────────────────────────────────────
const reveal = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      reveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

// ── Stagger project cards ────────────────────────────────────
document.querySelectorAll('.project-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

// ── Stagger skill groups ─────────────────────────────────────
document.querySelectorAll('.skill-group').forEach((group, i) => {
  group.style.transitionDelay = `${i * 0.06}s`;
});

// ── Stagger timeline items ───────────────────────────────────
document.querySelectorAll('.timeline-item').forEach((item, i) => {
  item.style.cssText += `
    opacity: 0;
    transform: translateY(12px);
    transition: opacity .55s ${i * 0.12}s cubic-bezier(0.16, 1, 0.3, 1),
                transform .55s ${i * 0.12}s cubic-bezier(0.16, 1, 0.3, 1);
  `;
});

const timelineReveal = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.timeline-item').forEach(item => {
        item.style.opacity = '1';
        item.style.transform = 'none';
      });
      timelineReveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

const exp = document.querySelector('#experience');
if (exp) timelineReveal.observe(exp);
