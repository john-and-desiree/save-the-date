const introSlide = document.querySelector('.intro-slide');
const slides = document.querySelectorAll('.slide');

const seg1 = document.getElementById('seg1');
const seg2 = document.getElementById('seg2');
const seg3 = document.getElementById('seg3');

const segments = [seg1, seg2, seg3];

const music = document.getElementById("bg-music");
const audioToggle = document.getElementById("audio-toggle");
const audioIcon = document.getElementById("audio-icon");

let currentSlide = 0;
let autoPlayInterval = 8000; // 8 secondi
let timer;

let audioStarted = false;
let audioEnabled = true;

/* -------------------------
   SLIDES / PROGRESS
-------------------------- */

function showSlide(index) {
  currentSlide = index;
  slides.forEach(slide => slide.classList.remove('active'));
  slides[index].classList.add('active');
  updateProgressBar(index);
}

function nextSlide() {
  if (currentSlide < slides.length - 1) {
    showSlide(currentSlide + 1);
  }
  if (currentSlide === slides.length - 1) {
    clearInterval(timer);
  }
}

function startAutoPlay() {
  clearInterval(timer);
  if (currentSlide < slides.length - 1) {
    timer = setInterval(nextSlide, autoPlayInterval);
  }
}

function resetAutoPlay() {
  startAutoPlay();
}

function updateProgressBar(index) {
  segments.forEach(seg => {
    seg.style.transition = "none";
    seg.style.width = "0%";
  });
  void document.body.offsetWidth;
  for (let i = 0; i < index; i++) {
    segments[i].style.width = "100%";
  }
  if (segments[index]) {
    segments[index].style.transition = `width ${autoPlayInterval}ms linear`;
    segments[index].style.width = "100%";
  }
}

/* -------------------------
   AUDIO
-------------------------- */

function updateAudioIcon() {
  if (!audioIcon) return;
  if (!audioEnabled) {
    audioIcon.classList.remove('bi-volume-up');
    audioIcon.classList.add('bi-volume-mute');
  } else {
    audioIcon.classList.remove('bi-volume-mute');
    audioIcon.classList.add('bi-volume-up');
  }
}

function toggleAudio(e) {
  e.stopPropagation();
  e.preventDefault();
  audioEnabled = !audioEnabled;
  music.muted = !audioEnabled;
  if (audioEnabled && music.volume === 0) music.volume = 1;
  updateAudioIcon();
}

if (audioToggle) audioToggle.addEventListener('click', toggleAudio);
updateAudioIcon();

/* -------------------------
   INTRO SLIDE + AUDIO
-------------------------- */

introSlide.addEventListener("click", () => {
  if (!audioStarted) {
    audioStarted = true;
    music.muted = !audioEnabled;
    music.volume = audioEnabled ? 0 : 0;
    music.play().catch(err => console.log("Audio blocked:", err));
    updateAudioIcon();
    if (audioEnabled) {
      let vol = 0;
      const fade = setInterval(() => {
        vol += 0.05;
        if (vol >= 1) {
          vol = 1;
          clearInterval(fade);
        }
        music.volume = vol;
        updateAudioIcon();
      }, 200);
    }
  }
  introSlide.classList.add('hidden');
  showSlide(0);
  startAutoPlay();
});

/* -------------------------
   RIAVVIO ANIMAZIONI SLIDE 1
-------------------------- */

