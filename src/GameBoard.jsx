import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from './store';

const TRANSITION_MS = 5000;

// ─── MATH & COLOR UTILITIES ───
const smoothstep = (edge0, edge1, x) => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const smootherstep = (edge0, edge1, x) => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const lerp = (a, b, t) => a + (b - a) * t;

const lerpColor = (c1, c2, t) => [
  lerp(c1[0], c2[0], t),
  lerp(c1[1], c2[1], t),
  lerp(c1[2], c2[2], t)
];

const multiLerpColor = (colors, stops, t) => {
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i] && t <= stops[i + 1]) {
      const local = (t - stops[i]) / (stops[i + 1] - stops[i]);
      return lerpColor(colors[i], colors[i + 1], local);
    }
  }
  return t <= stops[0] ? colors[0] : colors[colors.length - 1];
};

const rgba = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// ─── CINEMATIC CANVAS ENGINE ───
const CinematicSky = ({ gamePhase }) => {
  const canvasRef = useRef(null);
  const grainRef = useRef(null);
  
  // Persist objects so they don't re-generate on re-renders
  const engineRef = useRef({
    stars: [],
    clouds: [],
    skyPhase: 0.0, // 0 = Midnight, 0.5 = Noon
    targetSkyPhase: 0.0,
    transitionSpeed: 0,
    globalTime: 0,
    lastTime: performance.now(),
    dpr: Math.max(2.5, window.devicePixelRatio || 1) // 4K Crispness Super-Sampling
  });

  // Handle Game Phase changes smoothly
  useEffect(() => {
    const engine = engineRef.current;
    
    // Day Transition (Sunrise)
    if (gamePhase === 'day_transition') {
      engine.targetSkyPhase = 0.5;
      engine.skyPhase = 0.0; // Start exactly at night
      engine.transitionSpeed = 0.5 / (TRANSITION_MS / 1000); 
    } 
    // Night Transition (Sunset)
    else if (gamePhase === 'night_transition') {
      engine.targetSkyPhase = 1.0;
      engine.skyPhase = 0.5; // Start exactly at day
      engine.transitionSpeed = 0.5 / (TRANSITION_MS / 1000);
    } 
    // Static Day Phases
    else if (gamePhase.startsWith('day')) {
      engine.targetSkyPhase = 0.5;
      engine.skyPhase = 0.5;
      engine.transitionSpeed = 0;
    } 
    // Static Night Phases
    else {
      engine.targetSkyPhase = 0.0;
      engine.skyPhase = 0.0;
      engine.transitionSpeed = 0;
    }
  }, [gamePhase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const engine = engineRef.current;

    // Generate Grain Data URI
    if (!engine.grainUrl) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const cCtx = c.getContext('2d');
      const id = cCtx.createImageData(256, 256);
      for (let i = 0; i < id.data.length; i += 4) {
        const v = Math.random() * 255;
        id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
        id.data[i + 3] = 255;
      }
      cCtx.putImageData(id, 0, 0);
      engine.grainUrl = c.toDataURL();
      if (grainRef.current) grainRef.current.style.backgroundImage = `url(${engine.grainUrl})`;
    }

    let W, H;
    const resize = () => {
      // Scale canvas internal resolution by DPR for 4K quality
      W = window.innerWidth * engine.dpr;
      H = window.innerHeight * engine.dpr;
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    window.addEventListener('resize', resize);
    resize();

    // Init Stars
    if (engine.stars.length === 0) {
      for (let i = 0; i < 280; i++) {
        engine.stars.push({
          x: Math.random(),
          y: Math.random() * 0.75,
          size: 0.3 + Math.random() * 1.8,
          brightness: 0.3 + Math.random() * 0.7,
          twinkleSpeed: 0.3 + Math.random() * 1.5,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Init Clouds
    if (engine.clouds.length === 0) {
      for (let i = 0; i < 8; i++) {
        const puffs = [];
        const puffCount = 5 + Math.floor(Math.random() * 8);
        for (let j = 0; j < puffCount; j++) {
          puffs.push({
            ox: (Math.random() - 0.5) * 200,
            oy: (Math.random() - 0.5) * 40,
            rx: 40 + Math.random() * 80,
            ry: 15 + Math.random() * 30,
          });
        }
        engine.clouds.push({
          x: Math.random() * 1.4 - 0.2,
          y: 0.08 + Math.random() * 0.35,
          speed: 0.002 + Math.random() * 0.004,
          opacity: 0.06 + Math.random() * 0.10,
          scale: 0.6 + Math.random() * 0.8,
          depth: 0.3 + Math.random() * 0.7,
          puffs,
        });
      }
      engine.clouds.sort((a, b) => a.depth - b.depth);
    }

    const getSkyColors = (p) => {
      const zC = [[8,11,28],[8,11,28],[18,22,48],[45,50,85],[85,75,100],[140,120,130],[120,155,200],[135,175,220],[145,185,228],[140,178,222],[130,155,195],[115,105,130],[90,65,85],[50,40,70],[22,25,52],[10,13,32],[8,11,28]];
      const hC = [[12,15,35],[12,15,35],[35,30,55],[90,65,75],[180,120,90],[220,160,100],[210,185,150],[175,200,225],[180,210,235],[178,205,228],[190,170,155],[215,145,100],[210,110,65],[140,60,55],[50,35,60],[18,18,40],[12,15,35]];
      const mC = [[10,13,32],[10,13,32],[28,28,52],[65,58,80],[130,95,95],[175,140,115],[160,170,195],[155,190,222],[162,198,232],[158,192,225],[155,160,175],[160,120,115],[145,82,75],[85,48,62],[32,30,55],[14,16,36],[10,13,32]];
      const stops = [0,0.10,0.18,0.22,0.25,0.28,0.33,0.40,0.50,0.60,0.68,0.73,0.77,0.82,0.88,0.94,1.0];
      return { z: multiLerpColor(zC, stops, p), m: multiLerpColor(mC, stops, p), h: multiLerpColor(hC, stops, p) };
    };

    const getAtmo = (p) => {
      const c = [[0,0,0,0],[0,0,0,0],[40,25,15,0.02],[120,70,35,0.08],[200,140,60,0.15],[230,180,90,0.12],[180,190,200,0.04],[160,180,200,0.02],[160,180,200,0.02],[180,170,155,0.04],[210,150,80,0.12],[230,130,50,0.18],[180,70,40,0.10],[60,30,40,0.04],[0,0,0,0],[0,0,0,0]];
      const s = [0,0.10,0.18,0.22,0.26,0.30,0.38,0.50,0.60,0.68,0.73,0.77,0.83,0.90,0.95,1.0];
      for (let i=0; i<s.length-1; i++) {
        if (p >= s[i] && p <= s[i+1]) {
          const l = (p - s[i]) / (s[i+1] - s[i]);
          return { color: lerpColor(c[i], c[i+1], l), alpha: lerp(c[i][3], c[i+1][3], l) };
        }
      }
      return { color: [0,0,0], alpha: 0 };
    };

    const getPos = (prog) => {
      const angle = lerp(Math.PI, 0, prog);
      return { x: W/2 + Math.cos(angle) * (W*0.55), y: H*0.95 - Math.sin(angle) * (H*0.55) };
    };

    const getSunPhase = (p) => {
      if (p < 0.20 || p > 0.80) return { vis: false, prog: 0 };
      if (p < 0.28) return { vis: true, prog: smootherstep(0.20, 0.28, p) * 0.08 };
      if (p > 0.72) return { vis: true, prog: 0.92 + (1 - smootherstep(0.72, 0.80, p)) * 0.08 };
      return { vis: true, prog: 0.08 + ((p - 0.28) / (0.72 - 0.28)) * 0.84 };
    };

    const getMoonPhase = (p) => {
      let t;
      if (p >= 0.78) t = (p - 0.78) / 0.44;
      else if (p <= 0.22) t = (0.22 + p) / 0.44;
      else return { vis: false, prog: 0 };
      let o = 1;
      if (t < 0.08) o = smootherstep(0, 0.08, t);
      else if (t > 0.92) o = smootherstep(1, 0.92, t);
      return { vis: true, prog: t, o };
    };

    let rafId;
    const render = (now) => {
      const dt = (now - engine.lastTime) / 1000;
      engine.lastTime = now;
      engine.globalTime += dt;

      // Animate Sky Phase
      if (engine.skyPhase < engine.targetSkyPhase) {
        engine.skyPhase = Math.min(engine.targetSkyPhase, engine.skyPhase + engine.transitionSpeed * dt);
      } else if (engine.skyPhase > engine.targetSkyPhase) {
        engine.skyPhase = Math.max(engine.targetSkyPhase, engine.skyPhase - engine.transitionSpeed * dt);
      }

      // Wrap around Midnight
      if (engine.skyPhase === 1.0 && engine.targetSkyPhase === 1.0) {
        engine.skyPhase = 0.0;
        engine.targetSkyPhase = 0.0;
      }

      const p = engine.skyPhase;
      const t = engine.globalTime;

      ctx.clearRect(0, 0, W, H);

      // 1. SKY GRADIENT
      const cols = getSkyColors(p);
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, rgba(cols.z));
      grd.addColorStop(0.35, rgba(cols.m));
      grd.addColorStop(0.65, rgba(lerpColor(cols.m, cols.h, 0.5)));
      grd.addColorStop(0.85, rgba(cols.h));
      grd.addColorStop(1, rgba(lerpColor(cols.h, [0,0,0], 0.15)));
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      const atmoGrd = ctx.createLinearGradient(0, H*0.5, 0, H);
      const atmoColor = lerpColor(cols.h, cols.m, 0.3);
      atmoGrd.addColorStop(0, rgba(atmoColor, 0));
      atmoGrd.addColorStop(0.6, rgba(atmoColor, 0.08));
      atmoGrd.addColorStop(1, rgba(atmoColor, 0.15));
      ctx.fillStyle = atmoGrd;
      ctx.fillRect(0, H*0.5, W, H*0.5);

      // 2. STARS
      let starOp = 0;
      if (p < 0.20) starOp = smootherstep(0.20, 0.12, p);
      if (p > 0.80) starOp = smootherstep(0.80, 0.88, p);
      
      if (starOp > 0.01) {
        for (const s of engine.stars) {
          const tw = 0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
          const a = starOp * s.brightness * tw;
          if (a < 0.01) continue;
          const px = s.x * W;
          const py = s.y * H;
          const sz = s.size * engine.dpr;
          
          if (sz > 1) {
            const sg = ctx.createRadialGradient(px, py, 0, px, py, sz*3);
            sg.addColorStop(0, rgba([220,225,240], a*0.5));
            sg.addColorStop(1, rgba([220,225,240], 0));
            ctx.fillStyle = sg;
            ctx.fillRect(px - sz*3, py - sz*3, sz*6, sz*6);
          }
          ctx.beginPath();
          ctx.arc(px, py, sz*0.5, 0, Math.PI*2);
          ctx.fillStyle = rgba([235,238,250], a*0.9);
          ctx.fill();
        }
      }

      // 3. SUN BLOOM
      const sun = getSunPhase(p);
      if (sun.vis) {
        const sPos = getPos(sun.prog);
        const hr = 1 - (sPos.y / H);
        const bs = (1 - smoothstep(0, 0.35, hr)) * 0.3;
        if (bs >= 0.01) {
          const bc = lerpColor([255,180,80], [255,220,180], hr);
          const bw = W * 0.6;
          const bh = H * 0.4;
          const bg = ctx.createRadialGradient(sPos.x, H*0.95, 0, sPos.x, H*0.95, bw);
          bg.addColorStop(0, rgba(bc, bs));
          bg.addColorStop(0.3, rgba(bc, bs*0.4));
          bg.addColorStop(0.6, rgba(bc, bs*0.1));
          bg.addColorStop(1, rgba(bc, 0));
          ctx.fillStyle = bg;
          ctx.fillRect(sPos.x - bw, H*0.95 - bh, bw*2, bh + H*0.1);
        }
      }

      // 4. HORIZON HAZE
      const haze = getAtmo(p);
      if (haze.alpha >= 0.005) {
        const hh = H * 0.35;
        const hy = H - hh;
        const hg = ctx.createLinearGradient(0, H, 0, hy);
        hg.addColorStop(0, rgba(haze.color, haze.alpha * 1.2));
        hg.addColorStop(0.3, rgba(haze.color, haze.alpha * 0.6));
        hg.addColorStop(0.7, rgba(haze.color, haze.alpha * 0.15));
        hg.addColorStop(1, rgba(haze.color, 0));
        ctx.fillStyle = hg;
        ctx.fillRect(0, hy, W, hh);
      }

      // 5. LIGHT RAYS
      let rayInt = 0;
      if (p > 0.22 && p < 0.32) rayInt = smoothstep(0.22, 0.26, p) * (1 - smoothstep(0.28, 0.32, p));
      else if (p > 0.70 && p < 0.80) rayInt = smoothstep(0.70, 0.74, p) * (1 - smoothstep(0.76, 0.80, p));
      
      if (rayInt >= 0.01 && sun.vis) {
        const sPos = getPos(sun.prog);
        for (let i=0; i<8; i++) {
          const ang = -Math.PI*0.5 + (i/8 - 0.5) * Math.PI*0.6;
          const rAng = ang + Math.sin(t*0.1 + i*2.5) * 0.03;
          const ex = sPos.x + Math.cos(rAng) * (H*0.7);
          const ey = sPos.y + Math.sin(rAng) * (H*0.7);
          const rg = ctx.createLinearGradient(sPos.x, sPos.y, ex, ey);
          rg.addColorStop(0, rgba([255,200,120], 0.03*rayInt));
          rg.addColorStop(0.3, rgba([255,200,120], 0.015*rayInt));
          rg.addColorStop(1, rgba([255,200,120], 0));
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.strokeStyle = rg;
          ctx.lineWidth = 20 + Math.sin(t*0.15 + i)*8;
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(sPos.x, sPos.y); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.restore();
        }
      }

      // 6. CLOUDS
      const cC = [[15,18,35],[15,18,35],[55,45,55],[150,110,90],[220,180,140],[230,210,190],[225,230,238],[225,230,238],[228,225,218],[230,190,145],[220,140,90],[140,70,60],[40,30,50],[15,18,35]];
      const cS = [0,0.10,0.18,0.24,0.28,0.35,0.45,0.55,0.65,0.72,0.78,0.84,0.92,1.0];
      const clColor = multiLerpColor(cC, cS, p);
      let opMult = 1.0;
      if (p < 0.15) opMult = 0.2;
      else if (p < 0.25) opMult = smoothstep(0.15, 0.25, p) * 0.8 + 0.2;
      else if (p > 0.85) opMult = 0.2;
      else if (p > 0.75) opMult = (1 - smoothstep(0.75, 0.85, p)) * 0.8 + 0.2;

      for (const cl of engine.clouds) {
        const cx = ((cl.x + t * cl.speed * 0.015) % 1.6 - 0.2) * W;
        const cy = cl.y * H;
        const sc = cl.scale * engine.dpr;
        const al = cl.opacity * opMult;
        if (al < 0.01) continue;
        ctx.save();
        ctx.globalAlpha = al;
        for (const pf of cl.puffs) {
          const px = cx + pf.ox * sc;
          const py = cy + pf.oy * sc;
          const rx = pf.rx * sc;
          const ry = pf.ry * sc;
          const pg = ctx.createRadialGradient(px, py, 0, px, py, rx);
          pg.addColorStop(0, rgba(clColor, 0.6));
          pg.addColorStop(0.4, rgba(clColor, 0.3));
          pg.addColorStop(1, rgba(clColor, 0));
          ctx.fillStyle = pg;
          ctx.beginPath(); ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }

      // 7. SUN
      if (sun.vis) {
        const sPos = getPos(sun.prog);
        const bR = 22 * engine.dpr;
        const hr = 1 - (sPos.y / H);
        const nh = smoothstep(0.05, 0.25, hr);
        const sCol = lerpColor([255,180,80], [255,248,235], nh);
        
        for (let i=4; i>=0; i--) {
          const blR = bR * (3 + i*5);
          const blA = 0.015 * (1 - i*0.15) * (1 - nh*0.4);
          const blC = lerpColor([255,160,60], [255,220,180], nh);
          const bg = ctx.createRadialGradient(sPos.x, sPos.y, 0, sPos.x, sPos.y, blR);
          bg.addColorStop(0, rgba(blC, blA));
          bg.addColorStop(0.5, rgba(blC, blA*0.3));
          bg.addColorStop(1, rgba(blC, 0));
          ctx.fillStyle = bg;
          ctx.fillRect(sPos.x - blR, sPos.y - blR, blR*2, blR*2);
        }
        
        const iG = ctx.createRadialGradient(sPos.x, sPos.y, 0, sPos.x, sPos.y, bR*3);
        iG.addColorStop(0, rgba(sCol, 1));
        iG.addColorStop(0.3, rgba(sCol, 0.6));
        iG.addColorStop(0.6, rgba([255,210,150], 0.15));
        iG.addColorStop(1, rgba([255,200,120], 0));
        ctx.fillStyle = iG;
        ctx.beginPath(); ctx.arc(sPos.x, sPos.y, bR*3, 0, Math.PI*2); ctx.fill();
        
        const cG = ctx.createRadialGradient(sPos.x, sPos.y, 0, sPos.x, sPos.y, bR);
        cG.addColorStop(0, rgba([255,255,250], 1));
        cG.addColorStop(0.7, rgba(sCol, 0.95));
        cG.addColorStop(1, rgba(sCol, 0.2));
        ctx.fillStyle = cG;
        ctx.beginPath(); ctx.arc(sPos.x, sPos.y, bR, 0, Math.PI*2); ctx.fill();
      }

      // 8. MOON
      const moon = getMoonPhase(p);
      if (moon.vis) {
        const mPos = getPos(moon.prog);
        const mR = 18 * engine.dpr;
        const mA = moon.o;
        for (let i=3; i>=0; i--) {
          const hR = mR * (4 + i*4);
          const hA = 0.02 * mA * (1 - i*0.2);
          const hG = ctx.createRadialGradient(mPos.x, mPos.y, 0, mPos.x, mPos.y, hR);
          hG.addColorStop(0, rgba([180,200,230], hA));
          hG.addColorStop(0.5, rgba([140,170,210], hA*0.3));
          hG.addColorStop(1, rgba([100,130,180], 0));
          ctx.fillStyle = hG;
          ctx.fillRect(mPos.x - hR, mPos.y - hR, hR*2, hR*2);
        }
        const mg = ctx.createRadialGradient(mPos.x, mPos.y, mR*0.5, mPos.x, mPos.y, mR*2.5);
        mg.addColorStop(0, rgba([210,220,240], 0.4*mA));
        mg.addColorStop(0.5, rgba([180,195,220], 0.1*mA));
        mg.addColorStop(1, rgba([150,170,200], 0));
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(mPos.x, mPos.y, mR*2.5, 0, Math.PI*2); ctx.fill();
        
        ctx.save();
        ctx.beginPath(); ctx.arc(mPos.x, mPos.y, mR, 0, Math.PI*2); ctx.clip();
        
        const mb = ctx.createRadialGradient(mPos.x - mR*0.2, mPos.y - mR*0.15, 0, mPos.x, mPos.y, mR);
        mb.addColorStop(0, rgba([235,235,230], mA));
        mb.addColorStop(0.5, rgba([215,215,212], mA));
        mb.addColorStop(1, rgba([185,188,195], mA*0.9));
        ctx.fillStyle = mb; ctx.fill();
        
        const crs = [{x:-0.25,y:-0.2,r:0.18,a:0.08},{x:0.15,y:0.25,r:0.22,a:0.06},{x:-0.1,y:0.35,r:0.12,a:0.07},{x:0.3,y:-0.15,r:0.15,a:0.05},{x:-0.35,y:0.1,r:0.1,a:0.09},{x:0.05,y:-0.35,r:0.14,a:0.06},{x:0.25,y:0.05,r:0.2,a:0.04},{x:-0.15,y:-0.05,r:0.25,a:0.05}];
        for (const c of crs) {
          const cx = mPos.x + c.x * mR;
          const cy = mPos.y + c.y * mR;
          const cr = c.r * mR;
          const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
          cg.addColorStop(0, rgba([160,162,170], c.a * mA));
          cg.addColorStop(1, rgba([160,162,170], 0));
          ctx.fillStyle = cg;
          ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI*2); ctx.fill();
        }
        
        const shG = ctx.createLinearGradient(mPos.x - mR*1.2, mPos.y, mPos.x + mR*0.5, mPos.y);
        shG.addColorStop(0, rgba([30,35,55], 0.25*mA));
        shG.addColorStop(0.6, rgba([30,35,55], 0.05*mA));
        shG.addColorStop(1, rgba([30,35,55], 0));
        ctx.fillStyle = shG;
        ctx.fillRect(mPos.x - mR, mPos.y - mR, mR*2, mR*2);
        ctx.restore();
      }

      // 9. LANDSCAPE
      const br = (cols.h[0] + cols.h[1] + cols.h[2]) / 3;
      const silC = lerpColor([8,10,18], [25,35,30], clamp(br/200, 0, 1));
      
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let i=0; i<=200; i++) {
        const t = i/200;
        const x = t*W;
        const y = H*0.88 - Math.sin(t*Math.PI*1.2+0.5)*H*0.04 - Math.sin(t*Math.PI*2.8+1.2)*H*0.025 - Math.sin(t*Math.PI*5.5+0.8)*H*0.012;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      
      const lg = ctx.createLinearGradient(0, H*0.84, 0, H);
      lg.addColorStop(0, rgba(lerpColor(silC, cols.h, 0.05), 1));
      lg.addColorStop(0.3, rgba(silC, 1));
      lg.addColorStop(1, rgba(lerpColor(silC, [0,0,0], 0.3), 1));
      ctx.fillStyle = lg; ctx.fill();
      
      ctx.beginPath();
      for (let i=0; i<=200; i++) {
        const t = i/200;
        const x = t*W;
        const y = H*0.92 - Math.sin(t*Math.PI*1.8+2.0)*H*0.025 - Math.sin(t*Math.PI*4.2+0.5)*H*0.012;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = rgba(lerpColor(silC, [0,0,0], 0.3)); ctx.fill();

      // 10. COLOR GRADING
      let oC, oA;
      if (p < 0.20 || p > 0.80) { oC = [20,30,60]; oA = 0.06; }
      else if ((p > 0.23 && p < 0.30) || (p > 0.72 && p < 0.79)) { oC = [60,30,10]; oA = 0.04; }
      else { oC = [0,0,0]; oA = 0; }
      
      if (oA > 0) {
        ctx.fillStyle = rgba(oC, oA);
        ctx.fillRect(0, 0, W, H);
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="vignette" />
      <div ref={grainRef} className="grain" />
      <div className="absolute top-0 left-0 w-full h-[6%] bg-black z-10" />
      <div className="absolute bottom-0 left-0 w-full h-[6%] bg-black z-10" />
    </div>
  );
};

// ==============================================
// LOBBY INTERSTELLAR SKY
// ==============================================
const InterstellarSky = () => {
  return (
  <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
    <div className="absolute inset-0" style={{ background: 'radial-gradient(140% 110% at 50% 130%, #090d15 0%, #05070c 40%, #020305 72%, #000000 100%)', filter: 'saturate(1.16) contrast(1.1)' }} />
    <div className="absolute inset-0 interstellar-nebula-drift" style={{ background: 'radial-gradient(ellipse at 18% 26%, rgba(108, 130, 168, 0.14) 0%, transparent 58%), radial-gradient(ellipse at 78% 20%, rgba(94, 112, 146, 0.1) 0%, transparent 62%), radial-gradient(ellipse at 44% 70%, rgba(86, 102, 136, 0.1) 0%, transparent 60%)', mixBlendMode: 'screen', opacity: 0.22 }} />
    <div className="absolute inset-0 interstellar-film-grain" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 0.5px, transparent 0.5px)', backgroundSize: '3px 3px', mixBlendMode: 'soft-light', opacity: 0.13 }} />
    <div className="absolute inset-0 interstellar-stars-near" style={{ backgroundImage: 'radial-gradient(1.2px 1.2px at 12% 14%, #f5f9ff, transparent), radial-gradient(1.2px 1.2px at 28% 33%, #fffef8, transparent), radial-gradient(1.3px 1.3px at 45% 22%, #f7fbff, transparent), radial-gradient(1.2px 1.2px at 63% 41%, #e8f0ff, transparent), radial-gradient(1.3px 1.3px at 82% 27%, #fffaf0, transparent), radial-gradient(1.5px 1.5px at 73% 73%, #f9fbff, transparent), radial-gradient(1.2px 1.2px at 21% 74%, #f0f5ff, transparent), radial-gradient(1.7px 1.7px at 90% 58%, #ffffff, transparent)', backgroundSize: '110px 110px', opacity: 0.9 }} />
    <div className="absolute inset-0 interstellar-stars-far" style={{ backgroundImage: 'radial-gradient(1px 1px at 10% 52%, #f6f9ff, transparent), radial-gradient(1px 1px at 34% 66%, #fffaf5, transparent), radial-gradient(1px 1px at 52% 84%, #edf3ff, transparent), radial-gradient(1px 1px at 68% 12%, #fefefe, transparent), radial-gradient(1px 1px at 88% 38%, #e5eeff, transparent), radial-gradient(1.1px 1.1px at 56% 56%, #f8fbff, transparent)', backgroundSize: '80px 80px', opacity: 0.45 }} />
    <div className="absolute inset-0 interstellar-dust-flow" style={{ background: 'linear-gradient(112deg, transparent 12%, rgba(188, 204, 230, 0.05) 44%, rgba(148, 168, 198, 0.08) 54%, transparent 82%)', mixBlendMode: 'screen', opacity: 0.16 }} />
    <div className="absolute" style={{ top: '36%', left: '57%', width: '250px', height: '250px', marginLeft: '-125px', marginTop: '-125px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.92) 42%, rgba(0, 0, 0, 0.5) 66%, rgba(0, 0, 0, 0) 100%)', opacity: 0.7 }} />
    <div className="absolute inset-0 interstellar-depth-drift" style={{ background: 'radial-gradient(ellipse at 50% 104%, rgba(28, 40, 62, 0.35) 0%, rgba(12, 18, 32, 0.16) 42%, transparent 72%)', mixBlendMode: 'screen', opacity: 0.16 }} />
    <div className="absolute interstellar-lens-spin" style={{ top: '36%', left: '57%', width: '330px', height: '330px', marginLeft: '-165px', marginTop: '-165px', borderRadius: '9999px', background: 'conic-gradient(from 0deg, rgba(185, 206, 235, 0.02), rgba(135, 163, 198, 0.1), rgba(68, 88, 120, 0.16), rgba(185, 206, 235, 0.02))', filter: 'blur(8px)', opacity: 0.45, mixBlendMode: 'screen' }} />
    <div className="interstellar-shooting interstellar-shooting-a" />
    <div className="absolute inset-0" style={{ background: 'radial-gradient(180% 130% at 50% 112%, transparent 22%, rgba(0, 0, 0, 0.46) 68%, rgba(0, 0, 0, 0.76) 100%)' }} />
  </div>
  );
};

// --- IMAGE PRELOADER ---
const roleImages = {
  'Mafia': '/mafia-card.jpg',
  'Doctor': '/doctor-card.jpg',
  'Detective': '/detective-card.jpg',
  'Sheriff': '/sheriff-card.jpg',
  'Civilian': '/civilian-card.jpg'
};

const glowColors = { 
  'Mafia': '#ff003c',      
  'Doctor': '#00ff75',     
  'Detective': '#00d2ff',  
  'Sheriff': '#f2994a',    
  'Civilian': '#8e44ad'    
};

const ImagePreloader = () => (
  <div className="hidden">
    {Object.values(roleImages).map((src, index) => (
      <img key={index} src={src} alt="preload" fetchpriority="high" />
    ))}
  </div>
);

// --- THE PERFECT AI PHOTO CARD ---
const RoleCard = ({ isFlipped, role }) => {
  return (
    <div className="my-6 relative w-[240px] h-[360px] [perspective:1000px] select-none touch-none">
      <div className={`relative w-full h-full transition-transform duration-[600ms] [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-[2rem] bg-[#0a0a0a] border border-slate-800 flex flex-col items-center justify-center p-4 shadow-xl">
           <p className="text-slate-500 font-black tracking-widest uppercase text-center text-xl">Secret Role</p>
           <p className="text-[10px] text-slate-600 mt-4 tracking-widest uppercase font-bold animate-pulse">Tap & Hold to Reveal</p>
        </div>
        
        <div 
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2rem] bg-black" 
          style={{ 
            backgroundImage: `url(${roleImages[role] || roleImages.Civilian})`,
            backgroundPosition: 'center',
            backgroundSize: '105%',
            backgroundRepeat: 'no-repeat',
            boxShadow: isFlipped ? `0px 0px 50px 10px ${glowColors[role] || glowColors.Civilian}40` : 'none' 
          }}
        >
        </div>
      </div>
    </div>
  );
};

export default function GameBoard() {
  const state = useGameStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardViewed, setCardViewed] = useState(false);
  const [voteSelected, setVoteSelected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const alivePlayers = state.players.filter(p => p.isAlive);
  const availableRecentNames = state.recentNames.filter(n => !state.players.some(p => p.name === n));
  const selectedMafiaCount = state.settings.mafiaCount;
  const selectedSheriffMode = state.settings.sheriffMode;

  const requestedMafiaCount = selectedMafiaCount === 'auto'
    ? (state.players.length >= 8 ? 2 : 1)
    : Number(selectedMafiaCount) || 1;
  const resolvedMafiaCount = Math.max(1, Math.min(requestedMafiaCount, Math.max(1, state.players.length - 2 || 1)));
  const sheriffWanted = selectedSheriffMode === 'always'
    || (selectedSheriffMode === 'auto' && state.players.length >= 8);
  const hasSheriff = sheriffWanted && (2 + resolvedMafiaCount < state.players.length);
  const baseRoles = 2 + resolvedMafiaCount + (hasSheriff ? 1 : 0);
  const civilians = Math.max(state.players.length - baseRoles, 0);

  // --- AUTOMATIC CINEMATIC TIMERS ---
  useEffect(() => {
    let timer;
    if (state.phase === 'night_transition') {
      timer = setTimeout(() => {
        state.startNightRoles();
      }, TRANSITION_MS);
    } else if (state.phase === 'day_transition') {
      timer = setTimeout(() => {
        state.startDayRecap();
      }, TRANSITION_MS);
    }
    return () => clearTimeout(timer);
  }, [state.phase]);

  // --- Reset interactions ---
  useEffect(() => {
    setCardViewed(false);
    setVoteSelected(false);
  }, [state.phase]);

  // Background Engine
  const renderBackground = () => {
    if (state.phase === 'splash') return null; 
    if (state.phase === 'lobby' || state.phase === 'role_reveal') return <InterstellarSky />;
    return <CinematicSky gamePhase={state.phase} />;
  };

  const renderBackButton = () => {
    if (state.phase === 'lobby' || state.phase === 'splash') return null;
    return (
      <button 
        onClick={() => {
          if (window.confirm("Abort current game and go back to Lobby?")) {
            state.resetToLobby();
          }
        }}
        className="absolute top-4 left-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-90 z-50 p-3 bg-[#0a0a0a]/80 backdrop-blur-md rounded-lg border border-slate-800 shadow-xl"
      >
        <span>◀</span> LOBBY
      </button>
    );
  };

  const renderPlayerList = (onSelect, includeSkip = false, disableCondition = () => false) => (
    <div className="w-full max-w-sm space-y-2 mt-6 max-h-[50vh] overflow-y-auto pr-2 relative z-10">
      {alivePlayers.map(p => {
        const isDisabled = disableCondition(p);
        return (
          <button 
            key={p.id} 
            onClick={() => onSelect(p.id)}
            disabled={isDisabled}
            className={`w-full p-4 rounded-xl font-bold uppercase transition-all ${isDisabled ? 'bg-slate-900/80 text-slate-600 border border-slate-800' : 'bg-[#111] text-white active:scale-95 border border-slate-700'}`}
          >
            {p.name} {isDisabled && <span className="text-[10px] ml-2 tracking-widest text-slate-600">(LOCKED)</span>}
          </button>
        );
      })}
      {includeSkip && (
        <button 
          onClick={() => onSelect(null)}
          className="w-full p-4 bg-transparent border border-slate-700/80 text-slate-400 rounded-xl font-bold uppercase mt-4 active:scale-95"
        >
          Skip / Nobody
        </button>
      )}
    </div>
  );

  // --- NEW SPLASH SCREEN ---
  if (state.phase === 'splash') {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <ImagePreloader />
        <div className="relative z-10">
          <button 
            onClick={() => {
              setTimeout(() => {
                state.enterLobby();
              }, 1500); 
            }}
            className="splash-batman-btn"
          >
            <span>PLAY GAME</span>
          </button>
        </div>
      </div>
    );
  }

  // --- LOBBY ---
  if (state.phase === 'lobby') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 overflow-hidden">
        {renderBackground()}

        <button
          onClick={() => setShowSettings((prev) => !prev)}
          aria-label="Toggle settings"
          className="absolute top-4 left-4 z-50 w-12 h-12 rounded-xl border border-cyan-300/40 bg-[#02060a]/80 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all hover:border-cyan-200/70 hover:bg-[#07111a]/85"
        >
          <svg
            className={`w-6 h-6 text-cyan-100 ${showSettings ? 'animate-spin' : ''}`}
            style={{ animationDuration: '0.8s' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3.2" />
            <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.9 1.9 0 0 1-2.7 2.7l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.9 1.9 0 0 1-2.7-2.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.9 1.9 0 0 1 2.7-2.7l.1.1a1 1 0 0 0 1.1.2h0a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9h0a1 1 0 0 0 1.1-.2l.1-.1a1.9 1.9 0 0 1 2.7 2.7l-.1.1a1 1 0 0 0-.2 1.1v0a1 1 0 0 0 .9.6h.2a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
          </svg>
        </button>
        
        {/* FAST DIAGONAL SHINE TEXT */}
        <h1 className="text-5xl md:text-6xl font-black uppercase mb-10 tracking-[0.2em] mt-14 relative z-10 shine-text text-center">
          THE MAFIA
        </h1>

        {showSettings && (
          <div className="w-full max-w-sm mb-8 p-4 rounded-2xl border border-cyan-300/30 bg-[#02060a]/85 backdrop-blur-lg relative z-10 shadow-xl">
            <p className="text-cyan-200 text-[11px] font-black uppercase tracking-[0.2em] mb-4">Game Settings</p>

            <div className="mb-4">
              <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-2">Mafia Count</p>
              <div className="grid grid-cols-3 gap-2">
                {['auto', 1, 2].map((mode) => (
                  <button
                    key={String(mode)}
                    onClick={() => state.setMafiaCount(mode)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedMafiaCount === mode ? 'bg-rose-400/20 text-rose-200 border-rose-300/60' : 'bg-slate-900/70 text-slate-300 border-slate-700/70 hover:border-slate-500'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-1">
              <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-2">Sheriff Role</p>
              <div className="grid grid-cols-3 gap-2">
                {['auto', 'always', 'off'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => state.setSheriffMode(mode)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedSheriffMode === mode ? 'bg-violet-400/20 text-violet-200 border-violet-300/60' : 'bg-slate-900/70 text-slate-300 border-slate-700/70 hover:border-slate-500'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-slate-700/70">
              <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold mb-2">Current Match Setup</p>
              <div className="text-xs text-slate-200 space-y-1">
                <p>Mafia: <span className="text-rose-300 font-bold">{resolvedMafiaCount}</span></p>
                <p>Doctor: <span className="text-emerald-300 font-bold">1</span></p>
                <p>Detective: <span className="text-sky-300 font-bold">1</span></p>
                <p>Sheriff: <span className="text-violet-300 font-bold">{hasSheriff ? 1 : 0}</span></p>
                <p>Civilians: <span className="text-slate-100 font-bold">{civilians}</span></p>
              </div>
            </div>
          </div>
        )}
        
        {/* EXACT LAKSHAY-ART PODA INPUT */}
        <div className="w-full mb-10 flex justify-center relative z-10">
          <div className="poda-wrapper">
            <div className="poda-glow"></div>
            <div className="poda-darkBorderBg"></div>
            <div className="poda-darkBorderBg"></div>
            <div className="poda-darkBorderBg"></div>
            <div className="poda-white"></div>
            <div className="poda-border"></div>
            <div className="poda-main">
              <input 
                placeholder="Add Player..." 
                type="text" 
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && newPlayerName.trim()) { 
                    state.addPlayer(newPlayerName.trim()); 
                    setNewPlayerName(''); 
                  } 
                }}
                className="poda-input" 
              />
              <div className="poda-input-mask"></div>
              <div className="poda-pink-mask"></div>
              <div className="poda-filterBorder"></div>
              
              <div 
                className="poda-filter-icon" 
                onClick={() => { 
                  if(newPlayerName.trim()) { 
                    state.addPlayer(newPlayerName.trim()); 
                    setNewPlayerName(''); 
                  } 
                }}
              >
                <svg preserveAspectRatio="none" height="27" width="27" viewBox="4.8 4.56 14.832 15.408" fill="none">
                  <path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z" stroke="#d6d6e6" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              
              <div className="poda-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" height="24" fill="none">
                  <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
                  <line stroke="url(#searchl)" y2="16.65" y1="22" x2="16.65" x1="22"></line>
                  <defs>
                    <linearGradient gradientTransform="rotate(50)" id="search">
                      <stop stopColor="#f8e7f8" offset="0%"></stop>
                      <stop stopColor="#b6a9b7" offset="50%"></stop>
                    </linearGradient>
                    <linearGradient id="searchl">
                      <stop stopColor="#b6a9b7" offset="0%"></stop>
                      <stop stopColor="#837484" offset="50%"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT PLAYERS LIST */}
        {availableRecentNames.length > 0 && (
          <div className="w-full mb-6 relative z-10">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 pl-2 text-center drop-shadow-md">Recent Players</p>
            <div className="flex flex-wrap justify-center gap-2">
              {availableRecentNames.slice(0, 6).map(name => (
                <button 
                  key={name} 
                  onClick={() => state.addPlayer(name)} 
                  className="px-4 py-2 bg-[#222] text-[#e81cff] border border-[#e81cff]/30 rounded-full text-xs font-bold tracking-wider active:scale-95 transition-all shadow-md"
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ADDED PLAYERS LIST */}
        <div className="w-full space-y-2 mb-10 max-h-[300px] overflow-y-auto px-2 relative z-10">
          {state.players.map((p) => (
            <div key={p.id} className="flex justify-between items-center py-4 px-6 bg-[#010201]/80 backdrop-blur-md border border-[#40c9ff]/30 rounded-2xl shadow-sm transition-all">
              <span className="font-bold tracking-widest text-white">{p.name}</span>
              <button onClick={() => state.removePlayer(p.id)} className="text-rose-500 font-bold active:scale-90 flex items-center justify-center w-6 h-6">✕</button>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm flex items-center justify-between bg-[#010201]/80 backdrop-blur-md border border-[#40c9ff]/30 p-4 rounded-xl mb-10 relative z-10">
          <span className="font-bold text-[10px] tracking-widest uppercase text-slate-400">Reveal Roles on Death?</span>
          <button 
            onClick={state.toggleRevealRoles} 
            className={`px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest transition-colors ${state.settings.revealRoles ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-[#222] text-slate-500 border border-slate-700'}`}
          >
            {state.settings.revealRoles ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* STEALTHWORM START MATCH BUTTON */}
        <div className="w-full flex justify-center relative z-10 mb-6">
          <button 
            disabled={state.players.length < 4}
            onClick={() => {
              setTimeout(() => { state.startGame(); }, 250); 
            }}
            className="stealth-btn"
          >
            <strong className="stealth-strong">BEGIN GAME ({state.players.length})</strong>
            <div className="stealth-container-stars">
              <div className="stealth-stars"></div>
            </div>
            <div className="stealth-glow">
              <div className="stealth-circle"></div>
              <div className="stealth-circle"></div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // --- ROLE REVEAL PHASE ---
  if (state.phase === 'role_reveal') {
    const currentPlayer = state.players[state.revealIndex];
    const isLastPlayer = state.revealIndex === state.players.length - 1;

    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-2 relative z-10">Pass phone to</p>
        <h2 className="text-4xl font-black text-white uppercase mb-8 drop-shadow-md relative z-10">{currentPlayer.name}</h2>
        
        <div 
          onMouseDown={() => setIsFlipped(true)}
          onMouseUp={() => { setIsFlipped(false); setCardViewed(true); }}
          onMouseLeave={() => setIsFlipped(false)}
          onTouchStart={() => setIsFlipped(true)}
          onTouchEnd={() => { setIsFlipped(false); setCardViewed(true); }}
          className="cursor-pointer relative z-10"
        >
          <RoleCard isFlipped={isFlipped} role={currentPlayer.role} />
        </div>

        {!cardViewed && (
          <p className="mt-12 text-slate-400 font-bold text-sm relative z-10 animate-pulse">👆 Tap the card to view your role</p>
        )}

        <button 
          onClick={() => { setIsFlipped(false); setCardViewed(false); state.nextRoleReveal(); }}
          disabled={!cardViewed} 
          className={`mt-12 p-5 w-full max-w-sm rounded-xl font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${!cardViewed ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0 bg-[#0a0a0a]/90 backdrop-blur-md text-white border border-slate-800 active:scale-95'}`}
        >
          {isLastPlayer ? 'Give to Moderator' : 'Next Player'}
        </button>
      </div>
    );
  }

  // --- CINEMATIC: NIGHT TRANSITION ---
  if (state.phase === 'night_transition') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-black/30 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] relative z-20 animate-in fade-in duration-1000">
            EVERYONE
          </h2>
          <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] relative z-20 mt-4 animate-in fade-in duration-1000 delay-500">
            CLOSE YOUR EYES
          </h2>
          <p className="text-slate-300 mt-8 text-lg tracking-widest font-bold relative z-20 animate-pulse">Get ready for the night...</p>
        </div>
      </div>
    );
  }

  // --- NIGHT: MAFIA ---
  if (state.phase === 'night_mafia') {
    const disableCondition = (p) => p.role === 'Mafia';
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-red-500 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] tracking-[0.15em]">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold">🌙 Moderator: Ask the Mafia to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)] tracking-[0.1em]">Who does the Mafia kill?</h3>
        {renderPlayerList((id) => state.submitNightAction('Mafia', id), true, disableCondition)}
      </div>
    );
  }

  // --- NIGHT: DOCTOR ---
  if (state.phase === 'night_doctor') {
    const disableCondition = (p) => p.id === state.doctorLastSaved || (p.role === 'Doctor' && state.doctorHasSelfSaved);
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-green-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)] tracking-[0.15em]">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold">🌙 Moderator: Ask the Doctor to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] tracking-[0.1em]">Who does the Doctor save?</h3>
        {renderPlayerList((id) => state.submitNightAction('Doctor', id), true, disableCondition)}
      </div>
    );
  }

  // --- NIGHT: DETECTIVE ---
  if (state.phase === 'night_detective') {
    if (state.investigationResult) {
      const isDeadRole = state.investigationResult === 'DEAD_ROLE';
      const isMafia = state.investigationResult === 'MAFIA';
      return (
        <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden">
          {renderBackground()}
          {renderBackButton()}
          <p className="text-slate-300 uppercase font-bold tracking-widest text-[11px] mb-6 relative z-10">
            {isDeadRole ? "🔍 Moderator: Pretend to give an answer!" : "🔍 Moderator: Nod or shake your head."}
          </p>
          <h1 className={`text-6xl md:text-7xl font-black uppercase relative z-10 ${isDeadRole ? 'text-slate-500 drop-shadow-[0_0_20px_rgba(107,114,128,0.5)]' : isMafia ? 'text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.7)]' : 'text-green-400 drop-shadow-[0_0_30px_rgba(34,197,94,0.7)]'}`}>
            {isDeadRole ? 'ROLE DEAD' : state.investigationResult}
          </h1>
          <button 
            onClick={state.advanceFromDetective}
            className="mt-12 p-5 w-full max-w-sm bg-[#0a0a0a]/90 backdrop-blur-md rounded-xl font-black tracking-widest uppercase active:scale-95 relative z-10 border border-slate-700 hover:border-slate-500 transition-colors shadow-lg"
          >
            Continue →
          </button>
        </div>
      );
    }
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-blue-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)] tracking-[0.15em]">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold">🔍 Moderator: Ask the Detective to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)] tracking-[0.1em]">Who is investigated?</h3>
        {renderPlayerList((id) => state.submitNightAction('Detective', id), false)}
      </div>
    );
  }

  // --- NIGHT: SHERIFF ---
  if (state.phase === 'night_sheriff') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-purple-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] tracking-[0.15em]">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold">⚔️ Moderator: Ask the Sheriff to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] tracking-[0.1em]">Who does the Sheriff execute?</h3>
        {renderPlayerList((id) => state.submitNightAction('Sheriff', id), true)}
      </div>
    );
  }

  // --- CINEMATIC: DAY TRANSITION ---
  if (state.phase === 'day_transition') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-amber-50 uppercase tracking-[0.3em] drop-shadow-[0_0_40px_rgba(255,210,0,0.8)] relative z-20 animate-in fade-in duration-1000">
            EVERYONE
          </h2>
          <h2 className="text-5xl md:text-6xl font-black text-amber-50 uppercase tracking-[0.3em] drop-shadow-[0_0_40px_rgba(255,210,0,0.8)] relative z-20 mt-4 animate-in fade-in duration-1000 delay-500">
            OPEN YOUR EYES
          </h2>
          <p className="text-yellow-100 mt-8 text-lg tracking-widest font-bold relative z-20 animate-pulse">The sun is rising...</p>
        </div>
      </div>
    );
  }

  // --- DAY: RECAP ---
  if (state.phase === 'day_recap' || state.phase === 'day_recap_post_vote') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-4xl md:text-5xl font-black uppercase mb-12 text-white tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] mt-14 relative z-10 animate-in fade-in duration-1000">The Town Awakens</h2>
        <div className="w-full max-w-2xl space-y-4 relative z-10">
          {state.dayRecap.map((msg, i) => (
            <div 
              key={i} 
              className="p-6 bg-slate-900/50 backdrop-blur-md rounded-xl text-lg font-bold border-l-4 border-amber-400 shadow-xl animate-in fade-in duration-1000 hover:bg-slate-900/70 transition-colors"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <span className="text-amber-300">▸ </span>{msg}
            </div>
          ))}
        </div>
        <button 
          onClick={state.phase === 'day_recap' ? state.startVoting : state.advanceToNight}
          className="mt-12 p-5 w-full max-w-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 rounded-xl font-black tracking-widest uppercase active:scale-95 transition-transform shadow-xl relative z-10 hover:shadow-[0_0_30px_rgba(255,193,7,0.5)]"
        >
          {state.phase === 'day_recap' ? '→ Begin Voting' : '→ Go To Sleep (Next Night)'}
        </button>
      </div>
    );
  }

  // --- DAY: SEQUENTIAL VOTING ---
  if (state.phase === 'day_voting') {
    const currentVoter = alivePlayers[state.votingState.currentVoterIndex];
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-slate-300 font-bold uppercase tracking-widest text-[12px] mt-14 mb-3 relative z-10 drop-shadow-md">⚖️ Town Voting Phase</h2>
        <h3 className="text-5xl md:text-6xl font-black text-amber-300 my-4 uppercase relative z-10 drop-shadow-[0_0_20px_rgba(255,193,7,0.5)]">{currentVoter.name}</h3>
        <p className="text-lg font-bold text-red-400 tracking-widest uppercase relative z-10 drop-shadow-md">Who do you exile?</p>
        
        <div className="w-full max-w-sm mt-10 space-y-3 max-h-[50vh] overflow-y-auto pr-2 relative z-10">
          {alivePlayers.filter(p => p.id !== currentVoter.id).map(p => (
            <button 
              key={p.id} 
              onClick={() => { setVoteSelected(true); state.submitVote(p.id); }}
              className="w-full p-4 bg-slate-900/70 backdrop-blur-md text-white border-2 border-slate-700/70 rounded-lg font-bold uppercase active:scale-95 transition-all hover:border-slate-500 hover:bg-slate-900"
            >
              → Vote {p.name}
            </button>
          ))}
          <button 
            onClick={() => state.submitVote(null)}
            disabled={!voteSelected}
            className={`w-full p-4 border-2 rounded-lg font-bold uppercase mt-6 active:scale-95 transition-all ${
              !voteSelected 
                ? 'opacity-40 pointer-events-none border-slate-700/30 bg-transparent text-slate-500' 
                : 'bg-transparent border-slate-600/50 backdrop-blur-sm text-slate-300 hover:border-slate-400 hover:text-slate-200'
            }`}
          >
            ⊘ Pass / No Vote
          </button>
        </div>
        {!voteSelected && (
          <p className="mt-8 text-slate-400 font-bold text-sm relative z-10 animate-pulse">👉 Select a vote first, then you can pass</p>
        )}
        <p className="mt-10 text-slate-400 font-bold text-[11px] uppercase tracking-wider relative z-10 bg-slate-900/40 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700/50">
          Vote {state.votingState.currentVoterIndex + 1} of {alivePlayers.length}
        </p>
      </div>
    );
  }

  // --- GAME OVER ---
  if (state.phase === 'gameover') {
    const isMafiaWin = state.winner === 'Mafia';
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center">
          <h1 className={`text-6xl md:text-7xl font-black uppercase mb-2 mt-14 ${isMafiaWin ? 'text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]' : 'text-blue-400 drop-shadow-[0_0_40px_rgba(96,165,250,0.8)]'}`}>
            {state.winner} WIN!
          </h1>
          <p className={`text-sm tracking-[0.2em] font-bold ${isMafiaWin ? 'text-red-400' : 'text-blue-300'}`}>
            {isMafiaWin ? '🔴 THE MAFIA HAS TAKEN OVER THE TOWN' : '✓ THE TOWN HAS ELIMINATED THE THREAT'}
          </p>
        </div>
        
        <div className="w-full max-w-2xl mt-12 text-left bg-gradient-to-b from-slate-900/60 to-slate-950/60 backdrop-blur-md p-8 rounded-2xl border border-slate-700/50 relative z-10 shadow-2xl">
          <p className="text-slate-300 uppercase text-[11px] tracking-[0.15em] font-bold mb-6 text-center">Final Standings</p>
          <div className="space-y-3">
            {state.players.map((p, idx) => (
              <div key={p.id} className={`flex justify-between items-center py-3 px-4 rounded-lg border transition-all ${p.isAlive ? 'bg-slate-800/50 border-slate-600/50' : 'bg-slate-900/50 border-slate-700/50'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-bold">{idx + 1}.</span>
                  <span className={`font-bold tracking-wide ${p.isAlive ? 'text-white' : 'text-slate-600 line-through'}`}>{p.name}</span>
                </div>
                <span className={`font-black text-xs px-3 py-1 rounded-full tracking-wider ${p.role === 'Mafia' ? 'bg-red-900/40 text-red-400' : p.role === 'Doctor' ? 'bg-green-900/40 text-green-400' : p.role === 'Detective' ? 'bg-blue-900/40 text-blue-400' : p.role === 'Sheriff' ? 'bg-purple-900/40 text-purple-400' : 'bg-slate-800/40 text-slate-400'}`}>{p.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex justify-center mt-14 mb-6 relative z-10">
          <button 
            onClick={() => {
              setTimeout(() => { state.playAgain(); }, 1500); 
            }}
            className="splash-batman-btn"
          >
            <span>PLAY AGAIN</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}