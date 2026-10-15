const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const year = document.querySelector('[data-year]');

const syncHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 20);
};

const closeMenu = () => {
  menuButton?.classList.remove('is-open');
  navigation?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};

menuButton?.addEventListener('click', () => {
  const nextState = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.classList.toggle('is-open', nextState);
  navigation?.classList.toggle('is-open', nextState);
  menuButton.setAttribute('aria-expanded', String(nextState));
  document.body.style.overflow = nextState ? 'hidden' : '';
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

if (year) year.textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px' },
  );
  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
}
