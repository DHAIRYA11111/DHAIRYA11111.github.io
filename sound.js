// Original departure chime: a short pentatonic phrase on synthesized bells.
(() => {
  const toggle = document.querySelector('#station-sound');
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio || !toggle) return;
  toggle.hidden = false;

  let context, volume, enabled = false, changing = false;
  let lastPlayed = -Infinity;
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
    if (!enabled || document.hidden || context.state !== 'running') return;
    lastPlayed = performance.now();
    notes.forEach(([pitch,offset,length]) => bell(pitches[pitch],context.currentTime+.025+offset,length));
  }
  toggle.addEventListener('click', async () => {
    if (changing) return;
    changing = true;
    try {
      if (!context) {
        context = new Audio();
        volume = context.createGain();
        volume.gain.value = 0;
        volume.connect(context.destination);
      }
      if (!enabled) {
        await context.resume();
        enabled = true;
        volume.gain.setTargetAtTime(.14,context.currentTime,.015);
        phrase([[0,0,.75],[2,.16,.7],[4,.40,1.2],[3,.70,1.35]]);
      } else {
        enabled = false;
        volume.gain.cancelScheduledValues(context.currentTime);
        volume.gain.setTargetAtTime(0,context.currentTime,.02);
      }
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.querySelector('.sound-state').textContent = enabled ? 'Sound on' : 'Sound off';
    } catch {
      toggle.querySelector('.sound-state').textContent = 'Audio unavailable';
    } finally { changing = false; }
  });

  if ('IntersectionObserver' in window) {
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
