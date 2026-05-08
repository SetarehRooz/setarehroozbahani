// ── Project data ─────────────────────────────────────────────────────────────
const PROJECTS = [
  { num:'01', title:'The Spheres of Influence',          cat:'Master Studio · 2022',             href:'project-1.html', imgSrc:'images/Spheres of Influence_00.jpg', color:[89,44,56]  },
  { num:'02', title:'Learning from Lungomare G. Marconi', cat:'Master Thesis · 2022–2023',        href:'project-2.html', imgSrc:'images/LLGM.jpeg',                   color:[42,30,60]  },
  { num:'03', title:'CIEO Project 01',                   cat:'Architectural Practice · 2023–2026', href:'project-3.html', imgSrc:'images/CAS01.png',                   color:[26,46,60]  },
  { num:'04', title:'CIEO Project 02',                   cat:'Architectural Practice · 2023–2026', href:'project-4.html', imgSrc:'images/cieo02.png',                  color:[26,60,40]  },
  { num:'05', title:'CIEO Project 03',                   cat:'Architectural Practice · 2023–2026', href:'project-5.html', imgSrc:'images/cieo03.png',                  color:[60,26,14]  },
  { num:'06', title:'PENVAN 01',                         cat:'Architectural Photography · 2023',  href:'project-6.html', imgSrc:'',                                   color:[30,40,70]  },
  { num:'07', title:'Extended Liminal',                  cat:'Summer School · 2022',              href:'project-7.html', imgSrc:'images/Extended Liminal_00.jpg',      color:[60,30,48]  },
];

// Always use canvas on all screen sizes
initCanvas();
initMenu();

