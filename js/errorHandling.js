document.addEventListener('DOMContentLoaded', function() {
    // Handle Tailwind loading errors
    if (typeof tailwind === 'undefined') {
        console.warn('Tailwind CSS not loaded. Using fallback styles.');
        document.body.classList.add('no-tailwind');
    }

    // Handle image loading errors
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            this.onerror = null;
            this.src = 'images/fallback.jpg';
            console.warn(`Failed to load image: ${img.src}`);
        };
    });

    // Handle background image loading errors
    const backgroundElements = document.querySelectorAll('.banner-bg, .hero-bg');
    backgroundElements.forEach(el => {
        const url = getComputedStyle(el).backgroundImage.match(/url\(["']?([^"']*)["']?\)/);
        if (url) {
            const img = new Image();
            img.onerror = () => {
                el.style.backgroundImage = 'url("images/fallback.jpg")';
                console.warn(`Failed to load background image for ${el.className}`);
            };
            img.src = url[1];
        }
    });

    // Monitor for layout shifts
    let layoutShifts = 0;
    new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
                layoutShifts += entry.value;
                if (layoutShifts > 0.1) {
                    console.warn('Significant layout shift detected');
                }
            }
        }
    }).observe({entryTypes: ['layout-shift']});
});

class ErrorHandler {
    static init() {
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
    }

    static handleError(event) {
        console.error('Error:', event.error);
        this.showErrorMessage(event.error?.message || 'An error occurred');
        event.preventDefault();
    }

    static handlePromiseError(event) {
        console.error('Promise Error:', event.reason);
        this.showErrorMessage(event.reason?.message || 'An async error occurred');
        event.preventDefault();
    }

    static showErrorMessage(message) {
        const errorContainer = this.getOrCreateErrorContainer();
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 5000);
    }

    static getOrCreateErrorContainer() {
        let container = document.getElementById('error-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'error-container';
            container.className = 'fixed top-4 right-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg hidden z-50';
            document.body.appendChild(container);
        }
        return container;
    }
}

// Initialize error handling
ErrorHandler.init();

// Add to the bottom of body in all HTML files
<script src="js/errorHandling.js"></script>