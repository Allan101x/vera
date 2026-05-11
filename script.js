// ================================================
// VERA — Main JavaScript
// Custom cursor, navbar, particles, scroll reveal, smooth scroll, active nav
// ================================================

(function() {
  'use strict';

  // ---------- CUSTOM CURSOR ----------
  const cursor = document.getElementById('vera-cursor');
  const ring = document.getElementById('vera-cursor-ring');
  
  if (cursor && ring && !('ontouchstart' in window)) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    }, { passive: true });
    
    function animateRing() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();
    
    // Expand cursor on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .sim-card, .feat-card, .plan-card, .glass-card, .nav-link, .btn');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('expanded');
        ring.classList.add('expanded');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('expanded');
        ring.classList.remove('expanded');
      });
    });
  } else if (cursor && ring) {
    cursor.style.display = 'none';
    ring.style.display = 'none';
  }

  // ---------- NAVBAR SCROLL EFFECT ----------
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ---------- HAMBURGER MENU ----------
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  
  window.closeMobileMenu = function() {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (hamburger) hamburger.classList.remove('open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // ---------- PARTICLES BACKGROUND ----------
  const particlesWrap = document.getElementById('heroParticles');
  if (particlesWrap) {
    const particleCount = window.innerWidth < 768 ? 20 : 40;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 3 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = (Math.random() * 8 + 6) + 's';
      const delay = (Math.random() * -8) + 's';
      const dx = (Math.random() - 0.5) * 60 + 'px';
      const dy = (Math.random() - 0.5) * 60 + 'px';
      const alpha = Math.random() * 0.3 + 0.05;
      particle.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${x}%; top: ${y}%;
        background: rgba(139,43,255, ${alpha});
        box-shadow: 0 0 ${size * 4}px rgba(139,43,255, ${alpha * 2});
        --dur: ${duration}; --delay: ${delay}; --dx: ${dx}; --dy: ${dy};
      `;
      particlesWrap.appendChild(particle);
    }
  }

  // ---------- SCROLL REVEAL (Intersection Observer) ----------
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  revealElements.forEach(el => revealObserver.observe(el));

  // ---------- SMOOTH SCROLL FOR ANCHOR LINKS ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          closeMobileMenu();
        }
      }
    });
  });

  // ---------- ACTIVE NAVIGATION HIGHLIGHT ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (sections.length && navLinks.length) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.style.color = '#c084fc';
            }
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    
    sections.forEach(section => activeObserver.observe(section));
  }

  // ---------- ADD METER GLOW (fix for SVG animation) ----------
  const meterFill = document.querySelector('.meter-fill');
  if (meterFill) {
    // Ensure the meter animation runs properly
    meterFill.style.strokeDashoffset = '70';
  }

  // ---------- CONNECTION LINES CONTINUOUS ANIMATION ----------
  const connLines = document.querySelectorAll('.conn-line');
  if (connLines.length) {
    // already animated via CSS, just ensure they exist
  }

  console.log('VERA — website initialized');
})();
