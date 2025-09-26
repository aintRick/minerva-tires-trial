// Booking Service JavaScript - Updated for Database Integration

// Configuration
const GOOGLE_CLIENT_ID = '638830470563-2jp4bc36sj0celc220d6u5ssu3g605o6.apps.googleusercontent.com'; // Replace with your actual client ID

// Add this new function here
function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
        hours = '00';
    }
    
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours}:${minutes}:00`;
}

// Authentication state
let currentUser = null;
let isAuthenticated = false;

// Navigation state
let lastScroll = 0;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    initializeNavigation();
    initializeApp();
    initializeAnimations();
    updateBookingButtons();
});

// Google Sign-In Callback Function
function handleCredentialResponse(response) {
    try {
        const userInfo = parseJwt(response.credential);
        
        currentUser = {
            id: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email,
            avatar: userInfo.picture,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
            credential: response.credential
        };
        
        isAuthenticated = true;
        
        updateAuthUI();
        updateBookingButtons();
        closeSigninModal();
        prefillUserInfo();
        
        showNotification(`Welcome, ${currentUser.givenName}! You're now signed in.`, 'success');
        console.log('User signed in:', currentUser);
        
    } catch (error) {
        console.error('Error processing Google sign-in:', error);
        showNotification('Sign-in failed. Please try again.', 'error');
    }
}

// Function to decode JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        throw error;
    }
}

// Sign out function
function signOut() {
    try {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoSelect();
        }
        
        currentUser = null;
        isAuthenticated = false;
        
        updateAuthUI();
        updateBookingButtons();
        
        showNotification('Successfully signed out.', 'info');
        console.log('User signed out');
        
    } catch (error) {
        console.error('Error during sign out:', error);
        showNotification('Sign out completed.', 'info');
    }
}

// Pre-fill user information in booking form
function prefillUserInfo() {
    if (currentUser) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        
        if (nameInput && !nameInput.value) {
            nameInput.value = currentUser.name;
        }
        if (emailInput && !emailInput.value) {
            emailInput.value = currentUser.email;
        }
    }
}

// Initialize authentication
function initializeAuth() {
    checkExistingAuth();
    
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOut);
    }
    
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.style.cursor = 'pointer';
        userAvatar.title = 'Click to sign out';
    }

    updateAuthUI();
    
    window.onload = function() {
        if (window.google) {
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse
                });
                console.log('Google Sign-In initialized');
            } catch (error) {
                console.error('Error initializing Google Sign-In:', error);
            }
        }
    };
}

// Initialize navigation
function initializeNavigation() {
    const header = document.querySelector('header');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            if (header) header.classList.add('scrolled');
        } else {
            if (header) header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target && header) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize animations
function initializeAnimations() {
    if (typeof IntersectionObserver === 'undefined') {
        console.warn('IntersectionObserver not supported - animations disabled');
        document.querySelectorAll('.service-card').forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
        return;
    }

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

    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(card);
    });

    const animateCounters = () => {
        const counters = document.querySelectorAll('.stat-number');
        const duration = 2000;

        counters.forEach(counter => {
            const text = counter.textContent;
            const target = parseInt(text);
            if (isNaN(target)) return;
            
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current) + text.slice(target.toString().length);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = text;
                }
            };

            updateCounter();
        });
    };

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroObserver.observe(heroSection);
    }
}

// Initialize application
function initializeApp() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    setupFormValidation();
    setupModalHandlers();
}

// Modal Management
function showSigninModal(event) {
    if (event) {
        event.stopPropagation();
    }
    const modal = document.getElementById('signinModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSigninModal() {
    const modal = document.getElementById('signinModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        const successAlert = document.getElementById('successAlert');
        if (successAlert && successAlert.classList.contains('show')) {
            resetBookingForm();
        }
    }
}

function setupModalHandlers() {
    document.addEventListener('click', (e) => {
        const signinModal = document.getElementById('signinModal');
        const bookingModal = document.getElementById('bookingModal');
        
        if (signinModal && signinModal.classList.contains('active') && 
            e.target === signinModal) {
            closeSigninModal();
        }
        
        if (bookingModal && bookingModal.classList.contains('active') && 
            e.target === bookingModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSigninModal();
            closeModal();
        }
    });
}

// Update Authentication UI
function updateAuthUI() {
    const userInfo = document.getElementById('userInfo');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');

    if (isAuthenticated && currentUser) {
        if (userInfo) {
            userInfo.style.display = 'flex';
            userInfo.classList.add('active');
        }
        if (userAvatar) {
            // Add error handling for the profile image
            userAvatar.onerror = function() {
                // Fallback to a default avatar or user initials
                this.style.display = 'none';
                // You could create a text-based avatar instead
                const fallbackAvatar = document.createElement('div');
                fallbackAvatar.className = 'fallback-avatar';
                fallbackAvatar.textContent = currentUser.givenName ? currentUser.givenName.charAt(0) : 'U';
                this.parentNode.insertBefore(fallbackAvatar, this);
            };
            
            // Set the image source
            userAvatar.src = currentUser.avatar;
            userAvatar.alt = `${currentUser.name}'s profile picture`;
        }
        if (userName) {
            userName.textContent = currentUser.givenName || currentUser.name;
        }
    } else {
        if (userInfo) {
            userInfo.style.display = 'none';
            userInfo.classList.remove('active');
        }
    }
}

// Update Booking Buttons
function updateBookingButtons() {
    const bookButtons = document.querySelectorAll('.btn-primary');
    
    bookButtons.forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes('bookService')) {
            const googleIcon = btn.querySelector('.fab.fa-google');
            const calendarIcon = btn.querySelector('.fas.fa-calendar-plus');
            
            if (isAuthenticated) {
                if (googleIcon) googleIcon.style.display = 'none';
                if (calendarIcon) calendarIcon.style.display = 'inline';
                btn.classList.add('authenticated');
            } else {
                if (googleIcon) googleIcon.style.display = 'inline';
                if (calendarIcon) calendarIcon.style.display = 'none';
                btn.classList.remove('authenticated');
            }
        }
    });
}

