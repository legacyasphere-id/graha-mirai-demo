import * as THREE from 'three';
import { UnitData, computePlotMetrics } from '../data/units';
import {
  getBrushedConcreteTextures,
  getGrassTurfTextures,
  getHerringbonePaverTextures,
  getRibbedRoofBumpTexture,
  getStackedSlateTextures,
  getStuccoBumpTexture,
  getWoodLouverTextures,
} from './proceduralTextures';
import { buildInteriorCutawayGroup } from './interiorBuilder';

/**
 * Generates a soft radial alpha map for the contact shadow plane.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 124);
    grad.addColorStop(0, 'rgba(24, 34, 56, 0.44)');
    grad.addColorStop(0.55, 'rgba(24, 34, 56, 0.20)');
    grad.addColorStop(1, 'rgba(24, 34, 56, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helper to create a detailed architectural framed window assembly:
 * - Outer projecting architectural bezel/box frame (optional)
 * - Inner aluminum perimeter frame
 * - Recessed reflective architectural glass pane
 * - Vertical mullions & horizontal transoms
 * - Optional operable casement inner sub-frames
 */
function createDetailedWindow(opts: {
  width: number;
  height: number;
  depth: number;
  outerBoxMat?: THREE.Material;
  outerBoxThickness?: number;
  outerBoxDepth?: number;
  frameMat: THREE.Material;
  glassMat: THREE.Material;
  cols?: number;
  rows?: number;
  hasMiddleCasements?: boolean;
}): THREE.Group {
  const {
    width,
    height,
    depth,
    outerBoxMat,
    outerBoxThickness = 0.09,
    outerBoxDepth = 0.22,
    frameMat,
    glassMat,
    cols = 2,
    rows = 1,
    hasMiddleCasements = false,
  } = opts;

  const group = new THREE.Group();

  if (outerBoxMat) {
    const topBar = new THREE.Mesh(
      new THREE.BoxGeometry(width + outerBoxThickness * 2, outerBoxThickness, outerBoxDepth),
      outerBoxMat
    );
    topBar.position.set(0, height / 2 + outerBoxThickness / 2, outerBoxDepth / 2 - depth / 2);
    group.add(topBar);

    const botBar = new THREE.Mesh(
      new THREE.BoxGeometry(width + outerBoxThickness * 2, outerBoxThickness, outerBoxDepth),
      outerBoxMat
    );
    botBar.position.set(0, -height / 2 - outerBoxThickness / 2, outerBoxDepth / 2 - depth / 2);
    group.add(botBar);

    const leftBar = new THREE.Mesh(
      new THREE.BoxGeometry(outerBoxThickness, height, outerBoxDepth),
      outerBoxMat
    );
    leftBar.position.set(-width / 2 - outerBoxThickness / 2, 0, outerBoxDepth / 2 - depth / 2);
    group.add(leftBar);

    const rightBar = new THREE.Mesh(
      new THREE.BoxGeometry(outerBoxThickness, height, outerBoxDepth),
      outerBoxMat
    );
    rightBar.position.set(width / 2 + outerBoxThickness / 2, 0, outerBoxDepth / 2 - depth / 2);
    group.add(rightBar);
  }

  const frameBarT = 0.045;
  const fTop = new THREE.Mesh(new THREE.BoxGeometry(width, frameBarT, depth), frameMat);
  fTop.position.set(0, height / 2 - frameBarT / 2, 0);
  group.add(fTop);

  const fBot = new THREE.Mesh(new THREE.BoxGeometry(width, frameBarT, depth), frameMat);
  fBot.position.set(0, -height / 2 + frameBarT / 2, 0);
  group.add(fBot);

  const fLeft = new THREE.Mesh(
    new THREE.BoxGeometry(frameBarT, height - frameBarT * 2, depth),
    frameMat
  );
  fLeft.position.set(-width / 2 + frameBarT / 2, 0, 0);
  group.add(fLeft);

  const fRight = new THREE.Mesh(
    new THREE.BoxGeometry(frameBarT, height - frameBarT * 2, depth),
    frameMat
  );
  fRight.position.set(width / 2 - frameBarT / 2, 0, 0);
  group.add(fRight);

  const glassPane = new THREE.Mesh(
    new THREE.BoxGeometry(width - frameBarT * 1.8, height - frameBarT * 1.8, depth * 0.45),
    glassMat
  );
  glassPane.position.set(0, 0, -depth * 0.12);
  group.add(glassPane);

  for (let c = 1; c < cols; c++) {
    const x = -width / 2 + (width / cols) * c;
    const mullion = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, height - frameBarT * 1.6, depth * 0.88),
      frameMat
    );
    mullion.position.set(x, 0, 0);
    group.add(mullion);
  }

  for (let r = 1; r < rows; r++) {
    const y = -height / 2 + (height / rows) * r;
    const transom = new THREE.Mesh(
      new THREE.BoxGeometry(width - frameBarT * 1.6, 0.036, depth * 0.88),
      frameMat
    );
    transom.position.set(0, y, 0);
    group.add(transom);
  }

  if (hasMiddleCasements && rows >= 2) {
    const cellW = width / cols;
    const cellH = height / rows;
    const targetRow = rows === 3 ? 1 : 0;
    const rowCenterY = -height / 2 + cellH * (targetRow + 0.5);
    for (let c = 0; c < cols; c++) {
      const colCenterX = -width / 2 + cellW * (c + 0.5);
      const casement = new THREE.Mesh(
        new THREE.BoxGeometry(cellW * 0.82, cellH * 0.78, 0.025),
        frameMat
      );
      casement.position.set(colCenterX, rowCenterY, depth * 0.25);
      group.add(casement);

      const innerGlass = new THREE.Mesh(
        new THREE.BoxGeometry(cellW * 0.68, cellH * 0.64, 0.03),
        glassMat
      );
      innerGlass.position.set(colCenterX, rowCenterY, depth * 0.25);
      group.add(innerGlass);
    }
  }

  return group;
}

/**
 * Helper to create a detailed entrance or rear door with perimeter frame,
 * recessed panel, vertical accent groove, and metallic lever handle.
 */
