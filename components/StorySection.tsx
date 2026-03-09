import { NarrativeSection } from '@/lib/types';

type StorySectionProps = {
  section: NarrativeSection;
  isCTA?: boolean;
};

export function StorySection({ section, isCTA = false }: StorySectionProps) {
  return (
    <section className={`story-section ${isCTA ? 'story-section--cta' : ''}`} data-section={section.id}>
      <p className="story-section__eyebrow">{section.eyebrow}</p>
      <h2>{section.title}</h2>
      <p className="story-section__body">{section.body}</p>
      {isCTA ? (
        <div className="story-section__actions">
          <button type="button">Start project</button>
          <button type="button" className="story-section__button-secondary">
            View architecture
          </button>
        </div>
      ) : null}
    </section>
  );
}
