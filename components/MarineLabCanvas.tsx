import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SceneViewMode, SpecimenId } from '../types';
import {
  createMicroscope,
  createTardigrade,
  createSeahorse,
  createJellyfish,
  createFish,
  createSpecimenJar,
  createTreasureChest,
  createOceanBirthdayCake,
  createLabPlatform,
  CakeCandle,
} from './3d/proceduralModels';
import { soundEngine } from '../utils/audio';

interface MarineLabCanvasProps {
  viewMode: SceneViewMode;
  activeSpecimen: SpecimenId;
  magnification: '100x' | '400x' | '1000x';
  onSelectSpecimen: (id: SpecimenId) => void;
  chestUnlocked: boolean;
  onToggleChest: () => void;
  candlesBlown: boolean;
  onToggleCandle: (candleId?: number) => void;
}

export const MarineLabCanvas: React.FC<MarineLabCanvasProps> = ({
  viewMode,
  activeSpecimen,
  magnification,
  onSelectSpecimen,
  chestUnlocked,
  onToggleChest,
  candlesBlown,
  onToggleCandle,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef({
    viewMode,
    activeSpecimen,
    magnification,
    onSelectSpecimen,
    chestUnlocked,
    onToggleChest,
    candlesBlown,
    onToggleCandle,
  });

  useEffect(() => {
    propsRef.current = {
      viewMode,
      activeSpecimen,
      magnification,
      onSelectSpecimen,
      chestUnlocked,
      onToggleChest,
      candlesBlown,
      onToggleCandle,
    };
  }, [viewMode, activeSpecimen, magnification, onSelectSpecimen, chestUnlocked, onToggleChest, candlesBlown, onToggleCandle]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isMobile = width < 768;
    // Touch devices get the mobile performance budget even in landscape, where
    // the viewport is wider than 768px but the GPU is still a phone GPU.
    const isHandheld =
      isMobile ||
      (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071120); // deep oceanic midnight
    scene.fog = new THREE.FogExp2(0x071120, 0.038);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, isMobile ? 6.8 : 5.2, isMobile ? 12 : 9.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    // Phones render far fewer pixels per frame when the pixel ratio is capped.
    // 1.25x still looks sharp on a high-DPI screen and costs far less than 2x.
    const maxPixelRatio = isSoftwareGl ? 1 : isHandheld ? 1.25 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = isHandheld ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    if (isHandheld && !isSoftwareGl) {
      // Animated shadows do not need refreshing on every frame on a phone.
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = true;
    }

    container.appendChild(renderer.domElement);

    // RoomEnvironment for studio reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 24;
    controls.target.set(0, 1.2, 0);

    // Studio & Oceanic Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = isHandheld ? 512 : 1024;
      keyLight.shadow.mapSize.height = isHandheld ? 512 : 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.3);
    fillLight.position.set(-5, 6, -3);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x030712, 1.0);
    scene.add(hemiLight);

    // Microscope stage spotlight for intense illumination on the magnified specimen
    const stageLight = new THREE.SpotLight(0x38bdf8, 3.5, 6, Math.PI / 4, 0.4);
    stageLight.position.set(0, 3.0, 0.3);
    stageLight.target.position.set(0, 1.68, 0.3);
    scene.add(stageLight);
    scene.add(stageLight.target);

    // Laboratory Platform Table
    const platform = createLabPlatform();
    scene.add(platform);

    // Central Microscope
    const microscope = createMicroscope();
    microscope.position.set(0, 0, 0);
    scene.add(microscope);

    // Active Stage Microbe Group (positioned on microscope slide: x: 0, y: 1.68, z: 0.3)
    const stageSpecimens: Record<SpecimenId, THREE.Group> = {
      tardigrade: createTardigrade(),
      seahorse: createSeahorse(),
      jellyfish: createJellyfish(),
      fish: createFish(),
    };

    const stageContainer = new THREE.Group();
    stageContainer.position.set(0, 1.68, 0.3);
    stageContainer.name = 'microscope_active_stage';

    Object.entries(stageSpecimens).forEach(([key, model]) => {
      model.name = `stage_model_${key}`;
      model.visible = false;
      stageContainer.add(model);
    });
    scene.add(stageContainer);

    // Table Specimen Jars
    const jarSpecimens: Record<SpecimenId, THREE.Group> = {
      tardigrade: createTardigrade(),
      seahorse: createSeahorse(),
      jellyfish: createJellyfish(),
      fish: createFish(),
    };

    const jarTardigrade = createSpecimenJar(jarSpecimens.tardigrade, 'tardigrade', 0xf59e0b);
    jarTardigrade.position.set(-1.8, 0, 1.8);
    scene.add(jarTardigrade);

    const jarSeahorse = createSpecimenJar(jarSpecimens.seahorse, 'seahorse', 0x06b6d4);
    jarSeahorse.position.set(-0.7, 0, 2.4);
    scene.add(jarSeahorse);

    const jarJellyfish = createSpecimenJar(jarSpecimens.jellyfish, 'jellyfish', 0xd946ef);
    jarJellyfish.position.set(0.7, 0, 2.4);
    scene.add(jarJellyfish);

    const jarFish = createSpecimenJar(jarSpecimens.fish, 'fish', 0x14b8a6);
    jarFish.position.set(1.8, 0, 1.8);
    scene.add(jarFish);

    const specimenJars: Record<SpecimenId, THREE.Group> = {
      tardigrade: jarTardigrade,
      seahorse: jarSeahorse,
      jellyfish: jarJellyfish,
      fish: jarFish,
    };

    // Treasure Chest
    const { group: chestGroup, lidPivot } = createTreasureChest();
    chestGroup.position.set(3.4, 0, 0.2);
    chestGroup.rotation.y = -0.45;
    scene.add(chestGroup);

    // Ocean Birthday Cake
    const { group: cakeGroup, candles: cakeCandles } = createOceanBirthdayCake();
    cakeGroup.position.set(-3.4, 0, 0.2);
    cakeGroup.rotation.y = 0.45;
    scene.add(cakeGroup);

    // Bubbles
    const bubbleCount = 60;
    const bubbleGeom = new THREE.SphereGeometry(0.08, 12, 12);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.9,
      transparent: true,
      opacity: 0.6,
      roughness: 0.05,
      ior: 1.15,
      clearcoat: 1.0,
      depthWrite: false,
    });
    const bubbleInstanced = new THREE.InstancedMesh(bubbleGeom, bubbleMat, bubbleCount);
    const bubbleData: { x: number; y: number; z: number; speed: number; wobble: number; scale: number }[] = [];
    const bDummy = new THREE.Object3D();

    for (let i = 0; i < bubbleCount; i++) {
      const data = {
        x: (Math.random() - 0.5) * 12,
        y: Math.random() * 8 - 0.5,
        z: (Math.random() - 0.5) * 12,
        speed: 0.008 + Math.random() * 0.014,
        wobble: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 1.1,
      };
      bubbleData.push(data);
      bDummy.position.set(data.x, data.y, data.z);
      bDummy.scale.setScalar(data.scale);
      bDummy.updateMatrix();
      bubbleInstanced.setMatrixAt(i, bDummy.matrix);
    }
    bubbleInstanced.instanceMatrix.needsUpdate = true;
    scene.add(bubbleInstanced);

    // Bioluminescent Dust Particles
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const pPalette = [
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xa78bfa),
      new THREE.Color(0xf472b6),
      new THREE.Color(0xfde047),
    ];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 1] = Math.random() * 7 - 0.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;

      const col = pPalette[Math.floor(Math.random() * pPalette.length)];
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(pGeom, pMat);
    scene.add(particleSystem);

    // `transmission` makes WebGLRenderer draw the whole scene a second time
    // into an offscreen buffer every frame to refract it, and that pass runs at
    // full resolution. Rendering it at a fraction of the resolution keeps the
    // exact same glass look (refraction is blurry anyway) for a large speed-up
    // on phone GPUs. Desktop keeps a higher quality scale.
    renderer.transmissionResolutionScale = isHandheld ? 0.25 : 0.6;

    // Raycaster for click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // A selection must be a real click/tap, not the end of an orbit drag.
    // We record where the press started and only raycast on release when the
    // pointer barely moved, so dragging over a jar/chest/cake just orbits.
    const CLICK_DRAG_THRESHOLD_PX = 6;

    let pendingPress: {
      pointerId: number;
      x: number;
      y: number;
      canSelect: boolean;
    } | null = null;

    const handlePointerDown = (event: PointerEvent) => {
      pendingPress = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        canSelect: event.isPrimary && (event.pointerType !== 'mouse' || event.button === 0),
      };
    };

    const handlePointerCancel = () => {
      pendingPress = null;
    };

    const handlePointerUp = (event: PointerEvent) => {
      const press = pendingPress;
      pendingPress = null;

      if (!press || !press.canSelect || press.pointerId !== event.pointerId) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      const dragDistance = Math.hypot(event.clientX - press.x, event.clientY - press.y);
      if (dragDistance > CLICK_DRAG_THRESHOLD_PX) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const clickables: { obj: THREE.Object3D; specimen?: SpecimenId; isChest?: boolean; isCake?: boolean; candleId?: number }[] = [];

      (Object.keys(specimenJars) as SpecimenId[]).forEach((id) => {
        clickables.push({ obj: specimenJars[id], specimen: id });
      });
      clickables.push({ obj: chestGroup, isChest: true });
      clickables.push({ obj: cakeGroup, isCake: true });

      cakeCandles.forEach((c) => {
        clickables.push({ obj: c.flameMesh, candleId: c.id });
      });

      for (const item of clickables) {
        const hits = raycaster.intersectObject(item.obj, true);
        if (hits.length > 0) {
          if (item.specimen) {
            soundEngine.playBubble();
            propsRef.current.onSelectSpecimen(item.specimen);
            return;
          }
          if (item.isChest) {
            propsRef.current.onToggleChest();
            return;
          }
          if (item.candleId !== undefined) {
            propsRef.current.onToggleCandle(item.candleId);
            return;
          }
          if (item.isCake) {
            propsRef.current.onToggleCandle();
            return;
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointercancel', handlePointerCancel);

    const targetCameraPos = new THREE.Vector3(0, 5.2, 9.2);
    const targetLookAt = new THREE.Vector3(0, 1.2, 0);

    let frameId = 0;
    let paused = false;
    let shadowFrame = 0;
    // Quality ladder: 0 = full, 1 = native resolution, 2 = reduced resolution.
    // It only steps down when the device genuinely cannot keep up.
    let qualityStage = 0;
    let qualityLocked = isSoftwareGl;
    let warmupFrames = 60;
    let sampledFrames = 0;
    let sampledMs = 0;
    let lastFrameAt = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    let chestAngle = 0;

    function tick() {
      if (paused) return;

      const now = performance.now();
      if (lastFrameAt > 0 && !qualityLocked) {
        const frameMs = now - lastFrameAt;
        if (warmupFrames > 0) {
          warmupFrames--;
        } else if (frameMs > 0 && frameMs < 250) {
          sampledMs += frameMs;
          sampledFrames++;
          if (sampledFrames >= 45) {
            const avg = sampledMs / sampledFrames;
            sampledFrames = 0;
            sampledMs = 0;
            if (qualityStage === 0 && avg > 40) {
              // Below ~25fps: render at native resolution and a coarser
              // refraction buffer. Layout and colours are unchanged.
              qualityStage = 1;
              renderer.setPixelRatio(1);
              renderer.setSize(container.clientWidth, container.clientHeight);
              renderer.transmissionResolutionScale = 0.2;
            } else if (qualityStage === 1 && avg > 52) {
              // Still very slow: let the GPU upscale a slightly smaller buffer.
              qualityStage = 2;
              renderer.setPixelRatio(0.75);
              renderer.setSize(container.clientWidth, container.clientHeight);
              renderer.transmissionResolutionScale = 0.15;
            } else {
              qualityLocked = true;
            }
          }
        }
      }
      lastFrameAt = now;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      const {
        viewMode: currentView,
        activeSpecimen: currSpec,
        magnification: mag,
        chestUnlocked: isChestOpen,
        candlesBlown: isBlown,
      } = propsRef.current;

      const currentWidth = container ? container.clientWidth : window.innerWidth;
      const isMobileView = currentWidth < 768;

      // Update camera targets & deep zoom behavior with proper mobile distancing
      switch (currentView) {
        case 'microscope': {
          // Calculate zoom distance based on selected magnification level
          let zoomDist = isMobileView ? 1.5 : 1.15;
          let yOffset = 1.95;
          if (mag === '100x') {
            zoomDist = isMobileView ? 1.85 : 1.45;
            yOffset = 2.02;
          } else if (mag === '400x') {
            zoomDist = isMobileView ? 1.45 : 1.15;
            yOffset = 1.95;
          } else if (mag === '1000x') {
            zoomDist = isMobileView ? 1.1 : 0.85;
            yOffset = 1.88;
          }

          targetCameraPos.set(0, yOffset, 0.3 + zoomDist);
          targetLookAt.set(0, 1.72, 0.3);
          break;
        }
        case 'specimens': {
          const jarObj = specimenJars[currSpec];
          if (jarObj) {
            targetCameraPos.set(
              jarObj.position.x * (isMobileView ? 1.1 : 1.25),
              isMobileView ? 2.5 : 2.2,
              jarObj.position.z + (isMobileView ? 4.2 : 2.6)
            );
            targetLookAt.set(jarObj.position.x, 1.3, jarObj.position.z);
          } else {
            targetCameraPos.set(0, 2.5, isMobileView ? 6.5 : 5.0);
            targetLookAt.set(0, 1.3, 1.8);
          }
          break;
        }
        case 'chest':
          // Camera framed on elevated treasures inside the chest
          targetCameraPos.set(
            3.4,
            isMobileView ? 2.5 : 2.15,
            isMobileView ? 5.2 : 3.8
          );
          targetLookAt.set(3.4, 1.15, 0.15);
          break;
        case 'cake':
          // Camera pulled back on cake so full two-tier cake, 4 candles, flames and confetti are completely visible
          targetCameraPos.set(
            -3.4,
            isMobileView ? 3.6 : 2.3,
            isMobileView ? 9.6 : 4.4
          );
          targetLookAt.set(-3.4, isMobileView ? 1.0 : 1.35, 0.2);
          break;
        case 'lab':
        default:
          // Expansive overview so nothing gets cut off horizontally on mobile portrait
          targetCameraPos.set(0, isMobileView ? 6.5 : 5.2, isMobileView ? 13.8 : 9.5);
          targetLookAt.set(0, 1.1, 0);
          break;
      }

      // Smooth camera interpolation
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCameraPos.x, 4.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCameraPos.y, 4.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraPos.z, 4.5, delta);

      controls.target.x = THREE.MathUtils.damp(controls.target.x, targetLookAt.x, 4.5, delta);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, targetLookAt.y, 4.5, delta);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, targetLookAt.z, 4.5, delta);
      controls.update();

      // Show and animate active stage specimen on the microscope slide
      const isMicroscope = currentView === 'microscope';
      stageContainer.visible = isMicroscope;

      if (isMicroscope) {
        // Magnification scale multiplier (comfortably scaled so it fits elegantly on slide & reticle)
        let baseScale = 0.3;
        if (mag === '100x') baseScale = 0.22;
        if (mag === '400x') baseScale = 0.32;
        if (mag === '1000x') baseScale = 0.45;

        (Object.keys(stageSpecimens) as SpecimenId[]).forEach((id) => {
          const model = stageSpecimens[id];
          const isActive = id === currSpec;
          model.visible = isActive;
          if (isActive) {
            model.scale.setScalar(baseScale);
            // Slowly rotate the magnified microbe for full 3D inspection
            model.rotation.y = elapsed * 0.45;
            model.position.y = Math.sin(elapsed * 2) * 0.03;
          }
        });
      }

      // Animate Chest Lid & Future Submersible
      const targetChestAngle = isChestOpen ? -1.85 : 0;
      chestAngle = THREE.MathUtils.damp(chestAngle, targetChestAngle, 5, delta);
      lidPivot.rotation.x = chestAngle;

      const sub = chestGroup.getObjectByName('future_submersible');
      if (sub && isChestOpen) {
        sub.position.y = 0.45 + Math.sin(elapsed * 2.2) * 0.025;
        sub.rotation.y = -0.32 + Math.sin(elapsed * 1.2) * 0.06;
      }

      // Animate Cake Candles
      cakeCandles.forEach((candle) => {
        const lit = !isBlown;
        candle.isLit = lit;
        candle.flameMesh.visible = lit;
        candle.flameLight.intensity = lit ? 0.8 + Math.sin(elapsed * 12 + candle.id) * 0.2 : 0;
        if (lit) {
          candle.flameMesh.scale.y = 1 + Math.sin(elapsed * 15 + candle.id) * 0.18;
        }
      });

      // Animate Organisms in specimen jars
      // 1. Tardigrade crawling gracefully over moss bed in its bio-habitat
      const tardigrade = jarSpecimens.tardigrade;
      tardigrade.position.y = 1.22 + Math.sin(elapsed * 2) * 0.025;
      tardigrade.rotation.y = elapsed * 0.35;
      for (let i = 0; i < 4; i++) {
        const legL = tardigrade.getObjectByName(`leg_${i}_l`);
        const legR = tardigrade.getObjectByName(`leg_${i}_r`);
        if (i < 3) {
          if (legL) legL.rotation.x = Math.sin(elapsed * 4 + i) * 0.28;
          if (legR) legR.rotation.x = -Math.sin(elapsed * 4 + i) * 0.28;
        } else {
          if (legL) legL.rotation.x = -Math.PI / 2.6 + Math.sin(elapsed * 4) * 0.14;
          if (legR) legR.rotation.x = -Math.PI / 2.6 - Math.sin(elapsed * 4) * 0.14;
        }
      }

      // 2. Seahorse gentle bobbing & dorsal fin flutter
      const seahorse = jarSpecimens.seahorse;
      seahorse.position.y = 1.32 + Math.sin(elapsed * 1.8) * 0.05;
      seahorse.rotation.y = elapsed * 0.22;
      seahorse.rotation.x = Math.sin(elapsed * 1.2) * 0.06;
      const seahorseDorsal = seahorse.getObjectByName('seahorse_dorsal');
      if (seahorseDorsal) {
        seahorseDorsal.rotation.y = -Math.PI / 2 + Math.sin(elapsed * 16) * 0.25;
      }

      // 3. Jellyfish swimming contraction wave
      const jelly = jarSpecimens.jellyfish;
      const pulse = Math.sin(elapsed * 2.6);
      const contraction = pulse > 0 ? pulse * 0.32 : pulse * 0.1;
      jelly.scale.set(0.72 - contraction * 0.18, 0.72 + contraction * 0.3, 0.72 - contraction * 0.18);
      jelly.position.y = 1.35 + Math.sin(elapsed * 1.8) * 0.14;
      jelly.rotation.y = elapsed * 0.2;

      // 4. Fish
      const fish = jarSpecimens.fish;
      fish.position.y = 1.3 + Math.sin(elapsed * 2.5) * 0.06;
      fish.rotation.y = Math.sin(elapsed * 2) * 0.3;
      const tail = fish.getObjectByName('fish_tail');
      if (tail) {
        tail.rotation.y = Math.sin(elapsed * 9) * 0.45;
      }

      // Bubbles
      for (let i = 0; i < bubbleCount; i++) {
        const b = bubbleData[i];
        b.y += b.speed;
        b.wobble += 0.03;
        if (b.y > 7.5) {
          b.y = -0.5;
        }
        bDummy.position.set(b.x + Math.sin(b.wobble) * 0.1, b.y, b.z + Math.cos(b.wobble) * 0.1);
        bDummy.scale.setScalar(b.scale);
        bDummy.updateMatrix();
        bubbleInstanced.setMatrixAt(i, bDummy.matrix);
      }
      bubbleInstanced.instanceMatrix.needsUpdate = true;

      particleSystem.rotation.y = elapsed * 0.025;

      // Shadows are refreshed a few times per second instead of every frame.
      if (isHandheld && !isSoftwareGl) {
        shadowFrame++;
        if (shadowFrame % 6 === 0) renderer.shadowMap.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Stop rendering while the tab/app is in the background and resume cleanly.
    const handleVisibility = () => {
      if (document.hidden) {
        paused = true;
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
      } else if (paused) {
        paused = false;
        lastFrameAt = 0;
        clock.getDelta();
        if (isSoftwareGl) {
          afterDraw(tick);
        } else {
          frameId = requestAnimationFrame(tick);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointercancel', handlePointerCancel);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    />
  );
};
