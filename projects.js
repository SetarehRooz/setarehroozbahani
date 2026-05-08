// ── Project data ─────────────────────────────────────────────────────────────
// Add your real image paths here. Leave imgSrc empty string if no image yet.
const PROJECTS = [
  {
    num: '01',
    title: 'The Spheres of Influence',
    cat: 'Master Studio · 2022',
    href: 'project-1.html',
    imgSrc: 'images/Spheres of Influence_00.jpg',
    color: [89, 44, 56],
  },
  {
    num: '02',
    title: 'Learning from Lungomare G. Marconi',
    cat: 'Master Thesis · 2022–2023',
    href: 'project-2.html',
    imgSrc: 'images/LLGM.jpeg',
    color: [42, 30, 60],
  },
  {
    num: '03',
    title: 'CIEO Project 01',
    cat: 'Architectural Practice · 2023–2026',
    href: 'project-3.html',
    imgSrc: 'images/CAS01.png',
    color: [26, 46, 60],
  },
  {
    num: '04',
    title: 'CIEO Project 02',
    cat: 'Architectural Practice · 2023–2026',
    href: 'project-4.html',
    imgSrc: 'images/cieo02.png',
    color: [26, 60, 40],
  },
  {
    num: '05',
    title: 'CIEO Project 03',
    cat: 'Architectural Practice · 2023–2026',
    href: 'project-5.html',
    imgSrc: 'images/cieo03.png',
    color: [60, 26, 14],
  },
  {
    num: '06',
    title: 'PENVAN 01',
    cat: 'Architectural Photography · 2023',
    href: 'project-6.html',
    imgSrc: '',
    color: [30, 40, 70],
  },
  {
    num: '07',
    title: 'Extended Liminal',
    cat: 'Summer School · 2022',
    href: 'project-7.html',
    imgSrc: 'images/Extended Liminal_00.jpg',
    color: [60, 30, 48],
  },
];

// ── Skip canvas on mobile ─────────────────────────────────────────────────────
const isMobile = window.innerWidth <= 600 || ('ontouchstart' in window);
if (!isMobile) initDesktop();
else initMobile();

