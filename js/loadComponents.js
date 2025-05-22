class ComponentLoader {
    static async loadComponents() {
        try {
            await Promise.all([
                this.loadComponent('header-placeholder', 'components/header.html'),
                this.loadComponent('footer-placeholder', 'components/footer.html')
            ]);
        } catch (error) {
            console.error('Component loading error:', error);
            this.handleComponentError(error);
        }
    }

    static async loadComponent(elementId, path) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element ${elementId} not found`);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            element.innerHTML = html;
        } catch (error) {
            throw new Error(`Failed to load ${path}: ${error.message}`);
        }
    }

    static handleComponentError(error) {
        const errorHtml = `
            <div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p>Failed to load page component</p>
                <p class="text-sm">${error.message}</p>
            </div>
        `;

        ['header-placeholder', 'footer-placeholder'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = errorHtml;
            }
        });
    }
}

// Initialize component loading
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.loadComponents();
});

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
