// auth.js - Fixed Logic Version
const CourseSystem = {
    // --- 1. ตรวจสอบสถานะการล็อก (Is Unlocked?) ---
    isUnlocked(id) {
        // 1.1 เงื่อนไขเริ่มต้น: "แบบทดสอบก่อนเรียน" เข้าได้เสมอ
        if (id === 'pre_test') return true;

        // 1.2 จัดการกรณีชื่อ ID ไม่ตรงกัน (quiz คือ post_test)
        // ไม่ว่าจะเช็ค id ไหน ถ้าอันใดอันหนึ่งปลดล็อกแล้ว ให้ถือว่าผ่าน
        if (id === 'quiz' || id === 'post_test') {
            return localStorage.getItem('unlocked_post_test') === 'true' || 
                   localStorage.getItem('unlocked_quiz') === 'true';
        }

        // 1.3 เช็ค Local Storage สำหรับตัวอื่นๆ (textbook, learns_01, survey ฯลฯ)
        return localStorage.getItem('unlocked_' + id) === 'true';
    },

    // --- สั่งปลดล็อก (Unlock) ---
    unlock(id) {
        localStorage.setItem('unlocked_' + id, 'true');
        
        // ถ้าเป็นการปลดล็อก quiz หรือ post_test ให้ปลดล็อกอีกชื่อคู่กันไปด้วย (กันพลาด)
        if (id === 'post_test') localStorage.setItem('unlocked_quiz', 'true');
        if (id === 'quiz') localStorage.setItem('unlocked_post_test', 'true');

        this.refreshButtons();
    },

    // --- 2. ฟังก์ชันเช็คเงื่อนไขและปลดล็อกตัวถัดไป (Logic หลัก) ---
    checkAndProcessClick(targetId) {
        // 2.1 ถ้ายังไม่ปลดล็อก -> ห้ามเข้า และแจ้งเตือน
        if (!this.isUnlocked(targetId)) {
            if (targetId === 'textbook') alert("⚠️ กรุณาทำ 'แบบทดสอบก่อนเรียน' ให้เสร็จก่อนครับ");
            else if (targetId === 'learns_01') alert("⚠️ กรุณาทำ 'แบบทดสอบก่อนเรียน' ให้เสร็จก่อนครับ");
            else if (targetId === 'learns_02') alert("⚠️ กรุณาเรียน 'บทที่ 1' ให้จบก่อนครับ");
            else if (targetId === 'learns_03') alert("⚠️ กรุณาเรียน 'บทที่ 2' ให้จบก่อนครับ");
            else if (targetId === 'quiz' || targetId === 'post_test') alert("⚠️ กรุณาเรียน 'บทที่ 3' ให้จบก่อนครับ");
            else if (targetId === 'survey') alert("⚠️ กรุณาทำ 'แบบทดสอบหลังเรียน' ให้เสร็จก่อนครับ");
            
            return false; // ล็อกอยู่ (หยุดทำงาน)
        }

        // 2.2 ถ้าเข้าได้ (Unlocked) -> เช็คเงื่อนไขเพื่อปลดล็อกด่านต่อไปทันทีที่คลิก
        if (targetId === 'pre_test') {
            // *** ไฮไลท์: กด Pre-test ปุ๊บ ปลดล็อก "บทที่ 1" และ "หนังสือเรียน" ทันที ***
            this.unlock('learns_01');
            this.unlock('textbook');
        } 
        else if (targetId === 'quiz' || targetId === 'post_test') {
            // *** ไฮไลท์: กด Post-test (หรือ quiz) ปุ๊บ ปลดล็อก "แบบประเมิน" ทันที ***
            this.unlock('survey');
        }

        return true; // อนุญาตให้ไปตามลิงก์
    },

    // --- 3. รองรับ onclick ในหน้า main.html ---
    handleClick(element, targetId, url) {
        if (this.checkAndProcessClick(targetId)) {
            // ถ้าผ่านเงื่อนไข ให้ลิงก์ทำงานต่อตามปกติ
            return true; 
        } else {
            // ถ้าไม่ผ่าน ให้หยุด
            return false; 
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
                // สถานะล็อก
                link.classList.add('btn-locked');
                link.style.filter = "grayscale(100%) opacity(0.7)";
                link.style.pointerEvents = "auto"; // ให้ยังกดได้เพื่อให้ alert ทำงาน
                if (icon) icon.className = "fas fa-lock";
            } else {
                // สถานะปลดล็อก
                link.classList.remove('btn-locked');
                link.style.filter = "none";
                link.style.opacity = "1";
                link.style.cursor = "pointer";
                
                // คืนค่าไอคอนเดิม
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

    // --- 5. ดักจับการคลิกสำหรับหน้า Learn/Sidebar (ที่ไม่มี onclick) ---
    initLinkInterceptors() {
        document.addEventListener('click', (e) => {
            // หา element ที่เป็นลิงก์และมี data-target-id
            const link = e.target.closest('[data-target-id]');
            
            // ถ้าไม่มีลิงก์ หรือ ลิงก์นั้นมี onclick อยู่แล้ว (เช่นในหน้า main) ให้ข้ามไป
            if (!link || link.hasAttribute('onclick')) return;

            const targetId = link.getAttribute('data-target-id');
            
            // ส่งไปเช็คเงื่อนไข
            if (!this.checkAndProcessClick(targetId)) {
                e.preventDefault(); // ถ้าไม่ผ่านเงื่อนไข ห้ามเปลี่ยนหน้า
            }
            // ถ้าผ่านเงื่อนไข checkAndProcessClick จะทำการ unlock ตัวถัดไปให้เอง และปล่อยให้ href ทำงาน
        });
    },

    // --- 6. ระบบวิดีโอ YouTube (เหมือนเดิม) ---
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
        // Auto play on interaction check
        document.body.addEventListener('click', () => {
            if(!isPlaying) { audio.volume=0.3; audio.play().catch(()=>{}); isPlaying=true; icon.className="fas fa-music"; }
        }, {once:true});
    },

    initVideoLesson(videoId, nextLessonId) {
        this.currentVideoId = videoId;
        this.nextLessonId = nextLessonId;
        this.refreshButtons();
        
        // Load YouTube API
        if (!window.YT) {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else if (window.YT && window.YT.Player) {
            // ถ้า API โหลดอยู่แล้ว ให้สร้าง Player เลย (กรณีเปลี่ยนหน้าเร็ว)
            window.onYouTubeIframeAPIReady();
        }
    }
};

// YouTube API Setup
window.onYouTubeIframeAPIReady = function() {
    // ป้องกัน error กรณีไม่มี element id='player' ในหน้านั้น
    if(!document.getElementById('player')) return;

    CourseSystem.player = new YT.Player('player', {
        height: '100%', 
        width: '100%', 
        videoId: CourseSystem.currentVideoId,
        playerVars: { 'rel': 0 },
        events: { 
            'onReady': (e) => CourseSystem.duration = e.target.getDuration(), 
            'onStateChange': onPlayerStateChange 
        }
    });
};

function onPlayerStateChange(e) { 
    if(e.data == YT.PlayerState.PLAYING) startTracking(); 
    else stopTracking(); 
}

function startTracking() {
    if(CourseSystem.timer) clearInterval(CourseSystem.timer);
    CourseSystem.timer = setInterval(() => {
        if(CourseSystem.player && CourseSystem.player.getPlayerState() == YT.PlayerState.PLAYING){
            CourseSystem.timeWatched++;
            
            // คำนวณ % การดู (90%)
            if(CourseSystem.duration > 0 && (CourseSystem.timeWatched / CourseSystem.duration) * 100 >= 90 && !CourseSystem.isCompleted){
                CourseSystem.isCompleted = true; 
                
                // ปลดล็อกบทถัดไป
                CourseSystem.unlock(CourseSystem.nextLessonId);
                
                alert("🎉 ยินดีด้วย! คุณเรียนผ่านเกณฑ์แล้ว บทถัดไปปลดล็อกแล้วครับ");
            }
        }
    }, 1000);
}

function stopTracking(){ 
    if(CourseSystem.timer) clearInterval(CourseSystem.timer); 
}

// เริ่มทำงานเมื่อโหลดหน้าเสร็จ
document.addEventListener('DOMContentLoaded', () => { 
    CourseSystem.refreshButtons(); 
    CourseSystem.initLinkInterceptors(); 
    CourseSystem.initMusic(); 
});