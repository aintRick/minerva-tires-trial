// About Page JavaScript - Aligned with Homepage Design System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeHeader();
    initializeScrollEffects();
    initializeAnimations();
    initializeCounters();
    initializeMobileMenu();
    initializeBackToTop();
    initializeAccessibility();
    
    // Load data first
    loadContactData().then(data => {
        window.contactInfo = data.contactInfo;
        window.businessHours = data.businessHours;
        
        // Populate UI with loaded data
        populateContactInfo(data.contactInfo);
        populateBusinessHours(data.businessHours);
        populateFooter(data.contactInfo);
    }).catch(error => {
        console.error('Failed to load data:', error);
        showUserFeedback('Unable to load contact information. Please refresh the page.', 'error');
    });
    
    // Initialize advanced features
    initializeAdvancedAnimations();
    initializePerformanceOptimizations();
});

function initializeHeader() {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('nav a');
    let lastScroll = 0;

    // Enhanced header scroll effect
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    navLinks.forEach(link => {
        // Add hover effects
        link.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        link.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
}

// Mobile Menu Functionality - Aligned with Homepage
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = 'hidden';
            } else {
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
                document.body.style.overflow = '';
            }
        });

        // Close mobile menu when clicking on links
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
                
                // Reset hamburger animation
                const spans = mobileMenuBtn.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('nav') && !e.target.closest('.mobile-menu-btn')) {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
                
                // Reset hamburger animation
                const spans = mobileMenuBtn.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            }
        });
    }
}

// Scroll Effects and Parallax
function initializeScrollEffects() {
    let isScrolling = false;
    
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            window.requestAnimationFrame(function() {
                handleScrollEffects();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
    
    function handleScrollEffects() {
        const scrollTop = window.pageYOffset;
        
        // Parallax effect for hero image
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            const scrollSpeed = scrollTop * 0.3;
            heroImage.style.transform = `scale(1.1) translateY(${scrollSpeed}px)`;
        }
    }
}

// Intersection Observer for Animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Stagger animation for child elements
                const children = entry.target.children;
                if (children.length > 0) {
                    Array.from(children).forEach((child, index) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .fade-in, .fade-in-up');
    animatedElements.forEach(el => observer.observe(el));
}

// Statistics Counter Animation
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const countAnimation = (element) => {
        const target = parseInt(element.textContent.replace(/\D/g, ''));
        const duration = 2000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(progress * target);
            element.textContent = current.toLocaleString() + (element.textContent.includes('+') ? '+' : '');
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countAnimation(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// Back to Top Button Functionality
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Accessibility Features
function initializeAccessibility() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('main-content');
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Keyboard navigation for mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                mobileMenuBtn.click();
            }
        });
        
        // Focus management for mobile menu
        const menuLinks = navMenu.querySelectorAll('a');
        menuLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    mobileMenuBtn.focus();
                } else if (e.key === 'Tab' && index === menuLinks.length - 1 && !e.shiftKey) {
                    // Close menu when tabbing out of last item
                    setTimeout(() => {
                        navMenu.classList.remove('active');
                        mobileMenuBtn.classList.remove('active');
                    }, 100);
                }
            });
        });
    }
    
    // High contrast mode detection
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
    }
    
    // Reduced motion detection
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduce-motion');
    }
}

// Enhanced Data Loading Functions
async function loadContactData() {
    try {
        const response = await fetch('about.php');
        const data = await response.json();
        
        if (data.success) {
            return {
                contactInfo: data.contact_info,
                businessHours: data.business_hours
            };
        } else {
            throw new Error(data.error || 'Failed to load contact data');
        }
    } catch (error) {
        console.error('Error loading contact data:', error);
        return getFallbackData();
    }
}

