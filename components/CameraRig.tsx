'use client';

import { useFrame, useThree } from '@react-three/fiber';
import type React from 'react';
import { useEffect } from 'react';
import * as THREE from 'three';

type CameraRigProps = {
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  focusTargetRef: React.MutableRefObject<THREE.Vector3>;
};

export function CameraRig({ cameraRef, focusTargetRef }: CameraRigProps) {
  const { camera } = useThree();

  useEffect(() => {
    cameraRef.current = camera as THREE.PerspectiveCamera;
  }, [camera, cameraRef]);

  useFrame(() => {
    if (!cameraRef.current) return;
    cameraRef.current.lookAt(focusTargetRef.current);
  });

  return null;
}
