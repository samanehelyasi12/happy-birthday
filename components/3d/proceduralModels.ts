import * as THREE from 'three';
import { SpecimenId } from '../../types';

// Helper to create procedural normal/bump canvas texture for brushed brass & metals
export function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle circular brushed lines
  ctx.strokeStyle = '#909090';
  ctx.lineWidth = 1;
  for (let i = 0; i < 200; i++) {
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// -------------------------------------------------------------
// 1. PROCEDURAL MICROSCOPE (8-12 composite parts)
// -------------------------------------------------------------
export function createMicroscope(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'microscope';

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.85,
    roughness: 0.25,
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.35,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.95,
    roughness: 0.1,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.9,
    opacity: 0.9,
    transparent: true,
    roughness: 0.05,
    ior: 1.5,
  });

  // 1. Heavy Base
  const baseGeom = new THREE.CylinderGeometry(1.4, 1.6, 0.3, 32);
  const base = new THREE.Mesh(baseGeom, brassMat);
  base.position.y = 0.15;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const baseRingGeom = new THREE.TorusGeometry(1.3, 0.08, 16, 32);
  const baseRing = new THREE.Mesh(baseRingGeom, chromeMat);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.3;
  group.add(baseRing);

  // 2. Condenser & Substage Illuminator
  const condenserGeom = new THREE.CylinderGeometry(0.5, 0.65, 0.4, 24);
  const condenser = new THREE.Mesh(condenserGeom, brassMat);
  condenser.position.set(0, 0.5, 0.3);
  group.add(condenser);

  const lightLensGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 24);
  const lightLensMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
  const lightLens = new THREE.Mesh(lightLensGeom, lightLensMat);
  lightLens.position.set(0, 0.71, 0.3);
  group.add(lightLens);

  // 3. Curved Mechanical Arm
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.3, -0.6),
    new THREE.Vector3(0, 1.4, -0.9),
    new THREE.Vector3(0, 2.6, -0.8),
    new THREE.Vector3(0, 3.2, -0.1),
    new THREE.Vector3(0, 3.1, 0.3),
  ]);
  const armGeom = new THREE.TubeGeometry(curve, 32, 0.22, 16, false);
  const arm = new THREE.Mesh(armGeom, darkMetalMat);
  arm.castShadow = true;
  group.add(arm);

  // 4. Coarse and Fine Adjustment Knobs
  const knobGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 24);
  const knobL = new THREE.Mesh(knobGeom, brassMat);
  knobL.rotation.z = Math.PI / 2;
  knobL.position.set(0.4, 1.8, -0.8);
  group.add(knobL);

  const knobR = knobL.clone();
  knobR.position.x = -0.4;
  group.add(knobR);

  // 5. Specimen Mechanical Stage
  const stageGeom = new THREE.BoxGeometry(1.6, 0.12, 1.4);
  const stage = new THREE.Mesh(stageGeom, darkMetalMat);
  stage.position.set(0, 1.5, 0.3);
  stage.castShadow = true;
  group.add(stage);

  // Stage aperture hole
  const apertureGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.14, 24);
  const aperture = new THREE.Mesh(apertureGeom, chromeMat);
  aperture.position.set(0, 1.5, 0.3);
  group.add(aperture);

  // Glass microscope slide on stage
  const slideGeom = new THREE.BoxGeometry(1.1, 0.03, 0.45);
  const slide = new THREE.Mesh(slideGeom, glassMat);
  slide.position.set(0, 1.58, 0.3);
  group.add(slide);

  // Slide cover slip
  const coverSlipGeom = new THREE.BoxGeometry(0.35, 0.02, 0.35);
  const coverSlipMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.95,
    transparent: true,
    opacity: 0.8,
  });
  const coverSlip = new THREE.Mesh(coverSlipGeom, coverSlipMat);
  coverSlip.position.set(0, 1.6, 0.3);
  group.add(coverSlip);

  // 6. Revolving Nosepiece (Turret)
  const turretGeom = new THREE.CylinderGeometry(0.45, 0.45, 0.2, 24);
  const turret = new THREE.Mesh(turretGeom, brassMat);
  turret.position.set(0, 2.5, 0.3);
  group.add(turret);

  // 3 Objectives
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI) / 3;
    const objHolder = new THREE.Group();
    objHolder.position.set(0, 2.45, 0.3);
    objHolder.rotation.y = angle;

    const barrelGeom = new THREE.CylinderGeometry(0.09, 0.12, 0.45, 16);
    const barrel = new THREE.Mesh(barrelGeom, chromeMat);
    barrel.position.set(0.22, -0.22, 0);
    barrel.rotation.z = -0.3;

    const ringGeom = new THREE.CylinderGeometry(0.125, 0.125, 0.08, 16);
    const ringColors = [0xef4444, 0x3b82f6, 0x10b981];
    const ringMat = new THREE.MeshBasicMaterial({ color: ringColors[i] });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(0.22, -0.15, 0);
    ring.rotation.z = -0.3;

    objHolder.add(barrel);
    objHolder.add(ring);
    group.add(objHolder);
  }

  // 7. Optical Eyepiece Tube
  const tubeGeom = new THREE.CylinderGeometry(0.2, 0.24, 1.2, 24);
  const tube = new THREE.Mesh(tubeGeom, brassMat);
  tube.position.set(0, 3.4, -0.05);
  tube.rotation.x = -0.45;
  group.add(tube);

  // Eyepiece lens rim
  const eyepieceGeom = new THREE.CylinderGeometry(0.26, 0.22, 0.25, 24);
  const eyepiece = new THREE.Mesh(eyepieceGeom, darkMetalMat);
  eyepiece.position.set(0, 3.9, -0.3);
  eyepiece.rotation.x = -0.45;
  group.add(eyepiece);

  // Luminous blue condenser beam cone
  const beamGeom = new THREE.ConeGeometry(0.26, 0.78, 24, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(beamGeom, beamMat);
  beam.position.set(0, 1.1, 0.3);
  group.add(beam);

  return group;
}

