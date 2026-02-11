// Kawaii Valentine Goal - StreamElements Widget
// Supports Twitch + YouTube events

var blondieFieldData = {};
var blondieProgress = 0;
var blondieGoalAmount = 100;
var blondieCurrencySymbol = '$';
var blondieWasComplete = false;
var blondieLastMilestone = 0;
var blondieLastProgress = 0;
var blondieEffectDuration = 4000;
var blondieEffectUID = 0;
var blondieSeBaseProgress = 0; // Raw StreamElements session value (before manual offset)

// Manual offset persistence (localStorage)
function blondieGetStorageKey() {
  var eventType = blondieFieldData.eventType || 'manual';
  return 'blondieValentineOffset_' + eventType;
}

function blondieLoadOffset() {
  try {
    var saved = localStorage.getItem(blondieGetStorageKey());
    return saved ? parseInt(saved) || 0 : 0;
  } catch(e) { return 0; }
}

function blondieSaveOffset(newOffset) {
  try {
    localStorage.setItem(blondieGetStorageKey(), newOffset);
  } catch(e) {}
}

function blondieClearOffset() {
  try {
    localStorage.removeItem(blondieGetStorageKey());
  } catch(e) {}
}

function blondieAdjustColor(color, amount) {
  var hex = color.replace('#', '');
  var r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  var g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  var b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return '#' + [r, g, b].map(function(x) { return x.toString(16).padStart(2, '0'); }).join('');
}

