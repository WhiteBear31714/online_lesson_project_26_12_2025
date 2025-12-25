let currentIndex = 0;
const track = document.getElementById('track');

// --- Logic ควบคุม Carousel ---
if (track) {
    const items = document.querySelectorAll('.carousel-item');
    const tabs = document.querySelectorAll('.carousel-tabs button');
    const totalItems = items.length;

    function updateCarousel() {
        // เลื่อน Track โดยใช้ CSS Transform
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // อัปเดตปุ่ม Tab ให้มีสถานะ 'active'
        tabs.forEach((tab, index) => {
            if(index === currentIndex) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    function moveSlide(direction) {
        currentIndex += direction;
        // วนกลับไปหน้าแรก/หน้าสุดท้าย เมื่อถึงขอบ
        if (currentIndex < 0) {
            currentIndex = totalItems - 1;
        } else if (currentIndex >= totalItems) {
            currentIndex = 0;
        }
        updateCarousel();
    }


    function jumpTo(index) {
        currentIndex = index;
        updateCarousel();
    }

    // กำหนดฟังก์ชันให้เป็น Global เพื่อให้ HTML สามารถเรียกใช้ได้ (onclick)
    window.moveSlide = moveSlide;
    window.jumpTo = jumpTo;

    // เริ่มต้น: อัพเดท Carousel เมื่อโหลดหน้าเว็บเสร็จ
    updateCarousel();
}


// --- Logic สำหรับแสดงชื่อนักเรียน (นำมาจาก app.js) ---
const params = new URLSearchParams(window.location.search);
const studentName = params.get('student-name');
const nameDisplayElement = document.getElementById('student-name-display');

if (studentName && nameDisplayElement) {
    nameDisplayElement.textContent = studentName;
}