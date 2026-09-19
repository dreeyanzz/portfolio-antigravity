/**
 * ADRIAN SETH TABOTABO — AUDIO MINI-PLAYER & SOUNDSCAPE
 * Floating "Currently Listening" widget, playlist cycling, visualizer bars, and Web Audio ambient vibe.
 */

(function () {
  'use strict';

  const data = window.PORTFOLIO_DATA;
  if (!data || !data.musicPlaylists) return;

  let currentPlaylistIndex = 0;
  let isPlaying = true;
  let audioCtx = null;
  let ambientGain = null;
  let isSoundEnabled = false;

  // DOM Elements
  const widget = document.getElementById('listeningWidget');
  const vinylDisc = document.getElementById('vinylDisc');
  const trackTitle = document.getElementById('listeningTrack');
  const artistName = document.getElementById('listeningArtist');
  const audioWaves = document.getElementById('audioWaves');
  const playlistModal = document.getElementById('playlistModal');
  const playlistItemsContainer = document.getElementById('playlistItems');

  if (!widget || !vinylDisc || !trackTitle || !artistName) return;

  function updateTrackDisplay() {
    const current = data.musicPlaylists[currentPlaylistIndex];
    trackTitle.textContent = current.track;
    artistName.textContent = current.artist;

    // Update active state in modal
    const items = playlistModal.querySelectorAll('.playlist-item');
    items.forEach((item, idx) => {
      if (idx === currentPlaylistIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function setPlayingState(playing) {
    isPlaying = playing;
    if (isPlaying) {
      vinylDisc.classList.remove('paused');
      audioWaves.classList.remove('paused');
    } else {
      vinylDisc.classList.add('paused');
      audioWaves.classList.add('paused');
    }

    if (ambientGain) {
      const now = audioCtx.currentTime;
      ambientGain.gain.setTargetAtTime(isPlaying && isSoundEnabled ? 0.03 : 0, now, 0.1);
    }
  }

  // Populate Playlist Modal
  function initPlaylistModal() {
    playlistItemsContainer.innerHTML = '';
    data.musicPlaylists.forEach((pl, index) => {
      const item = document.createElement('div');
      item.className = `playlist-item ${index === currentPlaylistIndex ? 'active' : ''}`;
      item.innerHTML = `
        <div class="playlist-item-meta">
          <span class="playlist-item-name">${pl.moodLabel}</span>
          <span class="playlist-item-genre">${pl.track} • ${pl.artist}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--rose-primary); opacity: ${index === currentPlaylistIndex ? '1' : '0.4'}">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentPlaylistIndex = index;
        updateTrackDisplay();
        setPlayingState(true);
        playlistModal.classList.remove('active');
      });

      playlistItemsContainer.appendChild(item);
    });
  }

  // Toggle Modal on click
  widget.addEventListener('click', (e) => {
    e.stopPropagation();
    playlistModal.classList.toggle('active');
  });

  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    if (playlistModal && !playlistModal.contains(e.target) && !widget.contains(e.target)) {
      playlistModal.classList.remove('active');
    }
  });

  // Optional: Click on vinyl disc toggles play/pause
  vinylDisc.addEventListener('click', (e) => {
    e.stopPropagation();
    setPlayingState(!isPlaying);
  });

  // Initialize
  initPlaylistModal();
  updateTrackDisplay();
  setPlayingState(true);

})();
