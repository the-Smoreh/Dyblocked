'use client';

import { Float } from '@react-three/drei';
import type React from 'react';
import * as THREE from 'three';

type SceneContentsProps = {
  sculptureRootRef: React.MutableRefObject<THREE.Group | null>;
  innerClusterRef: React.MutableRefObject<THREE.Group | null>;
  haloRingRef: React.MutableRefObject<THREE.Group | null>;
  accentLightRef: React.MutableRefObject<THREE.DirectionalLight | null>;
};

const metal = new THREE.MeshStandardMaterial({ color: '#95a5b6', metalness: 0.72, roughness: 0.25 });
const darkMetal = new THREE.MeshStandardMaterial({ color: '#3a4252', metalness: 0.6, roughness: 0.32 });

export function SceneContents({
  sculptureRootRef,
  innerClusterRef,
  haloRingRef,
  accentLightRef
}: SceneContentsProps) {
  return (
    <>
      <color attach="background" args={['#040508']} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={1.3} color="#dce6ff" />
      <directionalLight ref={accentLightRef} position={[-2, 2, 4]} intensity={0.25} color="#99c0ff" />
      <pointLight position={[0, -2, 2]} intensity={0.4} color="#7aa6ff" />

      <group ref={sculptureRootRef}>
        <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.3}>
          <mesh material={darkMetal}>
            <icosahedronGeometry args={[1.25, 0]} />
          </mesh>
        </Float>

        <group ref={innerClusterRef}>
          <mesh position={[0, 0.2, 0]} material={metal}>
            <octahedronGeometry args={[0.45, 0]} />
          </mesh>
          <mesh position={[0.7, -0.45, 0.35]} material={metal} scale={0.45}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
          <mesh position={[-0.75, -0.25, -0.3]} material={metal} scale={0.5}>
            <dodecahedronGeometry args={[1, 0]} />
          </mesh>
        </group>

        <group ref={haloRingRef} rotation={[Math.PI / 2.6, 0, 0]}>
          <mesh material={metal} scale={[1.9, 1.9, 0.1]}>
            <torusGeometry args={[1.2, 0.03, 20, 120]} />
          </mesh>
          <mesh material={metal} scale={[2.3, 2.3, 0.1]} rotation={[0, 0.4, 0]}>
            <torusGeometry args={[1.2, 0.018, 16, 100]} />
          </mesh>
        </group>
      </group>
    </>
  );
}