// -------------------------------------------------------------
// 2. PROCEDURAL ORGANIC TARDIGRADE (WATER BEAR)
// -------------------------------------------------------------
// -------------------------------------------------------------
// 2. PROCEDURAL ORGANIC TARDIGRADE (WATER BEAR)
// -------------------------------------------------------------
export function createTardigrade(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'specimen_tardigrade';

  // Soft translucent amber-honey cuticle with pearlescent bioluminescence
  const cuticleMat = new THREE.MeshPhysicalMaterial({
    color: 0xfbbf24, // warm golden amber
    roughness: 0.22,
    transmission: 0.42,
    transparent: true,
    opacity: 0.95,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
    ior: 1.36,
  });

  const foldMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // warm caramel crease
    roughness: 0.32,
    metalness: 0.1,
  });

  const clawMat = new THREE.MeshStandardMaterial({
    color: 0x78350f, // dark chitin claws
    roughness: 0.2,
    metalness: 0.4,
  });

  const eyeMat = new THREE.MeshBasicMaterial({
    color: 0x0f172a, // dark pigment eye spot
  });

  const innerGutMat = new THREE.MeshStandardMaterial({
    color: 0xb45309, // amber internal digestive tract
    roughness: 0.35,
    transparent: true,
    opacity: 0.6,
  });

  const lipidDropMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a, // glowing nutrient lipid droplets
  });

  // Body container with gentle natural swimming arch
  const bodyGroup = new THREE.Group();
  bodyGroup.rotation.x = -0.1;
  group.add(bodyGroup);

  // 1. Unified Pudgy Torso (4 distinct segmented volumes)
  const torsoGeom = new THREE.CapsuleGeometry(0.22, 0.52, 16, 24);
  torsoGeom.scale(1.1, 0.95, 1.0);
  const torso = new THREE.Mesh(torsoGeom, cuticleMat);
  torso.rotation.x = Math.PI / 2;
  torso.position.set(0, 0, 0);
  bodyGroup.add(torso);

  // 4 Soft transverse cuticle roll creases that give the iconic pudgy water bear folds
  const foldZPositions = [0.25, 0.08, -0.09, -0.27];
  const foldRadii = [0.24, 0.26, 0.25, 0.22];
  foldZPositions.forEach((z, idx) => {
    const foldGeom = new THREE.TorusGeometry(foldRadii[idx], 0.02, 10, 32);
    const foldMesh = new THREE.Mesh(foldGeom, foldMat);
    foldMesh.rotation.x = Math.PI / 2;
    foldMesh.position.set(0, 0, z);
    bodyGroup.add(foldMesh);
  });

  // 2. Rounded Teddy-Bear Micro Head
  const headGeom = new THREE.SphereGeometry(0.21, 20, 20);
  headGeom.scale(1.05, 0.9, 1.0);
  const head = new THREE.Mesh(headGeom, cuticleMat);
  head.position.set(0, 0.02, 0.4);
  bodyGroup.add(head);

  // Soft Chubby Cheeks
  [-1, 1].forEach((side) => {
    const cheekGeom = new THREE.SphereGeometry(0.08, 12, 12);
    const cheek = new THREE.Mesh(cheekGeom, cuticleMat);
    cheek.position.set(side * 0.14, -0.03, 0.43);
    bodyGroup.add(cheek);
  });

  // Short Snout Cone (Buccal tube & mouth cone)
  const snoutGeom = new THREE.CylinderGeometry(0.055, 0.075, 0.12, 16);
  const snout = new THREE.Mesh(snoutGeom, cuticleMat);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.03, 0.58);
  bodyGroup.add(snout);

  // Circular Sucking Mouth Ring
  const mouthRingGeom = new THREE.TorusGeometry(0.055, 0.015, 10, 16);
  const mouthRing = new THREE.Mesh(mouthRingGeom, clawMat);
  mouthRing.position.set(0, -0.03, 0.64);
  bodyGroup.add(mouthRing);

  // 6 Tiny sensory lobes around mouth
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI) / 3;
    const lobeGeom = new THREE.SphereGeometry(0.015, 8, 8);
    const lobe = new THREE.Mesh(lobeGeom, foldMat);
    lobe.position.set(Math.cos(ang) * 0.065, -0.03 + Math.sin(ang) * 0.065, 0.63);
    bodyGroup.add(lobe);
  }

  // Cute Little Black Eye Spots
  [-1, 1].forEach((side) => {
    const eyeGeom = new THREE.SphereGeometry(0.02, 10, 10);
    const eye = new THREE.Mesh(eyeGeom, eyeMat);
    eye.position.set(side * 0.14, 0.07, 0.46);
    bodyGroup.add(eye);
  });

  // Internal Digestive Tract (visible inside translucent amber body)
  const gutGeom = new THREE.CapsuleGeometry(0.085, 0.35, 8, 12);
  const gut = new THREE.Mesh(gutGeom, innerGutMat);
  gut.rotation.x = Math.PI / 2;
  gut.position.set(0, -0.02, 0.02);
  bodyGroup.add(gut);

  // Bioluminescent lipid granules inside body
  for (let i = 0; i < 7; i++) {
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), lipidDropMat);
    drop.position.set(
      (Math.random() - 0.5) * 0.12,
      (Math.random() - 0.5) * 0.08,
      (Math.random() - 0.5) * 0.35
    );
    bodyGroup.add(drop);
  }

  // 3. 8 Chubby Little Paws with Claws (4 pairs)
  // Pairs 0, 1, 2 point ventrolaterally (side/down)
  // Pair 3 (terminal legs) points backwards
  const legZCoords = [0.28, 0.08, -0.11, -0.36];

  legZCoords.forEach((z, pairIdx) => {
    [-1, 1].forEach((side) => {
      const legGroup = new THREE.Group();
      legGroup.name = `leg_${pairIdx}_${side > 0 ? 'r' : 'l'}`;

      if (pairIdx < 3) {
        legGroup.position.set(side * 0.2, -0.13, z);

        // Chubby leg paw
        const pawGeom = new THREE.CapsuleGeometry(0.065, 0.11, 8, 10);
        const paw = new THREE.Mesh(pawGeom, cuticleMat);
        paw.rotation.z = side * 0.55;
        paw.rotation.x = 0.12;
        legGroup.add(paw);

        // 4 Little curved claws
        for (let c = -1.5; c <= 1.5; c += 1) {
          const clawGeom = new THREE.ConeGeometry(0.015, 0.055, 6);
          const claw = new THREE.Mesh(clawGeom, clawMat);
          claw.position.set(side * 0.07 + c * 0.018, -0.1, c * 0.014);
          claw.rotation.z = side * 0.35;
          claw.rotation.x = 0.18;
          legGroup.add(claw);
        }
      } else {
        // Terminal legs pointing backwards
        legGroup.position.set(side * 0.12, -0.07, z);

        const pawGeom = new THREE.CapsuleGeometry(0.062, 0.12, 8, 10);
        const paw = new THREE.Mesh(pawGeom, cuticleMat);
        paw.rotation.x = -Math.PI / 2.6;
        paw.rotation.z = side * 0.22;
        legGroup.add(paw);

        // Claws pointing backward
        for (let c = -1.5; c <= 1.5; c += 1) {
          const clawGeom = new THREE.ConeGeometry(0.015, 0.055, 6);
          const claw = new THREE.Mesh(clawGeom, clawMat);
          claw.position.set(side * 0.032 + c * 0.018, -0.06, -0.12);
          claw.rotation.x = -Math.PI / 2.4;
          legGroup.add(claw);
        }
      }

      bodyGroup.add(legGroup);
    });
  });

  // Perfectly scaled so it floats comfortably inside the jar with ample room
  group.scale.setScalar(0.35);
  return group;
}

