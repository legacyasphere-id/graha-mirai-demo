/**
 * Graha Mirai 3D Property Preview — Unit Specifications
 * Source of truth: graha-mirai-asset-brief.md (Section 2: "Unit types (website, Nov 4, 2026)")
 * and graha-mirai-build-prompt.md ("Unit data").
 *
 * Every factual value below includes a source comment referencing the brief.
 * Assumed storeys and plot width-to-depth ratios are explicitly marked as assumptions
 * requiring project owner confirmation.
 */

export type UnitId = 'kohaku' | 'hisui' | 'luri' | 'scb';

export type CameraAngleId = 'front' | 'left' | 'right' | 'back' | 'aerial' | 'top';

export interface UnitData {
  id: UnitId;
  /** Unit name — Source: graha-mirai-asset-brief.md Section 2 */
  name: string;
  /** Land area (LT) in m2 — Source: graha-mirai-asset-brief.md Section 2 */
  landArea: number;
  /** Building area (LB) in m2 — Source: graha-mirai-asset-brief.md Section 2 */
  buildingArea: number;
  /** Bedroom count — Source: graha-mirai-asset-brief.md Section 2 */
  bedrooms: string;
  /** Bathroom count — Source: graha-mirai-asset-brief.md Section 2 */
  bathrooms: number;
  /** Carport count — Source: graha-mirai-asset-brief.md Section 2 */
  carports: number;
  /** Formatted rooms string (EN) — Source: graha-mirai-asset-brief.md Section 2 */
  roomsEn: string;
  /** Formatted rooms string (ID) — Source: graha-mirai-asset-brief.md Section 2 */
  roomsId: string;
  /**
   * Assumed number of storeys — Source: graha-mirai-build-prompt.md ("Assumed storeys").
   * Needs owner confirmation.
   */
  assumedStoreys: 1 | 2;
  /**
   * Assumed plot width in meters (plotDepth = landArea / assumedPlotWidth).
   * Needs owner confirmation once official site plan / floor plans are provided.
   */
  assumedPlotWidth: number;
  /**
   * Stylized roof silhouette used for procedural 3D representation.
   * Sampled from facade reference photography in public/assets/cms/unit-*.webp.
   */
  roofStyle: 'flat-parapet' | 'pitched-gable' | 'dual-parapet' | 'two-storey-box';
  /**
   * Neutral color palette sampled from the developer's facade reference photo.
   * Source: public/assets/cms/unit-*.webp (listed in graha-mirai-asset-brief.md Section 5).
   */
  palette: {
    primaryWall: string;
    secondaryWall: string;
    trim: string;
    roof: string;
    accent: string;
  };
  /**
   * Local path to facade reference thumbnail photo.
   * Source: graha-mirai-asset-brief.md Section 5 ("Image inventory") & CREDITS.md.
   */
  referencePhoto: string;
}

