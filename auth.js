// auth.js
const CourseSystem = {
    // --- 1. ตรวจสอบและปลดล็อก ---
    isUnlocked(id) {
        if (id === 'pre_test' || id === 'learns_01') return true;
        // เช็คเผื่อกรณีชื่อ ID ไม่ตรงกัน (quiz กับ post_test คือตัวเดียวกัน)
        if (id === 'quiz' && localStorage.getItem('unlocked_post_test') === 'true') return true;
        if (id === 'post_test' && localStorage.getItem('unlocked_quiz') === 'true') return true;
        
        return localStorage.getItem('unlocked_' + id) === 'true';
    },

    unlock(id) {
        localStorage.setItem('unlocked_' + id, 'true');
        this.refreshButtons();
    },

    // --- 2. จัดการหน้าตาปุ่ม ---
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
                
                // คืนค่าไอคอนตามประเภทปุ่ม
                if (icon) {
                    if (targetId.includes('learns')) icon.className = "fas fa-play-circle";
                    else if (targetId === 'quiz' || targetId === 'post_test') icon.className = "fas fa-file-alt";
                    else if (targetId === 'survey') icon.className = "fas fa-smile";
                }
            }
        });
    },

    // --- 3. ดักจับการคลิก (เพิ่มระบบปลดล็อก Survey) ---
    initLinkInterceptors() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-target-id]');
            if (!link) return;

            const targetId = link.getAttribute('data-target-id');
            const href = link.getAttribute('href');

            // 1. ถ้าล็อกอยู่ ห้ามไปต่อ
            if (!this.isUnlocked(targetId)) {
                e.preventDefault();
                if (targetId === 'learns_02') alert("⚠️ กรุณาเรียน 'บทที่ 1' ให้จบก่อนครับ");
                else if (targetId === 'learns_03') alert("⚠️ กรุณาเรียน 'บทที่ 2' ให้จบก่อนครับ");
                else if (targetId === 'quiz' || targetId === 'post_test') alert("⚠️ กรุณาเรียน 'บทที่ 3' ให้จบก่อนครับ");
                else if (targetId === 'survey') alert("⚠️ กรุณาทำ 'แบบทดสอบหลังเรียน' ให้เสร็จก่อนครับ");
                return false;
            }

            // 2. ถ้ากดเข้าทำแบบทดสอบ (quiz หรือ post_test) -> ให้ปลดล็อก Survey ทันที!
            if (targetId === 'quiz' || targetId === 'post_test') {
                this.unlock('survey'); 
                // ไม่ต้อง alert บอกก็ได้ หรือถ้าอยากบอกก็ใส่ alert("ปลดล็อกแบบประเมินแล้ว!");
            }
        });
    },

    // --- 4. ระบบวิดีโอ YouTube ---
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

document.addEventListener('DOMContentLoaded', ()=>{ 
    CourseSystem.refreshButtons(); 
    CourseSystem.initLinkInterceptors(); 
    CourseSystem.initMusic(); 
});