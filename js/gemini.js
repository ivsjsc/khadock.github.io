document.addEventListener('DOMContentLoaded', function () {
    const geminiUserInput = document.getElementById('gemini-user-input');
    const geminiSubmitBtn = document.getElementById('gemini-submit-btn');
    const geminiLoading = document.getElementById('gemini-loading');
    const geminiOutput = document.getElementById('gemini-output');
    const geminiError = document.getElementById('gemini-error');
    const translateBtn = document.getElementById('translate-btn');
    const loadingText = document.getElementById('loading-text');
    let originalText = '';
    let isTranslated = false;

    if (geminiSubmitBtn && geminiUserInput) {
        geminiSubmitBtn.addEventListener('click', async () => {
            try {
                // Input validation
                const userInput = geminiUserInput.value.trim();
                if (!userInput) {
                    throw new Error('Please describe your idea or needs.');
                }

                // UI State: Loading
                setLoadingState(true);

                // API Call
                const response = await makeGeminiRequest(userInput);
                
                // Process Response
                handleGeminiResponse(response);

            } catch (error) {
                handleGeminiError(error);
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Translation handler
    if (translateBtn) {
        translateBtn.addEventListener('click', handleTranslation);
    }
});

// Helper functions
function setLoadingState(isLoading) {
    geminiLoading.classList.toggle('hidden', !isLoading);
    geminiSubmitBtn.disabled = isLoading;
    geminiSubmitBtn.classList.toggle('opacity-75', isLoading);
    geminiSubmitBtn.classList.toggle('cursor-not-allowed', isLoading);
    geminiOutput.classList.add('hidden');
    geminiError.classList.add('hidden');
    translateBtn.classList.add('hidden');
}