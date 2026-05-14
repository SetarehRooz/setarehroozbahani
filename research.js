// ── Research data ─────────────────────────────────────────────────────────────
// Fill in your real titles, abstracts, hrefs and colors.
// year: 2019–2025 maps to horizontal axis
// method: 0.0 (low/theoretical) to 1.0 (high/technical) maps to vertical axis
const RESEARCH = [
  {
    num: '01', title: 'The Extended Liminal',
    imgSrc:'images/explore/01-01.png',
    tag: 'Forensic', year: 2022, method: 0.85,
    href: 'research-01.html', color: [89,44,56],
    abstract: 'Summerschool exploration o the liminality of wifi signal strength as a spatial arrangement of architecture of interior and exterior.',
  },
  {
    num: '02', title: 'Photogrammetric Typologies of the Spheres of Influence project',
    tag: 'Computational', year: 2022, method: 0.68,
    href: 'research-02.html', color: [42,30,60],
    abstract: 'Photogrammetric documentation and typological analysis of the Spheres of Influence project.',
  },
  {
    num: '03', title: 'Generative explorations for Venice, Lido.',
    tag: 'Forensic', year: 2023, method: 0.9,
    href: 'research-03.html', color: [89,44,56],
    abstract: 'Generative what-if scenarrios for the future of Venice and Lido, as part of the Learning from Lungomare, master thesis project. ',
  },
  {
    num: '04', title: 'UNBUILDINGS: RCDHL Group Exhibition/ The Spheres of Influence',
    tag: 'Representation', year: 2024, method: 0.48,
    href: 'research-04.html', color: [60,30,48],
    abstract: 'An architectural/art group exhibition at Versus Art Project, Istanbul, Turkey, Curated by Bahar Avanoğlu, İpek Avanoğlu, and Ece Duran. Featuring work by Spheres of Influence project and other RCDHL research.',
  },
  {
    num: '05', title: 'Glitches of Architecture in the making.',
    tag: 'Computational', year: 2024, method: 0.65,
    href: 'research-05.html', color: [26,46,60],
    abstract: 'Messy, incomplete, and glitchy states, but not failures, of computational design processes as a way of understanding, representing, and engaging with architecture in the making. 2023-2026.',
  },
  {
    num: '06', title: 'Bestek GUI application.',
    tag: 'Digital', year: 2025, method: 0.38,
    href: 'research-06.html', color: [30,40,70],
    abstract: 'How can we create a playful, interactive application based for the Bestek of the architectural projects, as a way of querying and automizing the generation of the in house documentation of the projects?',
  },
  {
    num: '07', title: 'Animating the threshold: Curtain simulation',
    tag: 'Forensic', year: 2025, method: 0.88,
    href: 'research-07.html', color: [89,44,56],
    abstract: 'Simulation of the physical behaviour of curtains and patterns of their movement as a way of research in design for the project CO.',
  },
  {
    num: '08', title: 'Playing Models 2025 Image Open Call',
    tag: 'Computational', year: 2025, method: 0.72,
    href: 'research-08.html', color: [26,46,60],
    abstract: 'Accepted and presented media submission for the Playing Models 2025 Image Open Call.',
  },
  {
    num: '09', title: 'Photogrammetric Nonsense',
    tag: 'Forensic', year: 2026, method: 0.82,
    href: 'research-09.html', color: [89,44,56],
    abstract: 'The nonsense drawings derived from photogrammetric capture of architectural spaces, liminal objects and the uncanny, 2023-2026.',
  },
  {
    num: '10', title: 'Clara Visual Essay Submission',
    tag: 'Representation', year: 2026, method: 0.44,
    href: 'research-10.html', color: [60,30,48],
    abstract: 'Open call entry for the Clara #14 Call for Papers.',
  },
  {
    num: '11', title: 'Arduino Projects Workshop and Research',
    tag: 'Digital', year: 2026, method: 0.32,
    href: 'research-11.html', color: [30,40,70],
    abstract: 'Ongoing learning process and research into the use of Arduino and ESP microcontroller boards for interactive and responsive applications in architectural, art and technological contexts.',
  },
];

