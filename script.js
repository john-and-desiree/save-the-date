const slides = document.querySelectorAll('.slide');
const lastSlide = document.querySelector('.last-slide');

let currentSlide = 0;

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));
  slides[index].classList.add('active');
}

/* CLICK OVUNQUE → AVANTI */
slides.forEach((slide, index) => {
  slide.addEventListener('click', () => {
    if (index < slides.length - 1) {
      currentSlide = index + 1;
      showSlide(currentSlide);
    }
  });
});

/* TERZA SLIDE → RICOMINCIA */
lastSlide.addEventListener('click', () => {
  currentSlide = 0;
  showSlide(currentSlide);
});
