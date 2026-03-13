"use strict";
// ================================================================
//  💌 Valentine Letter — script.ts
//  Pixel-art interactive Valentine experience
//  Compile: tsc script.ts --target ES2017 --lib dom,es2017 --strict --skipLibCheck
// ================================================================
// ── Enums ────────────────────────────────────────────────────────
var AppScene;
(function (AppScene) {
    AppScene["Boot"] = "boot";
    AppScene["Envelope"] = "envelope";
    AppScene["Letter"] = "letter";
    AppScene["Accepted"] = "accepted";
})(AppScene || (AppScene = {}));
var Phase;
(function (Phase) {
    Phase["Idle"] = "idle";
    Phase["Asking"] = "asking";
    Phase["Celebrating"] = "celebrating";
})(Phase || (Phase = {}));
// ── Constants ────────────────────────────────────────────────────
const MESSAGES = [
    "Will you be my\nValentine? 💕",
    "Pleaseee? The cat\nasked nicely 🐾",
    "Are you sure?? 🥺",
    "The cat is\ndisappointed...",
    "Come on!! I made\nreservations! 🍽️",
    "Ok now you're just\nbeing mean 😢",
    "I'm not giving up\non us!! 💪",
    "Resistance is\nfutile 💘",
    "THE CAT DEMANDS\nYES!! 😾",
    "...fine. Last\nchance. 🌹",
];
const HEARTS = ["♡", "💕", "💗", "💝", "💖", "🌸", "✨", "💫"];
const SPARKLES = ["✨", "💫", "⭐", "🌟", "💥", "🎇"];
const CONFETTI_COLORS = [
    "#ff6b9d", "#ff8fab", "#ffb3c6", "#e05c7a", "#c0392b",
    "#ff9f43", "#ffeaa7", "#fff0f5", "#a29bfe", "#fd79a8",
];
const BADGE_TEXTS = [
    "u tried NO once...",
    "NO x2? Really??",
    "3 NOs. Wow. Rude.",
    "4 NOs. The cat cries.",
    "5 NOs. Unbelievable.",
    "6 NOs. I'm fine. 😭",
    "7 NOs. Fine. FINE.",
    "8 NOs. I give up.",
    "9 NOs. Just kidding.",
    "10 NOs. YOU'LL REGRET.",
];
const POPUP_MSGS = [
    '"NO" is not in\nmy vocabulary! 🐱',
    "THE CAT HAS SPOKEN.\nSay YES. 😾",
    "I'll ask again\nforever. 💕",
];
const BOOT_LINES = [
    "> INITIALIZING LOVE.EXE...",
    "> LOADING PIXEL ASSETS... [████████] 100%",
    "> CHECKING VALENTINE STATUS... ♡",
    "> HEART MODULE: ONLINE",
    "> CAT APPROVAL: GRANTED 🐱",
    "> LAUNCHING IN 3... 2... 1...",
];
// ── DOM Utility ──────────────────────────────────────────────────
function $(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`#${id} not found`);
    return el;
}
// ── State ────────────────────────────────────────────────────────
const state = {
    scene: AppScene.Boot,
    phase: Phase.Idle,
    noCount: 0,
    accepted: false,
    popupShown: false,
};
// ── DOM Refs ─────────────────────────────────────────────────────
const sceneBoot = $("scene-boot");
const sceneEnvelope = $("scene-envelope");
const sceneLetter = $("scene-letter");
const sceneAccepted = $("scene-accepted");
const envelopeImg = $("envelope-img");
const letterWindow = $("letter-window");
const letterTitle = $("letter-title");
const letterCat = $("letter-cat");
const yesBtn = $("yes-btn");
const noBtn = $("no-btn");
const noWrapper = $("no-wrapper");
const progressFill = $("progress-fill");
const progressArea = $("progress-area");
const progressPct = $("progress-pct");
const badge = $("badge");
const popup = $("popup");
const popupMsg = $("popup-msg");
const popupOkBtn = $("popup-ok");
const acceptedText = $("accepted-text");
const bgParticles = $("bg-particles");
const customCursor = $("custom-cursor");
const bootText = $("boot-text");
// ── Audio ────────────────────────────────────────────────────────
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}
function playTone(cfg) {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = cfg.type;
        osc.frequency.setValueAtTime(cfg.frequency, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(cfg.frequency * 0.7, ctx.currentTime + cfg.duration);
        gain.gain.setValueAtTime(cfg.gain, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + cfg.duration);
    }
    catch (_) { }
}
const playClick = () => playTone({ frequency: 440, type: "square", duration: 0.08, gain: 0.12 });
const playNo = () => playTone({ frequency: 200, type: "sawtooth", duration: 0.2, gain: 0.10 });
const playHover = () => playTone({ frequency: 660, type: "sine", duration: 0.05, gain: 0.05 });
const playYes = () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone({ frequency: f, type: "sine", duration: 0.35, gain: 0.18 }), i * 130));
};
// ── Typewriter ───────────────────────────────────────────────────
let twHandle = null;
function typewrite(text, el, speed = 55, done) {
    if (twHandle)
        clearTimeout(twHandle);
    el.innerHTML = "";
    const lines = text.split("\n");
    let li = 0, ci = 0;
    function tick() {
        if (li >= lines.length) {
            done === null || done === void 0 ? void 0 : done();
            return;
        }
        const line = lines[li];
        if (ci < line.length) {
            const done_lines = lines.slice(0, li).map(l => `<tspan>${l}</tspan>`).join("");
            const cur_line = `<tspan>${line.slice(0, ci + 1)}<span class="caret">▮</span></tspan>`;
            el.innerHTML = done_lines + cur_line;
            ci++;
            twHandle = setTimeout(tick, speed);
        }
        else {
            el.innerHTML = lines.slice(0, li + 1).map(l => `<tspan>${l}</tspan>`).join("");
            li++;
            ci = 0;
            twHandle = setTimeout(tick, speed * 5);
        }
    }
    tick();
}
// ── Particles ────────────────────────────────────────────────────
const particles = [];
let rafId = null;
function spawnParticle(x, y, color, shape) {
    const el = document.createElement("div");
    const size = 6 + Math.random() * 12;
    el.style.cssText = `
    position:fixed;pointer-events:none;z-index:9999;
    width:${size}px;height:${size}px;
    left:${x}px;top:${y}px;
    ${shape === "circle" ? `background:${color};border-radius:50%;` : ""}
    ${shape === "square" ? `background:${color};` : ""}
    ${shape === "heart" ? `color:${color};font-size:${size + 6}px;line-height:1;` : ""}
  `;
    if (shape === "heart")
        el.textContent = "♥";
    document.body.appendChild(el);
    particles.push({
        el, x, y, size, color, shape,
        vx: (Math.random() - 0.5) * 14,
        vy: -(5 + Math.random() * 10),
        life: 1,
    });
}
function tickParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.4;
        p.vx *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.022;
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;
        p.el.style.opacity = `${Math.max(0, p.life)}`;
        p.el.style.transform = `rotate(${(1 - p.life) * 360}deg) scale(${p.life})`;
        if (p.life <= 0) {
            p.el.remove();
            particles.splice(i, 1);
        }
    }
    rafId = particles.length > 0 ? requestAnimationFrame(tickParticles) : null;
}
function burst(x, y, n = 18, hearts = false) {
    for (let i = 0; i < n; i++) {
        const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const shape = hearts ? "heart" : (Math.random() > 0.5 ? "circle" : "square");
        spawnParticle(x, y, color, shape);
    }
    if (!rafId)
        rafId = requestAnimationFrame(tickParticles);
}
function megaBurst() {
    const w = window.innerWidth, h = window.innerHeight;
    [[w * .2, h * .3], [w * .5, h * .2], [w * .8, h * .3], [w * .1, h * .7], [w * .5, h * .6], [w * .9, h * .7]]
        .forEach(([x, y], i) => setTimeout(() => burst(x, y, 28, true), i * 160));
}
// ── Floating Hearts (background) ─────────────────────────────────
function spawnBgHeart() {
    const el = document.createElement("div");
    el.className = "bg-heart";
    el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    const dur = 7 + Math.random() * 9;
    el.style.cssText = `
    left:${Math.random() * 100}vw;
    font-size:${14 + Math.random() * 22}px;
    animation-duration:${dur}s;
    animation-delay:${Math.random() * 3}s;
  `;
    bgParticles.appendChild(el);
    setTimeout(() => el.remove(), (dur + 4) * 1000);
}
setInterval(spawnBgHeart, 650);
for (let i = 0; i < 12; i++)
    setTimeout(spawnBgHeart, i * 200);