// ══════════════════════════════════════════════════════════════════════════════
// CANVAS — used on desktop AND mobile (> 480px)
// ══════════════════════════════════════════════════════════════════════════════
function initCanvas() {
  const field  = document.getElementById('project-field');
  const canvas = document.getElementById('project-canvas');
  const curEl  = document.getElementById('cur');
  const ring   = document.getElementById('cur-ring');

  // hide cursor elements on touch devices
  const isTouch = ('ontouchstart' in window);
  if (isTouch) { curEl.style.display = 'none'; ring.style.display = 'none'; field.style.cursor = 'default'; }

  let W = window.innerWidth;
  let H = window.innerHeight;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Nav strip ──────────────────────────────────────────────────────────────
  const navStrip = document.getElementById('nav-strip');
  PROJECTS.forEach(p => {
    const a = document.createElement('a');
    a.className = 'nav-item';
    a.href = p.href;
    a.innerHTML = `<span class="nav-num">${p.num}</span><span class="nav-title">${p.title.split(' ').slice(0,2).join(' ')}</span>`;
    navStrip.appendChild(a);
  });
  const NAV_H = navStrip.offsetHeight || 44;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function pr(s) { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x); }

  function cardSize(idx) {
    const base = Math.min(W * 0.19, 140);
    const v = [1.0, 1.18, 0.88, 1.1, 0.93, 1.22, 0.85];
    const s = base * v[idx % v.length];
    return { w: Math.round(s), h: Math.round(s * 1.5) };
  }

  function buildWF(seed, cw, ch) {
    const lines = [];
    for (let i = 0; i < 160; i++) {
      const ax = pr(seed + i) * cw, ay = pr(seed + i + 500) * ch;
      const bx = ax + (pr(seed + i + 1000) - 0.5) * 58;
      const by = ay + (pr(seed + i + 1500) - 0.5) * 58;
      const len = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
      if (len > 3 && len < 50) lines.push({ ax, ay, bx, by });
    }
    return lines;
  }

  // ── Load images ────────────────────────────────────────────────────────────
  const loadedImages = {};
  PROJECTS.forEach(p => {
    if (!p.imgSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = p.imgSrc;
    loadedImages[p.num] = img;
  });

  // ── Build cards ────────────────────────────────────────────────────────────
  const PLAYFIELD_H = H - NAV_H;

  const cards = PROJECTS.map((p, idx) => {
    const { w: CW, h: CH } = cardSize(idx);
    const seed = idx * 197;
    const wf = buildWF(seed, CW, CH);

    // very chaotic scatter — random, can overlap, near edges
    const x = pr(idx * 41) * (W - CW * 0.4) - CW * 0.1;
    const y = pr(idx * 67) * (PLAYFIELD_H - CH * 0.4) - CH * 0.1;

    const speed = 3.5 + pr(idx * 23) * 3.5;
    const angle = pr(idx * 89) * Math.PI * 2;

    return {
      p, wf, CW, CH, seed,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: (pr(idx * 13) - 0.5) * 42,
      vr:  (pr(idx * 19) - 0.5) * 0.85,
      revealAmt: 0, targetReveal: 0,
      hovered: false, selected: false,
    };
  });

  // ── Draw image cover-cropped onto canvas ───────────────────────────────────
  function drawImageCover(ctx, img, x, y, w, h) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;
    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale, sh = h / scale;
    const sx = (iw - sw) / 2, sy = (ih - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  // ── Draw single card ───────────────────────────────────────────────────────
  function drawCard(c, targetCtx, ox, oy, scale) {
    const { p, wf, CW, CH, seed, rot, revealAmt, hovered, selected } = c;
    const [r, g, b] = p.color;
    const dc = targetCtx || ctx;
    const cx = ox !== undefined ? ox : c.x;
    const cy = oy !== undefined ? oy : c.y;
    const sc = scale || 1;

    dc.save();
    dc.translate(cx + (CW * sc) / 2, cy + (CH * sc) / 2);
    if (!targetCtx) dc.rotate(rot * Math.PI / 180);
    dc.scale(sc, sc);
    dc.translate(-CW / 2, -CH / 2);

    // base
    dc.fillStyle = `rgb(${r * 0.15 | 0},${g * 0.15 | 0},${b * 0.15 | 0})`;
    dc.fillRect(0, 0, CW, CH);

    // image reveal
    const img = loadedImages[p.num];
    if (revealAmt > 0.01 && img && img.complete && img.naturalWidth > 0) {
      dc.globalAlpha = revealAmt * 0.9;
      dc.save();
      dc.rect(0, 0, CW, CH);
      dc.clip();
      drawImageCover(dc, img, 0, 0, CW, CH);
      dc.restore();
      dc.globalAlpha = 1;
      dc.fillStyle = `rgba(0,0,0,${revealAmt * 0.28})`;
      dc.fillRect(0, 0, CW, CH);
    } else if (revealAmt > 0.01 && !img) {
      // no image — color fill fallback
      dc.fillStyle = `rgba(${r},${g},${b},${revealAmt * 0.6})`;
      dc.fillRect(0, 0, CW, CH);
    }

    // wireframe
    const wA = Math.max(0, 1 - revealAmt * 0.8);
    if (wA > 0.015) {
      dc.lineWidth = 0.5;
      wf.forEach(l => {
        dc.strokeStyle = `rgba(${Math.min(255, r + 120) | 0},${Math.min(255, g + 100) | 0},${Math.min(255, b + 110) | 0},${wA * 0.75})`;
        dc.beginPath(); dc.moveTo(l.ax, l.ay); dc.lineTo(l.bx, l.by); dc.stroke();
      });
      for (let i = 0; i < 24; i++) {
        dc.beginPath();
        dc.arc(pr(seed + i + 3000) * CW, pr(seed + i + 4000) * CH, 0.9, 0, Math.PI * 2);
        dc.fillStyle = `rgba(220,140,150,${wA * 0.65})`;
        dc.fill();
      }
    }

    // ghost wireframe on top of image
    if (revealAmt > 0.35) {
      dc.lineWidth = 0.4;
      wf.slice(0, 50).forEach(l => {
        dc.strokeStyle = `rgba(255,225,235,${revealAmt * 0.1})`;
        dc.beginPath(); dc.moveTo(l.ax, l.ay); dc.lineTo(l.bx, l.by); dc.stroke();
      });
    }

    // border on hover or selected
    if (hovered || selected) {
      dc.strokeStyle = `rgba(200,120,130,${0.2 + revealAmt * 0.5})`;
      dc.lineWidth = 0.5;
      dc.strokeRect(0.5, 0.5, CW - 1, CH - 1);
    }

    // dot
    dc.beginPath();
    dc.arc(7, 7, hovered || selected ? 3.2 : 1.8, 0, Math.PI * 2);
    dc.fillStyle = `rgba(200,120,130,${0.45 + revealAmt * 0.5})`;
    dc.fill();

    // number
    dc.font = '8px monospace';
    dc.fillStyle = `rgba(220,140,150,${0.85 + revealAmt * 0.15})`;
    dc.fillText(p.num, 7, CH - 28);

    // title
    dc.font = '9px monospace';
    dc.fillStyle = `rgba(255,255,255,${0.75 + revealAmt * 0.25})`;
    const words = p.title.split(' ');
    let ln = '', lns = [];
    words.forEach(w => {
      const t = ln ? ln + ' ' + w : w;
      if (dc.measureText(t).width > CW - 14 && ln) { lns.push(ln); ln = w; } else ln = t;
    });
    if (ln) lns.push(ln);
    lns.slice(0, 2).forEach((l, i) => dc.fillText(l.toUpperCase(), 7, CH - 16 + i * 11));

    // cat
    dc.font = '7px monospace';
    dc.fillStyle = `rgba(255,255,255,${0.45 + revealAmt * 0.25})`;
    dc.fillText(p.cat, 7, CH - 4);

    dc.restore();
  }

  // ── Hit test (rotated AABB with enlarged target) ───────────────────────────
  function hitTest(c, mx, my) {
    const cx = c.x + c.CW / 2, cy = c.y + c.CH / 2;
    const rad = -c.rot * Math.PI / 180;
    const dx = mx - cx, dy = my - cy;
    const lx = dx * Math.cos(rad) - dy * Math.sin(rad) + c.CW / 2;
    const ly = dx * Math.sin(rad) + dy * Math.cos(rad) + c.CH / 2;
    const pad = 10;
    return lx >= -pad && lx <= c.CW + pad && ly >= -pad && ly <= c.CH + pad;
  }

  // ── Overlay (selected card fixed in center) ────────────────────────────────
  const overlay     = document.getElementById('card-overlay');
  const ovCanvas    = document.getElementById('overlay-canvas');
  const ovNum       = document.getElementById('overlay-num');
  const ovTitle     = document.getElementById('overlay-title');
  const ovCat       = document.getElementById('overlay-cat');
  const ovLink      = document.getElementById('overlay-link');
  const ovClose     = document.getElementById('overlay-close');
  let   selectedCard = null;

  function showOverlay(c) {
    selectedCard = c;
    c.selected = true;
    c.targetReveal = 1;

    // size the overlay canvas
    const scale = Math.min(2.2, (W * 0.35) / c.CW, (H * 0.6) / c.CH);
    const ow = Math.round(c.CW * scale);
    const oh = Math.round(c.CH * scale);
    ovCanvas.width = ow; ovCanvas.height = oh;
    ovCanvas.style.width  = ow + 'px';
    ovCanvas.style.height = oh + 'px';

    // draw card at full reveal onto overlay canvas
    const tmp = { ...c, rot: 0, revealAmt: 1, hovered: false, selected: true };
    const ovCtx = ovCanvas.getContext('2d');
    ovCtx.clearRect(0, 0, ow, oh);
    drawCard(tmp, ovCtx, 0, 0, scale);

    ovNum.textContent   = c.p.num;
    ovTitle.textContent = c.p.title;
    ovCat.textContent   = c.p.cat;
    ovLink.href         = c.p.href;

    overlay.classList.add('visible');
  }

  function hideOverlay() {
    overlay.classList.remove('visible');
    if (selectedCard) {
      selectedCard.selected = false;
      selectedCard.targetReveal = 0;
      // give it a little kick back into motion
      selectedCard.vx = (Math.random() - 0.5) * 2;
      selectedCard.vy = (Math.random() - 0.5) * 2;
      selectedCard.vr = (Math.random() - 0.5) * 0.4;
      selectedCard = null;
    }
  }

  ovClose.addEventListener('click', hideOverlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) hideOverlay();
  });

  // ── Mouse interaction ──────────────────────────────────────────────────────
  let mX = W / 2, mY = H / 2, mActive = false;

  // ── Drag state ─────────────────────────────────────────────────────────────
  let dragCard = null;       // card being dragged
  let dragOffX = 0, dragOffY = 0;  // offset from card origin to cursor
  let dragStartX = 0, dragStartY = 0; // to detect click vs drag
  let isDragging = false;

  canvas.addEventListener('mousedown', e => {
    if (overlay.classList.contains('visible')) return;
    dragStartX = e.clientX; dragStartY = e.clientY;
    // find topmost hit card (iterate reversed so top-drawn card wins)
    for (let i = cards.length - 1; i >= 0; i--) {
      const c = cards[i];
      if (hitTest(c, e.clientX, e.clientY)) {
        dragCard = c;
        dragOffX = e.clientX - c.x;
        dragOffY = e.clientY - c.y;
        c.hovered = true;
        c.targetReveal = 1;
        c.vx = 0; c.vy = 0; c.vr = 0;
        break;
      }
    }
  });

  canvas.addEventListener('mousemove', e => {
    mX = e.clientX; mY = e.clientY; mActive = true;
    curEl.style.left = mX + 'px'; curEl.style.top = mY + 'px';
    ring.style.left  = mX + 'px'; ring.style.top  = mY + 'px';

    if (dragCard) {
      isDragging = true;
      dragCard.x = e.clientX - dragOffX;
      dragCard.y = e.clientY - dragOffY;
      dragCard.vx = 0; dragCard.vy = 0;
      return;
    }

    let anyH = false;
    cards.forEach(c => {
      if (c.selected) return;
      c.hovered = hitTest(c, mX, mY);
      c.targetReveal = c.hovered ? 1 : 0;
      if (c.hovered) anyH = true;
    });
    ring.classList.toggle('hovered', anyH);
  });

  canvas.addEventListener('mouseup', e => {
    if (dragCard) {
      // give card momentum from drag velocity
      dragCard.vx = (e.clientX - dragStartX) * 0.08;
      dragCard.vy = (e.clientY - dragStartY) * 0.08;
      // if barely moved → treat as click → show overlay
      const moved = Math.abs(e.clientX - dragStartX) + Math.abs(e.clientY - dragStartY);
      if (moved < 6 && !overlay.classList.contains('visible')) {
        showOverlay(dragCard);
      } else {
        dragCard.hovered = false;
        dragCard.targetReveal = 0;
      }
      dragCard = null;
      isDragging = false;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    mActive = false;
    if (dragCard) {
      dragCard.vx = 0; dragCard.vy = 0;
      dragCard.hovered = false; dragCard.targetReveal = 0;
      dragCard = null; isDragging = false;
    }
    cards.forEach(c => { if (!c.selected) { c.hovered = false; c.targetReveal = 0; } });
    ring.classList.remove('hovered');
  });

  // ── Touch interaction (drag + tap to open) ────────────────────────────────
  let touchDragCard = null;
  let touchDragOffX = 0, touchDragOffY = 0;
  let touchStartX = 0, touchStartY = 0;
  let touchMoved = false;

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (overlay.classList.contains('visible')) return;
    const rc = canvas.getBoundingClientRect();
    const tx = e.touches[0].clientX - rc.left;
    const ty = e.touches[0].clientY - rc.top;
    touchStartX = tx; touchStartY = ty; touchMoved = false;
    for (let i = cards.length - 1; i >= 0; i--) {
      const c = cards[i];
      if (hitTest(c, tx, ty)) {
        touchDragCard = c;
        touchDragOffX = tx - c.x;
        touchDragOffY = ty - c.y;
        c.hovered = true; c.targetReveal = 1;
        c.vx = 0; c.vy = 0; c.vr = 0;
        break;
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!touchDragCard) return;
    const rc = canvas.getBoundingClientRect();
    const tx = e.touches[0].clientX - rc.left;
    const ty = e.touches[0].clientY - rc.top;
    const moved = Math.abs(tx - touchStartX) + Math.abs(ty - touchStartY);
    if (moved > 6) touchMoved = true;
    touchDragCard.x = tx - touchDragOffX;
    touchDragCard.y = ty - touchDragOffY;
    touchDragCard.vx = 0; touchDragCard.vy = 0;
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    if (!touchDragCard) return;
    if (!touchMoved) {
      // tap — show overlay
      showOverlay(touchDragCard);
    } else {
      // fling with velocity
      const rc = canvas.getBoundingClientRect();
      const tx = e.changedTouches[0].clientX - rc.left;
      const ty = e.changedTouches[0].clientY - rc.top;
      touchDragCard.vx = (tx - touchStartX) * 0.09;
      touchDragCard.vy = (ty - touchStartY) * 0.09;
      touchDragCard.hovered = false;
      touchDragCard.targetReveal = 0;
    }
    touchDragCard = null;
  }, { passive: false });

  // ── Physics loop ───────────────────────────────────────────────────────────
  let t2 = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t2 += 0.007;

    ctx.fillStyle = 'rgba(10,6,8,0.3)';
    ctx.fillRect(0, 0, W, H);

    cards.forEach((c, i) => {
      c.revealAmt += (c.targetReveal - c.revealAmt) * 0.07;

      if (c === dragCard || c === touchDragCard) {
        // being dragged — skip all physics
      } else if (!c.hovered && !c.selected) {
        // mouse repulsion
        if (mActive) {
          const cx = c.x + c.CW / 2, cy = c.y + c.CH / 2;
          const dx = mX - cx, dy = mY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxR = 185;
          if (dist < maxR && dist > 1) {
            const force = ((maxR - dist) / maxR) * 4.8;
            c.vx -= (dx / dist) * force;
            c.vy -= (dy / dist) * force;
            c.vr += (Math.random() - 0.5) * 0.45;
          }
        }
        // ambient drift
        c.vx += Math.cos(t2 * 0.8 + i * 1.1) * 0.045;
        c.vy += Math.sin(t2 * 1.2 + i * 0.75) * 0.045;

        // soft bounds — allow slight overshoot
        const pad = 35;
        if (c.x < -pad || c.x > W - c.CW + pad) c.vx *= -0.45;
        if (c.y < -pad || c.y > PLAYFIELD_H - c.CH + pad) c.vy *= -0.45;
        c.x = Math.max(-pad, Math.min(W - c.CW + pad, c.x + c.vx));
        c.y = Math.max(-pad, Math.min(PLAYFIELD_H - c.CH + pad, c.y + c.vy));

        c.vx *= 0.975; c.vy *= 0.975;
        c.vr *= 0.92;
        c.rot += c.vr;
        c.rot = Math.max(-45, Math.min(45, c.rot));
      } else if (c.hovered) {
        // slow + straighten on hover
        c.vx *= 0.45; c.vy *= 0.45; c.vr *= 0.45;
        c.rot += (0 - c.rot) * 0.18;
      }
      // selected cards are drawn in overlay, still animate faintly in bg
      drawCard(c);
    });
  })();

  // ── Resize ─────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE GRID FALLBACK (< 480px)
