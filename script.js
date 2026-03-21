/* script.js aggiornato: supporto "press & hold to pause" + gestione tap/scroll/longpress */

/* ELEMENTI DOM */
const introSlide = document.querySelector('.intro-slide');
const slides = document.querySelectorAll('.slide');

const seg1 = document.getElementById('seg1');
const seg2 = document.getElementById('seg2');
const seg3 = document.getElementById('seg3');

const segments = [seg1, seg2, seg3];

const music = document.getElementById("bg-music");
const audioToggle = document.getElementById("audio-toggle");
const audioIcon = document.getElementById("audio-icon");

let currentSlide = 0;
let autoPlayInterval = 8000; // 8 secondi
let timer;

/* AUDIO */
let audioStarted = false;
let audioEnabled = true;

/* STATO PER HOLD/PAUSE */
let activePointer = null;
let lastPointerTime = 0;
let lastPointerX = null;
const POINTER_DEBOUNCE_MS = 300;
const LONG_PRESS_MS = 500;      // soglia per considerare long-press (non cambia slide)
const MOVE_THRESHOLD_PX = 10;   // se si muove più di 10px consideriamo scroll/drag
const HOLD_THRESHOLD_MS = 200;  // dopo quanti ms di pressione iniziare la pausa (tweakable)

let holdTimer = null;
let isHolding = false;          // true quando siamo in pausa da press&hold

// per gestire progresso/pausa della barra
let progressStartTime = 0;      // timestamp quando è partita l'animazione corrente
let remainingForCurrent = null; // ms rimanenti quando mettiamo in pausa

/* -------------------------
   GESTIONE PLANE RESPONSIVE (piccoli desktop landscape)
-------------------------- */

function updatePlaneImage() {
  // Media query: desktop piccolo (13-14") in landscape
  const isSmallDesktopLandscape = window.matchMedia(
    '(min-width: 900px) and (max-width: 1300px) and (orientation: landscape)'
  ).matches;

  // Seleziona il plane nella slide 0 (slides[0])
  const firstSlide = slides[0];
  if (!firstSlide) return;

  const planeImg = firstSlide.querySelector('.plane');
  if (!planeImg) return;

  // Estrai il percorso della directory dalla sorgente corrente
  const currentSrc = planeImg.src;
  const dirPath = currentSrc.substring(0, currentSrc.lastIndexOf('/') + 1);

  if (isSmallDesktopLandscape) {
    // Cambia in plane1_modified.png
    if (!planeImg.src.includes('plane1_modified.png')) {
      planeImg.src = dirPath + 'plane1_modified.png';
    }
  } else {
    // Torna a plane1.png
    if (planeImg.src.includes('plane1_modified.png')) {
      planeImg.src = dirPath + 'plane1.png';
    }
  }
}

// Chiama al caricamento della pagina
document.addEventListener('DOMContentLoaded', updatePlaneImage);

// Aggiorna anche al resize e al cambio di orientamento
window.addEventListener('resize', updatePlaneImage);
window.addEventListener('orientationchange', updatePlaneImage);

/* -------------------------
   FUNZIONI SLIDE / PROGRESS
-------------------------- */

function getSlideInterval(index) {
  return index === 2 ? 15000 : autoPlayInterval; // modifica secondi ultima slide
}

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
    const duration = getSlideInterval(currentSlide);
    timer = setInterval(nextSlide, duration);
  }
}

function resetAutoPlay() {
  startAutoPlay();
}

/* -------------------------
   PROGRESS BAR (start/pausa/resume)
-------------------------- */

function updateProgressBar(index) {
  const duration = getSlideInterval(index);
  // reset totale
  segments.forEach(seg => {
    seg.style.transition = "none";
    seg.style.width = "0%";
  });

  // forzare reflow
  void document.body.offsetWidth;

  // riempi le barre precedenti
  for (let i = 0; i < index; i++) {
    segments[i].style.width = "100%";
  }

  // anima la barra corrente
  if (segments[index]) {
    // imposta transizione e avvia
    segments[index].style.transition = `width ${duration}ms linear`;
    // forza reflow prima di settare width per sicurezza
    void segments[index].offsetWidth;
    segments[index].style.width = "100%";
    // registra inizio animazione
    progressStartTime = Date.now();
    remainingForCurrent = duration;
  }
}

