// 1. ดึงข้อมูลจาก URL
const params = new URLSearchParams(window.location.search);
const studentName = params.get('student-name') || '';
const className = params.get('class') || '';
const studentNumber = params.get('number') || '';

// 2. ฟังก์ชันเพิ่มข้อมูลนักเรียนไปกับทุกลิงก์ที่เกี่ยวข้อง
function addQueryStringToLinks() {
    // เลือกทุกลิงก์ที่เป็นบทเรียน (learns_...) และ ลิงก์ทำข้อสอบ (auth.html)
    const lessonLinks = document.querySelectorAll('a[href^="learns_"], a[href*="auth.html"]');
    
    lessonLinks.forEach(link => {
        try {
            const url = new URL(link.getAttribute('href'), window.location.origin);
            url.searchParams.set('student-name', studentName);
            url.searchParams.set('class', className);
            url.searchParams.set('number', studentNumber);
            link.href = url.toString();
        } catch (e) {
            console.error("Link update failed for:", link.href);
        }
    });
}

// 3. ทำงานเมื่อโหลดหน้าเว็บเสร็จ
window.addEventListener('DOMContentLoaded', () => {
    // แสดงชื่อนักเรียนบนหน้าจอ
    const nameDisplay = document.getElementById('student-name-display');
    if (studentName && nameDisplay) {
        nameDisplay.textContent = `สวัสดี, ${studentName}`;
    }
    
    // อัปเดตทุกลิงก์
    addQueryStringToLinks();
    
    // เรียกใช้งานระบบล็อก (ถ้ามีการนำเข้า auth.js ไว้)
    if (typeof CourseSystem !== 'undefined') {
        CourseSystem.init();
    }
});