'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { CameraRig } from '@/components/CameraRig';
import { SceneContents } from '@/components/SceneContents';
import { gamePlanets } from '@/lib/sceneConfig';

gsap.registerPlugin(ScrollTrigger);

type ViewMode = 'home' | 'browse' | 'entry';

export function ScrollScene() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sculptureRoot = useRef<THREE.Group | null>(null);
  const innerCluster = useRef<THREE.Group | null>(null);
  const haloRing = useRef<THREE.Group | null>(null);
  const accentLight = useRef<THREE.DirectionalLight | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const focusTarget = useRef(new THREE.Vector3(0, 0, 0));
  const lastScrollIndex = useRef(0);

  const [mode, setMode] = useState<ViewMode>('home');
  const [activePlanetIndex, setActivePlanetIndex] = useState(0);

  const cameraState = useMemo(
    () => ({
      x: 0,
      y: 0.25,
      z: 10.6,
      tx: 0,
      ty: 0,
      tz: 0
    }),
    []
  );

  const updateCamera = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(cameraState.x, cameraState.y, cameraState.z);
    focusTarget.current.set(cameraState.tx, cameraState.ty, cameraState.tz);
  };

  const flyToPlanet = (index: number) => {
    const planet = gamePlanets[index];
    if (!planet) return;

    gsap.to(cameraState, {
      x: planet.position[0] + planet.radius * 1.9,
      y: planet.position[1] + 0.55,
      z: planet.position[2] + planet.radius * 2.9,
      tx: planet.position[0],
      ty: planet.position[1],
      tz: planet.position[2],
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: updateCamera
    });

    gsap.to(accentLight.current ?? {}, {
      intensity: 2 + index * 0.22,
      duration: 0.9,
      ease: 'sine.inOut'
    });
  };

  useEffect(() => {
    document.body.style.overflow = mode === 'home' ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mode]);

  useEffect(() => {
    if (!rootRef.current) return;

    updateCamera();

    const orbitTimeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } });
    orbitTimeline.to(sculptureRoot.current?.rotation ?? {}, { y: Math.PI * 0.2, duration: 5 }, 0);
    orbitTimeline.to(haloRing.current?.rotation ?? {}, { z: Math.PI * 0.5, duration: 5 }, 0);
    orbitTimeline.to(innerCluster.current?.position ?? {}, { y: 0.46, duration: 3.8 }, 0.4);

    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: 'top top',
      end: `+=${gamePlanets.length * 900}`,
      scrub: 0.5,
      onUpdate: (self) => {
        if (mode !== 'browse') return;
        const maxIndex = gamePlanets.length - 1;
        const nextIndex = Math.round(self.progress * maxIndex);
        if (nextIndex === lastScrollIndex.current) return;
        lastScrollIndex.current = nextIndex;
        setActivePlanetIndex(nextIndex);
        flyToPlanet(nextIndex);
      }
    });

    return () => {
      trigger.kill();
      orbitTimeline.kill();
    };
  }, [cameraState, mode]);

  const activePlanet = gamePlanets[activePlanetIndex];

  const handleGamesClick = () => {
    if (mode !== 'home') return;
    setMode('browse');
    setActivePlanetIndex(0);
    lastScrollIndex.current = 0;
    window.scrollTo({ top: 0, behavior: 'auto' });
    flyToPlanet(0);
    ScrollTrigger.refresh();
  };

  const handlePlanetClick = (id: string) => {
    const clickedIndex = gamePlanets.findIndex((planet) => planet.id === id);
    if (clickedIndex < 0) return;

    if (mode === 'browse' && clickedIndex === activePlanetIndex) {
      const target = gamePlanets[clickedIndex];
      setMode('entry');
      gsap.to(cameraState, {
        x: target.position[0] + target.radius * 0.55,
        y: target.position[1] + 0.18,
        z: target.position[2] + target.radius * 1,
        tx: target.position[0],
        ty: target.position[1],
        tz: target.position[2],
        duration: 1.25,
        ease: 'power2.inOut',
        onUpdate: updateCamera
      });
      return;
    }

    if (mode === 'browse') {
      setActivePlanetIndex(clickedIndex);
      lastScrollIndex.current = clickedIndex;
      flyToPlanet(clickedIndex);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`scene-scroll-shell mode-${mode}`}
      style={{ height: mode === 'home' ? '100vh' : `${Math.max(5, gamePlanets.length + 2) * 100}vh` }}
    >
      <div className="scene-pin-wrap">
        <Canvas className="scene-canvas" camera={{ position: [0, 0.25, 10.6], fov: 43 }} dpr={[1, 2]}>
          <CameraRig cameraRef={cameraRef} focusTargetRef={focusTarget} />
          <SceneContents
            sculptureRootRef={sculptureRoot}
            innerClusterRef={innerCluster}
            haloRingRef={haloRing}
            accentLightRef={accentLight}
            isBrowseMode={mode !== 'home'}
            activePlanetId={activePlanet.id}
            onPlanetClick={handlePlanetClick}
          />
        </Canvas>

        <div className="space-ui" aria-label="Space navigation controls">
          <button type="button" className="games-button" onClick={handleGamesClick}>
            {mode === 'home' ? 'Games' : 'Games Mode Active'}
          </button>
          <div className="planet-status">
            <p>{mode === 'home' ? 'Home: Deblocked planet' : `Active planet: ${activePlanet.label}`}</p>
            <p>
              {mode === 'entry'
                ? 'Entering planet experience...'
                : mode === 'home'
                  ? 'Scroll locked. Click Games to explore planets.'
                  : 'Scroll to move between planets, click active planet to enter.'}
            </p>
          </div>
        </div>
      </div>

      <section className={`game-embed-shell ${mode === 'entry' ? 'game-embed-shell--open' : ''}`}>
        <div className="game-embed-card">
          <h2>{activePlanet.label}</h2>
          <p>Embedded game area placeholder. This panel expands when a selected planet is entered.</p>
        </div>
      </section>
    </div>
  );
}
