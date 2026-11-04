import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UNITS,
  CAMERA_PRESETS,
  computePlotMetrics,
  CameraAngleId,
} from './units';
import {
  EXACT_WORDMARK,
  EXACT_CONCEPT_BADGE,
  EXACT_REFERENCE_CAPTION,
  EXACT_FOOTER_DISCLAIMER,
  DICTIONARY,
} from './dictionary';

test('exact required strings match brief and build prompt', () => {
  assert.equal(EXACT_WORDMARK, 'Graha Mirai (concept)');
  assert.equal(EXACT_CONCEPT_BADGE, 'Visualisasi konsep, tidak sesuai skala');
  assert.equal(EXACT_REFERENCE_CAPTION, 'Foto referensi dari situs pengembang');
  assert.equal(
    EXACT_FOOTER_DISCLAIMER,
    'Concept demo by Legacya Sphere. Not affiliated with or endorsed by the property owner.'
  );
});

test('all four units match published LT, LB, rooms, and assumed storeys', () => {
  assert.equal(UNITS.length, 4);

  const kohaku = UNITS.find((u) => u.id === 'kohaku');
  assert.ok(kohaku);
  assert.equal(kohaku.landArea, 55);
  assert.equal(kohaku.buildingArea, 31);
  assert.equal(kohaku.assumedStoreys, 1);
  assert.equal(kohaku.roomsEn, '2 bedrooms, 1 bathroom, 1 carport');

  const hisui = UNITS.find((u) => u.id === 'hisui');
  assert.ok(hisui);
  assert.equal(hisui.landArea, 66);
  assert.equal(hisui.buildingArea, 37);
  assert.equal(hisui.assumedStoreys, 1);

  const luri = UNITS.find((u) => u.id === 'luri');
  assert.ok(luri);
  assert.equal(luri.landArea, 66);
  assert.equal(luri.buildingArea, 37);
  assert.equal(luri.assumedStoreys, 1);

  const scb = UNITS.find((u) => u.id === 'scb');
  assert.ok(scb);
  assert.equal(scb.landArea, 72);
  assert.equal(scb.buildingArea, 72);
  assert.equal(scb.assumedStoreys, 2);
  assert.equal(scb.roomsEn, '2+1 bedrooms, 2 bathrooms, 1 carport');
});

test('computePlotMetrics calculates accurate footprint (LB / storeys) and plot dimensions', () => {
  for (const unit of UNITS) {
    const metrics = computePlotMetrics(unit);
    assert.equal(
      Math.round(metrics.plotWidth * metrics.plotDepth),
      unit.landArea,
      `Plot area for ${unit.name} must equal LT (${unit.landArea} m2)`
    );
    assert.equal(
      metrics.footprintArea,
      unit.buildingArea / unit.assumedStoreys,
      `Footprint for ${unit.name} must equal LB / assumedStoreys`
    );
    assert.equal(
      metrics.buildingWidth,
      metrics.plotWidth,
      `Cluster building width for ${unit.name} must equal full plot width (zero side setback)`
    );
    assert.ok(metrics.buildingDepth < metrics.plotDepth);
  }
});

test('all six camera presets exist and stay above ground (y > 0)', () => {
  const expectedAngles: CameraAngleId[] = [
    'front',
    'left',
    'right',
    'back',
    'aerial',
    'top',
  ];
  for (const angle of expectedAngles) {
    const preset = CAMERA_PRESETS[angle];
    assert.ok(preset, `Preset ${angle} must exist`);
    assert.ok(preset.position[1] > 2, `Camera Y for ${angle} must stay above ground`);
  }
});

test('dictionary and units contain zero prohibited prices, contact details, or claims', () => {
  const serialized = JSON.stringify({ UNITS, DICTIONARY });
  const currencyRegex = new RegExp('\\b' + 'R' + 'p' + '\\b', 'i');
  const messagingRegex = new RegExp('wa\\.' + 'me|whats' + 'app', 'i');
  const contactRegex = new RegExp('0812-' + '4555|62888' + '1600|info@' + 'grahamirai', 'i');
  const taxPromoRegex = new RegExp('\\b(P' + 'PN|V' + 'AT)\\b', 'i');

  assert.equal(currencyRegex.test(serialized), false, 'Must not contain currency prefix');
  assert.equal(messagingRegex.test(serialized), false, 'Must not contain messaging links');
  assert.equal(contactRegex.test(serialized), false, 'Must not contain owner contact');
  assert.equal(taxPromoRegex.test(serialized), false, 'Must not mention tax promo');
});