function restartSlide1Animations() {
  const first = slides[0];
  if (!first) return;
  const plane = first.querySelector('.plane');
  const save = first.querySelector('.save-date');
  [plane, save].forEach(el => {
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
}

function restartFirstSlide() {
  if (segments[0]) {
    segments[0].style.transition = "none";
    segments[0].style.width = "0%";
    void document.body.offsetWidth;
    segments[0].style.transition = `width ${autoPlayInterval}ms linear`;
    segments[0].style.width = "100%";
  }
  showSlide(0);
  restartSlide1Animations();
  resetAutoPlay();
}

/* -------------------------
   GESTIONE POINTER + SCROLL / LONG PRESS IGNORE
   (touch-action: pan-y — permettiamo scroll verticale)
-------------------------- */

const slider = document.querySelector('.slider');

let lastPointerTime = 0;
let lastPointerX = null;
const POINTER_DEBOUNCE_MS = 300;

const LONG_PRESS_MS = 500;      // soglia long press (ms)
const MOVE_THRESHOLD_PX = 10;   // se si muove più di 10px consideriamo scroll/drag

let activePointer = null;

function getClientCoordsFromEvent(e) {
  if (window.PointerEvent && e instanceof PointerEvent) {
    return { x: e.clientX, y: e.clientY };
  }
  if (e.touches && e.touches[0]) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if (e.changedTouches && e.changedTouches[0]) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  return { x: e.clientX || e.pageX || 0, y: e.clientY || e.pageY || 0 };
}

function onPointerDown(e) {
  if (!introSlide.classList.contains('hidden')) return;

  const coords = getClientCoordsFromEvent(e);

  activePointer = {
    id: (window.PointerEvent && e instanceof PointerEvent) ? e.pointerId : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].identifier : 'touch'),
    startTime: Date.now(),
    startX: coords.x,
    startY: coords.y,
    moved: false
  };

  if (window.PointerEvent && e instanceof PointerEvent && slider.setPointerCapture) {
    try { slider.setPointerCapture(activePointer.id); } catch (err) {}
  }
}

function onPointerMove(e) {
  if (!activePointer) return;

  const coords = getClientCoordsFromEvent(e);
  const dx = Math.abs(coords.x - activePointer.startX);
  const dy = Math.abs(coords.y - activePointer.startY);

  if (dy > MOVE_THRESHOLD_PX) activePointer.moved = true;
  if (dx > MOVE_THRESHOLD_PX) activePointer.moved = true;
}

function onPointerUp(e) {
  if (!activePointer) return;

  const coords = getClientCoordsFromEvent(e);
  const now = Date.now();
  const duration = now - activePointer.startTime;

  try {
    if (window.PointerEvent && e instanceof PointerEvent && activePointer.id != null) {
      slider.releasePointerCapture && slider.releasePointerCapture(activePointer.id);
    }
  } catch (err) {}

  const moved = activePointer.moved;
  activePointer = null;

  if (moved) return;                 // era uno scroll/drag: non è tap
  if (duration >= LONG_PRESS_MS) return; // long press: ignora

  if (now - lastPointerTime < POINTER_DEBOUNCE_MS) {
    if (lastPointerX !== null && Math.abs(lastPointerX - coords.x) < 6) {
      return;
    }
  }

  lastPointerTime = now;
  lastPointerX = coords.x;

  const half = window.innerWidth / 2;
  const isLeft = coords.x < half;

  const clickedNextBtn = e.target && e.target.closest && e.target.closest('.next-btn');
  if (clickedNextBtn) {
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    } else {
      restartFirstSlide();
    }
    return;
  }

  if (isLeft) {
    if (currentSlide === 0) {
      restartFirstSlide();
      return;
    }
    if (currentSlide > 0) {
      showSlide(currentSlide - 1);
      resetAutoPlay();
      return;
    }
  } else {
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    } else {
      restartFirstSlide();
    }
  }
}

function onPointerCancelOrLeave(e) {
  if (!activePointer) return;
  try {
    if (window.PointerEvent && e instanceof PointerEvent && activePointer.id != null) {
      slider.releasePointerCapture && slider.releasePointerCapture(activePointer.id);
    }
  } catch (err) {}
  activePointer = null;
}

if (slider) {
  try { slider.removeEventListener('touchstart', onPointerDown); } catch (err) {}
  slider.addEventListener('pointerdown', onPointerDown);
  slider.addEventListener('pointermove', onPointerMove);
  slider.addEventListener('pointerup', onPointerUp);
  slider.addEventListener('pointercancel', onPointerCancelOrLeave);
  slider.addEventListener('pointerleave', onPointerCancelOrLeave);

  // fallback touch events per browser che non supportano PointerEvent
  slider.addEventListener('touchstart', onPointerDown, {passive: true});
  slider.addEventListener('touchmove', onPointerMove, {passive: true});
  slider.addEventListener('touchend', onPointerUp);
  slider.addEventListener('touchcancel', onPointerCancelOrLeave);

  // previeni menu contestuale su long press
  slider.addEventListener('contextmenu', e => e.preventDefault());
}