function checkExistingAuth() {
    // Authentication only persists during the session
}

// Service Features
function toggleFeatures(serviceId) {
    const featuresElement = document.getElementById(serviceId + '-features');
    if (featuresElement) {
        featuresElement.classList.toggle('active');
        
        const buttons = document.querySelectorAll(`[onclick="toggleFeatures('${serviceId}')"]`);
        buttons.forEach(btn => {
            const icon = btn.querySelector('i');
            const textSpan = btn.querySelector('span');
            if (featuresElement.classList.contains('active')) {
                if (icon) icon.className = 'fas fa-chevron-up';
                if (textSpan) textSpan.textContent = 'Hide Details';
            } else {
                if (icon) icon.className = 'fas fa-info-circle';
                if (textSpan) textSpan.textContent = 'Details';
            }
        });
    }
}

// Booking Service
function bookService(serviceName, price) {
    if (!isAuthenticated) {
        showSigninModal();
        return;
    }

    const modal = document.getElementById('bookingModal');
    const serviceInput = document.getElementById('service');
    const estimatedCost = document.getElementById('estimated-cost');
    const successAlert = document.getElementById('successAlert');

    if (modal && serviceInput && estimatedCost) {
        if (successAlert) {
            successAlert.classList.remove('show');
        }

        serviceInput.value = serviceName;
        estimatedCost.value = `₱${price.toLocaleString()}`;

        prefillUserInfo();

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.min = today;
        }
    }
}

function setupFormValidation() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

function validateField(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup?.querySelector('.error-message');
    
    let isValid = true;
    let message = '';

    if (!field.value.trim()) {
        isValid = false;
        message = 'This field is required';
    } else if (field.type === 'email' && !isValidEmail(field.value)) {
        isValid = false;
        message = 'Please enter a valid email address';
    } else if (field.id === 'phone' && !isValidPhone(field.value)) {
        isValid = false;
        message = 'Please enter a valid phone number';
    }

    if (formGroup) {
        if (!isValid) {
            formGroup.classList.add('error');
            if (errorMessage) errorMessage.textContent = message;
        } else {
            formGroup.classList.remove('error');
        }
    }

    return isValid;
}

function clearError(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
    }
}

function formatPhoneNumber(e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 0 && !value.startsWith('63')) {
        value = '63' + value;
    }
    
    if (value.length > 0) {
        value = '+' + value;
    }
    
    input.value = value;
}

// Handle Booking Form Submission - Updated for Database Integration
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const successAlert = document.getElementById('successAlert');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required], select[required]');
    let allValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            allValid = false;
        }
    });
    
    if (!allValid) {
        showNotification('Please fill all required fields correctly.', 'error');
        return;
    }

    try {
        // Show loading state
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }

        // Collect form data
        const formData = new FormData(form);
        
        // Add vehicle info to notes if provided
        const vehicleInfo = document.getElementById('vehicle').value;
        const existingNotes = formData.get('notes') || '';
        const updatedNotes = vehicleInfo ? 
            `Vehicle: ${vehicleInfo}${existingNotes ? '\n\nAdditional Notes: ' + existingNotes : ''}` : 
            existingNotes;
        
        // Convert time to 24-hour format
        const selectedTime = formData.get('time');
        const convertedTime = convertTo24Hour(selectedTime);
        
        // Prepare data for PHP
        const bookingData = {
            user_name: formData.get('name'),
            user_email: formData.get('email'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            appointment_date: formData.get('date'),
            appointment_time: convertedTime,
            appointment_time_display: selectedTime,
            note: updatedNotes
        };

        // Send to PHP backend
        const response = await fetch('product.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (result.success) {
            // Show success
            if (successAlert) {
                successAlert.classList.add('show');
            }

            showNotification('Booking confirmed! We\'ll contact you shortly.', 'success');

            // Reset form after delay
            setTimeout(() => {
                resetBookingForm();
                closeModal();
            }, 3000);
        } else {
            throw new Error(result.message || 'Booking failed');
        }

    } catch (error) {
        console.error('Booking error:', error);
        showNotification('Booking failed. Please try again.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
}

function resetBookingForm() {
    const form = document.getElementById('bookingForm');
    const successAlert = document.getElementById('successAlert');
    
    if (form) {
        form.reset();
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
    }
    
    if (successAlert) {
        successAlert.classList.remove('show');
    }
}

// Utility Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\+63\s?\d{9,10}$/;
    return phoneRegex.test(phone);
}

// Notification System
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}