// -------------------------------------------------------------
// 3. PROCEDURAL SEAHORSE (HIPPOCAMPUS) - REPLACES DIATOM
// -------------------------------------------------------------
export function createSeahorse(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'specimen_seahorse';

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4, // glowing cyan-emerald
    emissive: 0x0891b2,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.2,
    clearcoat: 0.6,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.85,
    roughness: 0.2,
  });

  const finMat = new THREE.MeshPhysicalMaterial({
    color: 0x67e8f9,
    transmission: 0.6,
    transparent: true,
    opacity: 0.8,
    roughness: 0.15,
  });

  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 });

  // 1. Arched Neck & Torso Spine
  const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.9, 0.1),    // crown base
    new THREE.Vector3(0, 0.7, 0.22),   // head/neck arch forward
    new THREE.Vector3(0, 0.35, 0.05),  // throat curves back
    new THREE.Vector3(0, 0.0, 0.18),   // chest belly expands
    new THREE.Vector3(0, -0.4, 0.12),  // abdomen
    new THREE.Vector3(0, -0.75, -0.05), // lower body
    new THREE.Vector3(0, -1.05, -0.2), // tail base
    new THREE.Vector3(0, -1.25, -0.05), // tail curls up
    new THREE.Vector3(0, -1.15, 0.1),  // tail spiral tip
  ]);

  const spineGeom = new THREE.TubeGeometry(spineCurve, 32, 0.18, 16, false);
  const spine = new THREE.Mesh(spineGeom, bodyMat);
  group.add(spine);

  // 2. Head & Snout
  const headGeom = new THREE.SphereGeometry(0.24, 16, 16);
  headGeom.scale(0.8, 1.1, 1.3);
  const head = new THREE.Mesh(headGeom, bodyMat);
  head.position.set(0, 0.8, 0.32);
  head.rotation.x = 0.35;
  group.add(head);

  // Tubular Snout
  const snoutGeom = new THREE.CylinderGeometry(0.06, 0.1, 0.45, 16);
  const snout = new THREE.Mesh(snoutGeom, bodyMat);
  snout.position.set(0, 0.72, 0.68);
  snout.rotation.x = Math.PI / 2 + 0.3;
  group.add(snout);

  // Snout Mouth Ring
  const mouthRingGeom = new THREE.TorusGeometry(0.065, 0.02, 10, 16);
  const mouthRing = new THREE.Mesh(mouthRingGeom, goldAccentMat);
  mouthRing.position.set(0, 0.66, 0.88);
  mouthRing.rotation.x = Math.PI / 2 + 0.3;
  group.add(mouthRing);

  // 3. Royal Coronet Crown on top of head
  const coronetGroup = new THREE.Group();
  coronetGroup.position.set(0, 1.05, 0.28);
  for (let i = -2; i <= 2; i++) {
    const spikeGeom = new THREE.ConeGeometry(0.035, 0.16 - Math.abs(i) * 0.025, 8);
    const spike = new THREE.Mesh(spikeGeom, goldAccentMat);
    spike.position.set(i * 0.05, 0, -Math.abs(i) * 0.03);
    spike.rotation.x = -0.2;
    coronetGroup.add(spike);
  }
  group.add(coronetGroup);

  // 4. Expressive Eyes
  [-1, 1].forEach((side) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyeWhiteMat);
    eyeWhite.position.set(side * 0.18, 0.82, 0.35);
    group.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), pupilMat);
    pupil.position.set(side * 0.21, 0.82, 0.38);
    group.add(pupil);

    const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 16), goldAccentMat);
    eyeRing.position.set(side * 0.18, 0.82, 0.35);
    eyeRing.rotation.y = side * Math.PI / 2;
    group.add(eyeRing);
  });

  // 5. Segmented Bony Plates on Belly & Back (Torus Armor Rings)
  const armorY = [0.25, 0.1, -0.05, -0.2, -0.35, -0.5, -0.65];
  const armorScales = [1.1, 1.25, 1.3, 1.2, 1.05, 0.9, 0.75];
  armorY.forEach((y, idx) => {
    const ringGeom = new THREE.TorusGeometry(0.19 * armorScales[idx], 0.035, 10, 24);
    const ring = new THREE.Mesh(ringGeom, goldAccentMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, y, 0.1);
    group.add(ring);
  });

  // 6. Fluttering Dorsal Fin on Back
  const dorsalGroup = new THREE.Group();
  dorsalGroup.name = 'seahorse_dorsal';
  dorsalGroup.position.set(0, 0.05, -0.15);

  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.quadraticCurveTo(0, 0.35, 0.3, 0.4);
  finShape.lineTo(0.5, 0.2);
  finShape.lineTo(0.4, -0.2);
  finShape.closePath();

  const dorsalGeom = new THREE.ShapeGeometry(finShape);
  const dorsal = new THREE.Mesh(dorsalGeom, finMat);
  dorsal.rotation.y = -Math.PI / 2;
  dorsalGroup.add(dorsal);
  group.add(dorsalGroup);

  group.scale.setScalar(0.85);
  return group;
}

// -------------------------------------------------------------
// 4. PROCEDURAL BIOLUMINESCENT JELLYFISH (ORGANIC & ETHEREAL)
// -------------------------------------------------------------
export function createJellyfish(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'specimen_jellyfish';

  // Luminous translucent materials
  const bellMat = new THREE.MeshPhysicalMaterial({
    color: 0xc084fc, // dreamy soft lilac-magenta
    emissive: 0x9333ea,
    emissiveIntensity: 0.45,
    roughness: 0.15,
    transmission: 0.45,
    transparent: true,
    opacity: 0.88,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
  });

  const organMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e, // vibrant rose
    emissive: 0xff007f,
    emissiveIntensity: 1.1,
    roughness: 0.2,
  });

  const rimGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.9,
    roughness: 0.1,
  });

  const tentacleMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.8,
  });

  const tipMat = new THREE.MeshBasicMaterial({
    color: 0xf0abfc,
  });

  // 1. Genuine Smooth Double-Surface Bell Umbrella (LatheGeometry)
  // Perfectly upright dome (convex apex pointing UP)
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0.001, 0.62));
  points.push(new THREE.Vector2(0.24, 0.58));
  points.push(new THREE.Vector2(0.52, 0.46));
  points.push(new THREE.Vector2(0.72, 0.28));
  points.push(new THREE.Vector2(0.84, 0.06));
  points.push(new THREE.Vector2(0.82, -0.12));
  // Inward curled rim
  points.push(new THREE.Vector2(0.76, -0.18));
  points.push(new THREE.Vector2(0.68, -0.12));
  // Inner subumbrella curve
  points.push(new THREE.Vector2(0.62, 0.05));
  points.push(new THREE.Vector2(0.42, 0.26));
  points.push(new THREE.Vector2(0.18, 0.42));
  points.push(new THREE.Vector2(0.001, 0.46));

  const bellGeom = new THREE.LatheGeometry(points, 48);
  const bell = new THREE.Mesh(bellGeom, bellMat);
  group.add(bell);

  // Luminous Rim Ring at the margin
  const rimGeom = new THREE.TorusGeometry(0.78, 0.035, 12, 48);
  const rim = new THREE.Mesh(rimGeom, rimGlowMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.16;
  group.add(rim);

  // 2. Four Horseshoe/Clover Gastric Organs under apex
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const gonadGeom = new THREE.TorusGeometry(0.16, 0.04, 10, 24, Math.PI * 1.35);
    const gonad = new THREE.Mesh(gonadGeom, organMat);
    gonad.rotation.x = Math.PI / 2;
    gonad.rotation.z = angle + 0.3;
    gonad.position.set(Math.cos(angle) * 0.32, 0.36, Math.sin(angle) * 0.32);
    group.add(gonad);
  }

  // 3. Central Ruffled Oral Arms (Graceful spiral ribbons)
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const armCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 0.08, 0.3, Math.sin(angle) * 0.08),
      new THREE.Vector3(Math.cos(angle) * 0.18, -0.1, Math.sin(angle) * 0.18),
      new THREE.Vector3(Math.cos(angle + 0.4) * 0.15, -0.45, Math.sin(angle + 0.4) * 0.15),
      new THREE.Vector3(Math.cos(angle - 0.2) * 0.12, -0.85, Math.sin(angle - 0.2) * 0.12),
      new THREE.Vector3(0, -1.2, 0),
    ]);
    const armGeom = new THREE.TubeGeometry(armCurve, 20, 0.035, 8, false);
    const armMesh = new THREE.Mesh(armGeom, bellMat);
    group.add(armMesh);
  }

  // 4. 16 Smooth, Graceful Hanging Marginal Tentacles with Glowing Tips
  const tentacleGroup = new THREE.Group();
  tentacleGroup.name = 'jelly_tentacles';
  for (let i = 0; i < 16; i++) {
    const angle = (i * 2 * Math.PI) / 16;
    const tLength = 1.0 + (i % 3) * 0.18;
    const tCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 0.76, -0.16, Math.sin(angle) * 0.76),
      new THREE.Vector3(Math.cos(angle) * 0.73, -0.45, Math.sin(angle) * 0.73),
      new THREE.Vector3(Math.cos(angle + 0.1) * 0.68, -0.8, Math.sin(angle + 0.1) * 0.68),
      new THREE.Vector3(Math.cos(angle) * 0.62, -0.16 - tLength, Math.sin(angle) * 0.62),
    ]);
    const tGeom = new THREE.TubeGeometry(tCurve, 16, 0.016, 6, false);
    const tentacle = new THREE.Mesh(tGeom, tentacleMat);
    tentacleGroup.add(tentacle);

    // Glowing pearl drop tip
    const tipGeom = new THREE.SphereGeometry(0.035, 8, 8);
    const tip = new THREE.Mesh(tipGeom, tipMat);
    tip.position.set(Math.cos(angle) * 0.62, -0.16 - tLength, Math.sin(angle) * 0.62);
    tentacleGroup.add(tip);
  }
  group.add(tentacleGroup);

  // Soft internal bioluminescent light
  const jellyLight = new THREE.PointLight(0xe879f9, 0.9, 3);
  jellyLight.position.set(0, 0.25, 0);
  group.add(jellyLight);

  group.scale.setScalar(0.7);
  return group;
}

