// ================================================
// VERA BACKEND CONNECTION
// ================================================

const API_URL = 'https://vera-backend-ocap.onrender.com/api';

// Get stored token
let authToken = localStorage.getItem('vera_token');

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// REGISTER FUNCTION
async function registerUser(email, fullName, phoneNumber, country) {
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ 
                email, 
                full_name: fullName, 
                phone_number: phoneNumber, 
                country 
            }),
        });
        
        if (data.token) {
            authToken = data.token;
            localStorage.setItem('vera_token', data.token);
            return { success: true, user: data.user };
        }
        return { success: false, error: 'Registration failed' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// LOGIN FUNCTION - WITH PASSWORD
async function loginUser(email, password) {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (data.token) {
            authToken = data.token;
            localStorage.setItem('vera_token', data.token);
            return { success: true, user: data.user };
        }
        return { success: false, error: 'Login failed' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
// LOGOUT FUNCTION
function logoutUser() {
    authToken = null;
    localStorage.removeItem('vera_token');
    location.reload();
}

// GET USER PROFILE
async function getUserProfile() {
    try {
        const data = await apiCall('/user/profile');
        return data.user;
    } catch (error) {
        return null;
    }
}

// CHECK IF USER IS LOGGED IN
function isLoggedIn() {
    return authToken !== null;
}

// Make functions available globally
window.VERA_API = {
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    getProfile: getUserProfile,
    isLoggedIn: isLoggedIn,
};

// ================================================
// UI FUNCTIONS - Add these to your website
// ================================================

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

// Show register modal
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'flex';
}

// Close register modal
function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'none';
}

// Handle login form submission - WITH PASSWORD
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!password) {
        showToast('Please enter your password', 'error');
        return;
    }
    
    const result = await window.VERA_API.login(email, password);
    if (result.success) {
        closeLoginModal();
        showToast(`Welcome back, ${result.user.full_name}!`, 'success');
        window.location.reload();
    } else {
        showToast('Login failed: ' + result.error, 'error');
    }
}

// Handle register form submission - FIXED
async function handleRegister(event) {
    event.preventDefault();
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const country = document.getElementById('regCountry').value;
    
    const result = await window.VERA_API.register(email, fullName, phone, country);
    if (result.success) {
        closeRegisterModal();
        // Force reload to show dashboard
        window.location.reload();
    } else {
        alert('Registration failed: ' + result.error);
    }
}