var blondieThemes = {
  'love-letter':      { fill1: '#F8A4B8', fill2: '#E8758B', fill3: '#F2C4CE', border: '#D4A57B', bg: '#FFF5EE', glow: 'rgba(248,164,184,0.35)', effect: 'love-letters', icon: 'svg-loveletter', barStyle: 'diagonal-stripes', titleBoxBg: '#1A0A12' },
  'strawberry-kiss':  { fill1: '#FF4D6D', fill2: '#C62B4A', fill3: '#FF8FA3', border: '#5C3D2E', bg: '#FFF0F3', glow: 'rgba(255,77,109,0.4)', effect: 'berry-burst', icon: 'svg-strawberry', barStyle: 'polka-seeds', titleBoxBg: '#1A0508' },
  'rose-garden':      { fill1: '#E91E63', fill2: '#880E4F', fill3: '#F48FB1', border: '#AD1457', bg: '#FCE4EC', glow: 'rgba(233,30,99,0.3)', effect: 'rose-petals', icon: 'svg-rose', barStyle: 'shimmer', titleBoxBg: '#1A050D' },
  'cupid-arrow':      { fill1: '#FFD700', fill2: '#FFC107', fill3: '#FFECB3', border: '#FFD700', bg: '#FFFDF5', glow: 'rgba(255,215,0,0.35)', effect: 'cupid-arrows', icon: 'svg-cupid', barStyle: 'triple-sparkle', titleBoxBg: '#1A1505' },
  'candy-hearts':     { fill1: '#FF9FCC', fill2: '#B5EAD7', fill3: '#FFC4E1', border: '#FFFFFF', bg: '#FFF5FA', glow: 'rgba(255,159,204,0.3)', effect: 'candy-shower', icon: 'svg-candy', barStyle: 'candy-stripes', titleBoxBg: '#1A0A14' },
  'moonlight':        { fill1: '#7B68EE', fill2: '#4A3A8F', fill3: '#B8A9FF', border: '#2D1B69', bg: '#1A1033', glow: 'rgba(123,104,238,0.5)', effect: 'starfall', icon: 'svg-moon', barStyle: 'star-shimmer', dark: true, boxBg: 'rgba(26,16,51,0.92)', boxBorder: '1.5px solid rgba(123,104,238,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(123,104,238,0.1)', titleBoxBg: '#0D0820' },
  'sweet-chocolate':  { fill1: '#D4A574', fill2: '#8B5E3C', fill3: '#F0D5A8', border: '#DAA520', bg: '#3E2723', glow: 'rgba(218,165,32,0.35)', effect: 'chocolate-truffles', icon: 'svg-chocolate', barStyle: 'gold-shimmer', dark: true, boxBg: 'rgba(62,39,35,0.92)', boxBorder: '1.5px solid rgba(218,165,32,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(218,165,32,0.08)', titleBoxBg: '#1A0E08' },
  'fairy-love':       { fill1: '#E8B4F8', fill2: '#B8E4F0', fill3: '#FADADD', border: '#D8B4FE', bg: '#FDF6FF', glow: 'rgba(232,180,248,0.4)', effect: 'fairy-dust', icon: 'svg-fairy', barStyle: 'iridescent', titleBoxBg: '#140A18' },
  'boba-love':        { fill1: '#FF6B8A', fill2: '#D4456B', fill3: '#FFB3C6', border: '#FFFFFF', bg: '#FFE0EB', glow: 'rgba(255,107,138,0.35)', effect: 'boba-hearts', icon: 'svg-boba', barStyle: 'polka-valentine', titleBoxBg: '#1A0510' },
  'teddy-bear':       { fill1: '#DEB887', fill2: '#C4956A', fill3: '#F5DEB3', border: '#A0522D', bg: '#FFF8F0', glow: 'rgba(222,184,135,0.35)', effect: 'bear-hugs', icon: 'svg-teddy', barStyle: 'fuzz-texture', titleBoxBg: '#1A1008' },
  'sakura-dream':     { fill1: '#FFB7C5', fill2: '#E8899A', fill3: '#FFD6E0', border: '#C9927E', bg: '#FFF5F8', glow: 'rgba(255,183,197,0.4)', effect: 'sakura-shower', icon: 'svg-sakura', barStyle: 'sakura-petals', titleBoxBg: '#1A0A10' },
  'cosmic-love':      { fill1: '#9B6BCD', fill2: '#6C4BA0', fill3: '#D4B5F0', border: '#C39BD3', bg: '#140A28', glow: 'rgba(155,107,205,0.5)', effect: 'shooting-stars', icon: 'svg-planet', barStyle: 'cosmic-nebula', dark: true, boxBg: 'rgba(20,10,40,0.92)', boxBorder: '1.5px solid rgba(195,155,211,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(155,107,205,0.15), inset 0 1px 0 rgba(195,155,211,0.1)', titleBoxBg: '#0A0518' },
  'honey-bee':        { fill1: '#FFD166', fill2: '#E8A830', fill3: '#FFF0B5', border: '#C89020', bg: '#FFFEF2', glow: 'rgba(255,209,102,0.4)', effect: 'buzzing-hearts', icon: 'svg-bee', barStyle: 'honeycomb', titleBoxBg: '#1A1505' },
  'cherry-wine':      { fill1: '#9B2335', fill2: '#6D1A26', fill3: '#D4677A', border: '#B8860B', bg: '#1E0A10', glow: 'rgba(155,35,53,0.45)', effect: 'champagne-bubbles', icon: 'svg-wineglass', barStyle: 'wine-bubbles', dark: true, boxBg: 'rgba(30,10,16,0.92)', boxBorder: '1.5px solid rgba(184,134,11,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(155,35,53,0.15), inset 0 1px 0 rgba(184,134,11,0.1)', titleBoxBg: '#1A0408' },
  'kitty-love':       { fill1: '#FFCBA4', fill2: '#F0A070', fill3: '#FFE4CC', border: '#DEB887', bg: '#FFF8F0', glow: 'rgba(255,203,164,0.35)', effect: 'paw-hearts', icon: 'svg-kitty', barStyle: 'paw-prints', titleBoxBg: '#1A0E08' },
  'pixel-heart':      { fill1: '#FF1493', fill2: '#C01070', fill3: '#FF69B4', border: '#FF00FF', bg: '#1A0020', glow: 'rgba(255,20,147,0.5)', effect: 'pixel-rain', icon: 'svg-pixel-heart', barStyle: 'pixel-blocks', dark: true, boxBg: 'rgba(26,0,32,0.92)', boxBorder: '1.5px solid rgba(255,0,255,0.45)', boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(255,20,147,0.15), inset 0 1px 0 rgba(255,0,255,0.08)', titleBoxBg: '#0D0014' },
  'lavender-fields':  { fill1: '#B57EDC', fill2: '#8A55BF', fill3: '#DCC5F0', border: '#D8BFD8', bg: '#F8F0FF', glow: 'rgba(181,126,220,0.35)', effect: 'lavender-drift', icon: 'svg-lavender', barStyle: 'lavender-waves', titleBoxBg: '#0D0818' },
  'love-potion':      { fill1: '#E05EBF', fill2: '#A03B8A', fill3: '#F0A0D8', border: '#9B59B6', bg: '#180020', glow: 'rgba(224,94,191,0.5)', effect: 'magic-burst', icon: 'svg-potion', barStyle: 'potion-bubbles', dark: true, boxBg: 'rgba(24,0,32,0.92)', boxBorder: '1.5px solid rgba(155,89,182,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(224,94,191,0.15), inset 0 1px 0 rgba(155,89,182,0.1)', titleBoxBg: '#140518' },
  'strawberry-milk':  { fill1: '#FFB5C5', fill2: '#E8909F', fill3: '#FFD6DF', border: '#FF69B4', bg: '#FFF8FA', glow: 'rgba(255,181,197,0.35)', effect: 'milk-splash', icon: 'svg-milkcarton', barStyle: 'cream-swirl', titleBoxBg: '#1A0A10' },
  'royal-valentine':  { fill1: '#DC143C', fill2: '#8B0000', fill3: '#F0505A', border: '#FFD700', bg: '#1A0008', glow: 'rgba(220,20,60,0.45)', effect: 'royal-shower', icon: 'svg-crown', barStyle: 'royal-damask', dark: true, boxBg: 'rgba(26,0,8,0.92)', boxBorder: '1.5px solid rgba(255,215,0,0.45)', boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(220,20,60,0.15), inset 0 1px 0 rgba(255,215,0,0.08)', titleBoxBg: '#0D0004' }
};

// Emoji icons
var blondieIconsEmoji = {
  'emoji-loveletter': '💌', 'emoji-strawberry': '🍓', 'emoji-rose': '🌹', 'emoji-cupid': '💘',
  'emoji-candy': '🍬', 'emoji-moon': '🌙', 'emoji-chocolate': '🍫', 'emoji-fairy': '🧚',
  'emoji-boba': '🧋', 'emoji-teddy': '🧸',
  'emoji-heart': '❤️', 'emoji-pink-heart': '🩷', 'emoji-sparkle-heart': '💖', 'emoji-ribbon': '🎀',
  'emoji-star': '⭐', 'emoji-diamond': '💎', 'emoji-trophy': '🏆', 'emoji-crown': '👑',
  'emoji-flower': '🌸', 'emoji-butterfly': '🦋', 'emoji-sparkles': '✨', 'emoji-kiss': '💋',
  'emoji-unicorn': '🦄', 'emoji-cherry': '🍒', 'emoji-cake': '🧁', 'emoji-lollipop': '🍭',
  'emoji-sakura': '🌸', 'emoji-planet': '🪐', 'emoji-bee': '🐝', 'emoji-wineglass': '🍷',
  'emoji-kitty': '🐱', 'emoji-pixel': '👾', 'emoji-lavender': '💜', 'emoji-potion': '🧪',
  'emoji-milkcarton': '🥛'
};

// SVG Kawaii Mascot Icons (theme defaults)
var blondieIconsSVG = {
  'svg-loveletter': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-ll-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFF5EE"/><stop offset="100%" stop-color="#F2C4CE"/></linearGradient><filter id="bv-ll-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#D4A57B" flood-opacity="0.25"/></filter></defs><g filter="url(#bv-ll-ds)"><rect x="15" y="28" width="70" height="48" rx="5" fill="url(#bv-ll-g1)" stroke="#D4A57B" stroke-width="2.5"/><path d="M15,28 L50,56 L85,28" fill="none" stroke="#D4A57B" stroke-width="2.5" stroke-linejoin="round"/><path d="M15,76 L38,52" fill="none" stroke="#D4A57B" stroke-width="1.5" opacity="0.4"/><path d="M85,76 L62,52" fill="none" stroke="#D4A57B" stroke-width="1.5" opacity="0.4"/><ellipse cx="35" cy="36" rx="10" ry="5" fill="white" opacity="0.45" transform="rotate(-12 35 36)"/></g><circle cx="50" cy="68" r="11" fill="#E8758B"/><path d="M50,60 C44,60 41,65 50,74 C59,65 56,60 50,60Z" fill="#F8A4B8"/><ellipse cx="46" cy="64" rx="2.5" ry="3" fill="white" opacity="0.4" transform="rotate(-10 46 64)"/><circle cx="38" cy="44" r="2.5" fill="#5D576B"/><circle cx="62" cy="44" r="2.5" fill="#5D576B"/><circle cx="36" cy="42" r="1" fill="white"/><circle cx="60" cy="42" r="1" fill="white"/><path d="M44,50 Q50,54 56,50" fill="none" stroke="#5D576B" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="30" cy="48" rx="4" ry="2" fill="#F8A4B8" opacity="0.35"/><ellipse cx="70" cy="48" rx="4" ry="2" fill="#F8A4B8" opacity="0.35"/></svg>',

  'svg-strawberry': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-sb-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FF8FA3"/><stop offset="40%" stop-color="#FF4D6D"/><stop offset="75%" stop-color="#E0264A"/><stop offset="100%" stop-color="#C62B4A"/></linearGradient><radialGradient id="bv-sb-hi" cx="35%" cy="30%" r="45%"><stop offset="0%" stop-color="white" stop-opacity="0.45"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient><linearGradient id="bv-sb-leaf" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#6DBF5B"/><stop offset="100%" stop-color="#3D8B37"/></linearGradient><filter id="bv-sb-ds"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#8B1A2B" flood-opacity="0.35"/></filter></defs><line x1="50" y1="8" x2="50" y2="22" stroke="#3D8B37" stroke-width="3" stroke-linecap="round"/><g fill="url(#bv-sb-leaf)" stroke="#2E7D32" stroke-width="0.8"><path d="M50,22 C50,22 38,14 32,18 C32,18 40,22 50,22Z"/><path d="M50,22 C50,22 62,14 68,18 C68,18 60,22 50,22Z"/><path d="M50,22 C50,22 34,18 28,22 C28,22 36,25 50,22Z"/><path d="M50,22 C50,22 66,18 72,22 C72,22 64,25 50,22Z"/><path d="M50,22 C50,22 44,12 50,8 C56,12 50,22 50,22Z"/></g><g filter="url(#bv-sb-ds)"><path d="M50,22 C36,22 22,32 22,48 C22,58 26,68 34,76 C40,82 46,86 50,88 C54,86 60,82 66,76 C74,68 78,58 78,48 C78,32 64,22 50,22Z" fill="url(#bv-sb-g1)" stroke="#C62B4A" stroke-width="1.5"/><path d="M50,22 C36,22 22,32 22,48 C22,58 26,68 34,76 C40,82 46,86 50,88 C54,86 60,82 66,76 C74,68 78,58 78,48 C78,32 64,22 50,22Z" fill="url(#bv-sb-hi)"/></g><ellipse cx="36" cy="42" rx="2" ry="2.8" fill="#FFE66D" opacity="0.65" transform="rotate(-10 36 42)"/><ellipse cx="50" cy="38" rx="2" ry="2.8" fill="#FFE66D" opacity="0.55" transform="rotate(5 50 38)"/><ellipse cx="64" cy="42" rx="2" ry="2.8" fill="#FFE66D" opacity="0.6" transform="rotate(10 64 42)"/><ellipse cx="34" cy="56" rx="2" ry="2.8" fill="#FFE66D" opacity="0.55" transform="rotate(-15 34 56)"/><ellipse cx="48" cy="54" rx="2" ry="2.8" fill="#FFE66D" opacity="0.5"/><ellipse cx="62" cy="55" rx="2" ry="2.8" fill="#FFE66D" opacity="0.55" transform="rotate(8 62 55)"/><ellipse cx="40" cy="68" rx="2" ry="2.8" fill="#FFE66D" opacity="0.45" transform="rotate(-5 40 68)"/><ellipse cx="56" cy="66" rx="2" ry="2.8" fill="#FFE66D" opacity="0.5" transform="rotate(12 56 66)"/><ellipse cx="50" cy="78" rx="1.5" ry="2.2" fill="#FFE66D" opacity="0.4"/><circle cx="40" cy="48" r="2.5" fill="#5D576B"/><circle cx="60" cy="48" r="2.5" fill="#5D576B"/><circle cx="38.5" cy="46.5" r="1" fill="white"/><circle cx="58.5" cy="46.5" r="1" fill="white"/><path d="M46,54 Q50,58 54,54" fill="none" stroke="#5D576B" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="34" cy="52" rx="3.5" ry="1.8" fill="#FF8FA3" opacity="0.4"/><ellipse cx="66" cy="52" rx="3.5" ry="1.8" fill="#FF8FA3" opacity="0.4"/></svg>',

  'svg-rose': '<svg viewBox="0 0 100 100"><defs><radialGradient id="bv-rs-rg1" cx="45%" cy="40%" r="55%"><stop offset="0%" stop-color="#FFB6C9"/><stop offset="40%" stop-color="#F48FB1"/><stop offset="75%" stop-color="#E91E63"/><stop offset="100%" stop-color="#AD1457"/></radialGradient><radialGradient id="bv-rs-rg2" cx="50%" cy="35%" r="50%"><stop offset="0%" stop-color="#FFC1D4"/><stop offset="100%" stop-color="#E91E63"/></radialGradient><radialGradient id="bv-rs-rg3" cx="55%" cy="45%" r="50%"><stop offset="0%" stop-color="#F8BBD0"/><stop offset="100%" stop-color="#C2185B"/></radialGradient><linearGradient id="bv-rs-stem" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#66BB6A"/><stop offset="100%" stop-color="#2E7D32"/></linearGradient><linearGradient id="bv-rs-leaf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#81C784"/><stop offset="100%" stop-color="#388E3C"/></linearGradient><filter id="bv-rs-ds"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#880E4F" flood-opacity="0.35"/></filter></defs><path d="M50,90 C50,90 50,68 50,60" stroke="url(#bv-rs-stem)" stroke-width="3.5" stroke-linecap="round" fill="none"/><path d="M50,82 C50,82 48,80 46,78" stroke="url(#bv-rs-stem)" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M50,76 C50,76 60,68 68,66 C68,66 62,74 50,76Z" fill="url(#bv-rs-leaf)" opacity="0.85"/><path d="M54,72 C54,72 62,68 66,67" fill="none" stroke="#2E7D32" stroke-width="0.8" opacity="0.5"/><path d="M50,70 C50,70 38,64 32,66 C32,66 38,72 50,70Z" fill="url(#bv-rs-leaf)" opacity="0.7"/><path d="M46,67 C46,67 38,65 34,66" fill="none" stroke="#2E7D32" stroke-width="0.8" opacity="0.5"/><path d="M49,84 L46,82 L49,83" fill="#5D8A3C" opacity="0.6"/><g filter="url(#bv-rs-ds)"><path d="M50,16 C38,16 22,26 22,42 C22,54 30,62 50,62 C70,62 78,54 78,42 C78,26 62,16 50,16Z" fill="#C2185B" opacity="0.9"/><path d="M26,38 C26,38 22,28 32,20 C32,20 24,32 28,44Z" fill="#AD1457" opacity="0.6"/><path d="M74,38 C74,38 78,28 68,20 C68,20 76,32 72,44Z" fill="#AD1457" opacity="0.6"/><path d="M38,58 C38,58 28,54 24,44 C24,44 30,56 42,60Z" fill="#AD1457" opacity="0.5"/><path d="M62,58 C62,58 72,54 76,44 C76,44 70,56 58,60Z" fill="#AD1457" opacity="0.5"/><path d="M50,20 C40,20 28,28 28,40 C28,50 36,56 50,56 C64,56 72,50 72,40 C72,28 60,20 50,20Z" fill="url(#bv-rs-rg1)"/><path d="M50,24 C42,24 32,30 32,40 C32,48 38,52 50,52 C62,52 68,48 68,40 C68,30 58,24 50,24Z" fill="url(#bv-rs-rg2)" opacity="0.9"/><path d="M34,34 C34,34 38,24 50,26" fill="none" stroke="#FFD0DE" stroke-width="1.2" opacity="0.5"/><path d="M66,34 C66,34 62,24 50,26" fill="none" stroke="#FFD0DE" stroke-width="1.2" opacity="0.5"/><path d="M36,46 C36,46 40,52 50,52" fill="none" stroke="#E91E63" stroke-width="1" opacity="0.35"/><path d="M64,46 C64,46 60,52 50,52" fill="none" stroke="#E91E63" stroke-width="1" opacity="0.35"/><path d="M50,28 C44,28 36,34 36,40 C36,46 42,48 50,48 C58,48 64,46 64,40 C64,34 56,28 50,28Z" fill="url(#bv-rs-rg3)" opacity="0.85"/><path d="M50,32 C46,32 42,35 42,38 C42,42 46,44 50,44 C54,44 58,42 58,38 C58,34 54,32 50,32Z" fill="#E91E63" opacity="0.7"/><path d="M50,34 C48,34 44,36 44,38 C44,40 46,42 50,42 C54,42 56,40 56,38 C56,36 52,34 50,34Z" fill="#F48FB1" opacity="0.8"/><path d="M50,36 C48,36 46,37 46,38 C46,40 48,40 50,40 C52,40 54,40 54,38 C54,37 52,36 50,36Z" fill="#FFB6C9" opacity="0.9"/><ellipse cx="40" cy="30" rx="7" ry="4" fill="white" opacity="0.25" transform="rotate(-25 40 30)"/><ellipse cx="58" cy="28" rx="4" ry="3" fill="white" opacity="0.15" transform="rotate(15 58 28)"/></g><circle cx="43" cy="38" r="2" fill="#5D576B"/><circle cx="57" cy="38" r="2" fill="#5D576B"/><circle cx="41.5" cy="36.5" r="0.8" fill="white"/><circle cx="55.5" cy="36.5" r="0.8" fill="white"/><path d="M47,43 Q50,46 53,43" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="37" cy="41" rx="3" ry="1.5" fill="#E91E63" opacity="0.35"/><ellipse cx="63" cy="41" rx="3" ry="1.5" fill="#E91E63" opacity="0.35"/></svg>',

  'svg-cupid': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-cp-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFECB3"/><stop offset="100%" stop-color="#FFD700"/></linearGradient><filter id="bv-cp-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#DAA520" flood-opacity="0.3"/></filter></defs><g filter="url(#bv-cp-ds)"><path d="M50,25 C40,25 28,35 28,48 C28,68 50,82 50,82 C50,82 72,68 72,48 C72,35 60,25 50,25Z" fill="url(#bv-cp-g1)" stroke="#DAA520" stroke-width="2"/><ellipse cx="40" cy="38" rx="8" ry="10" fill="white" opacity="0.35" transform="rotate(-12 40 38)"/></g><ellipse cx="22" cy="40" rx="14" ry="8" fill="white" stroke="#FFC8DD" stroke-width="1.5" transform="rotate(-25 22 40)" opacity="0.85"/><ellipse cx="78" cy="40" rx="14" ry="8" fill="white" stroke="#FFC8DD" stroke-width="1.5" transform="rotate(25 78 40)" opacity="0.85"/><ellipse cx="18" cy="36" rx="8" ry="5" fill="white" stroke="#FFC8DD" stroke-width="1" transform="rotate(-40 18 36)" opacity="0.6"/><ellipse cx="82" cy="36" rx="8" ry="5" fill="white" stroke="#FFC8DD" stroke-width="1" transform="rotate(40 82 36)" opacity="0.6"/><line x1="12" y1="75" x2="88" y2="20" stroke="#8B5E3C" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/><path d="M88,20 L82,28 M88,20 L80,22" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round" opacity="0.7"/><path d="M12,75 L14,68 L18,74Z" fill="#FF4D6D" opacity="0.7"/><circle cx="42" cy="46" r="2.5" fill="#5D576B"/><circle cx="58" cy="46" r="2.5" fill="#5D576B"/><circle cx="40" cy="44" r="1" fill="white"/><circle cx="56" cy="44" r="1" fill="white"/><path d="M47,54 Q50,58 53,54" fill="none" stroke="#5D576B" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="36" cy="50" rx="3.5" ry="1.8" fill="#FFC107" opacity="0.35"/><ellipse cx="64" cy="50" rx="3.5" ry="1.8" fill="#FFC107" opacity="0.35"/></svg>',

  'svg-candy': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-cn-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFC4E1"/><stop offset="100%" stop-color="#FF9FCC"/></linearGradient><filter id="bv-cn-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#E87FAF" flood-opacity="0.25"/></filter></defs><g filter="url(#bv-cn-ds)"><path d="M50,18 C36,18 20,30 20,48 C20,66 36,80 50,80 C64,80 80,66 80,48 C80,30 64,18 50,18Z" fill="url(#bv-cn-g1)" stroke="#FFFFFF" stroke-width="2.5"/><ellipse cx="38" cy="30" rx="10" ry="8" fill="white" opacity="0.3" transform="rotate(-15 38 30)"/></g><text x="50" y="70" text-anchor="middle" font-family="Pacifico,cursive" font-size="11" fill="#E87FAF" opacity="0.6">xoxo</text><circle cx="40" cy="42" r="2.5" fill="#5D576B"/><circle cx="60" cy="42" r="2.5" fill="#5D576B"/><circle cx="38" cy="40" r="1" fill="white"/><circle cx="58" cy="40" r="1" fill="white"/><path d="M45,50 Q50,54 55,50" fill="none" stroke="#5D576B" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="33" cy="46" rx="4" ry="2" fill="#FF9FCC" opacity="0.4"/><ellipse cx="67" cy="46" rx="4" ry="2" fill="#FF9FCC" opacity="0.4"/><circle cx="26" cy="30" r="3" fill="#B5EAD7" opacity="0.5"/><circle cx="74" cy="30" r="2.5" fill="#C7CEEA" opacity="0.5"/><circle cx="70" cy="72" r="2" fill="#FFDAC1" opacity="0.5"/><circle cx="30" cy="72" r="2.5" fill="#FFE5B4" opacity="0.5"/></svg>',

  'svg-moon': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-mn-g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#B8A9FF"/><stop offset="100%" stop-color="#7B68EE"/></linearGradient><filter id="bv-mn-ds"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#4A3A8F" flood-opacity="0.35"/></filter></defs><g filter="url(#bv-mn-ds)"><circle cx="45" cy="48" r="32" fill="url(#bv-mn-g1)"/><circle cx="60" cy="38" r="25" fill="#1A1033"/><ellipse cx="34" cy="36" rx="8" ry="10" fill="white" opacity="0.2" transform="rotate(-15 34 36)"/></g><circle cx="72" cy="22" r="2.5" fill="#FFECB3" opacity="0.8"/><circle cx="80" cy="35" r="1.5" fill="#FFECB3" opacity="0.6"/><circle cx="76" cy="50" r="2" fill="#FFECB3" opacity="0.7"/><circle cx="68" cy="14" r="1.5" fill="#FFECB3" opacity="0.5"/><path d="M72,22 L74,18 M72,22 L76,22 M72,22 L72,26 M72,22 L68,22" stroke="#FFECB3" stroke-width="0.8" opacity="0.5"/><circle cx="34" cy="44" r="2.5" fill="#5D576B"/><circle cx="50" cy="50" r="2.5" fill="#5D576B"/><circle cx="32.5" cy="42.5" r="1" fill="white"/><circle cx="48.5" cy="48.5" r="1" fill="white"/><path d="M38,56 Q42,60 46,56" fill="none" stroke="#5D576B" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="28" cy="50" rx="3.5" ry="1.8" fill="#B8A9FF" opacity="0.4"/><ellipse cx="56" cy="54" rx="3.5" ry="1.8" fill="#B8A9FF" opacity="0.4"/></svg>',

  'svg-chocolate': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-ch-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#F0D5A8"/><stop offset="100%" stop-color="#D4A574"/></linearGradient><linearGradient id="bv-ch-g2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#8B5E3C"/><stop offset="100%" stop-color="#6D4C2E"/></linearGradient><filter id="bv-ch-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#5C3D2E" flood-opacity="0.3"/></filter></defs><g filter="url(#bv-ch-ds)"><rect x="20" y="40" width="60" height="42" rx="6" fill="url(#bv-ch-g2)" stroke="#DAA520" stroke-width="2"/><path d="M50,15 C38,15 22,28 22,40 L78,40 C78,28 62,15 50,15Z" fill="url(#bv-ch-g1)" stroke="#DAA520" stroke-width="2"/><ellipse cx="38" cy="28" rx="8" ry="6" fill="white" opacity="0.25" transform="rotate(-12 38 28)"/></g><path d="M38,38 L38,42 M50,38 L50,42 M62,38 L62,42" stroke="#DAA520" stroke-width="1.5" opacity="0.5"/><path d="M32,40 Q50,32 68,40" fill="none" stroke="#DAA520" stroke-width="2" opacity="0.4"/><rect x="44" y="10" width="12" height="8" rx="3" fill="#DAA520" opacity="0.6"/><path d="M44,14 Q38,14 38,10 M56,14 Q62,14 62,10" fill="none" stroke="#DAA520" stroke-width="2" stroke-linecap="round" opacity="0.5"/><circle cx="40" cy="28" r="2" fill="#5D576B"/><circle cx="60" cy="28" r="2" fill="#5D576B"/><circle cx="38.5" cy="26.5" r="0.8" fill="white"/><circle cx="58.5" cy="26.5" r="0.8" fill="white"/><path d="M47,33 Q50,36 53,33" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="34" cy="31" rx="3" ry="1.5" fill="#D4A574" opacity="0.4"/><ellipse cx="66" cy="31" rx="3" ry="1.5" fill="#D4A574" opacity="0.4"/><circle cx="35" cy="55" r="5" fill="#8B5E3C" stroke="#6D4C2E" stroke-width="1"/><circle cx="50" cy="58" r="5" fill="#D4A574" stroke="#8B5E3C" stroke-width="1"/><circle cx="65" cy="55" r="5" fill="#F0D5A8" stroke="#D4A574" stroke-width="1"/></svg>',

  'svg-fairy': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-fr-g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E8B4F8"/><stop offset="50%" stop-color="#B8E4F0"/><stop offset="100%" stop-color="#FADADD"/></linearGradient><filter id="bv-fr-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#D8B4FE" flood-opacity="0.3"/></filter></defs><g filter="url(#bv-fr-ds)"><ellipse cx="28" cy="45" rx="18" ry="28" fill="url(#bv-fr-g1)" opacity="0.6" transform="rotate(-15 28 45)"/><ellipse cx="72" cy="45" rx="18" ry="28" fill="url(#bv-fr-g1)" opacity="0.6" transform="rotate(15 72 45)"/><ellipse cx="32" cy="35" rx="10" ry="18" fill="url(#bv-fr-g1)" opacity="0.4" transform="rotate(-25 32 35)"/><ellipse cx="68" cy="35" rx="10" ry="18" fill="url(#bv-fr-g1)" opacity="0.4" transform="rotate(25 68 35)"/></g><circle cx="50" cy="52" r="16" fill="white" stroke="#D8B4FE" stroke-width="2"/><ellipse cx="44" cy="44" rx="4" ry="5" fill="white" opacity="0.35" transform="rotate(-10 44 44)"/><circle cx="44" cy="50" r="2.5" fill="#5D576B"/><circle cx="56" cy="50" r="2.5" fill="#5D576B"/><circle cx="42.5" cy="48.5" r="1" fill="white"/><circle cx="54.5" cy="48.5" r="1" fill="white"/><path d="M47,57 Q50,60 53,57" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="38" cy="54" rx="3.5" ry="1.8" fill="#FADADD" opacity="0.5"/><ellipse cx="62" cy="54" rx="3.5" ry="1.8" fill="#FADADD" opacity="0.5"/><line x1="50" y1="30" x2="50" y2="14" stroke="#D8B4FE" stroke-width="2" stroke-linecap="round"/><path d="M50,14 L46,18 M50,14 L54,18 M50,14 L50,10 M50,14 L46,10 M50,14 L54,10" stroke="#FFECB3" stroke-width="1.5" stroke-linecap="round"/><circle cx="50" cy="14" r="3" fill="#FFECB3"/><circle cx="22" cy="30" r="1.5" fill="#E8B4F8" opacity="0.6"/><circle cx="78" cy="30" r="1.5" fill="#B8E4F0" opacity="0.6"/><circle cx="30" cy="70" r="1" fill="#FADADD" opacity="0.5"/><circle cx="70" cy="70" r="1" fill="#E8B4F8" opacity="0.5"/></svg>',

  'svg-boba': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-bb-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFB3C6"/><stop offset="100%" stop-color="#FF6B8A"/></linearGradient><filter id="bv-bb-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#D4456B" flood-opacity="0.25"/></filter></defs><g filter="url(#bv-bb-ds)"><path d="M30,30 L26,82 C26,86 32,90 50,90 C68,90 74,86 74,82 L70,30Z" fill="url(#bv-bb-g1)" stroke="#FFFFFF" stroke-width="2.5"/><rect x="28" y="26" width="44" height="10" rx="3" fill="#FFFFFF" stroke="#FFB3C6" stroke-width="1.5"/><ellipse cx="42" cy="34" rx="10" ry="4" fill="white" opacity="0.3" transform="rotate(-5 42 34)"/></g><circle cx="40" cy="72" r="5" fill="#D4456B" opacity="0.7"/><circle cx="55" cy="78" r="5" fill="#D4456B" opacity="0.6"/><circle cx="48" cy="82" r="4.5" fill="#D4456B" opacity="0.7"/><circle cx="60" cy="70" r="4" fill="#D4456B" opacity="0.5"/><circle cx="36" cy="80" r="4" fill="#D4456B" opacity="0.6"/><line x1="55" y1="26" x2="55" y2="8" stroke="#D4456B" stroke-width="3" stroke-linecap="round"/><path d="M55,8 C49,8 47,12 55,16 C63,12 61,8 55,8Z" fill="#FF6B8A"/><circle cx="42" cy="48" r="2.5" fill="#5D576B"/><circle cx="58" cy="48" r="2.5" fill="#5D576B"/><circle cx="40.5" cy="46.5" r="1" fill="white"/><circle cx="56.5" cy="46.5" r="1" fill="white"/><path d="M47,55 Q50,58 53,55" fill="none" stroke="#5D576B" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="36" cy="52" rx="3.5" ry="1.8" fill="#FFB3C6" opacity="0.4"/><ellipse cx="64" cy="52" rx="3.5" ry="1.8" fill="#FFB3C6" opacity="0.4"/></svg>',

  'svg-teddy': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-td-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#F5DEB3"/><stop offset="100%" stop-color="#DEB887"/></linearGradient><filter id="bv-td-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#A0522D" flood-opacity="0.25"/></filter></defs><g filter="url(#bv-td-ds)"><circle cx="30" cy="22" r="12" fill="url(#bv-td-g1)" stroke="#C4956A" stroke-width="2"/><circle cx="30" cy="22" r="6" fill="#C4956A" opacity="0.4"/><circle cx="70" cy="22" r="12" fill="url(#bv-td-g1)" stroke="#C4956A" stroke-width="2"/><circle cx="70" cy="22" r="6" fill="#C4956A" opacity="0.4"/><ellipse cx="50" cy="48" rx="28" ry="26" fill="url(#bv-td-g1)" stroke="#C4956A" stroke-width="2.5"/><ellipse cx="50" cy="52" rx="16" ry="12" fill="#F5DEB3" opacity="0.5"/><ellipse cx="40" cy="36" rx="7" ry="8" fill="white" opacity="0.25" transform="rotate(-10 40 36)"/></g><circle cx="42" cy="44" r="2.5" fill="#5D576B"/><circle cx="58" cy="44" r="2.5" fill="#5D576B"/><circle cx="40.5" cy="42.5" r="1" fill="white"/><circle cx="56.5" cy="42.5" r="1" fill="white"/><ellipse cx="50" cy="50" rx="4" ry="3" fill="#C4956A"/><path d="M48,52 Q50,55 52,52" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="36" cy="48" rx="4" ry="2" fill="#DEB887" opacity="0.5"/><ellipse cx="64" cy="48" rx="4" ry="2" fill="#DEB887" opacity="0.5"/><path d="M50,68 C44,68 40,72 50,82 C60,72 56,68 50,68Z" fill="#FF6B8A"/><ellipse cx="46" cy="73" rx="2.5" ry="3" fill="white" opacity="0.35" transform="rotate(-10 46 73)"/></svg>',

  'svg-sakura': '<svg viewBox="0 0 100 100"><defs><radialGradient id="bv-sk-g1" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="#FFD6E0"/><stop offset="100%" stop-color="#FFB7C5"/></radialGradient><filter id="bv-sk-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#C9927E" flood-opacity="0.25"/></filter></defs><g filter="url(#bv-sk-ds)"><ellipse cx="50" cy="24" rx="12" ry="18" fill="url(#bv-sk-g1)" stroke="#E8899A" stroke-width="1.5"/><ellipse cx="50" cy="24" rx="12" ry="18" fill="url(#bv-sk-g1)" stroke="#E8899A" stroke-width="1.5" transform="rotate(72 50 50)"/><ellipse cx="50" cy="24" rx="12" ry="18" fill="url(#bv-sk-g1)" stroke="#E8899A" stroke-width="1.5" transform="rotate(144 50 50)"/><ellipse cx="50" cy="24" rx="12" ry="18" fill="url(#bv-sk-g1)" stroke="#E8899A" stroke-width="1.5" transform="rotate(216 50 50)"/><ellipse cx="50" cy="24" rx="12" ry="18" fill="url(#bv-sk-g1)" stroke="#E8899A" stroke-width="1.5" transform="rotate(288 50 50)"/><ellipse cx="42" cy="20" rx="3" ry="5" fill="white" opacity="0.35" transform="rotate(-20 42 20)"/></g><circle cx="50" cy="50" r="14" fill="#FFF5EE" stroke="#E8899A" stroke-width="2"/><circle cx="44" cy="48" r="2.5" fill="#5D576B"/><circle cx="56" cy="48" r="2.5" fill="#5D576B"/><circle cx="42.5" cy="46.5" r="1" fill="white"/><circle cx="54.5" cy="46.5" r="1" fill="white"/><path d="M47,55 Q50,58 53,55" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="38" cy="52" rx="3" ry="1.5" fill="#FFB7C5" opacity="0.4"/><ellipse cx="62" cy="52" rx="3" ry="1.5" fill="#FFB7C5" opacity="0.4"/></svg>',

  'svg-planet': '<svg viewBox="0 0 100 100"><defs><radialGradient id="bv-pl-g1" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#D4B5F0"/><stop offset="100%" stop-color="#9B6BCD"/></radialGradient><filter id="bv-pl-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#6C4BA0" flood-opacity="0.3"/></filter></defs><g filter="url(#bv-pl-ds)"><ellipse cx="50" cy="50" rx="42" ry="12" fill="none" stroke="#C39BD3" stroke-width="3" transform="rotate(-25 50 50)" opacity="0.6"/><circle cx="50" cy="50" r="25" fill="url(#bv-pl-g1)" stroke="#C39BD3" stroke-width="2"/><ellipse cx="40" cy="38" rx="6" ry="8" fill="white" opacity="0.25" transform="rotate(-15 40 38)"/></g><path d="M35,36 C30,30 24,34 35,44 C46,34 40,30 35,36Z" fill="#FF8FAB" transform="rotate(-25 50 50) translate(30,-10)" opacity="0.7"/><circle cx="44" cy="48" r="2.5" fill="#5D576B"/><circle cx="56" cy="48" r="2.5" fill="#5D576B"/><circle cx="42.5" cy="46.5" r="1" fill="white"/><circle cx="54.5" cy="46.5" r="1" fill="white"/><path d="M47,55 Q50,58 53,55" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="38" cy="52" rx="3.5" ry="1.8" fill="#D4B5F0" opacity="0.4"/><ellipse cx="62" cy="52" rx="3.5" ry="1.8" fill="#D4B5F0" opacity="0.4"/><circle cx="72" cy="22" r="2" fill="#FFECB3" opacity="0.7"/><circle cx="82" cy="38" r="1.5" fill="#FFECB3" opacity="0.5"/></svg>',

  'svg-bee': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-be-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFF0B5"/><stop offset="100%" stop-color="#FFD166"/></linearGradient><filter id="bv-be-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#C89020" flood-opacity="0.25"/></filter></defs><g filter="url(#bv-be-ds)"><path d="M28,38 C22,38 18,44 28,52 C38,44 34,38 28,38Z" fill="rgba(255,255,255,0.7)" stroke="#FFD166" stroke-width="1" transform="rotate(-15 28 45)"/><path d="M72,38 C66,38 62,44 72,52 C82,44 78,38 72,38Z" fill="rgba(255,255,255,0.7)" stroke="#FFD166" stroke-width="1" transform="rotate(15 72 45)"/><ellipse cx="50" cy="50" rx="22" ry="25" fill="url(#bv-be-g1)" stroke="#E8A830" stroke-width="2"/><ellipse cx="40" cy="38" rx="6" ry="7" fill="white" opacity="0.3" transform="rotate(-12 40 38)"/></g><rect x="32" y="42" width="36" height="4" rx="1" fill="#5D576B" opacity="0.5"/><rect x="34" y="52" width="32" height="4" rx="1" fill="#5D576B" opacity="0.5"/><rect x="36" y="62" width="28" height="4" rx="1" fill="#5D576B" opacity="0.45"/><circle cx="43" cy="44" r="2.5" fill="#5D576B"/><circle cx="57" cy="44" r="2.5" fill="#5D576B"/><circle cx="41.5" cy="42.5" r="1" fill="white"/><circle cx="55.5" cy="42.5" r="1" fill="white"/><path d="M47,50 Q50,53 53,50" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="37" cy="48" rx="3" ry="1.5" fill="#FFD166" opacity="0.4"/><ellipse cx="63" cy="48" rx="3" ry="1.5" fill="#FFD166" opacity="0.4"/><line x1="42" y1="26" x2="38" y2="16" stroke="#5D576B" stroke-width="2" stroke-linecap="round"/><line x1="58" y1="26" x2="62" y2="16" stroke="#5D576B" stroke-width="2" stroke-linecap="round"/><circle cx="38" cy="14" r="2.5" fill="#5D576B"/><circle cx="62" cy="14" r="2.5" fill="#5D576B"/></svg>',

  'svg-wineglass': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-wg-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#D4677A"/><stop offset="100%" stop-color="#9B2335"/></linearGradient><filter id="bv-wg-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#6D1A26" flood-opacity="0.3"/></filter></defs><g filter="url(#bv-wg-ds)"><path d="M30,15 L28,48 C28,56 38,62 50,62 C62,62 72,56 72,48 L70,15Z" fill="none" stroke="#B8860B" stroke-width="2"/><path d="M30,15 L28,48 C28,56 38,62 50,62 C62,62 72,56 72,48 L70,15Z" fill="rgba(255,255,255,0.15)"/><path d="M30,32 L28,48 C28,56 38,62 50,62 C62,62 72,56 72,48 L70,32Z" fill="url(#bv-wg-g1)"/><ellipse cx="38" cy="24" rx="6" ry="4" fill="white" opacity="0.2" transform="rotate(-10 38 24)"/></g><line x1="50" y1="62" x2="50" y2="80" stroke="#B8860B" stroke-width="2.5"/><ellipse cx="50" cy="82" rx="16" ry="4" fill="none" stroke="#B8860B" stroke-width="2"/><path d="M42,40 C38,36 35,40 42,46 C49,40 46,36 42,40Z" fill="#FF8FAB" opacity="0.6"/><path d="M58,42 C54,38 51,42 58,48 C65,42 62,38 58,42Z" fill="#FFB3C6" opacity="0.5"/><circle cx="43" cy="34" r="2" fill="#5D576B"/><circle cx="57" cy="34" r="2" fill="#5D576B"/><circle cx="41.5" cy="32.5" r="0.8" fill="white"/><circle cx="55.5" cy="32.5" r="0.8" fill="white"/><path d="M47,38 Q50,41 53,38" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="37" cy="36" rx="3" ry="1.5" fill="#D4677A" opacity="0.35"/><ellipse cx="63" cy="36" rx="3" ry="1.5" fill="#D4677A" opacity="0.35"/></svg>',

  'svg-kitty': '<svg viewBox="0 0 100 100"><defs><radialGradient id="bv-kt-g1" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="#FFE4CC"/><stop offset="100%" stop-color="#FFCBA4"/></radialGradient><filter id="bv-kt-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#DEB887" flood-opacity="0.25"/></filter></defs><g filter="url(#bv-kt-ds)"><path d="M25,40 L18,12 L35,30Z" fill="url(#bv-kt-g1)" stroke="#F0A070" stroke-width="2"/><path d="M75,40 L82,12 L65,30Z" fill="url(#bv-kt-g1)" stroke="#F0A070" stroke-width="2"/><path d="M26,18 L23,14" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round" opacity="0.6"/><path d="M74,18 L77,14" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round" opacity="0.6"/><ellipse cx="50" cy="50" rx="28" ry="26" fill="url(#bv-kt-g1)" stroke="#F0A070" stroke-width="2.5"/><ellipse cx="40" cy="38" rx="7" ry="8" fill="white" opacity="0.25" transform="rotate(-10 40 38)"/></g><circle cx="40" cy="46" r="3" fill="#5D576B"/><circle cx="60" cy="46" r="3" fill="#5D576B"/><circle cx="38" cy="44" r="1.2" fill="white"/><circle cx="58" cy="44" r="1.2" fill="white"/><ellipse cx="50" cy="54" rx="3" ry="2" fill="#F0A070"/><path d="M47,56 Q50,59 53,56" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><line x1="30" y1="50" x2="16" y2="48" stroke="#F0A070" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/><line x1="30" y1="54" x2="16" y2="56" stroke="#F0A070" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/><line x1="70" y1="50" x2="84" y2="48" stroke="#F0A070" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/><line x1="70" y1="54" x2="84" y2="56" stroke="#F0A070" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/><ellipse cx="34" cy="50" rx="3.5" ry="1.8" fill="#FFB6C1" opacity="0.4"/><ellipse cx="66" cy="50" rx="3.5" ry="1.8" fill="#FFB6C1" opacity="0.4"/><path d="M78,70 Q82,55 80,42" fill="none" stroke="#FFCBA4" stroke-width="4" stroke-linecap="round"/><path d="M80,42 C76,38 73,42 80,48 C87,42 84,38 80,42Z" fill="#FF6B8A" opacity="0.7"/></svg>',

  'svg-pixel-heart': '<svg viewBox="0 0 100 100"><defs><filter id="bv-px-ds"><feDropShadow dx="0" dy="2" stdDeviation="1" flood-color="#C01070" flood-opacity="0.3"/></filter></defs><g filter="url(#bv-px-ds)"><rect x="22" y="26" width="8" height="8" fill="#FF1493"/><rect x="30" y="18" width="8" height="8" fill="#FF69B4"/><rect x="38" y="18" width="8" height="8" fill="#FF1493"/><rect x="22" y="34" width="8" height="8" fill="#FF69B4"/><rect x="14" y="26" width="8" height="8" fill="#FF1493"/><rect x="14" y="34" width="8" height="8" fill="#FF69B4"/><rect x="22" y="42" width="8" height="8" fill="#FF1493"/><rect x="30" y="50" width="8" height="8" fill="#FF69B4"/><rect x="38" y="58" width="8" height="8" fill="#FF1493"/><rect x="46" y="66" width="8" height="8" fill="#FF69B4"/><rect x="38" y="26" width="8" height="8" fill="#FF69B4"/><rect x="30" y="26" width="8" height="8" fill="#FF1493"/><rect x="30" y="34" width="8" height="8" fill="#FF69B4"/><rect x="38" y="34" width="8" height="8" fill="#FF1493"/><rect x="30" y="42" width="8" height="8" fill="#FF69B4"/><rect x="38" y="42" width="8" height="8" fill="#FF1493"/><rect x="38" y="50" width="8" height="8" fill="#FF69B4"/><rect x="46" y="58" width="8" height="8" fill="#FF1493"/><rect x="46" y="50" width="8" height="8" fill="#FF1493"/><rect x="46" y="42" width="8" height="8" fill="#FF69B4"/><rect x="46" y="34" width="8" height="8" fill="#FF1493"/><rect x="46" y="26" width="8" height="8" fill="#FF69B4"/><rect x="46" y="18" width="8" height="8" fill="#FF69B4"/><rect x="54" y="18" width="8" height="8" fill="#FF1493"/><rect x="62" y="18" width="8" height="8" fill="#FF69B4"/><rect x="70" y="26" width="8" height="8" fill="#FF1493"/><rect x="78" y="26" width="8" height="8" fill="#FF69B4"/><rect x="78" y="34" width="8" height="8" fill="#FF1493"/><rect x="70" y="34" width="8" height="8" fill="#FF69B4"/><rect x="62" y="26" width="8" height="8" fill="#FF1493"/><rect x="54" y="26" width="8" height="8" fill="#FF69B4"/><rect x="54" y="34" width="8" height="8" fill="#FF1493"/><rect x="62" y="34" width="8" height="8" fill="#FF69B4"/><rect x="70" y="42" width="8" height="8" fill="#FF1493"/><rect x="62" y="42" width="8" height="8" fill="#FF69B4"/><rect x="54" y="42" width="8" height="8" fill="#FF1493"/><rect x="62" y="50" width="8" height="8" fill="#FF69B4"/><rect x="54" y="50" width="8" height="8" fill="#FF1493"/><rect x="54" y="58" width="8" height="8" fill="#FF69B4"/><rect x="22" y="18" width="8" height="8" fill="#FF69B4"/></g><rect x="30" y="30" width="4" height="4" fill="white" opacity="0.5"/><rect x="34" y="26" width="4" height="4" fill="white" opacity="0.4"/><circle cx="40" cy="40" r="2" fill="#5D576B"/><circle cx="58" cy="40" r="2" fill="#5D576B"/><circle cx="38.5" cy="38.5" r="0.8" fill="white"/><circle cx="56.5" cy="38.5" r="0.8" fill="white"/><path d="M46,46 Q50,49 54,46" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/></svg>',

  'svg-lavender': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-lv-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#DCC5F0"/><stop offset="100%" stop-color="#B57EDC"/></linearGradient><filter id="bv-lv-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#8A55BF" flood-opacity="0.25"/></filter></defs><g filter="url(#bv-lv-ds)"><line x1="35" y1="88" x2="38" y2="35" stroke="#7CB342" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="88" x2="50" y2="30" stroke="#7CB342" stroke-width="2.5" stroke-linecap="round"/><line x1="65" y1="88" x2="62" y2="35" stroke="#7CB342" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="38" cy="34" rx="4" ry="5" fill="url(#bv-lv-g1)"/><ellipse cx="36" cy="26" rx="3.5" ry="4.5" fill="url(#bv-lv-g1)"/><ellipse cx="37" cy="18" rx="3" ry="4" fill="#DCC5F0"/><ellipse cx="50" cy="28" rx="4.5" ry="5.5" fill="url(#bv-lv-g1)"/><ellipse cx="50" cy="20" rx="4" ry="5" fill="url(#bv-lv-g1)"/><ellipse cx="50" cy="12" rx="3" ry="4" fill="#DCC5F0"/><ellipse cx="62" cy="34" rx="4" ry="5" fill="url(#bv-lv-g1)"/><ellipse cx="64" cy="26" rx="3.5" ry="4.5" fill="url(#bv-lv-g1)"/><ellipse cx="63" cy="18" rx="3" ry="4" fill="#DCC5F0"/></g><path d="M32,82 Q50,70 68,82" fill="none" stroke="#E91E63" stroke-width="3" stroke-linecap="round"/><path d="M50,76 C44,70 40,74 50,82 C60,74 56,70 50,76Z" fill="#E91E63"/><circle cx="44" cy="76" r="2" fill="#5D576B"/><circle cx="56" cy="76" r="2" fill="#5D576B"/><circle cx="42.5" cy="74.5" r="0.8" fill="white"/><circle cx="54.5" cy="74.5" r="0.8" fill="white"/><path d="M47,80 Q50,82 53,80" fill="none" stroke="#5D576B" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="40" cy="78" rx="2.5" ry="1.2" fill="#FFB6C1" opacity="0.4"/><ellipse cx="60" cy="78" rx="2.5" ry="1.2" fill="#FFB6C1" opacity="0.4"/></svg>',

  'svg-potion': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-pt-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#F0A0D8"/><stop offset="100%" stop-color="#E05EBF"/></linearGradient><filter id="bv-pt-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#A03B8A" flood-opacity="0.3"/></filter></defs><g filter="url(#bv-pt-ds)"><path d="M35,35 L28,55 C22,70 30,85 50,85 C70,85 78,70 72,55 L65,35Z" fill="url(#bv-pt-g1)" stroke="#9B59B6" stroke-width="2"/><ellipse cx="42" cy="48" rx="6" ry="4" fill="white" opacity="0.2" transform="rotate(-10 42 48)"/><rect x="38" y="22" width="24" height="14" rx="3" fill="#F0E6FF" stroke="#9B59B6" stroke-width="2"/><rect x="42" y="16" width="16" height="8" rx="4" fill="#C4956A" stroke="#A0522D" stroke-width="1.5"/></g><path d="M42,55 C38,50 35,54 42,60 C49,54 46,50 42,55Z" fill="#FF8FAB" opacity="0.5"/><path d="M58,62 C54,58 51,62 58,68 C65,62 62,58 58,62Z" fill="#FFB3C6" opacity="0.4"/><circle cx="52" cy="72" r="3" fill="rgba(255,255,255,0.3)"/><circle cx="40" cy="68" r="2" fill="rgba(255,255,255,0.25)"/><circle cx="44" cy="42" r="2" fill="#5D576B"/><circle cx="56" cy="42" r="2" fill="#5D576B"/><circle cx="42.5" cy="40.5" r="0.8" fill="white"/><circle cx="54.5" cy="40.5" r="0.8" fill="white"/><path d="M47,47 Q50,50 53,47" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="38" cy="45" rx="3" ry="1.5" fill="#F0A0D8" opacity="0.4"/><ellipse cx="62" cy="45" rx="3" ry="1.5" fill="#F0A0D8" opacity="0.4"/></svg>',

  'svg-milkcarton': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-mk-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD6DF"/><stop offset="100%" stop-color="#FFB5C5"/></linearGradient><filter id="bv-mk-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#E8909F" flood-opacity="0.25"/></filter></defs><g filter="url(#bv-mk-ds)"><rect x="28" y="30" width="44" height="55" rx="4" fill="url(#bv-mk-g1)" stroke="#FF69B4" stroke-width="2"/><path d="M28,30 L40,12 L60,12 L72,30Z" fill="#FFF8FA" stroke="#FF69B4" stroke-width="2"/><ellipse cx="40" cy="22" rx="4" ry="2" fill="white" opacity="0.3"/></g><rect x="34" y="42" width="32" height="20" rx="3" fill="white" opacity="0.5"/><path d="M50,48 C44,40 36,44 50,58 C64,44 56,40 50,48Z" fill="#FF69B4" opacity="0.5"/><line x1="62" y1="14" x2="68" y2="4" stroke="#FF69B4" stroke-width="3" stroke-linecap="round"/><line x1="68" y1="4" x2="72" y2="6" stroke="#FF69B4" stroke-width="3" stroke-linecap="round"/><circle cx="42" cy="34" r="2" fill="#5D576B"/><circle cx="58" cy="34" r="2" fill="#5D576B"/><circle cx="40.5" cy="32.5" r="0.8" fill="white"/><circle cx="56.5" cy="32.5" r="0.8" fill="white"/><path d="M47,39 Q50,42 53,39" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="36" cy="37" rx="3" ry="1.5" fill="#FFB5C5" opacity="0.4"/><ellipse cx="64" cy="37" rx="3" ry="1.5" fill="#FFB5C5" opacity="0.4"/><text x="50" y="78" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="7" fill="#E8909F" opacity="0.7">MILK</text></svg>',

  'svg-crown': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-cr-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFE44D"/><stop offset="100%" stop-color="#FFD700"/></linearGradient><filter id="bv-cr-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#B8860B" flood-opacity="0.3"/></filter></defs><g filter="url(#bv-cr-ds)"><path d="M15,60 L22,25 L38,45 L50,18 L62,45 L78,25 L85,60Z" fill="url(#bv-cr-g1)" stroke="#DAA520" stroke-width="2.5"/><rect x="15" y="60" width="70" height="14" rx="3" fill="url(#bv-cr-g1)" stroke="#DAA520" stroke-width="2"/><ellipse cx="35" cy="32" rx="5" ry="6" fill="white" opacity="0.25" transform="rotate(-10 35 32)"/></g><circle cx="22" cy="25" r="4" fill="#FFE44D" stroke="#DAA520" stroke-width="1.5"/><circle cx="50" cy="18" r="4" fill="#FFE44D" stroke="#DAA520" stroke-width="1.5"/><circle cx="78" cy="25" r="4" fill="#FFE44D" stroke="#DAA520" stroke-width="1.5"/><path d="M35,52 C31,48 28,52 35,58 C42,52 39,48 35,52Z" fill="#DC143C" opacity="0.7"/><path d="M50,50 C46,46 43,50 50,56 C57,50 54,46 50,50Z" fill="#FF4D6D" opacity="0.7"/><path d="M65,52 C61,48 58,52 65,58 C72,52 69,48 65,52Z" fill="#DC143C" opacity="0.7"/><circle cx="42" cy="82" r="2.5" fill="#5D576B"/><circle cx="58" cy="82" r="2.5" fill="#5D576B"/><circle cx="40.5" cy="80.5" r="1" fill="white"/><circle cx="56.5" cy="80.5" r="1" fill="white"/><path d="M47,88 Q50,91 53,88" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="36" cy="85" rx="3.5" ry="1.8" fill="#FFC8DD" opacity="0.4"/><ellipse cx="64" cy="85" rx="3.5" ry="1.8" fill="#FFC8DD" opacity="0.4"/></svg>'
};

// Extra SVG Kawaii Icons
var blondieIconsSVGExtra = {
  'svg-heart': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-ht-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FF8FAB"/><stop offset="100%" stop-color="#FF4D6D"/></linearGradient><filter id="bv-ht-ds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#C62B4A" flood-opacity="0.25"/></filter></defs><g filter="url(#bv-ht-ds)"><path d="M50,25 C40,10 15,10 15,35 C15,60 50,85 50,85 C50,85 85,60 85,35 C85,10 60,10 50,25Z" fill="url(#bv-ht-g1)" stroke="#E8758B" stroke-width="2"/><ellipse cx="35" cy="30" rx="10" ry="12" fill="white" opacity="0.3" transform="rotate(-15 35 30)"/></g><circle cx="40" cy="42" r="2.5" fill="#5D576B"/><circle cx="60" cy="42" r="2.5" fill="#5D576B"/><circle cx="38" cy="40" r="1" fill="white"/><circle cx="58" cy="40" r="1" fill="white"/><path d="M46,52 Q50,56 54,52" fill="none" stroke="#5D576B" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="34" cy="46" rx="3.5" ry="1.8" fill="#FF8FAB" opacity="0.4"/><ellipse cx="66" cy="46" rx="3.5" ry="1.8" fill="#FF8FAB" opacity="0.4"/></svg>',

  'svg-pink-heart': '<svg viewBox="0 0 100 100"><defs><radialGradient id="bv-ph-g1" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="#FFC4E1"/><stop offset="100%" stop-color="#FF9FCC"/></radialGradient></defs><path d="M50,25 C40,10 15,10 15,35 C15,60 50,85 50,85 C50,85 85,60 85,35 C85,10 60,10 50,25Z" fill="url(#bv-ph-g1)" stroke="#FFC4E1" stroke-width="2"/><ellipse cx="33" cy="28" rx="8" ry="10" fill="white" opacity="0.35" transform="rotate(-18 33 28)"/><circle cx="25" cy="18" r="2" fill="#FFECB3" opacity="0.7"/><circle cx="75" cy="20" r="1.5" fill="#FFECB3" opacity="0.6"/><circle cx="80" cy="38" r="2" fill="#FFECB3" opacity="0.5"/><path d="M25,18 L26,15 M25,18 L22,18 M25,18 L25,21" stroke="#FFECB3" stroke-width="0.8" opacity="0.6"/><path d="M75,20 L76,17 M75,20 L72,20" stroke="#FFECB3" stroke-width="0.8" opacity="0.5"/></svg>',

  'svg-ribbon': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-rb-g1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFC8DD"/><stop offset="100%" stop-color="#FF8FAB"/></linearGradient></defs><g><path d="M50,40 C50,40 20,25 15,45 C10,65 42,55 50,55 C58,55 90,65 85,45 C80,25 50,40 50,40Z" fill="url(#bv-rb-g1)" stroke="#E8758B" stroke-width="1.5"/><ellipse cx="35" cy="38" rx="6" ry="4" fill="white" opacity="0.3" transform="rotate(-10 35 38)"/><path d="M44,55 L34,85 C34,85 44,75 50,78 C56,75 66,85 66,85 L56,55" fill="#FF8FAB" stroke="#E8758B" stroke-width="1.5"/><circle cx="50" cy="48" r="6" fill="#E8758B"/><ellipse cx="48" cy="46" rx="2" ry="2.5" fill="white" opacity="0.35"/></g></svg>',

  'svg-butterfly': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-bf-g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E8B4F8"/><stop offset="100%" stop-color="#FFC8DD"/></linearGradient></defs><ellipse cx="28" cy="38" rx="20" ry="16" fill="url(#bv-bf-g1)" opacity="0.8" transform="rotate(-10 28 38)"/><ellipse cx="72" cy="38" rx="20" ry="16" fill="url(#bv-bf-g1)" opacity="0.8" transform="rotate(10 72 38)"/><ellipse cx="32" cy="60" rx="14" ry="12" fill="#FFC8DD" opacity="0.7" transform="rotate(-5 32 60)"/><ellipse cx="68" cy="60" rx="14" ry="12" fill="#FFC8DD" opacity="0.7" transform="rotate(5 68 60)"/><path d="M50,25 C50,25 50,80 50,80" stroke="#5D576B" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="24" cy="34" rx="5" ry="4" fill="white" opacity="0.35"/><ellipse cx="76" cy="34" rx="5" ry="4" fill="white" opacity="0.35"/><circle cx="45" cy="32" r="4" fill="#FF8FAB" opacity="0.4"/><circle cx="55" cy="32" r="4" fill="#FF8FAB" opacity="0.4"/><circle cx="50" cy="22" r="2" fill="#5D576B"/><path d="M48,18 C44,10 42,8 40,10" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><path d="M52,18 C56,10 58,8 60,10" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><circle cx="40" cy="10" r="2" fill="#E8B4F8"/><circle cx="60" cy="10" r="2" fill="#E8B4F8"/></svg>',

  'svg-sparkle': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-sp-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFECB3"/><stop offset="100%" stop-color="#FFD700"/></linearGradient></defs><path d="M50,8 L56,38 L86,44 L56,50 L50,80 L44,50 L14,44 L44,38Z" fill="url(#bv-sp-g1)" stroke="#DAA520" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="42" cy="34" rx="5" ry="6" fill="white" opacity="0.35" transform="rotate(-15 42 34)"/><circle cx="44" cy="42" r="2" fill="#5D576B"/><circle cx="56" cy="42" r="2" fill="#5D576B"/><circle cx="43" cy="40.5" r="0.8" fill="white"/><circle cx="55" cy="40.5" r="0.8" fill="white"/><path d="M48,48 Q50,51 52,48" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="40" cy="45" rx="3" ry="1.5" fill="#FFD700" opacity="0.35"/><ellipse cx="60" cy="45" rx="3" ry="1.5" fill="#FFD700" opacity="0.35"/><circle cx="30" cy="20" r="1.5" fill="#FFECB3" opacity="0.6"/><circle cx="75" cy="25" r="1" fill="#FFECB3" opacity="0.5"/><circle cx="70" cy="65" r="1.5" fill="#FFECB3" opacity="0.6"/></svg>',

  'svg-kiss': '<svg viewBox="0 0 100 100"><defs><radialGradient id="bv-ks-g1" cx="40%" cy="40%" r="55%"><stop offset="0%" stop-color="#FF8FAB"/><stop offset="100%" stop-color="#E8758B"/></radialGradient></defs><path d="M30,35 C30,20 45,18 50,32 C55,18 70,20 70,35 C70,55 50,70 50,70 C50,70 30,55 30,35Z" fill="url(#bv-ks-g1)"/><ellipse cx="38" cy="30" rx="6" ry="7" fill="white" opacity="0.3" transform="rotate(-15 38 30)"/><path d="M38,50 Q50,60 62,50" fill="none" stroke="#C62B4A" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/><circle cx="75" cy="25" r="2.5" fill="#FFECB3" opacity="0.7"/><path d="M75,25 L76,21 M75,25 L79,25 M75,25 L75,29 M75,25 L71,25" stroke="#FFECB3" stroke-width="1" opacity="0.6"/><circle cx="22" cy="55" r="2" fill="#FFECB3" opacity="0.6"/></svg>',

  'svg-cherry': '<svg viewBox="0 0 100 100"><defs><radialGradient id="bv-cr-g1" cx="35%" cy="35%" r="60%"><stop offset="0%" stop-color="#FF8FA3"/><stop offset="100%" stop-color="#FF4D6D"/></radialGradient></defs><path d="M38,30 C38,15 50,5 62,15" fill="none" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round"/><path d="M62,30 C62,15 55,5 50,10" fill="none" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="52" cy="10" rx="8" ry="5" fill="#4CAF50" opacity="0.7" transform="rotate(-20 52 10)"/><circle cx="35" cy="55" r="20" fill="url(#bv-cr-g1)" stroke="#C62B4A" stroke-width="1.5"/><ellipse cx="28" cy="46" rx="6" ry="7" fill="white" opacity="0.3" transform="rotate(-15 28 46)"/><circle cx="65" cy="55" r="20" fill="url(#bv-cr-g1)" stroke="#C62B4A" stroke-width="1.5"/><ellipse cx="58" cy="46" rx="6" ry="7" fill="white" opacity="0.3" transform="rotate(-15 58 46)"/><circle cx="29" cy="52" r="2" fill="#5D576B"/><circle cx="41" cy="52" r="2" fill="#5D576B"/><path d="M33,58 Q35,61 37,58" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><circle cx="59" cy="52" r="2" fill="#5D576B"/><circle cx="71" cy="52" r="2" fill="#5D576B"/><path d="M63,58 Q65,61 67,58" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/></svg>',

  'svg-cupcake': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-cc-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFC8DD"/><stop offset="100%" stop-color="#FF8FAB"/></linearGradient></defs><path d="M30,50 L34,88 C34,90 42,92 50,92 C58,92 66,90 66,88 L70,50Z" fill="#F5DEB3" stroke="#D4A57B" stroke-width="2"/><path d="M30,50 L70,50 C70,50 72,35 65,28 C58,21 52,30 50,30 C48,30 42,21 35,28 C28,35 30,50 30,50Z" fill="url(#bv-cc-g1)" stroke="#E8758B" stroke-width="1.5"/><ellipse cx="42" cy="38" rx="6" ry="5" fill="white" opacity="0.3" transform="rotate(-10 42 38)"/><circle cx="50" cy="22" r="5" fill="#FF4D6D"/><path d="M50,18 C47,18 46,20 50,24 C54,20 53,18 50,18Z" fill="#FF8FAB"/><circle cx="42" cy="42" r="2" fill="#5D576B"/><circle cx="58" cy="42" r="2" fill="#5D576B"/><path d="M48,48 Q50,50 52,48" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="36" cy="45" rx="3" ry="1.5" fill="#FFC8DD" opacity="0.5"/><ellipse cx="64" cy="45" rx="3" ry="1.5" fill="#FFC8DD" opacity="0.5"/><path d="M34,60 L66,60 M36,70 L64,70 M38,80 L62,80" stroke="#D4A57B" stroke-width="1" opacity="0.3"/></svg>',

  'svg-lollipop': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-lp-g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF8FAB"/><stop offset="50%" stop-color="#FFC8DD"/><stop offset="100%" stop-color="#FF8FAB"/></linearGradient></defs><line x1="50" y1="60" x2="50" y2="95" stroke="#D4A57B" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="38" r="25" fill="url(#bv-lp-g1)" stroke="#E8758B" stroke-width="2"/><path d="M50,18 A8,8 0 0,1 58,26 A8,8 0 0,1 50,34 A8,8 0 0,0 42,42 A8,8 0 0,0 50,50" fill="none" stroke="white" stroke-width="3" opacity="0.4"/><ellipse cx="40" cy="28" rx="6" ry="8" fill="white" opacity="0.3" transform="rotate(-20 40 28)"/><circle cx="44" cy="36" r="2" fill="#5D576B"/><circle cx="56" cy="36" r="2" fill="#5D576B"/><path d="M48,43 Q50,46 52,43" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="38" cy="40" rx="3" ry="1.5" fill="#FF8FAB" opacity="0.4"/><ellipse cx="62" cy="40" rx="3" ry="1.5" fill="#FF8FAB" opacity="0.4"/></svg>',

  'svg-flower': '<svg viewBox="0 0 100 100"><defs><radialGradient id="bv-fl-g1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFC8DD"/><stop offset="100%" stop-color="#FF8FAB"/></radialGradient></defs><ellipse cx="50" cy="25" rx="12" ry="16" fill="url(#bv-fl-g1)" opacity="0.8"/><ellipse cx="30" cy="40" rx="12" ry="16" fill="url(#bv-fl-g1)" opacity="0.75" transform="rotate(-60 30 40)"/><ellipse cx="70" cy="40" rx="12" ry="16" fill="url(#bv-fl-g1)" opacity="0.75" transform="rotate(60 70 40)"/><ellipse cx="35" cy="62" rx="12" ry="16" fill="url(#bv-fl-g1)" opacity="0.7" transform="rotate(-30 35 62)"/><ellipse cx="65" cy="62" rx="12" ry="16" fill="url(#bv-fl-g1)" opacity="0.7" transform="rotate(30 65 62)"/><circle cx="50" cy="48" r="14" fill="#FFECB3" stroke="#FFD700" stroke-width="1.5"/><ellipse cx="46" cy="42" rx="4" ry="5" fill="white" opacity="0.3"/><circle cx="44" cy="46" r="2" fill="#5D576B"/><circle cx="56" cy="46" r="2" fill="#5D576B"/><circle cx="43" cy="44.5" r="0.8" fill="white"/><circle cx="55" cy="44.5" r="0.8" fill="white"/><path d="M48,52 Q50,55 52,52" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="40" cy="50" rx="3" ry="1.5" fill="#FFD700" opacity="0.3"/><ellipse cx="60" cy="50" rx="3" ry="1.5" fill="#FFD700" opacity="0.3"/></svg>',

  'svg-diamond': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-dm-g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E8B4F8"/><stop offset="50%" stop-color="#B8E4F0"/><stop offset="100%" stop-color="#FFC8DD"/></linearGradient></defs><path d="M50,10 L80,35 L50,90 L20,35Z" fill="url(#bv-dm-g1)" stroke="#D8B4FE" stroke-width="2" stroke-linejoin="round"/><path d="M20,35 L80,35 M50,10 L35,35 L50,90 M50,10 L65,35 L50,90" fill="none" stroke="white" stroke-width="1" opacity="0.4"/><ellipse cx="38" cy="30" rx="6" ry="8" fill="white" opacity="0.3" transform="rotate(-10 38 30)"/><circle cx="42" cy="45" r="2" fill="#5D576B"/><circle cx="58" cy="45" r="2" fill="#5D576B"/><path d="M48,52 Q50,55 52,52" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="38" cy="48" rx="3" ry="1.5" fill="#E8B4F8" opacity="0.35"/><ellipse cx="62" cy="48" rx="3" ry="1.5" fill="#E8B4F8" opacity="0.35"/></svg>',

  'svg-crown': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-cw-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFECB3"/><stop offset="100%" stop-color="#FFD700"/></linearGradient></defs><path d="M18,65 L18,35 L35,50 L50,25 L65,50 L82,35 L82,65Z" fill="url(#bv-cw-g1)" stroke="#DAA520" stroke-width="2" stroke-linejoin="round"/><rect x="18" y="65" width="64" height="12" rx="3" fill="#FFD700" stroke="#DAA520" stroke-width="2"/><ellipse cx="35" cy="48" rx="6" ry="5" fill="white" opacity="0.25" transform="rotate(-10 35 48)"/><circle cx="50" cy="25" r="4" fill="#FF8FAB"/><circle cx="18" cy="35" r="3" fill="#FF8FAB" opacity="0.7"/><circle cx="82" cy="35" r="3" fill="#FF8FAB" opacity="0.7"/><circle cx="42" cy="52" r="2" fill="#5D576B"/><circle cx="58" cy="52" r="2" fill="#5D576B"/><path d="M48,58 Q50,61 52,58" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="36" cy="56" rx="3" ry="1.5" fill="#FFD700" opacity="0.4"/><ellipse cx="64" cy="56" rx="3" ry="1.5" fill="#FFD700" opacity="0.4"/><path d="M50,25 C47,25 46,27 50,31 C54,27 53,25 50,25Z" fill="#FFC8DD" opacity="0.6"/></svg>',

  'svg-dove': '<svg viewBox="0 0 100 100"><defs><radialGradient id="bv-dv-g1" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#E8E4F0"/></radialGradient></defs><ellipse cx="50" cy="50" rx="22" ry="16" fill="url(#bv-dv-g1)" stroke="#C7CEEA" stroke-width="1.5"/><circle cx="50" cy="38" r="14" fill="url(#bv-dv-g1)" stroke="#C7CEEA" stroke-width="1.5"/><ellipse cx="24" cy="48" rx="18" ry="8" fill="white" stroke="#C7CEEA" stroke-width="1" transform="rotate(-15 24 48)" opacity="0.85"/><ellipse cx="18" cy="44" rx="12" ry="5" fill="white" stroke="#C7CEEA" stroke-width="1" transform="rotate(-25 18 44)" opacity="0.7"/><path d="M65,58 L72,65 L62,62 L68,70 L58,64" fill="white" stroke="#C7CEEA" stroke-width="1" stroke-linejoin="round"/><circle cx="45" cy="36" r="2" fill="#5D576B"/><circle cx="43.5" cy="34.5" r="0.8" fill="white"/><path d="M52,40 L58,42" stroke="#DAA520" stroke-width="2" stroke-linecap="round"/><path d="M40,62 L36,72 C36,72 42,68 44,70 C46,68 52,72 52,72 L48,62" fill="#FF8FAB" opacity="0.5"/></svg>',

  'svg-potion': '<svg viewBox="0 0 100 100"><defs><linearGradient id="bv-pt-g1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#E8B4F8"/><stop offset="60%" stop-color="#FF8FAB"/><stop offset="100%" stop-color="#FF4D6D"/></linearGradient></defs><rect x="42" y="10" width="16" height="14" rx="3" fill="#C7CEEA" stroke="#A0A0C0" stroke-width="1.5"/><path d="M42,24 L32,42 C28,50 28,62 28,68 C28,82 38,90 50,90 C62,90 72,82 72,68 C72,62 72,50 68,42 L58,24Z" fill="url(#bv-pt-g1)" stroke="#D8B4FE" stroke-width="2"/><ellipse cx="42" cy="50" rx="8" ry="10" fill="white" opacity="0.25" transform="rotate(-10 42 50)"/><circle cx="40" cy="72" r="3" fill="white" opacity="0.3"/><circle cx="55" cy="78" r="2" fill="white" opacity="0.25"/><circle cx="48" cy="80" r="1.5" fill="white" opacity="0.2"/><path d="M50,10 C47,10 46,12 50,16 C54,12 53,10 50,10Z" fill="#FF8FAB" opacity="0.7"/><circle cx="44" cy="55" r="2" fill="#5D576B"/><circle cx="56" cy="55" r="2" fill="#5D576B"/><circle cx="42.5" cy="53.5" r="0.8" fill="white"/><circle cx="54.5" cy="53.5" r="0.8" fill="white"/><path d="M48,62 Q50,65 52,62" fill="none" stroke="#5D576B" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="38" cy="58" rx="3" ry="1.5" fill="#E8B4F8" opacity="0.4"/><ellipse cx="62" cy="58" rx="3" ry="1.5" fill="#E8B4F8" opacity="0.4"/></svg>'
};

// Combined icons
var blondieIcons = Object.assign({}, blondieIconsEmoji, blondieIconsSVG, blondieIconsSVGExtra);

window.addEventListener('onWidgetLoad', function(obj) {
  console.log('Kawaii Valentine Goal loaded', obj);

  blondieFieldData = obj.detail.fieldData || {};
  blondieGoalAmount = parseInt(blondieFieldData.goalAmount) || 100;
  blondieEffectDuration = (parseInt(blondieFieldData.effectDuration) || 4) * 1000;

  // Currency setup
  var currSetting = blondieFieldData.currency || '$';
  if (currSetting === 'custom') {
    blondieCurrencySymbol = blondieFieldData.customCurrency || '$';
  } else {
    blondieCurrencySymbol = currSetting;
  }

  blondieApplyStyles();

  // Load progress from StreamElements session data
  var eventType = blondieFieldData.eventType || 'manual';
  var eventPeriod = blondieFieldData.eventPeriod || 'session';

  if (eventType !== 'manual') {
    var seEventType = eventType;
    if (eventType === 'member') seEventType = 'subscriber';
    if (eventType === 'superchat') seEventType = 'tip';

    var eventIndex = seEventType + '-' + eventPeriod;
    var sessionData = obj.detail.session.data;

    if (sessionData && sessionData[eventIndex]) {
      if (eventType === 'follower' || eventType === 'subscriber' || eventType === 'member') {
        blondieProgress = sessionData[eventIndex].count || 0;
      } else {
        blondieProgress = sessionData[eventIndex].amount || 0;
      }
    }
  }

  // Store SE base progress and apply offsets
  blondieSeBaseProgress = blondieProgress;
  console.log('SE session value:', blondieSeBaseProgress);

  // 1. Apply startingOffset from Fields (permanent setting)
  var fieldsOffset = parseInt(blondieFieldData.startingOffset) || 0;
  console.log('startingOffset from Fields:', fieldsOffset);

  // 2. Apply localStorage offset (dynamic from commands)
  var savedOffset = blondieLoadOffset();
  console.log('localStorage offset:', savedOffset);

  // Apply total offset
  var totalOffset = fieldsOffset + savedOffset;
  if (totalOffset !== 0) {
    blondieProgress = Math.max(0, blondieProgress + totalOffset);
  }
  console.log('Final progress:', blondieProgress, '(SE:', blondieSeBaseProgress, '+ offset:', totalOffset, ')');

  blondieUpdateBar();

  // Preview effect in editor
  if (blondieFieldData.previewEffect) {
    setTimeout(function() {
      document.documentElement.style.setProperty('--blondie-progress', '100%');
      blondieSetValuesDisplay(blondieGoalAmount, blondieGoalAmount);
      blondieCelebrate();
    }, 500);
  }
});

window.addEventListener('onEventReceived', function(obj) {
  if (!obj.detail) return;

  var listener = obj.detail.listener;
  var event = obj.detail.event;

  if (listener === 'message') {
    blondieHandleCommand(event);
    return;
  }

  var eventType = blondieFieldData.eventType || 'manual';
  if (eventType === 'manual') return;

  var eventAmount = event.amount || 0;

  if (listener === 'follower-latest' && eventType === 'follower') {
    blondieProgress++;
    blondieIconPulse();
    blondieUpdateBar();
  }
  else if (listener === 'subscriber-latest' && eventType === 'subscriber') {
    // Skip individual gift recipients (they come with gifted:true but no bulkGifted)
    // to avoid double-counting with the bulk event
    if (event.gifted && !event.bulkGifted) {
      return;
    }
    // For bulk/community gifts, use amount field for count
    var subCount = event.bulkGifted ? (event.amount || 1) : 1;
    blondieProgress += subCount;
    blondieIconPulse();
    blondieUpdateBar();
  }
  else if (listener === 'tip-latest' && eventType === 'tip') {
    blondieProgress += eventAmount;
    blondieIconPulse();
    blondieUpdateBar();
  }
  else if (listener === 'cheer-latest' && eventType === 'cheer') {
    blondieProgress += eventAmount;
    blondieIconPulse();
    blondieUpdateBar();
  }
  else if ((listener === 'subscriber-latest' || listener === 'sponsor-latest') && eventType === 'member') {
    blondieProgress++;
    blondieIconPulse();
    blondieUpdateBar();
  }
  else if (listener === 'superchat-latest' && eventType === 'superchat') {
    blondieProgress += eventAmount;
    blondieIconPulse();
    blondieUpdateBar();
  }
});

function blondieAnimateBar(animationType) {
  var barContainer = document.getElementById('blondie-bar-container');
  if (!barContainer) return;
  barContainer.classList.remove('bar-pulse', 'bar-flash', 'bar-shake', 'bar-bounce');
  void barContainer.offsetWidth;
  barContainer.classList.add('bar-' + animationType);
  setTimeout(function() {
    barContainer.classList.remove('bar-' + animationType);
  }, 600);
}

function blondieIconPulse() {
  var iconLeft = document.getElementById('blondie-icon-left');
  var iconRight = document.getElementById('blondie-icon-right');
  var icon = (iconLeft && iconLeft.style.display === 'flex') ? iconLeft : iconRight;

  if (icon && icon.style.display === 'flex') {
    icon.classList.remove('blondie-icon-pulse');
    void icon.offsetWidth;
    icon.classList.add('blondie-icon-pulse');
    setTimeout(function() { icon.classList.remove('blondie-icon-pulse'); }, 600);
  }
}

function blondieApplyStyles() {
  var root = document.documentElement;
  var container = document.getElementById('blondie-quest-container');
  var theme = blondieFieldData.colorTheme || 'custom';
  var colors;

  if (theme !== 'custom' && blondieThemes[theme]) {
    colors = blondieThemes[theme];
  } else {
    colors = {
      fill1: blondieFieldData.fillColor1 || '#F8A4B8',
      fill2: blondieFieldData.fillColor2 || '#E8758B',
      fill3: blondieFieldData.fillColor3 || '#F2C4CE',
      border: blondieFieldData.borderColor || '#D4A57B',
      bg: blondieFieldData.barBgColor || '#FFF5EE',
      glow: blondieFieldData.glowColor || 'rgba(248,164,184,0.35)'
    };
  }

  root.style.setProperty('--blondie-bar-width', (blondieFieldData.barWidth || 280) + 'px');
  root.style.setProperty('--blondie-bar-height', (blondieFieldData.barHeight || 32) + 'px');
  root.style.setProperty('--blondie-icon-size', (blondieFieldData.iconSize || 32) + 'px');
  root.style.setProperty('--blondie-fill-1', colors.fill1);
  root.style.setProperty('--blondie-fill-2', colors.fill2);
  root.style.setProperty('--blondie-fill-3', colors.fill3);
  root.style.setProperty('--blondie-border', colors.border);
  root.style.setProperty('--blondie-bg', colors.bg);
  root.style.setProperty('--blondie-glow', colors.glow);
  root.style.setProperty('--blondie-glow-size', (blondieFieldData.glowSize || 10) + 'px');
  root.style.setProperty('--blondie-anim-speed', (blondieFieldData.animSpeed || 3) + 's');
  root.style.setProperty('--blondie-title-font-size', (blondieFieldData.titleFontSize || 26) + 'px');
  root.style.setProperty('--blondie-values-font-size', (blondieFieldData.valuesFontSize || 14) + 'px');

  // Title, values, and icon colors (always applied, independent of theme)
  // If user changed from default, use their custom color; otherwise follow theme
  var tc = blondieFieldData.titleColor;
  root.style.setProperty('--blondie-title-color', (tc && tc.toLowerCase() !== '#d4a57b') ? tc : colors.border);
  var vc = blondieFieldData.valuesColor;
  root.style.setProperty('--blondie-values-color', (vc && vc.toLowerCase() !== '#d4a57b') ? vc : colors.border);
  var ic = blondieFieldData.iconColor;
  root.style.setProperty('--blondie-icon-color', (ic && ic.toLowerCase() !== '#f8a4b8') ? ic : colors.fill1);

  // Title box background
  var tbc = blondieFieldData.titleBoxColor;
  var hasCustomTitleBoxColor = tbc && tbc.toLowerCase() !== '#000000';
  if (hasCustomTitleBoxColor) {
    var tr = parseInt(tbc.substr(1,2),16), tg = parseInt(tbc.substr(3,2),16), tb = parseInt(tbc.substr(5,2),16);
    root.style.setProperty('--blondie-title-box-bg', 'rgba(' + tr + ',' + tg + ',' + tb + ',0.88)');
  } else {
    root.style.setProperty('--blondie-title-box-bg', colors.titleBoxBg || '#1A0A12');
  }

  // Widget background box
  if (container) {
    container.classList.remove('blondie-widget-box');
    if (blondieFieldData.widgetBox) {
      container.classList.add('blondie-widget-box');
      var wbc = blondieFieldData.widgetBoxColor;
      var hasCustomBoxColor = wbc && wbc.toLowerCase() !== '#000000';
      if (hasCustomBoxColor) {
        // Manual override - user picked a custom box color
        var r = parseInt(wbc.substr(1,2),16), g = parseInt(wbc.substr(3,2),16), b = parseInt(wbc.substr(5,2),16);
        root.style.setProperty('--blondie-box-bg', 'rgba(' + r + ',' + g + ',' + b + ',0.88)');
        root.style.setProperty('--blondie-box-border', '1.5px solid ' + colors.border);
        root.style.setProperty('--blondie-box-shadow', '0 8px 32px rgba(0,0,0,0.25), 0 0 12px ' + colors.glow);
      } else if (colors.dark && colors.boxBg) {
        // Dark theme - unique card style
        root.style.setProperty('--blondie-box-bg', colors.boxBg);
        root.style.setProperty('--blondie-box-border', colors.boxBorder);
        root.style.setProperty('--blondie-box-shadow', colors.boxShadow);
      } else {
        // Light theme - white glassmorphism
        root.style.setProperty('--blondie-box-bg', 'rgba(255,255,255,0.85)');
        root.style.setProperty('--blondie-box-border', '1px solid rgba(255,255,255,0.5)');
        root.style.setProperty('--blondie-box-shadow', '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)');
      }
    }
  }

  // Apply bar style class
  var barFill = document.getElementById('blondie-bar-fill');
  if (barFill) {
    // Remove all bar style classes
    var barStyles = ['diagonal-stripes', 'polka-seeds', 'shimmer', 'triple-sparkle', 'candy-stripes', 'star-shimmer', 'gold-shimmer', 'iridescent', 'polka-valentine', 'fuzz-texture', 'sakura-petals', 'cosmic-nebula', 'honeycomb', 'wine-bubbles', 'paw-prints', 'pixel-blocks', 'lavender-waves', 'potion-bubbles', 'cream-swirl', 'royal-damask'];
    barStyles.forEach(function(s) { barFill.classList.remove('bar-style-' + s); });

    // Add the theme's bar style
    if (colors.barStyle) {
      barFill.classList.add('bar-style-' + colors.barStyle);
    }
  }

  // Title positioning
  var titleAlign = blondieFieldData.titleAlign || 'row';
  var titlePos = blondieFieldData.titlePosition || 'top';
  var titleText = blondieFieldData.goalTitle || '';
  var valPos = blondieFieldData.valuesPosition || 'below';

  var titleParts = titlePos.split('-');
  var titleBase = titleParts[0];
  var titleHAlign = titleParts[1] || 'center';

  var valParts = valPos.split('-');
  var valBase = valParts[0];
  var valHAlign = valParts[1] || 'center';

  var titleTop = document.getElementById('blondie-title-top');
  var titleBottom = document.getElementById('blondie-title-bottom');
  var titleLeft = document.getElementById('blondie-title-left');
  var titleRight = document.getElementById('blondie-title-right');
  var titleBarTop = document.getElementById('blondie-title-bar-top');
  var titleBarBottom = document.getElementById('blondie-title-bar-bottom');
  var titleRowTop = document.getElementById('blondie-title-row-top');
  var titleRowBottom = document.getElementById('blondie-title-row-bottom');

  [titleTop, titleBottom, titleLeft, titleRight, titleBarTop, titleBarBottom, titleRowTop, titleRowBottom].forEach(function(el) {
    if (el) {
      el.style.display = 'none';
      el.classList.remove('align-left', 'align-center', 'align-right', 'blondie-title-box');
    }
  });

  var titleBarTopOffset = '10px';
  var titleBarBottomOffset = '10px';
  var barPaddingTop = 0;
  var barPaddingBottom = 0;

  var valuesAlign = blondieFieldData.valuesAlign || 'bar';
  var hasTitleBarTop = titleText && titleBase === 'top' && titleAlign === 'bar';
  var hasTitleBarBottom = titleText && titleBase === 'bottom' && titleAlign === 'bar';
  var hasValuesAbove = valBase === 'above' && valuesAlign === 'bar';
  var hasValuesBelow = valBase === 'below' && valuesAlign === 'bar';

  if (hasTitleBarTop && hasValuesAbove) {
    titleBarTopOffset = '36px';
    barPaddingTop = 60;
  } else if (hasTitleBarTop) {
    barPaddingTop = 34;
  } else if (hasValuesAbove) {
    barPaddingTop = 26;
  }

  if (hasTitleBarBottom && hasValuesBelow) {
    titleBarBottomOffset = '36px';
    barPaddingBottom = 60;
  } else if (hasTitleBarBottom) {
    barPaddingBottom = 34;
  } else if (hasValuesBelow) {
    barPaddingBottom = 26;
  }

  root.style.setProperty('--blondie-title-bar-top-offset', titleBarTopOffset);
  root.style.setProperty('--blondie-title-bar-bottom-offset', titleBarBottomOffset);
  root.style.setProperty('--blondie-bar-padding-top', barPaddingTop + 'px');
  root.style.setProperty('--blondie-bar-padding-bottom', barPaddingBottom + 'px');

  if (titleText && titleBase !== 'hidden') {
    var targetTitle = null;

    if (titleBase === 'top') {
      if (titleAlign === 'bar') targetTitle = titleBarTop;
      else if (titleAlign === 'row') targetTitle = titleRowTop;
      else targetTitle = titleTop;
    } else if (titleBase === 'bottom') {
      if (titleAlign === 'bar') targetTitle = titleBarBottom;
      else if (titleAlign === 'row') targetTitle = titleRowBottom;
      else targetTitle = titleBottom;
    } else if (titleBase === 'left') {
      targetTitle = titleLeft;
    } else if (titleBase === 'right') {
      targetTitle = titleRight;
    }

    if (targetTitle) {
      targetTitle.textContent = titleText;
      targetTitle.style.display = 'block';
      if ((titleAlign === 'bar' || titleAlign === 'row') && (titleBase === 'top' || titleBase === 'bottom')) {
        targetTitle.classList.add('align-' + titleHAlign);
      }
      if (blondieFieldData.titleBox) {
        targetTitle.classList.add('blondie-title-box');
      }
    }
  }

  // Icons
  var iconLeft = document.getElementById('blondie-icon-left');
  var iconRight = document.getElementById('blondie-icon-right');
  [iconLeft, iconRight].forEach(function(el) {
    if (el) { el.style.display = 'none'; el.innerHTML = ''; }
  });

  if (blondieFieldData.showIcon) {
    var iconEl = blondieFieldData.iconPosition === 'right' ? iconRight : iconLeft;
    if (iconEl) {
      var iconType = blondieFieldData.iconType;

      if (iconType === 'theme' && theme !== 'custom' && blondieThemes[theme]) {
        iconType = blondieThemes[theme].icon || 'emoji-heart';
      }

      if (iconType === 'custom' && blondieFieldData.customIcon) {
        var iconSize = blondieFieldData.iconSize || 32;
        var img = document.createElement('img');
        img.src = blondieFieldData.customIcon;
        img.style.cssText = 'width:' + iconSize + 'px;height:' + iconSize + 'px;object-fit:contain;';
        iconEl.appendChild(img);
        iconEl.classList.remove('blondie-icon-svg');
        iconEl.style.display = 'flex';
      } else if (blondieIcons[iconType]) {
        if (iconType.indexOf('svg-') === 0) {
          iconEl.innerHTML = blondieIcons[iconType];
          iconEl.classList.add('blondie-icon-svg');
          if (blondieFieldData.iconFloat === false) {
            iconEl.classList.add('blondie-icon-no-float');
          } else {
            iconEl.classList.remove('blondie-icon-no-float');
          }
        } else {
          iconEl.textContent = blondieIcons[iconType];
          iconEl.classList.remove('blondie-icon-svg');
        }
        iconEl.style.display = 'flex';
      }
    }
  }

  blondieSetupValuesPosition();
}

function blondieSetupValuesPosition() {
  var valPos = blondieFieldData.valuesPosition || 'below';
  var valuesAlign = blondieFieldData.valuesAlign || 'row';

  var valParts = valPos.split('-');
  var valBase = valParts[0];
  var valHAlign = valParts[1] || 'center';

  var valAbove = document.getElementById('blondie-values-above');
  var valBelow = document.getElementById('blondie-values-below');
  var valTop = document.getElementById('blondie-values-top');
  var valBottom = document.getElementById('blondie-values-bottom');
  var valRowTop = document.getElementById('blondie-values-row-top');
  var valRowBottom = document.getElementById('blondie-values-row-bottom');
  var valLeft = document.getElementById('blondie-values-left');
  var valRight = document.getElementById('blondie-values-right');
  var valInside = document.getElementById('blondie-values-inside');

  [valAbove, valBelow, valTop, valBottom, valRowTop, valRowBottom, valLeft, valRight, valInside].forEach(function(el) {
    if (el) {
      el.style.display = 'none';
      el.innerHTML = '';
      el.classList.remove('pos-left', 'pos-center', 'pos-right', 'align-left', 'align-center', 'align-right');
    }
  });

  var targetEl = null;
  if (valBase === 'above') {
    if (valuesAlign === 'bar') targetEl = valAbove;
    else if (valuesAlign === 'row') targetEl = valRowTop;
    else targetEl = valTop;
    targetEl.classList.add('align-' + valHAlign);
  } else if (valBase === 'below') {
    if (valuesAlign === 'bar') targetEl = valBelow;
    else if (valuesAlign === 'row') targetEl = valRowBottom;
    else targetEl = valBottom;
    targetEl.classList.add('align-' + valHAlign);
  } else if (valBase === 'left') {
    targetEl = valLeft;
  } else if (valBase === 'right') {
    targetEl = valRight;
  } else if (valBase === 'inside') {
    targetEl = valInside;
    if (valHAlign === 'left') valInside.classList.add('pos-left');
    else if (valHAlign === 'center') valInside.classList.add('pos-center');
    else if (valHAlign === 'right') valInside.classList.add('pos-right');
  }

  if (targetEl && valBase !== 'hidden') {
    targetEl.style.display = 'flex';
    targetEl.innerHTML = '<span id="blondie-current">0</span><span class="blondie-separator">|</span><span id="blondie-goal">' + blondieGoalAmount + '</span>';
  }
}

function blondieSetValuesDisplay(current, goal) {
  var eventType = blondieFieldData.eventType || 'manual';
  var isTipType = (eventType === 'tip' || eventType === 'superchat');

  var currEl = document.getElementById('blondie-current');
  var goalEl = document.getElementById('blondie-goal');

  if (currEl) {
    currEl.textContent = isTipType ? blondieCurrencySymbol + Math.round(current) : Math.round(current);
  }
  if (goalEl) {
    goalEl.textContent = isTipType ? blondieCurrencySymbol + goal : goal;
  }
}

function blondieUpdateBar() {
  var pct = Math.min((blondieProgress / blondieGoalAmount) * 100, 100);
  var container = document.getElementById('blondie-quest-container');
  var overflow = blondieFieldData.overflowBehavior || 'show';
  var repeatMode = blondieFieldData.effectRepeat || 'once';

  document.documentElement.style.setProperty('--blondie-progress', pct + '%');

  var displayValue = blondieProgress;
  var isComplete = blondieProgress >= blondieGoalAmount;

  if (isComplete && overflow === 'cap') {
    displayValue = blondieGoalAmount;
  }

  if (!isComplete && container) {
    container.style.opacity = '1';
  }

  blondieSetValuesDisplay(displayValue, blondieGoalAmount);

  var progressIncreased = blondieProgress > blondieLastProgress;
  var barAnimation = blondieFieldData.barAnimation || 'none';

  if (progressIncreased && barAnimation !== 'none') {
    blondieAnimateBar(barAnimation);
  }

  var shouldCelebrate = false;

  if (isComplete) {
    if (repeatMode === 'once' && !blondieWasComplete) {
      shouldCelebrate = true;
    } else if (repeatMode === 'every' && progressIncreased) {
      shouldCelebrate = true;
    } else if (repeatMode === 'milestones') {
      var currentPct = (blondieProgress / blondieGoalAmount) * 100;
      var currentMilestone = Math.floor(currentPct / 50) * 50;
      if (currentMilestone > blondieLastMilestone && currentMilestone >= 100) {
        shouldCelebrate = true;
        blondieLastMilestone = currentMilestone;
      }
    }
  }

  if (isComplete && !blondieWasComplete && repeatMode === 'milestones') {
    blondieLastMilestone = 100;
  }

  blondieLastProgress = blondieProgress;

  if (shouldCelebrate) {
    blondieCelebrate();

    if (overflow === 'hide') {
      setTimeout(function() {
        if (container) container.style.opacity = '0';
      }, blondieEffectDuration + 1000);
    }
  }

  blondieWasComplete = isComplete;
}

function blondieCelebrate() {
  var effectSetting = blondieFieldData.celebrationEffect || 'theme';
  var theme = blondieFieldData.colorTheme || 'custom';
  var effect;

  if (effectSetting === 'theme' && blondieThemes[theme]) {
    effect = blondieThemes[theme].effect;
  } else if (effectSetting === 'none') {
    return;
  } else {
    effect = effectSetting;
  }

  var container = document.getElementById('blondie-quest-container');
  var effectsBox = document.getElementById('blondie-effects');
  if (!container || !effectsBox) return;

  effectsBox.innerHTML = '';
  container.classList.remove('blondie-shake');

  if (effect !== 'none') {
    container.classList.add('blondie-shake');
    setTimeout(function() { container.classList.remove('blondie-shake'); }, 800);
  }

  switch(effect) {
    case 'love-letters': blondieEffectLoveLetters(effectsBox); break;
    case 'berry-burst': blondieEffectBerryBurst(effectsBox); break;
    case 'rose-petals': blondieEffectRosePetals(effectsBox); break;
    case 'cupid-arrows': blondieEffectCupidArrows(effectsBox); break;
    case 'candy-shower': blondieEffectCandyShower(effectsBox); break;
    case 'starfall': blondieEffectStarfall(effectsBox); break;
    case 'chocolate-truffles': blondieEffectChocolateTruffles(effectsBox); break;
    case 'fairy-dust': blondieEffectFairyDust(effectsBox); break;
    case 'boba-hearts': blondieEffectBobaHearts(effectsBox); break;
    case 'bear-hugs': blondieEffectBearHugs(effectsBox); break;
    case 'confetti': blondieEffectConfetti(effectsBox); break;
    case 'sparkles': blondieEffectSparkles(effectsBox); break;
    case 'kawaii': blondieEffectKawaii(effectsBox); break;
    case 'real-balloons': blondieEffectBalloons(effectsBox); break;
    case 'kawaii-clouds': blondieEffectKawaiiClouds(effectsBox); break;
    case 'fluffy-clouds': blondieEffectFluffyClouds(effectsBox); break;
    case 'fireworks': blondieEffectFireworks(effectsBox); break;
    case 'real-hearts': blondieEffectSVGHearts(effectsBox); break;
    case 'real-stars': blondieEffectSVGStars(effectsBox); break;
    case 'sakura-shower': blondieEffectSakuraShower(effectsBox); break;
    case 'shooting-stars': blondieEffectShootingStars(effectsBox); break;
    case 'buzzing-hearts': blondieEffectBuzzingHearts(effectsBox); break;
    case 'champagne-bubbles': blondieEffectChampagneBubbles(effectsBox); break;
    case 'paw-hearts': blondieEffectPawHearts(effectsBox); break;
    case 'pixel-rain': blondieEffectPixelRain(effectsBox); break;
    case 'lavender-drift': blondieEffectLavenderDrift(effectsBox); break;
    case 'magic-burst': blondieEffectMagicBurst(effectsBox); break;
    case 'milk-splash': blondieEffectMilkSplash(effectsBox); break;
    case 'royal-shower': blondieEffectRoyalShower(effectsBox); break;
  }
}

// ==================== SVG CELEBRATION EFFECTS ====================

// Shared SVG Heart Engine
function blondieSVGHeartEngine(box, colors, count) {
  for (var i = 0; i < count; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-heart';
        p.style.left = (10 + Math.random() * 80) + '%';
        p.style.animationDuration = (3 + Math.random() * 2) + 's';
        p.style.animationDelay = (Math.random() * 0.3) + 's';
        var color = colors[Math.floor(Math.random() * colors.length)];
        var size = 30 + Math.random() * 30;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 32 32" width="' + size + '" height="' + size + '">' +
          '<defs>' +
          '<radialGradient id="bv-hg' + uid + '" cx="30%" cy="30%" r="70%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:0.6"/>' +
          '<stop offset="50%" style="stop-color:' + color + ';stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -30) + ';stop-opacity:1"/>' +
          '</radialGradient>' +
          '<filter id="bv-hf' + uid + '"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
          '</defs>' +
          '<path d="M16 28 C16 28 4 18 4 10 C4 5 8 2 12 2 C14 2 16 4 16 6 C16 4 18 2 20 2 C24 2 28 5 28 10 C28 18 16 28 16 28Z" fill="url(#bv-hg' + uid + ')" filter="url(#bv-hf' + uid + ')"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 5500, p);
      }, idx * 150);
    })(i);
  }
}

