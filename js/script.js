// js/script.js
// Phiên bản ngày: 2024-05-24

// LƯU Ý QUAN TRỌNG:
// Hầu hết các chức năng trong tệp script.js gốc đã được chuyển sang các tệp module hóa hơn:
// - js/app.js: Chứa logic khởi tạo chung, xử lý header/footer, AOS, scroll-to-top,
//              active navigation links, và chức năng tìm kiếm.
// - js/loadComponents.js: Tải header và footer động.
// - js/generateDesign.js: Xử lý tính năng AI Design Generator.
// - Các tệp JS theo trang (ví dụ: js/projects-page.js, js/contact-page.js, js/design-page.js):
//   Chứa logic đặc thù cho từng trang tương ứng.

// Tệp script.js này có thể không còn cần thiết nếu tất cả các trang của bạn
// đều tuân theo cấu trúc module mới và tải các script cần thiết (app.js, loadComponents.js,
// và các script theo trang).

// Vui lòng rà soát kỹ lưỡng. Nếu không còn chức năng nào độc nhất và cần thiết
// trong tệp này mà chưa được chuyển đi, bạn có thể cân nhắc loại bỏ việc liên kết
// tệp script.js này khỏi các trang HTML của mình.

// Ví dụ, nếu có một chức năng rất cũ hoặc đặc thù nào đó mà bạn vẫn muốn giữ lại
// và nó không phù hợp để đưa vào app.js hay các module khác, bạn có thể để ở đây.
// Tuy nhiên, ưu tiên hàng đầu là module hóa và tránh trùng lặp code.

// console.log("script.js loaded - Review if this file is still needed.");

// Các hằng số có thể đã được định nghĩa ở app.js hoặc không còn cần thiết
// const SEARCH_HIGHLIGHT_CLASS = 'search-highlight'; // Đã có trong App.js
// const FOOTER_YEAR_ID = 'current-year'; // Xử lý bởi loadComponents.js

// Các hàm như initializeHeaderLogic, initializeFooterLogic, setActiveNavLink,
// performSearch, clearSearchHighlights, initializeScrollToTopButton, initializeAOS,
// logic contact form cũ, logic splash screen cũ, logic AI generator cũ
// đều đã được xử lý ở nơi khác hoặc được coi là lỗi thời/thừa.
