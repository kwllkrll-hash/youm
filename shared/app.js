/* ============================================================
   YOU Organization — Shared Front-End Engine (Vanilla JS)
   Theme · Bilingual i18n (AR-RTL / EN-LTR) · Reveal · Counters
   ============================================================ */
(function () {
  'use strict';

  /* ---------- THEME ---------- */
  const THEME_KEY = 'you-theme';
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      el.textContent = t === 'dark' ? '☀️' : '🌙';
    });
  }
  const savedTheme = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);
  window.YOUtoggleTheme = function () {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  };

  /* ---------- LANGUAGE / i18n ---------- */
  const LANG_KEY = 'you-lang';
  function applyLang(lang) {
    const dir = lang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.body && document.body.setAttribute('dir', dir);
    // swap text nodes
    document.querySelectorAll('[data-ar]').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (val !== null) el.textContent = val;
    });
    // placeholders
    document.querySelectorAll('[data-ar-ph]').forEach(el => {
      const val = el.getAttribute('data-' + lang + '-ph');
      if (val !== null) el.setAttribute('placeholder', val);
    });
    document.querySelectorAll('[data-lang-label]').forEach(el => {
      el.textContent = lang === 'en' ? 'العربية' : 'EN';
    });
  }
  const savedLang = localStorage.getItem(LANG_KEY) || 'ar';
  applyLang(savedLang);
  window.YOUtoggleLang = function () {
    const next = document.documentElement.lang === 'en' ? 'ar' : 'en';
    localStorage.setItem(LANG_KEY, next);
    applyLang(next);
  };

  /* ---------- DOM READY ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    applyLang(document.documentElement.lang || savedLang);

    /* Scroll progress */
    const prog = document.querySelector('.scroll-progress');
    if (prog) {
      window.addEventListener('scroll', () => {
        const h = document.documentElement;
        const sc = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
        prog.style.width = sc + '%';
      }, { passive: true });
    }

    /* Reveal on scroll */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    /* Animated counters */
    const counters = document.querySelectorAll('[data-count]');
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.getAttribute('data-count');
        const dur = 1600, t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * target).toLocaleString(document.documentElement.lang === 'en' ? 'en' : 'ar-EG');
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString(document.documentElement.lang === 'en' ? 'en' : 'ar-EG') + (el.dataset.suffix || '');
        })(t0);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));

    /* Mobile nav */
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');
    if (toggle && menu) {
      const backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);

      const toggleMenu = () => {
        const isOpen = menu.classList.toggle('open');
        backdrop.classList.toggle('active', isOpen);
        toggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      };

      toggle.addEventListener('click', toggleMenu);
      backdrop.addEventListener('click', toggleMenu);
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        if(menu.classList.contains('open')) toggleMenu();
      }));
    }

    /* Header shrink */
    const header = document.querySelector('[data-header]');
    if (header) {
      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 40);
      }, { passive: true });
    }

    /* Generic form feedback */
    document.querySelectorAll('form[data-demo-form]').forEach(f => {
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = f.querySelector('[data-form-msg]');
        if (msg) {
          msg.hidden = false;
          msg.textContent = document.documentElement.lang === 'en'
            ? '✓ Thank you! Your submission was received (demo).'
            : '✓ شكراً لك! تم استلام طلبك بنجاح (نموذج تجريبي).';
        }
        f.reset();
      });
    });

    /* FAQ / accordion */
    document.querySelectorAll('[data-acc-trigger]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('[data-acc]');
        item && item.classList.toggle('open');
      });
    });

    /* Impact Calculator */
    const impactRange = document.querySelector('[data-impact-range]');
    const impactVal = document.querySelector('[data-impact-val]');
    const impactResult = document.querySelector('[data-impact-result]');
    if (impactRange && impactVal && impactResult) {
      const updateImpact = () => {
        const val = parseInt(impactRange.value, 10);
        impactVal.textContent = '$' + val;
        const baskets = Math.floor(val / 50);
        const textAR = baskets === 1 ? 'عائلة واحدة' : baskets === 2 ? 'عائلتين' : baskets <= 10 ? baskets + ' عائلات' : baskets + ' عائلة';
        const textEN = baskets === 1 ? '1 Family' : baskets + ' Families';
        impactResult.textContent = document.documentElement.lang === 'en' ? textEN : textAR;
        impactResult.setAttribute('data-ar', textAR);
        impactResult.setAttribute('data-en', textEN);
      };
      impactRange.addEventListener('input', updateImpact);
      updateImpact();
    }
  });

  /* ---------- ADMIN LOGIN SYSTEM (Enhanced) ---------- */
  window.openAdminLogin = function() {
    const modal = document.getElementById('adminLoginModal');
    if(modal) modal.classList.add('active');
  };
  
  window.closeAdminLogin = function() {
    const modal = document.getElementById('adminLoginModal');
    if(modal) {
      modal.classList.remove('active');
      const err = document.getElementById('loginError');
      if(err) err.hidden = true;
      const inp = document.getElementById('adminPasscode');
      if(inp) inp.value = '';
    }
  };

  window.attemptAdminLogin = function() {
    const inp = document.getElementById('adminPasscode');
    const err = document.getElementById('loginError');
    if(inp && inp.value === 'admin123') {
      sessionStorage.setItem('adminLoggedIn', 'true');
      window.location.href = 'admin/index.html';
    } else if(err) {
      err.hidden = false;
    }
  };

  // Close modal when clicking outside the card
  document.addEventListener('click', function(e) {
    const modal = document.getElementById('adminLoginModal');
    if(e.target === modal) {
      window.closeAdminLogin();
    }
  });

  window.adminLogout = function() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = '../index.html';
  };

  /* Protect Admin Pages */
  if(window.location.pathname.includes('/admin/')) {
    if(sessionStorage.getItem('adminLoggedIn') !== 'true') {
      window.location.href = '../index.html';
    }
  }

})();