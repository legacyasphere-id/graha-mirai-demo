import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  UnitData,
  CameraAngleId,
  CAMERA_PRESETS,
} from '../data/units';
import {
  buildStylizedHouseModel,
  createContactShadowTexture,
} from '../utils/houseBuilder';

export interface PropertyViewer3DProps {
  unit: UnitData;
  activeAngle: CameraAngleId | null;
  cameraTriggerCount: number;
  cutawayMode: boolean;
  activeStorey: 1 | 2;
  autoRotate: boolean;
  reducedMotion: boolean;
  onUserOrbitStart: () => void;
  onWebGLUnavailable: () => void;
}

// Reusable module-scope math objects (zero GC in render tick)
const _camPos = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _sphericalOffset = new THREE.Vector3();

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function PropertyViewer3D({
  unit,
  activeAngle,
  cameraTriggerCount,
  cutawayMode,
  activeStorey,
  autoRotate,
  reducedMotion,
  onUserOrbitStart,
  onWebGLUnavailable,
}: PropertyViewer3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onUserOrbitStartRef = useRef(onUserOrbitStart);
  onUserOrbitStartRef.current = onUserOrbitStart;
  const onWebGLUnavailableRef = useRef(onWebGLUnavailable);
  onWebGLUnavailableRef.current = onWebGLUnavailable;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  // Store Three.js handles in a ref so state changes never tear down the WebGL context
  const sceneHandlesRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    houseRoot: THREE.Group;
    requestRender: () => void;
    startCameraTransition: (angleId: CameraAngleId, instant: boolean) => void;
    startUnitTransition: (
      newUnit: UnitData,
      isCutaway: boolean,
      storey: 1 | 2,
      instant: boolean
    ) => void;
    setAutoRotate: (enabled: boolean) => void;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Probe WebGL availability and software WebGL (SwiftShader / llvmpipe)
    let isSoftwareGl = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl =
        probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) {
        onWebGLUnavailableRef.current();
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(
        gpu
      );
    } catch {
      onWebGLUnavailableRef.current();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      onWebGLUnavailableRef.current();
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = false; // Use contact shadow as mandated by performance rules

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.setAttribute('data-testid', 'three-canvas');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Scene, Fog & Studio Environment Map
    const scene = new THREE.Scene();
    const skyBgColor = new THREE.Color('#EAE7DF');
    scene.background = skyBgColor;
    scene.fog = new THREE.FogExp2('#EAE7DF', 0.018);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    pmremGenerator.dispose();

    // 3. Camera & OrbitControls (strictly clamped above ground)
    const getResponsiveFov = (w: number, h: number) => {
      const aspect = w / h;
      return aspect < 1 ? Math.min(64, Math.round(42 / Math.max(aspect, 0.52))) : 42;
    };
    const camera = new THREE.PerspectiveCamera(
      getResponsiveFov(width, height),
      width / height,
      0.5,
      120
    );
    const initialPreset = CAMERA_PRESETS.front;
    camera.position.set(...initialPreset.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...initialPreset.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 7.5;
    controls.maxDistance = 28;
    // Prevent camera from ever going below ground (polar angle < 88 deg)
    controls.minPolarAngle = 0.01;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.2;
    controls.update();

    // 4. Three-Point Warm/Cool Studio Lighting
    const hemiLight = new THREE.HemisphereLight('#F8FAFC', '#C8C2B4', 0.85);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF7EA', 1.45);
    keyLight.position.set(14, 22, 16);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#DCE8F5', 0.55);
    fillLight.position.set(-14, 12, -10);
    scene.add(fillLight);

    // 5. Ground Plane, Subtle Architectural Grid Ring & Contact Shadow
    const groundGeo = new THREE.CircleGeometry(42, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#E5E1D8',
      roughness: 0.95,
      metalness: 0.0,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.01;
    scene.add(groundMesh);

    const contactShadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(13.5, 16.5),
      new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    scene.add(shadowPlane);

    // 6. House Container Group
    const houseRoot = new THREE.Group();
    scene.add(houseRoot);

    const initialModel = buildStylizedHouseModel(unit, cutawayMode, activeStorey);
    houseRoot.add(initialModel);

    // 7. Camera & Model Transition State
    const camAnim = {
      active: false,
      startTime: 0,
      duration: 800,
      fromPos: new THREE.Vector3(),
      toPos: new THREE.Vector3(),
      fromTarget: new THREE.Vector3(),
      toTarget: new THREE.Vector3(),
    };

    const unitAnim = {
      active: false,
      startTime: 0,
      duration: 420,
    };

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let isDisposed = false;

    function updateContainerTelemetry() {
      if (!container) return;
      _sphericalOffset.copy(camera.position).sub(controls.target);
      const radius = _sphericalOffset.length();
      const polarRad = radius > 0 ? Math.acos(THREE.MathUtils.clamp(_sphericalOffset.y / radius, -1, 1)) : 0;
      const polarDeg = Math.round(THREE.MathUtils.radToDeg(polarRad));
      container.setAttribute(
        'data-camera-pos',
        `${camera.position.x.toFixed(1)},${camera.position.y.toFixed(1)},${camera.position.z.toFixed(1)}`
      );
      container.setAttribute('data-camera-polar-deg', String(polarDeg));
      container.setAttribute('data-camera-above-ground', String(camera.position.y > 0.2));
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function requestRender() {
      if (isDisposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (isDisposed) return;
        renderDirty = false;

        let needsMoreFrames = false;

        // Advance scripted camera angle transition
        if (camAnim.active) {
          const elapsed = now - camAnim.startTime;
          const rawT = Math.min(1, elapsed / camAnim.duration);
          const easedT = easeInOutCubic(rawT);

          _camPos.lerpVectors(camAnim.fromPos, camAnim.toPos, easedT);
          _targetPos.lerpVectors(camAnim.fromTarget, camAnim.toTarget, easedT);

          camera.position.copy(_camPos);
          controls.target.copy(_targetPos);
          controls.update();

          if (rawT >= 1) {
            camAnim.active = false;
          } else {
            needsMoreFrames = true;
          }
        } else {
          const updated = controls.update();
          if (controls.autoRotate || updated) {
            needsMoreFrames = controls.autoRotate;
          }
        }

        // Advance unit switch scale/elevation transition
        if (unitAnim.active) {
          const elapsed = now - unitAnim.startTime;
          const rawT = Math.min(1, elapsed / unitAnim.duration);
          const easedT = easeInOutCubic(rawT);
          const scale = 0.88 + 0.12 * easedT;
          houseRoot.scale.set(scale, scale, scale);
          houseRoot.position.y = (1 - easedT) * -0.25;
          if (rawT >= 1) {
            houseRoot.scale.set(1, 1, 1);
            houseRoot.position.y = 0;
            unitAnim.active = false;
          } else {
            needsMoreFrames = true;
          }
        }

        // Safety clamp: ensure camera Y never drops below ground
        if (camera.position.y < 0.35) {
          camera.position.y = 0.35;
        }

        renderer.render(scene, camera);
        updateContainerTelemetry();

        const done = () => {
          renderBusy = false;
          if (renderDirty || needsMoreFrames) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    const handleControlStart = () => {
      camAnim.active = false;
      onUserOrbitStartRef.current();
    };
    const handleControlChange = () => {
      requestRender();
    };

    controls.addEventListener('start', handleControlStart);
    controls.addEventListener('change', handleControlChange);

    const handleResize = () => {
      if (!container || isDisposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.fov = getResponsiveFov(w, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    const startCameraTransition = (
      angleId: CameraAngleId,
      instant: boolean
    ) => {
      const preset = CAMERA_PRESETS[angleId];
      if (!preset) return;

      if (instant || isSoftwareGl) {
        camAnim.active = false;
        camera.position.set(...preset.position);
        controls.target.set(...preset.target);
        controls.update();
        requestRender();
      } else {
        camAnim.active = true;
        camAnim.startTime = performance.now();
        camAnim.duration = 800;
        camAnim.fromPos.copy(camera.position);
        camAnim.toPos.set(...preset.position);
        camAnim.fromTarget.copy(controls.target);
        camAnim.toTarget.set(...preset.target);
        requestRender();
      }
    };

    const startUnitTransition = (
      newUnit: UnitData,
      isCutaway: boolean,
      storey: 1 | 2,
      instant: boolean
    ) => {
      while (houseRoot.children.length > 0) {
        const child = houseRoot.children[0];
        houseRoot.remove(child);
      }
      const nextModel = buildStylizedHouseModel(newUnit, isCutaway, storey);
      houseRoot.add(nextModel);

      if (instant || isSoftwareGl) {
        unitAnim.active = false;
        houseRoot.scale.set(1, 1, 1);
        houseRoot.position.y = 0;
        requestRender();
      } else {
        unitAnim.active = true;
        unitAnim.startTime = performance.now();
        houseRoot.scale.set(0.88, 0.88, 0.88);
        houseRoot.position.y = -0.25;
        requestRender();
      }
    };

    const setAutoRotate = (enabled: boolean) => {
      controls.autoRotate = isSoftwareGl ? false : enabled;
      if (enabled) requestRender();
    };

    sceneHandlesRef.current = {
      scene,
      camera,
      renderer,
      controls,
      houseRoot,
      requestRender,
      startCameraTransition,
      startUnitTransition,
      setAutoRotate,
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', handleControlStart);
      controls.removeEventListener('change', handleControlChange);
      controls.dispose();
      renderer.dispose();
      sceneHandlesRef.current = null;
    };
  }, []);

  // Respond to unit, cutawayMode, or activeStorey change while preserving the current camera angle
  const isFirstUnitMount = useRef(true);
  useEffect(() => {
    if (isFirstUnitMount.current) {
      isFirstUnitMount.current = false;
      return;
    }
    sceneHandlesRef.current?.startUnitTransition(
      unit,
      cutawayMode,
      activeStorey,
      reducedMotionRef.current
    );
  }, [unit, cutawayMode, activeStorey]);

  // Respond to camera angle button clicks (including Reset to Front)
  const isFirstAngleMount = useRef(true);
  useEffect(() => {
    if (isFirstAngleMount.current) {
      isFirstAngleMount.current = false;
      return;
    }
    if (activeAngle) {
      sceneHandlesRef.current?.startCameraTransition(
        activeAngle,
        reducedMotionRef.current
      );
    }
  }, [activeAngle, cameraTriggerCount]);

  // Respond to auto-rotate toggle
  useEffect(() => {
    sceneHandlesRef.current?.setAutoRotate(autoRotate && !reducedMotion);
  }, [autoRotate, reducedMotion]);

  return (
    <div
      ref={mountRef}
      data-testid="viewer-3d-mount"
      data-active-unit={unit.id}
      data-active-angle={activeAngle || 'custom'}
      data-cutaway-mode={String(cutawayMode)}
      data-active-storey={String(activeStorey)}
      className="w-full h-full relative select-none"
    />
  );
}
