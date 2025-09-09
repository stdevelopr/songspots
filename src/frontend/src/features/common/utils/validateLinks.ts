export function isValidMusicLink(link: string): boolean {
  const input = (link || '').trim();
  if (!input) return true; // allow empty

  // Accept YouTube long/short links and Spotify links (any path/query)
  const youtube = /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/.+/i;
  const spotify = /^https?:\/\/(?:open\.)?spotify\.com\/.+/i;
  return youtube.test(input) || spotify.test(input);
}

