import * as THREE from 'three';
import { UnitData, computePlotMetrics } from '../data/units';

/**
 * Creates a crisp architectural room label sprite for the 3D interior cutaway view.
 */
function createRoomLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 320, 64);
    // Pill background
    ctx.fillStyle = 'rgba(20, 26, 35, 0.86)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 300, 44, 10);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#F8F7F4';
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 160, 33);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.55, 0.31, 1);
  sprite.renderOrder = 10;
  return sprite;
}

/**
 * Helper to create a stylized 3D bed assembly (frame, mattress, headboard, pillows, blanket).
 */
function createBedAssembly(
  width: number,
  length: number,
  woodMat: THREE.Material,
  sheetMat: THREE.Material,
  blanketMat: THREE.Material,
  pillowCount = 2
): THREE.Group {
  const group = new THREE.Group();

  // Bed frame base
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.22, length),
    woodMat
  );
  frame.position.set(0, 0.11, 0);
  group.add(frame);

  // Headboard at -Z (against wall)
  const headboard = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.78, 0.08),
    woodMat
  );
  headboard.position.set(0, 0.39, -length / 2 + 0.04);
  group.add(headboard);

  // Mattress
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.08, 0.18, length - 0.12),
    sheetMat
  );
  mattress.position.set(0, 0.3, 0.02);
  group.add(mattress);

  // Duvet / throw blanket covering lower 60% of mattress
  const blanket = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.06, 0.19, (length - 0.12) * 0.58),
    blanketMat
  );
  blanket.position.set(0, 0.305, length * 0.18);
  group.add(blanket);

  // Pillows
  const pillowW = (width - 0.24) / pillowCount;
  for (let i = 0; i < pillowCount; i++) {
    const px =
      pillowCount === 1
        ? 0
        : -width / 2 + 0.14 + pillowW / 2 + i * (pillowW + 0.04);
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(pillowW, 0.08, 0.28),
      sheetMat
    );
    pillow.position.set(px, 0.42, -length / 2 + 0.26);
    group.add(pillow);
  }

  return group;
}

/**
 * Helper to create a living room sofa + coffee table + rug assembly.
 */
function createLivingSet(
  sofaMat: THREE.Material,
  woodMat: THREE.Material,
  rugMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();

  // Woven area rug
  const rug = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.015, 1.45), rugMat);
  rug.position.set(0, 0.01, 0);
  group.add(rug);

  // Sofa base & backrest (placed on +X side facing -X, or along Z)
  const sofaSeat = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.34, 1.58),
    sofaMat
  );
  sofaSeat.position.set(0.45, 0.17, 0);
  group.add(sofaSeat);

  const sofaBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.68, 1.58),
    sofaMat
  );
  sofaBack.position.set(0.73, 0.34, 0);
  group.add(sofaBack);

  for (const az of [-0.73, 0.73]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.5, 0.12), sofaMat);
    arm.position.set(0.45, 0.25, az);
    group.add(arm);
  }

  // Coffee table
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.28, 0.88),
    woodMat
  );
  table.position.set(-0.22, 0.14, 0);
  group.add(table);

  return group;
}

/**
 * Helper to create a bathroom fixture group (vanity sink, toilet, glass shower partition).
 */
function createBathroomSet(
  w: number,
  d: number,
  ceramicMat: THREE.Material,
  woodMat: THREE.Material,
  glassMat: THREE.Material,
  metalMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();

  // Vanity counter + basin
  const vanity = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.72, 0.42), woodMat);
  vanity.position.set(-w * 0.24, 0.36, -d / 2 + 0.24);
  group.add(vanity);

  const basin = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.08, 0.28),
    ceramicMat
  );
  basin.position.set(-w * 0.24, 0.76, -d / 2 + 0.24);
  group.add(basin);

  // Toilet fixture
  const toiletBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.38, 0.52),
    ceramicMat
  );
  toiletBase.position.set(w * 0.22, 0.19, -d / 2 + 0.28);
  group.add(toiletBase);

  const cistern = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.36, 0.18),
    ceramicMat
  );
  cistern.position.set(w * 0.22, 0.56, -d / 2 + 0.11);
  group.add(cistern);

  // Tempered glass shower screen
  const showerGlass = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.46, 1.05, 0.03),
    glassMat
  );
  showerGlass.position.set(-w * 0.22, 0.525, 0.12);
  group.add(showerGlass);

  const showerHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12),
    metalMat
  );
  showerHead.position.set(-w * 0.26, 1.02, d / 2 - 0.22);
  group.add(showerHead);

  return group;
}

