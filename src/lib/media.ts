// Helpers for converting various embed URLs (YouTube, Vimeo, etc.) into iframe-safe URLs.

export function isEmbeddable(url: string): boolean {
  return /youtube\.com\/watch|youtu\.be\/|youtube\.com\/embed|vimeo\.com\/|player\.vimeo\.com|soundcloud\.com\/|w\.soundcloud\.com|spotify\.com\/(track|album|playlist|episode)|open\.spotify\.com\/embed/i.test(
    url
  );
}

export function toEmbedUrl(url: string): { src: string; provider: 'youtube' | 'vimeo' | 'soundcloud' | 'spotify' | 'iframe' } {
  const u = url.trim();

  // YouTube watch / share / playlist
  const ytWatch = u.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (ytWatch) return { src: `https://www.youtube.com/embed/${ytWatch[1]}`, provider: 'youtube' };
  const ytShare = u.match(/youtu\.be\/([\w-]+)/);
  if (ytShare) return { src: `https://www.youtube.com/embed/${ytShare[1]}`, provider: 'youtube' };
  const ytPlaylist = u.match(/[?&]list=([\w-]+)/);
  if (ytPlaylist) return { src: `https://www.youtube.com/embed/videoseries?list=${ytPlaylist[1]}`, provider: 'youtube' };
  if (u.includes('youtube.com/embed')) return { src: u, provider: 'youtube' };

  // Vimeo
  const vimeo = u.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { src: `https://player.vimeo.com/video/${vimeo[1]}`, provider: 'vimeo' };
  const vimeoPlayer = u.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (vimeoPlayer) return { src: u, provider: 'vimeo' };

  // SoundCloud
  if (u.includes('w.soundcloud.com/player')) return { src: u, provider: 'soundcloud' };
  if (u.includes('soundcloud.com')) {
    return {
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&color=%23c93df0&auto_play=false&visual=true`,
      provider: 'soundcloud',
    };
  }

  // Spotify
  if (u.includes('open.spotify.com/embed')) return { src: u, provider: 'spotify' };
  const spotify = u.match(/spotify\.com\/(track|album|playlist|episode)\/([\w]+)/);
  if (spotify) {
    return { src: `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}`, provider: 'spotify' };
  }

  return { src: u, provider: 'iframe' };
}

export function getYouTubeThumbnail(url: string): string | null {
  const ytWatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (ytWatch) return `https://img.youtube.com/vi/${ytWatch[1]}/hqdefault.jpg`;
  const ytShare = url.match(/youtu\.be\/([\w-]+)/);
  if (ytShare) return `https://img.youtube.com/vi/${ytShare[1]}/hqdefault.jpg`;
  const ytEmbed = url.match(/youtube\.com\/embed\/([\w-]+)/);
  if (ytEmbed) return `https://img.youtube.com/vi/${ytEmbed[1]}/hqdefault.jpg`;
  return null;
}
