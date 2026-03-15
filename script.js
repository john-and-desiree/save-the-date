const slides = document.querySelectorAll('.slide');
const lastSlide = document.querySelector('.last-slide');

const seg1 = document.getElementById('seg1');
const seg2 = document.getElementById('seg2');
const seg3 = document.getElementById('seg3');

let currentSlide = 0;
let autoPlayInterval = 10000; // 10 secondi
let timer;

/* -------------------------
   FUNZIONI SLIDES
-------------------------- */

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));
  slides[index].classList.add('active');
  updateProgressBar(index);
}

function nextSlide() {
  if (currentSlide < slides.length - 1) {
    currentSlide++;
    showSlide(currentSlide);
  }

  // Se siamo sulla terza slide → stop autoplay
  if (currentSlide === slides.length - 1) {
    clearInterval(timer);
  }
}

function startAutoPlay() {
  if (currentSlide < slides.length - 1) {
    timer = setInterval(nextSlide, autoPlayInterval);
  }
}

function resetAutoPlay() {
  clearInterval(timer);
  startAutoPlay();
}

/* -------------------------
   PROGRESS BAR
-------------------------- */

function updateProgressBar(index) {
  // Reset animazioni
  [seg1, seg2, seg3].forEach(seg => {
    seg.classList.remove('active');
    seg.style.transitionDuration = "0ms";
  });

  // Slide 1 → anima solo il primo segmento
  if (index === 0) {
    seg1.style.transitionDuration = autoPlayInterval + "ms";
    seg1.classList.add('active');
  }

  // Slide 2 → primo pieno, secondo in animazione
  if (index === 1) {
    seg1.classList.add('active');
    seg1.style.transitionDuration = "0ms";

    seg2.style.transitionDuration = autoPlayInterval + "ms";
    seg2.classList.add('active');
  }

  // Slide 3 → primi due pieni, terzo ANIMATO (10s)
  if (index === 2) {
    seg1.classList.add('active');
    seg1.style.transitionDuration = "0ms";

    seg2.classList.add('active');
    seg2.style.transitionDuration = "0ms";

    seg3.style.transitionDuration = autoPlayInterval + "ms";
    seg3.classList.add('active');
  }
}

/* -------------------------
   CLICK HANDLERS
-------------------------- */

slides.forEach((slide, index) => {
  slide.addEventListener('click', () => {
    if (index < slides.length - 1) {
      currentSlide = index + 1;
      showSlide(currentSlide);
      resetAutoPlay();
    }
  });
});

lastSlide.addEventListener('click', () => {
  currentSlide = 0;
  showSlide(currentSlide);
  resetAutoPlay();
});

/* -------------------------
   START
-------------------------- */

showSlide(0);
startAutoPlay();