// mette in pausa l'animazione della barra corrente (usato da press&hold)
function pauseProgressBarForHold() {
  if (!segments[currentSlide]) return;
  const duration = getSlideInterval(currentSlide);
  // calcola elapsed
  const elapsed = Date.now() - progressStartTime;
  const elapsedClamped = Math.min(elapsed, duration);
  const percent = (elapsedClamped / duration) * 100;

  // rimuovi transizione e fissa la larghezza corrente
  segments[currentSlide].style.transition = "none";
  segments[currentSlide].style.width = `${percent}%`;

  // calcola remaining
  remainingForCurrent = Math.max(duration - elapsedClamped, 0);

  // ferma timer globale
  clearInterval(timer);
  isHolding = true;
}

// riprende l'animazione della barra dalla posizione salvata
function resumeProgressBarAfterHold() {
  if (!segments[currentSlide]) return;
  const duration = getSlideInterval(currentSlide);
  // se remainingForCurrent è null, riavvia normalmente
  const rem = remainingForCurrent != null ? remainingForCurrent : duration;

  // forza reflow
  void segments[currentSlide].offsetWidth;

  // imposta transizione per remaining ms e porta a 100%
  segments[currentSlide].style.transition = `width ${rem}ms linear`;
  segments[currentSlide].style.width = "100%";

  // imposta progressStartTime come "ora - (duration - rem)" per calcoli futuri
  progressStartTime = Date.now() - (duration - rem);

  // dopo rem ms, avanza e riavvia autoplay regolare
  clearInterval(timer);
  timer = setTimeout(() => {
    nextSlide();
    startAutoPlay();
  }, rem);

  // reset stato
  remainingForCurrent = null;
  isHolding = false;
}

/* -------------------------
   AUDIO ICON / TOGGLE
-------------------------- */

function updateAudioIcon() {
  if (!audioIcon) return;
  if (!audioEnabled) {
    audioIcon.classList.remove('bi-volume-up');
    audioIcon.classList.add('bi-volume-mute');
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
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
}

function restartFirstSlide() {
  const duration = getSlideInterval(0);
  if (segments[0]) {
    segments[0].style.transition = "none";
    segments[0].style.width = "0%";
    void document.body.offsetWidth;
    segments[0].style.transition = `width ${duration}ms linear`;
    segments[0].style.width = "100%";
  }
  showSlide(0);
  restartSlide1Animations();
  resetAutoPlay();
}

/* -------------------------
   GESTIONE POINTER / TAP / HOLD / SCROLL
-------------------------- */

const slider = document.querySelector('.slider');

function getClientCoordsFromEvent(e) {
  if (window.PointerEvent && e instanceof PointerEvent) {
    return { x: e.clientX, y: e.clientY };
  }
  if (e.touches && e.touches[0]) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if (e.changedTouches && e.changedTouches[0]) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  return { x: e.clientX || e.pageX || 0, y: e.clientY || e.pageY || 0 };
}

function onPointerDown(e) {
  if (!introSlide.classList.contains('hidden')) return;

  const coords = getClientCoordsFromEvent(e);

  activePointer = {
    id: (window.PointerEvent && e instanceof PointerEvent) ? e.pointerId : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].identifier : 'touch'),
    startTime: Date.now(),
    startX: coords.x,
    startY: coords.y,
    moved: false
  };

  // set pointer capture se disponibile
  if (window.PointerEvent && e instanceof PointerEvent && slider.setPointerCapture) {
    try { slider.setPointerCapture(activePointer.id); } catch (err) {}
  }

  // avvia timer per riconoscere hold -> pausa (non immediato per evitare pause su tap breve)
  clearTimeout(holdTimer);
  holdTimer = setTimeout(() => {
    // se non si è mossi, attiva la pausa
    if (activePointer && !activePointer.moved) {
      // metti in pausa la progress bar e il timer
      pauseProgressBarForHold();
    }
  }, HOLD_THRESHOLD_MS);
}

