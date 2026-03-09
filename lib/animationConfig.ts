import { CameraKeyframe } from '@/lib/types';

export const cameraKeyframes: CameraKeyframe[] = [
  { label: 'intro', position: [0, 0.6, 6.8], target: [0, 0, 0], at: 0 },
  { label: 'shape', position: [-1.6, 1.2, 5.2], target: [0.3, 0.1, 0], at: 1 },
  { label: 'reveal', position: [1.7, 0.3, 4.4], target: [0, -0.15, 0], at: 2 },
  { label: 'atmosphere', position: [0, 2.1, 5.6], target: [0, -0.2, 0], at: 3 },
  { label: 'cta', position: [0, 0.8, 7.3], target: [0, 0, 0], at: 4 }
];

export const timelineDurations = {
  section: 1
};
