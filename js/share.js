/**
 * IPFO Share Module
 * =================
 * Enhanced sharing functionality with copy-link button.
 */

const IPFOShare = (function() {
    
    /**
     * Copy current URL to clipboard
     * @param {HTMLElement} button - The button element that was clicked
     * @returns {Promise<boolean>} - Success status
     */
    async function copyLink(button = null) {
        const url = window.location.href;
        
        try {
            await navigator.clipboard.writeText(url);
            
            // Show success feedback
            if (button) {
                showCopyFeedback(button, true);
            } else {
                showToast('Link copied to clipboard!', 'success');
            }
            
            // Track the share action
            if (window.IPFOAnalytics) {
                IPFOAnalytics.trackShare('copy_link', getContentType(), getContentId());
            }
            
            return true;
        } catch (err) {
            // Fallback for older browsers
            const success = fallbackCopyToClipboard(url);
            
            if (success) {
                if (button) {
                    showCopyFeedback(button, true);
                } else {
                    showToast('Link copied to clipboard!', 'success');
                }
            } else {
                if (button) {
                    showCopyFeedback(button, false);
                } else {
                    showToast('Failed to copy link', 'error');
                }
            }
            
            return success;
        }
    }
    
    /**
     * Fallback copy method for older browsers
     */
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
        return success;
    }
    
    /**
     * Show visual feedback on the copy button
     */
    function showCopyFeedback(button, success) {
        const originalHTML = button.innerHTML;
        const originalClass = button.className;
        
        if (success) {
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.classList.add('copy-success');
        } else {
            button.innerHTML = '<i class="fas fa-times"></i> Failed';
            button.classList.add('copy-error');
        }
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.className = originalClass;
        }, 2000);
    }
    
    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.ipfo-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `ipfo-toast ipfo-toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Share to Twitter/X
     */
    function shareToTwitter(text = null) {
        const url = encodeURIComponent(window.location.href);
        const shareText = encodeURIComponent(text || document.title);
        window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${url}`, '_blank', 'width=550,height=420');
        trackShare('twitter');
    }
    
    /**
     * Share to LinkedIn
     */
    function shareToLinkedIn() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=550,height=420');
        trackShare('linkedin');
    }
    
    /**
     * Share to Facebook
     */
    function shareToFacebook() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=420');
        trackShare('facebook');
    }
    
    /**
     * Share via Email
     */
    function shareViaEmail(subject = null, body = null) {
        const url = window.location.href;
        const emailSubject = encodeURIComponent(subject || document.title);
        const emailBody = encodeURIComponent(body || `Check out this page: ${url}`);
        window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        trackShare('email');
    }
    
    /**
     * Share via WhatsApp
     */
    function shareToWhatsApp(text = null) {
        const url = encodeURIComponent(window.location.href);
        const shareText = encodeURIComponent(text || document.title);
        window.open(`https://wa.me/?text=${shareText}%20${url}`, '_blank');
        trackShare('whatsapp');
    }
    
    /**
     * Use native share API if available
     */
    async function nativeShare(title = null, text = null) {
        if (!navigator.share) {
            // Fallback to copy link
            return copyLink();
        }
        
        try {
            await navigator.share({
                title: title || document.title,
                text: text || '',
                url: window.location.href
            });
            trackShare('native');
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
            return false;
        }
    }
    
    /**
     * Track share action
     */
    function trackShare(platform) {
        if (window.IPFOAnalytics) {
            IPFOAnalytics.trackShare(platform, getContentType(), getContentId());
        }
    }
    
    /**
     * Get content type based on current page
     */
    function getContentType() {
        const path = window.location.pathname;
        if (path.includes('blog-article')) return 'article';
        if (path.includes('blog')) return 'blog';
        if (path.includes('project-catalogue')) return 'catalogue';
        if (path.includes('contact')) return 'contact';
        return 'page';
    }
    
    /**
     * Get content ID from URL
     */
    function getContentId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || window.location.pathname;
    }
    
    /**
     * Create a share button component
     * @param {string} type - Button type: 'copy', 'twitter', 'linkedin', 'facebook', 'email', 'whatsapp', 'native'
     * @param {object} options - Optional settings
     * @returns {HTMLElement}
     */
    function createShareButton(type, options = {}) {
        const button = document.createElement('button');
        button.className = `share-btn share-btn-${type} ${options.className || ''}`;
        
        const configs = {
            copy: {
                icon: 'link',
                label: 'Copy Link',
                handler: () => copyLink(button)
            },
            twitter: {
                icon: 'fab fa-twitter',
                label: 'Twitter',
                handler: () => shareToTwitter(options.text)
            },
            linkedin: {
                icon: 'fab fa-linkedin',
                label: 'LinkedIn',
                handler: shareToLinkedIn
            },
            facebook: {
                icon: 'fab fa-facebook',
                label: 'Facebook',
                handler: shareToFacebook
            },
            email: {
                icon: 'envelope',
                label: 'Email',
                handler: () => shareViaEmail(options.subject, options.body)
            },
            whatsapp: {
                icon: 'fab fa-whatsapp',
                label: 'WhatsApp',
                handler: () => shareToWhatsApp(options.text)
            },
            native: {
                icon: 'share-alt',
                label: 'Share',
                handler: () => nativeShare(options.title, options.text)
            }
        };
        
        const config = configs[type];
        if (!config) return null;
        
        const iconClass = config.icon.startsWith('fab') ? config.icon : `fas fa-${config.icon}`;
        
        button.innerHTML = options.iconOnly 
            ? `<i class="${iconClass}"></i>`
            : `<i class="${iconClass}"></i> <span>${options.label || config.label}</span>`;
        
        button.addEventListener('click', config.handler);
        
        return button;
    }
    
    /**
     * Create a complete share bar component
     * @param {object} options - Configuration options
     * @returns {HTMLElement}
     */
    function createShareBar(options = {}) {
        const container = document.createElement('div');
        container.className = `share-bar ${options.className || ''}`;
        
        const buttons = options.buttons || ['copy', 'twitter', 'linkedin', 'whatsapp', 'email'];
        
        buttons.forEach(type => {
            const btn = createShareButton(type, {
                iconOnly: options.iconOnly,
                text: options.text,
                title: options.title
            });
            if (btn) container.appendChild(btn);
        });
        
        return container;
    }
    
    /**
     * Initialize share buttons on page
     * Looks for elements with data-share attribute
     */
    function init() {
        // Handle copy link buttons
        document.querySelectorAll('[data-share="copy"]').forEach(btn => {
            btn.addEventListener('click', () => copyLink(btn));
        });
        
        // Handle other share buttons
        const shareHandlers = {
            'twitter': shareToTwitter,
            'linkedin': shareToLinkedIn,
            'facebook': shareToFacebook,
            'email': shareViaEmail,
            'whatsapp': shareToWhatsApp,
            'native': nativeShare
        };
        
        Object.keys(shareHandlers).forEach(platform => {
            document.querySelectorAll(`[data-share="${platform}"]`).forEach(btn => {
                btn.addEventListener('click', shareHandlers[platform]);
            });
        });
    }
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Public API
    return {
        copyLink,
        shareToTwitter,
        shareToLinkedIn,
        shareToFacebook,
        shareViaEmail,
        shareToWhatsApp,
        nativeShare,
        createShareButton,
        createShareBar,
        showToast,
        init
    };
    
})();

// Export to global scope
window.IPFOShare = IPFOShare;
