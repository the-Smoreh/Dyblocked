import { CameraKeyframe } from '@/lib/types';

export const cameraKeyframes: CameraKeyframe[] = [
  { label: 'surface-establish', position: [0, 2.6, 8.6], target: [0, 1.2, 0], at: 0 },
  { label: 'hole-reveal', position: [0.8, 2.1, 4.6], target: [0, 1.05, 0], at: 0.65 },
  { label: 'drop-in', position: [0.3, 0.8, 1.8], target: [0, -0.2, 0], at: 1.2 },
  { label: 'tunnel-descent', position: [0.1, -1.1, 1], target: [0, -2.5, 0], at: 1.9 },
  { label: 'cave-arrival', position: [-1.9, -3.1, 2.8], target: [0, -3.2, 0], at: 2.6 },
  { label: 'inner-orbit', position: [2.4, -2.7, -1.5], target: [0, -3.1, 0], at: 3.4 },
  { label: 'hero-room', position: [0, -2.4, 3.9], target: [0, -3, 0], at: 4.2 }
];

export const timelineDurations = {
  section: 0.76
};
