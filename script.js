const introSlide = document.querySelector('.intro-slide');
const slides = document.querySelectorAll('.slide');
const lastSlide = document.querySelector('.last-slide');

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
// Long press per pausa/ripresa
let longPressTimer = null;
let wasLongPress = false;
const longPressDuration = 500; // 500ms per attivare il long press
let pausedBarWidth = null;
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

function startLongPress() {
  wasLongPress = false;
  longPressTimer = setTimeout(() => {
    wasLongPress = true;
    // Pausa il timer auto-advance
    clearInterval(timer);
    
    // Congela l'animazione della progress bar
    if (segments[currentSlide]) {
      const currentFill = segments[currentSlide];
      // Salva la larghezza attuale
      pausedBarWidth = window.getComputedStyle(currentFill).width;
      // Rimuovi la transizione
      currentFill.style.transition = 'none';
      // Imposta la larghezza al valore attuale
      currentFill.style.width = pausedBarWidth;
    }
  }, longPressDuration);
}

function endLongPress() {
  clearTimeout(longPressTimer);

  if (wasLongPress) {
    // Riprendi l'animazione della progress bar
    if (segments[currentSlide]) {
      const currentFill = segments[currentSlide];
      // Rimetti la transizione
      currentFill.style.transition = `width ${autoPlayInterval}ms linear`;
      // Riprendi l'animazione
      currentFill.style.width = '100%';
    }
    // Riprendi il timer se non siamo all'ultima slide
    if (currentSlide < slides.length - 1) {
      startAutoPlay();
    }
  }
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

  if (audioEnabled && music.volume === 0) {
    music.volume = 1;
  }

  updateAudioIcon();
}

if (audioToggle) {
  audioToggle.addEventListener('click', toggleAudio);
}

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

  // SLIDES
  introSlide.classList.add('hidden'); // fade-out
  showSlide(0);                       // attiva la vera slide 1
  startAutoPlay();                    // avvia timer
});

/* -------------------------
   CLICK SLIDES
-------------------------- */

slides.forEach((slide, index) => {

  slide.addEventListener('mousedown', startLongPress);
  slide.addEventListener('touchstart', startLongPress);

  slide.addEventListener('mouseup', endLongPress);
  slide.addEventListener('mouseleave', endLongPress);
  slide.addEventListener('touchend', endLongPress);

  slide.addEventListener('click', () => {

    if (wasLongPress) {
      wasLongPress = false;
      return;
    }

    if (index < slides.length - 1) {
      showSlide(index + 1);
      resetAutoPlay();
    }

  });

});

lastSlide.addEventListener('mousedown', startLongPress);
lastSlide.addEventListener('touchstart', startLongPress);

lastSlide.addEventListener('mouseup', endLongPress);
lastSlide.addEventListener('mouseleave', endLongPress);
lastSlide.addEventListener('touchend', endLongPress);

lastSlide.addEventListener('click', () => {

  if (wasLongPress) {
    wasLongPress = false;
    return;
  }

  // reset progress bar
  segments.forEach(seg => {
    seg.style.transition = "none";
    seg.style.width = "0%";
  });

  showSlide(0);
  resetAutoPlay();

});
