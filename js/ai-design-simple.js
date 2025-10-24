// Simple AI Design Generator - No Authentication Required
document.addEventListener('DOMContentLoaded', () => {
    // Main elements
    const generateBtn = document.getElementById('ai-generate-btn');
    const clearInputBtn = document.getElementById('ai-clear-input-btn');
    const inputText = document.getElementById('ai-design-input');
    const loadingDiv = document.getElementById('ai-loading');
    const loadingTextElement = document.getElementById('ai-loading-text');
    const errorDiv = document.getElementById('ai-error');
    const outputContainer = document.getElementById('ai-output-container');
    const mainOutputDiv = document.getElementById('ai-output');

    // Additional feature buttons
    const extraFeaturesContainer = document.getElementById('gemini-extra-features');
    const maintenanceBtn = document.getElementById('ai-maintenance-btn');
    const accessoriesBtn = document.getElementById('ai-accessories-btn');
    const maintenanceLoadingDiv = document.getElementById('ai-maintenance-loading');
    const accessoriesLoadingDiv = document.getElementById('ai-accessories-loading');
    const maintenanceOutputDiv = document.getElementById('ai-maintenance-output');
    const accessoriesOutputDiv = document.getElementById('ai-accessories-output');

    let currentDesignText = ""; // Store the generated design

    // Set loading state
    function setLoadingState(isLoading, type = 'main') {
        let loader, textEl, buttonEl;

        if (type === 'main') {
            loader = loadingDiv;
            textEl = loadingTextElement;
            buttonEl = generateBtn;
        } else if (type === 'maintenance') {
            loader = maintenanceLoadingDiv;
            buttonEl = maintenanceBtn;
        } else if (type === 'accessories') {
            loader = accessoriesLoadingDiv;
            buttonEl = accessoriesBtn;
        }

        if (loader) loader.classList.toggle('hidden', !isLoading);
    if (textEl && isLoading) textEl.textContent = "Creating your design...";
        if (buttonEl) {
            buttonEl.disabled = isLoading;
            buttonEl.classList.toggle('opacity-75', isLoading);
            buttonEl.classList.toggle('cursor-not-allowed', isLoading);
        }

        if (isLoading) {
            if(errorDiv) errorDiv.classList.add('hidden');
            if (type === 'main' && outputContainer) outputContainer.classList.add('hidden');
            if (type === 'maintenance' && maintenanceOutputDiv) maintenanceOutputDiv.classList.add('hidden');
            if (type === 'accessories' && accessoriesOutputDiv) accessoriesOutputDiv.classList.add('hidden');
        }
    }

    function displayError(message) {
        if (!errorDiv) return;
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        if (outputContainer) outputContainer.classList.add('hidden');
    }

    function displayResult(htmlContent, targetDiv, title = "🎨 KhaDock AI Design Concept:") {
        if (!targetDiv) return;
        
        targetDiv.innerHTML = `<h3 class="text-xl font-semibold text-sky-800 mb-3">${title}</h3>${htmlContent}`;
        targetDiv.classList.remove('hidden');
        
        if (targetDiv.closest('#ai-output-container')) {
            if(outputContainer) outputContainer.classList.remove('hidden');
        }
        if(errorDiv) errorDiv.classList.add('hidden');
    }

    function formatDesignText(text, title) {
    if (!text) return `<p>No content to display.</p>`;
        
        // Format the AI response with better styling
        let html = text;
        
        // Handle code blocks
        html = html.replace(/```([\s\S]*?)```/g, (match, p1) => 
            `<pre class="bg-slate-200 p-2 rounded overflow-x-auto text-sm"><code>${p1.trim()}</code></pre>`);
        
        // Handle bold headers with emojis
        html = html.replace(/\*\*(🎨|🏗️|✨|🔧|🎯|🌊|⚡)?\s*(.*?):\*\*/g, (match, emoji, text) => 
            `<h4 class="text-lg font-semibold text-sky-700 mt-4 mb-2">${emoji || '🔹'} ${text.trim()}:</h4>`);
        
        // Handle regular bold text
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-sky-800">$1</strong>');
        
        // Handle bullet points
        const lines = html.split('\n');
        html = lines.map(line => {
            line = line.trim();
            if (line.match(/^[\*\-]\s+/)) {
                let listItem = line.replace(/^[\*\-]\s+/, '').trim();
                return `<li class="ml-4 mb-1 text-gray-700">• ${listItem}</li>`;
            }
            return line ? `<p class="mb-2 text-gray-700 leading-relaxed">${line}</p>` : '';
        }).join('');

        return html;
    }

    // Simple API call function
    async function callAIAPI(prompt) {
    // Allow overriding API base via window.KHADOCK_API_BASE if provided
    const base = (window && window.KHADOCK_API_BASE) ? window.KHADOCK_API_BASE : "http://localhost:3001";
    const apiUrl = `${base}/api/ai-design`;

        try {
            let response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    targetLanguage: "English" // Default to English for US market
                })
            });

            // If running on GitHub Pages or remote and localhost is not reachable, fallback to same-origin or a production API if defined
            if (!response.ok && (response.status === 0 || response.status === 404)) {
                const fallbackBase = (window && window.KHADOCK_API_BASE_FALLBACK) ? window.KHADOCK_API_BASE_FALLBACK : '';
                if (fallbackBase) {
                    try {
                        response = await fetch(`${fallbackBase}/api/ai-design`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompt, targetLanguage: "English" })
                        });
                    } catch (e) {
                        // ignore and let error be handled below
                    }
                }
            }

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: response.statusText || 'Server error' };
                }
                throw new Error(errorData.error || 'Server connection error');
            }

            const result = await response.json();
            return result.design;

        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }

    // Main generate function
    async function generateDesign() {
        if (!inputText || !mainOutputDiv) {
            console.error("Missing required elements");
            return;
        }

        const userInput = inputText.value.trim();
        if (!userInput) {
              displayError('Please describe your dock design idea.');
            inputText.focus();
            return;
        }

        setLoadingState(true, 'main');
        currentDesignText = "";
        
        // Hide additional features until main design is generated
        if(extraFeaturesContainer) extraFeaturesContainer.classList.add('hidden');
        if(maintenanceOutputDiv) maintenanceOutputDiv.classList.add('hidden');
        if(accessoriesOutputDiv) accessoriesOutputDiv.classList.add('hidden');

        try {
            const designText = await callAIAPI(userInput);
            currentDesignText = designText;
            
            const formattedHtml = formatDesignText(designText, "🎨 Creative Dock Design:");
            displayResult(formattedHtml, mainOutputDiv);
            
            if (outputContainer) outputContainer.classList.remove('hidden');
            if (extraFeaturesContainer) extraFeaturesContainer.classList.remove('hidden');
            
        } catch (error) {
            displayError(`Error: ${error.message}`);
            console.error('Error generating design:', error);
        } finally {
            setLoadingState(false, 'main');
        }
    }

    // Additional features
    async function getMaintenanceTips() {
        if (!currentDesignText) {
              displayError("Please create a design before viewing maintenance.");
            return;
        }
        if (!maintenanceOutputDiv) return;

        setLoadingState(true, 'maintenance');
    const maintenancePrompt = `Based on this dock design: "${currentDesignText}", provide 4-5 specific and important maintenance tips for the Florida climate. Present as a bulleted list.`;

        try {
            const tipsText = await callAIAPI(maintenancePrompt);
            const formattedHtml = formatDesignText(tipsText, "🔧 Maintenance Guide:");
            displayResult(formattedHtml, maintenanceOutputDiv);
        } catch (error) {
            displayResult(`Error fetching maintenance info: ${error.message}`, maintenanceOutputDiv, "❌ Maintenance Error");
        } finally {
            setLoadingState(false, 'maintenance');
        }
    }

    async function getAccessorySuggestions() {
        if (!currentDesignText) {
              displayError("Please create a design before viewing accessories.");
            return;
        }
        if (!accessoriesOutputDiv) return;

        setLoadingState(true, 'accessories');
    const accessoryPrompt = `Based on this dock design: "${currentDesignText}", suggest 4-6 accessories and additional amenities that fit. Include estimated pricing and benefits. Present as a list.`;

        try {
            const accessoriesText = await callAIAPI(accessoryPrompt);
            const formattedHtml = formatDesignText(accessoriesText, "⚡ Suggested Accessories:");
            displayResult(formattedHtml, accessoriesOutputDiv);
        } catch (error) {
            displayResult(`Error fetching accessories info: ${error.message}`, accessoriesOutputDiv, "❌ Accessories Error");
        } finally {
            setLoadingState(false, 'accessories');
        }
    }

    // Event listeners
    if (generateBtn) {
        generateBtn.addEventListener('click', generateDesign);
    }

    if (clearInputBtn) {
        clearInputBtn.addEventListener('click', () => {
            inputText.value = '';
            if(errorDiv) errorDiv.classList.add('hidden');
            if(outputContainer) outputContainer.classList.add('hidden');
            if(extraFeaturesContainer) extraFeaturesContainer.classList.add('hidden');
            inputText.focus();
        });
    }

    if (maintenanceBtn) {
        maintenanceBtn.addEventListener('click', getMaintenanceTips);
    }

    if (accessoriesBtn) {
        accessoriesBtn.addEventListener('click', getAccessorySuggestions);
    }

    // Enter key support
    if (inputText) {
        inputText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateDesign();
            }
        });
    }

    console.log('🎨 Simple AI Design Generator initialized!');
});