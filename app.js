// 1. Nhập các thư viện cần thiết từ Firebase bằng link CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBmtB6vmfKWMq0wE8HZ8H0Uwy6ZpILdTzM",
  authDomain: "graduation-invitation-b4aeb.firebaseapp.com",
  projectId: "graduation-invitation-b4aeb",
  storageBucket: "graduation-invitation-b4aeb.firebasestorage.app",
  messagingSenderId: "280242208251",
  appId: "1:280242208251:web:82468915f889e9532e1f5e",
  measurementId: "G-1XS55GV7EQ"
};

// 3. Khởi tạo Firebase và Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Tham chiếu đến bảng "wishes" trong database
const wishesCollection = collection(db, "wishes");

// ======= CHỨC NĂNG 1: LẮNG NGHE & HIỂN THỊ LỜI CHÚC (REAL-TIME) =======
const wishesGrid = document.getElementById("wishesGrid");

// Tạo câu truy vấn: Lấy dữ liệu và sắp xếp theo thời gian mới nhất lên đầu
const q = query(wishesCollection, orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
    // Xóa nội dung cũ
    wishesGrid.innerHTML = ""; 
    
    if (snapshot.empty) {
        wishesGrid.innerHTML = "<p style='text-align:center; width: 100%; color: #888;'>Chưa có lời chúc nào. Hãy là người đầu tiên nhé!</p>";
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        
        let timeString = "";
        if (data.timestamp) {
            const date = data.timestamp.toDate();
            timeString = date.toLocaleDateString("vi-VN") + " - " + date.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'});
        }

        const wishCard = document.createElement("div");
        wishCard.className = "wish-card";
        wishCard.innerHTML = `
            <h4>${escapeHTML(data.name)}</h4>
            <p>"${escapeHTML(data.message)}"</p>
            <span class="date">${timeString}</span>
        `;
        
        wishesGrid.appendChild(wishCard);
    });
});

// ======= CHỨC NĂNG 2: GỬI LỜI CHÚC LÊN DATABASE =======
const form = document.getElementById("wishForm");
const btnSubmit = form.querySelector('.btn-submit');

form.addEventListener("submit", async (e) => {
    e.preventDefault(); 
    
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<span>Đang gửi...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
    btnSubmit.disabled = true;

    const name = document.getElementById("guestName").value;
    const message = document.getElementById("guestMessage").value;

    try {
        await addDoc(wishesCollection, {
            name: name,
            message: message,
            timestamp: serverTimestamp()
        });
        
        form.reset();
        alert("Tuyệt vời! Lời chúc của bạn đã được gửi đi.");
    } catch (error) {
        console.error("Lỗi khi gửi:", error);
        alert("Ôi, có lỗi nhỏ xảy ra. Bạn thử lại nhé!");
    } finally {
        btnSubmit.innerHTML = originalBtnText;
        btnSubmit.disabled = false;
    }
});

// Hàm chống mã độc XSS
function escapeHTML(str) {
    if (!str) return "";
    let div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}