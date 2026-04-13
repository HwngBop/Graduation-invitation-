// Nhập các thư viện cần thiết từ Firebase (Version 10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// THAY TOÀN BỘ ĐOẠN CONFIG NÀY BẰNG CỦA BẠN
// Lấy ở trang console.firebase.google.com
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyB-xxxxxxxxxxxxxxxxxxxx",
  authDomain: "ten-project-cua-ban.firebaseapp.com",
  projectId: "ten-project-cua-ban",
  storageBucket: "ten-project-cua-ban.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:xxxxxxxxxxxx"
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Tham chiếu đến bảng "wishes" trong database
const wishesCollection = collection(db, "wishes");

// ======= CHỨC NĂNG 1: HIỂN THỊ LỜI CHÚC (REAL-TIME) =======
const wishesGrid = document.getElementById("wishesGrid");

// Tạo câu truy vấn: Lấy dữ liệu và sắp xếp theo thời gian mới nhất lên đầu
const q = query(wishesCollection, orderBy("timestamp", "desc"));

// onSnapshot sẽ tự động chạy mỗi khi có người gửi lời chúc mới
onSnapshot(q, (snapshot) => {
    // Xóa nội dung "Đang tải..." hoặc lời chúc cũ
    wishesGrid.innerHTML = ""; 
    
    if (snapshot.empty) {
        wishesGrid.innerHTML = "<p style='text-align:center; width: 100%; color: #888;'>Chưa có lời chúc nào. Hãy là người đầu tiên nhé!</p>";
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Format lại thời gian cho đẹp (nếu có timestamp)
        let timeString = "";
        if (data.timestamp) {
            const date = data.timestamp.toDate();
            timeString = date.toLocaleDateString("vi-VN") + " - " + date.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'});
        }

        // Tạo phần tử HTML cho thẻ lời chúc
        const wishCard = document.createElement("div");
        wishCard.className = "wish-card";
        wishCard.innerHTML = `
            <h4>${escapeHTML(data.name)}</h4>
            <p>"${escapeHTML(data.message)}"</p>
            <span class="date">${timeString}</span>
        `;
        
        // Thêm vào lưới
        wishesGrid.appendChild(wishCard);
    });
});

// ======= CHỨC NĂNG 2: GỬI LỜI CHÚC LÊN DATABASE =======
const form = document.getElementById("wishForm");
const btnSubmit = form.querySelector('.btn-submit');

form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Ngăn trình duyệt reload lại trang
    
    // Đổi text nút thành Đang gửi...
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<span>Đang gửi...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
    btnSubmit.disabled = true;

    const name = document.getElementById("guestName").value;
    const message = document.getElementById("guestMessage").value;

    try {
        // Đẩy dữ liệu lên Firebase
        await addDoc(wishesCollection, {
            name: name,
            message: message,
            timestamp: serverTimestamp()
        });
        
        // Thành công: Xóa trắng form
        form.reset();
        
        // Bạn có thể thêm thư viện Alert đẹp hơn ở đây (như SweetAlert2), hiện tại dùng alert mặc định
        alert("Tuyệt vời! Lời chúc của bạn đã được gửi đi.");
    } catch (error) {
        console.error("Lỗi khi gửi:", error);
        alert("Ôi, có lỗi nhỏ xảy ra. Bạn thử lại nhé!");
    } finally {
        // Khôi phục lại trạng thái nút
        btnSubmit.innerHTML = originalBtnText;
        btnSubmit.disabled = false;
    }
});

// Hàm hỗ trợ: Chống mã độc XSS (rất quan trọng khi cho phép user nhập text)
function escapeHTML(str) {
    if (!str) return "";
    let div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}