// Load dashboard after login - COMPLETE VERSION
async function loadDashboard() {
    if (!window.VERA_API.isLoggedIn()) {
        // Make sure login button is visible when not logged in
        const loginBtn = document.getElementById('loginNavBtn');
        if (loginBtn) loginBtn.style.display = 'block';
        return;
    }
    
    try {
        const user = await window.VERA_API.getProfile();
        
        if (user) {
            // Hide login button when logged in
            const loginBtn = document.getElementById('loginNavBtn');
            if (loginBtn) loginBtn.style.display = 'none';
            
            const dashboard = document.getElementById('dashboardSection');
            
            if (dashboard) {
                dashboard.style.display = 'block';
                
                // Get subscription info (if any)
                let subscriptionHtml = '';
                try {
                    const subResponse = await fetch(`${API_URL}/subscriptions/current`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const subData = await subResponse.json();
                    if (subData.subscription) {
                        subscriptionHtml = `
                            <div class="glass-card" style="padding: 20px;">
                                <h4>💎 Current Plan</h4>
                                <p style="margin-top: 10px; font-size: 24px; font-weight: bold;">${subData.subscription.plan?.name || 'No plan'}</p>
                                <p style="color: var(--text-2);">Renews: ${new Date(subData.subscription.current_period_end).toLocaleDateString()}</p>
                            </div>
                        `;
                    } else {
                        subscriptionHtml = `
                            <div class="glass-card" style="padding: 20px;">
                                <h4>💎 No Active Plan</h4>
                                <p style="margin-top: 10px;">Choose a plan below</p>
                                <a href="#pricing" class="btn btn-primary" style="margin-top: 10px;">View Plans</a>
                            </div>
                        `;
                    }
                } catch (e) {
                    subscriptionHtml = `
                        <div class="glass-card" style="padding: 20px;">
                            <h4>💎 Current Plan</h4>
                            <p style="margin-top: 10px;">No active subscription</p>
                            <a href="#pricing" class="btn btn-primary" style="margin-top: 10px;">View Plans</a>
                        </div>
                    `;
                }
                document.getElementById('dashboardContent').innerHTML = `
    <div style="text-align: center;">
        <!-- Animated Logo -->
        <div class="hero-v-container" style="margin: 0 auto 30px; width: 100px;">
            <div class="hero-v-rings" style="transform: scale(0.6);">
                <div class="hero-ring ring-1"><div class="ring-dot"></div></div>
                <div class="hero-ring ring-2"><div class="ring-dot"></div></div>
                <div class="hero-ring ring-3"><div class="ring-dot"></div></div>
            </div>
            <div class="hero-v-glow"></div>
            <img src="https://images4.imagebam.com/8f/50/7c/ME1CZ8LY_o.png" alt="VERA" style="width: 60px; position: relative; z-index: 1;">
        </div>
        
        <!-- Welcome Message -->
        <h3 class="display-md" style="background: linear-gradient(135deg, var(--silver-2), var(--purple-3)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            Welcome back, ${user.full_name || 'User'}!
        </h3>
        <p style="color: var(--purple-3); margin-top: 10px; font-size: 14px;">${user.email}</p>
        
        <hr style="margin: 40px 0; border-color: rgba(255,255,255,0.08);">
        
        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
            ${subscriptionHtml}
            
            <div class="glass-card" style="padding: 24px; text-align: left; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(139,43,255,0.12); border: 1px solid rgba(139,43,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 24px;">
                        📅
                    </div>
                    <div>
                        <h4 style="color: var(--text-2); font-size: 12px; letter-spacing: 0.1em;">MEMBER SINCE</h4>
                        <p style="font-size: 18px; font-weight: 600; color: var(--silver-2);">${user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card" style="padding: 24px; text-align: left; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(139,43,255,0.12); border: 1px solid rgba(139,43,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 24px;">
                        📍
                    </div>
                    <div>
                        <h4 style="color: var(--text-2); font-size: 12px; letter-spacing: 0.1em;">LOCATION</h4>
                        <p style="font-size: 18px; font-weight: 600; color: var(--silver-2);">${user.country || 'Not set'}</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card" style="padding: 24px; text-align: left; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(139,43,255,0.12); border: 1px solid rgba(139,43,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 24px;">
                        📞
                    </div>
                    <div>
                        <h4 style="color: var(--text-2); font-size: 12px; letter-spacing: 0.1em;">PHONE</h4>
                        <p style="font-size: 18px; font-weight: 600; color: var(--silver-2);">${user.phone_number || 'Not set'}</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card" style="padding: 24px; text-align: left; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.2); display: flex; align-items: center; justify-content: center; font-size: 24px;">
                        🟢
                    </div>
                    <div>
                        <h4 style="color: var(--text-2); font-size: 12px; letter-spacing: 0.1em;">STATUS</h4>
                        <p style="font-size: 18px; font-weight: 600; color: #22c55e;">Active</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card" style="padding: 24px; text-align: left; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(139,43,255,0.12); border: 1px solid rgba(139,43,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 24px;">
                        🔑
                    </div>
                    <div>
                        <h4 style="color: var(--text-2); font-size: 12px; letter-spacing: 0.1em;">ACCOUNT ID</h4>
                        <p style="font-size: 14px; font-weight: 500; color: var(--silver-2); font-family: monospace;">${user.id.substring(0, 12)}...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Logout Button -->
        <button onclick="window.VERA_API.logout()" class="btn btn-ghost" style="margin-top: 20px; padding: 12px 32px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
        </button>
    </div>
`;
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (window.VERA_API.isLoggedIn()) {
        await loadDashboard();
    }
});

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

  // Force check login status on every page load
(function checkLoginOnLoad() {
    const token = localStorage.getItem('vera_token');
    if (token) {
        authToken = token;
        // Don't auto-show dashboard, let the main DOMContentLoaded handle it
    }
})();
})();
