/**
 * Common JavaScript Functions
 * Shared across all pages
 */

// ==========================================================================
// Smooth Scrolling
// ==========================================================================

function initSmoothScrolling() {
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

// ==========================================================================
// Utility: Debounce Function
// ==========================================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================================================
// Navbar Scroll Effect
// ==========================================================================

function initNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = debounce(function () {
        if (window.scrollY > 100) {
            navbar.style.background = 'linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(30, 64, 175, 0.95))';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'linear-gradient(135deg, var(--dark-blue), var(--primary-blue))';
            navbar.style.backdropFilter = 'none';
        }
    }, 10);

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// ==========================================================================
// Intersection Observer for Animations
// ==========================================================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections with .section-content class
    document.querySelectorAll('.section-content').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(section);
    });
}

// ==========================================================================
// Page Loading Animation
// ==========================================================================

function initPageLoadAnimation() {
    // Removed fade-in animation to prevent white flash
    // Page now loads instantly without animation
}

// ==========================================================================
// Active Navigation Link Highlighter
// ==========================================================================

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'homepage.html';
    const navLinks = document.querySelectorAll('.nav-menu a, .mobile-nav-item');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

// ==========================================================================
// Form Submission Handler (Generic)
// ==========================================================================

function handleFormSubmission(formId, statusElementId, successMessage = 'Thank you for your submission!') {
    const form = document.getElementById(formId);
    const statusElement = document.getElementById(statusElementId);

    if (!form || !statusElement) return;

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                statusElement.textContent = successMessage;
                statusElement.className = 'success';
                form.reset();
            } else {
                const data = await response.json();
                if (data.errors) {
                    statusElement.textContent = data.errors.map(error => error.message).join(', ');
                } else {
                    statusElement.textContent = 'Oops! There was a problem submitting your form.';
                }
                statusElement.className = 'error';
            }
        } catch (error) {
            statusElement.textContent = 'Oops! There was a problem submitting your form.';
            statusElement.className = 'error';
        }
    });
}

// ==========================================================================
// Date Formatting Helper
// ==========================================================================

function formatDate(dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

// ==========================================================================
// Initialize All Common Functions
// ==========================================================================

function initCommonFunctions() {
    initSmoothScrolling();
    initNavbarScrollEffect();
    initScrollAnimations();
    initPageLoadAnimation();
    setActiveNavLink();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonFunctions);
} else {
    initCommonFunctions();
}

// Export functions for use in other scripts
window.IPFOCommon = {
    initSmoothScrolling,
    initNavbarScrollEffect,
    initScrollAnimations,
    initPageLoadAnimation,
    setActiveNavLink,
    handleFormSubmission,
    formatDate
};