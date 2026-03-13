# 💌 Valentine Letter

A pixel-art interactive Valentine experience built with vanilla TypeScript, CSS, and HTML.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖥️ **Boot Screen** | Retro terminal boot sequence with CRT scanlines |
| 💌 **Envelope Scene** | Animated pixel envelope with hover effects |
| 💬 **Typewriter Text** | Letter-by-letter animated titles with blinking caret |
| 😾 **Dodging NO button** | The NO button runs away on hover — physics-based escape logic |
| 📊 **Love Meter** | Pixel progress bar that fills with every failed NO attempt |
| 😤 **Shame Badge** | Top-right badge roasts you for every NO click |
| 🎇 **Particle System** | Physics-simulated confetti + heart burst on interactions |
| 🎉 **Celebration Scene** | Full confetti explosion + dancing cat when YES is clicked |
| 🔊 **8-bit Audio** | Web Audio API tones for clicks, hovers, NOs, and the YES fanfare |
| ♡ **Custom Cursor** | Heart cursor that squishes on click |
| 🌸 **Floating Hearts** | Ambient background hearts floating up continuously |
| 📺 **CRT Scanlines** | Subtle scanline overlay for authentic retro feel |

---

## 📁 File Structure

```
valentine/
├── index.html        ← Markup only, no inline CSS or JS
├── style.css         ← All styles (CSS variables, animations, scenes)
├── script.ts         ← TypeScript source (edit this)
├── script.js         ← Compiled output (don't edit directly)
├── README.md         ← This file
│
├── envelope.png      ← Pixel envelope asset
├── window.png        ← Pixel window frame (letter background)
├── yes.png           ← YES pixel button
├── no.png            ← NO pixel button
├── cat_heart.gif     ← Cat with heart (idle scene)
├── cat_dance.gif     ← Dancing cat (celebration scene)
└── heart-bg.jpg      ← Background texture
```

---

## 🚀 How to Run

### Option A — Just open it
1. Download all files into the **same folder**
2. Open `index.html` in any modern browser
3. That's it — no build step needed (the compiled `script.js` is included)

### Option B — Edit the TypeScript
1. Install TypeScript if you haven't:
   ```bash
   npm install -g typescript
   ```
2. Edit `script.ts` to your liking
3. Compile:
   ```bash
   tsc script.ts --target ES2017 --lib dom,es2017 --strict --skipLibCheck
   ```
4. Refresh `index.html`

---

## 🏗️ Architecture

### Scene System
The app has 4 scenes managed by a simple state machine:

```
Boot → Envelope → Letter → Accepted
```

Each scene is a `position:fixed` div. Transitions use CSS `animation` classes (`scene-active`, `scene-out`).

### TypeScript Structure

```typescript
// State
interface AppState {
  scene:    AppScene;   // which scene is active
  phase:    Phase;      // idle | asking | celebrating
  noCount:  number;     // how many times NO was clicked
  accepted: boolean;    // has YES been clicked
}

// Key enums
enum AppScene { Boot, Envelope, Letter, Accepted }
enum Phase    { Idle, Asking, Celebrating }
```

### Particle System
A requestAnimationFrame-based particle engine with physics (gravity, drag, rotation):
- `spawnParticle(x, y, color, shape)` — creates a DOM particle
- `tickParticles()` — updates all particles each frame
- `burst(x, y, count, useHearts)` — triggers a burst at a coordinate
- `megaBurst()` — fires from 6 screen positions simultaneously

### Audio
Uses the Web Audio API (`AudioContext`) for retro 8-bit tones:
- `playClick()` — square wave blip
- `playNo()` — sawtooth descend
- `playHover()` — soft sine ping  
- `playYes()` — ascending 4-note fanfare

---

## 🎨 Customization

### Change the recipient name
In `index.html`, find the accepted scene and update:
```html
<div class="name-line">See you there, Ali HOUSSENY! 💕</div>
```

### Change the date/location
```html
<div class="date-line">📍 Meow Restaurant · 7:00 PM</div>
```

### Change the escalating messages
In `script.ts`, edit the `MESSAGES` array:
```typescript
const MESSAGES: readonly string[] = [
  "Will you be my\nValentine? 💕",
  // ... add your own
];
```

### Adjust colors
All colors are CSS variables in `style.css`:
```css
:root {
  --pink-5: #e05c7a;   /* primary accent */
  --red:    #c0392b;   /* pixel shadow color */
  --cream:  #fff8f0;   /* popup background */
  --dark:   #1a0a0e;   /* text color */
}
```

---

## 🖋️ Fonts Used

| Font | Usage | Source |
|---|---|---|
| **Press Start 2P** | Titles, buttons | Google Fonts |
| **VT323** | Terminal text, badges | Google Fonts |
| **Pixelify Sans** | Body, labels | Google Fonts |

---

## 🌐 Browser Support

Works in all modern browsers. Requires:
- CSS `animation` support
- `requestAnimationFrame`
- Web Audio API (audio is optional — silently skipped if unavailable)

---

*Made with 💕 and way too many CSS keyframes*
