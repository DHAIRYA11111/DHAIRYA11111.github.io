const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const year = document.querySelector("[data-year]");
const hero = document.querySelector(".hero");
const heroCanvas = document.querySelector("[data-hero-canvas]");

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 10);
};

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!header || !navToggle) return;
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

if (year) year.textContent = new Date().getFullYear();
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const initHeroScene = async () => {
  if (!hero || !heroCanvas) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    camera.position.set(0, 0.6, 8);

    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

    const pointer = { x: 0, y: 0 };
    const easedPointer = { x: 0, y: 0 };
    const root = new THREE.Group();
    scene.add(root);

    const particleCount = window.innerWidth < 640 ? 360 : 720;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const palette = [
      new THREE.Color("#a8f7ff"),
      new THREE.Color("#7046ff"),
      new THREE.Color("#baf86c"),
      new THREE.Color("#ffffff"),
    ];

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 12;
      positions[i3 + 1] = (Math.random() - 0.5) * 7;
      positions[i3 + 2] = (Math.random() - 0.5) * 7;

      const color = palette[i % palette.length];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.035,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.86,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    root.add(particles);

    const panelGroup = new THREE.Group();
    root.add(panelGroup);

    const makePanel = (x, y, z, width, height, color) => {
      const geometry = new THREE.PlaneGeometry(width, height, 3, 2);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.28,
        wireframe: true,
        blending: THREE.AdditiveBlending,
      });
      const panel = new THREE.Mesh(geometry, material);
      panel.position.set(x, y, z);
      panel.rotation.set(-0.18 + y * 0.04, 0.32 + x * 0.03, 0.03);
      panelGroup.add(panel);
      return panel;
    };

    const panels = [
      makePanel(3.4, 1.55, -1.2, 2.1, 1.0, "#a8f7ff"),
      makePanel(2.4, -0.9, -0.6, 1.6, 0.72, "#baf86c"),
      makePanel(4.5, -0.02, -2.2, 2.0, 1.18, "#7046ff"),
      makePanel(0.8, 1.8, -3.2, 1.2, 0.76, "#ffffff"),
    ];

    const coreGeometry = new THREE.IcosahedronGeometry(0.7, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: "#a8f7ff",
      transparent: true,
      opacity: 0.28,
      wireframe: true,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(3.6, -1.2, -0.4);
    root.add(core);

    const orbitGeometry = new THREE.TorusGeometry(1.15, 0.006, 8, 110);
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: "#baf86c",
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.position.copy(core.position);
    orbit.rotation.set(1.08, 0.18, 0.4);
    root.add(orbit);

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    };

    const updatePointer = (clientX, clientY) => {
      const rect = hero.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = -((clientY - rect.top) / rect.height - 0.5) * 2;
    };

    hero.addEventListener("pointermove", (event) => updatePointer(event.clientX, event.clientY));
    hero.addEventListener("pointerleave", () => {
      pointer.x = 0;
      pointer.y = 0;
    });
    hero.addEventListener(
      "touchmove",
      (event) => {
        const touch = event.touches[0];
        if (touch) updatePointer(touch.clientX, touch.clientY);
      },
      { passive: true }
    );

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hero);
    resize();

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      easedPointer.x += (pointer.x - easedPointer.x) * 0.06;
      easedPointer.y += (pointer.y - easedPointer.y) * 0.06;

      root.rotation.y = easedPointer.x * 0.18;
      root.rotation.x = easedPointer.y * 0.08;
      particles.rotation.y = time * 0.035;
      particles.rotation.x = Math.sin(time * 0.28) * 0.035;
      panelGroup.position.x = easedPointer.x * 0.34;
      panelGroup.position.y = easedPointer.y * 0.2;

      panels.forEach((panel, index) => {
        panel.position.y += Math.sin(time * 0.8 + index) * 0.0009;
        panel.rotation.z = Math.sin(time * 0.32 + index) * 0.06;
      });

      core.rotation.x = time * 0.42 + easedPointer.y * 0.25;
      core.rotation.y = time * 0.58 + easedPointer.x * 0.3;
      orbit.rotation.z = time * 0.34;

      renderer.render(scene, camera);
    };

    animate();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame) {
        animate();
      }
    });
  } catch (error) {
    console.warn("3D hero scene could not be initialized.", error);
  }
};

initHeroScene();
