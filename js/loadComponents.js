document.addEventListener('DOMContentLoaded', async function() {
    try {
        await ComponentLoader.loadComponents();
        
        // Initialize after components are loaded
        initializeAOS();
        setupScrollToTop();
        
    } catch (error) {
        console.error('Error loading components:', error);
        handleComponentError();
    }
});

class ComponentLoader {
    static async loadComponents() {
        try {
            await Promise.all([
                this.loadComponent('header-placeholder', 'components/header.html'),
                this.loadComponent('footer-placeholder', 'components/footer.html')
            ]);
        } catch (error) {
            console.error('Component loading error:', error);
            throw error;
        }
    }

    static async loadComponent(elementId, componentPath) {
        try {
            const element = document.getElementById(elementId);
            if (!element) throw new Error(`Element ${elementId} not found`);

            const response = await fetch(componentPath);
            if (!response.ok) throw new Error(`Failed to load ${componentPath}`);

            const html = await response.text();
            element.innerHTML = html;

        } catch (error) {
            throw new Error(`Component loading error: ${error.message}`);
        }
    }
}

function handleComponentError() {
    const errorMessage = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <p>Failed to load page components. Please refresh the page or contact support.</p>
        </div>
    `;
    
    ['header-placeholder', 'footer-placeholder'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = errorMessage;
    });
}

function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            disable: window.innerWidth < 768
        });
    }
}

function setupScrollToTop() {
    const scrollToTopButton = document.getElementById('scroll-to-top');
    if (!scrollToTopButton) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopButton.classList.add('visible');
        } else {
            scrollToTopButton.classList.remove('visible');
        }
    });

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