// ══════════════════════════════════════════════════════════════════════════════
function initMobileGrid() {
  document.querySelectorAll('.cell').forEach(el => {
    el.addEventListener('click', () => {
      if (el.classList.contains('active')) {
        window.location.href = el.dataset.href;
      } else {
        el.classList.add('active');
      }
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// MENU
// ══════════════════════════════════════════════════════════════════════════════
function initMenu() {
  const menuDropdown       = document.getElementById('menu-dropdown');
  const menuDropdownMobile = document.getElementById('menu-dropdown-mobile');
  const btnMenu            = document.getElementById('btn-menu');
  const btnMenuMobile      = document.getElementById('btn-menu-mobile');

  function closeMenus() {
    menuDropdown.classList.remove('open');
    menuDropdownMobile.classList.remove('open');
    btnMenu.classList.remove('active');
    if (btnMenuMobile) btnMenuMobile.classList.remove('active');
  }

  btnMenu.addEventListener('click', e => {
    e.stopPropagation();
    btnMenu.classList.toggle('active', menuDropdown.classList.toggle('open'));
  });

  if (btnMenuMobile) {
    btnMenuMobile.addEventListener('click', e => {
      e.stopPropagation();
      btnMenuMobile.classList.toggle('active', menuDropdownMobile.classList.toggle('open'));
    });
  }

  document.addEventListener('click', e => {
    if (
      !e.target.closest('#menu-wrapper') &&
      !e.target.closest('#btn-menu-mobile') &&
      !e.target.closest('#menu-dropdown-mobile')
    ) closeMenus();
  });
}