// ══════════════════════════════════════════════════════════════════════════════
// DESKTOP — magnetic wireframe floating cards on canvas
// ══════════════════════════════════════════════════════════════════════════════
function initDesktop() {
  const field   = document.getElementById('project-field');
  const canvas  = document.getElementById('project-canvas');
  const curEl   = document.getElementById('cur');
  const curRing = document.getElementById('cur-ring');
  const hint    = document.getElementById('field-hint');

  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // card dimensions
  const CW = Math.round(W * 0.14);
  const CH = Math.round(CW * 1.3);

  // ── Pseudo-random helper ────────────────────────────────────────────────
  function pr(s) {
    const x = Math.sin(s + 1) * 10000;
    return x - Math.floor(x);
  }

  // ── Load images ──────────────────────────────────────────────────────────
  const images = {};
  PROJECTS.forEach(p => {
    if (p.imgSrc) {
      const img = new Image();
      img.src = p.imgSrc;
      images[p.num] = img;
    }
  });

  // ── Build wireframe geometry per card ────────────────────────────────────
  function buildWireframe(seed) {
    const lines = [], dots = [];
    for (let i = 0; i < 140; i++) {
      const ax = pr(seed + i) * CW;
      const ay = pr(seed + i + 500) * CH;
      const bx = ax + (pr(seed + i + 1000) - 0.5) * 55;
      const by = ay + (pr(seed + i + 1500) - 0.5) * 55;
      const len = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
      if (len > 4 && len < 50) lines.push({ ax, ay, bx, by });
    }
    for (let i = 0; i < 30; i++) {
      dots.push({ x: pr(seed + i + 3000) * CW, y: pr(seed + i + 4000) * CH });
    }
    return { lines, dots };
  }

  // ── Cards state ──────────────────────────────────────────────────────────
  const cards = PROJECTS.map((p, idx) => {
    const seed = idx * 173;
    const wf   = buildWireframe(seed);

    // scatter position — spread around center
    const angle  = (idx / PROJECTS.length) * Math.PI * 2 + pr(idx * 77) * 0.8;
    const dist   = W * 0.12 + pr(idx * 53) * W * 0.18;
    const startX = W / 2 - CW / 2 + Math.cos(angle) * dist;
    const startY = H / 2 - CH / 2 + Math.sin(angle) * dist;

    return {
      p,
      wf,
      x:   startX,
      y:   startY,
      vx:  (pr(idx * 31) - 0.5) * 1.5,
      vy:  (pr(idx * 47) - 0.5) * 1.5,
      rot: (pr(idx * 13) - 0.5) * 18,
      vr:  (pr(idx * 19) - 0.5) * 0.25,
      revealAmt:    0,
      targetReveal: 0,
      selected:     false,
      hovered:      false,
    };
  });

  // ── Draw a single card onto the main canvas ───────────────────────────────
  function drawCard(c) {
    const { p, wf, x, y, rot, revealAmt } = c;
    const [r, g, b] = p.color;

    ctx.save();
    ctx.translate(x + CW / 2, y + CH / 2);
    ctx.rotate(rot * Math.PI / 180);
    ctx.translate(-CW / 2, -CH / 2);

    // base dark fill
    ctx.fillStyle = `rgb(${Math.round(r * 0.18)},${Math.round(g * 0.18)},${Math.round(b * 0.18)})`;
    ctx.fillRect(0, 0, CW, CH);

    // image or color reveal
    const img = images[p.num];
    if (revealAmt > 0.01) {
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.globalAlpha = revealAmt * 0.85;
        ctx.drawImage(img, 0, 0, CW, CH);
        ctx.globalAlpha = 1;
        // dark overlay so text stays readable
        ctx.fillStyle = `rgba(0,0,0,${revealAmt * 0.3})`;
        ctx.fillRect(0, 0, CW, CH);
      } else {
        ctx.fillStyle = `rgba(${r},${g},${b},${revealAmt * 0.6})`;
        ctx.fillRect(0, 0, CW, CH);
      }
    }

    // wireframe lines — fade as image reveals
    const wireA = 1 - revealAmt * 0.75;
    if (wireA > 0.02) {
      ctx.strokeStyle = `rgba(${Math.min(255, r + 80)},${Math.min(255, g + 60)},${Math.min(255, b + 70)},${wireA * 0.55})`;
      ctx.lineWidth   = 0.5;
      wf.lines.forEach(l => {
        ctx.beginPath();
        ctx.moveTo(l.ax, l.ay);
        ctx.lineTo(l.bx, l.by);
        ctx.stroke();
      });
      wf.dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,120,130,${wireA * 0.45})`;
        ctx.fill();
      });
    }

    // ghost wireframe on top of revealed image
    if (revealAmt > 0.3) {
      ctx.strokeStyle = `rgba(255,220,230,${revealAmt * 0.12})`;
      ctx.lineWidth   = 0.5;
      wf.lines.slice(0, 35).forEach(l => {
        ctx.beginPath();
        ctx.moveTo(l.ax, l.ay);
        ctx.lineTo(l.bx, l.by);
        ctx.stroke();
      });
    }

    // dot marker top-left
    ctx.beginPath();
    ctx.arc(9, 9, c.hovered ? 4 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,120,130,${0.4 + revealAmt * 0.5})`;
    ctx.fill();

    // text
    ctx.font = `9px monospace`;
    ctx.fillStyle = `rgba(200,120,130,${0.55 + revealAmt * 0.4})`;
    ctx.fillText(p.num, 9, CH - 32);

    const titleLines = wrapText(p.title, CW - 18, ctx, 9);
    ctx.fillStyle = `rgba(255,255,255,${0.15 + revealAmt * 0.75})`;
    titleLines.forEach((line, i) => {
      ctx.fillText(line.toUpperCase(), 9, CH - 20 + i * 11);
    });

    ctx.fillStyle = `rgba(255,255,255,${0.1 + revealAmt * 0.3})`;
    ctx.font = `8px monospace`;
    ctx.fillText(p.cat, 9, CH - 6);

    ctx.restore();
  }

  // ── Simple word-wrap ─────────────────────────────────────────────────────
  function wrapText(text, maxW, ctx, fontSize) {
    ctx.font = `${fontSize}px monospace`;
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    words.forEach(w => {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 2);
  }

  // ── Hit test ─────────────────────────────────────────────────────────────
  function hitTest(c, mx, my) {
    const cx = c.x + CW / 2, cy = c.y + CH / 2;
    const rad = -c.rot * Math.PI / 180;
    const dx = mx - cx, dy = my - cy;
    const lx = dx * Math.cos(rad) - dy * Math.sin(rad) + CW / 2;
    const ly = dx * Math.sin(rad) + dy * Math.cos(rad) + CH / 2;
    return lx >= 0 && lx <= CW && ly >= 0 && ly <= CH;
  }

  // ── Mouse state ──────────────────────────────────────────────────────────
  let mouseX = W / 2, mouseY = H / 2, mouseActive = false;

  field.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
    hint.style.opacity = '0';
    curEl.style.left   = mouseX + 'px';
    curEl.style.top    = mouseY + 'px';
    curRing.style.left = mouseX + 'px';
    curRing.style.top  = mouseY + 'px';

    let anyHovered = false;
    cards.forEach(c => {
      c.hovered = hitTest(c, mouseX, mouseY);
      if (c.hovered) {
        anyHovered = true;
        c.targetReveal = 1;
      } else if (!c.selected) {
        c.targetReveal = 0;
      }
    });
    curRing.classList.toggle('hovered', anyHovered);
    field.style.cursor = anyHovered ? 'none' : 'none';
  });

  field.addEventListener('mouseleave', () => {
    mouseActive = false;
    hint.style.opacity = '1';
    curRing.classList.remove('hovered');
    cards.forEach(c => {
      c.hovered = false;
      if (!c.selected) c.targetReveal = 0;
    });
  });

  field.addEventListener('click', e => {
    let clicked = null;
    cards.forEach(c => {
      if (hitTest(c, e.clientX, e.clientY)) clicked = c;
    });
    if (clicked) {
      if (clicked.selected) {
        window.location.href = clicked.p.href;
      } else {
        cards.forEach(c => { c.selected = false; if (!c.hovered) c.targetReveal = 0; });
        clicked.selected     = true;
        clicked.targetReveal = 1;
      }
    }
  });

  // ── Animation loop ───────────────────────────────────────────────────────
  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.007;

    ctx.fillStyle = 'rgba(10,6,8,0.35)';
    ctx.fillRect(0, 0, W, H);

    cards.forEach((c, i) => {
      // smooth reveal
      c.revealAmt += (c.targetReveal - c.revealAmt) * 0.07;

      if (c.selected) {
        const tx = W / 2 - CW / 2 + (i % 4 - 1.5) * 18;
        const ty = H / 2 - CH / 2 + (Math.floor(i / 4) - 0.5) * 18;
        c.vx += (tx - c.x) * 0.05;
        c.vy += (ty - c.y) * 0.05;
        c.vr += (0 - c.rot) * 0.06;
      } else if (mouseActive) {
        const cx = c.x + CW / 2, cy = c.y + CH / 2;
        const dx = mouseX - cx, dy = mouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxR = 160;
        if (dist < maxR && dist > 1) {
          const force = ((maxR - dist) / maxR) * 3.2;
          c.vx -= (dx / dist) * force;
          c.vy -= (dy / dist) * force;
          c.vr += (Math.random() - 0.5) * 0.18;
        }
        c.vx += Math.cos(t * 0.7 + i) * 0.01;
        c.vy += Math.sin(t * 0.9 + i * 1.2) * 0.01;
      } else {
        c.vx += Math.cos(t + i * 0.8) * 0.008;
        c.vy += Math.sin(t * 1.1 + i * 0.6) * 0.008;
      }

      // bounds
      if (c.x < 0 || c.x > W - CW) c.vx *= -0.5;
      if (c.y < 0 || c.y > H - CH) c.vy *= -0.5;
      c.x = Math.max(0, Math.min(W - CW, c.x + c.vx));
      c.y = Math.max(0, Math.min(H - CH, c.y + c.vy));
      c.vx *= 0.93; c.vy *= 0.93;
      c.vr *= 0.91;
      c.rot += c.vr;
      c.rot  = Math.max(-20, Math.min(20, c.rot));

      drawCard(c);
    });
  })();

  // resize
  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE — tap to reveal then navigate
// ══════════════════════════════════════════════════════════════════════════════
function initMobile() {
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
// MENU (shared desktop + mobile)
// ══════════════════════════════════════════════════════════════════════════════
const menuDropdown       = document.getElementById('menu-dropdown');
const menuDropdownMobile = document.getElementById('menu-dropdown-mobile');
const btnMenu            = document.getElementById('btn-menu');
const btnMenuMobile      = document.getElementById('btn-menu-mobile');

function closeMenus() {
  menuDropdown.classList.remove('open');
  menuDropdownMobile.classList.remove('open');
  btnMenu.classList.remove('active');
  btnMenuMobile.classList.remove('active');
}

btnMenu.addEventListener('click', e => {
  e.stopPropagation();
  btnMenu.classList.toggle('active', menuDropdown.classList.toggle('open'));
});

btnMenuMobile.addEventListener('click', e => {
  e.stopPropagation();
  btnMenuMobile.classList.toggle('active', menuDropdownMobile.classList.toggle('open'));
});

document.addEventListener('click', e => {
  if (
    !e.target.closest('#menu-wrapper') &&
    !e.target.closest('#btn-menu-mobile') &&
    !e.target.closest('#menu-dropdown-mobile')
  ) closeMenus();
});