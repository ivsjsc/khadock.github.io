// js/generateDesign.js

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('ai-generate-btn');
    const inputText = document.getElementById('ai-design-input');
    const loadingDiv = document.getElementById('ai-loading');
    const loadingTextElement = document.getElementById('ai-loading-text');
    const errorDiv = document.getElementById('ai-error');
    const outputDiv = document.getElementById('ai-output');

    // Function to format text from AI, attempting to handle markdown-like structures
    function formatDesignText(text) {
        if (!text) return '';

        let html = text;

        // Protect code blocks or preformatted text if AI might return them
        // (Simple example, might need more robust handling for complex markdown)
        // html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // Bold: **text** or __text__
        html = html.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
        // Italic: *text* or _text_
        html = html.replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>');

        // Headers: # Header, ## Header, etc.
        html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
        html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Unordered lists: * item, - item, + item
        // Ordered lists: 1. item
        // This is complex to do perfectly with regex, especially nested lists.
        // A more robust Markdown parser might be needed for complex list structures.
        // Simple list item handling (assumes one level):
        html = html.replace(/^\s*[-*+]\s+(.*)/gim, '<li>$1</li>');
        html = html.replace(/^\s*\d+\.\s+(.*)/gim, '<li>$1</li>'); // Treat ordered as unordered for simplicity here

        // Wrap consecutive <li> items in <ul>
        // This regex is a bit greedy and might need refinement for complex cases
        html = html.replace(/(<li>.*?<\/li>\s*)+/gim, (match) => `<ul>${match.trim()}</ul>`);
        // Clean up <ul> tags that might be empty or wrap non-list content incorrectly
        html = html.replace(/<ul>\s*<\/ul>/gim, '');


        // Paragraphs: Replace double newlines with <p> tags
        // This is also tricky. A simple approach:
        const paragraphs = html.split(/\n\s*\n/);
        html = paragraphs.map(p => {
            const trimmedP = p.trim();
            if (trimmedP.startsWith('<ul>') && trimmedP.endsWith('</ul>')) {
                return trimmedP; // Don't wrap lists in <p>
            }
            if (trimmedP.match(/^<h[1-6]>/) && trimmedP.match(/<\/h[1-6]>$/)) {
                return trimmedP; // Don't wrap headers in <p>
            }
            return trimmedP ? `<p>${trimmedP.replace(/\n/g, '<br>')}</p>` : '';
        }).join('');


        // Final cleanup for any remaining single newlines within paragraphs that weren't caught
        // html = html.replace(/\n/g, '<br>'); // This might be too aggressive now

        return html;
    }


    async function handleGenerateDesign() {
        if (!inputText || !loadingDiv || !errorDiv || !outputDiv || !generateBtn || !loadingTextElement) {
            console.error('One or more AI design generator elements are missing from the DOM.');
            return;
        }

        const userInput = inputText.value.trim();
        if (!userInput) {
            errorDiv.textContent = 'Please enter a description for your dream dock.';
            errorDiv.classList.remove('hidden');
            outputDiv.classList.add('hidden');
            inputText.focus();
            return;
        }

        loadingDiv.classList.remove('hidden');
        loadingTextElement.textContent = 'Generating your idea... This may take a moment.';
        errorDiv.classList.add('hidden');
        outputDiv.classList.add('hidden');
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-75', 'cursor-not-allowed');

        try {
            const apiKey = ""; // Empty API key for Canvas environment
            const modelName = "gemini-2.0-flash";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const promptText = `As a creative dock design expert for KhaDock.com in Florida, generate a detailed and inspiring boat dock concept based on the following user input: "${userInput}".
Provide the response in well-structured English, including:
1.  **Concept Name:** (A catchy, descriptive name)
2.  **Overall Vision:** (1-2 sentences describing the main idea and feel)
3.  **Key Features & Functionality:** (List 3-5 distinct features with brief descriptions)
4.  **Suggested Materials:** (List 2-3 primary materials suitable for Florida)
5.  **Aesthetic Style:** (1-2 sentences describing the look and feel)
6.  **Best Suited For:** (1 sentence about ideal users or property type)

Ensure the concept is practical for Florida's coastal environment (sun, saltwater, storms). The total length should be around 150-250 words. Format features and materials as bullet points if possible.`;

            const payload = {
                contents: [{
                    role: "user",
                    parts: [{ text: promptText }]
                }],
                // Optional: Add generationConfig for more control if needed
                // generationConfig: {
                //   temperature: 0.7,
                //   topK: 40,
                // }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Graceful error parsing
                const errorMessage = errorData?.error?.message || `API request failed with status: ${response.status}.`;
                console.error("API Error Data:", errorData);
                throw new Error(errorMessage);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const rawText = result.candidates[0].content.parts[0].text;
                const formattedHtml = formatDesignText(rawText);

                outputDiv.innerHTML = `
                    <h4 class="font-semibold text-lg mb-3 text-sky-700">KhaDock AI Design Concept:</h4>
                    <div class="prose prose-sm sm:prose-base max-w-none text-slate-700">
                        ${formattedHtml}
                    </div>`;
                outputDiv.classList.remove('hidden');
            } else {
                console.error("Invalid API response structure:", result);
                throw new Error('Received an unexpected response structure from the AI. Please try again.');
            }

        } catch (error) {
            errorDiv.textContent = `Error: ${error.message}`;
            errorDiv.classList.remove('hidden');
            console.error('Error in handleGenerateDesign:', error);
        } finally {
            loadingDiv.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateDesign);
    } else {
        console.warn("AI Generate button (ai-generate-btn) not found.");
    }

    if (inputText) {
        inputText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerateDesign();
            }
        });
    } else {
        console.warn("AI Input textarea (ai-design-input) not found.");
    }
});
