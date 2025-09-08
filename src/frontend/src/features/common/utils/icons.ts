import L from 'leaflet';
import { MoodType, getMoodById } from '../types/moods';
import styles from '../components/MarkerIcons.module.css';

const div = (html: string, isMoodPin: boolean = false) =>
  L.divIcon({
    className: isMoodPin ? styles['mood-marker'] : styles['custom-pin'],
    html,
    iconSize: isMoodPin ? [32, 32] : [24, 32],
    iconAnchor: isMoodPin ? [16, 16] : [12, 32],
    popupAnchor: isMoodPin ? [0, -16] : [0, -32],
  });

const createMoodPinHTML = (mood: MoodType, hasMusic: boolean, isPrivate: boolean, zoomLevel?: number) => {
  const moodData = getMoodById(mood);
  const lockIcon = isPrivate ? `<div class="${styles['mood-lock-icon']}">🔒</div>` : '';
  const musicNote = hasMusic ? `<div class="${styles['mood-music-note']}">♪</div>` : '';
  const moodEmoji = `<div class="${styles['mood-emoji-main']}">${moodData.emoji}</div>`;
  
  // Determine zoom class based on zoom level
  let zoomClass = styles['zoom-high']; // default
  if (zoomLevel !== undefined) {
    if (zoomLevel <= 5) zoomClass = styles['zoom-very-low'];
    else if (zoomLevel <= 10) zoomClass = styles['zoom-low'];
    else if (zoomLevel <= 14) zoomClass = styles['zoom-medium'];
    else zoomClass = styles['zoom-high'];
  }
  
  return `
<div class="${styles['mood-vibe-marker']} ${zoomClass}" data-mood="${mood}" style="background: ${moodData.colors.gradient};">
  <div class="${styles['mood-content']}">
    ${moodEmoji}
    ${musicNote}
    ${lockIcon}
  </div>
</div>
`;
};

const HTML = {
  public: `
<div class="${styles['pin-marker']}">
<div class="${styles['pin-head']}"></div>
<div class="${styles['pin-point']}"></div>
</div>
`,
  publicMusic: `
<div class="${styles['pin-marker']} music-pin">
<div class="${styles['pin-head']} ${styles['music-pin-head']}"><div class="${styles['music-note']}">♪</div></div>
<div class="${styles['pin-point']}"></div>
</div>
`,
  private: `
<div class="${styles['pin-marker']} private-pin">
<div class="${styles['pin-head']} ${styles['private-pin-head']}"><div class="${styles['lock-icon']}">🔒</div></div>
<div class="${styles['pin-point']}"></div>
</div>
`,
  privateMusic: `
<div class="${styles['pin-marker']} private-pin music-pin">
<div class="${styles['pin-head']} ${styles['private-pin-head']} ${styles['music-pin-head']}">
<div class="${styles['music-note']}">♪</div>
<div class="${styles['lock-icon-small']}">🔒</div>
</div>
<div class="${styles['pin-point']}"></div>
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
