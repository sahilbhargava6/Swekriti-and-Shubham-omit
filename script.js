/* =====================================================================
   CONFIG — edit the invitation content here.
   Each entry is one page of the card, in order. Pages turn with a page curl.

   cardImage: the full page image (in /pages).
   venue/city: shown on the venue box under the card.
   address:   revealed when the venue box is tapped.
   mapQuery:  searched in Google Maps when the address is tapped;
              or set mapUrl to an exact "Share → Copy link" pin from Google Maps.
   theme:     tints the background and venue box for that page.

   Pages can also be built from HTML instead of an image: leave cardImage
   empty and fill kicker/title/subtitle/blessing/day/month/date/year/time/
   closing/illustration (see pageHTML below).
   ===================================================================== */
const CONFIG = {
  monogram: 'S',
  sealImage: 'seal.png', // wax seal on the envelope (falls back to a drawn seal if missing)
  bgMusic: 'music.mp3', // background music (Saathiya flute theme)
  formUrl: 'https://forms.gle/vEq6WfqpjbCnMzHA9', // RSVP / guest attendance form link
  events: [
    {
      title: 'Wedding Invitation',
      cardImage: 'pages/wedding_card_pages.gif',
      theme: 'invite',
      venue: 'The Ritz', city: 'Moti Nagar',
      address: 'The Ritz, Moti Nagar, New Delhi',
      mapQuery: 'The Ritz, Moti Nagar, New Delhi',
    },
    {
      title: 'Wedding Celebration',
      cardImage: 'pages/wedding_card_pages_3.gif',
      theme: 'celebration',
      venue: 'The Ritz', city: 'Moti Nagar',
      address: 'Pearl Hall, 1st floor — The Ritz, Moti Nagar, New Delhi',
      mapQuery: 'Pearl Hall, The Ritz, Moti Nagar, New Delhi',
    },
    {
      title: 'Celebrations Itinerary',
      cardImage: 'pages/wedding_card_pages_4.gif',
      theme: 'wedding',
      venue: 'Multiple Venues', city: 'Naraina & Moti Nagar',
      locations: [
        {
          event: 'Tel-Madha Bhaat (Dec 01 · 12:30 PM)',
          name: 'Hotel Palm Grand',
          address: 'Hotel Palm Grand, Naraina, New Delhi',
          mapQuery: 'Hotel Palm Grand, Naraina, New Delhi',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Palm+Grand%2C+Naraina%2C+New+Delhi',
        },
        {
          event: 'Ring Ceremony (Dec 01) & Wedding (Dec 02)',
          name: 'The Ritz',
          address: 'The Ritz, 69/1A, Najafgarh Road, Moti Nagar, New Delhi',
          mapQuery: 'The Ritz, Moti Nagar, New Delhi',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=The+Ritz%2C+Moti+Nagar%2C+New+Delhi',
        },
      ],
    },
    {
      title: 'In Loving Memory',
      cardImage: 'pages/wedding_card_pages_5.gif',
      theme: 'memory',
    },
    {
      title: 'With Best Compliments',
      cardImage: 'pages/wedding_card_pages_6.gif',
      theme: 'family',
    },
    {
      title: 'Family & Blessings',
      cardImage: 'pages/wedding_card_pages_7.gif',
      theme: 'family',
    },
    {
      title: 'Warm Regards',
      cardImage: 'pages/wedding_card_pages_8.gif',
      theme: 'family',
    },
    {
      title: 'Awaiting Your Presence',
      cardImage: 'pages/wedding_card_pages_9.gif',
      theme: 'invite',
      venue: 'The Ritz', city: 'Moti Nagar',
      address: 'The Ritz, Moti Nagar, New Delhi',
      mapQuery: 'The Ritz, Moti Nagar, New Delhi',
    },
  ],
};

const THEMES = {
  invite:      { accent: '#a0283a', deep: '#7e1d2c', bg: '#f3ead9' },
  ring:        { accent: '#2c3a78', deep: '#1f2a5c', bg: '#e8e5ee' },
  celebration: { accent: '#6a4387', deep: '#553270', bg: '#e6efec' },
  haldi:       { accent: '#e9a514', deep: '#c27a12', drape1: '#fbe7ab', drape2: '#f1c656', wash: '#f6cd45', bead1: '#f39a1e', bead2: '#f7c636', paste: '#f2b51c', bg: '#efe6cf' },
  mehendi:     { accent: '#6e8f2c', deep: '#4b6a1d', drape1: '#e4ecc6', drape2: '#b9cd7f', wash: '#b4cb73', bead1: '#f39a1e', bead2: '#7da43c', paste: '#5d7a26', bg: '#e9ead5' },
  wedding:     { accent: '#b4243f', deep: '#8a1a31', drape1: '#f9d8d8', drape2: '#e9a3ad', wash: '#efa1ae', bead1: '#d8314f', bead2: '#f2b53a', paste: '#c8304f', bg: '#f3e4df' },
  family:      { accent: '#9b6b3e', deep: '#724c28', bg: '#f8f3ed' },
  memory:      { accent: '#8b6f53', deep: '#614b35', bg: '#f5eee6' },
};

const CARD_RATIO = 396 / 559; // width / height of the card (matches the new page images)