// -------------------------------------------------------------
// 5. PROCEDURAL SMALL FISH (IRIDESCENT NANO-GOBY)
// -------------------------------------------------------------
export function createFish(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'specimen_fish';

  const fishMat = new THREE.MeshPhysicalMaterial({
    color: 0x14b8a6,
    roughness: 0.2,
    metalness: 0.4,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  });

  const finMat = new THREE.MeshPhysicalMaterial({
    color: 0x5eead4,
    transmission: 0.75,
    transparent: true,
    opacity: 0.7,
    roughness: 0.15,
  });

  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 });

  // Streamlined Fish Body
  const bodyGeom = new THREE.SphereGeometry(0.48, 24, 20);
  bodyGeom.scale(0.5, 0.75, 1.8);
  const body = new THREE.Mesh(bodyGeom, fishMat);
  group.add(body);

  // Eyes (Left & Right)
  [-1, 1].forEach((side) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), eyeWhiteMat);
    eyeWhite.position.set(side * 0.22, 0.1, 0.6);
    group.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), pupilMat);
    pupil.position.set(side * 0.27, 0.1, 0.62);
    group.add(pupil);
  });

  // Dorsal fin (top)
  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(0, 0);
  dorsalShape.quadraticCurveTo(0, 0.3, 0.4, 0.4);
  dorsalShape.lineTo(0.7, 0);
  dorsalShape.closePath();
  const dorsalGeom = new THREE.ShapeGeometry(dorsalShape);
  const dorsal = new THREE.Mesh(dorsalGeom, finMat);
  dorsal.rotation.y = Math.PI / 2;
  dorsal.position.set(0, 0.35, -0.3);
  group.add(dorsal);

  // Pectoral fins (left & right)
  [-1, 1].forEach((side) => {
    const pecGeom = new THREE.ConeGeometry(0.12, 0.4, 12);
    pecGeom.scale(0.2, 1, 1);
    const pec = new THREE.Mesh(pecGeom, finMat);
    pec.position.set(side * 0.25, -0.1, 0.15);
    pec.rotation.z = side * 0.8;
    pec.rotation.y = side * 0.4;
    group.add(pec);
  });

  // Tail Fin (Caudal) - placed in a sub-group for swimming animation
  const tailGroup = new THREE.Group();
  tailGroup.name = 'fish_tail';
  tailGroup.position.set(0, 0, -0.85);

  const caudalShape = new THREE.Shape();
  caudalShape.moveTo(0, 0);
  caudalShape.lineTo(0, 0.35);
  caudalShape.lineTo(0.5, 0.55);
  caudalShape.lineTo(0.35, 0);
  caudalShape.lineTo(0.5, -0.55);
  caudalShape.lineTo(0, -0.35);
  caudalShape.closePath();

  const caudalGeom = new THREE.ShapeGeometry(caudalShape);
  const caudal = new THREE.Mesh(caudalGeom, finMat);
  caudal.rotation.y = -Math.PI / 2;
  tailGroup.add(caudal);
  group.add(tailGroup);

  group.scale.setScalar(0.75);
  return group;
}

