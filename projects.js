const PROJECTS = [
  { num:'01', title:'The Spheres of Influence',           cat:'Master Studio · 2022',              href:'project-1.html', imgSrc:'images/Spheres of Influence_00.jpg', overlaySrc:'images/Spheres of Influenceoverlay.png', color:[89,44,56]  },
  { num:'02', title:'Learning from Lungomare G.M', cat:'Master Thesis · 2022–2023',          href:'project-2.html', imgSrc:'images/LLGM.jpeg',                   overlaySrc:'images/LLGMoverlay.png', color:[42,30,60]  },
  { num:'03', title:'Prof. CO',                    cat:'Architectural Practice · 2023–2026', href:'project-3.html', imgSrc:'images/CAS01.png',                   overlaySrc:'images/CAS01overlay.png', color:[26,46,60]  },
  { num:'04', title:'Prof. ZP',                    cat:'Architectural Practice · 2023–2026', href:'project-4.html', imgSrc:'images/cieo02.png',                  overlaySrc:'images/cieo02overlay.png', color:[26,60,40]  },
  { num:'05', title:'Prof. KT',                    cat:'Architectural Practice · 2023–2026', href:'project-5.html', imgSrc:'images/cieo03.png',                  overlaySrc:'images/cieo04overlay.png', color:[60,26,14]  },
  { num:'06', title:'Prof. SJ',                    cat:'Architectural Practice · 2023–2026', href:'project-6.html', imgSrc:'images/SJ.png',                  overlaySrc:'images/SJoverlay.png', color:[60,26,14]  },
  { num:'07', title:'Prof. NZ',                    cat:'Architectural Practice · 2023–2026', href:'project-7.html', imgSrc:'images/NZ.png',                  overlaySrc:'images/NZoverlay.png', color:[60,26,14]  },
  { num:'08', title:'Prof. LV ',                          cat:'Architectural Traineeship · 2023',   href:'project-8.html', imgSrc:'images/PVH01.jpg',                                   overlaySrc:'images/PVH01overlay.png', color:[30,40,70]  },
  { num:'09', title:'Prof. BT ',                          cat:'Architectural Photography · 2023',   href:'project-9.html', imgSrc:'images/BT.png',                                   overlaySrc:'images/BToverlay.png', color:[30,40,70]  },
  { num:'10', title:'Extended Liminal',                   cat:'Summer School · 2022',               href:'project-10.html', imgSrc:'images/Extended Liminal_00.jpg',      overlaySrc:'images/Extended Liminaloverlay.png', color:[60,30,48]  },
  { num:'11', title:'Forbidden to Play',                   cat:'Studio 1 · 2021',               href:'project-11.html', imgSrc:'images/lep03.png',      overlaySrc:'images/lepoverlay.png', color:[255,255,255]  },
];

initCanvas();
initMenu();