/* ---------- helpers ---------- */
const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function rng(seed) { // deterministic so the layout is identical on every load
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

/* =====================================================================
   Cherry blossoms & falling petals
   ===================================================================== */
function drawBlossoms() {
  const R = rng(7);
  // Realistic falling cherry blossom petals (rendered behind the cards)
  const petalImgs = [
    'url("pages/petal_0.png")',
    'url("pages/petal_1.png")',
    'url("pages/petal_2.png")',
    'url("pages/petal_3.png")',
    'url("pages/petal_4.png")',
    'url("pages/petal_5.png")',
    'url("pages/petal_6.png")',
    'url("pages/petal_7.png")',
    'url("pages/petal_8.png")',
  ];

  const rain = $('petalRain');
  if (!rain) return;
  rain.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const d = 9 + R() * 9;
    const size = 16 + R() * 20;
    const img = petalImgs[Math.floor(R() * petalImgs.length)];
    const op = (0.75 + R() * 0.25).toFixed(2);
    const xPct = R() * 100;
    const delay = -R() * d;

    p.style.cssText = `--x:${xPct.toFixed(1)}%;--s:${size.toFixed(0)}px;--d:${d.toFixed(1)}s;--delay:${delay.toFixed(1)}s;--sway:${(18 + R() * 32).toFixed(0)}px;--r:${(R() * 360).toFixed(0)}deg;--op:${op};--img:${img}`;
    p.appendChild(document.createElement('i'));
    rain.appendChild(p);
  }
}

/* =====================================================================
   Wax seal
   ===================================================================== */
function sealMarkup(letter) {
  const R = rng(11);
  const pts = [];
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    const r = 46 + 2.2 * Math.sin(a * 7) + 1.4 * Math.sin(a * 13 + 1) + R() * 1.2;
    pts.push(`${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`);
  }
  const blob = `M${pts.join('L')}Z`;
  return `<svg viewBox="-50 -50 100 100" aria-hidden="true">
    <defs>
      <radialGradient id="sealG" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#fad8bf"/><stop offset=".45" stop-color="#eaa985"/><stop offset=".8" stop-color="#d48a6a"/><stop offset="1" stop-color="#b9694d"/></radialGradient>
      <radialGradient id="sealIn" cx=".6" cy=".65" r=".75"><stop offset="0" stop-color="#f6c7a7"/><stop offset=".6" stop-color="#e9a682"/><stop offset="1" stop-color="#d38966"/></radialGradient>
    </defs>
    <path d="${blob}" fill="url(#sealG)"/>
    <circle r="33" fill="url(#sealIn)" stroke="#b9694d" stroke-opacity=".45" stroke-width="2"/>
    <circle r="31" fill="none" stroke="#ffe6d3" stroke-opacity=".55" stroke-width="1"/>
    <ellipse cx="-14" cy="-22" rx="12" ry="5" fill="#fff" opacity=".22" transform="rotate(-30 -14 -22)"/>
  </svg><span class="seal-letter">${esc(letter)}</span>`;
}

/* =====================================================================
   Invitation pages
   ===================================================================== */
function marigold(x, y, r, varName = '--bead1') {
  return `<g><circle cx="${x}" cy="${y}" r="${r}" style="fill:var(${varName})"/>`
    + `<circle cx="${x}" cy="${y}" r="${(r * 0.62).toFixed(2)}" fill="#000" opacity=".12"/>`
    + `<circle cx="${x}" cy="${y}" r="${(r * 0.25).toFixed(2)}" fill="#a3500c" opacity=".7"/></g>`;
}

function strand(x, len, id) {
  let s = `<line x1="${x}" y1="2" x2="${x}" y2="${len}" stroke="#c9a24a" stroke-width=".35"/>`;
  let i = 0;
  for (let y = 7; y < len - 3; y += 3.6, i++) {
    s += i % 2 ? `<ellipse cx="${x}" cy="${y}" rx=".6" ry="1.2" fill="#6d9a3a"/>` : marigold(x, y, 1.25, i % 4 === 0 ? '--bead1' : '--bead2');
  }
  s += `<g transform="translate(${x} ${len - 1})"><path d="M0 0C2.6 1.6 3.2 5 0 8.5C-3.2 5-2.6 1.6 0 0Z" fill="url(#bud-${id})"/>`
    + `<path d="M-2.3 1.9Q0 3.8 2.3 1.9Q0 .8-2.3 1.9Z" fill="#6d9a3a"/></g>`;
  return s;
}

function decorSVG(t, id) {
  const stops = [0, 0.12, 0.24, 0.36, 0.5, 0.64, 0.78, 0.9, 1]
    .map((o, i) => `<stop offset="${o}" stop-color="${i % 2 ? t.drape2 : t.drape1}"/>`).join('');
  let valance = 'M0 0H100V3.5';
  for (let x = 100; x > 0; x -= 12.5) valance += `Q${x - 6.25} 10 ${x - 12.5} 3.5`;
  valance += 'Z';
  const curtain = 'M0 0H18C15 13 9 25 7 35C9 48 14 62 16 84C10 86.5 4 85.5 0 87Z';
  const strands = [[10, 24], [15, 34], [20, 28]];
  let hang = '';
  for (const [x, len] of strands) hang += strand(x, len, id) + strand(100 - x, len + (x === 10 ? 4 : 0), id);
  return `<svg class="decor" viewBox="0 0 100 141" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="dr-${id}" x1="0" x2="1">${stops}</linearGradient>
      <radialGradient id="bud-${id}" cx=".5" cy=".8" r=".9"><stop offset="0" stop-color="#e2557f"/><stop offset="1" stop-color="#f9bdd0"/></radialGradient>
    </defs>
    <g opacity=".88">
      <path d="${curtain}" fill="url(#dr-${id})"/>
      <path d="${curtain}" fill="url(#dr-${id})" transform="translate(100 0) scale(-1 1)"/>
      <ellipse cx="7" cy="35" rx="3.2" ry="1.5" style="fill:var(--deep)"/>
      <ellipse cx="93" cy="35" rx="3.2" ry="1.5" style="fill:var(--deep)"/>
      <path d="${valance}" fill="url(#dr-${id})"/>
    </g>
    ${hang}
  </svg>`;
}

