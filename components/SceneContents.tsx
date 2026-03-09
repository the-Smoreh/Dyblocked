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
  color: '#ff6fd8',
  metalness: 0.88,
  roughness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  emissive: '#7a1e8f',
  emissiveIntensity: 0.36
});

const darkMetal = new THREE.MeshPhysicalMaterial({
  color: '#5067ff',
  metalness: 0.82,
  roughness: 0.23,
  clearcoat: 1,
  clearcoatRoughness: 0.14,
  emissive: '#13208d',
  emissiveIntensity: 0.24
});

const cyanMetal = new THREE.MeshPhysicalMaterial({
  color: '#39f0ff',
  metalness: 0.86,
  roughness: 0.2,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
  emissive: '#0b5979',
  emissiveIntensity: 0.22
});

export function SceneContents({
  sculptureRootRef,
  innerClusterRef,
  haloRingRef,
  accentLightRef
}: SceneContentsProps) {
  return (
    <>
      <color attach="background" args={['#eef7ff']} />
      <fog attach="fog" args={['#eef7ff', 8, 20]} />
      <ambientLight intensity={0.85} color="#ffffff" />
      <hemisphereLight intensity={1.2} color="#fff4ff" groundColor="#d8ecff" />
      <spotLight position={[0, 6, 4]} angle={0.48} penumbra={0.9} intensity={34} color="#ff9deb" />
      <directionalLight position={[4, 5, 6]} intensity={2.4} color="#8ca5ff" />
      <directionalLight ref={accentLightRef} position={[-3, 2.5, 5]} intensity={1.1} color="#5ce8ff" />
      <pointLight position={[0, -1.5, 2]} intensity={1.5} color="#ffb36b" />

      <Sparkles size={2.6} count={140} speed={0.28} scale={[10, 6, 8]} color="#8bd3ff" />

      <group ref={sculptureRootRef}>
        <Float speed={0.7} rotationIntensity={0.13} floatIntensity={0.35}>
          <mesh material={darkMetal}>
            <icosahedronGeometry args={[1.3, 1]} />
          </mesh>
        </Float>

        <group ref={innerClusterRef}>
          <mesh position={[0, 0.25, 0]} material={cyanMetal}>
            <octahedronGeometry args={[0.45, 0]} />
          </mesh>
          <mesh position={[0.74, -0.46, 0.34]} material={metal} scale={0.45}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
          <mesh position={[-0.75, -0.24, -0.33]} material={cyanMetal} scale={0.5}>
            <dodecahedronGeometry args={[1, 0]} />
          </mesh>
        </group>

        <group ref={haloRingRef} rotation={[Math.PI / 2.6, 0, 0]}>
          <mesh material={metal} scale={[1.9, 1.9, 0.1]}>
            <torusGeometry args={[1.2, 0.03, 20, 120]} />
          </mesh>
          <mesh material={cyanMetal} scale={[2.35, 2.35, 0.1]} rotation={[0, 0.4, 0]}>
            <torusGeometry args={[1.2, 0.018, 16, 100]} />
          </mesh>
        </group>

        <Text
          position={[0, -1.9, 0]}
          fontSize={0.24}
          letterSpacing={0.08}
          color="#3340a8"
          anchorX="center"
          anchorY="middle"
        >
          DYBLOCKED
        </Text>
      </group>
    </>
  );
}
