// auth.js - Final Version
const CourseSystem = {
    // --- 1. ตรวจสอบสถานะการล็อก ---
    isUnlocked(id) {
        // เงื่อนไข: เริ่มต้น "เข้าได้แค่แบบทดสอบก่อนเรียน" เท่านั้น
        if (id === 'pre_test') return true;

        // เช็ค Local Storage สำหรับตัวอื่นๆ
        // (แก้ไขบั๊กชื่อ id ไม่ตรงกัน: quiz = post_test)
        if (id === 'quiz' && localStorage.getItem('unlocked_post_test') === 'true') return true;
        if (id === 'post_test' && localStorage.getItem('unlocked_quiz') === 'true') return true;
        
        return localStorage.getItem('unlocked_' + id) === 'true';
    },

    // สั่งปลดล็อก
    unlock(id) {
        localStorage.setItem('unlocked_' + id, 'true');
        this.refreshButtons();
    },

    // --- 2. ฟังก์ชันเช็คเงื่อนไขและปลดล็อกตัวถัดไป (Logic หลัก) ---
    checkAndProcessClick(targetId) {
        // 2.1 ถ้ายังไม่ปลดล็อก -> ห้ามเข้า
        if (!this.isUnlocked(targetId)) {
            if (targetId === 'textbook') alert("⚠️ กรุณาทำ 'แบบทดสอบก่อนเรียน' ให้เสร็จก่อนครับ");
            else if (targetId === 'learns_01') alert("⚠️ กรุณาทำ 'แบบทดสอบก่อนเรียน' ให้เสร็จก่อนครับ");
            else if (targetId === 'learns_02') alert("⚠️ กรุณาเรียน 'บทที่ 1' ให้จบก่อนครับ");
            else if (targetId === 'learns_03') alert("⚠️ กรุณาเรียน 'บทที่ 2' ให้จบก่อนครับ");
            else if (targetId === 'quiz' || targetId === 'post_test') alert("⚠️ กรุณาเรียน 'บทที่ 3' ให้จบก่อนครับ");
            else if (targetId === 'survey') alert("⚠️ กรุณาทำ 'แบบทดสอบหลังเรียน' ให้เสร็จก่อนครับ");
            return false; // ล็อกอยู่
        }

        // 2.2 ถ้าเข้าได้ -> เช็คเงื่อนไขการปลดล็อกด่านต่อไป
        if (targetId === 'pre_test') {
            // *** ไฮไลท์: กด Pre-test ปุ๊บ ปลดล็อก บทที่ 1 และ หนังสือเรียน ***
            this.unlock('learns_01');
            this.unlock('textbook');
        } 
        else if (targetId === 'quiz' || targetId === 'post_test') {
            // กด Post-test ปุ๊บ ปลดล็อก แบบประเมิน
            this.unlock('survey');
        }

        return true; // อนุญาตให้ไปต่อ
    },

    // --- 3. รองรับ onclick ในหน้า main.html ---
    handleClick(element, targetId, url) {
        if (this.checkAndProcessClick(targetId)) {
            // ถ้าผ่านเงื่อนไข ให้ลิงก์ทำงานต่อตามปกติ (return true)
            // ถ้าเป็นลิงก์ภายนอกที่ต้องการเปิดแท็บใหม่ ให้เบราว์เซอร์จัดการผ่าน href หรือ window.open
            return true; 
        } else {
            return false; // หยุดการทำงาน
        }
    },

    // --- 4. จัดการหน้าตาปุ่ม (สีเทา/สีปกติ) ---
    refreshButtons() {
        const links = document.querySelectorAll('[data-target-id]');
        links.forEach(link => {
            const targetId = link.getAttribute('data-target-id');
            const isLocked = !this.isUnlocked(targetId);
            const icon = link.querySelector('i');

            if (isLocked) {
                link.classList.add('btn-locked');
                link.style.filter = "grayscale(100%) opacity(0.7)";
                if (icon) icon.className = "fas fa-lock";
            } else {
                link.classList.remove('btn-locked');
                link.style.filter = "none";
                link.style.opacity = "1";
                
                if (icon) {
                    if (targetId === 'textbook') icon.className = "fas fa-book-open"; 
                    else if (targetId.includes('learns')) icon.className = "fas fa-play-circle";
                    else if (targetId === 'pre_test') icon.className = "fas fa-pen";
                    else if (targetId === 'quiz' || targetId === 'post_test') icon.className = "fas fa-check-double";
                    else if (targetId === 'survey') icon.className = "fas fa-smile";
                }
            }
        });
    },

    // --- 5. ดักจับการคลิกสำหรับหน้า Learn (ที่ไม่มี onclick) ---
    initLinkInterceptors() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-target-id]');
            // ถ้ามี onclick อยู่แล้ว (เช่นในหน้า main) ไม่ต้องทำงานซ้ำ
            if (!link || link.hasAttribute('onclick')) return;

            const targetId = link.getAttribute('data-target-id');
            if (!this.checkAndProcessClick(targetId)) {
                e.preventDefault();
            }
        });
    },

    // --- 6. ระบบวิดีโอ YouTube ---
    player: null, timer: null, timeWatched: 0, duration: 0, currentVideoId: '', nextLessonId: '', isCompleted: false,

    initMusic() {
        const audio = document.getElementById('bg-music');
        const btn = document.getElementById('music-toggle');
        if (!audio || !btn) return;
        let isPlaying = false;
        const icon = btn.querySelector('i');
        
        btn.onclick = (e) => { 
            e.stopPropagation();
            if (isPlaying) { audio.pause(); icon.className = "fas fa-volume-mute"; }
            else { audio.volume = 0.3; audio.play(); icon.className = "fas fa-music"; }
            isPlaying = !isPlaying;
        };
        document.body.addEventListener('click', () => {
            if(!isPlaying) { audio.volume=0.3; audio.play().catch(()=>{}); isPlaying=true; icon.className="fas fa-music"; }
        }, {once:true});
    },

    initVideoLesson(videoId, nextLessonId) {
        this.currentVideoId = videoId;
        this.nextLessonId = nextLessonId;
        this.refreshButtons();
        
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
};

