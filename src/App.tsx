/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import {
  RotateCcw,
  RefreshCw,
  Info,
  X,
  Eye,
  Compass,
  Layers,
  Maximize2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  UNITS,
  UnitId,
  CameraAngleId,
  computePlotMetrics,
} from './data/units';
import {
  Language,
  EXACT_WORDMARK,
  EXACT_CONCEPT_BADGE,
  EXACT_REFERENCE_CAPTION,
  EXACT_FOOTER_DISCLAIMER,
  DICTIONARY,
} from './data/dictionary';

const PropertyViewer3D = React.lazy(
  () => import('./components/PropertyViewer3D')
);

const ANGLE_ORDER: CameraAngleId[] = [
  'front',
  'left',
  'right',
  'back',
  'aerial',
  'top',
];

export default function App() {
  const [lang, setLang] = useState<Language>('id');
  const [selectedUnitId, setSelectedUnitId] = useState<UnitId>('kohaku');
  const [activeAngle, setActiveAngle] = useState<CameraAngleId | null>('front');
  const [cameraTriggerCount, setCameraTriggerCount] = useState(0);
  const [cutawayMode, setCutawayMode] = useState(false);
  const [activeStorey, setActiveStorey] = useState<1 | 2>(1);
  const [autoRotate, setAutoRotate] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('nowebgl') === '1') return true;
    }
    return false;
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reducedMotion') === '1') return true;
      return (
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      );
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', listener);
    return () => mq.removeEventListener?.('change', listener);
  }, []);

  const t = DICTIONARY[lang];
  const selectedUnit =
    UNITS.find((u) => u.id === selectedUnitId) ?? UNITS[0];
  const plotMetrics = computePlotMetrics(selectedUnit);

  const handleSelectUnit = (unitId: UnitId) => {
    setSelectedUnitId(unitId);
    setActiveStorey(1);
  };

  const handleSelectAngle = (angle: CameraAngleId) => {
    setAutoRotate(false);
    setCutawayMode(angle === 'top');
    setActiveAngle(angle);
    setCameraTriggerCount((c) => c + 1);
  };

  const handleResetCamera = () => {
    setAutoRotate(false);
    setCutawayMode(false);
    setActiveStorey(1);
    setActiveAngle('front');
    setCameraTriggerCount((c) => c + 1);
  };

  const handleToggleAutoRotate = () => {
    setAutoRotate((prev) => {
      const next = !prev;
      if (next) setActiveAngle(null);
      return next;
    });
  };

  const getAngleLabel = (angle: CameraAngleId): string => {
    return t.angles[angle];
  };

  return (
    <div className="h-dvh w-screen overflow-hidden flex flex-col bg-[#EAE7DF] text-[#182238] select-none">
      {/* Top Bar */}
      <header className="shrink-0 z-30 bg-[#F8F7F4] border-b border-[#182238]/12 px-2.5 sm:px-6 h-14 flex items-center justify-between gap-1.5 sm:gap-6">
        {/* Zone 1: Plain-text wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            data-testid="brand-wordmark"
            className="text-sm sm:text-lg font-semibold tracking-tight text-[#182238] whitespace-nowrap shrink-0"
          >
            {EXACT_WORDMARK}
          </span>
          <span
            aria-hidden="true"
            className="hidden lg:inline text-[#182238]/30"
          >
            ·
          </span>
          <span className="hidden lg:inline text-xs text-[#475467] whitespace-nowrap">
            {t.header.locationTag}
          </span>
        </div>

        {/* Zone 2: Visible Not-to-Scale Concept Badge */}
        <div
          data-testid="concept-scale-badge"
          className="hidden md:flex items-center gap-2 text-xs font-medium text-[#6D3B34] whitespace-nowrap"
        >
          <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{EXACT_CONCEPT_BADGE}</span>
        </div>

        {/* Zone 3: About Popover Button + ID/EN Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAboutOpen((prev) => !prev)}
            aria-expanded={aboutOpen}
            aria-haspopup="dialog"
            data-testid="about-model-button"
            className="inline-flex items-center gap-1 min-h-[36px] px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold text-[#182238] bg-[#EFECE6] hover:bg-[#e3dfd6] border border-[#182238]/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{t.header.aboutModelBtn}</span>
          </button>

          <div
            role="group"
            aria-label={t.header.langLabel}
            className="inline-flex items-center bg-[#EFECE6] p-0.5 rounded-lg border border-[#182238]/12"
          >
            <button
              type="button"
              onClick={() => setLang('id')}
              aria-pressed={lang === 'id'}
              className={`min-h-[32px] px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'id'
                  ? 'bg-[#182238] text-white'
                  : 'text-[#475467] hover:text-[#182238]'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={`min-h-[32px] px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#182238] text-white'
                  : 'text-[#475467] hover:text-[#182238]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Viewport */}
      <main className="flex-1 relative overflow-hidden flex flex-col justify-between">
        {/* 3D Canvas or Graceful No-WebGL Fallback */}
        <div className="absolute inset-0 z-0">
          {webglUnavailable ? (
            <div
              data-testid="webgl-fallback"
              className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#EAE7DF] text-center"
            >
              <div className="max-w-md w-full bg-[#F8F7F4] border border-[#182238]/15 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-[#EFECE6] border border-[#182238]/10">
                  <img
                    src={selectedUnit.referencePhoto}
                    alt={`${t.info.referenceAltPrefix} ${selectedUnit.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-[#182238]">
                    {t.fallback.title} — {selectedUnit.name}
                  </h2>
                  <p className="text-xs text-[#475467] leading-relaxed">
                    {t.fallback.message}
                  </p>
                </div>
                <p className="text-[11px] text-[#6D3B34] font-medium">
                  {EXACT_REFERENCE_CAPTION}
                </p>
              </div>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-[#EAE7DF] text-xs font-medium text-[#475467]">
                  Memuat pratinjau 3D...
                </div>
              }
            >
              <PropertyViewer3D
                unit={selectedUnit}
                activeAngle={activeAngle}
                cameraTriggerCount={cameraTriggerCount}
                cutawayMode={cutawayMode}
                activeStorey={activeStorey}
                autoRotate={autoRotate}
                reducedMotion={reducedMotion}
                onUserOrbitStart={() => {
                  setActiveAngle(null);
                  setAutoRotate(false);
                }}
                onWebGLUnavailable={() => setWebglUnavailable(true)}
              />
            </Suspense>
          )}
        </div>

        {/* Mobile Top Concept Badge Bar */}
        <div className="relative z-10 px-3 pt-2.5 flex items-center justify-between gap-2 pointer-events-none md:hidden">
          <div className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8F7F4]/95 border border-[#182238]/15 text-[11px] font-medium text-[#6D3B34]">
            <Compass className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>{EXACT_CONCEPT_BADGE}</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileInfoOpen((prev) => !prev)}
            aria-expanded={mobileInfoOpen}
            data-testid="mobile-info-toggle"
            className="pointer-events-auto inline-flex items-center gap-1 min-h-[36px] px-3 py-1 rounded-md bg-[#182238] text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              {selectedUnit.name} · LT {selectedUnit.landArea}
            </span>
            {mobileInfoOpen ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop Slim Side Info Panel + Mobile Collapsible Info Drawer */}
        <aside
          aria-label={t.info.panelTitle}
          data-testid="unit-info-panel"
          className={`relative z-20 mx-3 mt-2 md:mt-0 md:mx-0 md:absolute md:top-4 md:left-5 md:w-72 bg-[#F8F7F4] border border-[#182238]/15 rounded-xl p-4 shadow-sm transition-all ${
            mobileInfoOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="space-y-3">
            {/* Unit Name & Storey Assumption */}
            <div className="flex items-baseline justify-between gap-2 border-b border-[#182238]/10 pb-2.5">
              <div>
                <p className="text-[11px] font-medium text-[#475467]">
                  {t.info.panelTitle}
                </p>
                <h1
                  data-testid="selected-unit-heading"
                  className="text-2xl font-semibold tracking-tight text-[#182238]"
                >
                  {selectedUnit.name}
                </h1>
              </div>
              <span className="text-xs font-tabular font-medium text-[#6D3B34]">
                {selectedUnit.assumedStoreys} {t.info.storeyUnit}
              </span>
            </div>

            {/* Key Brief Metrics */}
            <dl className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#EFECE6]/75">
                <dt className="text-[#475467] text-[11px]">{t.info.landArea}</dt>
                <dd
                  data-testid="spec-lt"
                  className="font-tabular font-semibold text-sm text-[#182238] mt-0.5"
                >
                  {selectedUnit.landArea} m²
                </dd>
              </div>
              <div className="p-2.5 rounded-lg bg-[#EFECE6]/75">
                <dt className="text-[#475467] text-[11px]">
                  {t.info.buildingArea}
                </dt>
                <dd
                  data-testid="spec-lb"
                  className="font-tabular font-semibold text-sm text-[#182238] mt-0.5"
                >
                  {selectedUnit.buildingArea} m²
                </dd>
              </div>
            </dl>

            <div className="space-y-1.5 text-xs pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[#475467] shrink-0">{t.info.rooms}:</span>
                <span
                  data-testid="spec-rooms"
                  className="font-medium text-[#182238] text-right"
                >
                  {lang === 'id' ? selectedUnit.roomsId : selectedUnit.roomsEn}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px] text-[#475467]">
                <span>{t.info.footprintCalc}:</span>
                <span className="font-tabular font-medium text-[#182238]">
                  {plotMetrics.footprintArea} m²
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px] text-[#475467]">
                <span>{t.info.plotCalc}:</span>
                <span className="font-tabular font-medium text-[#182238]">
                  {plotMetrics.plotWidth} m × {plotMetrics.plotDepth} m
                </span>
              </div>
            </div>

            {cutawayMode && (
              <div className="p-2 rounded-lg bg-[#6D3B34]/10 border border-[#6D3B34]/20 text-[11px] font-medium text-[#6D3B34] leading-snug">
                {t.info.interiorConceptBadge}
              </div>
            )}

            {/* Reference Facade Thumbnail from Developer Site */}
            <div className="pt-2.5 border-t border-[#182238]/10 space-y-1.5">
              <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-[#EFECE6] border border-[#182238]/10">
                <img
                  src={selectedUnit.referencePhoto}
                  alt={`${t.info.referenceAltPrefix} ${selectedUnit.name}`}
                  width={360}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>
              <p
                data-testid="reference-photo-caption"
                className="text-[11px] text-[#475467] leading-tight"
              >
                {t.info.referenceCaption}
              </p>
            </div>
          </div>
        </aside>

        {/* Bottom Sheet / Unified Control Bar */}
        <section
          aria-label="3D Viewer Controls"
          className="relative z-20 mt-auto mx-auto w-full max-w-4xl px-2.5 pb-2 sm:px-6 sm:pb-3"
        >
          <div className="bg-[#F8F7F4] border border-[#182238]/15 rounded-xl p-2.5 sm:p-3.5 shadow-md space-y-2.5">
            {/* Row 1: Unit Picker (4 types) + Inside Preview (3D) + Reset & Auto-Rotate */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div
                role="group"
                aria-label={t.picker.label}
                className="grid grid-cols-4 sm:flex items-center gap-1.5 w-full sm:w-auto"
              >
                {UNITS.map((u) => {
                  const active = u.id === selectedUnitId;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUnit(u.id)}
                      aria-pressed={active}
                      data-testid={`pick-unit-${u.id}`}
                      className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex flex-col sm:flex-row items-center justify-center sm:gap-1.5 whitespace-nowrap shrink-0 cursor-pointer border ${
                        active
                          ? 'bg-[#182238] text-white border-[#182238]'
                          : 'bg-[#EFECE6] text-[#182238] border-[#182238]/12 hover:bg-[#e3dfd6]'
                      }`}
                    >
                      <span>{u.name}</span>
                      <span
                        className={`text-[10px] font-tabular ${
                          active ? 'text-white/80' : 'text-[#475467]'
                        }`}
                      >
                        {u.landArea}/{u.buildingArea}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Floor Switcher (SCB Inside Preview), Reset & Auto-Rotate */}
              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
                {cutawayMode && selectedUnit.assumedStoreys === 2 && (
                  <div
                    role="group"
                    aria-label="Pilih Lantai"
                    className="inline-flex items-center bg-[#EFECE6] p-0.5 rounded-lg border border-[#182238]/15"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveStorey(1)}
                      aria-pressed={activeStorey === 1}
                      data-testid="floor-btn-1"
                      className={`min-h-[38px] px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        activeStorey === 1
                          ? 'bg-[#182238] text-white'
                          : 'text-[#475467] hover:text-[#182238]'
                      }`}
                    >
                      {t.angles.floor1}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStorey(2)}
                      aria-pressed={activeStorey === 2}
                      data-testid="floor-btn-2"
                      className={`min-h-[38px] px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        activeStorey === 2
                          ? 'bg-[#182238] text-white'
                          : 'text-[#475467] hover:text-[#182238]'
                      }`}
                    >
                      {t.angles.floor2}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResetCamera}
                  data-testid="reset-camera-btn"
                  className="min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold text-[#182238] bg-[#EFECE6] hover:bg-[#e3dfd6] border border-[#182238]/12 inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer flex-1 sm:flex-initial"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{t.angles.reset}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleAutoRotate}
                  aria-pressed={autoRotate}
                  data-testid="autorotate-btn"
                  className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold border inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors flex-1 sm:flex-initial ${
                    autoRotate
                      ? 'bg-[#6D3B34] text-white border-[#6D3B34]'
                      : 'bg-[#EFECE6] text-[#182238] border-[#182238]/12 hover:bg-[#e3dfd6]'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    {autoRotate
                      ? t.angles.autoRotateOn
                      : t.angles.autoRotateOff}
                  </span>
                </button>
              </div>
            </div>

            {/* Row 2: Six Camera Angle Preset Buttons */}
            <div className="pt-2 border-t border-[#182238]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div
                role="group"
                aria-label={t.angles.groupLabel}
                className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 w-full"
              >
                {ANGLE_ORDER.map((angleId) => {
                  const isActive = activeAngle === angleId;
                  return (
                    <button
                      key={angleId}
                      type="button"
                      onClick={() => handleSelectAngle(angleId)}
                      aria-pressed={isActive}
                      data-testid={`angle-btn-${angleId}`}
                      className={`min-h-[44px] px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer border ${
                        isActive
                          ? 'bg-[#182238] text-white border-[#182238]'
                          : 'bg-white text-[#182238] border-[#182238]/15 hover:bg-[#EFECE6]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{getAngleLabel(angleId)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* "About this model" Popover / Modal */}
      {aboutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-model-title"
          data-testid="about-model-popover"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182238]/55"
        >
          <div className="bg-[#F8F7F4] border border-[#182238]/20 rounded-xl max-w-lg w-full max-h-[88vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#182238]/10 pb-3">
              <div>
                <p className="text-xs font-medium text-[#6D3B34]">
                  {EXACT_CONCEPT_BADGE}
                </p>
                <h2
                  id="about-model-title"
                  className="text-xl font-semibold text-[#182238] mt-0.5"
                >
                  {t.aboutPopover.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setAboutOpen(false)}
                aria-label={t.aboutPopover.closeBtn}
                data-testid="close-about-popover"
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#EFECE6] hover:bg-[#e2ddd2] text-xs font-semibold text-[#182238] inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                <span>{t.aboutPopover.closeBtn}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#475467] leading-relaxed">
              {t.aboutPopover.subtitle}
            </p>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6D3B34]">
                {t.aboutPopover.assumptionsHeading}
              </h3>
              <ul className="space-y-2 text-xs text-[#182238] leading-relaxed">
                {t.aboutPopover.assumptions.map((item) => (
                  <li
                    key={item}
                    className="p-2.5 rounded-lg bg-white border border-[#182238]/10"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[11px] text-[#475467] border-t border-[#182238]/10 pt-3">
              {t.aboutPopover.sourceNote}
            </p>
          </div>
        </div>
      )}

      {/* Mandatory Exact Footer */}
      <footer className="shrink-0 z-30 bg-[#182238] text-white px-4 py-2.5 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] sm:text-xs">
          <span className="font-semibold text-white/90">{EXACT_WORDMARK}</span>
          <p
            data-testid="footer-disclaimer"
            className="text-white/90 text-center sm:text-right"
          >
            {EXACT_FOOTER_DISCLAIMER}
          </p>
        </div>
      </footer>
    </div>
  );
}
