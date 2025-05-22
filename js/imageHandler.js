class ResponsiveImageHandler {
    static init() {
        this.setupResponsiveImages();
        this.setupLazyLoading();
        this.handleDevicePixelRatio();
        this.setupFallbackImages();
    }

    static setupResponsiveImages() {
        document.querySelectorAll('img[data-srcset]').forEach(img => {
            const mobile = img.dataset.srcMobile;
            const desktop = img.dataset.srcDesktop;
            
            if (mobile && desktop) {
                img.srcset = `${mobile} 768w, ${desktop} 1024w`;
                img.sizes = '(max-width: 768px) 100vw, 1024px';
            }
        });
    }

    static handleDevicePixelRatio() {
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
            document.querySelectorAll('img[data-src-2x]').forEach(img => {
                img.src = img.dataset.src2x;
            });
        }
    }

    static setupLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // Fallback for browsers that don't support lazy loading
            this.loadLazyLoadingPolyfill();
        }
    }

    static setupFallbackImages() {
        const images = document.querySelectorAll('img');
        const fallbackImage = 'images/fallback.jpg';

        images.forEach(img => {
            img.onerror = function() {
                console.warn(`Failed to load image: ${img.src}`);
                img.src = fallbackImage;
            };
        });

        // Handle background images
        const bgElements = document.querySelectorAll('[style*="background-image"]');
        bgElements.forEach(element => {
            const url = getComputedStyle(element).backgroundImage.match(/url\(["']?([^"']*)["']?\)/);
            if (url) {
                const img = new Image();
                img.onerror = () => {
                    element.style.backgroundImage = `url(${fallbackImage})`;
                };
                img.src = url[1];
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => ResponsiveImageHandler.init());