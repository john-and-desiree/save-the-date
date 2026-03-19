const introSlide = document.querySelector('.intro-slide');
const slides = document.querySelectorAll('.slide');

const seg1 = document.getElementById('seg1');
const seg2 = document.getElementById('seg2');
const seg3 = document.getElementById('seg3');

const segments = [seg1, seg2, seg3];

// audio mp3:
const music = document.getElementById("bg-music");
const audioToggle = document.getElementById("audio-toggle");
const audioIcon = document.getElementById("audio-icon");

let currentSlide = 0;
let autoPlayInterval = 8000; // 8 secondi
let timer;

// evita che l’audio riparta
let audioStarted = false;
let audioEnabled = true;

/* -------------------------
   SLIDES
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

/* -------------------------
   PROGRESS BAR
-------------------------- */

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
    audioIcon.classList.remove('bi-volume-down');
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
    // rimuove temporaneamente l'animazione forzando none, poi la ripristina
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
   GESTIONE POINTER (solo pointerdown) + DEBOUNCE
-------------------------- */

const slider = document.querySelector('.slider');

// debounce/guard per evitare doppi trigger su Android
let lastPointerTime = 0;
let lastPointerX = null;
const POINTER_DEBOUNCE_MS = 300; // puoi aumentare a 400-500 se necessario

function onSliderPointer(e) {
  // Ignora se intro non ancora nascosta
  if (!introSlide.classList.contains('hidden')) return;

  // Accettiamo solo PointerEvent quando disponibile
  const isPointerEvent = window.PointerEvent && e instanceof PointerEvent;

  // Ottieni clientX in modo affidabile
  let clientX;
  if (isPointerEvent) {
    clientX = e.clientX;
  } else if (e.touches && e.touches[0]) {
    clientX = e.touches[0].clientX;
  } else if (e.changedTouches && e.changedTouches[0]) {
    clientX = e.changedTouches[0].clientX;
  } else {
    clientX = e.clientX || e.pageX || 0;
  }

  const now = Date.now();

  // debounce semplice: ignora eventi troppo ravvicinati
  if (now - lastPointerTime < POINTER_DEBOUNCE_MS) {
    // se la posizione è molto diversa, potremmo processare comunque; qui ignoriamo
    return;
  }

  // evita doppio trigger con coordinate quasi identiche
  if (lastPointerX !== null && Math.abs(lastPointerX - clientX) < 6 && (now - lastPointerTime) < 600) {
    return;
  }

  lastPointerTime = now;
  lastPointerX = clientX;

  const half = window.innerWidth / 2;
  const isLeft = clientX < half;

  // Se il target è il bottone next esplicito, trattalo come tap destro
  const clickedNextBtn = e.target && e.target.closest && e.target.closest('.next-btn');
  if (clickedNextBtn) {
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    } else {
      // wrap avanti: ultima -> prima
      restartFirstSlide();
    }
    return;
  }

  if (isLeft) {
    // Slide 1 (index 0): riavvia la slide (barra, timer, animazioni)
    if (currentSlide === 0) {
      restartFirstSlide();
      return;
    }

    // Slide 2 e 3 (index 1 e 2): torna indietro di una slide
    if (currentSlide > 0) {
      showSlide(currentSlide - 1);
      resetAutoPlay();
      return;
    }

  } else {
    // Zona destra: avanti (se possibile), altrimenti wrap alla prima slide
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    } else {
      restartFirstSlide();
    }
  }
}

// registra solo pointerdown (rimuovendo touchstart per evitare doppi trigger)
if (slider) {
  // rimuoviamo eventuali listener touchstart precedenti (se esistono)
  try { slider.removeEventListener('touchstart', onSliderPointer); } catch (err) {}
  slider.addEventListener('pointerdown', onSliderPointer);
}

/* -------------------------
   FINE
-------------------------- */