// Shared SVG Star Engine
function blondieSVGStarEngine(box, colors, count) {
  for (var i = 0; i < count; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-star';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 60 + '%';
        p.style.animationDuration = (0.5 + Math.random() * 1) + 's';
        p.style.animationDelay = (Math.random() * 2) + 's';
        var color = colors[Math.floor(Math.random() * colors.length)];
        var size = 20 + Math.random() * 30;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 32 32" width="' + size + '" height="' + size + '">' +
          '<defs>' +
          '<radialGradient id="bv-sg' + uid + '" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:1"/>' +
          '<stop offset="50%" style="stop-color:' + color + ';stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -20) + ';stop-opacity:0.8"/>' +
          '</radialGradient>' +
          '<filter id="bv-sf' + uid + '"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
          '</defs>' +
          '<polygon points="16,2 20,12 30,12 22,19 25,30 16,23 7,30 10,19 2,12 12,12" fill="url(#bv-sg' + uid + ')" filter="url(#bv-sf' + uid + ')"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 4000, p);
      }, idx * 100);
    })(i);
  }
}

// Shared SVG Balloon Engine
function blondieBalloonEngine(box, colors) {
  for (var i = 0; i < 12; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-balloon';
        p.style.left = (10 + Math.random() * 80) + '%';
        p.style.animationDelay = (Math.random() * 0.5) + 's';
        p.style.animationDuration = (4 + Math.random() * 2) + 's';
        var color = colors[Math.floor(Math.random() * colors.length)];
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 50 70" width="50" height="70">' +
          '<defs>' +
          '<radialGradient id="bv-bl' + uid + '" cx="30%" cy="30%" r="70%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:0.8"/>' +
          '<stop offset="30%" style="stop-color:' + color + ';stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -30) + ';stop-opacity:1"/>' +
          '</radialGradient>' +
          '</defs>' +
          '<ellipse cx="25" cy="25" rx="20" ry="24" fill="url(#bv-bl' + uid + ')"/>' +
          '<ellipse cx="25" cy="25" rx="18" ry="22" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="2"/>' +
          '<polygon points="25,48 22,52 28,52" fill="' + blondieAdjustColor(color, -20) + '"/>' +
          '<path d="M25,52 Q27,58 24,65 Q26,62 25,70" stroke="' + blondieAdjustColor(color, -40) + '" stroke-width="1" fill="none"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 6000, p);
      }, idx * 200);
    })(i);
  }
}

