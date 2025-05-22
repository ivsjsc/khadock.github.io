class PerformanceOptimizer {
    static init() {
        this.setupLazyLoading();
        this.setupIntersectionObserver();
        this.handleNetworkChange();
        this.setupMediaQueries();
    }

    static setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        if ('loading' in HTMLImageElement.prototype) {
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // Fallback for browsers that don't support lazy loading
            this.loadLazyLoadingPolyfill();
        }
    }

    static setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    if (entry.target.dataset.src) {
                        entry.target.src = entry.target.dataset.src;
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        document.querySelectorAll('[data-observe]').forEach(el => observer.observe(el));
    }

    static handleNetworkChange() {
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                const connection = navigator.connection;
                if (connection.saveData || connection.effectiveType === 'slow-2g') {
                    this.enableLowDataMode();
                }
            });
        }
    }

    static setupMediaQueries() {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        const handleMobileChange = (e) => {
            if (e.matches) {
                this.optimizeForMobile();
            } else {
                this.optimizeForDesktop();
            }
        };
        
        mediaQuery.addListener(handleMobileChange);
        handleMobileChange(mediaQuery);
    }

    static optimizeForMobile() {
        document.body.classList.add('is-mobile');
        this.deferNonCriticalContent();
    }

    static optimizeForDesktop() {
        document.body.classList.remove('is-mobile');
        this.loadAllContent();
    }

    static deferNonCriticalContent() {
        document.querySelectorAll('[data-defer]').forEach(el => {
            el.setAttribute('loading', 'lazy');
        });
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => PerformanceOptimizer.init());