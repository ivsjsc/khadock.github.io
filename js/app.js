import { config } from './config.js';

class App {
    static async init() {
        try {
            await this.loadComponents();
            this.setupEventListeners();
            this.initializeModules();
        } catch (error) {
            console.error('App initialization error:', error);
            this.handleError(error);
        }
    }

    static async loadComponents() {
        const components = ['header', 'footer'];
        
        for (const component of components) {
            await this.loadComponent(
                `${component}-placeholder`,
                `${config.paths.components}/${component}.html`
            );
        }
    }

    static async loadComponent(elementId, path) {
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            element.innerHTML = await response.text();
        } catch (error) {
            this.handleComponentError(elementId, error);
        }
    }

    static setupEventListeners() {
        // Performance monitoring
        window.addEventListener('load', () => {
            const timing = window.performance.timing;
            const pageLoad = timing.loadEventEnd - timing.navigationStart;
            console.info(`Page loaded in: ${pageLoad}ms`);
        });

        // Error handling
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
    }

    static initializeModules() {
        // Initialize page-specific features
        const path = window.location.pathname;
        if (path.includes('services.html')) {
            import('./services.js').then(m => m.default.init());
        }
    }

    static handleError(error) {
        const message = error.message || 'An error occurred';
        this.showNotification(message, 'error');
    }

    static handleComponentError(elementId, error) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p>Failed to load component</p>
                    <p class="text-sm">${error.message}</p>
                </div>
            `;
        }
    }

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => App.init());