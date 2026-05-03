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
const wishesCollection = collection(db, "wishes");


// =====================================================
// CHỨC NĂNG 1: SCROLL REVEAL (LẶP LẠI MỌI LẦN SCROLL)
// =====================================================

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active');
        }
    });
}, {
    threshold: 0.1,
    // Kích hoạt trước khi phần tử chạm đáy viewport 60px
    // → Tránh section cao phải scroll rất sâu mới kích hoạt
    rootMargin: "0px 0px -60px 0px"
});


// --- Hàm tiện ích: gắn class reveal và bắt đầu theo dõi ---
function registerReveal(el, type = 'normal') {
    if (!el) return;
    if (type === 'info') {
        el.classList.add('reveal-info');
    } else {
        // Tránh thêm trùng class
        if (!el.classList.contains('reveal')) {
            el.classList.add('reveal');
        }
    }
    revealObserver.observe(el);
}


// --- Đăng ký các phần tử TĨNH có sẵn trong HTML ---

// Glass-box trên hero (tiêu đề + lời mời)
document.querySelectorAll('.glass-box').forEach(el => registerReveal(el));

// Info-container (bảng thời gian, địa điểm)
// Dùng type 'info' vì nó có transform: translateY(-80px) riêng — không thể dùng reveal thường
registerReveal(document.querySelector('.info-container'), 'info');

// Form gửi lời chúc (glass-panel)
document.querySelectorAll('.glass-panel').forEach(el => registerReveal(el));

// Tiêu đề "Sổ Lưu Bút"
registerReveal(document.querySelector('.wishes-header'));

// Bất kỳ phần tử nào trong HTML đã có sẵn class .reveal — chỉ cần observe, không thêm class lại
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// =====================================================
// CHỨC NĂNG 2: HIỂN THỊ LỜI CHÚC REAL-TIME
// =====================================================
const wishesGrid = document.getElementById("wishesGrid");
const q = query(wishesCollection, orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
    wishesGrid.innerHTML = "";

    if (snapshot.empty) {
        wishesGrid.innerHTML = "<div class='empty-wishes'>Chưa có lời chúc nào. Hãy là người đầu tiên nhé! <i class='fa-solid fa-heart' style='color: var(--primary); margin-left: 5px;'></i></div>";
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();

        let timeString = "";
        if (data.timestamp) {
            const date = data.timestamp.toDate();
            timeString = date.toLocaleDateString("vi-VN") + " - " + date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
        }

        const wishCard = document.createElement("div");
        // wish-card có CSS riêng trong .wishes-grid (không cần class .reveal)
        // Observer sẽ trực tiếp add/remove 'active' để điều khiển hiệu ứng
        wishCard.className = "wish-card";
        wishCard.innerHTML = `
            <h4>${escapeHTML(data.name)}</h4>
            <p>"${escapeHTML(data.message)}"</p>
            <span class="date">${timeString}</span>
        `;

        wishesGrid.appendChild(wishCard);

        // Theo dõi từng thẻ: cuộn ra ngoài rồi cuộn lại → nổi lên lại
        revealObserver.observe(wishCard);
    });
});


// =====================================================
// CHỨC NĂNG 3: GỬI LỜI CHÚC
// =====================================================
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