import L from 'leaflet';
import { MoodType, getMoodById } from '../types/moods';
import styles from '../components/MarkerIcons.module.css';

// Type assertion for CSS modules with kebab-case keys
const stylesWithKebab = styles as any;

const div = (html: string, isMoodPin: boolean = false) =>
  L.divIcon({
    className: isMoodPin ? stylesWithKebab['mood-marker'] : stylesWithKebab['custom-pin'],
    html,
    iconSize: isMoodPin ? [32, 32] : [24, 32],
    iconAnchor: isMoodPin ? [16, 16] : [12, 32],
    popupAnchor: isMoodPin ? [0, -16] : [0, -32],
  });

const createMoodPinHTML = (mood: MoodType, hasMusic: boolean, isPrivate: boolean, zoomLevel?: number) => {
  const moodData = getMoodById(mood);
  const lockIcon = isPrivate ? `<div class="${stylesWithKebab['mood-lock-icon']}">🔒</div>` : '';
  const musicNote = hasMusic ? `<div class="${stylesWithKebab['mood-music-note']}">♪</div>` : '';
  const moodEmoji = `<div class="${stylesWithKebab['mood-emoji-main']}">${moodData.emoji}</div>`;
  
  // Determine zoom class based on zoom level
  let zoomClass = stylesWithKebab['zoom-high']; // default
  if (zoomLevel !== undefined) {
    if (zoomLevel <= 5) zoomClass = stylesWithKebab['zoom-very-low'];
    else if (zoomLevel <= 10) zoomClass = stylesWithKebab['zoom-low'];
    else if (zoomLevel <= 14) zoomClass = stylesWithKebab['zoom-medium'];
    else zoomClass = stylesWithKebab['zoom-high'];
  }
  
  return `
<div class="${stylesWithKebab['mood-vibe-marker']} ${zoomClass}" data-mood="${mood}" style="background: ${moodData.colors.gradient};">
  <div class="${stylesWithKebab['mood-content']}">
    ${moodEmoji}
    ${musicNote}
    ${lockIcon}
  </div>
</div>
`;
};

const HTML = {
  public: `
<div class="${stylesWithKebab['pin-marker']}">
<div class="${stylesWithKebab['pin-head']}"></div>
<div class="${stylesWithKebab['pin-point']}"></div>
</div>
`,
  publicMusic: `
<div class="${stylesWithKebab['pin-marker']} music-pin">
<div class="${stylesWithKebab['pin-head']} ${stylesWithKebab['music-pin-head']}"><div class="${stylesWithKebab['music-note']}">♪</div></div>
<div class="${stylesWithKebab['pin-point']}"></div>
</div>
`,
  private: `
<div class="${stylesWithKebab['pin-marker']} private-pin">
<div class="${stylesWithKebab['pin-head']} ${stylesWithKebab['private-pin-head']}"><div class="${stylesWithKebab['lock-icon']}">🔒</div></div>
<div class="${stylesWithKebab['pin-point']}"></div>
</div>
`,
  privateMusic: `
<div class="${stylesWithKebab['pin-marker']} private-pin music-pin">
<div class="${stylesWithKebab['pin-head']} ${stylesWithKebab['private-pin-head']} ${stylesWithKebab['music-pin-head']}">
<div class="${stylesWithKebab['music-note']}">♪</div>
<div class="${stylesWithKebab['lock-icon-small']}">🔒</div>
</div>
<div class="${stylesWithKebab['pin-point']}"></div>
</div>
`,
};

// Generate mood-based icons
const moodIcons: Record<string, L.DivIcon> = {};
const moods: MoodType[] = ['energetic', 'chill', 'creative', 'romantic', 'peaceful', 'party', 'mysterious'];

moods.forEach(mood => {
  moodIcons[`${mood}_public`] = div(createMoodPinHTML(mood, false, false), true);
  moodIcons[`${mood}_publicMusic`] = div(createMoodPinHTML(mood, true, false), true);
  moodIcons[`${mood}_private`] = div(createMoodPinHTML(mood, false, true), true);
  moodIcons[`${mood}_privateMusic`] = div(createMoodPinHTML(mood, true, true), true);
});

export const pinIcons = {
  public: div(HTML.public),
  publicMusic: div(HTML.publicMusic),
  private: div(HTML.private),
  privateMusic: div(HTML.privateMusic),
  ...moodIcons,
};

// Helper function to get mood-based icon
export const getMoodIcon = (mood: MoodType | undefined, isPrivate: boolean, hasMusic: boolean, zoomLevel?: number): L.DivIcon => {
  if (!mood) {
    // Fallback to original icons if no mood is set
    if (isPrivate) {
      return hasMusic ? pinIcons.privateMusic : pinIcons.private;
    } else {
      return hasMusic ? pinIcons.publicMusic : pinIcons.public;
    }
  }

  // For zoom-responsive mood icons, create them dynamically
  if (zoomLevel !== undefined) {
    const html = createMoodPinHTML(mood, hasMusic, isPrivate, zoomLevel);
    return div(html, true);
  }

  // Fallback to pre-generated icons
  const iconKey = `${mood}_${isPrivate ? 'private' : 'public'}${hasMusic ? 'Music' : ''}`;
  return pinIcons[iconKey as keyof typeof pinIcons] || pinIcons.public;
};
