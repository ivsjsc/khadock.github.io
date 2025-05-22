// Main App Configuration
const config = {
    scrollToTopThreshold: 300,
    scrollBehavior: 'smooth',
    aos: {
        duration: 700,
        offset: 80,
        once: true,
        easing: 'ease-out-cubic'
    }
};

// Initialize core functionality
class App {
    static init() {
        this.setupScrollToTop();
        this.setupAOS();
        this.handleMobileMenu();
        this.setupImageLoadHandling();
    }

    static setupScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTopBtn');
        if (!scrollBtn) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > config.scrollToTopThreshold) {
                scrollBtn.classList.remove('hidden');
                scrollBtn.classList.add('flex');
            } else {
                scrollBtn.classList.add('hidden');
                scrollBtn.classList.remove('flex');
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: config.scrollBehavior
            });
        });
    }

    static setupAOS() {
        window.addEventListener('load', () => {
            if (typeof AOS !== 'undefined') {
                AOS.init(config.aos);
            } else {
                console.warn('AOS library not loaded');
            }
        });
    }

    static handleMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (!mobileMenuBtn || !mobileMenu) return;

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        });

        // Close mobile menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) { // md breakpoint
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    static setupImageLoadHandling() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', () => {
                img.src = 'images/placeholder.jpg';
                img.alt = 'Image failed to load';
            });
        });
    }

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Performance monitoring
class Performance {
    static monitor() {
        window.addEventListener('load', () => {
            const timing = window.performance.timing;
            const pageLoad = timing.loadEventEnd - timing.navigationStart;
            console.info(`Page loaded in: ${pageLoad}ms`);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    Performance.monitor();
});

export default App;