function illustrationSVG(id) {
  let leaves = '';
  for (let k = 0; k < 7; k++) {
    const a = -66 + k * 22;
    leaves += `<ellipse cx="0" cy="-8" rx="2.1" ry="7.5" fill="${k % 2 ? '#5f8f3a' : '#79a84a'}" transform="rotate(${a})"/>`;
  }
  const plant = (x, s) => `<g transform="translate(${x} 50) scale(${s})">${leaves}${marigold(-5, -9, 1.6)}${marigold(6, -12, 1.4, '--bead2')}</g>`
    + `<path d="M${x - 6} 49.5H${x + 6}L${x + 4.6} 55.5H${x - 4.6}Z" fill="#c98b5a"/>`;
  return `<svg class="fallback" viewBox="0 0 100 56" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <defs>
      <filter id="blur-${id}" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter>
      <linearGradient id="brass-${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e8bd58"/><stop offset="1" stop-color="#a87322"/></linearGradient>
    </defs>
    <g filter="url(#blur-${id})" opacity=".55" style="fill:var(--wash)">
      <ellipse cx="50" cy="53" rx="58" ry="11"/><ellipse cx="17" cy="47" rx="22" ry="9"/><ellipse cx="84" cy="48" rx="22" ry="8"/>
    </g>
    ${plant(15, 1)}${plant(85, 0.85)}
    <path d="M44 51.5H56L58.5 55.5H41.5Z" fill="#b8822b"/>
    <path d="M30 44Q50 60 70 44Z" fill="url(#brass-${id})"/>
    <ellipse cx="50" cy="44" rx="20" ry="3" fill="#f0cf78"/>
    <ellipse cx="50" cy="44.1" rx="17" ry="2.1" style="fill:var(--paste)"/>
    ${marigold(43, 43.6, 1.7)}${marigold(50.5, 44.3, 1.9, '--bead2')}${marigold(57, 43.6, 1.6)}
    ${marigold(30, 54, 1.4, '--bead2')}${marigold(69, 54.5, 1.5)}${marigold(74, 53, 1.1, '--bead2')}
  </svg>`;
}

function pageHTML(ev, i) {
  if (ev.cardImage) {
    return `<img class="full-card" src="${esc(ev.cardImage)}" alt="${esc(ev.title)} invitation" draggable="false">`;
  }
  const t = THEMES[ev.theme] || THEMES.haldi;
  const id = `p${i}`;
  const vars = Object.entries(t).map(([k, v]) => `--${k}:${v}`).join(';');
  return `<article class="invite" style="${vars}">
    ${decorSVG(t, id)}
    <div class="illustration">
      ${illustrationSVG(id)}
      ${ev.illustration ? `<img class="art" src="${esc(ev.illustration)}" alt="" draggable="false"
        onload="this.parentNode.classList.add('has-art')" onerror="this.remove()">` : ''}
    </div>
    <div class="invite-text">
      <p class="kicker">${esc(ev.kicker)}</p>
      <h2 class="event-title${ev.title.length > 8 ? ' long' : ''}">${esc(ev.title)}</h2>
      <p class="event-sub">${esc(ev.subtitle)}</p>
      <p class="blessing">${esc(ev.blessing)}</p>
      <svg class="flourish" viewBox="0 0 100 12" aria-hidden="true"><path d="M2 6H40M60 6H98" stroke="currentColor" stroke-width=".8" opacity=".6"/><path d="M50 1L55 6L50 11L45 6Z" fill="currentColor" opacity=".7"/></svg>
      <div class="when">
        <span class="side">${esc(ev.day)}</span>
        <span class="date"><small>${esc(ev.month)}</small><b>${esc(ev.date)}</b><small>${esc(ev.year)}</small></span>
        <span class="side">${esc(ev.time)}</span>
      </div>
      <p class="venue">${esc(ev.venue)}<span>${esc(ev.city)}</span></p>
      <p class="closing">${esc(ev.closing)}</p>
    </div>
  </article>`;
}

/* =====================================================================
   Book — 3D Rolling Leaf Page Turn
   ===================================================================== */
class Book {
  constructor(el, pagesHTML, monogram, onChange) {
    this.el = el;
    this.onChange = onChange;
    this.cur = 0;
    this.busy = false;
    this.monogram = monogram || 'S';
    this.W = el.clientWidth || 370;
    this.H = el.clientHeight || 520;

    // Create page elements inside container
    this.el.innerHTML = '';
    this.pages = pagesHTML.map((html) => {
      const p = document.createElement('section');
      p.className = 'page';
      p.innerHTML = html;
      this.el.appendChild(p);
      return p;
    });

    // Cast shadow on the bottom page during a turn
    this.underShadow = document.createElement('div');
    this.underShadow.className = 'under-shadow';
    this.el.appendChild(this.underShadow);

    // 4-panel 3D turning leaf
    this.leaf = document.createElement('div');
    this.leaf.className = 'turning-leaf';
    this.panels = [];

    let parent = this.leaf;
    for (let i = 0; i < 4; i++) {
      const panel = document.createElement('div');
      panel.className = `leaf-panel leaf-panel-${i}`;

      const front = document.createElement('div');
      front.className = 'panel-face panel-front';
      const frontImg = document.createElement('img');
      frontImg.className = 'panel-img';
      frontImg.alt = '';
      frontImg.draggable = false;
      const frontShade = document.createElement('div');
      frontShade.className = 'panel-shade';
      front.appendChild(frontImg);
      front.appendChild(frontShade);

      const back = document.createElement('div');
      back.className = 'panel-face panel-back';
      const backInner = document.createElement('div');
      backInner.className = 'panel-back-inner';
      backInner.innerHTML = `<div class="back-decor"><span class="back-monogram">${esc(this.monogram)}</span></div>`;
      const backShade = document.createElement('div');
      backShade.className = 'panel-shade';
      back.appendChild(backInner);
      back.appendChild(backShade);

      panel.appendChild(front);
      panel.appendChild(back);
      parent.appendChild(panel);

      this.panels.push({
        el: panel,
        frontImg,
        frontShade,
        backShade,
      });

      parent = panel; // Nested compound curvature
    }

    this.el.appendChild(this.leaf);

    this.show(0);
    this.bindPointer();
  }

