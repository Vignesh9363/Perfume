

/* script.js — vanilla JS for ScentVerse (search, reveal, parallax, ripple) */
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const suggestionsBox = document.getElementById('suggestions');
  const searchBtn = document.getElementById('searchBtn');
  const yearSpan = document.getElementById('year');

  // set year
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // collect current product names from DOM
  function getAllProducts() {
    return Array.from(document.querySelectorAll('.product')).map(p => p.getAttribute('data-name') || p.querySelector('h3')?.textContent || '');
  }

  // show suggestions (dynamic from DOM)
  function showSuggestions(query) {
    suggestionsBox.innerHTML = '';
    if (!query) { suggestionsBox.style.display = 'none'; return; }
    const list = getAllProducts().filter(n => n.toLowerCase().includes(query.toLowerCase()));
    if (!list.length) { suggestionsBox.style.display = 'none'; return; }
    list.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      li.addEventListener('click', () => {
        searchInput.value = item;
        suggestionsBox.style.display = 'none';
        scrollToProduct(item);
      });
      suggestionsBox.appendChild(li);
    });
    suggestionsBox.style.display = 'block';
  }

  searchInput.addEventListener('input', (e) => showSuggestions(e.target.value.trim()));

  // enter key triggers search/scroll
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      suggestionsBox.style.display = 'none';
      scrollToProduct(searchInput.value.trim());
    }
  });

  searchBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    suggestionsBox.style.display = 'none';
    scrollToProduct(searchInput.value.trim());
  });

  // hide suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) suggestionsBox.style.display = 'none';
  });

  // scroll to product and highlight
  function scrollToProduct(name) {
    if (!name) return;
    // try exact match first, then case-insensitive fallback
    let product = document.querySelector(`.product[data-name="${CSS.escape(name)}"]`);
    if (!product) {
      product = Array.from(document.querySelectorAll('.product')).find(p => {
        const n = (p.getAttribute('data-name') || '').toLowerCase();
        return n === name.toLowerCase();
      });
    }
    if (!product) {
      // fuzzy: includes
      product = Array.from(document.querySelectorAll('.product')).find(p => {
        const n = (p.getAttribute('data-name') || '').toLowerCase();
        return n.includes(name.toLowerCase());
      });
    }
    if (product) {
      // remove previous highlights
      document.querySelectorAll('.product.highlight').forEach(el => el.classList.remove('highlight'));
      product.scrollIntoView({ behavior: 'smooth', block: 'center' });
      product.classList.add('highlight');
      setTimeout(() => product.classList.remove('highlight'), 2600);
    } else {
      // fallback small UI: simple alert (replace with custom UI later)
      alert(`No product found for: "${name}". Try another search or check spelling.`);
    }
  }

  /* ---------- Reveal-on-scroll (IntersectionObserver) ---------- */
  const revealTargets = document.querySelectorAll('section, .collection-card, .product, .testimonial-card');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    revealTargets.forEach(t => t.classList.add('reveal-in'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealTargets.forEach(t => {
      t.classList.add('reveal-init');
      io.observe(t);
    });
  } else {
    // fallback: just show
    revealTargets.forEach(t => t.classList.add('reveal-in'));
  }

  /* ---------- Hero Parallax (subtle) ---------- */
  (function heroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero || prefersReduced) return;
    const content = hero.querySelector('.hero-content');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      hero.style.backgroundPosition = `center ${Math.round(y * -0.12)}px`;
    }, { passive: true });

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const relX = (e.clientX - r.left) / r.width - 0.5;
      const relY = (e.clientY - r.top) / r.height - 0.5;
      const tx = relX * 10;
      const ty = relY * 10;
      if (content) content.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
    hero.addEventListener('mouseleave', () => {
      if (content) content.style.transform = `translate3d(0,0,0)`;
    });
  })();

  /* ---------- Button ripple effect ---------- */
  (function addRipple() {
    const buttons = document.querySelectorAll('.btn, button');
    if (prefersReduced) return;
    buttons.forEach(btn => {
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';
      btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.2;
        const span = document.createElement('span');
        span.style.position = 'absolute';
        span.style.width = span.style.height = `${size}px`;
        span.style.left = `${e.clientX - rect.left - size / 2}px`;
        span.style.top = `${e.clientY - rect.top - size / 2}px`;
        span.style.borderRadius = '50%';
        span.style.background = 'rgba(255,255,255,0.15)';
        span.style.transform = 'scale(0)';
        span.style.pointerEvents = 'none';
        span.style.transition = 'transform 450ms ease, opacity 600ms ease';
        this.appendChild(span);
        requestAnimationFrame(() => span.style.transform = 'scale(1)');
        setTimeout(() => span.style.opacity = '0', 350);
        setTimeout(() => span.remove(), 700);
      });
    });
  })();

  /* ---------- Lazy images: add loading=lazy ---------- */
  document.querySelectorAll('img').forEach(img => {
    if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
  });

  /* ---------- Subscription demo handler (no backend) ---------- */
  const subscribeForm = document.getElementById('subscribeForm');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('subscribeEmail')?.value || '';
      if (!email) { alert('Please enter an email.'); return; }
      // demo UX — replace with real API call
      alert(`Thanks! ${email} has been subscribed to the Scent Circle.`);
      subscribeForm.reset();
    });
  }

});