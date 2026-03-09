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

const iceShell = new THREE.MeshPhysicalMaterial({
  color: '#ddf6ff',
  transmission: 0.45,
  transparent: true,
  opacity: 0.82,
  roughness: 0.2,
  metalness: 0.02,
  ior: 1.28,
  thickness: 1.5,
  side: THREE.BackSide
});

const frostedIce = new THREE.MeshPhysicalMaterial({
  color: '#b9e7ff',
  roughness: 0.33,
  metalness: 0.06,
  clearcoat: 0.55,
  emissive: '#81d8ff',
  emissiveIntensity: 0.2
});

const deepIce = new THREE.MeshPhysicalMaterial({
  color: '#9bcfff',
  roughness: 0.28,
  metalness: 0.03,
  clearcoat: 0.65,
  emissive: '#66b7ff',
  emissiveIntensity: 0.15
});

export function SceneContents({
  sculptureRootRef,
  innerClusterRef,
  haloRingRef,
  accentLightRef
}: SceneContentsProps) {
  return (
    <>
      <color attach="background" args={['#edfaff']} />
      <fog attach="fog" args={['#edfaff', 4, 28]} />

      <ambientLight intensity={0.8} color="#ffffff" />
      <hemisphereLight intensity={1.4} color="#f8ffff" groundColor="#c6ecff" />
      <directionalLight position={[6, 8, 5]} intensity={1.9} color="#ffffff" />
      <spotLight position={[0, 5, 1]} angle={0.58} penumbra={1} intensity={20} color="#b8e9ff" />
      <pointLight position={[0, -3, 0]} intensity={5.5} color="#8ae4ff" distance={18} />
      <directionalLight ref={accentLightRef} position={[-2, -2.8, 1]} intensity={1.8} color="#7be6ff" />

      <Sparkles size={2} count={180} speed={0.25} scale={[16, 11, 16]} color="#bceeff" />

      <group ref={sculptureRootRef}>
        <mesh position={[0, 1.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 7.5, 100]} />
          <meshPhysicalMaterial color="#ecfbff" roughness={0.32} metalness={0.01} />
        </mesh>

        <group ref={haloRingRef} position={[0, 1.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={frostedIce}>
            <torusGeometry args={[1.48, 0.12, 32, 160]} />
          </mesh>
          <mesh scale={1.11} material={deepIce}>
            <torusGeometry args={[1.48, 0.03, 20, 120]} />
          </mesh>
        </group>

        <mesh position={[0, -0.1, 0]} material={deepIce}>
          <cylinderGeometry args={[1.25, 1.6, 2.8, 42, 1, true]} />
        </mesh>

        <group ref={innerClusterRef} position={[0, -3.2, 0]}>
          <mesh material={iceShell}>
            <sphereGeometry args={[4.2, 50, 50]} />
          </mesh>

          <Float speed={0.55} rotationIntensity={0.08} floatIntensity={0.22}>
            <mesh position={[0, 0.4, 0]} material={frostedIce}>
              <dodecahedronGeometry args={[0.7, 1]} />
            </mesh>
          </Float>

          <mesh position={[1.2, -0.9, 0.8]} rotation={[0.2, 0.4, 0]} material={deepIce}>
            <coneGeometry args={[0.35, 1.7, 7]} />
          </mesh>
          <mesh position={[-1.45, -1, -0.4]} rotation={[-0.3, -0.25, 0.18]} material={frostedIce}>
            <coneGeometry args={[0.32, 1.5, 7]} />
          </mesh>
          <mesh position={[0.55, -1.3, -1.25]} rotation={[-0.2, 0.2, 0.1]} material={deepIce}>
            <coneGeometry args={[0.26, 1.1, 7]} />
          </mesh>

          <Text
            position={[0, 0.1, -2.45]}
            rotation={[0, 0, 0]}
            fontSize={0.34}
            letterSpacing={0.05}
            color="#e9feff"
            anchorX="center"
            anchorY="middle"
          >
            ICE CHAMBER
          </Text>
        </group>
      </group>
    </>
  );
}