  get count() {
    return this.pages ? this.pages.length : 0;
  }

  measure() {
    this.W = this.el.clientWidth || 370;
    this.H = this.el.clientHeight || 520;
  }

  show(i) {
    this.cur = clamp(i, 0, this.count - 1);
    this.pages.forEach((p, k) => {
      p.classList.toggle('is-visible', k === this.cur);
      p.style.zIndex = k === this.cur ? '1' : '0';
    });
    this.leaf.classList.remove('is-active');
    this.underShadow.style.opacity = '0';
  }

  goTo(i) {
    if (this.busy || this.cur === i || i < 0 || i >= this.count) return;
    if (Math.abs(this.cur - i) === 1) {
      this.flip(i > this.cur ? 'fwd' : 'back');
    } else {
      this.show(i);
      if (typeof this.onChange === 'function') this.onChange(i);
    }
  }

  // Setup the turning leaf with page images
  setupLeaf(dir, curIdx, targetIdx) {
    const leafImgIdx = dir === 'fwd' ? curIdx : targetIdx;
    const fromImg = this.pages[leafImgIdx] ? this.pages[leafImgIdx].querySelector('img.full-card') : null;
    const imgSrc = fromImg ? fromImg.src : '';
    this.panels.forEach((p) => {
      p.frontImg.src = imgSrc;
    });

    if (dir === 'fwd') {
      // Forward: curIdx curls away, revealing targetIdx underneath
      this.pages.forEach((p, k) => {
        p.classList.toggle('is-visible', k === targetIdx);
        p.style.zIndex = k === targetIdx ? '1' : '0';
      });
    } else {
      // Backward: targetIdx unrolls from left onto curIdx
      this.pages.forEach((p, k) => {
        p.classList.toggle('is-visible', k === curIdx);
        p.style.zIndex = k === curIdx ? '1' : '0';
      });
    }
    this.leaf.classList.add('is-active');
  }

  // Render 3D cylindrical page roll at progress p (0 = flat right, 1 = flat left)
  renderProgress(p) {
    p = clamp(p, 0, 1);
    const roll = Math.sin(p * Math.PI); // curvature envelope

    // 4 compound joint angles
    const a0 = -180 * Math.pow(p, 1.25);
    const a1 = -roll * 28 * (1 - p * 0.45);
    const a2 = -roll * 32 * (1 - p * 0.35);
    const a3 = -roll * 24 * (1 - p * 0.25);

    this.panels[0].el.style.transform = `rotateY(${a0.toFixed(2)}deg)`;
    this.panels[1].el.style.transform = `rotateY(${a1.toFixed(2)}deg)`;
    this.panels[2].el.style.transform = `rotateY(${a2.toFixed(2)}deg)`;
    this.panels[3].el.style.transform = `rotateY(${a3.toFixed(2)}deg)`;

    // Curvature lighting: specular highlight rolls across the panels
    this.panels.forEach((panel, i) => {
      const panelCenterP = (3 - i) * 0.25;
      const dist = Math.abs(p - panelCenterP);
      const highlight = Math.max(0, 1 - dist * 4) * roll * 0.45;
      const shadow = roll * (0.12 + (i / 4) * 0.18);

      if (p < 0.6) {
        panel.frontShade.style.opacity = '1';
        panel.frontShade.style.background = `linear-gradient(to right, rgba(0,0,0,${(shadow * 0.4).toFixed(3)}) 0%, rgba(255,255,255,${highlight.toFixed(3)}) 50%, rgba(0,0,0,${shadow.toFixed(3)}) 100%)`;
      } else {
        panel.frontShade.style.opacity = '0';
      }

      if (p > 0.4) {
        panel.backShade.style.opacity = '1';
        panel.backShade.style.background = `linear-gradient(to right, rgba(0,0,0,${shadow.toFixed(3)}) 0%, rgba(255,255,255,${(highlight * 0.8).toFixed(3)}) 50%, rgba(0,0,0,${(shadow * 0.5).toFixed(3)}) 100%)`;
      } else {
        panel.backShade.style.opacity = '0';
      }
    });

    // Cast shadow sweeping onto the bottom page
    this.underShadow.style.opacity = `${(roll * 0.55).toFixed(2)}`;
    this.underShadow.style.width = `${Math.round(40 + roll * 45)}%`;
  }

