// Miniplayer YouTube: avvio automatico al primo click, gestione eventi

// Sostituisci con il tuo video preferito!
const YT_VIDEO_ID = "YnWgPFgCJ4o"; // Cambia con l'ID del video YouTube

let ytPlayer;
let ytStarted = false;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady(event) {
  // Non avvia subito, aspetta il primo click
}

// Avvia la musica al primo click (ma non se il click è sul player)
document.addEventListener('click', function (e) {
  if (ytStarted) return;

  // Se il click è sul miniplayer o suoi figli, non avvia
  const miniplayer = document.getElementById('yt-miniplayer');
  if (miniplayer && miniplayer.contains(e.target)) return;

  ytStarted = true;
  if (ytPlayer) {
    ytPlayer.playVideo();
  }
});

// Previeni la propagazione dei click sul miniplayer (così non cambiano slide)
window.addEventListener('DOMContentLoaded', function () {
  const miniplayer = document.getElementById('yt-miniplayer');
  if (miniplayer) {
    miniplayer.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }
});
