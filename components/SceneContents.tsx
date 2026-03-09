'use client';

import { Float, Sparkles, Text } from '@react-three/drei';
import type React from 'react';
import * as THREE from 'three';

type SceneContentsProps = {
  sculptureRootRef: React.MutableRefObject<THREE.Group | null>;
  innerClusterRef: React.MutableRefObject<THREE.Group | null>;
  haloRingRef: React.MutableRefObject<THREE.Group | null>;
  accentLightRef: React.MutableRefObject<THREE.DirectionalLight | null>;
};

const metal = new THREE.MeshPhysicalMaterial({
  color: '#9ebfff',
  metalness: 0.95,
  roughness: 0.18,
  clearcoat: 1,
  clearcoatRoughness: 0.15,
  emissive: '#1b2d63',
  emissiveIntensity: 0.3
});

const darkMetal = new THREE.MeshPhysicalMaterial({
  color: '#2f3a58',
  metalness: 0.85,
  roughness: 0.28,
  clearcoat: 1,
  clearcoatRoughness: 0.2
});

export function SceneContents({
  sculptureRootRef,
  innerClusterRef,
  haloRingRef,
  accentLightRef
}: SceneContentsProps) {
  return (
    <>
      <color attach="background" args={['#02030a']} />
      <fog attach="fog" args={['#02030a', 7, 17]} />
      <ambientLight intensity={0.22} />
      <hemisphereLight intensity={0.45} color="#cfdbff" groundColor="#0b1022" />
      <spotLight position={[0, 5, 4]} angle={0.42} penumbra={0.8} intensity={25} color="#a7beff" />
      <directionalLight position={[3, 4, 6]} intensity={1.8} color="#f3f7ff" />
      <directionalLight ref={accentLightRef} position={[-2.5, 2, 4]} intensity={0.45} color="#7bb4ff" />
      <pointLight position={[0, -2, 1]} intensity={0.8} color="#4f79ff" />

      <Sparkles size={2} count={90} speed={0.22} scale={[9, 5, 7]} color="#a9c7ff" />

      <group ref={sculptureRootRef}>
        <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.28}>
          <mesh material={darkMetal}>
            <icosahedronGeometry args={[1.25, 1]} />
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

        <Text
          position={[0, -1.85, 0]}
          fontSize={0.22}
          letterSpacing={0.07}
          color="#dbe6ff"
          anchorX="center"
          anchorY="middle"
        >
          DYBLOCKED
        </Text>
      </group>
    </>
  );
}
