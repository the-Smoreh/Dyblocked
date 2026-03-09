import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/app/globals.css';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';

export const metadata: Metadata = {
  title: 'Cinematic Scrollytelling Prototype',
  description: 'Next.js + R3F + GSAP + Lenis prototype'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
