// Cấu trúc dữ liệu để lưu trữ khách hàng
let customers = JSON.parse(localStorage.getItem('customers')) || [];

// Tab hiện tại đang hoạt động
let currentTab = 'customers';

// Lấy các phần tử DOM
const tabs = document.querySelectorAll('nav li a');
const customerSearchInput = document.getElementById('customerSearch');
const addCustomerBtn = document.getElementById('addCustomerBtn');
const customerModalOverlay = document.getElementById('customerModalOverlay');
const customerModal = document.getElementById('customerModal');
const customerModalTitle = document.getElementById('customerModalTitle');
const customerForm = document.getElementById('customerForm');
const customerIdField = document.getElementById('customerIdField');
const customerTableBody = document.getElementById('customerTableBody');

// Thiết lập dữ liệu mẫu nếu chưa có khách hàng nào
function initializeSampleData() {
    if (customers.length === 0) {
        customers = [
            { id: 'KH123456', code: 'KH0001', name: 'Nguyễn Văn A', email: 'a@example.com', phone: '0123456789', address: '123 Đường ABC, TP. HCM', source: 'Facebook', contactPerson: '' },
            { id: 'KH123457', code: 'KH0002', name: 'Trần Thị B', email: 'b@example.com', phone: '0987654321', address: '456 Đường XYZ, Hà Nội', source: 'Email marketing', contactPerson: 'Nguyễn C' }
        ];
        localStorage.setItem('customers', JSON.stringify(customers));
    }
}

// Chức năng chuyển đổi tab
function switchTab(tabName) {
    // Ẩn tất cả các nội dung tab
    document.querySelectorAll('.tab-content').forEach(tabContent => {
        tabContent.classList.remove('active-tab');
    });

    // Xóa lớp 'active' khỏi tất cả các tab
    tabs.forEach(tab => tab.classList.remove('active'));

    // Hiển thị tab được chọn và thêm lớp 'active'
    document.getElementById(tabName).classList.add('active-tab');
    document.querySelector(`nav a[data-tab="${tabName}"]`).classList.add('active');

    currentTab = tabName;
}

// Tạo ID khách hàng mới
function generateCustomerId() {
    const nextIdNum = customers.length > 0 ? Math.max(...customers.map(c => parseInt(c.code.replace('KH', '')))) + 1 : 1;
    return `KH${String(nextIdNum).padStart(4, '0')}`;
}

// Mở modal thêm/sửa khách hàng
function openCustomerModal(isEditMode = false, customerData = null) {
    if (isEditMode && customerData) {
        customerModalTitle.textContent = 'Chỉnh sửa khách hàng';
        customerIdField.value = customerData.id;
        document.getElementById('customerCode').value = customerData.code;
        document.getElementById('customerName').value = customerData.name;
        document.getElementById('customerEmail').value = customerData.email || '';
        document.getElementById('customerPhone').value = customerData.phone;
        document.getElementById('customerAddress').value = customerData.address || '';
        document.getElementById('customerSource').value = customerData.source || '';
        document.getElementById('customerContactPerson').value = customerData.contactPerson || '';
        document.getElementById('customerCode').setAttribute('readonly', 'readonly'); // Mã KH không sửa được khi chỉnh sửa
    } else {
        customerModalTitle.textContent = 'Thêm khách hàng';
        customerForm.reset(); // Đặt lại form cho mục nhập mới
        document.getElementById('customerCode').value = generateCustomerId(); // Tạo mã KH mới
        customerIdField.value = ''; // Xóa ID cũ
        document.getElementById('customerCode').removeAttribute('readonly'); // Cho phép sửa mã KH khi thêm mới
    }
    customerModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Ngăn cuộn trang
}

// Đóng modal khách hàng
function closeCustomerModal() {
    customerModalOverlay.classList.add('hidden');
    document.body.style.overflow = ''; // Cho phép cuộn trang trở lại
    customerForm.reset(); // Đặt lại form sau khi đóng
    document.getElementById('customerCode').removeAttribute('readonly'); // Đảm bảo trường mã KH có thể chỉnh sửa cho lần thêm mới tiếp theo
}