function onPointerMove(e) {
  if (!activePointer) return;

  const coords = getClientCoordsFromEvent(e);
  const dx = Math.abs(coords.x - activePointer.startX);
  const dy = Math.abs(coords.y - activePointer.startY);

  if (dy > MOVE_THRESHOLD_PX || dx > MOVE_THRESHOLD_PX) {
    activePointer.moved = true;
    // se ci stiamo muovendo, annulla il timer di hold (non vogliamo pause durante scroll/drag)
    clearTimeout(holdTimer);
  }
}

function onPointerUp(e) {
  // se non c'era pointer attivo, nulla da fare
  if (!activePointer) return;

  const coords = getClientCoordsFromEvent(e);
  const now = Date.now();
  const duration = now - activePointer.startTime;

  // release pointer capture
  try {
    if (window.PointerEvent && e instanceof PointerEvent && activePointer.id != null) {
      slider.releasePointerCapture && slider.releasePointerCapture(activePointer.id);
    }
  } catch (err) {}

  const moved = activePointer.moved;
  activePointer = null;

  // cancella hold timer
  clearTimeout(holdTimer);

  // se siamo in stato holding (pausa attiva), al rilascio riprendi la progressione
  if (isHolding) {
    resumeProgressBarAfterHold();
    return;
  }

  // se è stato uno scroll/drag o movimento significativo, ignoriamo (non è un tap)
  if (moved) return;

  // se è long press (durata >= LONG_PRESS_MS) e non abbiamo attivato hold, non considerarlo tap
  if (duration >= LONG_PRESS_MS) return;

  // debounce per evitare doppi trigger
  if (now - lastPointerTime < POINTER_DEBOUNCE_MS) {
    if (lastPointerX !== null && Math.abs(lastPointerX - coords.x) < 6) {
      return;
    }
  }

  lastPointerTime = now;
  lastPointerX = coords.x;

  const half = window.innerWidth / 2;
  const isLeft = coords.x < half;

  // Se il target è il bottone next esplicito, trattalo come tap destro
  const clickedNextBtn = e.target && e.target.closest && e.target.closest('.next-btn');
  if (clickedNextBtn) {
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    } else {
      restartFirstSlide();
    }
    return;
  }

  // comportamento tap breve: sinistra = indietro/riavvia, destra = avanti (wrap ultima->prima)
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
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    } else {
      restartFirstSlide();
    }
  }
}

function onPointerCancelOrLeave(e) {
  // pulisce lo stato se il pointer viene cancellato o esce
  if (!activePointer) return;
  try {
    if (window.PointerEvent && e instanceof PointerEvent && activePointer.id != null) {
      slider.releasePointerCapture && slider.releasePointerCapture(activePointer.id);
    }
  } catch (err) {}
  activePointer = null;
  clearTimeout(holdTimer);
  // se eravamo in hold, rilascia la pausa
  if (isHolding) {
    resumeProgressBarAfterHold();
  }
}

/* registra listener pointer + fallback touch */
if (slider) {
  try { slider.removeEventListener('touchstart', onPointerDown); } catch (err) {}
  slider.addEventListener('pointerdown', onPointerDown);
  slider.addEventListener('pointermove', onPointerMove);
  slider.addEventListener('pointerup', onPointerUp);
  slider.addEventListener('pointercancel', onPointerCancelOrLeave);
  slider.addEventListener('pointerleave', onPointerCancelOrLeave);

  // fallback touch events per browser che non supportano PointerEvent
  slider.addEventListener('touchstart', onPointerDown, {passive: true});
  slider.addEventListener('touchmove', onPointerMove, {passive: true});
  slider.addEventListener('touchend', onPointerUp);
  slider.addEventListener('touchcancel', onPointerCancelOrLeave);

  // previeni menu contestuale su long press
  slider.addEventListener('contextmenu', e => e.preventDefault());
}

/* -------------------------
   FINE
-------------------------- */