function getFallbackData() {
    return {
        contactInfo: {
            email: 'minervatires@gmail.com',
            phone_globe: '0905.489.9763',
            phone_smart: '0968.622.2481',
            phone_landline: '(049)545.1701 / (049)557.882',
            address: 'National Highway Brgy Real, Calamba, Philippines'
        },
        businessHours: [
            { day: 'Monday', open_time: '08:00:00', close_time: '18:00:00', is_closed: 0 },
            { day: 'Tuesday', open_time: '08:00:00', close_time: '18:00:00', is_closed: 0 },
            { day: 'Wednesday', open_time: '08:00:00', close_time: '18:00:00', is_closed: 0 },
            { day: 'Thursday', open_time: '08:00:00', close_time: '18:00:00', is_closed: 0 },
            { day: 'Friday', open_time: '08:00:00', close_time: '18:00:00', is_closed: 0 },
            { day: 'Saturday', open_time: '08:00:00', close_time: '18:00:00', is_closed: 0 },
            { day: 'Sunday', open_time: null, close_time: null, is_closed: 1 }
        ]
    };
}

// Enhanced Animation System
function initializeAdvancedAnimations() {
    // Parallax effect for multiple elements
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1); // Different speeds for layered effect
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
    
    // Staggered card animations
    const cards = document.querySelectorAll('.story-card, .mission-card, .values-card, .contact-card, .hours-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Add hover interaction sounds (if audio is enabled)
        card.addEventListener('mouseenter', () => {
            // Subtle scale animation
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Performance Optimization
function initializePerformanceOptimizations() {
    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Debounced scroll handler
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            // Perform scroll-dependent operations
            updateScrollProgress();
        }, 10);
    });
}

function updateScrollProgress() {
    const scrollProgress = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    // Update progress indicator if it exists
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        progressBar.style.width = `${scrollProgress}%`;
    }
}

// Error Handling and User Feedback
function showUserFeedback(message, type = 'info') {
    // Remove existing feedback messages
    const existingFeedback = document.querySelectorAll('.user-feedback');
    existingFeedback.forEach(el => el.remove());
    
    const feedback = document.createElement('div');
    feedback.className = `user-feedback ${type}`;
    feedback.innerHTML = `
        <div class="feedback-content">
            <i class="fas ${getFeedbackIcon(type)}"></i>
            <span>${message}</span>
            <button class="feedback-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('.user-feedback-styles')) {
        const styles = document.createElement('style');
        styles.className = 'user-feedback-styles';
        styles.textContent = `
            .user-feedback {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 10000;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
                max-width: 400px;
                border-left: 4px solid var(--primary-red);
            }
            .user-feedback.show {
                transform: translateX(0);
                opacity: 1;
            }
            .user-feedback.error {
                border-left-color: #dc3545;
            }
            .user-feedback.success {
                border-left-color: #28a745;
            }
            .user-feedback.warning {
                border-left-color: #ffc107;
            }
            .feedback-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
            }
            .feedback-content i:first-child {
                color: var(--primary-red);
            }
            .user-feedback.error .feedback-content i:first-child {
                color: #dc3545;
            }
            .user-feedback.success .feedback-content i:first-child {
                color: #28a745;
            }
            .user-feedback.warning .feedback-content i:first-child {
                color: #ffc107;
            }
            .feedback-close {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                margin-left: auto;
            }
            .feedback-close:hover {
                color: #333;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(feedback);
    
    // Show feedback
    setTimeout(() => {
        feedback.classList.add('show');
    }, 100);
    
    // Add close functionality
    const closeBtn = feedback.querySelector('.feedback-close');
    closeBtn.addEventListener('click', () => {
        feedback.classList.remove('show');
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (feedback.classList.contains('show')) {
            feedback.classList.remove('show');
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }
    }, 5000);
}

function getFeedbackIcon(type) {
    switch (type) {
        case 'error': return 'fa-exclamation-triangle';
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-circle';
        default: return 'fa-info-circle';
    }
}

