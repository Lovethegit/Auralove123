import { PublicLayout, PageHero } from '../components/Layout';
import { MediaGrid } from '../components/MediaGrid';
import { useMediaByCategory } from '../lib/data';
import type { MediaCategory } from '../lib/adminApi';

type Props = {
  category: MediaCategory;
  eyebrow: string;
  title: string;
  subtitle: string;
  emptyHint?: string;
};

export function MediaSectionPage({ category, eyebrow, title, subtitle, emptyHint }: Props) {
  const { data, loading } = useMediaByCategory(category);
  return (
    <PublicLayout>
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <section className="max-w-7xl mx-auto px-5 md:px-10 pb-24">
        <MediaGrid items={data} loading={loading} emptyHint={emptyHint} />
      </section>
    </PublicLayout>
  );
}