// Shared SVG Sparkle helper
function blondieSVGSparkleHelper(box, count, staggerMs) {
  for (var j = 0; j < count; j++) {
    (function(jj) {
      setTimeout(function() {
        var sp = document.createElement('div');
        sp.className = 'blondie-svg-sparkle';
        sp.style.left = (10 + Math.random() * 80) + '%';
        sp.style.top = (10 + Math.random() * 70) + '%';
        sp.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
        var spSize = 12 + Math.random() * 10;
        sp.innerHTML = '<svg viewBox="0 0 24 24" width="' + spSize + '" height="' + spSize + '">' +
          '<path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#FFD700" opacity="0.9"/>' +
          '</svg>';
        box.appendChild(sp);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 1000, sp);
      }, jj * staggerMs);
    })(j);
  }
}

// Shared Firework Engine
function blondieFireworkEngine(box, colorSets) {
  for (var i = 0; i < 6; i++) {
    (function(idx) {
      setTimeout(function() {
        var x = 15 + Math.random() * 70;
        var y = 15 + Math.random() * 35;
        var colors = colorSets[idx % colorSets.length];

        // Rocket
        var rocket = document.createElement('div');
        rocket.className = 'blondie-fw-rocket';
        rocket.style.left = x + '%';
        rocket.style.bottom = '0';
        rocket.style.background = colors[0];
        box.appendChild(rocket);

        // Explode after rocket
        setTimeout(function() {
          if (rocket.parentNode) rocket.parentNode.removeChild(rocket);
          var numP = 30;
          for (var pi = 0; pi < numP; pi++) {
            var particle = document.createElement('div');
            particle.className = 'blondie-fw-particle';
            var angle = (pi / numP) * Math.PI * 2;
            var distance = 60 + Math.random() * 80;
            var tx = Math.cos(angle) * distance;
            var ty = Math.sin(angle) * distance;
            particle.style.left = x + '%';
            particle.style.top = y + '%';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.boxShadow = '0 0 6px ' + colors[0] + ', 0 0 12px ' + colors[0] + ', 0 0 20px ' + colors[1];
            particle.animate([
              { transform: 'translate(0, 0) scale(1)', opacity: 1 },
              { transform: 'translate(' + (tx * 0.3) + 'px, ' + (ty * 0.3) + 'px) scale(1.5)', opacity: 1, offset: 0.2 },
              { transform: 'translate(' + tx + 'px, ' + (ty + 30) + 'px) scale(0.3)', opacity: 0 }
            ], { duration: 1200 + Math.random() * 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' });
            box.appendChild(particle);
            setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 1800, particle);
          }
          // Sparkle trails
          for (var si = 0; si < 15; si++) {
            (function(sii) {
              setTimeout(function() {
                var sparkle = document.createElement('div');
                sparkle.className = 'blondie-fw-sparkle';
                sparkle.style.left = x + '%';
                sparkle.style.top = y + '%';
                var sa = Math.random() * Math.PI * 2;
                var sd = 30 + Math.random() * 50;
                sparkle.animate([
                  { transform: 'translate(0, 0) scale(0)', opacity: 1 },
                  { transform: 'translate(' + (Math.cos(sa) * sd) + 'px, ' + (Math.sin(sa) * sd) + 'px) scale(1)', opacity: 1, offset: 0.3 },
                  { transform: 'translate(' + (Math.cos(sa) * sd * 1.5) + 'px, ' + (Math.sin(sa) * sd * 1.5 + 20) + 'px) scale(0)', opacity: 0 }
                ], { duration: 800, easing: 'ease-out', fill: 'forwards' });
                box.appendChild(sparkle);
                setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 1000, sparkle);
              }, sii * 30);
            })(si);
          }
        }, 600);
      }, idx * 500);
    })(i);
  }
}

