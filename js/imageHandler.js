document.addEventListener('DOMContentLoaded', function() {
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
});