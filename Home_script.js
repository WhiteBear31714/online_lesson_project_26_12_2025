document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("surveyForm");

    // ระบบอิโมจิ active
    document.querySelectorAll(".emoji-group").forEach(group => {
        group.addEventListener("click", e => {
        const targetOption = e.target.closest(".emoji-option");
        if (!targetOption) return;
        const emojis = group.querySelectorAll(".emoji");
        emojis.forEach(em => em.classList.remove("active"));
        // ทำให้เฉพาะอิโมจิที่กด active
        const emojic = targetOption.querySelector(".emoji");
        emojic.classList.add("active");
        });
    });

    form.addEventListener("submit", e => {
        e.preventDefault();

        const dataForm = new FormData(form);
        const data = Object.fromEntries(dataForm.entries());

        // เก็บคำตอบอิโมจิแต่ละข้อ
        document.querySelectorAll(".question").forEach(q => {
        const qNum = q.getAttribute("data-q");
        const active = q.querySelector(".emoji.active");
        data["Q" + qNum] = active ? active.dataset.value : "";
        });

        // คอมเมนต์เพิ่มเติม
        // data.comment = data.comment (มีอยู่แล้วจาก FormData ถ้ามี field name="comment")

        const scriptURL = "https://script.google.com/macros/s/AKfycby9prnS-Xwdx6fxu8XIV_TQbQ2qlQk7uGkDK1lvT36Rz3KVKXISVrw-wdzQFd3JcEea/exec";

        fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
        })
        .then(response => response.json())
        .then(result => {
        // ขึ้นอยู่กับว่า script ตอบกลับอะไร เช่น {status: "success"} หรือข้อความอื่น
        if (result.status === "success") {
            alert("ส่งคำตอบเรียบร้อยแล้ว!");
            form.reset();
            document.querySelectorAll(".emoji.active").forEach(el => el.classList.remove("active"));
        } else {
            alert("ส่งคำตอบสำเร็จ แต่ผลลัพธ์จาก Server ไม่ใช่ success");
        }
        })
        .catch(error => {
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล: " + error);
        });

    });
});