export const UNITS: UnitData[] = [
  {
    id: 'kohaku',
    name: 'Kohaku', // Source: Brief Section 2
    landArea: 55, // Source: Brief Section 2 (LT 55 m2)
    buildingArea: 31, // Source: Brief Section 2 (LB 31 m2)
    bedrooms: '2', // Source: Brief Section 2 (2 bedrooms)
    bathrooms: 1, // Source: Brief Section 2 (1 bathroom)
    carports: 1, // Source: Brief Section 2 (1 carport)
    roomsEn: '2 bedrooms, 1 bathroom, 1 carport', // Source: Brief Section 2
    roomsId: '2 kamar tidur, 1 kamar mandi, 1 carport', // Source: Brief Section 2
    assumedStoreys: 1, // Assumption (needs owner confirmation)
    assumedPlotWidth: 5.5, // Assumption: 5.5m x 10.0m = 55 m2 plot
    roofStyle: 'flat-parapet',
    palette: {
      primaryWall: '#F4F3EF',
      secondaryWall: '#EAE7E1',
      trim: '#4A4641',
      roof: '#D8D5CE',
      accent: '#23262A',
    },
    referencePhoto: '/assets/cms/unit-kohaku.webp', // Source: Brief Section 5
  },
  {
    id: 'hisui',
    name: 'Hisui', // Source: Brief Section 2
    landArea: 66, // Source: Brief Section 2 (LT 66 m2)
    buildingArea: 37, // Source: Brief Section 2 (LB 37 m2)
    bedrooms: '2', // Source: Brief Section 2 (2 bedrooms)
    bathrooms: 1, // Source: Brief Section 2 (1 bathroom)
    carports: 1, // Source: Brief Section 2 (1 carport)
    roomsEn: '2 bedrooms, 1 bathroom, 1 carport', // Source: Brief Section 2
    roomsId: '2 kamar tidur, 1 kamar mandi, 1 carport', // Source: Brief Section 2
    assumedStoreys: 1, // Assumption (needs owner confirmation)
    assumedPlotWidth: 6.0, // Assumption: 6.0m x 11.0m = 66 m2 plot
    roofStyle: 'pitched-gable',
    palette: {
      primaryWall: '#F6F5F0',
      secondaryWall: '#ECE9E2',
      trim: '#232528',
      roof: '#CFCBC2',
      accent: '#3E2E24',
    },
    referencePhoto: '/assets/cms/unit-hisui.webp', // Source: Brief Section 5
  },
  {
    id: 'luri',
    name: 'Luri', // Source: Brief Section 2
    landArea: 66, // Source: Brief Section 2 (LT 66 m2)
    buildingArea: 37, // Source: Brief Section 2 (LB 37 m2)
    bedrooms: '2', // Source: Brief Section 2 (2 bedrooms)
    bathrooms: 1, // Source: Brief Section 2 (1 bathroom)
    carports: 1, // Source: Brief Section 2 (1 carport)
    roomsEn: '2 bedrooms, 1 bathroom, 1 carport', // Source: Brief Section 2
    roomsId: '2 kamar tidur, 1 kamar mandi, 1 carport', // Source: Brief Section 2
    assumedStoreys: 1, // Assumption (needs owner confirmation)
    assumedPlotWidth: 6.0, // Assumption: 6.0m x 11.0m = 66 m2 plot
    roofStyle: 'dual-parapet',
    palette: {
      primaryWall: '#DFC09B',
      secondaryWall: '#7A4834',
      trim: '#F7F5F0',
      roof: '#C9B69E',
      accent: '#272524',
    },
    referencePhoto: '/assets/cms/unit-luri.webp', // Source: Brief Section 5
  },
  {
    id: 'scb',
    name: 'SCB', // Source: Brief Section 2 (SCB / Strong Concrete Block)
    landArea: 72, // Source: Brief Section 2 (LT 72 m2)
    buildingArea: 72, // Source: Brief Section 2 (LB 72 m2)
    bedrooms: '2+1', // Source: Brief Section 2 (2+1 bedrooms)
    bathrooms: 2, // Source: Brief Section 2 (2 bathrooms)
    carports: 1, // Source: Brief Section 2 (1 carport)
    roomsEn: '2+1 bedrooms, 2 bathrooms, 1 carport', // Source: Brief Section 2
    roomsId: '2+1 kamar tidur, 2 kamar mandi, 1 carport', // Source: Brief Section 2
    assumedStoreys: 2, // Assumption (needs owner confirmation)
    assumedPlotWidth: 6.0, // Assumption: 6.0m x 12.0m = 72 m2 plot
    roofStyle: 'two-storey-box',
    palette: {
      primaryWall: '#7D8285',
      secondaryWall: '#343638',
      trim: '#F4F4F2',
      roof: '#64686B',
      accent: '#222426',
    },
    referencePhoto: '/assets/cms/unit-scb.webp', // Source: Brief Section 5
  },
];

export interface ComputedPlotMetrics {
  plotWidth: number;
  plotDepth: number;
  footprintArea: number;
  buildingWidth: number;
  buildingDepth: number;
  frontYardDepth: number;
  rearYardDepth: number;
  carportWidth: number;
  carportDepth: number;
}

/**
 * Pure geometry proportion calculator derived from published LT, LB, and assumed storeys.
 * Building footprint = LB / assumedStoreys.
 * Because Graha Mirai is a zero-lot-line cluster housing development, buildingWidth spans
 * the full plotWidth (blind party walls on left and right, zero side windows).
 */
export function computePlotMetrics(unit: UnitData): ComputedPlotMetrics {
  const plotWidth = unit.assumedPlotWidth;
  const plotDepth = Number((unit.landArea / plotWidth).toFixed(2));
  const footprintArea = Number((unit.buildingArea / unit.assumedStoreys).toFixed(2));

  // Cluster zero-lot-line architecture: building spans full plot width (party walls on +-X)
  const buildingWidth = plotWidth;
  const rawBuildingDepth = footprintArea / buildingWidth;
  const maxBuildingDepth = plotDepth - 3.6;
  const buildingDepth = Number(Math.min(rawBuildingDepth, maxBuildingDepth).toFixed(2));

  const frontYardDepth = 3.2;
  const rearYardDepth = Number(Math.max(0.8, plotDepth - buildingDepth - frontYardDepth).toFixed(2));

  return {
    plotWidth,
    plotDepth,
    footprintArea,
    buildingWidth,
    buildingDepth,
    frontYardDepth,
    rearYardDepth,
    carportWidth: Number((plotWidth * 0.52).toFixed(2)),
    carportDepth: frontYardDepth,
  };
}

export interface CameraPreset {
  id: CameraAngleId;
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<CameraAngleId, CameraPreset> = {
  front: {
    id: 'front',
    position: [0, 3.6, 15.2],
    target: [0, 2.1, 0],
  },
  left: {
    id: 'left',
    position: [-15.2, 3.8, 0],
    target: [0, 2.1, 0],
  },
  right: {
    id: 'right',
    position: [15.2, 3.8, 0],
    target: [0, 2.1, 0],
  },
  back: {
    id: 'back',
    position: [0, 4.8, -15.2],
    target: [0, 2.2, 0],
  },
  aerial: {
    id: 'aerial',
    position: [10.8, 10.5, 11.8],
    target: [0, 1.8, 0],
  },
  top: {
    id: 'top',
    position: [5.4, 12.2, 7.2],
    target: [0, 0.9, -0.6],
  },
};
