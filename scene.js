// A transparent weather layer for the night train illustration.
(() => {
  'use strict';
  const canvas = document.getElementById('city-fx');
  const hero = document.getElementById('home');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  canvas.style.pointerEvents = 'none';
  canvas.setAttribute('aria-hidden', 'true');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const intersection = hero.getBoundingClientRect();
  let visible = intersection.bottom > 0 && intersection.top < window.innerHeight;
  let paused = false;
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastPaint = 0;
  let seconds = 0;
  let drops = [];
  const frameInterval = 1000 / 24;

  // Fixed positions keep the highlights rooted to the skyline as the rain moves.
  const windows = [
    [0.71, 0.67, 9.2], [0.73, 0.61, 7.4], [0.79, 0.59, 11.6],
    [0.87, 0.50, 13.7], [0.92, 0.39, 10.1], [0.965, 0.55, 8.8],
  ];

  function paint(dt) {
    ctx.clearRect(0, 0, width, height);
    seconds += dt;
    ctx.strokeStyle = 'rgb(170, 199, 211)';
    for (const drop of drops) {
      drop.x -= drop.speed * dt * 0.32;
      drop.y += drop.speed * dt;
      if (drop.y > height + drop.length || drop.x < -drop.length) {
        drop.x = Math.random() * (width + height * 0.32);
        drop.y = -drop.length;
      }
      const onSkyline = Math.max(0, Math.min(1, (drop.x / width - 0.28) * 2.2));
      ctx.globalAlpha = drop.alpha * (0.36 + onSkyline * 0.64);
      ctx.lineWidth = drop.thickness;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - drop.length * 0.32, drop.y + drop.length);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgb(255, 211, 157)';
    windows.forEach(([x, y, period], i) => {
      const glow = Math.max(0, Math.sin(seconds * 2 * Math.PI / period + i * 1.618));
      ctx.globalAlpha = 0.24 * glow ** 8;
      ctx.fillRect(x * width, y * height, 1.8 + i % 3, 1.2);
    });
    ctx.globalAlpha = 1;
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (!lastPaint) lastPaint = now;
    const elapsed = now - lastPaint;
    if (elapsed < frameInterval) return;
    // Keep the 24 Hz cadence on 60/120 Hz displays without catching up after idle.
    lastPaint = now - (elapsed % frameInterval);
    paint(Math.min(Math.floor(elapsed / frameInterval) * frameInterval, 100) / 1000);
  }

  function sync() {
    const running = !paused && !reducedMotion.matches && visible && !document.hidden && width > 0 && height > 0;
    if (running && !frame) {
      lastPaint = 0;
      frame = requestAnimationFrame(tick);
    }
    if (!running && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (reducedMotion.matches) ctx.clearRect(0, 0, width, height);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.round(rect.width);
    const nextHeight = Math.round(rect.height);
    if (width === nextWidth && height === nextHeight) return;
    width = nextWidth;
    height = nextHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const count = Math.min(75, Math.ceil(width * height / 10500));
    drops = Array.from({ length: count }, () => {
      const depth = Math.random();
      return {
        x: Math.random() * width, y: Math.random() * height,
        length: 4 + 13 * depth, speed: 45 + depth * 140,
        thickness: 0.48 + depth * 0.45, alpha: 0.07 + depth * 0.17,
      };
    });
    sync();
  }

  window.portfolioScene = {
    setPaused(value) { paused = Boolean(value); sync(); },
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(hero);
  } else {
    visible = true;
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', sync);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', sync);
  else reducedMotion.addListener(sync);
  resize();
})();