  // Smooth tween animation
  animateTurn(fromP, toP, dur = 580, ease = easeInOut) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now) => {
        const elapsed = now - t0;
        const t = clamp(elapsed / dur, 0, 1);
        const p = fromP + (toP - fromP) * ease(t);
        this.renderProgress(p);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  async flip(dir, dur = 580) {
    if (this.busy) return;
    const target = dir === 'fwd' ? this.cur + 1 : this.cur - 1;
    if (target < 0 || target >= this.count) return;

    this.busy = true;
    stage.classList.add('is-flipping');
    this.measure();

    if (dir === 'fwd') {
      this.setupLeaf('fwd', this.cur, target);
      await this.animateTurn(0, 1, dur, easeInOut);
      this.show(target);
      if (typeof this.onChange === 'function') this.onChange(target);
    } else {
      this.setupLeaf('back', this.cur, target);
      await this.animateTurn(1, 0, dur, easeInOut);
      this.show(target);
      if (typeof this.onChange === 'function') this.onChange(target);
    }

    stage.classList.remove('is-flipping');
    this.busy = false;
  }

  async tease() {
    if (this.busy || this.count < 2 || this.cur >= this.count - 1) return;
    this.busy = true;
    this.measure();
    this.setupLeaf('fwd', this.cur, this.cur + 1);
    await this.animateTurn(0, 0.20, 500, easeOut);
    await this.animateTurn(0.20, 0, 420, easeInOut);
    this.show(this.cur);
    this.busy = false;
  }

  bindPointer() {
    const el = this.el;
    let drag = null;

    el.addEventListener('pointerdown', (e) => {
      if (this.busy || state !== 'reading' || isZoomOpen) return;
      if (e.target.closest('.carousel-arrow') || e.target.closest('.card-zoom-btn')) return;

      this.measure();
      drag = {
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastT: performance.now(),
        vx: 0,
        active: false,
        dir: null,
        target: null,
        progress: 0,
        pointerId: e.pointerId,
      };
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });

    el.addEventListener('pointermove', (e) => {
      if (!drag || drag.pointerId !== e.pointerId) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const now = performance.now();
      const dt = now - drag.lastT;
      if (dt > 10) {
        drag.vx = (e.clientX - drag.lastX) / dt;
        drag.lastX = e.clientX;
        drag.lastT = now;
      }

      if (!drag.active) {
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
          if (Math.abs(dx) > Math.abs(dy) * 1.1) {
            drag.active = true;
            if (dx < 0) {
              if (this.cur < this.count - 1) {
                drag.dir = 'fwd';
                drag.target = this.cur + 1;
                this.setupLeaf('fwd', this.cur, drag.target);
              } else {
                drag = null;
                return;
              }
            } else {
              if (this.cur > 0) {
                drag.dir = 'back';
                drag.target = this.cur - 1;
                this.setupLeaf('back', this.cur, drag.target);
              } else {
                drag = null;
                return;
              }
            }
          } else {
            drag = null;
            return;
          }
        }
      }

      if (drag && drag.active) {
        if (drag.dir === 'fwd') {
          drag.progress = clamp(-dx / this.W, 0, 1);
        } else {
          drag.progress = clamp(1 - (dx / this.W), 0, 1);
        }
        this.renderProgress(drag.progress);
      }
    });

    const finish = async (e) => {
      if (!drag || drag.pointerId !== e.pointerId) return;
      const d = drag;
      drag = null;
      try { el.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }

      if (!d.active) {
        const rect = el.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX > this.W * 0.55 && this.cur < this.count - 1) {
          await this.flip('fwd');
        } else if (clickX < this.W * 0.45 && this.cur > 0) {
          await this.flip('back');
        }
        return;
      }

      this.busy = true;
      stage.classList.add('is-flipping');

      let shouldComplete = false;
      if (d.dir === 'fwd') {
        shouldComplete = d.progress > 0.28 || d.vx < -0.3;
      } else {
        shouldComplete = d.progress < 0.72 || d.vx > 0.3;
      }

      const targetP = d.dir === 'fwd'
        ? (shouldComplete ? 1 : 0)
        : (shouldComplete ? 0 : 1);

      const remaining = Math.abs(targetP - d.progress);
      const dur = Math.max(180, Math.min(480, remaining * 520));

      await this.animateTurn(d.progress, targetP, dur, easeOut);

      const next = shouldComplete ? d.target : this.cur;
      this.show(next);
      if (shouldComplete && typeof this.onChange === 'function') {
        this.onChange(next);
      }
      stage.classList.remove('is-flipping');
      this.busy = false;
    };

    el.addEventListener('pointerup', finish);
    el.addEventListener('pointercancel', finish);
  }
}

/* =====================================================================
   Envelope sequence
   ===================================================================== */
const stage = $('stage');
const envelope = $('envelope');
const card = $('card');
const seal = $('seal');
const venueBox = $('venueBox');
const readerDetails = $('readerDetails');
let state = 'closed';
let book;

function updateStageHeight() {
  if (state !== 'reading') return;
  const details = $('readerDetails');
  if (!details) return;
  const detailsH = details.offsetHeight || 140;
  const cy = parseInt(card.style.top, 10) || 54;
  const ch = parseInt(card.style.height, 10) || 450;
  const totalH = cy + ch + 14 + detailsH + 30;
  stage.style.minHeight = `${Math.max(window.innerHeight, totalH)}px`;
}

function layout() {
  const sw = stage.clientWidth, sh = window.innerHeight;
  const envW = Math.min(sw - 20, sw * 0.94, (sh - 70) * 0.6);
  const envH = envW / 0.6;
  const envX = (sw - envW) / 2;
  const envY = sh - envH - Math.max(sh * 0.02, 10);
  Object.assign(envelope.style, { left: `${envX}px`, top: `${envY}px`, width: `${envW}px`, height: `${envH}px` });

  // Top space accommodates music buttons and top safe area
  const topSpace = Math.max(54, Math.min(62, Math.round(sh * 0.08)));
  // Clean card sizing: ensure card is sharp and readable
  const maxCh = Math.max(400, sh - topSpace - 140);
  const maxCwByH = maxCh * CARD_RATIO;
  const cw = Math.floor(Math.min(sw - 20, sw * 0.92, maxCwByH));
  const ch = Math.round(cw / CARD_RATIO);
  const cx = Math.round((sw - cw) / 2);
  const cy = topSpace;
  Object.assign(card.style, { left: `${cx}px`, top: `${cy}px`, width: `${cw}px`, height: `${ch}px` });

  // where the card sits while inside the envelope
  const s = (envW * 0.9) / cw;
  const inX = envX + envW * 0.05, inY = envY + envH * 0.035;
  const peek = ch * s * 0.4;
  const sep = inY + ch * s - peek - envY + 24; // how far the envelope must drop for the card to clear the pocket
  const vars = {
    '--in-tx': `${inX - cx}px`, '--in-ty': `${inY - cy}px`, '--in-s': s,
    '--peek': `${peek}px`, '--sep': `${sep}px`, '--gone': `${sh - envY + envH * 0.45 + 40}px`,
  };
  for (const [k, v] of Object.entries(vars)) stage.style.setProperty(k, v);

  // Position readerDetails directly below the card with a clean gap
  if (readerDetails) {
    const detailsTop = cy + ch + 14;
    Object.assign(readerDetails.style, { left: `${cx}px`, top: `${detailsTop}px`, width: `${cw}px` });
  }

  updateStageHeight();
  if (book) book.measure();
}