// Utility Functions
function formatTime(timeString) {
    if (!timeString) return '';
    
    const time = new Date('1970-01-01T' + timeString);
    return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function populateContactInfo(contactInfo) {
    const contactDetails = document.getElementById('contact-details');
    if (!contactDetails || !contactInfo) return;
    
    contactDetails.innerHTML = `
        <p><strong>Email:</strong> ${contactInfo.email}</p>
        <div class="phone-numbers">
            <p><strong>Contact Numbers:</strong></p>
            <ul>
                <li><i class="fas fa-globe"></i> Globe: ${contactInfo.phone_globe}</li>
                <li><i class="fas fa-mobile-alt"></i> Smart: ${contactInfo.phone_smart}</li>
                <li><i class="fas fa-phone"></i> Landline: ${contactInfo.phone_landline}</li>
            </ul>
        </div>
        <div class="address">
            <i class="fas fa-map-marker-alt"></i>
            <span><strong>Address:</strong> ${contactInfo.address}</span>
        </div>
    `;
}

function populateBusinessHours(businessHours) {
    const hoursGrid = document.getElementById('hours-grid');
    if (!hoursGrid || !businessHours) return;
    
    let html = '';
    businessHours.forEach(dayInfo => {
        const isClosed = dayInfo.is_closed == 1 || !dayInfo.open_time || !dayInfo.close_time;
        const closedClass = isClosed ? 'closed' : '';
        
        let timeDisplay = 'CLOSED';
        if (!isClosed) {
            const openTime = formatTime(dayInfo.open_time);
            const closeTime = formatTime(dayInfo.close_time);
            timeDisplay = `${openTime} - ${closeTime}`;
        }
        
        html += `
            <div class="day-time ${closedClass}">
                <span class="day">${dayInfo.day}</span>
                <span class="time">${timeDisplay}</span>
            </div>
        `;
    });
    
    hoursGrid.innerHTML = html;
}

function populateFooter(contactInfo) {
    if (!contactInfo) return;
    
    const footerEmail = document.getElementById('footer-email');
    const footerPhone = document.getElementById('footer-phone');
    const footerAddress = document.getElementById('footer-address');
    
    if (footerEmail) footerEmail.textContent = contactInfo.email;
    if (footerPhone) footerPhone.textContent = contactInfo.phone_globe;
    if (footerAddress) footerAddress.textContent = contactInfo.address;
}

// Scroll indicator functionality
function initializeScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const targetSection = document.querySelector('.company-profile');
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// Initialize smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Contact form validation (if contact form exists)
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!data.name || !data.email || !data.message) {
            showUserFeedback('Please fill in all required fields.', 'error');
            return;
        }
        
        if (!isValidEmail(data.email)) {
            showUserFeedback('Please enter a valid email address.', 'error');
            return;
        }
        
        // Submit form data (would normally go to server)
        submitContactForm(data);
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function submitContactForm(data) {
    // Simulate form submission
    showUserFeedback('Thank you for your message! We\'ll get back to you soon.', 'success');
    
    // Reset form
    const form = document.getElementById('contact-form');
    if (form) {
        form.reset();
    }
}

// Image error handling
function initializeImageErrorHandling() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Set fallback image or hide broken image
            this.style.display = 'none';
            console.warn('Failed to load image:', this.src);
        });
        
        img.addEventListener('load', function() {
            // Fade in loaded images
            this.style.opacity = '0';
            this.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 100);
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll indicator
    initializeScrollIndicator();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize contact form if it exists
    initializeContactForm();
    
    // Initialize image error handling
    initializeImageErrorHandling();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Press 'Home' key to go to top
    if (e.key === 'Home' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Press 'End' key to go to bottom
    if (e.key === 'End' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
});

// Window resize handler
window.addEventListener('resize', function() {
    // Recalculate any position-dependent elements
    const header = document.getElementById('header');
    if (header && window.innerWidth > 768) {
        // Reset mobile menu state on resize
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (navMenu && mobileMenuBtn) {
            navMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Cleanup function for better performance
window.addEventListener('beforeunload', function() {
    // Clean up any intervals, timeouts, or event listeners if needed
    const feedbackMessages = document.querySelectorAll('.user-feedback');
    feedbackMessages.forEach(msg => msg.remove());
});