document.addEventListener('DOMContentLoaded', function() {
    // Enhanced header scroll effect
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });

    // Enhanced slideshow functionality
    const slides = document.querySelectorAll('.slide');
    const slideNavContainer = document.querySelector('.slideshow-nav');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    let currentSlideIndex = 0;
    let slideInterval;

    // Create navigation dots
    slides.forEach((_, index) => {
        const navDot = document.createElement('button');
        navDot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        navDot.addEventListener('click', () => goToSlide(index));
        slideNavContainer.appendChild(navDot);
    });

    const updateNavDots = () => {
        const navDots = slideNavContainer.querySelectorAll('button');
        navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlideIndex);
        });
    };

    const goToSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
        currentSlideIndex = index;
        updateNavDots();
    };

    const nextSlide = () => {
        const newIndex = (currentSlideIndex + 1) % slides.length;
        goToSlide(newIndex);
    };

    const prevSlide = () => {
        const newIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        goToSlide(newIndex);
    };

    // Event listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    // Auto-advance slides
    const startInterval = () => {
        slideInterval = setInterval(nextSlide, 6000);
    };

    const resetInterval = () => {
        clearInterval(slideInterval);
        startInterval();
    };

    // Initialize
    updateNavDots();
    startInterval();

    // Pause slideshow on hover
    const slideshowContainer = document.querySelector('.slideshow-container');
    slideshowContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
    slideshowContainer.addEventListener('mouseleave', startInterval);

    // Enhanced smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe service cards for animation
    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(card);
    });

    // Counter animation for stats
    const animateCounters = () => {
        const counters = document.querySelectorAll('.stat-number');
        const duration = 2000; // 2 seconds

        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            const increment = target / (duration / 16); // 60 FPS
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current) + '+';
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + '+';
                }
            };

            updateCounter();
        });
    };

    // Trigger counter animation when hero section is visible
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    heroObserver.observe(document.querySelector('.hero'));

    // Add loading states for better UX
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    // Keyboard navigation for slideshow
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetInterval();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetInterval();
        }
    });

    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;

    slideshowContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    slideshowContainer.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    const handleSwipe = () => {
        const minSwipeDistance = 50;
        const distance = startX - endX;

        if (Math.abs(distance) > minSwipeDistance) {
            if (distance > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            resetInterval();
        }
    };

    // Performance optimization: Lazy load background images
    const lazyLoadImages = () => {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const slide = entry.target;
                    const bgImage = slide.style.backgroundImage;
                    if (bgImage) {
                        const img = new Image();
                        img.onload = () => {
                            slide.style.backgroundImage = bgImage;
                        };
                        img.src = bgImage.slice(5, -2); // Remove url(" and ")
                    }
                    imageObserver.unobserve(slide);
                }
            });
        });

        slides.forEach(slide => imageObserver.observe(slide));
    };

    // Initialize lazy loading
    lazyLoadImages();

    // Add accessibility improvements
    const addAccessibilityFeatures = () => {
        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main content ID
        const hero = document.querySelector('.hero');
        hero.id = 'main-content';
        hero.setAttribute('tabindex', '-1');
    };

    addAccessibilityFeatures();
});

// Service Worker for caching (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
/**
 * Yokohama-Minerva Authentication Protection System
 * Include this script in pages that require authentication
 */

class AuthProtection {
    constructor(options = {}) {
        this.requiredRole = options.requiredRole || null;
        this.loginPage = options.loginPage || '../admin/login/login.html';
        this.redirectDelay = options.redirectDelay || 0;
        this.showAlert = options.showAlert !== false;
        this.init();
    }

    init() {
        // Check authentication on page load
        this.checkAuth();
        
        // Set up activity tracking for auto-logout
        this.setupActivityTracking();
        
        // Add logout functionality to logout buttons
        this.setupLogoutButtons();
        
        // Add user info display
        this.displayUserInfo();
    }