// YouTube API
window.onYouTubeIframeAPIReady = function() {
    CourseSystem.player = new YT.Player('player', {
        height: '100%', width: '100%', videoId: CourseSystem.currentVideoId,
        playerVars: { 'rel': 0 },
        events: { 'onReady': (e)=>CourseSystem.duration=e.target.getDuration(), 'onStateChange': onPlayerStateChange }
    });
};
function onPlayerStateChange(e) { if(e.data==YT.PlayerState.PLAYING) startTracking(); else stopTracking(); }
function startTracking() {
    if(CourseSystem.timer) clearInterval(CourseSystem.timer);
    CourseSystem.timer = setInterval(()=>{
        if(CourseSystem.player && CourseSystem.player.getPlayerState()==YT.PlayerState.PLAYING){
            CourseSystem.timeWatched++;
            if((CourseSystem.timeWatched/CourseSystem.duration)*100 >= 90 && !CourseSystem.isCompleted){
                CourseSystem.isCompleted=true; 
                CourseSystem.unlock(CourseSystem.nextLessonId);
                alert("🎉 ยินดีด้วย! คุณเรียนผ่านเกณฑ์แล้ว บทถัดไปปลดล็อกแล้วครับ");
            }
        }
    },1000);
}
function stopTracking(){ clearInterval(CourseSystem.timer); }

// เริ่มทำงาน
document.addEventListener('DOMContentLoaded', ()=>{ 
    CourseSystem.refreshButtons(); 
    CourseSystem.initLinkInterceptors(); 
    CourseSystem.initMusic(); 
});
