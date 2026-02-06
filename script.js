const slides = document.querySelectorAll('.slide');
const nextButtons = document.querySelectorAll('.next-btn');

let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');

    // reset animazioni testo
    const text = slide.querySelector('h1');
    if (text) {
      text.style.animation = 'none';
      text.offsetHeight; // trigger reflow
      text.style.animation = '';
    }
  });

  slides[index].classList.add('active');
}

nextButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      showSlide(currentSlide);
    }
  });
});
