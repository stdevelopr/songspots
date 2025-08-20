import L from 'leaflet';

const div = (html: string) =>
  L.divIcon({
    className: 'custom-pin',
    html,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  });

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

export const pinIcons = {
  public: div(HTML.public),
  publicMusic: div(HTML.publicMusic),
  private: div(HTML.private),
  privateMusic: div(HTML.privateMusic),
};
