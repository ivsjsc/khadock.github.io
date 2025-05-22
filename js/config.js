export const config = {
    siteName: 'KhaDock',
    apiEndpoints: {
        gemini: '/api/gemini',
        contact: '/api/contact'
    },
    paths: {
        components: '/components',
        images: '/images'
    },
    theme: {
        colors: {
            primary: '#0EA5E9',
            secondary: '#0284C7'
        }
    }
};

// Tailwind Configuration
window.tailwind.config = {
    theme: {
        extend: {
            colors: {
                sky: {
                    50: '#f0f9ff',
                    500: '#0EA5E9',
                    600: '#0284C7',
                    700: '#0369A1'
                }
            }
        }
    }
};