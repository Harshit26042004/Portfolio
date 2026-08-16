(function() {
  "use strict";

  /* ==================================================================
     THEME TOGGLE (Dark / Light)
     ================================================================== */
  function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.documentElement;

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);

      const icon = toggleBtn.querySelector('i');
      if (theme === 'dark') {
        icon.classList.remove('bi-moon');
        icon.classList.add('bi-sun');
      } else {
        icon.classList.remove('bi-sun');
        icon.classList.add('bi-moon');
      }
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /* ==================================================================
     SCROLL SCROLLED CLASS
     ================================================================== */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /* ==================================================================
     MOBILE NAV TOGGLE
     ================================================================== */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });
  });

  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /* ==================================================================
     SCROLL TOP BUTTON
     ================================================================== */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /* ==================================================================
     AOS (Animate On Scroll)
     ================================================================== */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /* ==================================================================
     GLIGHTBOX
     ================================================================== */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /* ==================================================================
     NAV SCROLLSPY
     ================================================================== */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    });
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /* ==================================================================
     PRETEXT PRELOADER
     ================================================================== */
  function initPreText() {
    const pretextEl = document.querySelector('.pretext');
    const overlay = document.querySelector('.pretext-overlay');
    if (!pretextEl || !overlay) return;

    const pretext = new PreText({
      target: pretextEl,
      speed: 55,
      delay: 150,
      onComplete: function() {
        setTimeout(function() {
          overlay.classList.add('fade-out');
          setTimeout(function() {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
          }, 800);
        }, 400);
      }
    });

    document.body.style.overflow = 'hidden';
  }

  /* ==================================================================
     DECRYPTED TEXT
     ================================================================== */
  function initDecryptedText() {
    document.querySelectorAll('.decrypted-text').forEach(el => {
      new DecryptedText(el, {
        text: el.dataset.text || el.textContent,
        speed: parseInt(el.dataset.speed) || 50,
        animateOn: el.dataset.animateOn || 'hover'
      });
    });
  }

  /* ==================================================================
     TEXT PRESSURE
     ================================================================== */
  function initTextPressure() {
    document.querySelectorAll('.text-pressure').forEach(el => {
      new TextPressure(el, {
        minWeight: 300,
        maxWeight: 700,
        duration: 300
      });
    });
  }

  /* ==================================================================
     MAGNET LINES
     ================================================================== */
  function initMagnetLines() {
    MagnetLines.initAll();
  }

  /* ==================================================================
     LANYARD CARDS
     ================================================================== */
  function initLanyard() {
    Lanyard.initAll();
  }

  /* ==================================================================
     INFINITE MENU
     ================================================================== */
  function initInfiniteMenu() {
    InfiniteMenu.initAll();
  }

  /* ==================================================================
     PARTICLE TYPOGRAPHY
     ================================================================== */
  function initParticleTypography() {
    ParticleTypography.initAll();
  }

  /* ==================================================================
     CURSOR LENS (Brutalism Mode)
     ================================================================== */
  function initCursorLens() {
    if (typeof CursorLens !== 'undefined') {
      CursorLens.init();
    }
  }

  /* ==================================================================
     HERO PARALLAX MOUSE TRACKING
     ================================================================== */
  function initMouseTracking() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    hero.addEventListener('mousemove', function(e) {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      hero.style.setProperty('--mouse-x', (x / rect.width) * 100 + '%');
      hero.style.setProperty('--mouse-y', (y / rect.height) * 100 + '%');
    });

    hero.addEventListener('mouseleave', function() {
      hero.style.setProperty('--mouse-x', '50%');
      hero.style.setProperty('--mouse-y', '50%');
    });
  }

  /* ==================================================================
     PARALLAX & SCROLL ANIMATIONS
     ================================================================== */
  function initScrollAnimations() {
    const scrollElements = document.querySelectorAll('[data-scroll]');
    if (scrollElements.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, { threshold: 0.1 });

      scrollElements.forEach(el => observer.observe(el));
    }

    const hero = document.querySelector('.hero');
    if (hero) {
      let ticking = false;
      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const heroRect = hero.getBoundingClientRect();
            const heroTop = heroRect.top + window.scrollY;

            const layers = hero.querySelectorAll('[data-parallax-speed]');
            layers.forEach(layer => {
              const speed = parseFloat(layer.dataset.parallaxSpeed);
              const y = (window.scrollY - heroTop) * speed;
              layer.style.transform = `translateY(${y}px)`;
            });

            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener('scroll', onScroll);
    }

    /* Scroll progress bar is handled in initScrollProgress() */
  }

  /* ==================================================================
     HERO CANVAS PARTICLE BACKGROUND
     ================================================================== */
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    let particles = [];
    let width, height;
    let mouse = { x: null, y: null, vx: 0, vy: 0 };

    function resize() {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    }

    function Particle() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = 0.8 + Math.random() * 1.2;
      this.opacity = 0.3 + Math.random() * 0.3;
    }

    function initParticles() {
      particles = [];
      const density = (width * height) / 12000;
      for (let i = 0; i < density; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      const maxDist = 120;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const opacity = 0.12 * (1 - dist / maxDist);
            const color = getComputedStyle(document.documentElement)
              .getPropertyValue('--muted-color').trim() || '#6b7280';
            ctx.strokeStyle = color;
            ctx.globalAlpha = opacity;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }

        if (mouse.x !== null) {
          const dx = particles[a].x - mouse.x;
          const dy = particles[a].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist * 1.2) {
            const opacity = 0.25 * (1 - dist / (maxDist * 1.2));
            ctx.strokeStyle = getComputedStyle(document.documentElement)
              .getPropertyValue('--accent-color').trim() || '#e87532';
            ctx.globalAlpha = opacity;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    function animate() {
      if (!canvas.isConnected) return;

      ctx.clearRect(0, 0, width, height);

      var particleColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-color').trim() || '#e87532';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = particleColor;
        ctx.globalAlpha = 0.3 + Math.random() * 0.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      connectParticles();
      requestAnimationFrame(animate);
    }

    container.parentElement.addEventListener('mousemove', function(e) {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.vx = e.movementX || 0;
      mouse.vy = e.movementY || 0;
    });

    container.parentElement.addEventListener('mouseleave', function() {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', function() {
      resize();
    });

    window.addEventListener('load', function() {
      resize();
    });

    resize();
    animate();
  }

  /* ==================================================================
     CORRECT SCROLL POSITION ON HASH LINKS
     ================================================================== */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /* ==================================================================
     COPYRIGHT YEAR
     ================================================================== */
  function initCopyrightYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ==================================================================
     EXCAVATION TIMELINE (3D Scroll Tilt)
     ================================================================== */
  function initExcavationTimeline() {
    const timelineEl = document.querySelector('[data-excavation]');
    if (!timelineEl) return;

    const layers = timelineEl.querySelectorAll('.excavation-layer');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('excavation-visible');
          entry.target.classList.add('excavation-active');
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -80px 0px' });

    layers.forEach(layer => observer.observe(layer));

    /* Time Machine scroll-driven effects: card rotateY, year parallax + depth blur */
    if (!isMobile && !reduceMotion) {
      let ticking = false;
      const applyTilt = () => {
        const vh = window.innerHeight;
        layers.forEach(layer => {
          const content = layer.querySelector('.excavation-content');
          const year = layer.querySelector('.excavation-year');
          if (!content) return;
          const rect = layer.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const ratio = (center - vh / 2) / vh;
          const tiltY = Math.max(-12, Math.min(12, ratio * 18));
          content.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
          if (year) {
            const parallax = ratio * 90;
            const depth = Math.abs(ratio);
            year.style.transform = 'translate(-50%, calc(-50% + ' + parallax.toFixed(1) + 'px))';
            year.style.filter = depth > 0.22 ? 'blur(' + Math.min(5, (depth - 0.22) * 14).toFixed(2) + 'px)' : 'blur(0px)';
            year.style.opacity = depth > 0.22 ? String(0.16 - (depth - 0.22) * 0.3) : '0.16';
          }
        });
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(applyTilt);
          ticking = true;
        }
      }, { passive: true });
      applyTilt();
    }

    /* Dust particle effect on scroll */
    let dustTimeout;
    window.addEventListener('scroll', () => {
      if (dustTimeout) clearTimeout(dustTimeout);
      dustTimeout = setTimeout(() => {
        createDustParticles(timelineEl);
      }, 100);
    });

    function createDustParticles(container) {
      const rect = container.getBoundingClientRect();
      const activeLayer = container.querySelector('.excavation-active');
      if (!activeLayer) return;

      const layerRect = activeLayer.getBoundingClientRect();
      const centerX = layerRect.left + layerRect.width / 2;
      const centerY = layerRect.bottom;

      for (let i = 0; i < 5; i++) {
        const dust = document.createElement('div');
        dust.className = 'excavation-dust';
        dust.style.left = (centerX + (Math.random() - 0.5) * 60) + 'px';
        dust.style.top = (centerY + Math.random() * 20) + 'px';
        dust.style.opacity = (0.3 + Math.random() * 0.2);
        container.appendChild(dust);

        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 30;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        let opacity = 0.5;
        const animateDust = () => {
          opacity -= 0.02;
          dust.style.opacity = opacity;
          dust.style.transform = `translate(${dx}px, ${dy}px)`;
          if (opacity > 0) {
            requestAnimationFrame(animateDust);
          } else {
            if (dust.parentNode) dust.remove();
          }
        };
        requestAnimationFrame(animateDust);
      }
    }
  }

  /* ==================================================================
     RADAR CHART (SKILLS)
     ================================================================== */
  function initRadarChart() {
    if (typeof RadarChart !== 'undefined') {
      RadarChart.initAll();
    }
  }

  /* ==================================================================
     SPLIT TEXT LINE ANIMATION
     ================================================================== */
  function initSplitTextLine() {
    if (typeof SplitTextLine !== 'undefined') {
      SplitTextLine.initWithObserver();
    }
  }

  /* ==================================================================
     SCROLL PROGRESS BAR WITH SECTION INDICATOR
     ================================================================== */
  function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    const sections = document.querySelectorAll('section[id]');

    if (progressBar) {
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrolled = (scrollTop / docHeight) * 100;
        progressBar.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
      });
    }

    /* Section label on scroll progress */
    let scrollTimeout;
    let lastActiveSection = '';

    function updateSectionIndicator() {
      const navLinks = document.querySelectorAll('.navmenu a');
      if (!navLinks.length) return;

      let currentIndex = sections.length - 1;
      sections.forEach((section, index) => {
        const sectionTop = section.offsetTop - 200;
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          currentIndex = index;
        }
      });

      const currentSection = sections[currentIndex];
      if (currentSection && currentSection.id !== lastActiveSection) {
        lastActiveSection = currentSection.id;
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.navmenu a[href="#${currentSection.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateSectionIndicator();
          ticking = false;
        });
        ticking = true;
      }
    });

    updateSectionIndicator();
  }

  /* ==================================================================
     SECTION VISIBILITY (Dimensional Portal Transitions)
     ================================================================== */
  function initSectionTransitions() {
    const sections = document.querySelectorAll('section.section');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          entry.target.classList.add('section-entered');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(section => observer.observe(section));
  }

  /* ==================================================================
     INITIALIZATION
     ================================================================== */
  function initAll() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    initThemeToggle();
    initPreText();
    initDecryptedText();
    initTextPressure();

    if (!isMobile && !isTouch) {
      initMagnetLines();
      initCursorLens();
      initMouseTracking();
    }

    initLanyard();
    initInfiniteMenu();
    initRadarChart();
    initParticleTypography();
    initHeroCanvas();
    initScrollAnimations();
    initSplitTextLine();
    initSectionTransitions();
    initExcavationTimeline();
    initScrollProgress();
    initCopyrightYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();