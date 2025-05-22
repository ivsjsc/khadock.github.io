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

// Add to the bottom of body in all HTML files
<script src="js/errorHandling.js"></script>