// ── Custom Cursor ────────────────────────────────────────────────
document.addEventListener("mousemove", (e) => {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
});
document.addEventListener("mousedown", () => customCursor.classList.add("pressed"));
document.addEventListener("mouseup", () => customCursor.classList.remove("pressed"));
// ── Scene transitions ────────────────────────────────────────────
const SCENE_MAP = {
    [AppScene.Boot]: sceneBoot,
    [AppScene.Envelope]: sceneEnvelope,
    [AppScene.Letter]: sceneLetter,
    [AppScene.Accepted]: sceneAccepted,
};
function goTo(next) {
    const cur = SCENE_MAP[state.scene];
    const dest = SCENE_MAP[next];
    cur.classList.add("scene-out");
    setTimeout(() => {
        cur.classList.remove("scene-active", "scene-out");
        dest.classList.add("scene-active");
        state.scene = next;
        onEnter(next);
    }, 550);
}
function onEnter(s) {
    if (s === AppScene.Letter) {
        setTimeout(() => {
            letterWindow.classList.add("open");
            typewrite(MESSAGES[0], letterTitle, 62);
            state.phase = Phase.Asking;
        }, 120);
    }
    if (s === AppScene.Accepted) {
        playYes();
        setTimeout(() => {
            acceptedText.classList.add("reveal");
            megaBurst();
        }, 350);
    }
}
// ── Boot sequence ────────────────────────────────────────────────
function runBoot() {
    let idx = 0;
    function next() {
        if (idx >= BOOT_LINES.length) {
            setTimeout(() => goTo(AppScene.Envelope), 500);
            return;
        }
        const div = document.createElement("div");
        div.className = "boot-line";
        div.textContent = BOOT_LINES[idx];
        bootText.appendChild(div);
        requestAnimationFrame(() => requestAnimationFrame(() => div.classList.add("show")));
        idx++;
        setTimeout(next, 360 + Math.random() * 220);
    }
    setTimeout(next, 400);
}
// ── Progress ─────────────────────────────────────────────────────
function updateProgress() {
    const pct = Math.min(state.noCount * 10, 100);
    progressArea.style.display = "flex";
    progressFill.style.width = `${pct}%`;
    progressPct.textContent = `${pct}%`;
    if (pct >= 100)
        progressFill.classList.add("full");
}
// ── Badge ────────────────────────────────────────────────────────
function flashBadge() {
    badge.textContent = BADGE_TEXTS[Math.min(state.noCount - 1, BADGE_TEXTS.length - 1)];
    badge.style.display = "block";
    badge.classList.remove("badge-pop");
    void badge.offsetWidth;
    badge.classList.add("badge-pop");
}
// ── Shake ────────────────────────────────────────────────────────
function shake() {
    document.body.classList.remove("shake");
    void document.body.offsetWidth;
    document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 500);
}
// ── Popup ────────────────────────────────────────────────────────
let popupIdx = 0;
function showPopup() {
    popupMsg.innerHTML = POPUP_MSGS[popupIdx % POPUP_MSGS.length]
        .split("\n").map(l => `<span>${l}</span>`).join("");
    popupIdx++;
    popup.style.display = "flex";
    requestAnimationFrame(() => requestAnimationFrame(() => popup.classList.add("open")));
}
function hidePopup() {
    popup.classList.remove("open");
    setTimeout(() => { popup.style.display = "none"; }, 300);
    noWrapper.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
    noWrapper.style.transform = "translate(0,0) rotate(0deg)";
}
// ── Events ───────────────────────────────────────────────────────
sceneBoot.addEventListener("click", () => {
    if (state.scene === AppScene.Boot)
        goTo(AppScene.Envelope);
});
envelopeImg.addEventListener("click", (e) => {
    if (state.scene !== AppScene.Envelope)
        return;
    playClick();
    burst(e.clientX, e.clientY, 18);
    goTo(AppScene.Letter);
});
noBtn.addEventListener("mouseenter", () => {
    if (state.accepted)
        return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const r = noWrapper.getBoundingClientRect();
    let tx = 0, ty = 0, t = 0;
    do {
        const a = Math.random() * Math.PI * 2;
        const d = 180 + Math.random() * 200;
        tx = Math.cos(a) * d;
        ty = Math.sin(a) * d;
        t++;
    } while (t < 30 && (r.left + tx < 10 || r.left + tx > vw - 140 || r.top + ty < 10 || r.top + ty > vh - 70));
    noWrapper.style.transition = `transform ${0.14 + Math.random() * 0.1}s cubic-bezier(0.34,1.56,0.64,1)`;
    noWrapper.style.transform = `translate(${tx}px,${ty}px) rotate(${(Math.random() - .5) * 18}deg)`;
    playHover();
});
noBtn.addEventListener("click", (e) => {
    if (state.accepted)
        return;
    state.noCount++;
    burst(e.clientX, e.clientY, 10);
    playNo();
    flashBadge();
    updateProgress();
    if (state.noCount % 3 === 0)
        shake();
    typewrite(MESSAGES[Math.min(state.noCount, MESSAGES.length - 1)], letterTitle, 52);
    const s = 1 + Math.min(state.noCount * 0.05, 0.45);
    letterCat.style.transform = `scale(${s})`;
    letterCat.style.filter = `hue-rotate(${state.noCount * 10}deg)`;
    if (state.noCount % 5 === 0)
        setTimeout(showPopup, 500);
});
popupOkBtn.addEventListener("click", () => { playClick(); hidePopup(); });
yesBtn.addEventListener("click", (e) => {
    if (state.accepted)
        return;
    state.accepted = true;
    state.phase = Phase.Celebrating;
    playClick();
    burst(e.clientX, e.clientY, 40, true);
    setTimeout(() => goTo(AppScene.Accepted), 280);
});
// ── Init ─────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    sceneBoot.classList.add("scene-active");
    runBoot();
});
