const slides = document.querySelectorAll('.slide');
const lastSlide = document.querySelector('.last-slide');

const seg1 = document.getElementById('seg1');
const seg2 = document.getElementById('seg2');
const seg3 = document.getElementById('seg3');

let currentSlide = 0;
let autoPlayInterval = 8000; // 8 secondi
let timer;

/* -------------------------
   SLIDES
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

function resetSegments() {
  [seg1, seg2, seg3].forEach(seg => {
    seg.style.transitionDuration = "0ms";
    seg.style.width = "0%";
  });
}

function updateProgressBar(index) {
  // Reset
  seg1.style.width = "0%";
  seg2.style.width = "0%";
  seg3.style.width = "0%";

  // Slide 1 → anima seg1
  if (index === 0) {
    seg1.style.transitionDuration = autoPlayInterval + "ms";
    requestAnimationFrame(() => seg1.style.width = "100%");
  }

  // Slide 2 → seg1 pieno, anima seg2
  if (index === 1) {
    seg1.style.transitionDuration = "0ms";
    seg1.style.width = "100%";

    seg2.style.transitionDuration = autoPlayInterval + "ms";
    requestAnimationFrame(() => seg2.style.width = "100%");
  }

  // Slide 3 → seg1 e seg2 pieni, anima seg3
  if (index === 2) {
    seg1.style.transitionDuration = "0ms";
    seg1.style.width = "100%";

    seg2.style.transitionDuration = "0ms";
    seg2.style.width = "100%";

    seg3.style.transitionDuration = autoPlayInterval + "ms";
    requestAnimationFrame(() => seg3.style.width = "100%");
  }
}

/* -------------------------
   CLICK
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
