const slides = document.querySelectorAll('.slide');
const nextButtons = document.querySelectorAll('.next-btn');
const lastSlide = document.querySelector('.last-slide');

let currentSlide = 0;

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));
  slides[index].classList.add('active');
}

/* AVANTI — click sull’aereo */
nextButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // evita click multipli
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      showSlide(currentSlide);
    }
  });
});

/* RICOMINCIA — click su tutta la terza slide */
lastSlide.addEventListener('click', () => {
  currentSlide = 0;
  showSlide(currentSlide);
});