function initCanvas() {
  const field  = document.getElementById('project-field');
  const canvas = document.getElementById('project-canvas');
  const curEl  = document.getElementById('cur');
  const ring   = document.getElementById('cur-ring');
  const isTouch = ('ontouchstart' in window);
  if (isTouch) { curEl.style.display='none'; ring.style.display='none'; field.style.cursor='default'; }

  let W = window.innerWidth;
  let H = window.innerHeight;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // nav strip
  const navStrip = document.getElementById('nav-strip');
  PROJECTS.forEach(p => {
    const a = document.createElement('a');
    a.className = 'nav-item'; a.href = p.href;
    a.innerHTML = `<span class="nav-num">${p.num}</span>`;
    navStrip.appendChild(a);
  });
  const NAV_H = navStrip.offsetHeight || 44;
  const PLAYFIELD_H = H - NAV_H;

  function pr(s) { const x = Math.sin(s+1)*10000; return x-Math.floor(x); }

  // uniform card size — bigger
  const CW = Math.round(Math.min(Math.max(W * 0.2, 155), 195));
  const CH = Math.round(CW * 1.28);

  function buildWF(seed) {
    const lines = [];
    for (let i = 0; i < 160; i++) {
      const ax = pr(seed+i)*CW, ay = pr(seed+i+500)*CH;
      const bx = ax+(pr(seed+i+1000)-0.5)*58, by = ay+(pr(seed+i+1500)-0.5)*58;
      const len = Math.sqrt((bx-ax)**2+(by-ay)**2);
      if (len>3 && len<50) lines.push({ax,ay,bx,by});
    }
    return lines;
  }

  // load images
  const loadedImages = {};
  PROJECTS.forEach(p => {
    if (!p.imgSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = p.imgSrc;
    loadedImages[p.num] = img;
  });

  // load overlay PNGs
  const loadedOverlays = {};
  PROJECTS.forEach(p => {
    if (!p.overlaySrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = p.overlaySrc;
    loadedOverlays[p.num] = img;
  });

  // build cards
  const cards = PROJECTS.map((p, idx) => {
    const seed  = idx * 197;
    const wf    = buildWF(seed);
    const speed = 3.5 + pr(idx*23)*3.5;
    const angle = pr(idx*89)*Math.PI*2;
    return {
      p, wf, seed,
      x: pr(idx*41)*(W-CW*0.4)-CW*0.1,
      y: pr(idx*67)*(PLAYFIELD_H-CH*0.4)-CH*0.1,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      rot: (pr(idx*13)-0.5)*42,
      vr:  (pr(idx*19)-0.5)*0.85,
      revealAmt:0, targetReveal:0,
      hovered:false, selected:false,
    };
  });

  function drawImageCover(dc, img, x, y, w, h) {
    const iw=img.naturalWidth, ih=img.naturalHeight;
    if (!iw||!ih) return;
    const s=Math.max(w/iw,h/ih);
    const sw=w/s, sh=h/s, sx=(iw-sw)/2, sy=(ih-sh)/2;
    dc.drawImage(img,sx,sy,sw,sh,x,y,w,h);
  }

  function drawCard(c, dc, ox, oy, sc, forceReveal) {
    dc = dc || ctx;
    const x  = ox !== undefined ? ox : c.x;
    const y  = oy !== undefined ? oy : c.y;
    sc = sc || 1;
    const ra = forceReveal !== undefined ? forceReveal : c.revealAmt;
    const {p, wf, seed, rot, hovered, selected} = c;
    const [r,g,b] = p.color;
    const W2 = CW*sc, H2 = CH*sc;

    dc.save();
    dc.translate(x+W2/2, y+H2/2);
    if (!forceReveal && dc===ctx) dc.rotate(rot*Math.PI/180);
    dc.scale(sc,sc);
    dc.translate(-CW/2,-CH/2);

   // clip to card bounds
    dc.save();
    dc.rect(0,0,CW,CH);
    dc.clip();

    // LAYER 1 — photo always visible, brighter on reveal
    const img = loadedImages[p.num];
    if (img && img.complete && img.naturalWidth>0) {
      dc.globalAlpha = 0.0 + ra * 0.9;
      drawImageCover(dc,img,0,0,CW,CH);
      dc.globalAlpha = 1;
      const vig = dc.createLinearGradient(0,CH*0.55,0,CH);
      vig.addColorStop(0,'rgba(10,6,8,0)');
      vig.addColorStop(1,`rgba(10,6,8,${0.55+ra*0.2})`);
      dc.fillStyle=vig; dc.fillRect(0,CH*0.55,CW,CH*0.45);
    } else {
      dc.fillStyle=`rgba(${r},${g},${b},${0.08+ra*0.25})`; dc.fillRect(0,0,CW,CH);
    }

    // LAYER 2 — overlay PNG, fades on reveal
    const ov = loadedOverlays[p.num];
    if (ov && ov.complete && ov.naturalWidth>0) {
      dc.globalAlpha = Math.max(0.08, 0.7 - ra * 0.65);
      drawImageCover(dc,ov,0,0,CW,CH);
      dc.globalAlpha = 1;
    }

    dc.restore();

    // wireframe
    const wA = Math.max(0,1-ra*0.8);
    if (wA>0.015) {
      dc.lineWidth=0.5;
      wf.forEach(l=>{
        dc.strokeStyle=`rgba(${Math.min(255,r+120)|0},${Math.min(255,g+100)|0},${Math.min(255,b+110)|0},${wA*0.15})`;
        dc.beginPath(); dc.moveTo(l.ax,l.ay); dc.lineTo(l.bx,l.by); dc.stroke();
      });
      for (let i=0;i<24;i++) {
        dc.beginPath();
        dc.arc(pr(seed+i+3000)*CW,pr(seed+i+4000)*CH,0.9,0,Math.PI*2);
        dc.fillStyle=`rgba(220,140,150,${wA*0.65})`; dc.fill();
      }
    }
    if (ra>0.35) {
      dc.lineWidth=0.4;
      wf.slice(0,50).forEach(l=>{
        dc.strokeStyle=`rgba(255,225,235,${ra*0.1})`;
        dc.beginPath(); dc.moveTo(l.ax,l.ay); dc.lineTo(l.bx,l.by); dc.stroke();
      });
    }

    // border
    if (hovered||selected) {
      dc.strokeStyle=`rgba(200,120,130,${0.2+ra*0.5})`; dc.lineWidth=0.5;
      dc.strokeRect(0.5,0.5,CW-1,CH-1);
    }

    // dot
    dc.beginPath();
    dc.arc(7,7,hovered||selected?3.2:1.8,0,Math.PI*2);
    dc.fillStyle=`rgba(200,120,130,${0.45+ra*0.5})`; dc.fill();

    // number
    dc.font='8px monospace';
    dc.fillStyle=`rgba(220,140,150,${0.85+ra*0.15})`;
    dc.fillText(p.num,7,CH-28);

    // title
    dc.font='9px monospace';
    dc.fillStyle=`rgba(255,255,255,${0.75+ra*0.25})`;
    const words=p.title.split(' ');
    let ln='',lns=[];
    words.forEach(w=>{
      const t=ln?ln+' '+w:w;
      if(dc.measureText(t).width>CW-14&&ln){lns.push(ln);ln=w;}else ln=t;
    });
    if(ln)lns.push(ln);
    lns.slice(0,2).forEach((l,i)=>dc.fillText(l.toUpperCase(),7,CH-16+i*11));

    // cat
    dc.font='7px monospace';
    dc.fillStyle=`rgba(255,255,255,${0.45+ra*0.25})`;
    dc.fillText(p.cat,7,CH-4);

    dc.restore();
  }

  function hitTest(c, mx, my) {
    const cx=c.x+CW/2, cy=c.y+CH/2;
    const rad=-c.rot*Math.PI/180;
    const dx=mx-cx, dy=my-cy;
    const lx=dx*Math.cos(rad)-dy*Math.sin(rad)+CW/2;
    const ly=dx*Math.sin(rad)+dy*Math.cos(rad)+CH/2;
    const pad=10;
    return lx>=-pad&&lx<=CW+pad&&ly>=-pad&&ly<=CH+pad;
  }

  // overlay
  const overlay  = document.getElementById('card-overlay');
  const ovCanvas = document.getElementById('overlay-canvas');
  const ovNum    = document.getElementById('overlay-num');
  const ovTitle  = document.getElementById('overlay-title');
  const ovCat    = document.getElementById('overlay-cat');
  const ovLink   = document.getElementById('overlay-link');
  const ovClose  = document.getElementById('overlay-close');
  let selectedCard = null;

  function showOverlay(c) {
    selectedCard=c; c.selected=true; c.targetReveal=1;
    const sc=Math.min(2.2,(W*0.35)/CW,(H*0.6)/CH);
    const ow=Math.round(CW*sc), oh=Math.round(CH*sc);
    ovCanvas.width=ow; ovCanvas.height=oh;
    ovCanvas.style.width=ow+'px'; ovCanvas.style.height=oh+'px';
    const ovCtx=ovCanvas.getContext('2d');
    ovCtx.clearRect(0,0,ow,oh);
    drawCard({...c,rot:0,revealAmt:1,hovered:false,selected:true},ovCtx,0,0,sc,1);
    ovNum.textContent=c.p.num; ovTitle.textContent=c.p.title;
    ovCat.textContent=c.p.cat; ovLink.href=c.p.href;
    overlay.classList.add('visible');
  }

  function hideOverlay() {
    overlay.classList.remove('visible');
    if (selectedCard) {
      selectedCard.selected=false; selectedCard.targetReveal=0;
      selectedCard.vx=(Math.random()-0.5)*2;
      selectedCard.vy=(Math.random()-0.5)*2;
      selectedCard.vr=(Math.random()-0.5)*0.4;
      selectedCard=null;
    }
  }

  ovClose.addEventListener('click', hideOverlay);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) hideOverlay(); });

  // ── SHOW ALL / GRID VIEW ──────────────────────────────────────────────────
  const gridView      = document.getElementById('grid-view');
  const gridInner     = document.getElementById('grid-view-inner');
  const showAllBtn    = document.getElementById('show-all-btn');
  const gridCloseBtn  = document.getElementById('grid-close-btn');
  let gridBuilt = false;

  function buildGridView() {
    if (gridBuilt) return;
    gridBuilt = true;
    PROJECTS.forEach(p => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      const bg = document.createElement('div');
      bg.className = 'grid-cell-img';
      if (p.imgSrc) bg.style.backgroundImage = `url('${p.imgSrc}')`;
      else bg.style.background = `rgb(${p.color[0]*.4|0},${p.color[1]*.4|0},${p.color[2]*.4|0})`;
      const info = document.createElement('div');
      info.className = 'grid-cell-info';
      info.innerHTML = `<span class="grid-cell-num">${p.num}</span><span class="grid-cell-title">${p.title}</span><span class="grid-cell-cat">${p.cat}</span>`;
      cell.appendChild(bg);
      cell.appendChild(info);
      cell.addEventListener('click', ()=>{ window.location.href=p.href; });
      let touchStartY = 0;
      cell.addEventListener('touchstart', e=>{ touchStartY = e.touches[0].clientY; }, {passive:true});

      cell.addEventListener('touchend', e=>{
       const moved = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (moved > 8) return; // was scrolling, not tapping
      e.preventDefault();
      window.location.href = p.href;
      }, {passive:false});
      gridInner.appendChild(cell);
    });
  }

  function showGridView() {
    buildGridView();
    gridView.classList.add('visible');
    showAllBtn.classList.add('active');
    showAllBtn.textContent = 'HIDE GRID';
  }

  function hideGridView() {
    gridView.classList.remove('visible');
    showAllBtn.classList.remove('active');
    showAllBtn.textContent = 'SHOW GRID';
  }

  showAllBtn.addEventListener('click', ()=>{
    if (gridView.classList.contains('visible')) hideGridView();
    else showGridView();
  });
  gridCloseBtn.addEventListener('click', hideGridView);
  gridView.addEventListener('click', e=>{ if(e.target===gridView) hideGridView(); });

  // ── Mouse ─────────────────────────────────────────────────────────────────
  let mX=W/2, mY=H/2, mActive=false;
  let dragCard=null, dragOffX=0, dragOffY=0, dragStartX=0, dragStartY=0;

  canvas.addEventListener('mousedown', e=>{
    if (overlay.classList.contains('visible')||gridView.classList.contains('visible')) return;
    dragStartX=e.clientX; dragStartY=e.clientY;
    for (let i=cards.length-1;i>=0;i--) {
      const c=cards[i];
      if (hitTest(c,e.clientX,e.clientY)) {
        dragCard=c; dragOffX=e.clientX-c.x; dragOffY=e.clientY-c.y;
        c.hovered=true; c.targetReveal=1; c.vx=0; c.vy=0; c.vr=0; break;
      }
    }
  });

  canvas.addEventListener('mousemove', e=>{
    mX=e.clientX; mY=e.clientY; mActive=true;
    curEl.style.left=mX+'px'; curEl.style.top=mY+'px';
    ring.style.left=mX+'px';  ring.style.top=mY+'px';
    if (dragCard) {
      dragCard.x=e.clientX-dragOffX; dragCard.y=e.clientY-dragOffY;
      dragCard.vx=0; dragCard.vy=0; return;
    }
    let anyH=false;
    cards.forEach(c=>{
      if(c.selected) return;
      c.hovered=hitTest(c,mX,mY); c.targetReveal=c.hovered?1:0;
      if(c.hovered) anyH=true;
    });
    ring.classList.toggle('hovered',anyH);
  });

  canvas.addEventListener('mouseup', e=>{
    if (!dragCard) return;
    const moved=Math.abs(e.clientX-dragStartX)+Math.abs(e.clientY-dragStartY);
    if (moved<6 && !overlay.classList.contains('visible')) {
      showOverlay(dragCard);
    } else {
      dragCard.vx=(e.clientX-dragStartX)*0.08;
      dragCard.vy=(e.clientY-dragStartY)*0.08;
      dragCard.hovered=false; dragCard.targetReveal=0;
    }
    dragCard=null;
  });

  canvas.addEventListener('mouseleave', ()=>{
    mActive=false;
    if (dragCard) { dragCard.vx=0; dragCard.vy=0; dragCard.hovered=false; dragCard.targetReveal=0; dragCard=null; }
    cards.forEach(c=>{ if(!c.selected){c.hovered=false;c.targetReveal=0;} });
    ring.classList.remove('hovered');
  });

  // ── Touch ─────────────────────────────────────────────────────────────────
  let touchDragCard=null, touchDragOffX=0, touchDragOffY=0;
  let touchStartX=0, touchStartY=0, touchMoved=false;

  canvas.addEventListener('touchstart', e=>{
    e.preventDefault();
    if (overlay.classList.contains('visible')||gridView.classList.contains('visible')) return;
    const rc=canvas.getBoundingClientRect();
    const tx=e.touches[0].clientX-rc.left, ty=e.touches[0].clientY-rc.top;
    touchStartX=tx; touchStartY=ty; touchMoved=false;
    for (let i=cards.length-1;i>=0;i--) {
      const c=cards[i];
      if (hitTest(c,tx,ty)) {
        touchDragCard=c; touchDragOffX=tx-c.x; touchDragOffY=ty-c.y;
        c.hovered=true; c.targetReveal=1; c.vx=0; c.vy=0; c.vr=0; break;
      }
    }
  },{passive:false});

  canvas.addEventListener('touchmove', e=>{
    e.preventDefault();
    if (!touchDragCard) return;
    const rc=canvas.getBoundingClientRect();
    const tx=e.touches[0].clientX-rc.left, ty=e.touches[0].clientY-rc.top;
    if (Math.abs(tx-touchStartX)+Math.abs(ty-touchStartY)>6) touchMoved=true;
    touchDragCard.x=tx-touchDragOffX; touchDragCard.y=ty-touchDragOffY;
    touchDragCard.vx=0; touchDragCard.vy=0;
  },{passive:false});

  canvas.addEventListener('touchend', e=>{
    e.preventDefault();
    if (!touchDragCard) return;
    if (!touchMoved) {
      showOverlay(touchDragCard);
    } else {
      const rc=canvas.getBoundingClientRect();
      const tx=e.changedTouches[0].clientX-rc.left, ty=e.changedTouches[0].clientY-rc.top;
      touchDragCard.vx=(tx-touchStartX)*0.09; touchDragCard.vy=(ty-touchStartY)*0.09;
      touchDragCard.hovered=false; touchDragCard.targetReveal=0;
    }
    touchDragCard=null;
  },{passive:false});

  // ── Physics loop ───────────────────────────────────────────────────────────
  let t=0;
  (function loop() {
    requestAnimationFrame(loop);
    t+=0.007;
    ctx.fillStyle='rgba(10,6,8,0.3)';
    ctx.fillRect(0,0,W,H);

    cards.forEach((c,i)=>{
      c.revealAmt+=(c.targetReveal-c.revealAmt)*0.07;

      if (c===dragCard||c===touchDragCard) {
        // dragging — no physics
      } else if (!c.hovered&&!c.selected) {
        if (mActive) {
          const cx=c.x+CW/2, cy=c.y+CH/2;
          const dx=mX-cx, dy=mY-cy;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if (dist<185&&dist>1) {
            const f=((185-dist)/185)*4.8;
            c.vx-=(dx/dist)*f; c.vy-=(dy/dist)*f;
            c.vr+=(Math.random()-0.5)*0.45;
          }
        }
        c.vx+=Math.cos(t*0.8+i*1.1)*0.045;
        c.vy+=Math.sin(t*1.2+i*0.75)*0.045;
        const pad=35;
        if (c.x<-pad||c.x>W-CW+pad) c.vx*=-0.45;
        if (c.y<-pad||c.y>PLAYFIELD_H-CH+pad) c.vy*=-0.45;
        c.x=Math.max(-pad,Math.min(W-CW+pad,c.x+c.vx));
        c.y=Math.max(-pad,Math.min(PLAYFIELD_H-CH+pad,c.y+c.vy));
        c.vx*=0.975; c.vy*=0.975; c.vr*=0.92;
        c.rot+=c.vr; c.rot=Math.max(-45,Math.min(45,c.rot));
      } else if (c.hovered) {
        c.vx*=0.45; c.vy*=0.45; c.vr*=0.45;
        c.rot+=(0-c.rot)*0.18;
      }
      drawCard(c);
    });
  })();

  window.addEventListener('resize',()=>{ W=window.innerWidth; H=window.innerHeight; canvas.width=W; canvas.height=H; });
}

function initMenu() {
  const md  = document.getElementById('menu-dropdown');
  const mdm = document.getElementById('menu-dropdown-mobile');
  const bm  = document.getElementById('btn-menu');
  const bmm = document.getElementById('btn-menu-mobile');

  const close=()=>{
    md.classList.remove('open'); bm.classList.remove('active');
    mdm.classList.remove('open'); if(bmm)bmm.classList.remove('active');
  };
  bm.addEventListener('click',e=>{ e.stopPropagation(); bm.classList.toggle('active',md.classList.toggle('open')); });
  if (bmm) bmm.addEventListener('click',e=>{ e.stopPropagation(); bmm.classList.toggle('active',mdm.classList.toggle('open')); });
  document.addEventListener('click',e=>{ if(!e.target.closest('#menu-wrapper')&&!e.target.closest('#btn-menu-mobile')&&!e.target.closest('#menu-dropdown-mobile')) close(); });
}