// Shared Kawaii Cloud Engine
function blondieKawaiiCloudEngine(box, blushColors) {
  var faces = ['happy', 'love', 'wink', 'blush', 'star'];
  var animations = ['blondie-kawaii-pop', 'blondie-kawaii-fall', 'blondie-kawaii-float', 'blondie-kawaii-bounce'];

  for (var i = 0; i < 18; i++) {
    (function(idx) {
      setTimeout(function() {
        var cloud = document.createElement('div');
        cloud.className = 'blondie-kawaii-cloud';
        cloud.style.left = (10 + Math.random() * 80) + '%';
        cloud.style.top = (10 + Math.random() * 70) + '%';
        var animType = animations[Math.floor(Math.random() * animations.length)];
        cloud.style.animationName = animType;
        cloud.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';

        var size = 40 + Math.random() * 35;
        var face = faces[Math.floor(Math.random() * faces.length)];
        var blushColor = blushColors[Math.floor(Math.random() * blushColors.length)];
        var uid = blondieEffectUID++;

        var eyesAndMouth = '';
        switch (face) {
          case 'happy':
            eyesAndMouth = '<ellipse cx="45" cy="32" rx="4" ry="5" fill="#2D2D2D"/><ellipse cx="75" cy="32" rx="4" ry="5" fill="#2D2D2D"/><path d="M52 42 Q60 50 68 42" stroke="#2D2D2D" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
            break;
          case 'love':
            eyesAndMouth = '<text x="40" y="38" font-size="14" fill="#FF6B8A">\u2665</text><text x="68" y="38" font-size="14" fill="#FF6B8A">\u2665</text><path d="M52 44 Q60 50 68 44" stroke="#FF6B8A" stroke-width="2" fill="none" stroke-linecap="round"/>';
            break;
          case 'wink':
            eyesAndMouth = '<ellipse cx="45" cy="32" rx="4" ry="5" fill="#2D2D2D"/><path d="M68 28 L75 33 L68 38" stroke="#2D2D2D" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="82" cy="36" rx="5" ry="3" fill="' + blushColor + '" opacity="0.5"/><path d="M52 42 Q60 48 68 42" stroke="#2D2D2D" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
            break;
          case 'blush':
            eyesAndMouth = '<path d="M42 30 Q45 35 48 30" stroke="#2D2D2D" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M72 30 Q75 35 78 30" stroke="#2D2D2D" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="35" cy="38" rx="6" ry="4" fill="' + blushColor + '" opacity="0.6"/><ellipse cx="85" cy="38" rx="6" ry="4" fill="' + blushColor + '" opacity="0.6"/><path d="M52 42 Q60 48 68 42" stroke="#2D2D2D" stroke-width="2" fill="none" stroke-linecap="round"/>';
            break;
          case 'star':
            eyesAndMouth = '<text x="38" y="38" font-size="16" fill="#FFD700">\u2605</text><text x="66" y="38" font-size="16" fill="#FFD700">\u2605</text><path d="M52 44 Q60 52 68 44" stroke="#2D2D2D" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
            break;
        }

        cloud.innerHTML = '<svg viewBox="0 0 120 70" width="' + size + '" height="' + (size * 0.58) + '" style="filter: drop-shadow(3px 5px 6px rgba(0,0,0,0.15));">' +
          '<defs>' +
          '<linearGradient id="bv-cg' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
          '<stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1"/>' +
          '<stop offset="50%" style="stop-color:#F8F8FF;stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:#E8F0FA;stop-opacity:0.95"/>' +
          '</linearGradient>' +
          '<radialGradient id="bv-cb' + uid + '" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" style="stop-color:' + blushColor + ';stop-opacity:0.7"/>' +
          '<stop offset="100%" style="stop-color:' + blushColor + ';stop-opacity:0"/>' +
          '</radialGradient>' +
          '</defs>' +
          '<ellipse cx="35" cy="48" rx="28" ry="20" fill="url(#bv-cg' + uid + ')"/>' +
          '<ellipse cx="60" cy="42" rx="35" ry="26" fill="url(#bv-cg' + uid + ')"/>' +
          '<ellipse cx="85" cy="48" rx="28" ry="20" fill="url(#bv-cg' + uid + ')"/>' +
          '<ellipse cx="48" cy="28" rx="24" ry="20" fill="#FFFFFF"/>' +
          '<ellipse cx="72" cy="26" rx="22" ry="18" fill="#FFFFFF"/>' +
          '<ellipse cx="38" cy="42" rx="8" ry="5" fill="url(#bv-cb' + uid + ')"/>' +
          '<ellipse cx="82" cy="42" rx="8" ry="5" fill="url(#bv-cb' + uid + ')"/>' +
          eyesAndMouth +
          '</svg>';
        box.appendChild(cloud);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 2500, cloud);
      }, idx * 150);
    })(i);
  }

  // Sparkles
  blondieSVGSparkleHelper(box, 25, 250);

  // Emoji particles
  var emojis = ['\u2728', '\uD83D\uDC96', '\u2B50', '\uD83C\uDF1F', '\uD83D\uDC95', '\uD83D\uDC97', '\uD83E\uDE77', '\u2B50'];
  for (var k = 0; k < 20; k++) {
    (function(kk) {
      setTimeout(function() {
        var emoji = document.createElement('div');
        emoji.className = 'blondie-kawaii-emoji';
        emoji.style.left = (5 + Math.random() * 90) + '%';
        emoji.style.top = (5 + Math.random() * 80) + '%';
        emoji.style.animationDuration = (1.2 + Math.random() * 1) + 's';
        emoji.style.animationName = ['blondie-kawaii-pop', 'blondie-kawaii-float', 'blondie-kawaii-bounce'][Math.floor(Math.random() * 3)];
        emoji.style.fontSize = (16 + Math.random() * 14) + 'px';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        box.appendChild(emoji);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 2000, emoji);
      }, kk * 120);
    })(k);
  }
}