// -------------------------------------------------------------
// 6. SPECIMEN CONTAINER (GLASS CYLINDRICAL JAR + BRASS BASE)
// -------------------------------------------------------------
// -------------------------------------------------------------
// 6. SPECIMEN CONTAINER (GLASS CYLINDRICAL JAR + BRASS BASE)
// -------------------------------------------------------------
export function createSpecimenJar(
  content: THREE.Group,
  specimenId: SpecimenId,
  labelColor: number = 0x38bdf8
): THREE.Group {
  const jarGroup = new THREE.Group();
  jarGroup.name = `jar_${specimenId}`;

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xf0fdf4,
    transmission: 0.92,
    transparent: true,
    opacity: 0.85,
    roughness: 0.04,
    ior: 1.48,
    clearcoat: 1.0,
    depthWrite: false,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xca8a04,
    metalness: 0.85,
    roughness: 0.25,
  });

  // Brass Plinth Base
  const baseGeom = new THREE.CylinderGeometry(0.85, 0.95, 0.2, 32);
  const base = new THREE.Mesh(baseGeom, brassMat);
  base.position.y = 0.1;
  base.castShadow = true;
  base.receiveShadow = true;
  jarGroup.add(base);

  // Cylindrical Borosilicate Glass Jar
  const cylinderGeom = new THREE.CylinderGeometry(0.75, 0.75, 2.2, 32, 1, true);
  const jarBody = new THREE.Mesh(cylinderGeom, glassMat);
  jarBody.position.y = 1.3;
  jarGroup.add(jarBody);

  // Glass Bottom & Top domes
  const domeGeom = new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const topDome = new THREE.Mesh(domeGeom, glassMat);
  topDome.position.y = 2.4;
  jarGroup.add(topDome);

  // Brass Cap & Top Handle
  const capGeom = new THREE.CylinderGeometry(0.5, 0.78, 0.18, 32);
  const cap = new THREE.Mesh(capGeom, brassMat);
  cap.position.y = 2.65;
  jarGroup.add(cap);

  const ringHandleGeom = new THREE.TorusGeometry(0.18, 0.04, 12, 24);
  const ringHandle = new THREE.Mesh(ringHandleGeom, brassMat);
  ringHandle.position.y = 2.85;
  jarGroup.add(ringHandle);

  // SPECIALIZED MICRO-HABITAT FOR TARDIGRADE (WATER BEAR)
  if (specimenId === 'tardigrade') {
    // 1. Crystal-clear pristine water medium (not murky amber broth!)
    const liquidGeom = new THREE.CylinderGeometry(0.72, 0.72, 1.95, 24);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xecfeff, // ultra-clear aquatic cyan tint
      transmission: 0.96,
      transparent: true,
      opacity: 0.12,
      roughness: 0.02,
    });
    const liquid = new THREE.Mesh(liquidGeom, liquidMat);
    liquid.position.y = 1.25;
    jarGroup.add(liquid);

    // 2. Base Substrate: Natural Quartz & Jade Bio-Pebbles
    const pebbleMat = new THREE.MeshStandardMaterial({
      color: 0x134e4a, // deep jade stone
      roughness: 0.35,
    });
    const pearlPebbleMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.3,
    });

    const pebbleCoords = [
      [-0.35, 0.24, -0.2, 0.11, false],
      [0.32, 0.25, -0.22, 0.13, true],
      [-0.25, 0.25, 0.28, 0.12, true],
      [0.28, 0.24, 0.25, 0.1, false],
      [0.0, 0.24, 0.38, 0.09, false],
      [-0.42, 0.23, 0.05, 0.1, false],
      [0.44, 0.24, 0.02, 0.11, true],
    ] as const;

    pebbleCoords.forEach(([px, py, pz, r, isPearl]) => {
      const pGeom = new THREE.SphereGeometry(r, 10, 10);
      pGeom.scale(1.2, 0.65, 1.1);
      const pebble = new THREE.Mesh(pGeom, isPearl ? pearlPebbleMat : pebbleMat);
      pebble.position.set(px, py, pz);
      jarGroup.add(pebble);
    });

    // 3. Lush Living Micro-Moss Cushion (Sphagnum & Bryophyte Terrarium Bed)
    const mossColors = [0x15803d, 0x16a34a, 0x22c55e, 0x4ade80];
    const mossGroup = new THREE.Group();
    mossGroup.position.set(0, 0.32, 0);

    // Central soft moss mound
    const moundGeom = new THREE.SphereGeometry(0.52, 20, 14);
    moundGeom.scale(1.0, 0.45, 1.0);
    const moundMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.75,
    });
    const mound = new THREE.Mesh(moundGeom, moundMat);
    mossGroup.add(mound);

    // Micro-moss leaf clusters / vegetative nodules
    for (let i = 0; i < 18; i++) {
      const angle = (i * 2 * Math.PI) / 18;
      const rad = 0.2 + (i % 3) * 0.11;
      const leafColor = mossColors[i % mossColors.length];
      const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.65 });
      const leafGeom = new THREE.ConeGeometry(0.065, 0.16, 6);
      const leaf = new THREE.Mesh(leafGeom, leafMat);
      leaf.position.set(
        Math.cos(angle) * rad,
        0.12 + Math.sin(i * 1.5) * 0.04,
        Math.sin(angle) * rad
      );
      leaf.rotation.x = (Math.random() - 0.5) * 0.4;
      leaf.rotation.z = (Math.random() - 0.5) * 0.4;
      mossGroup.add(leaf);
    }

    // Delicate sporophyte stalks with golden spore capsules
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.3 });
    const sporeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.2 });
    for (let s = 0; s < 6; s++) {
      const sang = (s * 2 * Math.PI) / 6 + 0.3;
      const srad = 0.24;
      const stalkGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.28, 8);
      const stalk = new THREE.Mesh(stalkGeom, stalkMat);
      stalk.position.set(Math.cos(sang) * srad, 0.25, Math.sin(sang) * srad);
      stalk.rotation.z = (Math.random() - 0.5) * 0.25;
      mossGroup.add(stalk);

      const sporeGeom = new THREE.SphereGeometry(0.024, 8, 8);
      sporeGeom.scale(1, 1.4, 1);
      const spore = new THREE.Mesh(sporeGeom, sporeMat);
      spore.position.set(stalk.position.x, 0.39, stalk.position.z);
      mossGroup.add(spore);
    }

    jarGroup.add(mossGroup);

    // 4. Rising Micro-Oxygen Aeration Bubbles
    const microBubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      transmission: 0.9,
      transparent: true,
      opacity: 0.7,
      roughness: 0.05,
    });
    for (let b = 0; b < 12; b++) {
      const bGeom = new THREE.SphereGeometry(0.022 + (b % 3) * 0.012, 8, 8);
      const bubble = new THREE.Mesh(bGeom, microBubbleMat);
      bubble.position.set(
        (Math.sin(b * 1.7) * 0.42),
        0.5 + b * 0.12,
        (Math.cos(b * 2.1) * 0.42)
      );
      jarGroup.add(bubble);
    }

    // 5. Scientific Brass Environmental Dial Gauge on Base
    const dialHousingGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 24);
    const dialHousing = new THREE.Mesh(dialHousingGeom, brassMat);
    dialHousing.rotation.x = Math.PI / 2;
    dialHousing.position.set(0, 0.1, 0.92);
    jarGroup.add(dialHousing);

    // White dial face
    const dialFaceGeom = new THREE.CircleGeometry(0.13, 24);
    const dialFaceMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const dialFace = new THREE.Mesh(dialFaceGeom, dialFaceMat);
    dialFace.position.set(0, 0.1, 0.955);
    jarGroup.add(dialFace);

    // Red needle indicator
    const needleGeom = new THREE.BoxGeometry(0.012, 0.09, 0.005);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const needle = new THREE.Mesh(needleGeom, needleMat);
    needle.position.set(0, 0.12, 0.958);
    needle.rotation.z = -0.4;
    jarGroup.add(needle);

    // Glowing Cyan Status LED
    const ledGeom = new THREE.SphereGeometry(0.02, 10, 10);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const led = new THREE.Mesh(ledGeom, ledMat);
    led.position.set(0.08, 0.15, 0.958);
    jarGroup.add(led);

    // Position tardigrade comfortably hovering above the moss bed
    content.position.set(0, 1.2, 0);
  } else {
    // Standard liquid volume for other specimens
    const liquidGeom = new THREE.CylinderGeometry(0.71, 0.71, 1.9, 24);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: labelColor,
      transmission: 0.8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
    });
    const liquid = new THREE.Mesh(liquidGeom, liquidMat);
    liquid.position.y = 1.25;
    jarGroup.add(liquid);

    content.position.y = 1.3;
  }

  content.name = `organism_${specimenId}`;
  jarGroup.add(content);

  // Specimen label plaque
  const plaqueGeom = new THREE.BoxGeometry(0.7, 0.25, 0.04);
  const plaqueMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    metalness: 0.9,
    roughness: 0.2,
  });
  const plaque = new THREE.Mesh(plaqueGeom, plaqueMat);
  plaque.position.set(0, 0.45, 0.77);
  jarGroup.add(plaque);

  return jarGroup;
}

