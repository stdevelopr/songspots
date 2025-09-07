import React, { useState } from 'react';

interface MusicEmbedProps {
  musicLink: string;
  className?: string;
}

// Helper functions for parsing
function getYouTubeEmbedUrl(url: string): string {
  // Handle YouTube Shorts
  const shortsMatch = url.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // Handle regular YouTube videos
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Handle v parameter
  const vParam = url.match(/[?&]v=([\w-]{11})/);
  if (vParam && vParam[1]) {
    return `https://www.youtube.com/embed/${vParam[1]}`;
  }

  return url;
}

function getSpotifyEmbedUrl(url: string): string {
  const trackMatch = url.match(/spotify\.com\/track\/([\w\d]+)/);
  if (trackMatch && trackMatch[1]) {
    return `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator`;
  }
  const albumMatch = url.match(/spotify\.com\/album\/([\w\d]+)/);
  if (albumMatch && albumMatch[1]) {
    return `https://open.spotify.com/embed/album/${albumMatch[1]}?utm_source=generator`;
  }
  return '';
}

const MusicEmbed: React.FC<MusicEmbedProps> = ({ musicLink, className }) => {
  const [loading, setLoading] = useState(true);
  if (!musicLink) return null;
  const isSpotify = musicLink.includes('spotify.com');
  const isYouTube = musicLink.includes('youtube.com') || musicLink.includes('youtu.be');

  let embedSrc = '';
  if (isSpotify) embedSrc = getSpotifyEmbedUrl(musicLink);
  else if (isYouTube) embedSrc = getYouTubeEmbedUrl(musicLink);
  else embedSrc = musicLink;

  return (
    <div
      className={`w-full flex flex-col items-center gap-2 relative ${className || ''}`}
      style={{ maxHeight: '60vh', height: '100%' }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-blue-400 border-t-transparent"></div>
        </div>
      )}
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
        }}
      >
        <iframe
          data-testid="embed-iframe"
          style={{
            borderRadius: '12px',
            width: '100%',
            minHeight: 200,
            maxHeight: '100%',
            height: '100%',
          }}
          src={embedSrc}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Music player"
          onLoad={() => setLoading(false)}
        ></iframe>
      </div>
    </div>
  );
};

export default MusicEmbed;
