import { OverlaySections } from '@/components/OverlaySections';
import { ScrollScene } from '@/components/ScrollScene';

export default function HomePage() {
  return (
    <main className="page-root">
      <div className="story-experience">
        <ScrollScene />
        <OverlaySections />
      </div>
    </main>
  );
}
