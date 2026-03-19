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

  // reset totale
  segments.forEach(seg => {
    seg.style.transition = "none";
    seg.style.width = "0%";
  });

  // forza il browser a registrare il reset (fix mobile)
  void document.body.offsetWidth;

  // riempi le barre precedenti
  for (let i = 0; i < index; i++) {
    segments[i].style.width = "100%";
  }

  // anima la barra corrente
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

  // AUDIO — parte solo una volta
  if (!audioStarted) {
    audioStarted = true;
    music.muted = !audioEnabled;
    music.volume = audioEnabled ? 0 : 0;
    music.play().catch(err => console.log("Audio blocked:", err));

    // Aggiorna icona subito dopo l'avvio dell'audio
    updateAudioIcon();
    if (audioEnabled) {
      // fade-in romantico
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
   GESTIONE TAP SINISTRA/DESTRA CON WRAP
-------------------------- */

const slider = document.querySelector('.slider');

function onSliderPointer(e) {
  if (!introSlide.classList.contains('hidden')) return;

  let clientX;
  if (e.type.startsWith('touch')) {
    clientX = e.touches && e.touches[0] ? e.touches[0].clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0);
  } else {
    clientX = e.clientX !== undefined ? e.clientX : (e.pageX || 0);
  }

  const half = window.innerWidth / 2;
  const isLeft = clientX < half;

  const clickedNextBtn = e.target && e.target.closest && e.target.closest('.next-btn');
  if (clickedNextBtn) {
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    } else {
      // se premi il bottone next sull'ultima slide, wrap alla prima
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
    // Zona destra: se non siamo all'ultima slide avanziamo,
    // altrimenti facciamo il wrap alla prima slide (comportamento richiesto)
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    } else {
      // siamo sull'ultima slide: wrap avanti alla prima
      restartFirstSlide();
    }
  }
}

if (slider) {
  slider.addEventListener('pointerdown', onSliderPointer);
  slider.addEventListener('touchstart', onSliderPointer, {passive: true});
}

/* -------------------------
   FINE
-------------------------- */
