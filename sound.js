// The looping score and interactive station effects share one audio preference.
(() => {
  const toggle = document.querySelector('#station-sound');
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  const music = document.getElementById('night-score');
  if (!music || !toggle) return;
  toggle.hidden = false;

  let context, volume;
  let enabled = true;
  const preferenceKey = 'night-line-audio-muted';
  try { enabled = localStorage.getItem(preferenceKey) !== 'yes'; } catch {}
  music.volume = .48;
  let lastPlayed = -Infinity;
  let lastSwitch = -Infinity;
  let noiseBuffer, heroVisible = true;
  const dock = document.createElement('button');
  dock.type = 'button';
  dock.className = 'station-sound sound-dock';
  dock.textContent = 'Mute sound';
  dock.hidden = true;
  dock.addEventListener('click', () => toggle.click());
  document.body.append(dock);

  function updateDock() {
    dock.hidden = heroVisible;
    dock.textContent = enabled ? 'Mute audio' : 'Unmute audio';
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.querySelector('.sound-state').textContent = enabled ? 'Mute audio' : 'Unmute audio';
  }
  // Filtered noise supplies a passing-rail sweep and a dry control click.
  function rush(duration, startHz, endHz, level) {
    if (!enabled || document.hidden || context?.state !== 'running') return;
    if (!noiseBuffer) {
      noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate*1.6), context.sampleRate);
      const samples = noiseBuffer.getChannelData(0);
      for (let i=0; i<samples.length; i++) samples[i] = Math.random()*2-1;
    }
    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = .65;
    const now = context.currentTime;
    filter.frequency.setValueAtTime(startHz, now);
    filter.frequency.exponentialRampToValueAtTime(endHz,now+duration);
    const gain = context.createGain();
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(level,now+duration*.22);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    source.connect(filter); filter.connect(gain); gain.connect(volume);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(now);
    source.stop(now+duration);
  }
  const pitches = [293.665, 329.628, 369.994, 440, 493.883, 587.33];

  function bell(frequency, start, length) {
    // A quick upper partial gives each note a glass-like attack.
    for (const [ratio, strength, decay] of [[1,.48,1],[2.01,.12,.48],[3.89,.038,.25]]) {
      const voice = context.createOscillator();
      const envelope = context.createGain();
      const end = start + length * decay;
      voice.type = 'sine';
      voice.frequency.value = frequency * ratio;
      envelope.gain.setValueAtTime(.0001, start);
      envelope.gain.exponentialRampToValueAtTime(strength, start + .012);
      envelope.gain.exponentialRampToValueAtTime(.0001, end);
      voice.connect(envelope);
      envelope.connect(volume);
      voice.onended = () => { voice.disconnect(); envelope.disconnect(); };
      voice.start(start);
      voice.stop(end + .02);
    }
  }
  function phrase(notes) {
    if (!enabled || document.hidden || context?.state !== 'running') return;
    lastPlayed = performance.now();
    notes.forEach(([pitch,offset,length]) => bell(pitches[pitch],context.currentTime+.025+offset,length));
  }
  function startMusic() {
    if (enabled && music.paused) {
      // Browsers that require activation reject this on load. An ordinary
      // trusted gesture below retries synchronously within the activation.
      const playback = music.play();
      playback?.catch(() => {});
    }
  }
  function unlockEffects() {
    if (!enabled || !AudioEngine) return;
    try {
      if (!context) {
        context = new AudioEngine();
        volume = context.createGain();
        volume.gain.value = .13;
        volume.connect(context.destination);
      }
      if (context.state !== 'running') context.resume().catch(() => {});
    } catch {}
  }
  function activate(event) {
    if (!enabled || !event.isTrusted || toggle.contains(event.target) || dock.contains(event.target)) return;
    startMusic();
    unlockEffects();
  }
  for (const type of ['pointerdown','pointerup','keydown','click','touchend']) {
    document.addEventListener(type,activate,{capture:true,passive:true});
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(preferenceKey,enabled ? 'no' : 'yes'); } catch {}
    if (enabled) {
      startMusic();
      unlockEffects();
      if (volume) volume.gain.setTargetAtTime(.13,context.currentTime,.02);
    } else {
      music.pause();
      if (volume) volume.gain.setTargetAtTime(0,context.currentTime,.02);
    }
    updateDock();
  });
  updateDock();
  startMusic();
  addEventListener('pageshow',startMusic);

  function workbenchClick() {
    if (!enabled || document.hidden || performance.now()-lastSwitch<180) return;
    lastSwitch = performance.now();
    rush(.085,1350,520,.7);
  }
  const workbench = document.querySelector('#lab [role="tablist"]');
  workbench?.addEventListener('click', workbenchClick);
  workbench?.addEventListener('keydown', e => {
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)) workbenchClick();
  });
  document.addEventListener('visibilitychange', () => {
    if (!context || !enabled) return;
    if (document.hidden) context.suspend().catch(()=>{});
    else context.resume().catch(()=>{});
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const leaving = heroVisible && !entry.isIntersecting;
      heroVisible = entry.isIntersecting;
      updateDock();
      if (leaving) rush(1.25,180,940,.36);
    }).observe(document.querySelector('#home'));
    const sections = [...document.querySelectorAll('main > section:not(#home)')];
    const entryChime = new IntersectionObserver(changes => {
      const visible = changes.find(change => change.isIntersecting);
      if (!enabled || !visible || performance.now()-lastPlayed<4000) return;
      const pitch = sections.indexOf(visible.target)%4;
      phrase([[pitch,0,.65],[pitch+2,.18,.95]]);
    },{rootMargin:'-25% 0px -55% 0px'});
    sections.forEach(section => entryChime.observe(section));
  }
})();