// -------------------------------------------------------------
// 7. PROCEDURAL TREASURE CHEST: MERCEDES'S FUTURE IN MARINE SCIENCE
// -------------------------------------------------------------
export function createTreasureChest(): { group: THREE.Group; lidPivot: THREE.Group } {
  const group = new THREE.Group();
  group.name = 'treasure_chest';

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x3b1d11, // rich aged mahogany
    roughness: 0.6,
    metalness: 0.1,
  });

  const brassBandMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.85,
    roughness: 0.25,
  });

  const goldCoinMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.9,
    roughness: 0.15,
  });

  const pearlMat = new THREE.MeshPhysicalMaterial({
    color: 0xfdf4ff,
    transmission: 0.3,
    roughness: 0.08,
    clearcoat: 1.0,
    iridescence: 0.9,
  });

  // Chest Base Box
  const baseGeom = new THREE.BoxGeometry(1.8, 0.9, 1.2);
  const baseBox = new THREE.Mesh(baseGeom, woodMat);
  baseBox.position.y = 0.45;
  baseBox.castShadow = true;
  baseBox.receiveShadow = true;
  group.add(baseBox);

  // Metal Corner & Edge Banding
  [-0.9, 0.9].forEach((x) => {
    const bandGeom = new THREE.BoxGeometry(0.12, 0.92, 1.22);
    const band = new THREE.Mesh(bandGeom, brassBandMat);
    band.position.set(x, 0.45, 0);
    group.add(band);
  });

  // Front Keyhole lock plaque
  const lockPlaqueGeom = new THREE.BoxGeometry(0.35, 0.35, 0.04);
  const lockPlaque = new THREE.Mesh(lockPlaqueGeom, brassBandMat);
  lockPlaque.position.set(0, 0.65, 0.62);
  group.add(lockPlaque);

  // Hinged Lid Pivot Group (pivoted along rear top edge: z = -0.6, y = 0.9)
  const lidPivot = new THREE.Group();
  lidPivot.name = 'chest_lid_pivot';
  lidPivot.position.set(0, 0.9, -0.6);

  // Curved Dome Lid
  const lidShapeGeom = new THREE.CylinderGeometry(0.6, 0.6, 1.82, 24, 1, false, 0, Math.PI);
  const lidMesh = new THREE.Mesh(lidShapeGeom, woodMat);
  lidMesh.rotation.z = Math.PI / 2;
  lidMesh.position.set(0, 0, 0.6);
  lidMesh.castShadow = true;
  lidPivot.add(lidMesh);

  // Brass strapping on lid
  [-0.9, 0.9, 0].forEach((x) => {
    const archBandGeom = new THREE.TorusGeometry(0.61, 0.05, 12, 24, Math.PI);
    const archBand = new THREE.Mesh(archBandGeom, brassBandMat);
    archBand.position.set(x, 0, 0.6);
    archBand.rotation.y = Math.PI / 2;
    lidPivot.add(archBand);
  });

  group.add(lidPivot);

  // Inside Cache: DIRECTLY LINKED TO MERCEDES'S FUTURE IN OCEAN SCIENCE
  // Elevated so all treasures are proudly displayed above the chest rim, not sunk to the bottom!
  const hoardGroup = new THREE.Group();
  hoardGroup.position.set(0, 0.78, 0);

  // 0. Royal Midnight-Indigo Velvet Display Cushion Base
  const cushionGeom = new THREE.BoxGeometry(1.58, 0.22, 0.98);
  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b, // royal midnight indigo velvet
    roughness: 0.85,
  });
  const cushion = new THREE.Mesh(cushionGeom, cushionMat);
  cushion.position.set(0, 0.11, 0);
  cushion.castShadow = true;
  hoardGroup.add(cushion);

  // Gold Braided Cushion Trim
  const trimGeom = new THREE.BoxGeometry(1.62, 0.035, 1.02);
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.85,
    roughness: 0.25,
  });
  const trim = new THREE.Mesh(trimGeom, trimMat);
  trim.position.set(0, 0.21, 0);
  hoardGroup.add(trim);

  // 1. MERCEDES'S FUTURE DEEP-SEA EXPLORATION SUBMERSIBLE ("MERCEDES EXPEDITION-I")
  // Centerpiece: elevated high above the rim, angled in 3/4 view
  const subGroup = new THREE.Group();
  subGroup.name = 'future_submersible';
  subGroup.position.set(0, 0.45, 0.02);
  subGroup.rotation.set(0.06, -0.32, 0);
  subGroup.scale.setScalar(0.72);

  const subHullMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // sleek arctic pearl-white research hull
    metalness: 0.65,
    roughness: 0.2,
  });

  const subGoldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.2,
  });

  const acrylicDomeMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.92,
    transparent: true,
    opacity: 0.9,
    roughness: 0.04,
    clearcoat: 1.0,
    ior: 1.5,
  });

  // Streamlined Submersible Capsule Hull
  const hullGeom = new THREE.CapsuleGeometry(0.24, 0.65, 16, 24);
  const hull = new THREE.Mesh(hullGeom, subHullMat);
  hull.rotation.x = Math.PI / 2;
  subGroup.add(hull);

  // Gold Research Accent Trim Band
  const trimRingGeom = new THREE.TorusGeometry(0.245, 0.018, 12, 32);
  const trimRing = new THREE.Mesh(trimRingGeom, subGoldTrimMat);
  trimRing.rotation.x = Math.PI / 2;
  trimRing.position.set(0, 0, 0.1);
  subGroup.add(trimRing);

  // Panoramic Acrylic Observation Cockpit Bubble in Front
  const cockpitGeom = new THREE.SphereGeometry(0.23, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const cockpit = new THREE.Mesh(cockpitGeom, acrylicDomeMat);
  cockpit.rotation.x = Math.PI / 2;
  cockpit.position.set(0, 0.02, 0.44);
  subGroup.add(cockpit);

  // Illuminated Miniature Dashboard Console inside cockpit
  const consoleGeom = new THREE.BoxGeometry(0.16, 0.08, 0.06);
  const consoleMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  const consoleMesh = new THREE.Mesh(consoleGeom, consoleMat);
  consoleMesh.position.set(0, 0.02, 0.42);
  subGroup.add(consoleMesh);

  // Dual Forward Ocean Trench Searchlights (properly contained, NEVER sticking out of chest!)
  [-1, 1].forEach((side) => {
    const lightHousingGeom = new THREE.CylinderGeometry(0.055, 0.065, 0.1, 16);
    const lightHousing = new THREE.Mesh(lightHousingGeom, subGoldTrimMat);
    lightHousing.rotation.x = Math.PI / 2;
    lightHousing.position.set(side * 0.22, 0.12, 0.32);
    subGroup.add(lightHousing);

    // Glowing Lens
    const lensGeom = new THREE.CircleGeometry(0.05, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    const lens = new THREE.Mesh(lensGeom, lensMat);
    lens.position.set(side * 0.22, 0.12, 0.38);
    subGroup.add(lens);

    // Compact downward-angled light cone focused entirely inside the chest cavity
    const beamGeom = new THREE.ConeGeometry(0.075, 0.2, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.rotation.x = -Math.PI / 2 + 0.35; // angled downward towards cushion
    beam.rotation.y = -side * 0.12;
    beam.position.set(side * 0.22, 0.07, 0.46);
    subGroup.add(beam);
  });

  // Articulated Deep-Sea Robotic Manipulator Arm holding a Glowing Crystal Specimen
  const armBase = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 10), subGoldTrimMat);
  armBase.position.set(0.15, -0.15, 0.32);
  armBase.rotation.x = 0.5;
  subGroup.add(armBase);

  const armForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 10), subGoldTrimMat);
  armForearm.position.set(0.15, -0.22, 0.45);
  armForearm.rotation.x = 0.8;
  subGroup.add(armForearm);

  // Deep-sea glowing discovery crystal held by arm
  const sampleGemGeom = new THREE.OctahedronGeometry(0.065);
  const sampleGemMat = new THREE.MeshPhysicalMaterial({
    color: 0xd946ef,
    emissive: 0xc084fc,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    transmission: 0.5,
  });
  const sampleGem = new THREE.Mesh(sampleGemGeom, sampleGemMat);
  sampleGem.position.set(0.15, -0.26, 0.56);
  subGroup.add(sampleGem);

  // Twin Stern Propulsion Thruster Nacelles
  [-1, 1].forEach((side) => {
    const thrusterGeom = new THREE.CylinderGeometry(0.075, 0.085, 0.26, 16);
    const thruster = new THREE.Mesh(thrusterGeom, subGoldTrimMat);
    thruster.rotation.x = Math.PI / 2;
    thruster.position.set(side * 0.2, 0.0, -0.42);
    subGroup.add(thruster);

    // Cyan plasma ion exhaust ring
    const exhaustGeom = new THREE.TorusGeometry(0.06, 0.015, 8, 16);
    const exhaustMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const exhaust = new THREE.Mesh(exhaustGeom, exhaustMat);
    exhaust.position.set(side * 0.2, 0.0, -0.56);
    subGroup.add(exhaust);
  });

  // Conning Tower & Navigation Beacon Fin
  const finGeom = new THREE.BoxGeometry(0.04, 0.16, 0.3);
  const fin = new THREE.Mesh(finGeom, subGoldTrimMat);
  fin.position.set(0, 0.24, -0.05);
  subGroup.add(fin);

  const beaconGeom = new THREE.SphereGeometry(0.03, 10, 10);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const beacon = new THREE.Mesh(beaconGeom, beaconMat);
  beacon.position.set(0, 0.34, -0.05);
  subGroup.add(beacon);

  hoardGroup.add(subGroup);

  // 2. THE GOLDEN DOCTORATE DIPLOMA & MEDALLION OF HONOR FOR DR. MERCEDES
  // Elevated and standing upright on a golden display easel
  const diplomaGroup = new THREE.Group();
  diplomaGroup.position.set(0.5, 0.42, -0.05);
  diplomaGroup.rotation.y = -0.35;
  diplomaGroup.rotation.x = -0.1;

  // Golden Easel Stand Legs Behind Diploma
  const easelLegMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
  const easelLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.44, 8), easelLegMat);
  easelLegL.position.set(-0.14, -0.08, -0.06);
  easelLegL.rotation.x = -0.25;
  diplomaGroup.add(easelLegL);

  const easelLegR = easelLegL.clone();
  easelLegR.position.x = 0.14;
  diplomaGroup.add(easelLegR);

  const easelStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.4, 8), easelLegMat);
  easelStrut.position.set(0, -0.08, -0.15);
  easelStrut.rotation.x = 0.4;
  diplomaGroup.add(easelStrut);

  // Golden Diploma Plaque Frame
  const plaqueGeom = new THREE.BoxGeometry(0.42, 0.52, 0.03);
  const plaqueMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.92,
    roughness: 0.18,
  });
  const plaqueMesh = new THREE.Mesh(plaqueGeom, plaqueMat);
  diplomaGroup.add(plaqueMesh);

  // Inner Ivory Parchment Sheet
  const parchmentGeom = new THREE.BoxGeometry(0.36, 0.46, 0.035);
  const parchmentMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    roughness: 0.4,
  });
  const parchment = new THREE.Mesh(parchmentGeom, parchmentMat);
  diplomaGroup.add(parchment);

  // Laurel Wreath / Seal of Doctorate Honor
  const wreathGeom = new THREE.TorusGeometry(0.1, 0.022, 12, 24);
  const wreathMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.85,
    roughness: 0.2,
  });
  const wreath = new THREE.Mesh(wreathGeom, wreathMat);
  wreath.position.set(0, 0.08, 0.02);
  diplomaGroup.add(wreath);

  // Deep Blue Sapphire Central Gem of Ocean Science
  const sapphireGeom = new THREE.OctahedronGeometry(0.045);
  const sapphireMat = new THREE.MeshPhysicalMaterial({
    color: 0x2563eb,
    roughness: 0.1,
    clearcoat: 1.0,
  });
  const sapphire = new THREE.Mesh(sapphireGeom, sapphireMat);
  sapphire.position.set(0, 0.08, 0.025);
  diplomaGroup.add(sapphire);

  hoardGroup.add(diplomaGroup);

  // 3. THE HOLOGRAPHIC OCEAN CURRENTS & EXPEDITIONS GLOBE
  // Elevated on a tall pedestal so it towers proudly above the rim
  const globeGroup = new THREE.Group();
  globeGroup.position.set(-0.5, 0.45, -0.05);
  globeGroup.rotation.y = 0.35;
  globeGroup.rotation.x = -0.08;

  // Stand Base & Stem
  const globeBaseGeom = new THREE.CylinderGeometry(0.14, 0.16, 0.05, 20);
  const globeBase = new THREE.Mesh(globeBaseGeom, goldCoinMat);
  globeBase.position.y = -0.12;
  globeGroup.add(globeBase);

  const globeStemGeom = new THREE.CylinderGeometry(0.03, 0.04, 0.16, 16);
  const globeStem = new THREE.Mesh(globeStemGeom, goldCoinMat);
  globeStem.position.y = -0.04;
  globeGroup.add(globeStem);

  // Curved Brass Arm Support
  const armTorusGeom = new THREE.TorusGeometry(0.24, 0.018, 10, 24, Math.PI);
  const globeArm = new THREE.Mesh(armTorusGeom, goldCoinMat);
  globeArm.position.set(0, 0.18, 0);
  globeArm.rotation.z = Math.PI / 4;
  globeGroup.add(globeArm);

  // Luminous Ocean Globe Sphere
  const globeSphereGeom = new THREE.SphereGeometry(0.18, 24, 24);
  const globeSphereMat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4, // glowing turquoise ocean water
    transmission: 0.7,
    roughness: 0.1,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.9,
  });
  const globeSphere = new THREE.Mesh(globeSphereGeom, globeSphereMat);
  globeSphere.position.set(0, 0.18, 0);
  globeGroup.add(globeSphere);

  // Golden Equatorial & Meridian Rings
  const eqRingGeom = new THREE.TorusGeometry(0.185, 0.008, 8, 24);
  const eqRing = new THREE.Mesh(eqRingGeom, goldCoinMat);
  eqRing.rotation.x = Math.PI / 2;
  eqRing.position.set(0, 0.18, 0);
  globeGroup.add(eqRing);

  // Glowing Future Research Destination Beacons
  const beaconCoords = [
    [0.08, 0.24, 0.12], // Mariana Trench
    [-0.1, 0.18, 0.14], // Great Barrier Reef
    [0.12, 0.14, -0.09], // Galápagos
  ];
  beaconCoords.forEach(([bx, by, bz]) => {
    const bMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    bMarker.position.set(bx, by, bz);
    globeGroup.add(bMarker);
  });

  hoardGroup.add(globeGroup);

  // 4. THE ROLLED BLUEPRINT SCROLL: MERCEDES'S OCEAN CONSERVATION FOUNDATION
  // Elevated on front cushion display
  const scrollGroup = new THREE.Group();
  scrollGroup.position.set(0, 0.26, 0.28);
  scrollGroup.rotation.z = -0.12;

  const scrollGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.65, 16);
  const scrollMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    roughness: 0.35,
  });
  const scrollMesh = new THREE.Mesh(scrollGeom, scrollMat);
  scrollMesh.rotation.z = Math.PI / 2;
  scrollGroup.add(scrollMesh);

  // Crimson Wax Ribbon & Seal
  const ribbonGeom = new THREE.CylinderGeometry(0.054, 0.054, 0.08, 16);
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.3 });
  const ribbon = new THREE.Mesh(ribbonGeom, ribbonMat);
  ribbon.rotation.z = Math.PI / 2;
  scrollGroup.add(ribbon);

  const waxSealGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12);
  const waxSealMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  const waxSeal = new THREE.Mesh(waxSealGeom, waxSealMat);
  waxSeal.position.set(0, 0.055, 0);
  scrollGroup.add(waxSeal);

  hoardGroup.add(scrollGroup);

  // 5. Cushion of Sparkling Ocean Pearls, Cut Diamonds & Gold Coins
  // Elevated on the velvet cushion surface
  const pearlCoords = [
    [-0.26, 0.25, 0.22],
    [0.26, 0.25, 0.22],
    [-0.34, 0.25, -0.18],
    [0.34, 0.25, -0.18],
    [-0.55, 0.24, 0.05],
    [0.55, 0.24, 0.05],
    [-0.15, 0.23, 0.32],
    [0.15, 0.23, 0.32],
  ];

  pearlCoords.forEach(([px, py, pz]) => {
    const pearlGeom = new THREE.SphereGeometry(0.075 + Math.random() * 0.025, 16, 16);
    const pearl = new THREE.Mesh(pearlGeom, pearlMat);
    pearl.position.set(px, py, pz);
    hoardGroup.add(pearl);
  });

  // Glowing Treasure Lights inside chest
  const chestCyanLight = new THREE.PointLight(0x38bdf8, 2.5, 4.5);
  chestCyanLight.position.set(0, 0.65, 0.1);
  hoardGroup.add(chestCyanLight);

  const chestGoldLight = new THREE.PointLight(0xfde047, 2.0, 3.5);
  chestGoldLight.position.set(0.4, 0.55, -0.05);
  hoardGroup.add(chestGoldLight);

  group.add(hoardGroup);

  return { group, lidPivot };
}

