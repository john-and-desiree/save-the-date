const slides = document.querySelectorAll('.slide');
const lastSlide = document.querySelector('.last-slide');

const seg1 = document.getElementById('seg1');
const seg2 = document.getElementById('seg2');
const seg3 = document.getElementById('seg3');

const segments = [seg1, seg2, seg3];

let currentSlide = 0;
let autoPlayInterval = 8000; // 8 secondi
let timer;

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
   PAUSA / RIPRESA (pressione lunga)
-------------------------- */

function pauseAutoPlay() {
  clearInterval(timer);

  // Pausa animazione progress bar
  segments.forEach(seg => {
    const computed = window.getComputedStyle(seg);
    const width = computed.width;
    seg.style.transition = "none";
    seg.style.width = width; // blocca la larghezza attuale
  });
}

function resumeAutoPlay() {
  updateProgressBar(currentSlide);
  startAutoPlay();
}

// Eventi per pressione lunga (mouse + touch)
slides.forEach(slide => {
  slide.addEventListener('mousedown', pauseAutoPlay);
  slide.addEventListener('touchstart', pauseAutoPlay);

  slide.addEventListener('mouseup', resumeAutoPlay);
  slide.addEventListener('mouseleave', resumeAutoPlay);
  slide.addEventListener('touchend', resumeAutoPlay);
});

/* -------------------------
   CLICK
-------------------------- */

slides.forEach((slide, index) => {
  slide.addEventListener('click', () => {
    if (index < slides.length - 1) {
      showSlide(index + 1);
      resetAutoPlay();
    }
  });
});

lastSlide.addEventListener('click', () => {
  showSlide(0);
  resetAutoPlay();
});

/* -------------------------
   START
-------------------------- */

showSlide(0);
startAutoPlay();
