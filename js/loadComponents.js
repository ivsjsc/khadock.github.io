// js/loadComponents.js
// Nhiệm vụ chính: Tải nội dung HTML cho các components và phát sự kiện khi hoàn thành.

/**
 * Tải nội dung từ một tệp HTML và chèn vào một phần tử giữ chỗ (placeholder).
 * @param {string} placeholderId - ID của phần tử giữ chỗ.
 * @param {string} filePath - Đường dẫn đến tệp HTML cần tải.
 */
async function loadComponent(placeholderId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Không thể tải component từ ${filePath}: ${response.status} ${response.statusText}`);
        }
        const html = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = html;
            // Phát sự kiện tùy chỉnh sau khi component được tải thành công
            document.dispatchEvent(new CustomEvent(`${placeholderId}Loaded`, {
                detail: { placeholderId, filePath }
            }));
            console.log(`[Script] Component '${filePath}' đã được tải vào '#${placeholderId}'.`);
        } else {
            console.error(`[Script] Không tìm thấy phần tử placeholder với id '${placeholderId}'.`);
        }
    } catch (error) {
        console.error(`[Script] Lỗi khi tải component từ ${filePath}:`, error);
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = `<p style="color: red; padding: 1rem;">Lỗi tải component (${filePath}). Vui lòng kiểm tra console.</p>`;
        }
    }
}

/**
 * Tải tất cả các components chính của ứng dụng (header, footer).
 * @param {function} [callback] - Hàm callback tùy chọn để thực thi sau khi tất cả components đã được tải.
 */
async function loadAppComponents(callback) {
    const HEADER_COMPONENT_URL = '/components/header.html'; // Đảm bảo đường dẫn này chính xác
    const FOOTER_COMPONENT_URL = '/components/footer.html'; // Đảm bảo đường dẫn này chính xác

    console.log('[Script] Bắt đầu tải header và footer...');
    await Promise.all([
        loadComponent('header-placeholder', HEADER_COMPONENT_URL),
        loadComponent('footer-placeholder', FOOTER_COMPONENT_URL)
    ]);
    console.log('[Script] Header và footer đã được yêu cầu tải.');

    if (typeof callback === 'function') {
        callback();
    }
    // Phát sự kiện sau khi tất cả components chính đã được yêu cầu tải (không nhất thiết đã hoàn thành render)
    document.dispatchEvent(new CustomEvent('allAppComponentsLoadInitiated'));
}

// Tự động bắt đầu quá trình tải components khi script này được thực thi.
if (typeof window !== 'undefined') {
    window.loadAppComponents = loadAppComponents; // Cho phép gọi từ global scope nếu cần
    loadAppComponents().catch(error => {
        console.error("[Script] Lỗi nghiêm trọng trong quá trình khởi tạo tải components:", error);
    });
}
