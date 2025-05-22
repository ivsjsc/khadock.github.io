document.addEventListener('DOMContentLoaded', function() {
    // Wait for components to load before initializing
    const checkComponentsLoaded = setInterval(() => {
        if (document.querySelector('header') && document.querySelector('footer')) {
            clearInterval(checkComponentsLoaded);
            initializeServices();
        }
    }, 100);
});

function initializeServices() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        offset: 100,
        once: true,
        easing: 'ease-out-quad'
    });

    // Initialize scroll to top
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            scrollBtn.classList.toggle('flex', window.scrollY > 500);
            scrollBtn.classList.toggle('hidden', window.scrollY <= 500);
        }, { passive: true });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function initializeLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            if (img.dataset.src) img.src = img.dataset.src;
        });
    } else {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js');
    }
}

function initializeImageErrorHandling() {
    const fallbackImage = 'images/fallback.jpg';
    
    // Handle regular images
    document.querySelectorAll('img').forEach(img => {
        img.onerror = () => handleImageError(img, fallbackImage);
    });

    // Handle background images
    handleBackgroundImages();
}

function handleImageError(img, fallbackSrc) {
    console.warn(`Failed to load image: ${img.src}`);
    img.src = fallbackSrc;
}

function handleBackgroundImages() {
    const bgElements = document.querySelectorAll('.banner-bg, [style*="background-image"]');
    bgElements.forEach(element => {
        const url = getComputedStyle(element).backgroundImage.match(/url\(["']?([^"']*)["']?\)/);
        if (url) {
            const img = new Image();
            img.onerror = () => {
                element.style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("images/fallback.jpg")';
            };
            img.src = url[1];
        }
    });
}

function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
}