// ── Edges — pairs of indices to connect ───────────────────────────────────────
// Connect related research. Edit freely.
const EDGES = [
  [0,1],[0,2],[0,3],[0,7],[0,8],[6,9],  
  [1,4],[1,7],[1,8],[4,5],[4,6],[4,9],  
  [2,1],                   
  [3,9],                                
  [5,10],                               
  [0,1],[2,4],[7,8],[5,6],[8,9],         // cross-links
];

// ── Init ──────────────────────────────────────────────────────────────────────
const field      = document.getElementById('research-field');
const edgeCanvas = document.getElementById('edge-canvas');
const popup      = document.getElementById('popup');
const popupClose = document.getElementById('popup-close');
const popupCanvas= document.getElementById('popup-canvas');
const popupNum   = document.getElementById('popup-num');
const popupTitle = document.getElementById('popup-title');
const popupTag   = document.getElementById('popup-tag');
const popupAbstract = document.getElementById('popup-abstract');
const popupBtn   = document.getElementById('popup-btn');

let W = window.innerWidth;
let H = window.innerHeight;
edgeCanvas.width  = W;
edgeCanvas.height = H;
const ctx = edgeCanvas.getContext('2d');

const PAD_L = 60, PAD_R = 60, PAD_T = 110, PAD_B = 50;
const MIN_YEAR = 2022, MAX_YEAR = 2026;
let activeNode = -1;

// ── Helpers ───────────────────────────────────────────────────────────────────
function pr(s) { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x); }