/**
 * Builds a complete, furnished 3D Interior Dollhouse Cutaway (`THREE.Group`)
 * matching the published room counts for each unit:
 * - Kohaku, Hisui, Luri (1 storey): 2 bedrooms, 1 bathroom, living/dining/kitchen
 * - SCB (2 storeys): 2+1 bedrooms, 2 bathrooms, living/dining/kitchen, staircase
 */
export function buildInteriorCutawayGroup(
  unit: UnitData,
  activeStorey: 1 | 2 = 1
): THREE.Group {
  const group = new THREE.Group();
  group.name = `interior-${unit.id}-floor-${activeStorey}`;

  const m = computePlotMetrics(unit);
  const { plotWidth, plotDepth, buildingWidth, buildingDepth, frontYardDepth, rearYardDepth } = m;

  const plotSlabHeight = 0.16;
  const frontZ = plotDepth / 2;
  const backZ = -plotDepth / 2;
  const houseFrontZ = frontZ - frontYardDepth;
  const houseBackZ = backZ + rearYardDepth;
  const houseCenterZ = (houseFrontZ + houseBackZ) / 2;

  const recessOffset = 0.46;
  const leftBayWidth = buildingWidth * 0.48;
  const rightBayWidth = buildingWidth * 0.52;
  const leftBayX = -buildingWidth / 2 + leftBayWidth / 2;
  const rightBayX = buildingWidth / 2 - rightBayWidth / 2;
  const rightDepth = unit.id === 'hisui' ? buildingDepth : buildingDepth - recessOffset;
  const rightCenterZ = houseBackZ + rightDepth / 2;
  const rightFrontZ = unit.id === 'hisui' ? houseFrontZ : houseFrontZ - recessOffset;

  // Interior Materials
  const wallCutMat = new THREE.MeshStandardMaterial({
    color: '#F5F3EE',
    roughness: 0.72,
    metalness: 0.02,
  });
  const wallTopCapMat = new THREE.MeshStandardMaterial({
    color: '#2C333D',
    roughness: 0.5,
    metalness: 0.1,
  });
  const mainFloorMat = new THREE.MeshStandardMaterial({
    color: '#EDEAE2',
    roughness: 0.45,
    metalness: 0.05,
  });
  const woodFloorMat = new THREE.MeshStandardMaterial({
    color: '#C7A07A',
    roughness: 0.58,
    metalness: 0.04,
  });
  const bathTileMat = new THREE.MeshStandardMaterial({
    color: '#CBD2D6',
    roughness: 0.5,
    metalness: 0.06,
  });
  const walnutWoodMat = new THREE.MeshStandardMaterial({
    color: '#5B4030',
    roughness: 0.62,
    metalness: 0.05,
  });
  const oakWoodMat = new THREE.MeshStandardMaterial({
    color: '#9C7454',
    roughness: 0.6,
    metalness: 0.04,
  });
  const sheetWhiteMat = new THREE.MeshStandardMaterial({
    color: '#F8F7F4',
    roughness: 0.82,
    metalness: 0.0,
  });
  const accentBlanketMat = new THREE.MeshStandardMaterial({
    color: '#465B6E',
    roughness: 0.85,
    metalness: 0.0,
  });
  const sofaFabricMat = new THREE.MeshStandardMaterial({
    color: '#6C6862',
    roughness: 0.88,
    metalness: 0.0,
  });
  const rugMat = new THREE.MeshStandardMaterial({
    color: '#D8D1C5',
    roughness: 0.92,
    metalness: 0.0,
  });
  const ceramicWhiteMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.2,
    metalness: 0.1,
  });
  const counterStoneMat = new THREE.MeshStandardMaterial({
    color: '#3A3D40',
    roughness: 0.35,
    metalness: 0.2,
  });
  const glassPartitionMat = new THREE.MeshStandardMaterial({
    color: '#98B4C8',
    roughness: 0.15,
    metalness: 0.3,
    transparent: true,
    opacity: 0.55,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: '#D4D9DE',
    roughness: 0.22,
    metalness: 0.8,
  });

  const isSecondFloor = unit.assumedStoreys === 2 && activeStorey === 2;
  const floorBaseY = isSecondFloor ? plotSlabHeight + 3.0 : plotSlabHeight;
  const cutWallH = 1.18;
  const wallT = 0.12;

  // Helper to add a cutaway wall segment with a dark architectural section cap on top
  function addCutWall(cx: number, cz: number, w: number, d: number, h = cutWallH) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallCutMat);
    wall.position.set(cx, floorBaseY + h / 2, cz);
    group.add(wall);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.01, 0.03, d + 0.01), wallTopCapMat);
    cap.position.set(cx, floorBaseY + h + 0.015, cz);
    group.add(cap);
  }

  // If rendering SCB 2nd floor, keep a subtle 1st-floor base shell underneath so it sits in space cleanly
  if (isSecondFloor) {
    const lowerShellLeft = new THREE.Mesh(
      new THREE.BoxGeometry(leftBayWidth, 2.96, buildingDepth),
      new THREE.MeshStandardMaterial({
        color: unit.palette.primaryWall,
        roughness: 0.82,
        transparent: true,
        opacity: 0.38,
      })
    );
    lowerShellLeft.position.set(leftBayX, plotSlabHeight + 1.48, houseCenterZ);
    group.add(lowerShellLeft);

    const lowerShellRight = new THREE.Mesh(
      new THREE.BoxGeometry(rightBayWidth, 2.96, rightDepth),
      new THREE.MeshStandardMaterial({
        color: '#46494D',
        roughness: 0.85,
        transparent: true,
        opacity: 0.38,
      })
    );
    lowerShellRight.position.set(rightBayX, plotSlabHeight + 1.48, rightCenterZ);
    group.add(lowerShellRight);
  }

  // 1. Floor Slabs (Left bedroom zone in wood parquet, Right living/dining in porcelain tile)
  const leftFloor = new THREE.Mesh(
    new THREE.BoxGeometry(leftBayWidth - 0.08, 0.06, buildingDepth - 0.08),
    woodFloorMat
  );
  leftFloor.position.set(leftBayX, floorBaseY + 0.03, houseCenterZ);
  group.add(leftFloor);

  const rightFloor = new THREE.Mesh(
    new THREE.BoxGeometry(rightBayWidth - 0.08, 0.06, rightDepth - 0.08),
    mainFloorMat
  );
  rightFloor.position.set(rightBayX, floorBaseY + 0.03, rightCenterZ);
  group.add(rightFloor);

  // 2. Outer Perimeter Cutaway Walls (Left blind party wall, Right blind party wall, Front & Back walls)
  addCutWall(-buildingWidth / 2 + wallT / 2, houseCenterZ, wallT, buildingDepth);
  addCutWall(buildingWidth / 2 - wallT / 2, rightCenterZ, wallT, rightDepth);
  addCutWall(leftBayX, houseFrontZ - wallT / 2, leftBayWidth, wallT);
  addCutWall(rightBayX, rightFrontZ - wallT / 2, rightBayWidth, wallT);
  addCutWall(0, houseBackZ + wallT / 2, buildingWidth, wallT);

  // Central longitudinal spine partition wall between left zone and right zone
  addCutWall(leftBayX + leftBayWidth / 2, rightCenterZ, wallT, rightDepth - 0.4);

  if (!isSecondFloor) {
    // GROUND FLOOR LAYOUT
    // For Kohaku, Hisui, Luri (1 storey):
    // - Left Front: Master Bedroom (KT 1)
    // - Left Center: Bathroom (KM)
    // - Left Rear: Bedroom 2 (KT 2)
    // - Right Front-to-Back: Living Room, Dining, Kitchen
    // For SCB (1st Floor of 2-storey):
    // - Left Front + Right Front: Living & Dining Room
    // - Left Center: Bathroom 1 + Staircase to 2nd Floor
    // - Left Rear: Bedroom +1 (KT +1)
    // - Right Rear: Kitchen
    const bed1Depth = buildingDepth * 0.42;
    const bathDepth = buildingDepth * 0.22;
    const bed2Depth = buildingDepth - bed1Depth - bathDepth;

    const zSplit1 = houseFrontZ - bed1Depth;
    const zSplit2 = zSplit1 - bathDepth;

    // Cross partition walls on left bay
    addCutWall(leftBayX, zSplit1, leftBayWidth, wallT);
    addCutWall(leftBayX, zSplit2, leftBayWidth, wallT);

    // Bathroom floor tile overlay
    const bathCenterZ = (zSplit1 + zSplit2) / 2;
    const bathFloor = new THREE.Mesh(
      new THREE.BoxGeometry(leftBayWidth - 0.2, 0.075, bathDepth - 0.12),
      bathTileMat
    );
    bathFloor.position.set(leftBayX, floorBaseY + 0.04, bathCenterZ);
    group.add(bathFloor);

    // Bathroom fixtures
    const bathSet = createBathroomSet(
      leftBayWidth - 0.3,
      bathDepth - 0.2,
      ceramicWhiteMat,
      walnutWoodMat,
      glassPartitionMat,
      chromeMat
    );
    bathSet.position.set(leftBayX, floorBaseY + 0.06, bathCenterZ);
    group.add(bathSet);

    const bathLabel = createRoomLabelSprite(unit.id === 'scb' ? 'K. Mandi 1' : 'K. Mandi');
    bathLabel.position.set(leftBayX, floorBaseY + 1.42, bathCenterZ);
    group.add(bathLabel);

    if (unit.id !== 'scb') {
      // 1-Storey: Master Bedroom (KT 1) in Front Left
      const bed1Z = houseFrontZ - bed1Depth / 2;
      const masterBed = createBedAssembly(
        1.48,
        1.78,
        walnutWoodMat,
        sheetWhiteMat,
        accentBlanketMat,
        2
      );
      masterBed.rotation.y = Math.PI / 2; // Headboard against left party wall (-X)
      masterBed.position.set(
        -buildingWidth / 2 + wallT + 0.92,
        floorBaseY + 0.06,
        bed1Z
      );
      group.add(masterBed);

      // Wardrobe in KT 1
      const wardrobe1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 1.08, 1.15),
        oakWoodMat
      );
      wardrobe1.position.set(
        leftBayX + leftBayWidth / 2 - 0.3,
        floorBaseY + 0.58,
        bed1Z - 0.2
      );
      group.add(wardrobe1);

      const kt1Label = createRoomLabelSprite('Kamar Tidur 1');
      kt1Label.position.set(leftBayX, floorBaseY + 1.45, bed1Z);
      group.add(kt1Label);
    } else {
      // SCB 1st Floor Front Left: Foyer & Dining Lounge + Staircase along center spine
      const diningTable = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 0.74, 0.85),
        walnutWoodMat
      );
      diningTable.position.set(leftBayX, floorBaseY + 0.4, houseFrontZ - bed1Depth / 2);
      group.add(diningTable);

      const diningLabel = createRoomLabelSprite('R. Makan & Foyer');
      diningLabel.position.set(leftBayX, floorBaseY + 1.45, houseFrontZ - bed1Depth / 2);
      group.add(diningLabel);

      // Staircase rising along the center wall
      const stairGroup = new THREE.Group();
      const steps = 9;
      for (let s = 0; s < steps; s++) {
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.78, 0.14, 0.24),
          oakWoodMat
        );
        stepMesh.position.set(0, s * 0.16 + 0.07, -s * 0.22);
        stairGroup.add(stepMesh);
      }
      stairGroup.position.set(rightBayX - rightBayWidth / 2 + 0.48, floorBaseY + 0.06, zSplit1 + 0.3);
      group.add(stairGroup);
    }

    // Rear Left Room: Bedroom 2 (for 1-storey) or Bedroom +1 (for SCB)
    const bed2Z = (zSplit2 + houseBackZ) / 2;
    const secondBed = createBedAssembly(
      1.1,
      1.68,
      oakWoodMat,
      sheetWhiteMat,
      accentBlanketMat,
      1
    );
    secondBed.rotation.y = Math.PI / 2;
    secondBed.position.set(
      -buildingWidth / 2 + wallT + 0.88,
      floorBaseY + 0.06,
      bed2Z
    );
    group.add(secondBed);

    const kt2Label = createRoomLabelSprite(
      unit.id === 'scb' ? 'Kamar +1' : 'Kamar Tidur 2'
    );
    kt2Label.position.set(leftBayX, floorBaseY + 1.45, bed2Z);
    group.add(kt2Label);

    // Right Bay Front/Center: Living Room (Sofa, Rug, Coffee Table, TV Console)
    const livingZ = rightFrontZ - rightDepth * 0.36;
    const livingSet = createLivingSet(sofaFabricMat, walnutWoodMat, rugMat);
    livingSet.position.set(rightBayX, floorBaseY + 0.06, livingZ);
    group.add(livingSet);

    // Wall-mounted TV console on right party wall
    const tvStand = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.38, 1.35),
      walnutWoodMat
    );
    tvStand.position.set(
      buildingWidth / 2 - wallT - 0.2,
      floorBaseY + 0.25,
      livingZ
    );
    group.add(tvStand);

    const livingLabel = createRoomLabelSprite('R. Tamu & Keluarga');
    livingLabel.position.set(rightBayX, floorBaseY + 1.45, livingZ);
    group.add(livingLabel);

    // Right Bay Rear: Kitchen Counter + Sink + Stove
    const kitchenZ = houseBackZ + wallT + 0.34;
    const kitchenCounter = new THREE.Mesh(
      new THREE.BoxGeometry(rightBayWidth * 0.56, 0.82, 0.56),
      counterStoneMat
    );
    kitchenCounter.position.set(
      rightBayX + rightBayWidth * 0.14,
      floorBaseY + 0.45,
      kitchenZ
    );
    group.add(kitchenCounter);

    const sink = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.04, 0.34),
      chromeMat
    );
    sink.position.set(
      rightBayX + rightBayWidth * 0.24,
      floorBaseY + 0.87,
      kitchenZ
    );
    group.add(sink);

    const kitchenLabel = createRoomLabelSprite('Dapur');
    kitchenLabel.position.set(rightBayX, floorBaseY + 1.42, kitchenZ + 0.35);
    group.add(kitchenLabel);
  } else {
    // SCB 2ND FLOOR LAYOUT (Master Bedroom, Bedroom 2, Bathroom 2, Balcony Loggia)
    const zMidLeft = houseCenterZ - 0.35;
    const zMidRight = rightCenterZ - 0.45;

    addCutWall(leftBayX, zMidLeft, leftBayWidth, wallT);
    addCutWall(rightBayX, zMidRight, rightBayWidth, wallT);

    // Front Left: Master Bedroom connected to front balcony
    const masterZ = (houseFrontZ + zMidLeft) / 2;
    const masterBed = createBedAssembly(
      1.6,
      1.85,
      walnutWoodMat,
      sheetWhiteMat,
      accentBlanketMat,
      2
    );
    masterBed.rotation.y = Math.PI / 2;
    masterBed.position.set(
      -buildingWidth / 2 + wallT + 0.98,
      floorBaseY + 0.06,
      masterZ
    );
    group.add(masterBed);

    const masterWardrobe = new THREE.Mesh(
      new THREE.BoxGeometry(leftBayWidth * 0.65, 1.1, 0.46),
      oakWoodMat
    );
    masterWardrobe.position.set(leftBayX, floorBaseY + 0.58, zMidLeft + 0.3);
    group.add(masterWardrobe);

    const masterLabel = createRoomLabelSprite('KT Utama (Lantai 2)');
    masterLabel.position.set(leftBayX, floorBaseY + 1.48, masterZ);
    group.add(masterLabel);

    // Front Right: Bedroom 2 (Kamar Tidur Anak)
    const kidBedZ = (rightFrontZ + zMidRight) / 2;
    const kidBed = createBedAssembly(
      1.25,
      1.75,
      oakWoodMat,
      sheetWhiteMat,
      accentBlanketMat,
      1
    );
    kidBed.rotation.y = -Math.PI / 2; // Headboard against right party wall (+X)
    kidBed.position.set(
      buildingWidth / 2 - wallT - 0.92,
      floorBaseY + 0.06,
      kidBedZ
    );
    group.add(kidBed);

    const kidLabel = createRoomLabelSprite('Kamar Tidur 2 (Lantai 2)');
    kidLabel.position.set(rightBayX, floorBaseY + 1.48, kidBedZ);
    group.add(kidLabel);

    // Rear Left: Bathroom 2 (Kamar Mandi 2)
    const bath2Depth = zMidLeft - houseBackZ;
    const bath2Z = (zMidLeft + houseBackZ) / 2;
    const bath2Floor = new THREE.Mesh(
      new THREE.BoxGeometry(leftBayWidth - 0.2, 0.075, bath2Depth - 0.14),
      bathTileMat
    );
    bath2Floor.position.set(leftBayX, floorBaseY + 0.04, bath2Z);
    group.add(bath2Floor);

    const bath2Set = createBathroomSet(
      leftBayWidth - 0.3,
      bath2Depth - 0.24,
      ceramicWhiteMat,
      walnutWoodMat,
      glassPartitionMat,
      chromeMat
    );
    bath2Set.position.set(leftBayX, floorBaseY + 0.06, bath2Z);
    group.add(bath2Set);

    const bath2Label = createRoomLabelSprite('K. Mandi 2');
    bath2Label.position.set(leftBayX, floorBaseY + 1.45, bath2Z);
    group.add(bath2Label);

    // Rear Right: Upper Hallway & Stair Landing
    const stairLabel = createRoomLabelSprite('Bordes Tangga');
    stairLabel.position.set(rightBayX, floorBaseY + 1.45, (zMidRight + houseBackZ) / 2);
    group.add(stairLabel);
  }

  return group;
}