function createDetailedDoor(opts: {
  width: number;
  height: number;
  doorMat: THREE.Material;
  frameMat: THREE.Material;
  handleMat: THREE.Material;
  hasFrostedStrip?: boolean;
  glassMat?: THREE.Material;
}): THREE.Group {
  const { width, height, doorMat, frameMat, handleMat, hasFrostedStrip = false, glassMat } = opts;
  const group = new THREE.Group();

  const jamb = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.09), frameMat);
  group.add(jamb);

  const leafW = width - 0.09;
  const leafH = height - 0.05;
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.065), doorMat);
  leaf.position.set(0, -0.02, 0.015);
  group.add(leaf);

  if (hasFrostedStrip && glassMat) {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, leafH * 0.78, 0.072),
      glassMat
    );
    strip.position.set(-leafW * 0.18, 0, 0.018);
    group.add(strip);
  }

  const handleX = leafW * 0.34;
  const handleY = 0;
  const rose = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.14, 0.02), handleMat);
  rose.position.set(handleX, handleY, 0.055);
  group.add(rose);

  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.022, 0.025), handleMat);
  lever.position.set(handleX - 0.04, handleY + 0.02, 0.068);
  group.add(lever);

  return group;
}

/**
 * Helper to build a curved planter wing wall (seen in Kohaku & Hisui reference photos)
 * that sweeps smoothly down from planter height to curb height at the front-left corner.
 */
function createCurvedPlanterWing(
  wallThickness: number,
  planterHeight: number,
  depth: number,
  mat: THREE.Material
): THREE.Mesh {
  const curveLen = 0.75;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(depth, 0);
  shape.lineTo(depth, planterHeight);
  shape.lineTo(curveLen, planterHeight);
  shape.quadraticCurveTo(0.12, planterHeight, 0, 0.05);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: wallThickness,
    bevelEnabled: false,
    curveSegments: 16,
  });
  geo.rotateY(Math.PI / 2);
  return new THREE.Mesh(geo, mat);
}

/**
 * Helper to build an outdoor wall-mounted AC condenser unit + bracket for the rear service wall.
 */
function createOutdoorAcUnit(
  bodyMat: THREE.Material,
  darkMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  const casing = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.54, 0.28), bodyMat);
  group.add(casing);

  const fanGrille = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.19, 0.02, 16),
    darkMat
  );
  fanGrille.rotation.x = Math.PI / 2;
  fanGrille.position.set(-0.1, 0, -0.145);
  group.add(fanGrille);

  for (const bx of [-0.28, 0.28]) {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.36, 0.3), darkMat);
    bracket.position.set(bx, -0.14, 0.01);
    group.add(bracket);
  }
  return group;
}

/**
 * Builds an architecturally detailed procedural 3D cluster house and plot model (`THREE.Group`)
 * from the published land area (LT), building area (LB), and assumed storey count.
 *
 * When `cutawayMode = true`, replaces the closed upper exterior walls and roof with a
 * furnished 3D Interior Dollhouse Cutaway matching the published room counts.
 */
