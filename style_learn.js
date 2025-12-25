document.addEventListener("DOMContentLoaded", function () {
    const lessonItems = document.querySelectorAll(".lesson-item");
    const lessonVideo = document.getElementById("lesson-video");

    lessonItems.forEach(item => {
        item.addEventListener("click", function () {
            // นำข้อมูลวิดีโอจาก data-video และเปลี่ยนวิดีโอ
            const videoId = this.getAttribute("data-video");
            lessonVideo.src = `https://www.youtube.com/embed/${videoId}`;

            // ลบคลาส active จากรายการทั้งหมด
            lessonItems.forEach(i => i.classList.remove("active"));

            // เพิ่ม active ให้หัวข้อที่ถูกคลิก
            this.classList.add("active");
        });
    });
});