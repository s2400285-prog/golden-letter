'use strict';
(() => {
  const el = id => document.getElementById(id);
  const audio = el('audio'), panel = el('player'), toggle = el('musicToggle');
  const hint = el('musicHint'), title = el('trackTitle'), seek = el('seek');
  let opened = false, objectURL = '', selectedTrack = false;
  const seconds = value => {
    const n = Number.isFinite(value) ? Math.floor(value) : 0;
    return Math.floor(n / 60) + ':' + String(n % 60).padStart(2,'0');
  };
  function sync() {
    const duration = audio.duration;
    const playing = !audio.paused && !audio.ended;
    panel.classList.toggle('playing', playing);
    el('play').textContent = playing ? 'Pause' : 'Play';
    el('play').disabled = !opened;
    el('mute').textContent = audio.muted ? 'Unmute' : 'Mute';
    el('clock').textContent = seconds(audio.currentTime) + ' / ' + seconds(duration);
    seek.disabled = !Number.isFinite(duration) || duration <= 0;
    seek.value = seek.disabled ? 0 : audio.currentTime / duration * 100;
  }
  async function play() {
    try {await audio.play();} catch (err) {
      if(err.name !== 'AbortError') hint.textContent = 'Choose a playable MP3, then press Play.';
    }
    sync();
  }
  function showPanel(show) {
    panel.hidden = !show;
    toggle.setAttribute('aria-expanded',String(show));
  }
  toggle.addEventListener('click', () => showPanel(panel.hidden));
  document.addEventListener('click', e => {
    if(!panel.hidden && !panel.contains(e.target) && !toggle.contains(e.target)) showPanel(false);
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && !panel.hidden){showPanel(false);toggle.focus();}
  });
  el('play').addEventListener('click', () => audio.paused ? play() : audio.pause());
  el('mute').addEventListener('click', () => {audio.muted = !audio.muted; sync();});
  seek.addEventListener('input', () => {if(Number.isFinite(audio.duration)) audio.currentTime = audio.duration * Number(seek.value) / 100;});
  el('chooseTrack').addEventListener('click', () => el('localTrack').click());
  el('localTrack').addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    const resume = opened && (!audio.paused || Boolean(audio.error));
    const previous = objectURL;
    objectURL = URL.createObjectURL(file);
    selectedTrack = true;
    audio.src = objectURL; audio.load();
    if(previous) URL.revokeObjectURL(previous);
    title.textContent = file.name.replace(/\.mp3$/i,'');
    hint.textContent = opened ? 'Playing from your device when you press Play.' : 'Opening your letter starts the music.';
    if(resume) play();
    e.target.value = '';
  });
  audio.addEventListener('error', () => {hint.textContent = 'This audio could not be played. Choose an MP3 from your device.';sync();});
  ['loadedmetadata','timeupdate','play','pause','volumechange','durationchange'].forEach(evt => audio.addEventListener(evt,sync));
  // Read only the start of the MP3. Replacing the bundled instrumental automatically updates the label.
  async function identifyTrack() {
    if(location.protocol === 'file:'){title.textContent = 'Our soundtrack'; return;}
    try {
      const response = await fetch('assets/music.mp3',{headers:{Range:'bytes=0-511'}});
      if(!response.ok || !response.body) return;
      const reader = response.body.getReader();
      let metadata = '';
      while(metadata.length < 512){
        const chunk = await reader.read();
        if(chunk.done) break;
        metadata += new TextDecoder('latin1').decode(chunk.value.slice(0,512-metadata.length));
      }
      await reader.cancel();
      if(!selectedTrack) title.textContent = metadata.includes('JULIE_ORIGINAL_DEMO') ? 'For Julie · Original instrumental' : 'Keep Me · Novo Amor';
    } catch { /* Local-file playback also works without metadata inspection. */ }
  }
  audio.volume = .54;
  sync(); identifyTrack();
  window.Letter.startMusic = () => {
    opened = true;
    hint.textContent = 'Choose your copy of “Keep Me” by Novo Amor here.';
    sync(); play();
  };
})();
