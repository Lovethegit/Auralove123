import { PublicLayout } from '../components';
import { MediaSectionPage } from './MediaSectionPage';

export const MusicVideosPage = () => (
  <MediaSectionPage category="music_videos" eyebrow="Moving Worlds" title="Music Videos" subtitle="Official music videos and visual pieces — embedded and native." emptyHint="Music videos will be gathered here." />
);

export const AudioLibraryPage = () => (
  <MediaSectionPage category="audio_library" eyebrow="Sonic Aura" title="Audio Library" subtitle="A curated audio collection — tracks, soundscapes, and spoken word." emptyHint="Audio creations will be gathered here." />
);

export const SelfRecordedPage = () => (
  <MediaSectionPage category="self_recorded" eyebrow="Unfiltered" title="Self-Recorded Videos" subtitle="Personal, raw, and direct — recorded by Love Parekh." emptyHint="Self-recorded clips will appear here." />
);

export const PublicMediaPage = () => (
  <MediaSectionPage category="public_media" eyebrow="In the Open" title="Public Media" subtitle="Media featured publicly — interviews, features, and appearances." emptyHint="Public media will be gathered here." />
);

export const CreationsPage = () => (
  <MediaSectionPage category="creations" eyebrow="Original Works" title="Creations" subtitle="Original creative works — videos, audio, visual experiments." emptyHint="Creations will be gathered here." />
);

export { PublicLayout };
