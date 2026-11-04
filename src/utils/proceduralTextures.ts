import * as THREE from 'three';

export interface TexturePair {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

let cachedPaver: TexturePair | null = null;
let cachedConcrete: TexturePair | null = null;
let cachedSlate: TexturePair | null = null;
let cachedGrass: TexturePair | null = null;
let cachedStuccoBump: THREE.CanvasTexture | null = null;
let cachedRibbedBump: THREE.CanvasTexture | null = null;
let cachedLouverTex: TexturePair | null = null;

/**
 * Deterministic pseudo-random helper for repeatable procedural textures.
 */
function hash2d(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

/**
 * Generates a tileable 512x512 herringbone concrete paver block texture + bump map.
 */
export function getHerringbonePaverTextures(): TexturePair {
  if (cachedPaver) return cachedPaver;

  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (cCtx && bCtx) {
    // Mortar base
    cCtx.fillStyle = '#8C8982';
    cCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = '#2A2A2A';
    bCtx.fillRect(0, 0, size, size);

    const step = 32;
    const brickW = step;
    const brickL = step * 2;
    const gap = 3;

    for (let row = -2; row < size / step + 2; row++) {
      for (let col = -2; col < size / step + 2; col++) {
        const isHorizontal = (row + col) % 2 === 0;
        const x = col * step;
        const y = row * step;
        const rand = hash2d(col + 20, row + 20);

        const baseL = 178 + Math.round((rand - 0.5) * 24);
        const r = baseL + 2;
        const g = baseL;
        const b = baseL - 4;

        const w = isHorizontal ? brickL - gap : brickW - gap;
        const h = isHorizontal ? brickW - gap : brickL - gap;

        cCtx.fillStyle = `rgb(${r},${g},${b})`;
        cCtx.fillRect(x + gap / 2, y + gap / 2, w, h);

        // Subtle inner bevel highlight
        cCtx.strokeStyle = `rgba(255,255,255,0.16)`;
        cCtx.lineWidth = 1;
        cCtx.strokeRect(x + gap / 2 + 1, y + gap / 2 + 1, w - 2, h - 2);

        // Bump map: bright brick center, darker bevel
        const bumpVal = 200 + Math.round((rand - 0.5) * 30);
        bCtx.fillStyle = `rgb(${bumpVal},${bumpVal},${bumpVal})`;
        bCtx.fillRect(x + gap / 2 + 1, y + gap / 2 + 1, w - 2, h - 2);
      }
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3.5, 3.5);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3.5, 3.5);

  cachedPaver = { map, bumpMap };
  return cachedPaver;
}

/**
 * Generates a tileable brushed concrete carport texture with expansion control joints.
 */
export function getBrushedConcreteTextures(): TexturePair {
  if (cachedConcrete) return cachedConcrete;

  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (cCtx && bCtx) {
    cCtx.fillStyle = '#D4D0C7';
    cCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = '#B8B8B8';
    bCtx.fillRect(0, 0, size, size);

    // Fine brushed concrete grain
    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 8) {
        const n = hash2d(x, y);
        const delta = Math.round((n - 0.5) * 14);
        const c = 210 + delta;
        cCtx.fillStyle = `rgb(${c + 2},${c},${c - 5})`;
        cCtx.fillRect(x, y, 8, 2);

        const bv = 175 + delta * 2;
        bCtx.fillStyle = `rgb(${bv},${bv},${bv})`;
        bCtx.fillRect(x, y, 8, 2);
      }
    }

    // Expansion control joints (grid at 256px)
    cCtx.fillStyle = '#9E9A91';
    bCtx.fillStyle = '#404040';
    for (const pos of [0, 256]) {
      cCtx.fillRect(pos, 0, 3, size);
      cCtx.fillRect(0, pos, size, 3);
      bCtx.fillRect(pos, 0, 3, size);
      bCtx.fillRect(0, pos, size, 3);
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);

  cachedConcrete = { map, bumpMap };
  return cachedConcrete;
}

/**
 * Generates dark charcoal stacked slate stone cladding ("batu alam susun sirih")
 * used on the SCB unit's right wing and accent masonry piers.
 */
export function getStackedSlateTextures(): TexturePair {
  if (cachedSlate) return cachedSlate;

  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (cCtx && bCtx) {
    // Deep recessed mortar / shadow groove base
    cCtx.fillStyle = '#1E2022';
    cCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = '#181818';
    bCtx.fillRect(0, 0, size, size);

    const courseH = 16;
    const rows = size / courseH;

    for (let r = 0; r < rows; r++) {
      const y = r * courseH;
      let x = -Math.round(hash2d(r, 1) * 48);
      while (x < size) {
        const stoneW = 56 + Math.round(hash2d(x + 7, r) * 64);
        const shade = hash2d(x, r * 3);
        const base = 46 + Math.round(shade * 26); // Charcoal slate range 46..72

        cCtx.fillStyle = `rgb(${base},${base + 2},${base + 4})`;
        cCtx.fillRect(x + 1, y + 1, stoneW - 2, courseH - 2);

        // Top split-face mineral highlight
        cCtx.fillStyle = `rgba(255,255,255,0.08)`;
        cCtx.fillRect(x + 1, y + 1, stoneW - 2, 2);

        const bumpHeight = 110 + Math.round(shade * 135);
        bCtx.fillStyle = `rgb(${bumpHeight},${bumpHeight},${bumpHeight})`;
        bCtx.fillRect(x + 1, y + 1, stoneW - 2, courseH - 2);

        x += stoneW;
      }
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2.5, 3.5);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2.5, 3.5);

  cachedSlate = { map, bumpMap };
  return cachedSlate;
}

/**
 * Generates a subtle architectural stucco plaster micro-relief bump map.
 */
export function getStuccoBumpTexture(): THREE.CanvasTexture {
  if (cachedStuccoBump) return cachedStuccoBump;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const n = hash2d(x, y);
        const v = 112 + Math.round(n * 32);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  cachedStuccoBump = tex;
  return tex;
}

/**
 * Generates botanical lawn grass turf albedo + bump textures.
 */
export function getGrassTurfTextures(): TexturePair {
  if (cachedGrass) return cachedGrass;

  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (cCtx && bCtx) {
    cCtx.fillStyle = '#6E8C4E';
    cCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = '#707070';
    bCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const n = hash2d(x * 1.3, y * 1.3);
        const r = 96 + Math.round(n * 28);
        const g = 128 + Math.round(n * 34);
        const b = 68 + Math.round(n * 20);
        cCtx.fillStyle = `rgb(${r},${g},${b})`;
        cCtx.fillRect(x, y, 2, 2);

        const bv = 80 + Math.round(n * 140);
        bCtx.fillStyle = `rgb(${bv},${bv},${bv})`;
        bCtx.fillRect(x, y, 2, 2);
      }
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3, 3);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 3);

  cachedGrass = { map, bumpMap };
  return cachedGrass;
}