// Shared 3D Confetti Engine
function blondieConfettiEngine(box, colors, count) {
  for (var i = 0; i < count; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-confetti';
        p.style.left = Math.random() * 100 + '%';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        var w = 8 + Math.random() * 8;
        var h = 6 + Math.random() * 6;
        p.style.width = w + 'px';
        p.style.height = h + 'px';
        p.style.animationDuration = (2 + Math.random() * 2) + 's';
        p.style.animationDelay = (Math.random() * 0.5) + 's';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 5000, p);
      }, idx * 30);
    })(i);
  }
}

// ==================== 10 THEME EFFECTS ====================

// 1. Love Letters - SVG Hearts rising
function blondieEffectLoveLetters(box) {
  blondieSVGHeartEngine(box, ['#FF6B9D', '#FF8FAB', '#FFB3C6', '#FFC8DD', '#FF4D6D'], 20);
}

// 2. Berry Burst - SVG 3D Confetti (strawberry palette)
function blondieEffectBerryBurst(box) {
  blondieConfettiEngine(box, ['#FF4D6D', '#FF8FA3', '#FFE66D', '#FFB3C6', '#8B4513', '#FFC8DD'], 50);
}

// 3. Rose Petals - SVG Petal shapes drifting
function blondieEffectRosePetals(box) {
  var colors = ['#E91E63', '#FF5C8A', '#FF8FAB', '#C2185B'];
  for (var i = 0; i < 15; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-petal';
        p.style.left = (Math.random() * 100) + '%';
        p.style.animationDuration = (3 + Math.random() * 2) + 's';
        p.style.animationDelay = (Math.random() * 0.5) + 's';
        var drift = (Math.random() - 0.5) * 60;
        p.style.setProperty('--drift', drift + 'px');
        var color = colors[Math.floor(Math.random() * colors.length)];
        var size = 20 + Math.random() * 15;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 30 40" width="' + size + '" height="' + (size * 1.3) + '" style="transform: rotate(' + (Math.random() * 360) + 'deg)">' +
          '<defs><linearGradient id="bv-pl' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" style="stop-color:' + color + ';stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -25) + ';stop-opacity:1"/>' +
          '</linearGradient></defs>' +
          '<path d="M15,2 Q25,10 25,20 Q25,35 15,38 Q5,35 5,20 Q5,10 15,2" fill="url(#bv-pl' + uid + ')"/>' +
          '<path d="M15,5 L15,35" stroke="' + blondieAdjustColor(color, -15) + '" stroke-width="1" opacity="0.5"/>' +
          '<path d="M15,12 Q10,15 8,18 M15,18 Q20,21 22,24 M15,24 Q10,27 8,30" stroke="' + blondieAdjustColor(color, -15) + '" stroke-width="0.8" fill="none" opacity="0.4"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 6000, p);
      }, idx * 200);
    })(i);
  }
}

