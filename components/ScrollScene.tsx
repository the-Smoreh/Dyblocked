'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { CameraRig } from '@/components/CameraRig';
import { SceneContents } from '@/components/SceneContents';
import { cameraKeyframes, timelineDurations } from '@/lib/animationConfig';
import { sections } from '@/lib/sceneConfig';

gsap.registerPlugin(ScrollTrigger);

export function ScrollScene() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sculptureRoot = useRef<THREE.Group | null>(null);
  const innerCluster = useRef<THREE.Group | null>(null);
  const haloRing = useRef<THREE.Group | null>(null);
  const accentLight = useRef<THREE.DirectionalLight | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const focusTarget = useRef(new THREE.Vector3(0, 0, 0));

  const cameraState = useMemo(
    () => ({
      x: cameraKeyframes[0].position[0],
      y: cameraKeyframes[0].position[1],
      z: cameraKeyframes[0].position[2],
      tx: cameraKeyframes[0].target[0],
      ty: cameraKeyframes[0].target[1],
      tz: cameraKeyframes[0].target[2]
    }),
    []
  );

  useEffect(() => {
    if (!rootRef.current) return;

    const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: timelineDurations.section } });

    cameraKeyframes.slice(1).forEach((frame) => {
      timeline.to(
        cameraState,
        {
          x: frame.position[0],
          y: frame.position[1],
          z: frame.position[2],
          tx: frame.target[0],
          ty: frame.target[1],
          tz: frame.target[2],
          onUpdate: () => {
            if (!cameraRef.current) return;
            cameraRef.current.position.set(cameraState.x, cameraState.y, cameraState.z);
            focusTarget.current.set(cameraState.tx, cameraState.ty, cameraState.tz);
          }
        },
        frame.at
      );
    });

    timeline.to(
      sculptureRoot.current?.rotation ?? {},
      { y: Math.PI * 1.7, x: Math.PI * 0.35, z: Math.PI * 0.12 },
      0
    );
    timeline.to(innerCluster.current?.rotation ?? {}, { x: Math.PI * 2.4, y: Math.PI * 1.4 }, 1);
    timeline.to(innerCluster.current?.position ?? {}, { y: -0.28 }, 1.7);
    timeline.to(haloRing.current?.rotation ?? {}, { z: Math.PI * 1.35, y: Math.PI * 0.45 }, 2);
    timeline.to(haloRing.current?.scale ?? {}, { x: 1.45, y: 1.45, z: 1 }, 2.3);
    timeline.to(accentLight.current ?? {}, { intensity: 1.4 }, 2.6);
    timeline.to(accentLight.current ?? {}, { intensity: 0.35 }, 3.8);

    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      animation: timeline
    });

    return () => {
      trigger.kill();
      timeline.kill();
    };
  }, [cameraState]);

  return (
    <div ref={rootRef} className="scene-scroll-shell" style={{ height: `calc(${sections.length} * 100vh)` }}>
      <div className="scene-pin-wrap">
        <Canvas className="scene-canvas" camera={{ position: [0, 0.6, 6.8], fov: 42 }} dpr={[1, 1.7]}>
          <CameraRig cameraRef={cameraRef} focusTargetRef={focusTarget} />
          <SceneContents
            sculptureRootRef={sculptureRoot}
            innerClusterRef={innerCluster}
            haloRingRef={haloRing}
            accentLightRef={accentLight}
          />
        </Canvas>
      </div>
    </div>
  );
}
