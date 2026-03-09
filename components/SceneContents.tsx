'use client';

import { Float, Sparkles, Stars, Text } from '@react-three/drei';
import type React from 'react';
import { useMemo } from 'react';
import * as THREE from 'three';
import { AdditiveBlending } from 'three';
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

const makePlanetTexture = (topColor: string, bottomColor: string, stripeColor: string) => {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(0.55, '#98deff');
  gradient.addColorStop(1, bottomColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 90; i += 1) {
    const y = Math.random() * size;
    const h = 8 + Math.random() * 36;
    ctx.globalAlpha = 0.09 + Math.random() * 0.12;
    ctx.fillStyle = stripeColor;
    ctx.fillRect(0, y, size, h);
  }

  for (let i = 0; i < 1400; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.6;
    ctx.globalAlpha = Math.random() * 0.18;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.2, 1.2);
  return texture;
};

const ringMaterial = new THREE.MeshBasicMaterial({ color: '#87f6ff', transparent: true, opacity: 0.58 });

export function SceneContents({
  sculptureRootRef,
  innerClusterRef,
  haloRingRef,
  accentLightRef,
  isBrowseMode,
  activePlanetId,
  onPlanetClick
}: SceneContentsProps) {
  const deblockedTexture = useMemo(() => makePlanetTexture('#6ef5ff', '#8f79ff', '#78cfff'), []);

  const planetTextures = useMemo(
    () =>
      gamePlanets.map((planet, index) =>
        makePlanetTexture(
          planet.colorA,
          planet.colorB,
          index % 2 === 0 ? '#a3f7ff' : '#8cc4ff'
        )
      ),
    []
  );

  return (
    <>
      <color attach="background" args={['#040a1f']} />
      <fog attach="fog" args={['#040a1f', 20, 92]} />
      <ambientLight intensity={0.75} color="#d6f7ff" />
      <hemisphereLight intensity={1.05} color="#ccefff" groundColor="#120f36" />
      <directionalLight position={[12, 9, 8]} intensity={2.1} color="#dbf2ff" />
      <directionalLight ref={accentLightRef} position={[6, 1, 0]} intensity={2.4} color="#8fddff" />
      <pointLight position={[0, 0, 0]} intensity={2.3} color="#9f8eff" distance={45} />
      <Stars radius={140} depth={70} count={4200} factor={4.6} saturation={0} fade />
      <Sparkles size={2.9} count={260} speed={0.22} scale={[90, 55, 90]} color="#a7ebff" />

      <group ref={sculptureRootRef}>
        <Float speed={0.48} rotationIntensity={0.09} floatIntensity={0.18}>
          <mesh>
            <sphereGeometry args={[3.3, 96, 96]} />
            <meshPhysicalMaterial
              map={deblockedTexture}
              roughness={0.28}
              metalness={0.08}
              clearcoat={0.58}
              emissive="#8f78ff"
              emissiveIntensity={0.35}
            />
          </mesh>
        </Float>

        <mesh scale={1.07}>
          <sphereGeometry args={[3.3, 70, 70]} />
          <meshBasicMaterial color="#77dfff" transparent opacity={0.22} blending={AdditiveBlending} side={THREE.BackSide} />
        </mesh>

        <group ref={haloRingRef} rotation={[Math.PI / 3.2, 0.2, 0]}>
          <mesh>
            <torusGeometry args={[3.95, 0.04, 24, 170]} />
            <primitive object={ringMaterial} attach="material" />
          </mesh>
        </group>

        {!isBrowseMode ? (
          <group ref={innerClusterRef} position={[0, 0.28, 3.52]}>
            <Text fontSize={0.7} letterSpacing={0.055} color="#e9fcff" anchorX="center" anchorY="middle">
              Deblocked
            </Text>
            <Text
              position={[0, -0.03, -0.02]}
              fontSize={0.68}
              letterSpacing={0.055}
              color="#bba8ff"
              anchorX="center"
              anchorY="middle"
            >
              Deblocked
            </Text>
          </group>
        ) : null}
      </group>

      {gamePlanets.map((planet, index) => {
        const isActive = activePlanetId === planet.id;

        return (
          <group key={planet.id} position={planet.position}>
            <mesh
              onPointerDown={(event) => {
                event.stopPropagation();
                onPlanetClick(planet.id);
              }}
            >
              <sphereGeometry args={[planet.radius, 64, 64]} />
              <meshStandardMaterial
                map={planetTextures[index]}
                color={isActive ? '#ffffff' : '#9cbce0'}
                emissive={isActive ? planet.colorB : '#2f3b61'}
                emissiveIntensity={isActive ? 0.82 : 0.24}
                roughness={0.36}
                metalness={0.11}
              />
            </mesh>
            <mesh scale={1.06}>
              <sphereGeometry args={[planet.radius, 48, 48]} />
              <meshBasicMaterial
                color={planet.colorA}
                transparent
                opacity={isActive ? 0.2 : 0.1}
                blending={AdditiveBlending}
                side={THREE.BackSide}
              />
            </mesh>
            {isActive ? (
              <Text position={[0, planet.radius + 0.48, 0]} fontSize={0.24} color="#d9f5ff" anchorX="center" anchorY="middle">
                {planet.label}
              </Text>
            ) : null}
          </group>
        );
      })}
    </>
  );
}
