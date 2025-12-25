// auth.js - Fixed Logic
const CourseSystem = {
    // --- ส่วนตรวจสอบและปลดล็อก ---
    isUnlocked(id) {
        if (id === 'pre_test') return true; // แบบทดสอบก่อนเรียนเข้าได้เสมอ
        return localStorage.getItem('unlocked_' + id) === 'true';
    },

    unlock(id) {
        localStorage.setItem('unlocked_' + id, 'true');
        this.refreshButtons();
    },

    // --- ส่วนจัดการหน้าตาปุ่ม (Visuals Only) ---
    // ฟังก์ชันนี้จะเปลี่ยนแค่ "สี" และ "ไอคอน" เท่านั้น ไม่ยุ่งกับการคลิก
    refreshButtons() {
        const links = document.querySelectorAll('[data-target-id]');
        links.forEach(link => {
            const targetId = link.getAttribute('data-target-id');
            const isLocked = !this.isUnlocked(targetId);
            const icon = link.querySelector('i');

            if (isLocked) {
                // สถานะล็อก: เป็นสีเทา
                link.classList.add('btn-locked');
                link.style.filter = "grayscale(100%) opacity(0.7)";
                if (icon) icon.className = "fas fa-lock"; // เปลี่ยนไอคอนเป็นแม่กุญแจ
            } else {
                // สถานะปลดล็อก: คืนค่าสีเดิม
                link.classList.remove('btn-locked');
                link.style.filter = "none";
                link.style.opacity = "1";
                
                // คืนไอคอนให้ถูกต้อง (ตามประเภท)
                if (icon) {
                    if (targetId === 'textbook') icon.className = "fas fa-book-open";
                    else if (targetId === 'pre_test') icon.className = "fas fa-pen";
                    else if (targetId.includes('learns')) icon.className = "fas fa-play-circle";
                    else if (targetId === 'post_test') icon.className = "fas fa-check-double";
                    else if (targetId === 'survey') icon.className = "fas fa-smile";
                }
            }
        });
    },

    // --- ส่วนจัดการการคลิก (Click Logic) ---
    // ทุกปุ่มจะวิ่งมาเช็คเงื่อนไขที่นี่ที่เดียว
    handleClick(element, targetId, url) {
        // 1. ถ้าเป็น "แบบทดสอบก่อนเรียน" (pre_test)
        if (targetId === 'pre_test') {
            // สั่งปลดล็อกทันที
            this.unlock('textbook');
            this.unlock('learns_01');
            
            // ไปยังลิงก์
            window.open(url, '_blank');
            return false;
        }

        // 2. เช็คว่าล็อกอยู่ไหม?
        if (!this.isUnlocked(targetId)) {
            // แจ้งเตือนตามลำดับ
            if (targetId === 'textbook' || targetId === 'learns_01') {
                alert("⚠️ กรุณาทำ 'แบบทดสอบก่อนเรียน' ให้เสร็จก่อนนะครับ");
            } else if (targetId === 'learns_02') {
                alert("⚠️ กรุณาเรียน 'บทที่ 1' ให้จบก่อนครับ");
            } else if (targetId === 'learns_03') {
                alert("⚠️ กรุณาเรียน 'บทที่ 2' ให้จบก่อนครับ");
            } else if (targetId === 'post_test') {
                alert("⚠️ กรุณาเรียน 'บทที่ 3' ให้จบก่อนครับ");
            } else if (targetId === 'survey') {
                alert("⚠️ กรุณาทำ 'แบบทดสอบหลังเรียน' ให้เสร็จก่อนครับ");
            }
            return false; // ห้ามไปต่อ
        }

        // 3. ถ้าปลดล็อกแล้ว ให้ไปตามลิงก์
        // ถ้าเป็นแบบทดสอบหรือหนังสือ ให้เปิดแท็บใหม่
        if (targetId === 'textbook' || targetId === 'post_test' || targetId === 'survey') {
            window.open(url, '_blank');
        } else {
            // ถ้าเป็นบทเรียน ให้เปลี่ยนหน้าเดิม
            window.location.href = url;
        }
        return false;
    },

    // --- ส่วนระบบวิดีโอและเพลง (คงเดิม) ---
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
            if(!isPlaying) { audio.volume=0.3; audio.play().then(()=>{ isPlaying=true; icon.className="fas fa-music"; }).catch(()=>{}); }
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

// YouTube API Handlers
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
document.addEventListener('DOMContentLoaded', ()=>{ CourseSystem.refreshButtons(); CourseSystem.initMusic(); });