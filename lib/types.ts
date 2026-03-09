import type React from 'react';
import type * as THREE from 'three';

export type NarrativeSection = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
};

export type SceneRefs = {
  sculptureRoot: React.MutableRefObject<THREE.Group | null>;
  innerCluster: React.MutableRefObject<THREE.Group | null>;
  haloRing: React.MutableRefObject<THREE.Group | null>;
  accentLight: React.MutableRefObject<THREE.DirectionalLight | null>;
  camera: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  focusTarget: React.MutableRefObject<THREE.Vector3>;
};

export type CameraKeyframe = {
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  at: number;
};
