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

  const [mode, setMode] = useState<ViewMode>('home');
  const [activePlanetIndex, setActivePlanetIndex] = useState(0);

  const cameraState = useMemo(
    () => ({
      x: 0,
      y: 0.3,
      z: 10.5,
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
      x: planet.position[0] + planet.radius * 1.8,
      y: planet.position[1] + 0.6,
      z: planet.position[2] + planet.radius * 2.6,
      tx: planet.position[0],
      ty: planet.position[1],
      tz: planet.position[2],
      duration: 1.15,
      ease: 'power3.inOut',
      onUpdate: updateCamera
    });

    gsap.to(accentLight.current ?? {}, {
      intensity: 1.8 + index * 0.25,
      duration: 0.8,
      ease: 'sine.inOut'
    });
  };

  useEffect(() => {
    if (!rootRef.current) return;

    updateCamera();

    const orbitTimeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } });
    orbitTimeline.to(sculptureRoot.current?.rotation ?? {}, { y: Math.PI * 0.15, duration: 4.2 }, 0);
    orbitTimeline.to(haloRing.current?.rotation ?? {}, { z: Math.PI * 0.35, duration: 4.2 }, 0);
    orbitTimeline.to(innerCluster.current?.position ?? {}, { y: 0.35, duration: 3.4 }, 0.5);

    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: 'top top',
      end: `+=${gamePlanets.length * 800}`,
      scrub: 0.6,
      onUpdate: (self) => {
        if (mode !== 'browse') return;
        const nextIndex = Math.min(gamePlanets.length - 1, Math.floor(self.progress * gamePlanets.length));
        setActivePlanetIndex((prev) => {
          if (prev === nextIndex) return prev;
          flyToPlanet(nextIndex);
          return nextIndex;
        });
      }
    });

    return () => {
      trigger.kill();
      orbitTimeline.kill();
    };
  }, [cameraState, mode]);

  const activePlanet = gamePlanets[activePlanetIndex];

  const handleGamesClick = () => {
    setMode('browse');
    setActivePlanetIndex(0);
    flyToPlanet(0);
  };

  const handlePlanetClick = (id: string) => {
    const clickedIndex = gamePlanets.findIndex((planet) => planet.id === id);
    if (clickedIndex < 0) return;

    if (mode === 'browse' && clickedIndex === activePlanetIndex) {
      const target = gamePlanets[clickedIndex];
      setMode('entry');
      gsap.to(cameraState, {
        x: target.position[0] + target.radius * 0.6,
        y: target.position[1] + 0.2,
        z: target.position[2] + target.radius * 1.1,
        tx: target.position[0],
        ty: target.position[1],
        tz: target.position[2],
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: updateCamera
      });
      return;
    }

    if (mode === 'browse') {
      setActivePlanetIndex(clickedIndex);
      flyToPlanet(clickedIndex);
    }
  };

  return (
    <div ref={rootRef} className={`scene-scroll-shell mode-${mode}`} style={{ height: '600vh' }}>
      <div className="scene-pin-wrap">
        <Canvas className="scene-canvas" camera={{ position: [0, 0.3, 10.5], fov: 43 }} dpr={[1, 1.7]}>
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
            Games
          </button>
          <div className="planet-status">
            <p>{mode === 'home' ? 'Home: Deblocked planet' : `Active planet: ${activePlanet.label}`}</p>
            <p>{mode === 'entry' ? 'Entering planet experience...' : 'Scroll to move between planets.'}</p>
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
