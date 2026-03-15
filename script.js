const slides = document.querySelectorAll('.slide');
const lastSlide = document.querySelector('.last-slide');

let currentSlide = 0;
let autoPlayInterval = 6000; // ⬅️ cambia qui i secondi (6000 = 6s)
let timer;

// Mostra slide
function showSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));
  slides[index].classList.add('active');
}

// Avanza di 1 slide
function nextSlide() {
  if (currentSlide < slides.length - 1) {
    currentSlide++;
  } else {
    currentSlide = 0; // ricomincia dopo la terza
  }
  showSlide(currentSlide);
}

// Avvia autoplay
function startAutoPlay() {
  timer = setInterval(nextSlide, autoPlayInterval);
}

// Reset autoplay quando l’utente clicca
function resetAutoPlay() {
  clearInterval(timer);
  startAutoPlay();
}

/* CLICK OVUNQUE → AVANTI */
slides.forEach((slide, index) => {
  slide.addEventListener('click', () => {
    if (index < slides.length - 1) {
      currentSlide = index + 1;
      showSlide(currentSlide);
      resetAutoPlay();
    }
  });
});

/* TERZA SLIDE → RICOMINCIA */
lastSlide.addEventListener('click', () => {
  currentSlide = 0;
  showSlide(currentSlide);
  resetAutoPlay();
});

// Avvia autoplay all'apertura
startAutoPlay();