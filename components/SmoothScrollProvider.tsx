'use client';

import { PropsWithChildren, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.11,
      smoothWheel: true
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