    checkAuth() {
        const stored = sessionStorage.getItem('yokohama_auth');
        
        if (!stored) {
            this.redirectToLogin('Please login to access this page.');
            return false;
        }

        try {
            const user = JSON.parse(stored);
            
            // Check if specific role is required
            if (this.requiredRole && user.role !== this.requiredRole) {
                this.redirectToLogin(`Access denied. This page requires ${this.requiredRole} privileges.`);
                return false;
            }

            // Check if session is expired (24 hours)
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursSinceLogin > 24) {
                sessionStorage.removeItem('yokohama_auth');
                this.redirectToLogin('Session expired. Please login again.');
                return false;
            }

            this.currentUser = user;
            return true;
        } catch (error) {
            console.error('Auth check error:', error);
            sessionStorage.removeItem('yokohama_auth');
            this.redirectToLogin('Invalid session. Please login again.');
            return false;
        }
    }

    redirectToLogin(message = '') {
        if (this.showAlert && message) {
            alert(message);
        }
        
        setTimeout(() => {
            window.location.href = this.loginPage;
        }, this.redirectDelay);
    }

    setupActivityTracking() {
        let inactivityTimer;
        const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (sessionStorage.getItem('yokohama_auth')) {
                    sessionStorage.removeItem('yokohama_auth');
                    this.redirectToLogin('Session expired due to inactivity.');
                }
            }, INACTIVITY_TIMEOUT);
        };

        // Track user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        // Initialize timer
        resetTimer();
    }

    setupLogoutButtons() {
        // Find all logout buttons/links
        const logoutElements = document.querySelectorAll('[data-logout], .logout-btn, #logout-btn, a[href*="logout"]');
        
        logoutElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('yokohama_auth');
            this.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = this.loginPage;
            }, 1000);
        }
    }

    displayUserInfo() {
        if (!this.currentUser) return;

        // Find user info containers
        const userInfoElements = document.querySelectorAll('.user-name, [data-user-info]');
        userInfoElements.forEach(element => {
            element.textContent = this.currentUser.username;
        });

        // Update role-specific content
        const roleElements = document.querySelectorAll('[data-user-role]');
        roleElements.forEach(element => {
            element.textContent = this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `auth-notification auth-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Utility methods for role checking
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    isAdmin() {
        return this.hasRole('admin');
    }

    isStaff() {
        return this.hasRole('staff');
    }

    isCustomer() {
        return this.hasRole('customer');
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }
}

// Convenience functions for quick setup
window.protectPage = (requiredRole = null, options = {}) => {
    return new AuthProtection({
        requiredRole,
        ...options
    });
};

window.requireAdmin = (options = {}) => {
    return window.protectPage('admin', options);
};

window.requireStaff = (options = {}) => {
    return window.protectPage('staff', options);
};

window.requireCustomer = (options = {}) => {
    return window.protectPage('customer', options);
};

// Auto-protect page if data-protect attribute is found
document.addEventListener('DOMContentLoaded', () => {
    const protectElement = document.querySelector('[data-protect]');
    if (protectElement) {
        const requiredRole = protectElement.getAttribute('data-protect');
        window.protectPage(requiredRole === 'true' ? null : requiredRole);
    }
});

class NavigationAuthManager {
    constructor() {
        this.authStatus = document.getElementById('auth-status');
        this.init();
    }

    init() {
        this.updateAuthStatus();
        this.setupEventListeners();
        
        // Check auth status every 5 seconds
        setInterval(() => this.updateAuthStatus(), 5000);
    }

    updateAuthStatus() {
        const auth = sessionStorage.getItem('yokohama_auth');
        
        if (auth) {
            try {
                const user = JSON.parse(auth);
                this.showLoggedInState(user);
            } catch (error) {
                console.error('Error parsing auth data:', error);
                sessionStorage.removeItem('yokohama_auth');
                this.showLoggedOutState();
            }
        } else {
            this.showLoggedOutState();
        }
    }

    showLoggedInState(user) {
        if (!this.authStatus) return;
        
        this.authStatus.className = 'auth-status logged-in';
        this.authStatus.innerHTML = `
            <div class="auth-dropdown">
                <div class="user-greeting" onclick="authNav.toggleDropdown()">
                    <div class="user-icon">
                        ${this.getUserIcon(user.role)}
                    </div>
                    <span>Hi, ${user.username}</span>
                    <i class="fas fa-chevron-down" style="font-size: 0.8rem; margin-left: 0.25rem;"></i>
                </div>
                <div class="dropdown-menu" id="user-dropdown">
                    ${this.getRoleSpecificLinks(user.role)}
                    <div class="divider"></div>
                    <a href="#" onclick="authNav.logout()" class="logout-action">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </a>
                </div>
            </div>
        `;

        // Update user info in dashboard header if present
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => el.textContent = user.username);
        
        const userRoleElements = document.querySelectorAll('[data-user-role]');
        userRoleElements.forEach(el => el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1));
    }

    showLoggedOutState() {
        if (!this.authStatus) return;
        
        this.authStatus.className = 'auth-status logged-out';
        this.authStatus.innerHTML = `
            <a href="../admin/login/login.html" class="login-link">
                <i class="fas fa-user"></i>
                Login
            </a>
        `;
    }


    getRoleSpecificLinks(role) {
        const links = {
            customer: `
                <a href="homepage.html">
                    <i class="fas fa-home"></i>
                    Home
                </a>
                <a href="products.html">
                    <i class="fas fa-cog"></i>
                    Services
                </a>
                <a href="contact.html">
                    <i class="fas fa-phone"></i>
                    Contact
                </a>
            `,
            staff: `
                <a href="tracker.html">
                    <i class="fas fa-clipboard-list"></i>
                    Service Tracker
                </a>
                <a href="homepage.html">
                    <i class="fas fa-home"></i>
                    Home
                </a>
            `,
            admin: `
                <a href="dashboard.html">
                    <i class="fas fa-chart-bar"></i>
                    Dashboard
                </a>
                <a href="tracker.html">
                    <i class="fas fa-clipboard-list"></i>
                    Service Tracker
                </a>
                <a href="homepage.html">
                    <i class="fas fa-home"></i>
                    Home
                </a>
            `
        };
        return links[role] || links.customer;
    }

    toggleDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    setupEventListeners() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('user-dropdown');
            const authDropdown = e.target.closest('.auth-dropdown');
            
            if (dropdown && !authDropdown) {
                dropdown.classList.remove('show');
            }
        });

        // Setup logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.logout-btn, [data-logout]') || e.target.closest('.logout-btn, [data-logout]')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('yokohama_auth');
            this.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `nav-notification nav-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize navigation auth manager
let authNav;
document.addEventListener('DOMContentLoaded', () => {
    authNav = new NavigationAuthManager();
});

// Global functions for convenience
window.toggleDropdown = () => authNav?.toggleDropdown();
window.navLogout = () => authNav?.logout();