// Main App Configuration
const config = {
    scrollToTopThreshold: 300,
    scrollBehavior: 'smooth',
    aos: {
        duration: 700,
        offset: 80,
        once: true,
        easing: 'ease-out-cubic',
        disable: 'mobile' // Disable animations on mobile devices
    }
};

// Initialize core functionality
class App {
    static init() {
        this.setupScrollToTop();
        this.setupImageLoadHandling();
        this.handleMobileMenu();
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

    static handleMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (!mobileMenuBtn || !mobileMenu) return;

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

export default App;