function nodePos(r) {
  return {
    x: PAD_L + ((r.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (W - PAD_L - PAD_R),
    y: PAD_T + (1 - r.method) * (H - PAD_T - PAD_B),
  };
}

// ── Draw edges ────────────────────────────────────────────────────────────────
function drawEdges(hovered) {
  ctx.clearRect(0, 0, W, H);

  // faint grid lines
  ctx.setLineDash([2, 8]);
  ctx.lineWidth = 0.5;
  for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
    const x = PAD_L + ((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (W - PAD_L - PAD_R);
    ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, H - PAD_B);
    ctx.strokeStyle = 'rgba(89,44,56,0.12)'; ctx.stroke();
  }
  ctx.setLineDash([]);

  EDGES.forEach(([a, b]) => {
    const pa = nodePos(RESEARCH[a]);
    const pb = nodePos(RESEARCH[b]);
    const isHov = hovered === a || hovered === b;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = isHov ? 'rgba(200,120,130,0.6)' : 'rgba(89,44,56,0.3)';
    ctx.lineWidth   = isHov ? 1.0 : 0.5;
    ctx.setLineDash(isHov ? [] : [3, 7]);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}
drawEdges(-1);

// ── Year ticks ────────────────────────────────────────────────────────────────
for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
  const x = PAD_L + ((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (W - PAD_L - PAD_R);
  const tick = document.createElement('div');
  tick.className = 'year-tick';
  tick.style.left = x + 'px';
  tick.style.bottom = (PAD_B + 5) + 'px';
  tick.textContent = y;
  field.appendChild(tick);
}

// ── Draw popup wireframe image ─────────────────────────────────────────────────
function drawPopupImage(r, idx) {
  const pc = popupCanvas.getContext('2d');
  const PW = popupCanvas.width, PH = popupCanvas.height;
  const [cr, cg, cb] = r.color;
  pc.clearRect(0, 0, PW, PH);
  pc.fillStyle = `rgb(${cr * 0.18 | 0},${cg * 0.18 | 0},${cb * 0.18 | 0})`;
  pc.fillRect(0, 0, PW, PH);

  if (r.imgSrc) {
    const img = new Image();
    img.onload = () => {
      // cover crop
      const s = Math.max(PW / img.naturalWidth, PH / img.naturalHeight);
      const sw = PW / s, sh = PH / s;
      const sx = (img.naturalWidth - sw) / 2, sy = (img.naturalHeight - sh) / 2;
      pc.drawImage(img, sx, sy, sw, sh, 0, 0, PW, PH);
      // label on top
      pc.font = '7px monospace';
      pc.fillStyle = 'rgba(200,120,130,0.8)';
      pc.fillText(r.num + ' — ' + r.tag.toUpperCase(), 8, PH - 8);
    };
    img.src = r.imgSrc;
  } else {
    // fallback wireframe if no image
    const seed = idx * 173;
    pc.lineWidth = 0.5;
    for (let i = 0; i < 100; i++) {
      const ax = pr(seed+i)*PW, ay = pr(seed+i+500)*PH;
      const bx = ax+(pr(seed+i+1000)-0.5)*55, by = ay+(pr(seed+i+1500)-0.5)*55;
      const len = Math.sqrt((bx-ax)**2+(by-ay)**2);
      if (len>4&&len<48) {
        pc.strokeStyle = `rgba(${Math.min(255,cr+120)|0},${Math.min(255,cg+100)|0},${Math.min(255,cb+110)|0},0.6)`;
        pc.beginPath(); pc.moveTo(ax,ay); pc.lineTo(bx,by); pc.stroke();
      }
    }
    pc.font = '7px monospace';
    pc.fillStyle = 'rgba(200,120,130,0.6)';
    pc.fillText(r.num + ' — ' + r.tag.toUpperCase(), 8, PH - 8);
  }
}

// ── Show / hide popup ─────────────────────────────────────────────────────────
function showPopup(idx) {
  const r = RESEARCH[idx];
  const pos = nodePos(r);
  activeNode = idx;

  popupNum.textContent      = r.num;
  popupTitle.textContent    = r.title;
  popupTag.textContent      = r.tag + ' · ' + r.year;
  popupAbstract.textContent = r.abstract;
  popupBtn.href             = r.href;

  popupCanvas.width  = 220;
  popupCanvas.height = 120;
  drawPopupImage(r, idx);
  drawEdges(idx);

  popup.classList.add('visible');

  // position — keep fully in bounds on all sides
  const popupW = parseInt(popup.style.width) || (window.innerWidth <= 600 ? 200 : 240);
  const PH = 320;
  let left = pos.x + 16;
  let top  = pos.y - 60;

  // flip left if it goes off right edge
  if (left + popupW > W) left = pos.x - popupW - 16;
  // clamp left edge — never go off screen left
  if (left < 8) left = 8;
  // clamp right edge again after left clamp
  if (left + popupW > W - 8) left = W - popupW - 8;

  // clamp top and bottom
  if (top < PAD_T) top = PAD_T;
  if (top + PH > H) top = H - PH - 10;

  popup.style.left = left + 'px';
  popup.style.top  = top  + 'px';
}

function hidePopup() {
  popup.classList.remove('visible');
  activeNode = -1;
  drawEdges(-1);
}

popupClose.addEventListener('click', hidePopup);
field.addEventListener('click', e => {
  if (!e.target.closest('.node') && !e.target.closest('#popup')) hidePopup();
});

// ── Build nodes ───────────────────────────────────────────────────────────────
RESEARCH.forEach((r, i) => {
  const pos = nodePos(r);
  const node = document.createElement('div');
  node.className = 'node';
  node.style.left = pos.x + 'px';
  node.style.top  = pos.y + 'px';
  node.innerHTML  = `<div class="node-dot"></div><div class="node-num">${r.num}</div>`;

  node.addEventListener('mouseenter', () => { if (activeNode !== i) showPopup(i); });
  node.addEventListener('click', e => {
    e.stopPropagation();
    if (activeNode === i) hidePopup(); else showPopup(i);
  });
  node.addEventListener('touchend', e => {
    e.preventDefault();
    if (activeNode === i) hidePopup(); else showPopup(i);
  }, { passive: false });

  field.appendChild(node);
});

// ── Menu ──────────────────────────────────────────────────────────────────────
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
  if (!e.target.closest('#menu-wrapper') &&
      !e.target.closest('#btn-menu-mobile') &&
      !e.target.closest('#menu-dropdown-mobile')) closeMenus();
});

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  W = window.innerWidth; H = window.innerHeight;
  edgeCanvas.width = W; edgeCanvas.height = H;
  drawEdges(activeNode);
  RESEARCH.forEach((r, i) => {
    const nodes = field.querySelectorAll('.node');
    const pos = nodePos(r);
    nodes[i].style.left = pos.x + 'px';
    nodes[i].style.top  = pos.y + 'px';
  });
  document.querySelectorAll('.year-tick').forEach((tick, i) => {
    const y = MIN_YEAR + i;
    const x = PAD_L + ((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (W - PAD_L - PAD_R);
    tick.style.left = x + 'px';
  });
});