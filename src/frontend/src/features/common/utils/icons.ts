import L from 'leaflet';
import { MoodType, getMoodById } from '../types/moods';

const div = (html: string) =>
  L.divIcon({
    className: 'custom-pin',
    html,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  });

const createMoodPinHTML = (mood: MoodType, hasMusic: boolean, isPrivate: boolean) => {
  const moodData = getMoodById(mood);
  const lockIcon = isPrivate ? '<div class="lock-icon-small">🔒</div>' : '';
  const musicNote = hasMusic ? '<div class="music-note">♪</div>' : '';
  const moodEmoji = `<div class="mood-emoji">${moodData.emoji}</div>`;
  
  return `
<div class="pin-marker mood-pin" data-mood="${mood}">
<div class="pin-head mood-pin-head" style="background: ${moodData.colors.gradient};">
${moodEmoji}
${musicNote}
${lockIcon}
</div>
<div class="pin-point"></div>
</div>
`;
};

const HTML = {
  public: `
<div class="pin-marker">
<div class="pin-head"></div>
<div class="pin-point"></div>
</div>
`,
  publicMusic: `
<div class="pin-marker music-pin">
<div class="pin-head music-pin-head"><div class="music-note">♪</div></div>
<div class="pin-point"></div>
</div>
`,
  private: `
<div class="pin-marker private-pin">
<div class="pin-head private-pin-head"><div class="lock-icon">🔒</div></div>
<div class="pin-point"></div>
</div>
`,
  privateMusic: `
<div class="pin-marker private-pin music-pin">
<div class="pin-head private-pin-head music-pin-head">
<div class="music-note">♪</div>
<div class="lock-icon-small">🔒</div>
</div>
<div class="pin-point"></div>
</div>
`,
};

// Generate mood-based icons
const moodIcons: Record<string, L.DivIcon> = {};
const moods: MoodType[] = ['energetic', 'chill', 'creative', 'romantic', 'peaceful', 'party', 'mysterious'];

moods.forEach(mood => {
  moodIcons[`${mood}_public`] = div(createMoodPinHTML(mood, false, false));
  moodIcons[`${mood}_publicMusic`] = div(createMoodPinHTML(mood, true, false));
  moodIcons[`${mood}_private`] = div(createMoodPinHTML(mood, false, true));
  moodIcons[`${mood}_privateMusic`] = div(createMoodPinHTML(mood, true, true));
});

export const pinIcons = {
  public: div(HTML.public),
  publicMusic: div(HTML.publicMusic),
  private: div(HTML.private),
  privateMusic: div(HTML.privateMusic),
  ...moodIcons,
};

// Helper function to get mood-based icon
export const getMoodIcon = (mood: MoodType | undefined, isPrivate: boolean, hasMusic: boolean): L.DivIcon => {
  if (!mood) {
    // Fallback to original icons if no mood is set
    if (isPrivate) {
      return hasMusic ? pinIcons.privateMusic : pinIcons.private;
    } else {
      return hasMusic ? pinIcons.publicMusic : pinIcons.public;
    }
  }

  const iconKey = `${mood}_${isPrivate ? 'private' : 'public'}${hasMusic ? 'Music' : ''}`;
  return pinIcons[iconKey as keyof typeof pinIcons] || pinIcons.public;
};