/* ---------- background music & volume ---------- */
const musicBtn = $('musicBtn');
const volumeSlider = $('volumeSlider');
const bgMusic = $('bgMusic');
let isUserMuted = false;
let currentVolume = 0.30; // Reduced default volume (30%)

if (bgMusic) {
  bgMusic.volume = currentVolume;
}

function playMusic() {
  if (!bgMusic || isUserMuted) return;
  bgMusic.volume = currentVolume;
  bgMusic.play().then(() => {
    if (volumeSlider) {
    volumeSlider.value = currentVolume;
    volumeSlider.addEventListener('input', onVolumeInput);
  }
  if (musicBtn) {
      musicBtn.classList.add('is-playing');
      musicBtn.classList.remove('is-muted');
      musicBtn.setAttribute('aria-label', 'Pause background music');
    }
  }).catch(() => {
    // Browser autoplay policy prevented playback before interaction
  });
}

function pauseMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
  if (musicBtn) {
    musicBtn.classList.remove('is-playing');
    musicBtn.classList.add('is-muted');
    musicBtn.setAttribute('aria-label', 'Play background music');
  }
}

function toggleMusic() {
  if (!bgMusic) return;
  if (bgMusic.paused) {
    isUserMuted = false;
    if (currentVolume <= 0.05) currentVolume = 0.30;
    if (volumeSlider) volumeSlider.value = currentVolume;
    playMusic();
  } else {
    isUserMuted = true;
    pauseMusic();
  }
}

function onVolumeInput(e) {
  const val = parseFloat(e.target.value);
  currentVolume = val;
  if (!bgMusic) return;
  bgMusic.volume = val;
  if (val === 0) {
    isUserMuted = true;
    pauseMusic();
  } else {
    isUserMuted = false;
    if (bgMusic.paused) {
      playMusic();
    } else if (musicBtn) {
      musicBtn.classList.add('is-playing');
      musicBtn.classList.remove('is-muted');
    }
  }
}

async function openEnvelope() {
  if (state !== 'closed') return;
  playMusic();
  state = 'opening';
  const c = stage.classList;
  c.add('is-opening', 'is-seal-broken');
  await wait(450);
  c.add('is-flap-open');
  await wait(900);
  c.add('is-card-peek');
  await wait(1050);
  c.add('is-env-down');
  await wait(900);
  c.add('is-card-front', 'is-env-gone', 'is-card-out');
  await wait(1200);
  c.add('is-reading');
  document.body.classList.add('is-reading-mode');
  state = 'reading';
  updateStageHeight();
  let seen = false;
  try { seen = !!localStorage.getItem('turnedOnce'); } catch (e) { /* storage unavailable */ }
  if (!seen) setTimeout(() => state === 'reading' && book.tease(), 600);
}

async function closeEnvelope() {
  if (state !== 'reading') return;
  state = 'closing';
  closeZoom();
  document.body.classList.remove('is-reading-mode');
  stage.style.minHeight = '';
  window.scrollTo({ top: 0, behavior: 'instant' });
  const c = stage.classList;
  c.remove('is-reading');
  c.remove('is-env-gone', 'is-card-out');
  await wait(1200);
  c.remove('is-card-front', 'is-env-down');
  await wait(950);
  c.remove('is-card-peek');
  await wait(1050);
  c.remove('is-flap-open');
  await wait(900);
  book.show(0);
  setTheme(0);
  seal.classList.add('no-trans');
  c.remove('is-seal-broken');
  void seal.offsetWidth;
  seal.classList.remove('no-trans');
  seal.classList.add('stamp');
  await wait(650);
  seal.classList.remove('stamp');
  c.remove('is-opening');
  state = 'closed';
}

function setTheme(i) {
  const t = THEMES[CONFIG.events[i].theme] || THEMES.haldi;
  stage.style.setProperty('--bg', t.bg);
  stage.style.setProperty('--accent', t.accent);
  stage.style.setProperty('--deep', t.deep);
  setVenue(CONFIG.events[i]);
}

// Venue box: renders single or multiple locations with separate Google Maps links
function setVenue(ev) {
  const inner = $('venueBodyInner');
  const rsvpBtn = $('rsvpBtn');
  if (rsvpBtn) {
    rsvpBtn.href = ev.formUrl || CONFIG.formUrl || 'https://forms.gle/vEq6WfqpjbCnMzHA9';
  }

  if (!ev.venue && (!ev.locations || ev.locations.length === 0)) {
    venueBox.classList.add('is-hidden');
    toggleVenue(false);
    updateStageHeight();
    return;
  }

  venueBox.classList.remove('is-hidden');
  $('venueName').textContent = [ev.venue, ev.city].filter(Boolean).join(', ');

  if (ev.locations && ev.locations.length > 0) {
    // Multiple locations (e.g. Page 4 - Celebrations Itinerary)
    inner.innerHTML = `
      <div class="venue-multi-locations">
        ${ev.locations.map((loc) => {
          const mapHref = loc.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapQuery || loc.address || loc.name)}`;
          return `
            <div class="venue-location-item">
              <div class="venue-loc-header">
                ${loc.event ? `<span class="venue-loc-badge">${esc(loc.event)}</span>` : ''}
                <span class="venue-loc-name">${esc(loc.name)}</span>
              </div>
              <div class="venue-address">${esc(loc.address)}</div>
              <a class="venue-map-link" href="${esc(mapHref)}" target="_blank" rel="noopener">
                <svg class="map-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                Open in Google Maps ↗
              </a>
            </div>
          `;
        }).join('<div class="venue-loc-sep"></div>')}
      </div>
    `;
  } else {
    // Single location
    const mapHref = ev.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.mapQuery || `${ev.venue}, ${ev.address || ev.city}`)}`;
    inner.innerHTML = `
      <div class="venue-location-item">
        <div class="venue-address">${esc(ev.address || [ev.venue, ev.city].filter(Boolean).join(', '))}</div>
        <a class="venue-map-link" href="${esc(mapHref)}" target="_blank" rel="noopener">
          <svg class="map-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
          Open in Google Maps ↗
        </a>
      </div>
    `;
  }

  updateStageHeight();
}

