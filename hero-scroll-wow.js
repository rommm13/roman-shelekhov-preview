(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const spacer = document.querySelector('.hero-spacer');
  if (!hero || !spacer) return;
  const photo = hero.querySelector('.hero__person');
  const ctaLink = hero.querySelector('.hero__cta a');
  if (!photo || !ctaLink) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const phase = (p, a, b) => smooth((p - a) / (b - a));

  hero.classList.add('hero--scroll-wow', 'show');
  let start = 0, length = 1, vh = window.innerHeight;
  let shiftX = 0, shiftY = 0;
  let target = 0, current = 0, raf = 0, last = 0;

  function measure() {
    vh = window.innerHeight || document.documentElement.clientHeight || 800;
    const sr = spacer.getBoundingClientRect();
    start = window.scrollY + sr.top;
    length = Math.max(1, spacer.offsetHeight + Math.min(vh * 0.25, 220));
    const mobile = window.innerWidth < 1024;
    shiftX = mobile ? 0 : Math.min(210, window.innerWidth * 0.13);
    shiftY = mobile ? -Math.min(160, Math.max(80, photo.offsetHeight * 0.43)) : -vh * 0.075;
  }

  function put(name, n) {
    hero.style.setProperty(name, typeof n === 'number' ? String(Math.round(n * 10000) / 10000) : n);
  }

  function draw(p) {
    const hold = phase(p, 0.08, 0.64);
    const replace = phase(p, 0.22, 0.60);
    const fly = phase(p, 0.50, 0.96);

    put('--wow-photo-opacity', 1 - hold);
    put('--wow-photo-y', (-24 * hold).toFixed(1) + 'px');
    put('--wow-photo-scale', 1 + 0.035 * hold);

    put('--wow-copy-x', (shiftX * replace).toFixed(1) + 'px');
    put('--wow-copy-y', (shiftY * replace - vh * 0.88 * fly).toFixed(1) + 'px');
    put('--wow-copy-opacity', 1 - phase(p, 0.49, 0.82));
    put('--wow-title-y', (-vh * 0.75 * phase(p, 0.19, 0.92)).toFixed(1) + 'px');
    put('--wow-title-opacity', 1 - phase(p, 0.34, 0.76));
    put('--wow-role-y', (-vh * 0.70 * phase(p, 0.22, 0.90)).toFixed(1) + 'px');
    put('--wow-role-opacity', 1 - phase(p, 0.38, 0.78));

    put('--wow-cta-y', (-vh * 0.16 * phase(p, 0.75, 1)).toFixed(1) + 'px');
    put('--wow-cta-opacity', 1 - phase(p, 0.76, 0.97));
    put('--wow-bg-opacity', 1 - phase(p, 0.38, 0.91));

    const done = p > 0.97;
    ctaLink.tabIndex = done ? -1 : 0;
    ctaLink.style.pointerEvents = done ? 'none' : 'auto';
  }

  function tick(t) {
    raf = 0;
    const dt = Math.max(0, Math.min(64, t - (last || t)));
    last = t;
    target = clamp((window.scrollY - start) / length);
    if (target <= 0.00001 && window.scrollY > vh * 0.3) {
      measure();
      target = clamp((window.scrollY - start) / length);
    }
    current = reduced.matches ? target : current + (target - current) * (1 - Math.exp(-dt / 95));
    if (Math.abs(current - target) < 0.00025) current = target;
    if (current <= 0.00001 && target <= 0.00001) {
      hero.classList.remove('is-scroll-transition');
      ctaLink.tabIndex = 0;
      ctaLink.style.pointerEvents = 'auto';
    } else {
      hero.classList.add('is-scroll-transition');
      draw(current);
    }
    if (Math.abs(current - target) > 0.00025) schedule();
  }

  function schedule() { if (!raf) raf = requestAnimationFrame(tick); }
  function onMeasure() { measure(); schedule(); }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', onMeasure);
  window.addEventListener('orientationchange', onMeasure);
  if (reduced.addEventListener) reduced.addEventListener('change', schedule);
  else if (reduced.addListener) reduced.addListener(schedule);
  if (ctaLink.getAttribute('href') === '#flow') {
    ctaLink.addEventListener('click', (e) => {
      const flow = document.getElementById('flow');
      if (!flow) return;
      e.preventDefault();
      flow.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    });
  }
  if (document.readyState === 'complete') { measure(); schedule(); }
  else window.addEventListener('load', () => { measure(); schedule(); }, { once: true });
  measure();
  schedule();
})();
