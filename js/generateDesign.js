// js/generateDesign.js

document.addEventListener('DOMContentLoaded', () => {
    // Main AI Design Elements
    const generateBtn = document.getElementById('ai-generate-btn');
    const clearInputBtn = document.getElementById('ai-clear-input-btn');
    const inputText = document.getElementById('ai-design-input');
    const loadingDiv = document.getElementById('ai-loading');
    const loadingTextElement = document.getElementById('ai-loading-text');
    const errorDiv = document.getElementById('ai-error');
    const outputContainer = document.getElementById('ai-output-container'); // Container for all outputs
    const mainOutputDiv = document.getElementById('ai-output'); // For initial design concept

    // Elements for Additional Gemini Features
    const extraFeaturesContainer = document.getElementById('gemini-extra-features');
    const maintenanceBtn = document.getElementById('ai-maintenance-btn');
    const accessoriesBtn = document.getElementById('ai-accessories-btn');
    const maintenanceLoadingDiv = document.getElementById('ai-maintenance-loading');
    const accessoriesLoadingDiv = document.getElementById('ai-accessories-loading');
    const maintenanceOutputDiv = document.getElementById('ai-maintenance-output');
    const accessoriesOutputDiv = document.getElementById('ai-accessories-output');

    let currentDesignConcept = ""; // Store the generated design concept for reuse

    // Helper to show/hide loading state
    function setLoadingState(isLoading, type = 'main') {
        let loader, textEl;
        if (type === 'main') {
            loader = loadingDiv;
            textEl = loadingTextElement;
            if (textEl) textEl.textContent = 'Đang tạo ý tưởng...';
            if(generateBtn) generateBtn.disabled = isLoading;
            if(generateBtn) generateBtn.classList.toggle('opacity-75', isLoading);
            if(generateBtn) generateBtn.classList.toggle('cursor-not-allowed', isLoading);
        } else if (type === 'maintenance') {
            loader = maintenanceLoadingDiv;
            if(maintenanceBtn) maintenanceBtn.disabled = isLoading;
        } else if (type === 'accessories') {
            loader = accessoriesLoadingDiv;
            if(accessoriesBtn) accessoriesBtn.disabled = isLoading;
        }

        if (loader) loader.classList.toggle('hidden', !isLoading);
        if (isLoading) { // Hide errors and outputs when loading
            if(errorDiv) errorDiv.classList.add('hidden');
            if (type === 'main' && outputContainer) outputContainer.classList.add('hidden');
            if (type === 'maintenance' && maintenanceOutputDiv) maintenanceOutputDiv.classList.add('hidden');
            if (type === 'accessories' && accessoriesOutputDiv) accessoriesOutputDiv.classList.add('hidden');
        }
    }

    // Helper to display errors
    function displayError(message) {
        if (!errorDiv) return;
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        if (outputContainer) outputContainer.classList.add('hidden'); // Hide main output on error
    }

    // Helper to display results in specified div
    function displayResult(htmlContent, targetDiv) {
        if (!targetDiv) return;
        targetDiv.innerHTML = htmlContent;
        targetDiv.classList.remove('hidden');
        if(errorDiv) errorDiv.classList.add('hidden'); // Hide error on success
    }

    // Function to format text from AI (improved)
    function formatGeminiText(text) {
        if (!text) return '<p>Không có nội dung để hiển thị.</p>';

        let html = text;
        // Protect code blocks (though unlikely for this app)
        html = html.replace(/```([\s\S]*?)```/g, (match, p1) => `<pre class="bg-slate-200 p-2 rounded overflow-x-auto text-sm"><code>${p1.trim()}</code></pre>`);

        // Headers (e.g., **Concept Name:** -> <h4>Concept Name:</h4>)
        // More specific to the expected output structure
        html = html.replace(/\*\*(.*?):\*\*/g, (match, p1) => `<h4 class="text-lg font-semibold text-sky-700 mt-3 mb-1">${p1.trim()}:</h4>`);
        html = html.replace(/(\d+\.\s*\*\*(.*?):\*\*)/g, (match, p1, p2) => `<h4 class="text-lg font-semibold text-sky-700 mt-3 mb-1">${p2.trim()}:</h4>`);


        // Bold text (that isn't part of a header-like structure)
        html = html.replace(/(?<!\d\.\s*)\*\*(.*?)\*\*/g, '<strong>$1</strong>');


        // List items (handles * or -)
        // Split by lines, then process
        const lines = html.split('\n');
        let inList = false;
        html = lines.map(line => {
            line = line.trim();
            if (line.match(/^[\*\-]\s+/)) {
                let listItem = line.replace(/^[\*\-]\s+/, '').trim();
                // Further process bold within list items
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
                // Avoid wrapping already structured elements in <p>
                if (line.match(/^<h[1-6]>/) || line.match(/^<ul>/) || line.match(/^<pre>/) || line.trim() === '') {
                    return line;
                }
                return line ? `<p>${line}</p>` : '';
            }
        }).join('');

        if (inList) { // Close any open list
            html += '</ul>';
        }
        // Remove empty paragraphs that might result from formatting
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<\/ul>\s*<ul>/g, ''); // Consolidate adjacent lists

        return html;
    }

    // Generic Gemini API call function
    async function callGeminiAPI(promptText) {
        const apiKey = ""; // Empty API key for Canvas environment
        const modelName = "gemini-2.0-flash";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ role: "user", parts: [{ text: promptText }] }],
            generationConfig: {
                // temperature: 0.7, // Adjust for creativity vs. factuality
                // maxOutputTokens: 500, // Limit response length if needed
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData?.error?.message || `Yêu cầu API thất bại với mã trạng thái: ${response.status}.`;
            console.error("API Error Data:", errorData);
            throw new Error(errorMessage);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Cấu trúc phản hồi API không hợp lệ:", result);
            throw new Error('Nhận được cấu trúc phản hồi không mong muốn từ AI. Vui lòng thử lại.');
        }
    }

    // Main function to generate initial dock design
    async function generateInitialDesign() {
        if (!inputText || !mainOutputDiv) {
            console.error("Thiếu các thành phần DOM cần thiết cho việc tạo thiết kế chính.");
            return;
        }
        const userInput = inputText.value.trim();
        if (!userInput) {
            displayError('Vui lòng mô tả ý tưởng cầu tàu của bạn.');
            inputText.focus();
            return;
        }

        setLoadingState(true, 'main');
        currentDesignConcept = ""; // Reset stored concept
        if(extraFeaturesContainer) extraFeaturesContainer.classList.add('hidden'); // Hide extra buttons
        if(maintenanceOutputDiv) maintenanceOutputDiv.classList.add('hidden');
        if(accessoriesOutputDiv) accessoriesOutputDiv.classList.add('hidden');


        const promptForDesign = `Là một chuyên gia thiết kế cầu tàu sáng tạo cho KhaDock.com ở Florida, hãy tạo một khái niệm thiết kế cầu tàu chi tiết và truyền cảm hứng dựa trên thông tin người dùng sau: "${userInput}".
Cung cấp phản hồi bằng tiếng Việt có cấu trúc rõ ràng, bao gồm các mục sau (sử dụng Markdown cho tiêu đề đậm, ví dụ: **Tên Khái Niệm:**):
1.  **Tên Khái Niệm:** (Một cái tên hấp dẫn, dễ hình dung)
2.  **Tầm Nhìn Tổng Thể:** (1-2 câu mô tả ý tưởng chính và cảm giác mang lại)
3.  **Đặc Điểm Chính & Chức Năng:** (Liệt kê 3-5 đặc điểm nổi bật với mô tả ngắn gọn, sử dụng gạch đầu dòng)
4.  **Vật Liệu Gợi Ý:** (Liệt kê 2-3 vật liệu chính phù hợp với Florida, sử dụng gạch đầu dòng)
5.  **Phong Cách Thẩm Mỹ:** (1-2 câu mô tả vẻ ngoài và cảm nhận)
6.  **Phù Hợp Nhất Với:** (1 câu về đối tượng người dùng/loại hình bất động sản lý tưởng)

Đảm bảo tính thực tế cho môi trường Florida (nắng, nước mặn, bão). Tổng độ dài khoảng 150-250 từ.`;

        try {
            const designText = await callGeminiAPI(promptForDesign);
            currentDesignConcept = designText; // Store for later use
            const formattedHtml = formatGeminiText(designText);
            displayResult(`<h3 class="text-xl font-semibold text-sky-800 mb-3">Ý Tưởng Thiết Kế Cầu Tàu AI của KhaDock:</h3>${formattedHtml}`, mainOutputDiv);
            if (outputContainer) outputContainer.classList.remove('hidden');
            if (extraFeaturesContainer) extraFeaturesContainer.classList.remove('hidden'); // Show extra feature buttons
        } catch (error) {
            displayError(`Lỗi: ${error.message}`);
            console.error('Lỗi khi tạo thiết kế ban đầu:', error);
        } finally {
            setLoadingState(false, 'main');
        }
    }

    // Function to get maintenance tips
    async function getMaintenanceTips() {
        if (!currentDesignConcept) {
            displayError("Vui lòng tạo một thiết kế trước khi yêu cầu mẹo bảo trì.");
            return;
        }
        if (!maintenanceOutputDiv) return;

        setLoadingState(true, 'maintenance');
        const promptForMaintenance = `Dựa trên mô tả thiết kế cầu tàu sau đây ở Florida: "${currentDesignConcept}", hãy cung cấp 3-5 mẹo bảo trì quan trọng và cụ thể bằng tiếng Việt. Tập trung vào các yếu tố như vật liệu được đề cập, khí hậu Florida, và các vấn đề phổ biến. Trình bày dưới dạng danh sách gạch đầu dòng.`;

        try {
            const tipsText = await callGeminiAPI(promptForMaintenance);
            const formattedHtml = formatGeminiText(tipsText);
            displayResult(`<h4 class="text-lg font-semibold text-teal-700 mt-1 mb-2">✨ Mẹo Bảo Trì Cho Thiết Kế Này:</h4>${formattedHtml}`, maintenanceOutputDiv);
        } catch (error) {
            displayResult(`<p class="text-red-600">Lỗi khi lấy mẹo bảo trì: ${error.message}</p>`, maintenanceOutputDiv);
            console.error('Lỗi khi lấy mẹo bảo trì:', error);
        } finally {
            setLoadingState(false, 'maintenance');
        }
    }

    // Function to suggest accessories
    async function getAccessorySuggestions() {
        if (!currentDesignConcept) {
            displayError("Vui lòng tạo một thiết kế trước khi yêu cầu gợi ý phụ kiện.");
            return;
        }
        if (!accessoriesOutputDiv) return;

        setLoadingState(true, 'accessories');
        const promptForAccessories = `Cho thiết kế cầu tàu ở Florida sau: "${currentDesignConcept}", hãy gợi ý 3-5 phụ kiện phù hợp và hữu ích bằng tiếng Việt. Giải thích ngắn gọn tại sao mỗi phụ kiện lại phù hợp. Trình bày dưới dạng danh sách gạch đầu dòng.`;

        try {
            const accessoriesText = await callGeminiAPI(promptForAccessories);
            const formattedHtml = formatGeminiText(accessoriesText);
            displayResult(`<h4 class="text-lg font-semibold text-indigo-700 mt-1 mb-2">✨ Phụ Kiện Gợi Ý Cho Thiết Kế Này:</h4>${formattedHtml}`, accessoriesOutputDiv);
        } catch (error) {
            displayResult(`<p class="text-red-600">Lỗi khi lấy gợi ý phụ kiện: ${error.message}</p>`, accessoriesOutputDiv);
            console.error('Lỗi khi lấy gợi ý phụ kiện:', error);
        } finally {
            setLoadingState(false, 'accessories');
        }
    }

    // Event Listeners
    if (generateBtn) {
        generateBtn.addEventListener('click', generateInitialDesign);
    }
    if (clearInputBtn && inputText) {
        clearInputBtn.addEventListener('click', () => {
            inputText.value = '';
            if(errorDiv) errorDiv.classList.add('hidden');
            if(outputContainer) outputContainer.classList.add('hidden');
            currentDesignConcept = "";
            if(extraFeaturesContainer) extraFeaturesContainer.classList.add('hidden');
            if(maintenanceOutputDiv) maintenanceOutputDiv.classList.add('hidden');
            if(accessoriesOutputDiv) accessoriesOutputDiv.classList.add('hidden');
            inputText.focus();
        });
    }

    if (maintenanceBtn) {
        maintenanceBtn.addEventListener('click', getMaintenanceTips);
    }
    if (accessoriesBtn) {
        accessoriesBtn.addEventListener('click', getAccessorySuggestions);
    }

    if (inputText) {
        inputText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateInitialDesign();
            }
        });
    }
});
