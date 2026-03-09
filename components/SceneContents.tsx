'use client';

import { Float, Sparkles, Stars, Text } from '@react-three/drei';
import type React from 'react';
import * as THREE from 'three';
import { gamePlanets } from '@/lib/sceneConfig';

type SceneContentsProps = {
  sculptureRootRef: React.MutableRefObject<THREE.Group | null>;
  innerClusterRef: React.MutableRefObject<THREE.Group | null>;
  haloRingRef: React.MutableRefObject<THREE.Group | null>;
  accentLightRef: React.MutableRefObject<THREE.DirectionalLight | null>;
  isBrowseMode: boolean;
  activePlanetId: string;
  onPlanetClick: (id: string) => void;
};

const deblockedPlanetMaterial = new THREE.MeshPhysicalMaterial({
  color: '#78eaff',
  roughness: 0.35,
  metalness: 0.08,
  clearcoat: 0.45,
  emissive: '#6f7dff',
  emissiveIntensity: 0.35
});

const ringMaterial = new THREE.MeshBasicMaterial({ color: '#87f6ff', transparent: true, opacity: 0.5 });

export function SceneContents({
  sculptureRootRef,
  innerClusterRef,
  haloRingRef,
  accentLightRef,
  isBrowseMode,
  activePlanetId,
  onPlanetClick
}: SceneContentsProps) {
  return (
    <>
      <color attach="background" args={['#03081a']} />
      <fog attach="fog" args={['#03081a', 24, 80]} />
      <ambientLight intensity={0.55} color="#d7ecff" />
      <hemisphereLight intensity={0.85} color="#d4eeff" groundColor="#101a3a" />
      <directionalLight position={[12, 8, 6]} intensity={1.5} color="#d2eeff" />
      <directionalLight ref={accentLightRef} position={[6, 1, 0]} intensity={2.2} color="#89dfff" />
      <pointLight position={[0, 0, 0]} intensity={1.7} color="#9084ff" />
      <Stars radius={120} depth={50} count={2200} factor={3.4} saturation={0} fade />
      <Sparkles size={2.5} count={180} speed={0.15} scale={[80, 40, 80]} color="#93e5ff" />

      <group ref={sculptureRootRef}>
        <Float speed={0.45} rotationIntensity={0.08} floatIntensity={0.15}>
          <mesh>
            <sphereGeometry args={[3.3, 80, 80]} />
            <primitive object={deblockedPlanetMaterial} attach="material" />
          </mesh>
        </Float>

        <group ref={haloRingRef} rotation={[Math.PI / 3.2, 0.2, 0]}>
          <mesh>
            <torusGeometry args={[3.95, 0.035, 20, 140]} />
            <primitive object={ringMaterial} attach="material" />
          </mesh>
        </group>

        {!isBrowseMode ? (
          <group ref={innerClusterRef} position={[0, 0.25, 3.25]}>
            <Text fontSize={0.62} letterSpacing={0.06} color="#d5f8ff" anchorX="center" anchorY="middle">
              Deblocked
            </Text>
            <Text
              position={[0, -0.03, -0.01]}
              fontSize={0.6}
              letterSpacing={0.06}
              color="#b69dff"
              anchorX="center"
              anchorY="middle"
            >
              Deblocked
            </Text>
          </group>
        ) : null}
      </group>

      {gamePlanets.map((planet) => {
        const isActive = activePlanetId === planet.id;

        return (
          <group key={planet.id} position={planet.position}>
            <mesh onPointerDown={(event) => {
              event.stopPropagation();
              onPlanetClick(planet.id);
            }}>
              <sphereGeometry args={[planet.radius, 48, 48]} />
              <meshStandardMaterial
                color={isActive ? planet.colorA : '#80a7d6'}
                emissive={isActive ? planet.colorB : '#2e3b63'}
                emissiveIntensity={isActive ? 0.75 : 0.2}
                roughness={0.4}
                metalness={0.1}
              />
            </mesh>
            {isActive ? (
              <Text position={[0, planet.radius + 0.46, 0]} fontSize={0.22} color="#d9f5ff" anchorX="center" anchorY="middle">
                {planet.label}
              </Text>
            ) : null}
          </group>
        );
      })}
    </>
  );
}