// 4. Cupid's Arrows - SVG Fireworks (gold/pink)
function blondieEffectCupidArrows(box) {
  blondieFireworkEngine(box, [
    ['#FFD700', '#FFEC8B', '#FFF4B8', '#FFC107'],
    ['#FF8FAB', '#FFB3C6', '#FFC8DD', '#FF6B9D'],
    ['#FFD700', '#FFA500', '#FFEC8B', '#FFE4B5'],
    ['#FF6B9D', '#FF4D6D', '#FFB3C6', '#FF8FAB'],
    ['#FFD700', '#FF8FAB', '#FFEC8B', '#FFC8DD']
  ]);
}

// 5. Candy Shower - SVG 3D Confetti (pastel candy palette)
function blondieEffectCandyShower(box) {
  blondieConfettiEngine(box, ['#FF9FCC', '#B5EAD7', '#FFDAC1', '#C7CEEA', '#FFE5B4', '#FFC8DD', '#A2D2FF'], 60);
}

// 6. Starfall - SVG Stars twinkling
function blondieEffectStarfall(box) {
  blondieSVGStarEngine(box, ['#FFD700', '#FFA500', '#FFEC8B', '#B8A9FF', '#FFFACD'], 25);
}

// 7. Chocolate Truffles - SVG Hearts (gold/brown) + sparkles
function blondieEffectChocolateTruffles(box) {
  blondieSVGHeartEngine(box, ['#D4A574', '#8B6914', '#A0522D', '#DAA520'], 12);
  blondieSVGSparkleHelper(box, 15, 200);
}

// 8. Fairy Dust - SVG Butterflies + sparkles
function blondieEffectFairyDust(box) {
  var wingColors = [
    ['#FF8FAB', '#FFB3C6'], ['#E8B4F8', '#FADADD'], ['#B8E4F0', '#BDE0FE'],
    ['#CDB4DB', '#E9DEFA'], ['#FFE66D', '#FFF4B8']
  ];
  for (var i = 0; i < 6; i++) {
    (function(idx) {
      setTimeout(function() {
        var bf = document.createElement('div');
        bf.className = 'blondie-svg-butterfly';
        bf.style.left = (20 + Math.random() * 60) + '%';
        bf.style.top = (25 + Math.random() * 45) + '%';
        bf.style.animationDuration = (3.5 + Math.random() * 2) + 's';
        var colors = wingColors[Math.floor(Math.random() * wingColors.length)];
        var size = 40 + Math.random() * 25;
        var uid = blondieEffectUID++;
        bf.innerHTML = '<svg viewBox="0 0 60 40" width="' + size + '" height="' + (size * 0.67) + '" class="butterfly-svg">' +
          '<defs><radialGradient id="bv-bw' + uid + '" cx="30%" cy="30%" r="70%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:0.5"/>' +
          '<stop offset="50%" style="stop-color:' + colors[0] + ';stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:' + colors[1] + ';stop-opacity:1"/>' +
          '</radialGradient></defs>' +
          '<ellipse cx="20" cy="15" rx="15" ry="12" fill="url(#bv-bw' + uid + ')" class="wing-flap"/>' +
          '<ellipse cx="20" cy="28" rx="12" ry="10" fill="url(#bv-bw' + uid + ')" opacity="0.8" class="wing-flap"/>' +
          '<ellipse cx="40" cy="15" rx="15" ry="12" fill="url(#bv-bw' + uid + ')"/>' +
          '<ellipse cx="40" cy="28" rx="12" ry="10" fill="url(#bv-bw' + uid + ')" opacity="0.8"/>' +
          '<ellipse cx="30" cy="20" rx="3" ry="15" fill="#5D576B"/>' +
          '<circle cx="30" cy="6" r="3" fill="#5D576B"/>' +
          '<path d="M28,3 Q24,0 22,2" stroke="#5D576B" stroke-width="1" fill="none"/>' +
          '<path d="M32,3 Q36,0 38,2" stroke="#5D576B" stroke-width="1" fill="none"/>' +
          '</svg>';
        box.appendChild(bf);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 5500, bf);
      }, idx * 400);
    })(i);
  }
  blondieSVGSparkleHelper(box, 20, 150);
}

// 9. Boba Hearts - SVG Balloons (valentine palette)
function blondieEffectBobaHearts(box) {
  blondieBalloonEngine(box, ['#FF6B8A', '#D4456B', '#FFB3C6', '#FF8FAB', '#FFC8DD', '#AA96DA', '#95E1D3']);
}

// 10. Bear Hugs - SVG Kawaii Clouds
function blondieEffectBearHugs(box) {
  blondieKawaiiCloudEngine(box, ['#FFB6C1', '#FFC0CB', '#FF91A4']);
}

// ==================== 6 STANDALONE EFFECTS ====================

// Real Balloons (rainbow)
function blondieEffectBalloons(box) {
  blondieBalloonEngine(box, ['#FF6B6B', '#4ECDC4', '#FFE66D', '#AA96DA', '#95E1D3', '#FFC8DD', '#A2D2FF', '#CDB4DB']);
}

// Kawaii Clouds (standalone)
function blondieEffectKawaiiClouds(box) {
  blondieKawaiiCloudEngine(box, ['#FFB6C1', '#FFC0CB', '#FF91A4']);
}

// Fluffy Clouds (no faces)
function blondieEffectFluffyClouds(box) {
  for (var i = 0; i < 6; i++) {
    (function(idx) {
      setTimeout(function() {
        var cloud = document.createElement('div');
        cloud.className = 'blondie-svg-cloud';
        cloud.style.left = (15 + Math.random() * 70) + '%';
        cloud.style.top = (20 + Math.random() * 40) + '%';
        cloud.style.animationDuration = (4 + Math.random() * 3) + 's';
        var size = 60 + Math.random() * 50;
        var opacity = 0.8 + Math.random() * 0.2;
        var uid = blondieEffectUID++;
        cloud.innerHTML = '<svg viewBox="0 0 120 60" width="' + size + '" height="' + (size * 0.5) + '" style="opacity:' + opacity + '">' +
          '<defs>' +
          '<linearGradient id="bv-fg' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:#E8F4FC;stop-opacity:0.9"/>' +
          '</linearGradient>' +
          '<filter id="bv-fs' + uid + '"><feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#c0d8e8" flood-opacity="0.5"/></filter>' +
          '</defs>' +
          '<g filter="url(#bv-fs' + uid + ')">' +
          '<ellipse cx="35" cy="40" rx="25" ry="18" fill="url(#bv-fg' + uid + ')"/>' +
          '<ellipse cx="60" cy="35" rx="30" ry="22" fill="url(#bv-fg' + uid + ')"/>' +
          '<ellipse cx="85" cy="40" rx="25" ry="18" fill="url(#bv-fg' + uid + ')"/>' +
          '<ellipse cx="50" cy="25" rx="22" ry="18" fill="white"/>' +
          '<ellipse cx="70" cy="22" rx="20" ry="16" fill="white"/>' +
          '</g></svg>';
        box.appendChild(cloud);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 6000, cloud);
      }, idx * 400);
    })(i);
  }
}

// Fireworks (standalone with 5-color sets)
function blondieEffectFireworks(box) {
  blondieFireworkEngine(box, [
    ['#FF6B6B', '#FF8E8E', '#FFB3B3', '#FFCDD2'],
    ['#4ECDC4', '#7EDDD6', '#A8EDE8', '#B2DFDB'],
    ['#FFE66D', '#FFEC8B', '#FFF4B8', '#FFF9C4'],
    ['#AA96DA', '#C4B5E8', '#DED4F5', '#E1BEE7'],
    ['#FF8FAB', '#FFB3C6', '#FFC8DD', '#F8BBD9']
  ]);
}

// Real Hearts (standalone pink)
function blondieEffectSVGHearts(box) {
  blondieSVGHeartEngine(box, ['#FF6B9D', '#FF8FAB', '#FFB3C6', '#FFC8DD', '#FF4D6D'], 20);
}

// Real Stars (standalone gold)
function blondieEffectSVGStars(box) {
  blondieSVGStarEngine(box, ['#FFD700', '#FFA500', '#FFEC8B', '#FFE4B5', '#FFFACD'], 25);
}

// ==================== UPGRADED UTILITY EFFECTS ====================

// 3D Confetti (pastel)
function blondieEffectConfetti(box) {
  blondieConfettiEngine(box, ['#FF9FCC', '#B5EAD7', '#FFDAC1', '#C7CEEA', '#FFE5B4', '#FFC8DD', '#A2D2FF'], 60);
}

// SVG Sparkles
function blondieEffectSparkles(box) {
  for (var i = 0; i < 30; i++) {
    (function(idx) {
      setTimeout(function() {
        var sp = document.createElement('div');
        sp.className = 'blondie-svg-sparkle';
        sp.style.left = Math.random() * 100 + '%';
        sp.style.top = Math.random() * 80 + '%';
        sp.style.animationDuration = (0.4 + Math.random() * 0.6) + 's';
        sp.style.animationDelay = (Math.random() * 0.2) + 's';
        var size = 15 + Math.random() * 20;
        var uid = blondieEffectUID++;
        sp.innerHTML = '<svg viewBox="0 0 32 32" width="' + size + '" height="' + size + '">' +
          '<defs><filter id="bv-spg' + uid + '"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
          '<g filter="url(#bv-spg' + uid + ')">' +
          '<line x1="16" y1="2" x2="16" y2="30" stroke="white" stroke-width="2"/>' +
          '<line x1="2" y1="16" x2="30" y2="16" stroke="white" stroke-width="2"/>' +
          '<line x1="6" y1="6" x2="26" y2="26" stroke="white" stroke-width="1.5"/>' +
          '<line x1="26" y1="6" x2="6" y2="26" stroke="white" stroke-width="1.5"/>' +
          '</g></svg>';
        box.appendChild(sp);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 1500, sp);
      }, idx * 100);
    })(i);
  }
}

// Kawaii Mix - SVG hearts + kawaii clouds + sparkles + emoji
function blondieEffectKawaii(box) {
  // Hearts rising
  blondieSVGHeartEngine(box, ['#FF6B9D', '#FF8FAB', '#FFB3C6', '#FFC8DD'], 10);
  // Small kawaii clouds
  setTimeout(function() {
    blondieKawaiiCloudEngine(box, ['#FFB6C1', '#FFC0CB', '#FF91A4']);
  }, 300);
  // Sparkles
  blondieSVGSparkleHelper(box, 15, 200);
}

// ==================== 10 NEW THEME EFFECTS ====================

// 11. Sakura Shower - SVG 5-petal flowers spiraling down
function blondieEffectSakuraShower(box) {
  var colors = ['#FFB7C5', '#FFD6E0', '#E8899A', '#FFC0CB', '#FF91A4'];
  for (var i = 0; i < 18; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-sakura';
        p.style.left = (Math.random() * 100) + '%';
        p.style.animationDuration = (3 + Math.random() * 2.5) + 's';
        p.style.animationDelay = (Math.random() * 0.3) + 's';
        var drift = (Math.random() - 0.5) * 40;
        p.style.setProperty('--drift', drift + 'px');
        var color = colors[Math.floor(Math.random() * colors.length)];
        var size = 20 + Math.random() * 18;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 40 40" width="' + size + '" height="' + size + '">' +
          '<defs><radialGradient id="bv-sk' + uid + '" cx="40%" cy="35%" r="60%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:0.5"/>' +
          '<stop offset="50%" style="stop-color:' + color + ';stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -25) + ';stop-opacity:1"/>' +
          '</radialGradient></defs>' +
          '<ellipse cx="20" cy="10" rx="6" ry="10" fill="url(#bv-sk' + uid + ')"/>' +
          '<ellipse cx="20" cy="10" rx="6" ry="10" fill="url(#bv-sk' + uid + ')" transform="rotate(72 20 20)"/>' +
          '<ellipse cx="20" cy="10" rx="6" ry="10" fill="url(#bv-sk' + uid + ')" transform="rotate(144 20 20)"/>' +
          '<ellipse cx="20" cy="10" rx="6" ry="10" fill="url(#bv-sk' + uid + ')" transform="rotate(216 20 20)"/>' +
          '<ellipse cx="20" cy="10" rx="6" ry="10" fill="url(#bv-sk' + uid + ')" transform="rotate(288 20 20)"/>' +
          '<circle cx="20" cy="20" r="4" fill="#FFF5EE"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 6000, p);
      }, idx * 180);
    })(i);
  }
}

