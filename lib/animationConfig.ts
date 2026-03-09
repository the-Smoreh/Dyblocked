import { CameraKeyframe } from '@/lib/types';

export const cameraKeyframes: CameraKeyframe[] = [
  { label: 'intro', position: [0, 0.8, 7.2], target: [0, 0, 0], at: 0 },
  { label: 'left-sweep', position: [-2.8, 1.6, 5.8], target: [0.2, 0.2, 0], at: 0.55 },
  { label: 'close-orbit', position: [-1.2, 0.2, 3.8], target: [0.15, -0.05, 0], at: 1.1 },
  { label: 'right-sweep', position: [2.9, 1.1, 5.4], target: [-0.15, 0, 0], at: 1.8 },
  { label: 'rear-angle', position: [1.2, -0.5, -4.8], target: [0, -0.1, 0], at: 2.45 },
  { label: 'top-down', position: [0, 3.6, 3.6], target: [0, -0.35, 0], at: 3.2 },
  { label: 'hero-return', position: [0, 0.9, 7.4], target: [0, 0, 0], at: 4 }
];

export const timelineDurations = {
  section: 0.72
};
