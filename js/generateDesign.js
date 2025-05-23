document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('ai-generate-btn');
    const inputText = document.getElementById('ai-design-input');
    const loadingDiv = document.getElementById('ai-loading');
    const errorDiv = document.getElementById('ai-error');
    const outputDiv = document.getElementById('ai-output');

    async function generateDesign() {
        try {
            // Hiển thị loading
            loadingDiv.classList.remove('hidden');
            errorDiv.classList.add('hidden');
            outputDiv.classList.add('hidden');
            generateBtn.disabled = true;

            // Kiểm tra input
            const userInput = inputText.value.trim();
            if (!userInput) {
                throw new Error('Please enter a description for your dream dock.');
            }

            // Gọi API Gemini
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Act as an expert dock designer. Create a detailed dock design concept based on this description: ${userInput}`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate design. Please try again.');
            }

            const data = await response.json();
            
            // Hiển thị kết quả
            outputDiv.innerHTML = `
                <h4 class="font-semibold text-lg mb-3 text-sky-700">KhaDock AI Design Concept:</h4>
                <div class="prose max-w-none">
                    ${data.candidates[0].content.parts[0].text}
                </div>
            `;
            outputDiv.classList.remove('hidden');

        } catch (error) {
            // Hiển thị lỗi
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        } finally {
            // Ẩn loading và enable lại nút
            loadingDiv.classList.add('hidden');
            generateBtn.disabled = false;
        }
    }

    // Thêm event listener cho nút Generate
    generateBtn.addEventListener('click', generateDesign);

    // Thêm event listener cho phím Enter trong textarea
    inputText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateDesign();
        }
    });
});