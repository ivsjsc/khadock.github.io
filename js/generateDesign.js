// js/generateDesign.js

document.addEventListener('DOMContentLoaded', () => {
    // Main AI Design Elements
    const generateBtn = document.getElementById('ai-generate-btn');
    const clearInputBtn = document.getElementById('ai-clear-input-btn');
    const inputText = document.getElementById('ai-design-input');
    const loadingDiv = document.getElementById('ai-loading');
    const loadingTextElement = document.getElementById('ai-loading-text');
    const errorDiv = document.getElementById('ai-error');
    const outputContainer = document.getElementById('ai-output-container');
    const mainOutputDiv = document.getElementById('ai-output');

    // Elements for Additional Gemini Features
    const extraFeaturesContainer = document.getElementById('gemini-extra-features');
    const maintenanceBtn = document.getElementById('ai-maintenance-btn');
    const accessoriesBtn = document.getElementById('ai-accessories-btn');
    const maintenanceLoadingDiv = document.getElementById('ai-maintenance-loading');
    const accessoriesLoadingDiv = document.getElementById('ai-accessories-loading');
    const maintenanceOutputDiv = document.getElementById('ai-maintenance-output');
    const accessoriesOutputDiv = document.getElementById('ai-accessories-output');

    let currentDesignConceptEN = ""; // Store the generated design concept in English

    // !!! IMPORTANT: API Key Management !!!
    // Hardcoding API keys directly in client-side JavaScript is NOT SECURE for production.
    // This is done here for immediate error resolution in the current development context.
    // For a real application, use a backend proxy or environment variables securely managed by your hosting platform.
    const GEMINI_API_KEY = "AIzaSyCweMMVnQeySpVY8_JX-hEkpv_GrVxgUno"; // API Key được cung cấp

    function setLoadingState(isLoading, type = 'main') {
        let loader, textEl, buttonEl;
        let loadingMessage = "Loading...";

        if (type === 'main') {
            loader = loadingDiv;
            textEl = loadingTextElement;
            buttonEl = generateBtn;
            loadingMessage = "Generating your idea...";
        } else if (type === 'maintenance') {
            loader = maintenanceLoadingDiv;
            buttonEl = maintenanceBtn;
            loadingMessage = "Loading maintenance tips...";
        } else if (type === 'accessories') {
            loader = accessoriesLoadingDiv;
            buttonEl = accessoriesBtn;
            loadingMessage = "Loading accessory suggestions...";
        }

        if (loader) loader.classList.toggle('hidden', !isLoading);
        if (textEl && isLoading) textEl.textContent = loadingMessage;
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

    function displayResult(htmlContent, targetDiv, title = "KhaDock AI Design Concept:") {
        if (!targetDiv) return;
        let fullHtml = `<h3 class="text-xl font-semibold text-sky-800 mb-3">${title}</h3>${htmlContent}`;
        if (targetDiv === mainOutputDiv) {
             targetDiv.innerHTML = fullHtml;
        } else {
            targetDiv.innerHTML = htmlContent;
        }

        targetDiv.classList.remove('hidden');
        if (targetDiv.closest('#ai-output-container')) {
             if(outputContainer) outputContainer.classList.remove('hidden');
        }
        if(errorDiv) errorDiv.classList.add('hidden');
    }

    function formatGeminiTextToEnglish(text) {
        if (!text) return '<p>No content to display.</p>';
        let html = text;
        html = html.replace(/```([\s\S]*?)```/g, (match, p1) => `<pre class="bg-slate-200 p-2 rounded overflow-x-auto text-sm"><code>${p1.trim()}</code></pre>`);
        html = html.replace(/\*\*(.*?):\*\*/g, (match, p1) => `<h4 class="text-lg font-semibold text-sky-700 mt-3 mb-1">${p1.trim()}:</h4>`);
        html = html.replace(/(\d+\.\s*\*\*(.*?):\*\*)/g, (match, p1, p2) => `<h4 class="text-lg font-semibold text-sky-700 mt-3 mb-1">${p2.trim()}:</h4>`);
        html = html.replace(/(?<!\d\.\s*)\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        const lines = html.split('\n');
        let inList = false;
        html = lines.map(line => {
            line = line.trim();
            if (line.match(/^[\*\-]\s+/)) {
                let listItem = line.replace(/^[\*\-]\s+/, '').trim();
                listItem = listItem.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                if (!inList) {
                    inList = true;
                    return `<ul><li>${listItem}</li>`;
                }
                return `<li>${listItem}</li>`;
            } else {
                if (inList) {
                    inList = false;
                    return `</ul>${line ? `<p>${line}</p>` : ''}`;
                }
                if (line.match(/^<h[1-6]>/) || line.match(/^<ul>/) || line.match(/^<pre>/) || line.trim() === '') {
                    return line;
                }
                return line ? `<p>${line}</p>` : '';
            }
        }).join('');
        if (inList) html += '</ul>';
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<\/ul>\s*<ul>/g, '');
        return html;
    }

    async function callGeminiAPI(promptText, targetLanguage = "English") {
        // Sử dụng API Key đã được cung cấp
        const apiKey = GEMINI_API_KEY;
        const modelName = "gemini-pro"; // Model này thường yêu cầu API Key
        // const modelName = "gemini-2.0-flash"; // Bạn có thể thử lại với model này nếu "gemini-pro" không phải là mục tiêu

        // Kiểm tra nếu API key rỗng thì báo lỗi sớm
        if (!apiKey) {
            console.error("Gemini API Key is missing. Please provide a valid API Key.");
            throw new Error("Gemini API Key is missing. Configuration error.");
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        let finalPrompt = promptText;
        if (targetLanguage !== "English") {
            finalPrompt = `${promptText} Please provide the response in ${targetLanguage}.`;
        } else {
            finalPrompt = `${promptText} Please provide the response in English.`;
        }

        const payload = {
            contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `API request failed with status: ${response.status}` }));
            const errorMessage = errorData?.error?.message || errorData.message || `API request failed with status: ${response.status}.`;
            console.error("API Error Data:", errorData);
            throw new Error(errorMessage);
        }
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Invalid API response structure:", result);
            // Check for safety ratings if content is missing
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].finishReason === "SAFETY") {
                throw new Error('The response was blocked due to safety concerns. Try rephrasing your input.');
            }
            throw new Error('Received an unexpected response structure from the AI. Please try again.');
        }
    }

    async function generateInitialDesign() {
        if (!inputText || !mainOutputDiv) {
            console.error("Required DOM elements for main design generation are missing.");
            return;
        }
        const userInput = inputText.value.trim();
        if (!userInput) {
            displayError('Please describe your dock idea.');
            inputText.focus();
            return;
        }

        setLoadingState(true, 'main');
        currentDesignConceptEN = "";
        if(extraFeaturesContainer) extraFeaturesContainer.classList.add('hidden');
        if(maintenanceOutputDiv) maintenanceOutputDiv.classList.add('hidden');
        if(accessoriesOutputDiv) accessoriesOutputDiv.classList.add('hidden');

        const promptForDesignEN = `As a creative dock design expert for KhaDock.com in Florida, generate a detailed and inspiring boat dock concept based on the following user input: "${userInput}".
Provide the response in English, well-structured with Markdown for bold titles (e.g., **Concept Name:**), including:
1.  **Concept Name:** (A catchy, descriptive name)
2.  **Overall Vision:** (1-2 sentences describing the main idea and feel)
3.  **Key Features & Functionality:** (List 3-5 distinct features with brief descriptions, using bullet points)
4.  **Suggested Materials:** (List 2-3 primary materials suitable for Florida, using bullet points)
5.  **Aesthetic Style:** (1-2 sentences describing the look and feel)
6.  **Best Suited For:** (1 sentence about ideal users or property type)
Ensure the concept is practical for Florida's coastal environment (sun, saltwater, storms). Total length around 150-250 words.`;

        try {
            const designText = await callGeminiAPI(promptForDesignEN, "English");
            currentDesignConceptEN = designText;
            const formattedHtml = formatGeminiTextToEnglish(designText);
            displayResult(formattedHtml, mainOutputDiv, "KhaDock AI Design Concept:");
            if (outputContainer) outputContainer.classList.remove('hidden');
            if (extraFeaturesContainer) extraFeaturesContainer.classList.remove('hidden');
        } catch (error) {
            displayError(`Error: ${error.message}`);
            console.error('Error generating initial design:', error);
        } finally {
            setLoadingState(false, 'main');
        }
    }

    async function getMaintenanceTips() {
        if (!currentDesignConceptEN) {
            displayError("Please generate a design concept first before requesting maintenance tips.");
            return;
        }
        if (!maintenanceOutputDiv) return;

        setLoadingState(true, 'maintenance');
        const promptForMaintenanceEN = `Based on the following Florida dock design concept: "${currentDesignConceptEN}", provide 3-5 important and specific maintenance tips in English. Focus on materials mentioned, the Florida climate, and common issues. Present as a bulleted list.`;

        try {
            const tipsText = await callGeminiAPI(promptForMaintenanceEN, "English");
            const formattedHtml = formatGeminiTextToEnglish(tipsText);
            displayResult(formattedHtml, maintenanceOutputDiv, "✨ Maintenance Tips for This Design:");
        } catch (error) {
            displayResult(`<p class="text-red-600">Error fetching maintenance tips: ${error.message}</p>`, maintenanceOutputDiv, "Maintenance Tips Error");
            console.error('Error fetching maintenance tips:', error);
        } finally {
            setLoadingState(false, 'maintenance');
        }
    }

    async function getAccessorySuggestions() {
        if (!currentDesignConceptEN) {
            displayError("Please generate a design concept first before requesting accessory suggestions.");
            return;
        }
        if (!accessoriesOutputDiv) return;

        setLoadingState(true, 'accessories');
        const promptForAccessoriesEN = `For the following Florida dock design: "${currentDesignConceptEN}", suggest 3-5 suitable and useful accessories in English. Briefly explain why each accessory is a good fit. Present as a bulleted list.`;

        try {
            const accessoriesText = await callGeminiAPI(promptForAccessoriesEN, "English");
            const formattedHtml = formatGeminiTextToEnglish(accessoriesText);
            displayResult(formattedHtml, accessoriesOutputDiv, "✨ Suggested Accessories for This Design:");
        } catch (error) {
            displayResult(`<p class="text-red-600">Error fetching accessory suggestions: ${error.message}</p>`, accessoriesOutputDiv, "Accessory Suggestions Error");
            console.error('Error fetching accessory suggestions:', error);
        } finally {
            setLoadingState(false, 'accessories');
        }
    }

    if (generateBtn) generateBtn.addEventListener('click', generateInitialDesign);
    if (clearInputBtn && inputText) {
        clearInputBtn.addEventListener('click', () => {
            inputText.value = '';
            if(errorDiv) errorDiv.classList.add('hidden');
            if(outputContainer) outputContainer.classList.add('hidden');
            currentDesignConceptEN = "";
            if(extraFeaturesContainer) extraFeaturesContainer.classList.add('hidden');
            if(maintenanceOutputDiv) maintenanceOutputDiv.classList.add('hidden');
            if(accessoriesOutputDiv) accessoriesOutputDiv.classList.add('hidden');
            inputText.focus();
        });
    }
    if (maintenanceBtn) maintenanceBtn.addEventListener('click', getMaintenanceTips);
    if (accessoriesBtn) accessoriesBtn.addEventListener('click', getAccessorySuggestions);
    if (inputText) {
        inputText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateInitialDesign();
            }
        });
    }
});