export function buildStylizedHouseModel(
  unit: UnitData,
  cutawayMode = false,
  activeStorey: 1 | 2 = 1
): THREE.Group {
  const root = new THREE.Group();
  root.name = `unit-${unit.id}`;

  const m = computePlotMetrics(unit);
  const {
    plotWidth,
    plotDepth,
    buildingWidth,
    buildingDepth,
    frontYardDepth,
    rearYardDepth,
    carportWidth,
  } = m;

  // Shared procedural PBR textures
  const paverTex = getHerringbonePaverTextures();
  const concreteTex = getBrushedConcreteTextures();
  const slateTex = getStackedSlateTextures();
  const stuccoBump = getStuccoBumpTexture();
  const grassTex = getGrassTurfTextures();
  const ribbedBump = getRibbedRoofBumpTexture();
  const louverTex = getWoodLouverTextures();

  // Calibrated PBR materials
  const plotSlabMat = new THREE.MeshStandardMaterial({
    color: '#D8D4CA',
    roughness: 0.88,
    metalness: 0.02,
  });
  const streetPaverMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: paverTex.map,
    bumpMap: paverTex.bumpMap,
    bumpScale: 0.018,
    roughness: 0.84,
    metalness: 0.02,
  });
  const carportConcreteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: concreteTex.map,
    bumpMap: concreteTex.bumpMap,
    bumpScale: 0.012,
    roughness: 0.8,
    metalness: 0.03,
  });
  const curbMat = new THREE.MeshStandardMaterial({
    color: '#C5C0B6',
    bumpMap: stuccoBump,
    bumpScale: 0.008,
    roughness: 0.82,
    metalness: 0.02,
  });
  const drainVoidMat = new THREE.MeshStandardMaterial({
    color: '#181A1D',
    roughness: 0.95,
    metalness: 0.0,
  });
  const lawnMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: grassTex.map,
    bumpMap: grassTex.bumpMap,
    bumpScale: 0.02,
    roughness: 0.92,
    metalness: 0.0,
  });
  const planterWallMat = new THREE.MeshStandardMaterial({
    color: unit.id === 'scb' ? '#484B4E' : '#F4F2ED',
    bumpMap: stuccoBump,
    bumpScale: 0.006,
    roughness: 0.74,
    metalness: 0.02,
  });
  const primaryWallMat = new THREE.MeshStandardMaterial({
    color: unit.palette.primaryWall,
    bumpMap: stuccoBump,
    bumpScale: 0.007,
    roughness: 0.74,
    metalness: 0.03,
  });
  const secondaryWallMat =
    unit.id === 'scb'
      ? new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: slateTex.map,
          bumpMap: slateTex.bumpMap,
          bumpScale: 0.035,
          roughness: 0.82,
          metalness: 0.06,
        })
      : new THREE.MeshStandardMaterial({
          color: unit.palette.secondaryWall,
          bumpMap: stuccoBump,
          bumpScale: 0.007,
          roughness: 0.76,
          metalness: 0.03,
        });
  const partyWallMat = new THREE.MeshStandardMaterial({
    color: '#E6E3DC',
    bumpMap: stuccoBump,
    bumpScale: 0.009,
    roughness: 0.84,
    metalness: 0.02,
  });
  const plinthMat = new THREE.MeshStandardMaterial({
    color: '#8D8A83',
    bumpMap: stuccoBump,
    bumpScale: 0.01,
    roughness: 0.85,
    metalness: 0.03,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: unit.palette.trim,
    bumpMap: stuccoBump,
    bumpScale: 0.004,
    roughness: 0.52,
    metalness: 0.08,
  });
  const whiteBoxFrameMat = new THREE.MeshStandardMaterial({
    color: '#F5F4F0',
    bumpMap: stuccoBump,
    bumpScale: 0.004,
    roughness: 0.55,
    metalness: 0.05,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: '#222529',
    roughness: 0.34,
    metalness: 0.52,
  });
  const brushedSteelMat = new THREE.MeshStandardMaterial({
    color: '#D0D5DA',
    roughness: 0.25,
    metalness: 0.78,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: unit.palette.roof,
    bumpMap: ribbedBump,
    bumpScale: 0.018,
    roughness: 0.62,
    metalness: 0.14,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: '#1A2836',
    roughness: 0.12,
    metalness: 0.42,
  });
  const canopyPolyMat = new THREE.MeshStandardMaterial({
    color: '#2D343B',
    bumpMap: ribbedBump,
    bumpScale: 0.012,
    roughness: 0.22,
    metalness: 0.28,
    transparent: true,
    opacity: 0.88,
  });
  const doorMat = new THREE.MeshStandardMaterial({
    color: unit.id === 'hisui' ? '#DED9CE' : unit.id === 'luri' ? '#382820' : '#262729',
    roughness: 0.46,
    metalness: 0.15,
  });
  const woodLouverMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: louverTex.map,
    bumpMap: louverTex.bumpMap,
    bumpScale: 0.025,
    roughness: 0.68,
    metalness: 0.05,
  });
  const warmLightMat = new THREE.MeshStandardMaterial({
    color: '#FFF3D1',
    emissive: '#FFCF70',
    emissiveIntensity: 0.75,
    roughness: 0.2,
  });

  const plotSlabHeight = 0.16;
  const frontZ = plotDepth / 2;
  const backZ = -plotDepth / 2;
  const houseFrontZ = frontZ - frontYardDepth;
  const houseBackZ = backZ + rearYardDepth;
  const houseCenterZ = (houseFrontZ + houseBackZ) / 2;
  const baseTopY = plotSlabHeight;

  // 1. Base Plot Slab & Cluster Street Herringbone Paver Apron
  const plotSlab = new THREE.Mesh(
    new THREE.BoxGeometry(plotWidth, plotSlabHeight, plotDepth),
    plotSlabMat
  );
  plotSlab.position.set(0, plotSlabHeight / 2, 0);
  root.add(plotSlab);

  const streetApronDepth = 1.45;
  const streetApron = new THREE.Mesh(
    new THREE.BoxGeometry(plotWidth + 0.8, 0.06, streetApronDepth),
    streetPaverMat
  );
  streetApron.position.set(0, 0.03, frontZ + streetApronDepth / 2);
  root.add(streetApron);

  const streetCurb = new THREE.Mesh(
    new THREE.BoxGeometry(plotWidth + 0.8, 0.12, 0.14),
    curbMat
  );
  streetCurb.position.set(0, 0.06, frontZ + 0.04);
  root.add(streetCurb);

  // 2. Carport Slab (with storm drain recess) & Front Planter
  const carportX = plotWidth / 2 - carportWidth / 2;
  const carportZ = frontZ - frontYardDepth / 2;

  const drainRecess = new THREE.Mesh(
    new THREE.BoxGeometry(carportWidth - 0.08, 0.11, 0.36),
    drainVoidMat
  );
  drainRecess.position.set(carportX, 0.065, frontZ - 0.12);
  root.add(drainRecess);

  const carportMatToUse =
    unit.id === 'luri' || unit.id === 'scb' ? streetPaverMat : carportConcreteMat;
  const carportPad = new THREE.Mesh(
    new THREE.BoxGeometry(carportWidth, 0.06, frontYardDepth + 0.04),
    carportMatToUse
  );
  carportPad.position.set(carportX, baseTopY + 0.03, carportZ + 0.02);
  root.add(carportPad);

  const gardenWidth = plotWidth - carportWidth;
  const gardenX = -plotWidth / 2 + gardenWidth / 2;
  const planterDepth = frontYardDepth - 0.42;
  const planterH = unit.id === 'scb' ? 0.22 : 0.34;
  const planterZ = frontZ - planterDepth / 2 - 0.08;

  const planterCore = new THREE.Mesh(
    new THREE.BoxGeometry(gardenWidth - 0.08, planterH, planterDepth - 0.18),
    planterWallMat
  );
  planterCore.position.set(gardenX + 0.04, baseTopY + planterH / 2, planterZ - 0.09);
  root.add(planterCore);

  const curvedWing = createCurvedPlanterWing(0.1, planterH + 0.06, planterDepth + 0.1, planterWallMat);
  curvedWing.position.set(-plotWidth / 2, baseTopY, frontZ - 0.02);
  root.add(curvedWing);

  const rightPlanterCurb = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, planterH + 0.03, planterDepth),
    planterWallMat
  );
  rightPlanterCurb.position.set(
    gardenX + gardenWidth / 2 - 0.045,
    baseTopY + (planterH + 0.03) / 2,
    planterZ
  );
  root.add(rightPlanterCurb);

  const grassTop = new THREE.Mesh(
    new THREE.BoxGeometry(gardenWidth - 0.2, 0.04, planterDepth - 0.24),
    lawnMat
  );
  grassTop.position.set(gardenX + 0.02, baseTopY + planterH + 0.02, planterZ - 0.05);
  root.add(grassTop);

  // Ornamental shrubs & tree in front planter
  const foliageGroup = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#5E493A', roughness: 0.88 });
  const crownDarkMat = new THREE.MeshStandardMaterial({ color: '#4A6B3B', roughness: 0.82 });
  const crownLightMat = new THREE.MeshStandardMaterial({ color: '#688B52', roughness: 0.78 });
  const accentShrubMat = new THREE.MeshStandardMaterial({ color: '#6E262E', roughness: 0.75 });

  if (unit.id === 'scb') {
    const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.35, 8), trunkMat);
    trunk1.position.set(-0.25, 0.68, -0.1);
    foliageGroup.add(trunk1);

    const canopy1 = new THREE.Mesh(new THREE.SphereGeometry(0.52, 12, 10), crownLightMat);
    canopy1.scale.set(1.2, 0.72, 1.1);
    canopy1.position.set(-0.25, 1.42, -0.1);
    foliageGroup.add(canopy1);

    const topiaryStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.15, 8), trunkMat);
    topiaryStem.position.set(0.55, 0.58, -0.45);
    foliageGroup.add(topiaryStem);
    for (const [ty, tr] of [
      [0.45, 0.24],
      [0.8, 0.2],
      [1.12, 0.16],
    ]) {
      const pod = new THREE.Mesh(new THREE.SphereGeometry(tr, 10, 8), crownLightMat);
      pod.scale.set(1.15, 0.65, 1.15);
      pod.position.set(0.55, ty, -0.45);
      foliageGroup.add(pod);
    }

    const bollard = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.82, 0.08),
      brushedSteelMat
    );
    bollard.position.set(0.42, 0.41, 0.55);
    foliageGroup.add(bollard);
  } else {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.05, 8), trunkMat);
    trunk.position.set(-0.22, 0.52, 0.05);
    foliageGroup.add(trunk);

    const crownMain = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 10), crownDarkMat);
    crownMain.scale.set(1.18, 0.78, 1.12);
    crownMain.position.set(-0.22, 1.12, 0.05);
    foliageGroup.add(crownMain);

    const crownSub = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), crownLightMat);
    crownSub.scale.set(1.1, 0.75, 1.1);
    crownSub.position.set(0.14, 0.94, 0.22);
    foliageGroup.add(crownSub);
  }

  const redShrub = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), accentShrubMat);
  redShrub.scale.set(0.9, 1.25, 0.9);
  redShrub.position.set(0.38, 0.22, 0.36);
  foliageGroup.add(redShrub);

  foliageGroup.position.set(gardenX, baseTopY + planterH + 0.02, planterZ);
  root.add(foliageGroup);

  // 3. Enclosed Rear Courtyard
  if (rearYardDepth > 0.35) {
    const rearGrass = new THREE.Mesh(
      new THREE.BoxGeometry(buildingWidth - 0.24, 0.04, rearYardDepth - 0.16),
      lawnMat
    );
    rearGrass.position.set(0, baseTopY + 0.02, backZ + rearYardDepth / 2);
    root.add(rearGrass);

    const rearPatio = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.08, Math.min(0.85, rearYardDepth * 0.65)),
      carportConcreteMat
    );
    rearPatio.position.set(
      buildingWidth * 0.22,
      baseTopY + 0.04,
      houseBackZ - Math.min(0.42, rearYardDepth * 0.32)
    );
    root.add(rearPatio);

    const fenceH = cutawayMode ? 1.15 : 2.05;
    const fenceT = 0.12;
    const leftFence = new THREE.Mesh(
      new THREE.BoxGeometry(fenceT, fenceH, rearYardDepth),
      partyWallMat
    );
    leftFence.position.set(-plotWidth / 2 + fenceT / 2, baseTopY + fenceH / 2, backZ + rearYardDepth / 2);
    root.add(leftFence);

    const rightFence = new THREE.Mesh(
      new THREE.BoxGeometry(fenceT, fenceH, rearYardDepth),
      partyWallMat
    );
    rightFence.position.set(plotWidth / 2 - fenceT / 2, baseTopY + fenceH / 2, backZ + rearYardDepth / 2);
    root.add(rightFence);

    const backFence = new THREE.Mesh(
      new THREE.BoxGeometry(plotWidth, fenceH, fenceT),
      partyWallMat
    );
    backFence.position.set(0, baseTopY + fenceH / 2, backZ + fenceT / 2);
    root.add(backFence);

    const backFenceCap = new THREE.Mesh(
      new THREE.BoxGeometry(plotWidth + 0.02, 0.05, fenceT + 0.04),
      curbMat
    );
    backFenceCap.position.set(0, baseTopY + fenceH + 0.025, backZ + fenceT / 2);
    root.add(backFenceCap);
  }

  // If Cutaway / Inside Preview Mode is active, build the furnished 3D Interior Dollhouse
  if (cutawayMode) {
    const interiorGroup = buildInteriorCutawayGroup(unit, activeStorey);
    root.add(interiorGroup);
    return root;
  }

  // 4. Exterior Mode: Unit-Specific Zero-Lot-Line Cluster House Massing & Facade Details
  const leftBayWidth = buildingWidth * 0.48;
  const rightBayWidth = buildingWidth * 0.52;
  const leftBayX = -buildingWidth / 2 + leftBayWidth / 2;
  const rightBayX = buildingWidth / 2 - rightBayWidth / 2;
  const recessOffset = 0.46;

  let leftWallHeight = 3.75;
  let rightWallHeight = 3.35;
  let rightSideDepth = buildingDepth - recessOffset;
  let rightSideCenterZ = houseBackZ + rightSideDepth / 2;

  if (unit.id === 'kohaku') {
    leftWallHeight = 3.75;
    rightWallHeight = 3.35;
    const rightDepth = buildingDepth - recessOffset;
    const rightCenterZ = houseBackZ + rightDepth / 2;
    const rightFrontZ = houseFrontZ - recessOffset;
    rightSideDepth = rightDepth;
    rightSideCenterZ = rightCenterZ;

    const leftVolume = new THREE.Mesh(
      new THREE.BoxGeometry(leftBayWidth, leftWallHeight, buildingDepth),
      primaryWallMat
    );
    leftVolume.position.set(leftBayX, baseTopY + leftWallHeight / 2, houseCenterZ);
    root.add(leftVolume);

    const rightVolume = new THREE.Mesh(
      new THREE.BoxGeometry(rightBayWidth, rightWallHeight, rightDepth),
      secondaryWallMat
    );
    rightVolume.position.set(rightBayX, baseTopY + rightWallHeight / 2, rightCenterZ);
    root.add(rightVolume);

    const roofSlab = new THREE.Mesh(
      new THREE.BoxGeometry(buildingWidth - 0.24, 0.08, buildingDepth - 0.55),
      roofMat
    );
    roofSlab.position.set(0, baseTopY + rightWallHeight - 0.22, houseCenterZ - 0.15);
    root.add(roofSlab);

    const leftClerestory = createDetailedWindow({
      width: leftBayWidth * 0.74,
      height: 0.48,
      depth: 0.1,
      outerBoxMat: trimMat,
      outerBoxThickness: 0.1,
      outerBoxDepth: 0.22,
      frameMat: darkMetalMat,
      glassMat,
      cols: 3,
      rows: 1,
    });
    leftClerestory.position.set(leftBayX, baseTopY + leftWallHeight - 0.72, houseFrontZ + 0.02);
    root.add(leftClerestory);

    const rightClerestory = createDetailedWindow({
      width: rightBayWidth * 0.68,
      height: 0.42,
      depth: 0.09,
      outerBoxMat: trimMat,
      outerBoxThickness: 0.08,
      outerBoxDepth: 0.16,
      frameMat: darkMetalMat,
      glassMat,
      cols: 2,
      rows: 1,
    });
    rightClerestory.position.set(rightBayX - 0.1, baseTopY + rightWallHeight - 0.52, rightFrontZ + 0.02);
    root.add(rightClerestory);

    const tallWin = createDetailedWindow({
      width: 0.54,
      height: 1.62,
      depth: 0.1,
      frameMat: darkMetalMat,
      glassMat,
      cols: 1,
      rows: 2,
    });
    tallWin.position.set(leftBayX + leftBayWidth * 0.24, baseTopY + 1.38, houseFrontZ + 0.02);
    root.add(tallWin);

    const porchStep = new THREE.Mesh(
      new THREE.BoxGeometry(rightBayWidth - 0.1, 0.12, recessOffset),
      carportConcreteMat
    );
    porchStep.position.set(rightBayX, baseTopY + 0.06, rightFrontZ + recessOffset / 2);
    root.add(porchStep);

    const mainDoor = createDetailedDoor({
      width: 0.9,
      height: 2.18,
      doorMat,
      frameMat: darkMetalMat,
      handleMat: brushedSteelMat,
    });
    mainDoor.position.set(rightBayX - 0.36, baseTopY + 1.21, rightFrontZ + 0.02);
    root.add(mainDoor);

    const doorSidelight = createDetailedWindow({
      width: 0.48,
      height: 1.75,
      depth: 0.09,
      frameMat: darkMetalMat,
      glassMat,
      cols: 1,
      rows: 2,
    });
    doorSidelight.position.set(rightBayX + 0.36, baseTopY + 1.42, rightFrontZ + 0.02);
    root.add(doorSidelight);

    // Signature Double-V Steel Carport Canopy
    const canopyW = carportWidth + 0.16;
    const canopyD = frontYardDepth - 0.18;
    const canopyY = baseTopY + 2.58;
    const canopyCenterZ = carportZ + 0.05;

    const canopyFrame = new THREE.Mesh(
      new THREE.BoxGeometry(canopyW, 0.07, canopyD),
      darkMetalMat
    );
    canopyFrame.position.set(carportX, canopyY, canopyCenterZ);
    root.add(canopyFrame);

    const canopySheet = new THREE.Mesh(
      new THREE.BoxGeometry(canopyW - 0.1, 0.03, canopyD - 0.1),
      new THREE.MeshStandardMaterial({
        color: '#DCD9D0',
        bumpMap: ribbedBump,
        bumpScale: 0.02,
        roughness: 0.45,
        metalness: 0.2,
      })
    );
    canopySheet.position.set(carportX, canopyY + 0.03, canopyCenterZ);
    root.add(canopySheet);

    for (let p = 0; p < 5; p++) {
      const pz = canopyCenterZ - canopyD / 2 + 0.25 + (p * (canopyD - 0.5)) / 4;
      const purlin = new THREE.Mesh(
        new THREE.BoxGeometry(canopyW - 0.08, 0.04, 0.04),
        darkMetalMat
      );
      purlin.position.set(carportX, canopyY - 0.02, pz);
      root.add(purlin);
    }

    const vFootZ = frontZ - 0.36;
    const vHeight = canopyY - (baseTopY + 0.06);
    const strutLen = Math.sqrt(vHeight * vHeight + 0.55 * 0.55);
    const strutGeo = new THREE.BoxGeometry(0.055, strutLen, 0.055);

    for (const sideSign of [-1, 1]) {
      const baseFootX = carportX + sideSign * (canopyW / 2 - 0.16);
      const legFront = new THREE.Mesh(strutGeo, darkMetalMat);
      legFront.position.set(baseFootX, baseTopY + 0.06 + vHeight / 2, vFootZ + 0.24);
      legFront.rotation.x = -0.19;
      legFront.rotation.z = sideSign * 0.05;
      root.add(legFront);

      const legBack = new THREE.Mesh(strutGeo, darkMetalMat);
      legBack.position.set(baseFootX, baseTopY + 0.06 + vHeight / 2, vFootZ - 0.24);
      legBack.rotation.x = 0.19;
      legBack.rotation.z = sideSign * 0.05;
      root.add(legBack);

      const basePlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.03, 0.18),
        darkMetalMat
      );
      basePlate.position.set(baseFootX, baseTopY + 0.075, vFootZ);
      root.add(basePlate);
    }
  } else if (unit.id === 'hisui') {
    const wallHeight = 2.85;
    const leftPeakH = 1.95;
    const rightPeakH = 1.38;
    leftWallHeight = wallHeight;
    rightWallHeight = wallHeight;
    rightSideDepth = buildingDepth;
    rightSideCenterZ = houseCenterZ;

    const mainBody = new THREE.Mesh(
      new THREE.BoxGeometry(buildingWidth, wallHeight, buildingDepth),
      primaryWallMat
    );
    mainBody.position.set(0, baseTopY + wallHeight / 2, houseCenterZ);
    root.add(mainBody);

    const leftGableShape = new THREE.Shape();
    leftGableShape.moveTo(-buildingWidth / 2, 0);
    leftGableShape.lineTo(0.08, 0);
    leftGableShape.lineTo(0.08, leftPeakH);
    leftGableShape.closePath();

    const leftGableMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(leftGableShape, { depth: buildingDepth, bevelEnabled: false }),
      primaryWallMat
    );
    leftGableMesh.position.set(0, baseTopY + wallHeight, houseBackZ);
    root.add(leftGableMesh);

    const rightGableShape = new THREE.Shape();
    rightGableShape.moveTo(0.08, 0);
    rightGableShape.lineTo(buildingWidth / 2, 0);
    rightGableShape.lineTo(0.08, rightPeakH);
    rightGableShape.closePath();

    const rightGableMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(rightGableShape, {
        depth: buildingDepth - 0.18,
        bevelEnabled: false,
      }),
      primaryWallMat
    );
    rightGableMesh.position.set(0, baseTopY + wallHeight, houseBackZ);
    root.add(rightGableMesh);

    const fasciaDepth = 0.28;
    const leftTriGlassShape = new THREE.Shape();
    leftTriGlassShape.moveTo(-buildingWidth * 0.38, 0.16);
    leftTriGlassShape.lineTo(-0.12, 0.16);
    leftTriGlassShape.lineTo(-0.12, leftPeakH - 0.28);
    leftTriGlassShape.closePath();

    const leftTriGlass = new THREE.Mesh(
      new THREE.ExtrudeGeometry(leftTriGlassShape, { depth: 0.06, bevelEnabled: false }),
      glassMat
    );
    leftTriGlass.position.set(0, baseTopY + wallHeight, houseFrontZ - 0.04);
    root.add(leftTriGlass);

    for (const mx of [-buildingWidth * 0.3, -buildingWidth * 0.21, -buildingWidth * 0.12]) {
      const tRatio = (mx - -buildingWidth * 0.38) / (-0.12 - -buildingWidth * 0.38);
      const mh = Math.max(0.18, (leftPeakH - 0.44) * tRatio);
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.04, mh, 0.08), darkMetalMat);
      mullion.position.set(mx, baseTopY + wallHeight + 0.16 + mh / 2, houseFrontZ - 0.01);
      root.add(mullion);
    }

    const triBotBar = new THREE.Mesh(
      new THREE.BoxGeometry(buildingWidth * 0.38 - 0.1, 0.045, 0.09),
      darkMetalMat
    );
    triBotBar.position.set(-buildingWidth * 0.25, baseTopY + wallHeight + 0.16, houseFrontZ - 0.01);
    root.add(triBotBar);

    const rightLouverShape = new THREE.Shape();
    rightLouverShape.moveTo(0.22, 0.14);
    rightLouverShape.lineTo(buildingWidth * 0.42, 0.14);
    rightLouverShape.lineTo(0.22, rightPeakH - 0.22);
    rightLouverShape.closePath();

    const rightLouverMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(rightLouverShape, { depth: 0.08, bevelEnabled: false }),
      woodLouverMat
    );
    rightLouverMesh.position.set(0, baseTopY + wallHeight, houseFrontZ - 0.22);
    root.add(rightLouverMesh);

    const leftSlopeLen = Math.hypot(buildingWidth / 2 + 0.08, leftPeakH);
    const leftSlopeAngle = Math.atan2(leftPeakH, buildingWidth / 2 + 0.08);
    const leftBarge = new THREE.Mesh(
      new THREE.BoxGeometry(leftSlopeLen + 0.1, 0.14, fasciaDepth),
      whiteBoxFrameMat
    );
    leftBarge.rotation.z = leftSlopeAngle;
    leftBarge.position.set(
      (-buildingWidth / 2 + 0.08) / 2,
      baseTopY + wallHeight + leftPeakH / 2 + 0.04,
      houseFrontZ + fasciaDepth / 2 - 0.04
    );
    root.add(leftBarge);

    const rightSlopeLen = Math.hypot(buildingWidth / 2 - 0.08, rightPeakH);
    const rightSlopeAngle = -Math.atan2(rightPeakH, buildingWidth / 2 - 0.08);
    const rightBarge = new THREE.Mesh(
      new THREE.BoxGeometry(rightSlopeLen + 0.1, 0.14, fasciaDepth),
      whiteBoxFrameMat
    );
    rightBarge.rotation.z = rightSlopeAngle;
    rightBarge.position.set(
      (buildingWidth / 2 + 0.08) / 2,
      baseTopY + wallHeight + rightPeakH / 2 + 0.04,
      houseFrontZ - 0.18 + fasciaDepth / 2
    );
    root.add(rightBarge);

    // Ground floor: White entrance door + 3-tier floor-to-ceiling sidelight window
    const mainDoor = createDetailedDoor({
      width: 0.88,
      height: 2.18,
      doorMat,
      frameMat: darkMetalMat,
      handleMat: brushedSteelMat,
    });
    mainDoor.position.set(-buildingWidth * 0.31, baseTopY + 1.09, houseFrontZ + 0.03);
    root.add(mainDoor);

    const doorGlass = createDetailedWindow({
      width: 0.92,
      height: 2.18,
      depth: 0.09,
      frameMat: darkMetalMat,
      glassMat,
      cols: 1,
      rows: 3,
    });
    doorGlass.position.set(-buildingWidth * 0.06, baseTopY + 1.09, houseFrontZ + 0.03);
    root.add(doorGlass);

    // Right bay: Large 6-pane grid window proudly flush on the front wall (houseFrontZ + 0.03)
    const livingWin = createDetailedWindow({
      width: 1.44,
      height: 1.82,
      depth: 0.1,
      frameMat: darkMetalMat,
      glassMat,
      cols: 2,
      rows: 3,
      hasMiddleCasements: true,
    });
    livingWin.position.set(buildingWidth * 0.25, baseTopY + 1.2, houseFrontZ + 0.03);
    root.add(livingWin);

    const canopyW = buildingWidth * 0.56;
    const canopyD = 0.88;
    const canopyX = -buildingWidth * 0.16;
    const canopyY = baseTopY + 2.42;

    const canopyTop = new THREE.Mesh(
      new THREE.BoxGeometry(canopyW, 0.045, canopyD),
      canopyPolyMat
    );
    canopyTop.position.set(canopyX, canopyY, houseFrontZ + canopyD / 2);
    root.add(canopyTop);

    for (const bx of [
      canopyX - canopyW * 0.42,
      canopyX,
      canopyX + canopyW * 0.42,
    ]) {
      const bracketArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, canopyD),
        darkMetalMat
      );
      bracketArm.position.set(bx, canopyY - 0.03, houseFrontZ + canopyD / 2);
      root.add(bracketArm);

      const strut = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.035, canopyD * 0.72),
        darkMetalMat
      );
      strut.rotation.x = 0.36;
      strut.position.set(bx, canopyY - 0.14, houseFrontZ + canopyD * 0.34);
      root.add(strut);
    }
  } else if (unit.id === 'luri') {
    leftWallHeight = 4.35;
    rightWallHeight = 3.65;
    const rightDepth = buildingDepth - recessOffset;
    const rightCenterZ = houseBackZ + rightDepth / 2;
    const rightFrontZ = houseFrontZ - recessOffset;
    rightSideDepth = rightDepth;
    rightSideCenterZ = rightCenterZ;

    const leftTower = new THREE.Mesh(
      new THREE.BoxGeometry(leftBayWidth, leftWallHeight, buildingDepth),
      secondaryWallMat
    );
    leftTower.position.set(leftBayX, baseTopY + leftWallHeight / 2, houseCenterZ);
    root.add(leftTower);

    const finPier = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 2.45, 0.48),
      secondaryWallMat
    );
    finPier.position.set(leftBayX + leftBayWidth / 2 - 0.09, baseTopY + 1.225, houseFrontZ + 0.22);
    root.add(finPier);

    const rightWing = new THREE.Mesh(
      new THREE.BoxGeometry(rightBayWidth, rightWallHeight, rightDepth),
      primaryWallMat
    );
    rightWing.position.set(rightBayX, baseTopY + rightWallHeight / 2, rightCenterZ);
    root.add(rightWing);

    const roofSlab = new THREE.Mesh(
      new THREE.BoxGeometry(buildingWidth - 0.24, 0.08, buildingDepth - 0.5),
      roofMat
    );
    roofSlab.position.set(0, baseTopY + rightWallHeight - 0.2, houseCenterZ - 0.15);
    root.add(roofSlab);

    const upperBoxWin = createDetailedWindow({
      width: leftBayWidth * 0.78,
      height: 1.22,
      depth: 0.1,
      outerBoxMat: whiteBoxFrameMat,
      outerBoxThickness: 0.11,
      outerBoxDepth: 0.28,
      frameMat: darkMetalMat,
      glassMat,
      cols: 3,
      rows: 3,
      hasMiddleCasements: true,
    });
    upperBoxWin.position.set(leftBayX, baseTopY + leftWallHeight - 1.02, houseFrontZ + 0.02);
    root.add(upperBoxWin);

    const rightClerestory = createDetailedWindow({
      width: rightBayWidth * 0.76,
      height: 0.48,
      depth: 0.1,
      outerBoxMat: whiteBoxFrameMat,
      outerBoxThickness: 0.09,
      outerBoxDepth: 0.22,
      frameMat: darkMetalMat,
      glassMat,
      cols: 3,
      rows: 1,
    });
    rightClerestory.position.set(rightBayX, baseTopY + rightWallHeight - 0.72, rightFrontZ + 0.02);
    root.add(rightClerestory);

    const mainDoor = createDetailedDoor({
      width: 0.88,
      height: 2.15,
      doorMat,
      frameMat: darkMetalMat,
      handleMat: brushedSteelMat,
    });
    mainDoor.position.set(leftBayX - 0.44, baseTopY + 1.075, houseFrontZ + 0.02);
    root.add(mainDoor);

    const leftGroundWin = createDetailedWindow({
      width: 0.9,
      height: 2.15,
      depth: 0.09,
      frameMat: darkMetalMat,
      glassMat,
      cols: 1,
      rows: 3,
    });
    leftGroundWin.position.set(leftBayX + 0.42, baseTopY + 1.075, houseFrontZ + 0.02);
    root.add(leftGroundWin);

    const rightGroundWin = createDetailedWindow({
      width: 1.4,
      height: 1.8,
      depth: 0.1,
      frameMat: darkMetalMat,
      glassMat,
      cols: 2,
      rows: 3,
      hasMiddleCasements: true,
    });
    rightGroundWin.position.set(rightBayX, baseTopY + 1.18, rightFrontZ + 0.02);
    root.add(rightGroundWin);

    const canopyW = leftBayWidth + 0.08;
    const canopyD = 0.82;
    const canopyY = baseTopY + 2.38;
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(canopyW, 0.045, canopyD),
      canopyPolyMat
    );
    canopy.position.set(leftBayX, canopyY, houseFrontZ + canopyD / 2);
    root.add(canopy);

    for (const bx of [leftBayX - canopyW * 0.4, leftBayX, leftBayX + canopyW * 0.4]) {
      const strut = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.035, canopyD * 0.75),
        darkMetalMat
      );
      strut.rotation.x = 0.35;
      strut.position.set(bx, canopyY - 0.12, houseFrontZ + canopyD * 0.35);
      root.add(strut);
    }
  } else {
    leftWallHeight = 6.25;
    rightWallHeight = 5.95;
    const rightDepth = buildingDepth - recessOffset;
    const rightCenterZ = houseBackZ + rightDepth / 2;
    const rightFrontZ = houseFrontZ - recessOffset;
    rightSideDepth = rightDepth;
    rightSideCenterZ = rightCenterZ;

    const leftTwoStorey = new THREE.Mesh(
      new THREE.BoxGeometry(leftBayWidth, leftWallHeight, buildingDepth),
      primaryWallMat
    );
    leftTwoStorey.position.set(leftBayX, baseTopY + leftWallHeight / 2, houseCenterZ);
    root.add(leftTwoStorey);

    const rightTwoStorey = new THREE.Mesh(
      new THREE.BoxGeometry(rightBayWidth, rightWallHeight, rightDepth),
      secondaryWallMat
    );
    rightTwoStorey.position.set(rightBayX, baseTopY + rightWallHeight / 2, rightCenterZ);
    root.add(rightTwoStorey);

    const leftParapetCap = new THREE.Mesh(
      new THREE.BoxGeometry(leftBayWidth + 0.06, 0.12, buildingDepth + 0.06),
      whiteBoxFrameMat
    );
    leftParapetCap.position.set(leftBayX, baseTopY + leftWallHeight + 0.06, houseCenterZ);
    root.add(leftParapetCap);

    const rightParapetCap = new THREE.Mesh(
      new THREE.BoxGeometry(rightBayWidth + 0.04, 0.11, rightDepth + 0.04),
      whiteBoxFrameMat
    );
    rightParapetCap.position.set(rightBayX, baseTopY + rightWallHeight + 0.055, rightCenterZ);
    root.add(rightParapetCap);

    const loggiaW = leftBayWidth * 0.82;
    const loggiaH = 1.78;
    const loggiaD = 0.42;
    const loggiaY = baseTopY + 4.35;

    const loggiaBack = new THREE.Mesh(
      new THREE.BoxGeometry(loggiaW - 0.18, loggiaH - 0.18, 0.06),
      whiteBoxFrameMat
    );
    loggiaBack.position.set(leftBayX, loggiaY, houseFrontZ + 0.03);
    root.add(loggiaBack);

    const balconyWin = createDetailedWindow({
      width: loggiaW * 0.72,
      height: loggiaH - 0.28,
      depth: 0.09,
      outerBoxMat: whiteBoxFrameMat,
      outerBoxThickness: 0.11,
      outerBoxDepth: loggiaD,
      frameMat: darkMetalMat,
      glassMat,
      cols: 2,
      rows: 1,
    });
    balconyWin.position.set(leftBayX, loggiaY, houseFrontZ + 0.06);
    root.add(balconyWin);

    const glassRail = new THREE.Mesh(
      new THREE.BoxGeometry(loggiaW - 0.06, 0.62, 0.03),
      new THREE.MeshStandardMaterial({
        color: '#8EA8BA',
        roughness: 0.15,
        metalness: 0.35,
        transparent: true,
        opacity: 0.68,
      })
    );
    glassRail.position.set(leftBayX, loggiaY - loggiaH / 2 + 0.34, houseFrontZ + loggiaD - 0.04);
    root.add(glassRail);

    const railTopBar = new THREE.Mesh(
      new THREE.BoxGeometry(loggiaW - 0.02, 0.04, 0.05),
      darkMetalMat
    );
    railTopBar.position.set(leftBayX, loggiaY - loggiaH / 2 + 0.66, houseFrontZ + loggiaD - 0.04);
    root.add(railTopBar);

    const railMidBar = new THREE.Mesh(
      new THREE.BoxGeometry(loggiaW - 0.02, 0.025, 0.04),
      darkMetalMat
    );
    railMidBar.position.set(leftBayX, loggiaY - loggiaH / 2 + 0.44, houseFrontZ + loggiaD - 0.04);
    root.add(railMidBar);

    const rightUpperWin = createDetailedWindow({
      width: 1.18,
      height: 1.52,
      depth: 0.1,
      outerBoxMat: whiteBoxFrameMat,
      outerBoxThickness: 0.1,
      outerBoxDepth: 0.24,
      frameMat: darkMetalMat,
      glassMat,
      cols: 2,
      rows: 2,
    });
    rightUpperWin.position.set(rightBayX, baseTopY + 4.3, rightFrontZ + 0.02);
    root.add(rightUpperWin);

    const porchBackWall = new THREE.Mesh(
      new THREE.BoxGeometry(leftBayWidth - 0.22, 2.52, 0.04),
      whiteBoxFrameMat
    );
    porchBackWall.position.set(leftBayX + 0.05, baseTopY + 1.26, houseFrontZ + 0.02);
    root.add(porchBackWall);

    const porchLeftPier = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 2.62, 0.68),
      whiteBoxFrameMat
    );
    porchLeftPier.position.set(-buildingWidth / 2 + 0.08, baseTopY + 1.31, houseFrontZ + 0.32);
    root.add(porchLeftPier);

    const porchCanopy = new THREE.Mesh(
      new THREE.BoxGeometry(leftBayWidth + 0.28, 0.14, 0.72),
      whiteBoxFrameMat
    );
    porchCanopy.position.set(leftBayX + 0.1, baseTopY + 2.58, houseFrontZ + 0.34);
    root.add(porchCanopy);

    const mainDoor = createDetailedDoor({
      width: 0.96,
      height: 2.24,
      doorMat,
      frameMat: darkMetalMat,
      handleMat: brushedSteelMat,
      hasFrostedStrip: true,
      glassMat,
    });
    mainDoor.position.set(leftBayX - 0.26, baseTopY + 1.12, houseFrontZ + 0.04);
    root.add(mainDoor);

    const rightLowerWin = createDetailedWindow({
      width: 1.18,
      height: 1.72,
      depth: 0.1,
      outerBoxMat: whiteBoxFrameMat,
      outerBoxThickness: 0.1,
      outerBoxDepth: 0.22,
      frameMat: darkMetalMat,
      glassMat,
      cols: 2,
      rows: 1,
    });
    rightLowerWin.position.set(rightBayX, baseTopY + 1.32, rightFrontZ + 0.02);
    root.add(rightLowerWin);
  }

  // 5. Cluster Blind Party Wall Details on Left (-X) & Right (+X) Elevations (ZERO SIDE WINDOWS)
  for (const sideSign of [-1, 1] as const) {
    const sideX = (sideSign * buildingWidth) / 2;
    const wallH = sideSign === -1 ? leftWallHeight : rightWallHeight;
    const wallD = sideSign === -1 ? buildingDepth : rightSideDepth;
    const wallCenterZ = sideSign === -1 ? houseCenterZ : rightSideCenterZ;

    // Concrete plinth base course along party wall bottom
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.28, wallD),
      plinthMat
    );
    plinth.position.set(sideX + sideSign * 0.015, baseTopY + 0.14, wallCenterZ);
    root.add(plinth);

    // Party-wall parapet fire-stop coping stone flush with each side's actual height
    if (unit.id !== 'scb') {
      const coping = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.08, wallD + 0.02),
        curbMat
      );
      coping.position.set(sideX, baseTopY + wallH + 0.04, wallCenterZ);
      root.add(coping);
    }

    // Subtle vertical structural expansion joint pilasters on blind party wall
    for (const zFrac of [-0.48, 0, 0.48]) {
      const pilaster = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, wallH, 0.16),
        partyWallMat
      );
      pilaster.position.set(
        sideX + sideSign * 0.012,
        baseTopY + wallH / 2,
        wallCenterZ + zFrac * (wallD - 0.22)
      );
      root.add(pilaster);
    }
  }

  // 6. Detailed Rear Elevation (Back Door, Rear Windows, Drip Canopy, Outdoor AC Unit, Downpipe)
  const backWinLeft = createDetailedWindow({
    width: 1.24,
    height: 1.32,
    depth: 0.1,
    outerBoxMat: whiteBoxFrameMat,
    outerBoxThickness: 0.07,
    outerBoxDepth: 0.14,
    frameMat: darkMetalMat,
    glassMat,
    cols: 2,
    rows: 2,
  });
  backWinLeft.rotation.y = Math.PI;
  backWinLeft.position.set(-buildingWidth * 0.22, baseTopY + 1.48, houseBackZ - 0.02);
  root.add(backWinLeft);

  const backDoor = createDetailedDoor({
    width: 0.86,
    height: 2.12,
    doorMat,
    frameMat: darkMetalMat,
    handleMat: brushedSteelMat,
  });
  backDoor.rotation.y = Math.PI;
  backDoor.position.set(buildingWidth * 0.22, baseTopY + 1.06, houseBackZ - 0.02);
  root.add(backDoor);

  const rearCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.07, 0.55),
    whiteBoxFrameMat
  );
  rearCanopy.position.set(buildingWidth * 0.22, baseTopY + 2.32, houseBackZ - 0.26);
  root.add(rearCanopy);

  const acUnit = createOutdoorAcUnit(whiteBoxFrameMat, darkMetalMat);
  acUnit.position.set(0.15, baseTopY + 2.55, houseBackZ - 0.16);
  root.add(acUnit);

  const downpipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, leftWallHeight - 0.1, 10),
    curbMat
  );
  downpipe.position.set(
    -buildingWidth / 2 + 0.18,
    baseTopY + (leftWallHeight - 0.1) / 2,
    houseBackZ - 0.05
  );
  root.add(downpipe);

  const sconceX = unit.id === 'kohaku' ? rightBayX - 0.92 : leftBayX - 0.95;
  const sconceZ =
    unit.id === 'kohaku' ? houseFrontZ - recessOffset + 0.04 : houseFrontZ + 0.04;
  const sconceBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.24, 0.09),
    darkMetalMat
  );
  sconceBody.position.set(sconceX, baseTopY + 1.78, sconceZ);
  root.add(sconceBody);

  const sconceGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.06, 0.07),
    warmLightMat
  );
  sconceGlow.position.set(sconceX, baseTopY + 1.65, sconceZ);
  root.add(sconceGlow);

  if (unit.assumedStoreys === 2) {
    const backUpperWin = createDetailedWindow({
      width: 1.35,
      height: 1.35,
      depth: 0.1,
      outerBoxMat: whiteBoxFrameMat,
      outerBoxThickness: 0.08,
      outerBoxDepth: 0.16,
      frameMat: darkMetalMat,
      glassMat,
      cols: 2,
      rows: 1,
    });
    backUpperWin.rotation.y = Math.PI;
    backUpperWin.position.set(-buildingWidth * 0.18, baseTopY + 4.3, houseBackZ - 0.02);
    root.add(backUpperWin);
  }

  return root;
}