// Lưu khách hàng
function saveCustomer(event) {
    event.preventDefault(); // Ngăn chặn form submit mặc định

    const id = customerIdField.value;
    const code = document.getElementById('customerCode').value.toUpperCase();
    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value || '';
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value || '';
    const source = document.getElementById('customerSource').value || '';
    const contactPerson = document.getElementById('customerContactPerson').value || '';

    // Kiểm tra các trường bắt buộc
    if (!name || !phone || !code) {
    alert('Please fill in the customer name, phone number and customer code.');
        return;
    }

    if (id) {
        // Chế độ chỉnh sửa
        const customerIndex = customers.findIndex(c => c.id === id);
        if (customerIndex !== -1) {
            customers[customerIndex] = { ...customers[customerIndex], code, name, email, phone, address, source, contactPerson };
        }
    } else {
        // Chế độ thêm mới
        // Kiểm tra trùng mã KH
        if (customers.some(c => c.code === code)) {
            alert('Customer code already exists. Please choose a different code.');
            return;
        }
        customers.push({
            id: Date.now().toString(), // Sử dụng timestamp làm ID duy nhất
            code,
            name,
            email,
            phone,
            address,
            source,
            contactPerson
        });
    }

    localStorage.setItem('customers', JSON.stringify(customers));
    renderCustomersTable(); // Cập nhật lại bảng
    closeCustomerModal(); // Đóng modal
}

// Hiển thị bảng khách hàng
function renderCustomersTable(filteredCustomers = customers) {
    customerTableBody.innerHTML = ''; // Xóa nội dung hiện có

    if (filteredCustomers.length === 0) {
        customerTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Không có khách hàng nào</td></tr>`;
        return;
    }

    filteredCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.setAttribute('id', `customer-${customer.id}`);
        row.innerHTML = `
            <td>${customer.code}</td>
            <td>${customer.name}</td>
            <td>${customer.email || ''}</td>
            <td>${customer.phone}</td>
            <td>${customer.address || ''}</td>
            <td>${customer.source || 'N/A'}</td>
            <td class="action-buttons">
                <button class="btn-success btn-icon edit-customer-btn" data-id="${customer.id}">Sửa</button>
                <button class="btn-danger btn-icon delete-customer-btn" data-id="${customer.id}">Xóa</button>
            </td>
        `;
        customerTableBody.appendChild(row);
    });

    // Thêm event listener cho các nút Sửa và Xóa
    document.querySelectorAll('.edit-customer-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const customerId = e.target.dataset.id;
            const customerToEdit = customers.find(c => c.id === customerId);
            if (customerToEdit) {
                openCustomerModal(true, customerToEdit);
            }
        });
    });

    document.querySelectorAll('.delete-customer-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const customerId = e.target.dataset.id;
            if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
                customers = customers.filter(c => c.id !== customerId);
                localStorage.setItem('customers', JSON.stringify(customers));
                renderCustomersTable();
            }
        });
    });
}

// Lọc khách hàng theo từ khóa tìm kiếm
function filterCustomers(searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        customer.code.toLowerCase().includes(lowerCaseSearchTerm) ||
        customer.phone.includes(lowerCaseSearchTerm) ||
        customer.email.toLowerCase().includes(lowerCaseSearchTerm)
    );
    renderCustomersTable(filteredCustomers);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeSampleData();
    renderCustomersTable(); // Hiển thị bảng khách hàng khi tải trang

    // Chuyển đổi tab
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(e.target.dataset.tab);
        });
    });

    // Tìm kiếm khách hàng
    customerSearchInput.addEventListener('input', (e) => {
        filterCustomers(e.target.value);
    });

    // Mở modal thêm khách hàng
    addCustomerBtn.addEventListener('click', () => openCustomerModal(false));

    // Đóng modal khách hàng khi click vào nút đóng hoặc bên ngoài modal
    customerModal.querySelector('.btn-close').addEventListener('click', closeCustomerModal);
    customerModalOverlay.addEventListener('click', (e) => {
        if (e.target === customerModalOverlay) {
            closeCustomerModal();
        }
    });

    // Lưu khách hàng khi submit form
    customerForm.addEventListener('submit', saveCustomer);

    // Xử lý nút Thêm mới báo giá (hiện tại chỉ là placeholder)
    document.getElementById('addQuotationBtn')?.addEventListener('click', () => {
        alert('Chức năng thêm báo giá sẽ sớm được phát triển!');
    });
});