// -------------------------------------------------------------
// 8. PROCEDURAL TWO-TIER OCEAN BIRTHDAY CAKE WITH INTERACTIVE CANDLES
// -------------------------------------------------------------
export interface CakeCandle {
  id: number;
  flameMesh: THREE.Mesh;
  flameLight: THREE.PointLight;
  isLit: boolean;
}

export function createOceanBirthdayCake(): { group: THREE.Group; candles: CakeCandle[] } {
  const group = new THREE.Group();
  group.name = 'ocean_birthday_cake';

  const seafoamMat = new THREE.MeshStandardMaterial({
    color: 0x99f6e4, // seafoam teal
    roughness: 0.4,
  });

  const pearlWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xfdf4ff,
    roughness: 0.35,
  });

  const coralPinkMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    roughness: 0.3,
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.85,
    roughness: 0.25,
  });

  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
  });

  // Tier 1 (Bottom Tier)
  const tier1Geom = new THREE.CylinderGeometry(1.6, 1.6, 0.85, 40);
  const tier1 = new THREE.Mesh(tier1Geom, seafoamMat);
  tier1.position.y = 0.425;
  tier1.castShadow = true;
  tier1.receiveShadow = true;
  group.add(tier1);

  // Tier 1 Base Shell/Pearl border
  const beadCount = 28;
  const beadGeom = new THREE.SphereGeometry(0.08, 12, 12);
  const beadMesh = new THREE.InstancedMesh(beadGeom, pearlWhiteMat, beadCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < beadCount; i++) {
    const angle = (i * 2 * Math.PI) / beadCount;
    dummy.position.set(Math.cos(angle) * 1.62, 0.08, Math.sin(angle) * 1.62);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    beadMesh.setMatrixAt(i, dummy.matrix);
  }
  beadMesh.instanceMatrix.needsUpdate = true;
  group.add(beadMesh);

  // Tier 2 (Top Tier)
  const tier2Geom = new THREE.CylinderGeometry(1.05, 1.05, 0.75, 36);
  const tier2 = new THREE.Mesh(tier2Geom, pearlWhiteMat);
  tier2.position.y = 1.225;
  tier2.castShadow = true;
  tier2.receiveShadow = true;
  group.add(tier2);

  // Tier 2 decorative coral piping ring
  const coralRingGeom = new THREE.TorusGeometry(1.06, 0.05, 12, 36);
  const coralRing = new THREE.Mesh(coralRingGeom, coralPinkMat);
  coralRing.rotation.x = Math.PI / 2;
  coralRing.position.y = 1.6;
  group.add(coralRing);

  // Sea Star Sugar Accents on Cake Side
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI) / 3 + 0.3;
    const starGeom = new THREE.ConeGeometry(0.14, 0.08, 5);
    const star = new THREE.Mesh(starGeom, coralPinkMat);
    star.rotation.z = Math.PI / 2;
    star.rotation.y = angle;
    star.position.set(Math.cos(angle) * 1.61, 0.5, Math.sin(angle) * 1.61);
    group.add(star);
  }

  // Golden Clam Shell Crest on top
  const clamGeom = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI, 0, Math.PI * 0.5);
  const clam = new THREE.Mesh(clamGeom, goldTrimMat);
  clam.position.set(0, 1.62, 0);
  clam.rotation.x = Math.PI;
  group.add(clam);

  // Giant Birthday Pearl inside shell
  const giantPearlGeom = new THREE.SphereGeometry(0.18, 20, 20);
  const giantPearlMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    clearcoat: 1.0,
    iridescence: 0.9,
    roughness: 0.1,
  });
  const giantPearl = new THREE.Mesh(giantPearlGeom, giantPearlMat);
  giantPearl.position.set(0, 1.76, 0);
  group.add(giantPearl);

  // 4 Interactive Candles on Top Tier
  const candles: CakeCandle[] = [];
  const candleAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

  candleAngles.forEach((ang, idx) => {
    const candleGroup = new THREE.Group();
    const cx = Math.cos(ang) * 0.62;
    const cz = Math.sin(ang) * 0.62;
    candleGroup.position.set(cx, 1.6, cz);
    candleGroup.name = `candle_${idx}`;

    // Candle wax cylinder
    const waxGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.55, 16);
    const waxMat = new THREE.MeshStandardMaterial({
      color: idx % 2 === 0 ? 0x38bdf8 : 0xf472b6,
      roughness: 0.25,
    });
    const wax = new THREE.Mesh(waxGeom, waxMat);
    wax.position.y = 0.275;
    candleGroup.add(wax);

    // Candle Wick
    const wickGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8);
    const wickMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });
    const wick = new THREE.Mesh(wickGeom, wickMat);
    wick.position.y = 0.58;
    candleGroup.add(wick);

    // Candle Flame Mesh
    const flameGeom = new THREE.ConeGeometry(0.06, 0.2, 12);
    flameGeom.translate(0, 0.1, 0);
    const flameMesh = new THREE.Mesh(flameGeom, flameMat);
    flameMesh.position.y = 0.63;
    candleGroup.add(flameMesh);

    // Flame Point Light
    const flameLight = new THREE.PointLight(0xf59e0b, 0.9, 1.8);
    flameLight.position.y = 0.72;
    candleGroup.add(flameLight);

    group.add(candleGroup);

    candles.push({
      id: idx,
      flameMesh,
      flameLight,
      isLit: true,
    });
  });

  return { group, candles };
}

