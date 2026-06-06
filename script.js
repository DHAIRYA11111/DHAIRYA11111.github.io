const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const year = document.querySelector("[data-year]");
const hero = document.querySelector(".hero");
const heroCanvas = document.querySelector("[data-hero-canvas]");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
};

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

year.textContent = new Date().getFullYear();
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const initHeroScene = async () => {
  if (!hero || !heroCanvas) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js");

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020706, 0.035);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(0, 0.45, 9.4);

    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const pointer = { x: 0, y: 0 };
    const easedPointer = { x: 0, y: 0 };
    const root = new THREE.Group();
    const deepSpace = new THREE.Group();
    const architecture = new THREE.Group();
    const glassLayer = new THREE.Group();
    const featureCore = new THREE.Group();
    scene.add(root);
    root.add(deepSpace, architecture, glassLayer, featureCore);

    const ambientLight = new THREE.AmbientLight(0x8ff8ea, 0.48);
    const keyLight = new THREE.PointLight(0xffad7c, 2.8, 28);
    keyLight.position.set(4.8, 3.6, 4.2);
    const rimLight = new THREE.PointLight(0x6ee7d8, 3.4, 32);
    rimLight.position.set(6.2, -2.8, 2.8);
    scene.add(ambientLight, keyLight, rimLight);

    const mobile = window.innerWidth < 640;
    const particleCount = mobile ? 620 : 1550;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particleSeeds = new Float32Array(particleCount);
    const palette = [
      new THREE.Color("#6ee7d8"),
      new THREE.Color("#dc704b"),
      new THREE.Color("#d5a53f"),
      new THREE.Color("#ffffff"),
      new THREE.Color("#8ff8ea"),
    ];

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const depth = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * (mobile ? 4.8 : 7.2);
      positions[i3] = Math.cos(angle) * radius + 2.4 + depth * 1.8;
      positions[i3 + 1] = (Math.random() - 0.5) * (mobile ? 5.8 : 7.6);
      positions[i3 + 2] = -9 + depth * 13;
      particleSeeds[i] = Math.random() * Math.PI * 2;

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
        size: mobile ? 0.026 : 0.032,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.82,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    deepSpace.add(particles);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: "#6ee7d8",
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
    });
    const warmLineMaterial = new THREE.LineBasicMaterial({
      color: "#d5a53f",
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });

    const connectionPositions = [];
    for (let i = 0; i < (mobile ? 82 : 180); i += 1) {
      const x = 1.4 + Math.random() * 6.6;
      const y = -2.8 + Math.random() * 5.6;
      const z = -6 + Math.random() * 8;
      connectionPositions.push(x, y, z, x + (Math.random() - 0.5) * 1.6, y + (Math.random() - 0.5) * 1.1, z + (Math.random() - 0.5) * 1.8);
    }
    const connectionGeometry = new THREE.BufferGeometry();
    connectionGeometry.setAttribute("position", new THREE.Float32BufferAttribute(connectionPositions, 3));
    const connections = new THREE.LineSegments(connectionGeometry, lineMaterial);
    architecture.add(connections);

    const gridPositions = [];
    const gridWidth = mobile ? 5 : 8;
    const gridHeight = mobile ? 4 : 5;
    for (let x = 0; x <= gridWidth; x += 1) {
      const px = 1.2 + x * 0.62;
      gridPositions.push(px, -2.25, -2.4, px, 2.25, -2.4);
    }
    for (let y = 0; y <= gridHeight; y += 1) {
      const py = -2.25 + y * 0.9;
      gridPositions.push(1.2, py, -2.4, 1.2 + gridWidth * 0.62, py, -2.4);
    }
    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
    const dataGrid = new THREE.LineSegments(gridGeometry, warmLineMaterial);
    dataGrid.position.set(0.55, 0.05, -1.4);
    dataGrid.rotation.set(-0.18, 0.55, 0.04);
    glassLayer.add(dataGrid);

    const makePanel = (x, y, z, width, height, color) => {
      const panel = new THREE.Group();
      const surface = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height, 6, 4),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.08,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      const frame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(width, height)),
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.58,
          blending: THREE.AdditiveBlending,
        })
      );
      const scan = new THREE.Mesh(
        new THREE.PlaneGeometry(width * 0.92, 0.035),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      panel.add(surface, frame, scan);
      panel.userData.scan = scan;
      panel.position.set(x, y, z);
      panel.rotation.set(-0.2 + y * 0.04, 0.28 + x * 0.035, 0.04);
      glassLayer.add(panel);
      return panel;
    };

    const panels = [
      makePanel(3.3, 1.75, -1.0, 2.4, 1.08, "#6ee7d8"),
      makePanel(2.2, -0.98, -0.45, 1.78, 0.82, "#d5a53f"),
      makePanel(4.75, -0.06, -2.0, 2.38, 1.28, "#dc704b"),
      makePanel(0.78, 1.92, -3.0, 1.35, 0.82, "#ffffff"),
      makePanel(5.55, 1.18, -4.2, 1.62, 0.74, "#8ff8ea"),
    ];

    const cubeCount = mobile ? 70 : 180;
    const cubeGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: "#6ee7d8",
      emissive: "#0b5f59",
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.66,
      roughness: 0.35,
      metalness: 0.3,
    });
    const dataCubes = new THREE.InstancedMesh(cubeGeometry, cubeMaterial, cubeCount);
    const dummy = new THREE.Object3D();
    const cubeSeeds = [];
    for (let i = 0; i < cubeCount; i += 1) {
      const seed = {
        x: 1.4 + Math.random() * 6.4,
        y: -2.3 + Math.random() * 4.8,
        z: -5.6 + Math.random() * 7.8,
        s: 0.7 + Math.random() * 2.4,
        r: Math.random() * Math.PI,
      };
      cubeSeeds.push(seed);
      dummy.position.set(seed.x, seed.y, seed.z);
      dummy.rotation.set(seed.r, seed.r * 0.4, seed.r * 0.2);
      dummy.scale.setScalar(seed.s);
      dummy.updateMatrix();
      dataCubes.setMatrixAt(i, dummy.matrix);
    }
    architecture.add(dataCubes);

    const curveMaterialA = new THREE.MeshBasicMaterial({
      color: "#6ee7d8",
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
    });
    const curveMaterialB = new THREE.MeshBasicMaterial({
      color: "#dc704b",
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
    });
    const makeRibbon = (offset, material) => {
      const points = [];
      for (let i = 0; i < 7; i += 1) {
        points.push(new THREE.Vector3(0.2 + i * 1.0, Math.sin(i * 0.9 + offset) * 0.72 + offset * 0.1, -4 + Math.cos(i * 0.7 + offset) * 1.2));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.012, 8, false), material);
      mesh.position.set(1.1, offset * 0.72, -0.1);
      mesh.rotation.set(0.08, 0.22, -0.03);
      architecture.add(mesh);
      return mesh;
    };
    const ribbons = [makeRibbon(0.2, curveMaterialA), makeRibbon(1.65, curveMaterialB), makeRibbon(-1.35, curveMaterialA)];

    const coreBody = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.82, 2),
      new THREE.MeshStandardMaterial({
        color: "#0b3936",
        emissive: "#21d9c8",
        emissiveIntensity: 0.78,
        transparent: true,
        opacity: 0.72,
        roughness: 0.18,
        metalness: 0.52,
      })
    );
    const coreWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.9, 2)),
      new THREE.LineBasicMaterial({
        color: "#6ee7d8",
        transparent: true,
        opacity: 0.74,
        blending: THREE.AdditiveBlending,
      })
    );
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: "#d5a53f",
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
    });
    const orbitA = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.008, 10, 128), orbitMaterial);
    const orbitB = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.007, 10, 128), orbitMaterial.clone());
    orbitB.material.color = new THREE.Color("#6ee7d8");
    orbitA.rotation.set(1.08, 0.18, 0.4);
    orbitB.rotation.set(0.48, 1.08, -0.22);
    featureCore.position.set(mobile ? 2.8 : 3.65, mobile ? -1.06 : -1.18, -0.28);
    featureCore.add(coreBody, coreWire, orbitA, orbitB);

    const scanner = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 0.22),
      new THREE.MeshBasicMaterial({
        color: "#6ee7d8",
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    scanner.position.set(4.1, 0, -1.05);
    scanner.rotation.set(-0.16, 0.36, 0.02);
    glassLayer.add(scanner);

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

      camera.position.x = easedPointer.x * 0.46;
      camera.position.y = 0.45 + easedPointer.y * 0.24;
      camera.lookAt(1.6 + easedPointer.x * 0.4, easedPointer.y * 0.16, -1.9);

      root.rotation.y = easedPointer.x * 0.1;
      root.rotation.x = easedPointer.y * 0.045;
      deepSpace.rotation.y = time * 0.026;
      deepSpace.rotation.x = Math.sin(time * 0.22) * 0.025;
      architecture.position.x = easedPointer.x * 0.46;
      architecture.position.y = easedPointer.y * 0.22;
      glassLayer.position.x = easedPointer.x * 0.38;
      glassLayer.position.y = easedPointer.y * 0.22;

      panels.forEach((panel, index) => {
        panel.position.y += Math.sin(time * 1.1 + index) * 0.0014;
        panel.rotation.z = Math.sin(time * 0.36 + index) * 0.055;
        panel.userData.scan.position.y = Math.sin(time * 1.25 + index) * 0.34;
      });

      ribbons.forEach((ribbon, index) => {
        ribbon.rotation.y = Math.sin(time * 0.36 + index) * 0.12;
        ribbon.position.z = -0.1 + Math.sin(time * 0.52 + index) * 0.18;
      });

      cubeSeeds.forEach((seed, index) => {
        dummy.position.set(seed.x, seed.y + Math.sin(time * 1.25 + seed.r) * 0.035, seed.z);
        dummy.rotation.set(seed.r + time * 0.12, seed.r * 0.4 + time * 0.08, seed.r * 0.2);
        dummy.scale.setScalar(seed.s * (1 + Math.sin(time * 1.4 + index) * 0.08));
        dummy.updateMatrix();
        dataCubes.setMatrixAt(index, dummy.matrix);
      });
      dataCubes.instanceMatrix.needsUpdate = true;

      const livePositions = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i += 1) {
        livePositions[i * 3 + 1] += Math.sin(time * 0.72 + particleSeeds[i]) * 0.0009;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      featureCore.rotation.x = time * 0.2 + easedPointer.y * 0.22;
      featureCore.rotation.y = time * 0.34 + easedPointer.x * 0.28;
      orbitA.rotation.z = time * 0.48;
      orbitB.rotation.z = -time * 0.42;
      scanner.position.y = Math.sin(time * 1.25) * 1.25;
      scanner.material.opacity = 0.12 + Math.sin(time * 2.1) * 0.06;
      rimLight.intensity = 2.8 + Math.sin(time * 1.4) * 0.45;

      renderer.render(scene, camera);
      window.__hero3dReady = true;
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