function toggleVenue(open = !venueBox.classList.contains('is-open')) {
  venueBox.classList.toggle('is-open', open);
  $('venueHead').setAttribute('aria-expanded', String(open));
  $('venueCta').textContent = open ? 'Hide' : 'View address';
  setTimeout(updateStageHeight, 460);
}

let currentPageIndex = 0;

function updateCarouselArrows() {
  const prevBtn = $('carouselPrevBtn');
  const nextBtn = $('carouselNextBtn');
  if (prevBtn) {
    prevBtn.classList.toggle('is-disabled', currentPageIndex <= 0);
    prevBtn.setAttribute('aria-disabled', String(currentPageIndex <= 0));
  }
  if (nextBtn) {
    nextBtn.classList.toggle('is-disabled', currentPageIndex >= CONFIG.events.length - 1);
    nextBtn.setAttribute('aria-disabled', String(currentPageIndex >= CONFIG.events.length - 1));
  }
}

function onPageChange(i) {
  currentPageIndex = i;
  setTheme(i);
  updateStageHeight();
  updateCarouselArrows();
  if (isZoomOpen) {
    zoomIndex = i;
    updateZoomModalView();
  }
}

/* =====================================================================
   Zoom Lightbox Viewer
   ===================================================================== */
const zoomModal = $('zoomModal');
const zoomBackdrop = $('zoomBackdrop');
const zoomCanvas = $('zoomCanvas');
const zoomImage = $('zoomImage');
const zoomPageBadge = $('zoomPageBadge');
const zoomLevelText = $('zoomLevelText');
const zoomViewport = $('zoomViewport');
const zoomInBtn = $('zoomInBtn');
const zoomOutBtn = $('zoomOutBtn');
const zoomResetBtn = $('zoomResetBtn');
const zoomCloseBtn = $('zoomCloseBtn');
const zoomPrevBtn = $('zoomPrevBtn');
const zoomNextBtn = $('zoomNextBtn');
const cardZoomBtn = $('cardZoomBtn');

let isZoomOpen = false;
let zoomIndex = 0;
let zoomScale = 1.0;
let zoomPanX = 0;
let zoomPanY = 0;
let isDraggingZoom = false;
let dragStartX = 0;
let dragStartY = 0;
let startPanX = 0;
let startPanY = 0;
let initialPinchDist = 0;
let initialPinchScale = 1.0;

function applyZoomTransform(animate = true) {
  if (!zoomCanvas) return;
  if (!animate) {
    zoomCanvas.classList.add('no-transition');
  } else {
    zoomCanvas.classList.remove('no-transition');
  }

  // Clamp pan so image doesn't fly out of view
  if (zoomScale <= 1.02) {
    zoomPanX = 0;
    zoomPanY = 0;
    if (zoomViewport) zoomViewport.classList.remove('is-zoomed');
  } else {
    if (zoomViewport) zoomViewport.classList.add('is-zoomed');
    const maxPanX = Math.max(0, (window.innerWidth * (zoomScale - 1)) / 1.6);
    const maxPanY = Math.max(0, (window.innerHeight * (zoomScale - 1)) / 1.6);
    zoomPanX = clamp(zoomPanX, -maxPanX, maxPanX);
    zoomPanY = clamp(zoomPanY, -maxPanY, maxPanY);
  }

  zoomCanvas.style.transform = `translate3d(${zoomPanX}px, ${zoomPanY}px, 0px) scale(${zoomScale})`;
  if (zoomLevelText) {
    zoomLevelText.textContent = `${Math.round(zoomScale * 100)}%`;
  }
}

function setZoomScale(targetScale, animate = true) {
  zoomScale = clamp(targetScale, 1.0, 3.2);
  applyZoomTransform(animate);
}

function updateZoomModalView() {
  if (!zoomModal || !CONFIG.events[zoomIndex]) return;
  const ev = CONFIG.events[zoomIndex];
  if (zoomImage) zoomImage.src = ev.cardImage;
  if (zoomPageBadge) zoomPageBadge.textContent = `${zoomIndex + 1} / ${CONFIG.events.length}`;

  if (zoomPrevBtn) {
    zoomPrevBtn.classList.toggle('is-disabled', zoomIndex <= 0);
  }
  if (zoomNextBtn) {
    zoomNextBtn.classList.toggle('is-disabled', zoomIndex >= CONFIG.events.length - 1);
  }

  zoomScale = 1.0;
  zoomPanX = 0;
  zoomPanY = 0;
  applyZoomTransform(false);
}

function openZoom(index = currentPageIndex) {
  if (!zoomModal) return;
  isZoomOpen = true;
  zoomIndex = clamp(index, 0, CONFIG.events.length - 1);
  zoomModal.classList.add('is-open');
  zoomModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-zoomed');
  updateZoomModalView();
}

function closeZoom() {
  if (!zoomModal || !isZoomOpen) return;
  isZoomOpen = false;
  zoomModal.classList.remove('is-open');
  zoomModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-zoomed');
  zoomScale = 1.0;
  zoomPanX = 0;
  zoomPanY = 0;
  applyZoomTransform(false);
}

