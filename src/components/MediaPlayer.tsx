import { type MediaItem } from '../lib/adminApi';
import { toEmbedUrl, isEmbeddable } from '../lib/media';

type MediaPlayerProps = {
  item: MediaItem;
  aspect?: 'video' | 'square' | 'portrait';
};

const ASPECT = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
};

// Renders either an embedded iframe (YouTube/Vimeo/SoundCloud/Spotify) or a native HTML5 player
// depending on `media_type`. The dashboard records embed_url for iframes and external_url for
// native file playback (either a Supabase storage public URL or any direct media URL).
export function MediaPlayer({ item, aspect = 'video' }: MediaPlayerProps) {
  const aspectClass = ASPECT[aspect];

  if (item.media_type === 'embed' && item.embed_url && isEmbeddable(item.embed_url)) {
    const { src } = toEmbedUrl(item.embed_url);
    return (
      <div className={`relative w-full ${aspectClass} glass-card overflow-hidden`}>
        <iframe
          src={src}
          title={item.title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder={0}
        />
      </div>
    );
  }

  // Native playback — detect audio vs video by URL or content
  const url = item.external_url || '';
  const isAudio = /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(url) || item.category === 'audio_library';

  if (url && !isAudio) {
    return (
      <div className={`relative w-full ${aspectClass} glass-card overflow-hidden bg-black`}>
        <video
          src={url}
          controls
          className="absolute inset-0 h-full w-full object-contain"
          poster={item.thumbnail_url || undefined}
        />
      </div>
    );
  }

  if (url && isAudio) {
    return (
      <div className="w-full glass-card p-6">
        <audio src={url} controls className="w-full" />
      </div>
    );
  }

  return (
    <div className={`w-full ${aspectClass} glass-card grid place-items-center bg-ink-850/50`}>
      <p className="text-sm text-slate-500 px-6 text-center">Media source unavailable.</p>
    </div>
  );
}
