export class AIDesigner {
    static init() {
        const elements = {
            input: document.getElementById('design-input'),
            generateBtn: document.getElementById('generate-design-btn'),
            loadingIndicator: document.getElementById('loading-indicator'),
            output: document.getElementById('design-output'),
            error: document.getElementById('error-message')
        };

        if (!this.validateElements(elements)) return;

        elements.generateBtn.addEventListener('click', () => 
            this.handleGenerate(elements));
    }

    static validateElements(elements) {
        const missing = Object.entries(elements)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missing.length > 0) {
            console.error('Missing elements:', missing.join(', '));
            return false;
        }
        return true;
    }

    static async handleGenerate(elements) {
        const { input, generateBtn, loadingIndicator, output, error } = elements;
        const userInput = input.value.trim();

        if (!userInput) {
            this.showError(error, 'Please describe your dream dock.');
            return;
        }

        this.showLoading(true, elements);

        try {
            const result = await this.generateDesign(userInput);
            this.showResult(result, elements);
        } catch (err) {
            this.showError(error, err.message);
        } finally {
            this.showLoading(false, elements);
        }
    }

    // Rest of the AI Designer class methods...
}

// Scripts Section

// Core initialization function to be called on DOMContentLoaded
export function initializeAIDesigner() {
    // Initialize AOS
    if (window.AOS) {
        AOS.init({
            duration: 700,
            offset: 80,
            once: true,
            easing: 'ease-out-cubic'
        });
    }

    // Initialize AI functionality
    if (typeof AIDesigner !== 'undefined') {
        AIDesigner.init();
    }
}