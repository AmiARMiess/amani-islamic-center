const canvas = document.querySelector("#mosque-scene");
const heroArt = document.querySelector(".hero-art");
const showMosqueFallback = () => heroArt?.classList.add("three-fallback");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const copyrightYear = document.querySelector("#copyright-year");
const copyAddressButton = document.querySelector("#copy-address");
const centerAddress = document.querySelector("#center-address");
const copyAddressStatus = document.querySelector("#copy-address-status");

if (copyrightYear) copyrightYear.textContent = String(new Date().getFullYear());

copyAddressButton?.addEventListener("click", async () => {
  if (!(centerAddress instanceof HTMLElement) || !copyAddressStatus) return;

  try {
    await navigator.clipboard.writeText(centerAddress.textContent.trim());
    copyAddressStatus.textContent = "Address copied.";
  } catch (error) {
    console.error("Could not copy the center address to the clipboard.", error);
    copyAddressStatus.textContent = "Copy failed. Please select the address and copy it.";
  }
});

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  nav?.classList.toggle("is-open", !isOpen);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
  });
});

if (canvas instanceof HTMLCanvasElement) {
  import("three")
    .then((THREE) => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-6, 6, 4.8, -4.8, 0.1, 60);
      camera.position.set(6.2, 8, 22);
      camera.lookAt(0, 3.05, 0);

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch (error) {
        console.error("The Three.js mosque scene could not initialize WebGL.", error);
      }
      if (!renderer) {
        showMosqueFallback();
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;

      scene.add(new THREE.HemisphereLight(0xe9e8d5, 0x233e31, 2.2));
      const moonLight = new THREE.DirectionalLight(0xffe4b0, 3.1);
      moonLight.position.set(-6, 10, 8);
      scene.add(moonLight);
      const coolFill = new THREE.DirectionalLight(0x91b6a2, 1.5);
      coolFill.position.set(7, 5, -6);
      scene.add(coolFill);
      const warmGlow = new THREE.PointLight(0xe6bd76, 18, 11, 2);
      warmGlow.position.set(0, 1.8, 4);
      scene.add(warmGlow);

      const stone = new THREE.MeshStandardMaterial({ color: 0xd7d0b8, roughness: 0.76 });
      const lightStone = new THREE.MeshStandardMaterial({ color: 0xe8dfc7, roughness: 0.67 });
      const shadowStone = new THREE.MeshStandardMaterial({ color: 0x92977d, roughness: 0.8 });
      const deepGreen = new THREE.MeshStandardMaterial({ color: 0x20382e, roughness: 0.9 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xc8a568, roughness: 0.42, metalness: 0.3 });
      const domeMaterial = new THREE.MeshStandardMaterial({
        color: 0x718678,
        roughness: 0.48,
        metalness: 0.08,
      });
      const domeRibMaterial = new THREE.MeshStandardMaterial({
        color: 0xe0c68c,
        roughness: 0.42,
        metalness: 0.28,
        transparent: true,
        opacity: 0.25,
      });

      const mosque = new THREE.Group();
      scene.add(mosque);

      const addMesh = (geometry, material, parent, x, y, z) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
      };

      const addBox = (parent, width, height, depth, material, x, y, z) =>
        addMesh(new THREE.BoxGeometry(width, height, depth), material, parent, x, y, z);

      const addCylinder = (parent, top, bottom, height, material, x, y, z, sides = 48) =>
        addMesh(
          new THREE.CylinderGeometry(top, bottom, height, sides, 1),
          material,
          parent,
          x,
          y,
          z,
        );

      const addCrescentFinial = (parent, x, y, z, scale = 1) => {
        const shape = new THREE.Shape();
        shape.moveTo(0.02, 0.02);
        shape.bezierCurveTo(-0.2, 0.32, -0.13, 0.72, 0.18, 0.94);
        shape.bezierCurveTo(0.35, 1.03, 0.5, 0.98, 0.62, 0.86);
        shape.bezierCurveTo(0.34, 0.94, 0.12, 0.72, 0.12, 0.49);
        shape.bezierCurveTo(0.12, 0.26, 0.27, 0.08, 0.47, 0.02);
        shape.bezierCurveTo(0.31, -0.04, 0.14, -0.02, 0.02, 0.02);
        shape.closePath();
        const finial = addMesh(
          new THREE.ExtrudeGeometry(shape, {
            depth: 0.035,
            bevelEnabled: true,
            bevelSegments: 2,
            bevelSize: 0.018,
            bevelThickness: 0.012,
          }),
          gold,
          parent,
          x,
          y,
          z,
        );
        finial.scale.setScalar(scale);
        return finial;
      };

      const addLathedDome = (parent, x, y, z, radius, height, material = domeMaterial) => {
        const points = [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(radius * 0.58, height * 0.035),
          new THREE.Vector2(radius * 0.83, height * 0.13),
          new THREE.Vector2(radius * 0.98, height * 0.29),
          new THREE.Vector2(radius, height * 0.4),
          new THREE.Vector2(radius * 0.94, height * 0.53),
          new THREE.Vector2(radius * 0.8, height * 0.67),
          new THREE.Vector2(radius * 0.59, height * 0.79),
          new THREE.Vector2(radius * 0.37, height * 0.9),
          new THREE.Vector2(radius * 0.2, height * 0.97),
          new THREE.Vector2(0, height),
        ];
        const outline = new THREE.SplineCurve(points).getPoints(56);
        return addMesh(new THREE.LatheGeometry(outline, 64), material, parent, x, y, z);
      };

      const addDomeRibs = (dome, radius, height) => {
        const profile = [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(radius * 0.58, height * 0.035),
          new THREE.Vector2(radius * 0.83, height * 0.13),
          new THREE.Vector2(radius * 0.98, height * 0.29),
          new THREE.Vector2(radius, height * 0.4),
          new THREE.Vector2(radius * 0.94, height * 0.53),
          new THREE.Vector2(radius * 0.8, height * 0.67),
          new THREE.Vector2(radius * 0.59, height * 0.79),
          new THREE.Vector2(radius * 0.37, height * 0.9),
          new THREE.Vector2(radius * 0.2, height * 0.97),
          new THREE.Vector2(0, height),
        ];
        const outline = new THREE.SplineCurve(profile);
        for (let rib = 0; rib < 8; rib += 1) {
          const angle = (rib / 8) * Math.PI * 2;
          const points = outline.getPoints(40).map(
            (point) =>
              new THREE.Vector3(
                (point.x + 0.012) * Math.cos(angle),
                point.y,
                (point.x + 0.012) * Math.sin(angle),
              ),
          );
          addMesh(
            new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, 0.006, 5, false),
            domeRibMaterial,
            dome,
            0,
            0,
            0,
          );
        }
      };

      const addArch = (parent, x, y, z, width, straightHeight, crownHeight, material) => {
        const shape = new THREE.Shape();
        shape.moveTo(-width / 2, 0);
        shape.lineTo(-width / 2, straightHeight);
        shape.bezierCurveTo(
          -width / 2,
          straightHeight + crownHeight * 0.66,
          width / 2,
          straightHeight + crownHeight * 0.66,
          width / 2,
          straightHeight,
        );
        shape.lineTo(width / 2, 0);
        shape.closePath();
        const mesh = addMesh(
          new THREE.ExtrudeGeometry(shape, {
            depth: 0.08,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.018,
            bevelThickness: 0.018,
          }),
          material,
          parent,
          x,
          y,
          z,
        );
        return mesh;
      };

      const addArchWindow = (parent, x, width, height, z, trimMaterial = gold) => {
        const y = 0.43;
        addArch(parent, x, y, z, width, height * 0.62, height * 0.38, trimMaterial);
        addArch(parent, x, y + 0.035, z + 0.095, width - 0.13, height * 0.61, height * 0.34, deepGreen);
        addBox(parent, width - 0.2, 0.035, 0.06, gold, x, y + 0.02, z + 0.14);
      };

      const plinth = addBox(mosque, 8.4, 0.25, 4.1, shadowStone, 0, 0.42, 0);
      addBox(mosque, 8.15, 2.65, 3.75, stone, 0, 1.82, 0);
      addBox(mosque, 8.4, 0.18, 3.95, gold, 0, 3.15, 0);
      addBox(mosque, 8.55, 0.12, 4.08, lightStone, 0, 3.29, 0);

      for (const x of [-3.22, -2.42, 2.42, 3.22]) {
        addBox(mosque, 0.1, 2.38, 0.12, lightStone, x, 1.8, 1.91);
        addBox(mosque, 0.14, 0.1, 0.16, gold, x, 3.04, 1.91);
      }

      for (const x of [-2.48, 2.48]) {
        addArch(mosque, x, 2.22, 1.97, 0.48, 0.32, 0.24, gold);
        addArch(mosque, x, 2.245, 2.065, 0.34, 0.29, 0.18, deepGreen);
        addBox(mosque, 0.54, 0.055, 0.11, gold, x, 2.2, 2.02);
      }

      for (const x of [-2.48, 2.48]) addArchWindow(mosque, x, 0.83, 1.48, 1.96);
      addArchWindow(mosque, 0, 1.72, 2.15, 1.97, gold);
      addArch(mosque, 0, 0.465, 2.075, 1.49, 1.25, 0.79, deepGreen);

      for (const x of [-0.92, 0.92]) {
        addCylinder(mosque, 0.075, 0.09, 2.34, lightStone, x, 1.68, 2.16, 20);
        addCylinder(mosque, 0.12, 0.12, 0.1, gold, x, 0.55, 2.16, 20);
        addCylinder(mosque, 0.13, 0.13, 0.09, gold, x, 2.87, 2.16, 20);
        addCylinder(mosque, 0.105, 0.105, 0.065, lightStone, x, 2.95, 2.16, 20);
      }

      for (const x of [-3.75, 3.75]) {
        addCylinder(mosque, 0.075, 0.09, 2.35, lightStone, x, 1.77, 2.02, 24);
        addCylinder(mosque, 0.15, 0.15, 0.12, gold, x, 2.99, 2.02, 24);
      }

      const domeDrumY = 3.58;
      addCylinder(mosque, 0.78, 0.9, 0.52, lightStone, 0, domeDrumY, -0.05, 16);
      addCylinder(mosque, 0.94, 0.94, 0.055, gold, 0, 3.84, -0.05);
      addCylinder(mosque, 1.04, 1.04, 0.055, gold, 0, 3.74, -0.05);
      for (const x of [-0.4, 0, 0.4]) {
        addArch(mosque, x, 3.4, 0.82, 0.24, 0.19, 0.12, gold);
        addArch(mosque, x, 3.425, 0.86, 0.17, 0.16, 0.1, deepGreen);
      }
      const mainDomeRadius = 1.28;
      const mainDomeHeight = 2.28;
      const mainDomeBase = 3.72;
      const mainDome = addLathedDome(
        mosque,
        0,
        mainDomeBase,
        -0.05,
        mainDomeRadius,
        mainDomeHeight,
      );
      const domeColors = [];
      const lowerDomeColor = new THREE.Color(0x627563);
      const middleDomeColor = new THREE.Color(0x91a184);
      const crownDomeColor = new THREE.Color(0xc2b183);
      const domeVertices = mainDome.geometry.attributes.position;
      for (let i = 0; i < domeVertices.count; i += 1) {
        const heightRatio = THREE.MathUtils.clamp(domeVertices.getY(i) / mainDomeHeight, 0, 1);
        const vertexColor = new THREE.Color();
        if (heightRatio < 0.58) {
          vertexColor.lerpColors(lowerDomeColor, middleDomeColor, heightRatio / 0.58);
        } else {
          vertexColor.lerpColors(middleDomeColor, crownDomeColor, (heightRatio - 0.58) / 0.42);
        }
        domeColors.push(vertexColor.r, vertexColor.g, vertexColor.b);
      }
      mainDome.geometry.setAttribute("color", new THREE.Float32BufferAttribute(domeColors, 3));
      mainDome.material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.48,
        metalness: 0.08,
        vertexColors: true,
      });
      addDomeRibs(mainDome, mainDomeRadius, mainDomeHeight);
      addCylinder(
        mainDome,
        0.16,
        0.2,
        0.14,
        shadowStone,
        0,
        mainDomeHeight + 0.03,
        0.07,
      );
      addCylinder(
        mainDome,
        0.045,
        0.055,
        0.24,
        gold,
        0,
        mainDomeHeight + 0.205,
        0.07,
        20,
      );
      addCrescentFinial(mainDome, 0, mainDomeHeight + 0.32, 0.07, 0.34);

      const addMinaret = (x, scale) => {
        const tower = new THREE.Group();
        tower.position.set(x, 0.38, 0.08);
        tower.scale.set(scale, scale * 1.12, scale);
        mosque.add(tower);

        addCylinder(tower, 0.48, 0.53, 0.28, shadowStone, 0, 0.15, 0);
        addCylinder(tower, 0.31, 0.42, 0.2, gold, 0, 0.39, 0);
        addCylinder(tower, 0.29, 0.34, 3.1, lightStone, 0, 2.04, 0);
        addCylinder(tower, 0.43, 0.43, 0.12, gold, 0, 1.2, 0);
        addCylinder(tower, 0.43, 0.43, 0.12, gold, 0, 2.58, 0);

        const balcony = addCylinder(tower, 0.54, 0.49, 0.12, shadowStone, 0, 3.12, 0);
        const balconyEdge = addMesh(
          new THREE.TorusGeometry(0.5, 0.045, 8, 56),
          gold,
          tower,
          0,
          3.18,
          0,
        );
        balconyEdge.rotation.x = Math.PI / 2;
        addCylinder(tower, 0.34, 0.42, 0.16, lightStone, 0, 3.28, 0);
        addLathedDome(tower, 0, 3.36, 0, 0.39, 0.8, domeMaterial);
        addCylinder(tower, 0.045, 0.055, 0.38, gold, 0, 4.2, 0, 16);
        addCylinder(tower, 0.025, 0.025, 0.28, gold, 0, 4.49, 0, 12);
        addCylinder(tower, 0.07, 0.07, 0.4, deepGreen, 0, 2.02, 0.29, 16);
        addCrescentFinial(tower, 0, 4.62, 0.02, 0.24);
        return { tower, balcony };
      };

      const leftMinaret = addMinaret(-4.55, 0.94);
      const rightMinaret = addMinaret(4.55, 0.94);

      for (const x of [-3.08, 3.08]) {
        addCylinder(mosque, 0.59, 0.62, 0.18, gold, x, 3.46, 0.05);
        addLathedDome(mosque, x, 3.55, 0.05, 0.62, 1.02, domeMaterial);
        addCylinder(mosque, 0.045, 0.055, 0.18, gold, x, 4.61, 0.05, 12);
      }

      const createStars = (count, size, opacity) => {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const phases = [];
        const drifts = [];
        for (let i = 0; i < count; i += 1) {
          positions.push((Math.random() - 0.5) * 15, 3.6 + Math.random() * 4.2, -3.5);
          const warm = Math.random() > 0.74;
          colors.push(warm ? 1 : 0.79, warm ? 0.84 : 0.9, warm ? 0.63 : 1);
          phases.push(Math.random() * Math.PI * 2);
          drifts.push(0.12 + Math.random() * 0.24, 0.07 + Math.random() * 0.12);
        }
        const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
        const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
        geometry.setAttribute("position", positionAttribute);
        geometry.setAttribute("color", colorAttribute);
        const material = new THREE.PointsMaterial({
          size,
          vertexColors: true,
          transparent: true,
          opacity,
          sizeAttenuation: true,
          depthWrite: false,
        });
        const points = new THREE.Points(geometry, material);
        scene.add(points);
        return { points, material, positions, colors, phases, drifts, positionAttribute, colorAttribute };
      };
      const starLayers = [
        createStars(150, 0.065, 0.78),
        createStars(38, 0.11, 0.92),
      ];

      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        const aspect = width / height;
        const viewHeight = Math.max(8.3, 9.7 / aspect);
        camera.top = viewHeight / 2;
        camera.bottom = -viewHeight / 2;
        camera.left = (-viewHeight * aspect) / 2;
        camera.right = (viewHeight * aspect) / 2;
        camera.updateProjectionMatrix();
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      resize();

      const clock = new THREE.Clock();
      const render = () => {
        const elapsed = clock.getElapsedTime();
        if (!reducedMotion) {
          mainDome.position.y = mainDomeBase + Math.sin(elapsed * 0.5) * 0.02;
          for (const layer of starLayers) {
            for (let i = 0; i < layer.phases.length; i += 1) {
              const phase = elapsed * (1.5 + (i % 5) * 0.35) + layer.phases[i];
              const pulse = 0.18 + (Math.sin(phase) + 1) * 0.41;
              const positionIndex = i * 3;
              layer.positionAttribute.array[positionIndex] =
                layer.positions[positionIndex] + Math.sin(phase * 0.35) * layer.drifts[i * 2];
              layer.positionAttribute.array[positionIndex + 1] =
                layer.positions[positionIndex + 1] +
                Math.cos(phase * 0.48) * layer.drifts[i * 2 + 1];
              layer.colorAttribute.array[positionIndex] = layer.colors[positionIndex] * pulse;
              layer.colorAttribute.array[positionIndex + 1] = layer.colors[positionIndex + 1] * pulse;
              layer.colorAttribute.array[positionIndex + 2] = layer.colors[positionIndex + 2] * pulse;
            }
            layer.positionAttribute.needsUpdate = true;
            layer.colorAttribute.needsUpdate = true;
          }
          starLayers[0].points.rotation.y = Math.sin(elapsed * 0.18) * 0.035;
          starLayers[1].points.rotation.y = -Math.sin(elapsed * 0.14) * 0.03;
          warmGlow.intensity = 17 + Math.sin(elapsed * 0.8) * 2;
          leftMinaret.tower.rotation.z = Math.sin(elapsed * 0.28) * 0.003;
          rightMinaret.tower.rotation.z = -Math.sin(elapsed * 0.28) * 0.003;
        }
        renderer.render(scene, camera);
        if (!reducedMotion) window.requestAnimationFrame(render);
      };

      render();
      heroArt?.classList.add("three-ready");
    })
    .catch((error) => {
      showMosqueFallback();
      console.error("Three.js could not be loaded. Run npm install before serving the page.", error);
    });
}