/**
 * Generates a corrugated / standing-seam roof & canopy bump map.
 */
export function getRibbedRoofBumpTexture(): THREE.CanvasTexture {
  if (cachedRibbedBump) return cachedRibbedBump;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    for (let x = 0; x < size; x++) {
      const wave = Math.sin((x / 16) * Math.PI * 2);
      const v = Math.round(128 + wave * 90);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, 0, 1, size);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  cachedRibbedBump = tex;
  return tex;
}

/**
 * Generates dark walnut vertical wood-slat louver textures (used on Hisui's right gable alcove).
 */
export function getWoodLouverTextures(): TexturePair {
  if (cachedLouverTex) return cachedLouverTex;

  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  if (cCtx && bCtx) {
    const slatW = 16;
    for (let x = 0; x < size; x += slatW) {
      // Dark recess between slats
      cCtx.fillStyle = '#1B1512';
      cCtx.fillRect(x, 0, slatW, size);
      bCtx.fillStyle = '#202020';
      bCtx.fillRect(x, 0, slatW, size);

      // Raised walnut wood slat
      cCtx.fillStyle = '#3E2E24';
      cCtx.fillRect(x + 3, 0, slatW - 6, size);
      cCtx.fillStyle = '#4D392D';
      cCtx.fillRect(x + 4, 0, 3, size);

      bCtx.fillStyle = '#E0E0E0';
      bCtx.fillRect(x + 3, 0, slatW - 6, size);
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 1);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 1);

  cachedLouverTex = { map, bumpMap };
  return cachedLouverTex;
}