// 12. Shooting Stars - SVG comets streaking diagonally
function blondieEffectShootingStars(box) {
  var colors = ['#D4B5F0', '#FFD700', '#9B6BCD', '#FFECB3', '#C39BD3'];
  for (var i = 0; i < 10; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-comet';
        var startX = Math.random() * 60;
        var startY = Math.random() * 40;
        p.style.left = startX + '%';
        p.style.top = startY + '%';
        var dx = 80 + Math.random() * 60;
        var dy = 40 + Math.random() * 30;
        p.style.setProperty('--dx', dx + 'px');
        p.style.setProperty('--dy', dy + 'px');
        p.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
        var color = colors[Math.floor(Math.random() * colors.length)];
        var size = 25 + Math.random() * 15;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 60 20" width="' + size + '" height="' + (size * 0.33) + '">' +
          '<defs><linearGradient id="bv-cm' + uid + '" x1="0%" y1="50%" x2="100%" y2="50%">' +
          '<stop offset="0%" style="stop-color:' + color + ';stop-opacity:0"/>' +
          '<stop offset="70%" style="stop-color:' + color + ';stop-opacity:0.6"/>' +
          '<stop offset="100%" style="stop-color:white;stop-opacity:1"/>' +
          '</linearGradient>' +
          '<filter id="bv-cf' + uid + '"><feGaussianBlur stdDeviation="1"/></filter>' +
          '</defs>' +
          '<rect x="0" y="8" width="50" height="4" rx="2" fill="url(#bv-cm' + uid + ')" filter="url(#bv-cf' + uid + ')"/>' +
          '<circle cx="52" cy="10" r="5" fill="white"/>' +
          '<circle cx="52" cy="10" r="3" fill="' + color + '"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 4000, p);
      }, idx * 300);
    })(i);
  }
}

// 13. Buzzing Hearts - SVG hearts with tiny wings, zigzag rise
function blondieEffectBuzzingHearts(box) {
  var colors = ['#FFD166', '#FF8FAB', '#FFB3C6', '#FFC8DD', '#E8A830'];
  for (var i = 0; i < 15; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-buzzheart';
        p.style.left = (10 + Math.random() * 80) + '%';
        p.style.animationDuration = (3 + Math.random() * 2) + 's';
        p.style.animationDelay = (Math.random() * 0.3) + 's';
        var color = colors[Math.floor(Math.random() * colors.length)];
        var size = 22 + Math.random() * 16;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 40 36" width="' + size + '" height="' + (size * 0.9) + '">' +
          '<defs><radialGradient id="bv-bz' + uid + '" cx="30%" cy="30%" r="70%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:0.5"/>' +
          '<stop offset="50%" style="stop-color:' + color + ';stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -30) + ';stop-opacity:1"/>' +
          '</radialGradient></defs>' +
          '<ellipse cx="12" cy="14" rx="7" ry="4" fill="rgba(255,255,255,0.6)" transform="rotate(-20 12 14)"/>' +
          '<ellipse cx="28" cy="14" rx="7" ry="4" fill="rgba(255,255,255,0.6)" transform="rotate(20 28 14)"/>' +
          '<path d="M20,14 C20,14 12,6 8,14 C4,22 20,32 20,32 C20,32 36,22 32,14 C28,6 20,14 20,14Z" fill="url(#bv-bz' + uid + ')"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 6000, p);
      }, idx * 160);
    })(i);
  }
}

// 14. Champagne Bubbles - SVG 3D gradient spheres rising
function blondieEffectChampagneBubbles(box) {
  var colors = ['#D4677A', '#9B2335', '#FFD700', '#B8860B', '#F0C8D0'];
  for (var i = 0; i < 20; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-bubble';
        p.style.left = (10 + Math.random() * 80) + '%';
        p.style.animationDuration = (3.5 + Math.random() * 2.5) + 's';
        p.style.animationDelay = (Math.random() * 0.4) + 's';
        var color = colors[Math.floor(Math.random() * colors.length)];
        var size = 15 + Math.random() * 20;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 30 30" width="' + size + '" height="' + size + '">' +
          '<defs><radialGradient id="bv-bb' + uid + '" cx="35%" cy="30%" r="65%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:0.8"/>' +
          '<stop offset="40%" style="stop-color:' + color + ';stop-opacity:0.3"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -20) + ';stop-opacity:0.15"/>' +
          '</radialGradient></defs>' +
          '<circle cx="15" cy="15" r="12" fill="url(#bv-bb' + uid + ')" stroke="' + color + '" stroke-width="0.5" stroke-opacity="0.4"/>' +
          '<ellipse cx="11" cy="10" rx="3" ry="2" fill="white" opacity="0.6" transform="rotate(-20 11 10)"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 7000, p);
      }, idx * 120);
    })(i);
  }
}

// 15. Paw Hearts - SVG paw prints popping + hearts from paws
function blondieEffectPawHearts(box) {
  var pawColor = '#F0A070';
  for (var i = 0; i < 12; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-paw';
        p.style.left = (10 + Math.random() * 80) + '%';
        p.style.top = (15 + Math.random() * 60) + '%';
        p.style.animationDuration = (1.5 + Math.random() * 1) + 's';
        var size = 28 + Math.random() * 18;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 40 40" width="' + size + '" height="' + size + '">' +
          '<defs><filter id="bv-pw' + uid + '"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#DEB887" flood-opacity="0.3"/></filter></defs>' +
          '<g filter="url(#bv-pw' + uid + ')">' +
          '<ellipse cx="20" cy="26" rx="10" ry="8" fill="' + pawColor + '"/>' +
          '<circle cx="12" cy="16" r="5" fill="' + pawColor + '"/>' +
          '<circle cx="20" cy="12" r="5" fill="' + pawColor + '"/>' +
          '<circle cx="28" cy="16" r="5" fill="' + pawColor + '"/>' +
          '</g></svg>';
        box.appendChild(p);
        // Spawn a small heart from paw location
        setTimeout(function() {
          var h = document.createElement('div');
          h.className = 'blondie-svg-heart';
          h.style.left = p.style.left;
          h.style.bottom = 'auto';
          h.style.top = p.style.top;
          h.style.animationDuration = '2.5s';
          var huid = blondieEffectUID++;
          var hsize = 18 + Math.random() * 10;
          h.innerHTML = '<svg viewBox="0 0 32 32" width="' + hsize + '" height="' + hsize + '">' +
            '<defs><radialGradient id="bv-ph' + huid + '" cx="30%" cy="30%" r="70%">' +
            '<stop offset="0%" style="stop-color:white;stop-opacity:0.6"/><stop offset="100%" style="stop-color:#FF8FAB;stop-opacity:1"/>' +
            '</radialGradient></defs>' +
            '<path d="M16 28 C16 28 4 18 4 10 C4 5 8 2 12 2 C14 2 16 4 16 6 C16 4 18 2 20 2 C24 2 28 5 28 10 C28 18 16 28 16 28Z" fill="url(#bv-ph' + huid + ')"/></svg>';
          box.appendChild(h);
          setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 3000, h);
        }, 400);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 3000, p);
      }, idx * 250);
    })(i);
  }
}

// 16. Pixel Rain - Blocky pixel hearts falling in columns
function blondieEffectPixelRain(box) {
  var colors = ['#FF1493', '#FF69B4', '#C01070', '#FF00FF', '#FF85C0'];
  for (var i = 0; i < 30; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-pixel-heart';
        p.style.left = (Math.random() * 95) + '%';
        p.style.animationDuration = (2 + Math.random() * 2) + 's';
        p.style.animationDelay = (Math.random() * 0.3) + 's';
        var color = colors[Math.floor(Math.random() * colors.length)];
        var px = 2 + Math.floor(Math.random() * 2);
        // 5x5 pixel heart pattern
        var rows = [
          [0,1,0,1,0],
          [1,1,1,1,1],
          [1,1,1,1,1],
          [0,1,1,1,0],
          [0,0,1,0,0]
        ];
        var svg = '<svg viewBox="0 0 ' + (5*px) + ' ' + (5*px) + '" width="' + (5*px*3) + '" height="' + (5*px*3) + '" style="image-rendering:pixelated">';
        for (var r = 0; r < 5; r++) {
          for (var c = 0; c < 5; c++) {
            if (rows[r][c]) {
              svg += '<rect x="' + (c*px) + '" y="' + (r*px) + '" width="' + px + '" height="' + px + '" fill="' + color + '"/>';
            }
          }
        }
        svg += '</svg>';
        p.innerHTML = svg;
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 5000, p);
      }, idx * 80);
    })(i);
  }
}

// 17. Lavender Drift - SVG lavender sprig stems floating
function blondieEffectLavenderDrift(box) {
  var colors = ['#B57EDC', '#DCC5F0', '#8A55BF', '#D8BFD8'];
  for (var i = 0; i < 12; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-lavender';
        p.style.left = (Math.random() * 100) + '%';
        p.style.animationDuration = (3.5 + Math.random() * 2) + 's';
        p.style.animationDelay = (Math.random() * 0.4) + 's';
        var drift = (Math.random() - 0.5) * 30;
        p.style.setProperty('--drift', drift + 'px');
        var color = colors[Math.floor(Math.random() * colors.length)];
        var size = 18 + Math.random() * 14;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 20 50" width="' + size + '" height="' + (size * 2.5) + '">' +
          '<defs><linearGradient id="bv-lv' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
          '<stop offset="0%" style="stop-color:' + color + ';stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -20) + ';stop-opacity:1"/>' +
          '</linearGradient></defs>' +
          '<line x1="10" y1="50" x2="10" y2="15" stroke="#7CB342" stroke-width="1.5" stroke-linecap="round"/>' +
          '<ellipse cx="10" cy="14" rx="3.5" ry="5" fill="url(#bv-lv' + uid + ')"/>' +
          '<ellipse cx="10" cy="8" rx="3" ry="4" fill="url(#bv-lv' + uid + ')"/>' +
          '<ellipse cx="10" cy="3" rx="2" ry="3" fill="' + color + '" opacity="0.8"/>' +
          '<ellipse cx="6" cy="20" rx="3" ry="4" fill="url(#bv-lv' + uid + ')" transform="rotate(-15 6 20)"/>' +
          '<ellipse cx="14" cy="22" rx="3" ry="4" fill="url(#bv-lv' + uid + ')" transform="rotate(15 14 22)"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 6000, p);
      }, idx * 220);
    })(i);
  }
}

// 18. Magic Burst - SVG iridescent bubbles + sparkle SVGs
function blondieEffectMagicBurst(box) {
  var colors = ['#E05EBF', '#F0A0D8', '#A03B8A', '#77DD77', '#9B59B6'];
  for (var i = 0; i < 15; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-bubble';
        p.style.left = (10 + Math.random() * 80) + '%';
        p.style.animationDuration = (3 + Math.random() * 2) + 's';
        var color = colors[Math.floor(Math.random() * colors.length)];
        var size = 18 + Math.random() * 22;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 30 30" width="' + size + '" height="' + size + '">' +
          '<defs><radialGradient id="bv-mg' + uid + '" cx="35%" cy="30%" r="65%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:0.7"/>' +
          '<stop offset="40%" style="stop-color:' + color + ';stop-opacity:0.5"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -25) + ';stop-opacity:0.2"/>' +
          '</radialGradient>' +
          '<filter id="bv-mf' + uid + '"><feGaussianBlur stdDeviation="0.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
          '</defs>' +
          '<circle cx="15" cy="15" r="12" fill="url(#bv-mg' + uid + ')" filter="url(#bv-mf' + uid + ')" stroke="' + color + '" stroke-width="0.5" stroke-opacity="0.3"/>' +
          '<ellipse cx="10" cy="10" rx="3.5" ry="2" fill="white" opacity="0.5" transform="rotate(-20 10 10)"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 6000, p);
      }, idx * 150);
    })(i);
  }
  blondieSVGSparkleHelper(box, 20, 120);
}

// 19. Milk Splash - SVG droplets expanding + hearts
function blondieEffectMilkSplash(box) {
  var colors = ['#FFB5C5', '#FFD6DF', '#FFF8FA', '#E8909F'];
  // Splash waves expanding from center
  for (var i = 0; i < 8; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-splash';
        p.style.left = (30 + Math.random() * 40) + '%';
        p.style.top = (30 + Math.random() * 30) + '%';
        var angle = Math.random() * Math.PI * 2;
        var dist = 40 + Math.random() * 60;
        p.style.setProperty('--sx', (Math.cos(angle) * dist) + 'px');
        p.style.setProperty('--sy', (Math.sin(angle) * dist) + 'px');
        p.style.animationDuration = (1.5 + Math.random() * 1) + 's';
        var color = colors[Math.floor(Math.random() * colors.length)];
        var size = 12 + Math.random() * 15;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 24 30" width="' + size + '" height="' + (size * 1.25) + '">' +
          '<defs><radialGradient id="bv-sp' + uid + '" cx="40%" cy="30%" r="60%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:0.7"/>' +
          '<stop offset="100%" style="stop-color:' + color + ';stop-opacity:1"/>' +
          '</radialGradient></defs>' +
          '<path d="M12,2 Q6,14 6,20 C6,26 10,28 12,28 C14,28 18,26 18,20 Q18,14 12,2Z" fill="url(#bv-sp' + uid + ')"/>' +
          '<ellipse cx="10" cy="14" rx="2" ry="3" fill="white" opacity="0.4" transform="rotate(-10 10 14)"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 3500, p);
      }, idx * 150);
    })(i);
  }
  // Small hearts in splash
  setTimeout(function() {
    blondieSVGHeartEngine(box, ['#FF8FAB', '#FFB5C5', '#FFC8DD', '#E8909F'], 12);
  }, 400);
}

// 20. Royal Shower - SVG crowns + diamonds + gold confetti
function blondieEffectRoyalShower(box) {
  // Mini crowns
  var crownColors = ['#FFD700', '#FFE44D', '#DAA520'];
  for (var i = 0; i < 8; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'blondie-svg-crown';
        p.style.left = (Math.random() * 100) + '%';
        p.style.animationDuration = (3 + Math.random() * 2) + 's';
        p.style.animationDelay = (Math.random() * 0.5) + 's';
        var color = crownColors[Math.floor(Math.random() * crownColors.length)];
        var size = 22 + Math.random() * 16;
        var uid = blondieEffectUID++;
        p.innerHTML = '<svg viewBox="0 0 40 30" width="' + size + '" height="' + (size * 0.75) + '">' +
          '<defs><linearGradient id="bv-rc' + uid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
          '<stop offset="0%" style="stop-color:' + color + ';stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -30) + ';stop-opacity:1"/>' +
          '</linearGradient></defs>' +
          '<path d="M4,24 L8,8 L16,16 L20,4 L24,16 L32,8 L36,24Z" fill="url(#bv-rc' + uid + ')" stroke="' + blondieAdjustColor(color, -40) + '" stroke-width="1"/>' +
          '<rect x="4" y="24" width="32" height="5" rx="1" fill="url(#bv-rc' + uid + ')" stroke="' + blondieAdjustColor(color, -40) + '" stroke-width="1"/>' +
          '</svg>';
        box.appendChild(p);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 6000, p);
      }, idx * 300);
    })(i);
  }
  // Diamond gems
  var gemColors = ['#DC143C', '#FF4D6D', '#FFD700', '#FF69B4'];
  for (var j = 0; j < 8; j++) {
    (function(idx) {
      setTimeout(function() {
        var g = document.createElement('div');
        g.className = 'blondie-svg-gem';
        g.style.left = (Math.random() * 100) + '%';
        g.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        g.style.animationDelay = (Math.random() * 0.5) + 's';
        var color = gemColors[Math.floor(Math.random() * gemColors.length)];
        var size = 14 + Math.random() * 12;
        var uid = blondieEffectUID++;
        g.innerHTML = '<svg viewBox="0 0 24 28" width="' + size + '" height="' + (size * 1.17) + '">' +
          '<defs><linearGradient id="bv-gm' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" style="stop-color:white;stop-opacity:0.6"/>' +
          '<stop offset="50%" style="stop-color:' + color + ';stop-opacity:1"/>' +
          '<stop offset="100%" style="stop-color:' + blondieAdjustColor(color, -30) + ';stop-opacity:1"/>' +
          '</linearGradient></defs>' +
          '<polygon points="12,2 22,10 12,26 2,10" fill="url(#bv-gm' + uid + ')"/>' +
          '<polygon points="12,2 17,10 12,14 7,10" fill="white" opacity="0.25"/>' +
          '</svg>';
        box.appendChild(g);
        setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 5500, g);
      }, idx * 200);
    })(j);
  }
  // Gold confetti
  blondieConfettiEngine(box, ['#FFD700', '#FFE44D', '#DAA520', '#FFA500', '#FFEC8B'], 30);
}

// Chat commands
function blondieHandleCommand(data) {
  if (!data || !data.text) return;
  var isBroadcaster = data.tags && data.tags.broadcaster === '1';
  var isMod = data.tags && data.tags.mod === '1';
  if (!isBroadcaster && !(blondieFieldData.modCommands && isMod)) return;

  var msg = data.text.trim().split(' ');
  var cmd = msg[0].toLowerCase();
  var val = parseFloat(msg[1]) || 0;

  var cmdAdd = (blondieFieldData.cmdAdd || '!add').toLowerCase();
  var cmdDrop = (blondieFieldData.cmdDrop || '!drop').toLowerCase();
  var cmdProgress = (blondieFieldData.cmdProgress || '!progress').toLowerCase();
  var cmdTarget = (blondieFieldData.cmdTarget || '!target').toLowerCase();
  var cmdClear = (blondieFieldData.cmdClear || '!clear').toLowerCase();

  if (cmd === cmdAdd && val > 0) {
    blondieProgress += val;
    blondieSaveOffset(blondieProgress - blondieSeBaseProgress);
    blondieIconPulse();
  } else if (cmd === cmdDrop && val > 0) {
    blondieProgress = Math.max(0, blondieProgress - val);
    blondieSaveOffset(blondieProgress - blondieSeBaseProgress);
  } else if (cmd === cmdProgress) {
    blondieProgress = Math.max(0, val);
    blondieSaveOffset(blondieProgress - blondieSeBaseProgress);
  } else if (cmd === cmdTarget && val > 0) {
    blondieGoalAmount = val;
    blondieSetupValuesPosition();
  } else if (cmd === cmdClear) {
    blondieProgress = 0;
    blondieWasComplete = false;
    blondieLastMilestone = 0;
    blondieLastProgress = 0;
    blondieClearOffset();
  } else { return; }

  blondieUpdateBar();
}