function flipZoom(dir) {
  const nextIdx = dir === 'fwd' ? zoomIndex + 1 : zoomIndex - 1;
  if (nextIdx >= 0 && nextIdx < CONFIG.events.length) {
    zoomIndex = nextIdx;
    updateZoomModalView();
    if (book && typeof book.show === 'function') {
      book.show(zoomIndex);
      onPageChange(zoomIndex);
    }
  }
}

/* ---------- init ---------- */
function init() {
  drawBlossoms();
  const img = new Image();
  img.onload = () => seal.querySelectorAll('.seal-half').forEach((h) => { h.innerHTML = `<img src="${esc(CONFIG.sealImage)}" alt="" draggable="false">`; });
  if (CONFIG.sealImage) img.src = CONFIG.sealImage;
  const sealFace = sealMarkup(CONFIG.monogram);
  seal.querySelectorAll('.seal-half').forEach((h) => { h.innerHTML = sealFace; });

  layout();
  book = new Book($('book'), CONFIG.events.map(pageHTML), CONFIG.monogram, onPageChange);
  addEventListener('resize', layout);
  stage.querySelector('.env-back').addEventListener('click', openEnvelope);
  seal.addEventListener('click', openEnvelope);
  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }
  const startOnFirstGesture = () => {
    if (!isUserMuted && bgMusic && bgMusic.paused) {
      playMusic();
    }
  };
  window.addEventListener('pointerdown', startOnFirstGesture, { once: true });
  $('closeBtn').addEventListener('click', () => { toggleVenue(false); closeEnvelope(); });
  $('venueHead').addEventListener('click', () => toggleVenue());

  // Carousel navigation arrows on card
  const carouselPrevBtn = $('carouselPrevBtn');
  const carouselNextBtn = $('carouselNextBtn');
  if (carouselPrevBtn) {
    carouselPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state !== 'reading' || !book || book.busy) return;
      book.flip('back');
    });
  }
  if (carouselNextBtn) {
    carouselNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state !== 'reading' || !book || book.busy) return;
      book.flip('fwd');
    });
  }

  // Card Zoom button trigger
  if (cardZoomBtn) {
    cardZoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state !== 'reading') return;
      openZoom(currentPageIndex);
    });
  }


  // Zoom Modal controls & gestures
  if (zoomCloseBtn) zoomCloseBtn.addEventListener('click', closeZoom);
  if (zoomBackdrop) zoomBackdrop.addEventListener('click', closeZoom);
  if (zoomPrevBtn) zoomPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); flipZoom('back'); });
  if (zoomNextBtn) zoomNextBtn.addEventListener('click', (e) => { e.stopPropagation(); flipZoom('fwd'); });

  if (zoomInBtn) zoomInBtn.addEventListener('click', () => setZoomScale(zoomScale + 0.35));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => setZoomScale(zoomScale - 0.35));
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => setZoomScale(zoomScale > 1.1 ? 1.0 : 2.0));

  if (zoomViewport) {
    // Wheel zoom inside viewer
    zoomViewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.25;
      setZoomScale(zoomScale + delta);
    }, { passive: false });

    // Double tap/click to toggle zoom
    let lastTapTime = 0;
    zoomViewport.addEventListener('click', (e) => {
      if (e.target.closest('.zoom-header') || e.target.closest('.zoom-arrow')) return;
      const now = Date.now();
      if (now - lastTapTime < 320) {
        setZoomScale(zoomScale > 1.1 ? 1.0 : 2.0);
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    });

    // Mouse drag pan when zoomed
    zoomViewport.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.zoom-header') || e.target.closest('.zoom-arrow')) return;
      if (zoomScale > 1.02) {
        isDraggingZoom = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        startPanX = zoomPanX;
        startPanY = zoomPanY;
        zoomViewport.classList.add('is-dragging');
        zoomCanvas.classList.add('no-transition');
        try { zoomViewport.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      }
    });

    zoomViewport.addEventListener('pointermove', (e) => {
      if (!isDraggingZoom) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      zoomPanX = startPanX + dx;
      zoomPanY = startPanY + dy;
      applyZoomTransform(false);
    });

    const stopZoomDrag = (e) => {
      if (!isDraggingZoom) return;
      isDraggingZoom = false;
      zoomViewport.classList.remove('is-dragging');
      zoomCanvas.classList.remove('no-transition');
      applyZoomTransform(true);
      try { zoomViewport.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    };
    zoomViewport.addEventListener('pointerup', stopZoomDrag);
    zoomViewport.addEventListener('pointercancel', stopZoomDrag);

    // Touch pinch to zoom
    zoomViewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialPinchScale = zoomScale;
      }
    }, { passive: true });

    zoomViewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialPinchDist > 0) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / initialPinchDist;
        setZoomScale(initialPinchScale * factor, false);
      }
    }, { passive: true });
  }



  const detailsEl = $('readerDetails');
  if (detailsEl && window.ResizeObserver) {
    new ResizeObserver(() => {
      updateStageHeight();
    }).observe(detailsEl);
  }

  addEventListener('keydown', (e) => {
    if (isZoomOpen) {
      if (e.key === 'Escape') closeZoom();
      if (e.key === 'ArrowRight' || e.key === 'PageDown') flipZoom('fwd');
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') flipZoom('back');
      if (e.key === '+' || e.key === '=') setZoomScale(zoomScale + 0.35);
      if (e.key === '-' || e.key === '_') setZoomScale(zoomScale - 0.35);
      if (e.key === '0') setZoomScale(1.0);
      return;
    }

    if (state === 'closed' && (e.key === 'Enter' || e.key === ' ')) openEnvelope();
    if (state !== 'reading') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') book.flip('fwd');
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') book.flip('back');
    if (e.key === 'Escape') closeEnvelope();
  });

  setTheme(0);
  updateCarouselArrows();

  // ?open → open automatically (handy for previews)
  if (new URLSearchParams(location.search).has('open')) setTimeout(openEnvelope, 1400);
}

init();