// -------------------------------------------------------------
// 9. PROCEDURAL LABORATORY EXPEDITION PLATFORM / TABLE
// -------------------------------------------------------------
export function createLabPlatform(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'lab_platform';

  const woodDeckMat = new THREE.MeshStandardMaterial({
    color: 0x0f2942, // deep oceanic midnight blue
    roughness: 0.4,
    metalness: 0.3,
  });

  const brassTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.85,
    roughness: 0.2,
  });

  // Main Circular Lab Table
  const tableGeom = new THREE.CylinderGeometry(6.2, 6.5, 0.4, 48);
  const table = new THREE.Mesh(tableGeom, woodDeckMat);
  table.position.y = -0.2;
  table.receiveShadow = true;
  group.add(table);

  // Outer Brass Trim Ring
  const ringGeom = new THREE.TorusGeometry(6.3, 0.1, 16, 48);
  const ring = new THREE.Mesh(ringGeom, brassTrimMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.02;
  group.add(ring);

  // Concentric decorative bioluminescent ring
  const bioRingGeom = new THREE.RingGeometry(4.2, 4.3, 48);
  const bioRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
  });
  const bioRing = new THREE.Mesh(bioRingGeom, bioRingMat);
  bioRing.rotation.x = -Math.PI / 2;
  bioRing.position.y = 0.01;
  group.add(bioRing);

  // Soft Radial Contact Shadow Grounding
  const shadowGeom = new THREE.PlaneGeometry(16, 16);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.6,
  });
  const shadowPlane = new THREE.Mesh(shadowGeom, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.42;
  group.add(shadowPlane);

  return group;
}
