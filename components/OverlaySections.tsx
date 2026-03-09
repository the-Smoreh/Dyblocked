import { sections } from '@/lib/sceneConfig';
import { StorySection } from '@/components/StorySection';

export function OverlaySections() {
  return (
    <div className="overlay-sections" aria-label="Narrative content">
      {sections.map((section, index) => (
        <StorySection key={section.id} section={section} isCTA={index === sections.length - 1} />
      ))}
    </div>
  );
}
