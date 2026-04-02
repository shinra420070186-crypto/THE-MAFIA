import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from './store';
import Galaxy from './Galaxy';

// ─── CONSTANTS ───────────────────────────────────────
const TRANSITION_MS = 5000; // Exactly 5 seconds for smooth transitions
const TAU = Math.PI * 2;

// ─── COLOR & MATH UTILITIES ──────────────────────────
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function rgb(r, g, b) { return { r, g, b }; }

function lerpColor(a, b, t) {
  return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) };
}

function rgbStr(c, a = 1) {
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${a})`;
}

// ─── NEW SKY COLOR PALETTES ──────────────────────────
const SKY_PHASES = [
  { pos: 0.00, zenith: rgb(8, 10, 28),     horizon: rgb(15, 18, 40) },
  { pos: 0.15, zenith: rgb(12, 14, 35),     horizon: rgb(30, 25, 50) },
  { pos: 0.20, zenith: rgb(25, 20, 55),     horizon: rgb(120, 50, 60) },
  { pos: 0.25, zenith: rgb(60, 45, 90),     horizon: rgb(220, 120, 60) },
  { pos: 0.30, zenith: rgb(80, 100, 170),   horizon: rgb(240, 170, 100) },
  { pos: 0.35, zenith: rgb(100, 140, 210),  horizon: rgb(200, 190, 160) },
  { pos: 0.45, zenith: rgb(85, 150, 225),   horizon: rgb(170, 195, 215) },
  { pos: 0.50, zenith: rgb(75, 140, 220),   horizon: rgb(160, 190, 215) },
  { pos: 0.55, zenith: rgb(85, 150, 225),   horizon: rgb(170, 195, 215) },
  { pos: 0.65, zenith: rgb(100, 140, 210),  horizon: rgb(200, 185, 155) },
  { pos: 0.70, zenith: rgb(80, 90, 160),    horizon: rgb(230, 150, 80) },
  { pos: 0.75, zenith: rgb(55, 40, 85),     horizon: rgb(210, 100, 50) },
  { pos: 0.80, zenith: rgb(25, 18, 52),     horizon: rgb(110, 45, 55) },
  { pos: 0.85, zenith: rgb(12, 14, 35),     horizon: rgb(30, 25, 50) },
  { pos: 1.00, zenith: rgb(8, 10, 28),      horizon: rgb(15, 18, 40) },
];

function getSkyColors(phase) {
  const p = phase % 1;
  for (let i = 0; i < SKY_PHASES.length - 1; i++) {
    if (p >= SKY_PHASES[i].pos && p <= SKY_PHASES[i + 1].pos) {
      const localT = (p - SKY_PHASES[i].pos) / (SKY_PHASES[i + 1].pos - SKY_PHASES[i].pos);
      const t = easeInOutSine(localT);
      return {
        zenith: lerpColor(SKY_PHASES[i].zenith, SKY_PHASES[i + 1].zenith, t),
        horizon: lerpColor(SKY_PHASES[i].horizon, SKY_PHASES[i + 1].horizon, t),
      };
    }
  }
  return { zenith: SKY_PHASES[0].zenith, horizon: SKY_PHASES[0].horizon };
}

// ─── GENERATORS ──────────────────────────────────────
function generateStars(count) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random() * 0.7,
      size: Math.random() * 2.2 + 0.4,
      brightness: Math.random() * 0.5 + 0.5,
      twinkleSpeed: Math.random() * 2 + 0.5,
      twinkleOffset: Math.random() * TAU,
    });
  }
  return stars;
}

function generateClouds(count) {
  const clouds = [];
  for (let i = 0; i < count; i++) {
    const layer = Math.floor(Math.random() * 3);
    clouds.push({
      x: Math.random() * 1.4 - 0.2,
      y: 0.08 + Math.random() * 0.35,
      width: 0.12 + Math.random() * 0.18,
      height: 0.02 + Math.random() * 0.025,
      speed: (0.008 + Math.random() * 0.015) * (1 + layer * 0.3),
      opacity: 0.15 + Math.random() * 0.25,
      layer,
    });
  }
  return clouds;
}

function generateLightRays() {
  const rays = [];
  for (let i = 0; i < 12; i++) {
    rays.push({
      angle: -0.5 + Math.random() * 1.0,
      width: 0.01 + Math.random() * 0.025,
      length: 0.3 + Math.random() * 0.4,
      opacity: 0.03 + Math.random() * 0.05,
    });
  }
  return rays;
}

function createNoiseTexture(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = Math.random() * 255;
    imageData.data[i] = v;
    imageData.data[i + 1] = v;
    imageData.data[i + 2] = v;
    imageData.data[i + 3] = 255;
  }
  return imageData;
}

// ─── LANDSCAPE RENDERING ─────────────────────────────
function drawTrees(ctx, w, h, baseY, dayFactor, time) {
  const treeColor = `rgb(${Math.round(lerp(5, 18, dayFactor * 0.5))},${Math.round(lerp(10, 30, dayFactor * 0.5))},${Math.round(lerp(18, 40, dayFactor * 0.5))})`;
  
  const seed = 42;
  const treePosns = [];
  let rng = seed;
  for (let i = 0; i < 35; i++) {
    rng = (rng * 16807 + 0) % 2147483647;
    treePosns.push((rng / 2147483647));
  }
  
  for (let i = 0; i < treePosns.length; i++) {
    const tx = treePosns[i] * w;
    rng = (rng * 16807 + 0) % 2147483647;
    const treeH = h * (0.03 + (rng / 2147483647) * 0.05);
    const ty = baseY + h * 0.01;
    
    ctx.fillStyle = treeColor;
    ctx.beginPath();
    ctx.moveTo(tx, ty - treeH);
    ctx.lineTo(tx - treeH * 0.3, ty);
    ctx.lineTo(tx + treeH * 0.3, ty);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(tx, ty - treeH * 0.7);
    ctx.lineTo(tx - treeH * 0.35, ty - treeH * 0.1);
    ctx.lineTo(tx + treeH * 0.35, ty - treeH * 0.1);
    ctx.closePath();
    ctx.fill();
  }
}

function drawLandscape(ctx, w, h, phase, dayFactor, nightFactor, time) {
  const baseY = h * 0.82;
  
  const layers = [
    { yOff: -0.08, color: [20, 30, 50], dayColor: [70, 90, 120], detail: 0.003, amp: 0.08 },
    { yOff: -0.04, color: [15, 22, 38], dayColor: [50, 70, 95], detail: 0.005, amp: 0.06 },
    { yOff: 0, color: [8, 12, 22], dayColor: [30, 45, 65], detail: 0.008, amp: 0.04 },
  ];
  
  for (const layer of layers) {
    const lr = lerp(layer.color[0], layer.dayColor[0], dayFactor * 0.7);
    const lg = lerp(layer.color[1], layer.dayColor[1], dayFactor * 0.7);
    const lb = lerp(layer.color[2], layer.dayColor[2], dayFactor * 0.7);
    
    ctx.beginPath();
    ctx.moveTo(0, h);
    
    const ly = baseY + layer.yOff * h;
    for (let x = 0; x <= w; x += 3) {
      const nx = x * layer.detail;
      const mountain =
        Math.sin(nx * 1.0 + 0.5) * 0.4 +
        Math.sin(nx * 2.3 + 1.2) * 0.25 +
        Math.sin(nx * 4.7 + 3.1) * 0.15 +
        Math.sin(nx * 8.1 + 0.7) * 0.1 +
        Math.sin(nx * 15.3 + 2.4) * 0.05;
      
      const y = ly - mountain * layer.amp * h;
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = `rgb(${Math.round(lr)},${Math.round(lg)},${Math.round(lb)})`;
    ctx.fill();
  }
  
  const groundGrad = ctx.createLinearGradient(0, baseY + h * 0.02, 0, h);
  const gDay = dayFactor;
  groundGrad.addColorStop(0, `rgb(${Math.round(lerp(10, 25, gDay))},${Math.round(lerp(15, 40, gDay))},${Math.round(lerp(25, 55, gDay))})`);
  groundGrad.addColorStop(1, `rgb(${Math.round(lerp(5, 15, gDay))},${Math.round(lerp(8, 25, gDay))},${Math.round(lerp(15, 35, gDay))})`);
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, baseY + h * 0.02, w, h * 0.2);
  
  drawTrees(ctx, w, h, baseY, dayFactor, time);
}

// ─── 4K CINEMATIC SKY ENGINE ─────────────────────────
const CinematicSky = ({ gamePhase }) => {
  const canvasRef = useRef(null);
  
  const engineRef = useRef({
    stars: [],
    clouds: [],
    meteors: [],
    rays: [],
    skyPhase: 0.0,
    targetSkyPhase: 0.0,
    transitionSpeed: 0,
    globalTime: 0,
    lastTime: performance.now(),
    dpr: Math.max(2.5, window.devicePixelRatio || 1)
  });

  useEffect(() => {
    const engine = engineRef.current;
    
    if (gamePhase === 'day_transition') {
      engine.skyPhase = 0.0;
      engine.targetSkyPhase = 0.5;
      engine.transitionSpeed = 0.5 / (TRANSITION_MS / 1000); 
    } else if (gamePhase === 'night_transition') {
      engine.skyPhase = 0.5;
      engine.targetSkyPhase = 1.0;
      engine.transitionSpeed = 0.5 / (TRANSITION_MS / 1000);
    } else if (gamePhase.startsWith('day')) {
      engine.skyPhase = 0.5;
      engine.targetSkyPhase = 0.5;
      engine.transitionSpeed = 0;
    } else {
      engine.skyPhase = 1.0; 
      engine.targetSkyPhase = 1.0;
      engine.transitionSpeed = 0;
    }
  }, [gamePhase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const engine = engineRef.current;

    let W, H;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * engine.dpr;
      canvas.height = H * engine.dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(engine.dpr, 0, 0, engine.dpr, 0, 0);
    };
    window.addEventListener('resize', resize);
    resize();

    if (engine.stars.length === 0) engine.stars = generateStars(300);
    if (engine.clouds.length === 0) engine.clouds = generateClouds(14);
    if (engine.rays.length === 0) engine.rays = generateLightRays();
    if (!engine.noiseCanvas) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      c.getContext('2d').putImageData(createNoiseTexture(256), 0, 0);
      engine.noiseCanvas = c;
    }

    let rafId;
    const render = (timestamp) => {
      const dt = (timestamp - engine.lastTime) / 1000;
      engine.lastTime = timestamp;
      engine.globalTime += dt;

      if (engine.skyPhase < engine.targetSkyPhase) {
        engine.skyPhase = Math.min(engine.targetSkyPhase, engine.skyPhase + engine.transitionSpeed * dt);
      } else if (engine.skyPhase > engine.targetSkyPhase) {
        engine.skyPhase = Math.max(engine.targetSkyPhase, engine.skyPhase - engine.transitionSpeed * dt);
      }

      if (engine.skyPhase === 1.0 && engine.targetSkyPhase === 1.0) {
        engine.skyPhase = 0.0;
        engine.targetSkyPhase = 0.0;
      }

      const phase = engine.skyPhase;
      const time = engine.globalTime;

      const sky = getSkyColors(phase);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      const midColor = lerpColor(sky.zenith, sky.horizon, 0.35);
      const lowerMid = lerpColor(sky.zenith, sky.horizon, 0.65);
      grad.addColorStop(0, rgbStr(sky.zenith));
      grad.addColorStop(0.3, rgbStr(midColor));
      grad.addColorStop(0.65, rgbStr(lowerMid));
      grad.addColorStop(0.88, rgbStr(sky.horizon));
      grad.addColorStop(1.0, rgbStr(lerpColor(sky.horizon, rgb(0, 0, 0), 0.1)));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const isSunrise = smoothstep(0.18, 0.30, phase) * (1 - smoothstep(0.30, 0.40, phase));
      const isSunset = smoothstep(0.60, 0.72, phase) * (1 - smoothstep(0.72, 0.85, phase));
      const horizonGlow = Math.max(isSunrise, isSunset);
      
      if (horizonGlow > 0.01) {
        const glowColor = isSunrise > isSunset ? rgb(255, 140, 50) : rgb(245, 100, 40);
        const glowGrad = ctx.createRadialGradient(W * 0.5, H * 0.82, 0, W * 0.5, H * 0.82, W * 0.7);
        glowGrad.addColorStop(0, rgbStr(glowColor, horizonGlow * 0.35));
        glowGrad.addColorStop(0.3, rgbStr(glowColor, horizonGlow * 0.15));
        glowGrad.addColorStop(0.6, rgbStr(glowColor, horizonGlow * 0.04));
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, W, H);
      }

      const nightFactor = phase < 0.5 ? 1 - smoothstep(0.15, 0.30, phase) : smoothstep(0.70, 0.85, phase);
      const dayFactor = 1 - nightFactor;

      if (nightFactor > 0.01) {
        for (const star of engine.stars) {
          const twinkle = 0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
          const alpha = nightFactor * star.brightness * twinkle;
          if (alpha < 0.01) continue;
          
          const sx = star.x * W;
          const sy = star.y * H;
          
          if (star.size > 1.5) {
            const glowR = star.size * 4;
            const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
            glow.addColorStop(0, `rgba(200,220,255,${alpha * 0.3})`);
            glow.addColorStop(1, 'rgba(200,220,255,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);
          }
          
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 0.6, 0, TAU);
          ctx.fillStyle = `rgba(220,230,255,${alpha})`;
          ctx.fill();
        }
      }

      const sunProgress = (phase - 0.2) / 0.6;
      const sunAngleRad = sunProgress * Math.PI;
      const sunX = W * (0.15 + sunProgress * 0.7);
      const sunY = H * 0.85 - Math.sin(sunAngleRad) * H * 0.65;
      const sunVisible = sunProgress > 0 && sunProgress < 1 && sunY < H * 0.9;
      
      if (sunVisible && dayFactor > 0.01) {
        const sunRadius = 28;
        
        if (horizonGlow > 0.02) {
          ctx.save();
          ctx.translate(sunX, sunY);
          for (const ray of engine.rays) {
            ctx.save();
            ctx.rotate(ray.angle);
            const rayLen = ray.length * H;
            const rayGrad = ctx.createLinearGradient(0, 0, rayLen, 0);
            rayGrad.addColorStop(0, `rgba(255,200,100,${ray.opacity * horizonGlow * 1.5})`);
            rayGrad.addColorStop(0.5, `rgba(255,180,80,${ray.opacity * horizonGlow * 0.5})`);
            rayGrad.addColorStop(1, 'rgba(255,180,80,0)');
            ctx.fillStyle = rayGrad;
            ctx.fillRect(0, -ray.width * W * 0.5, rayLen, ray.width * W);
            ctx.restore();
          }
          ctx.restore();
        }
        
        for (let i = 4; i >= 0; i--) {
          const bloomR = sunRadius + i * 35;
          const bloomAlpha = dayFactor * 0.04 * (1 - i / 5);
          const bloomGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, bloomR);
          bloomGrad.addColorStop(0, `rgba(255,250,230,${bloomAlpha})`);
          bloomGrad.addColorStop(0.4, `rgba(255,220,150,${bloomAlpha * 0.4})`);
          bloomGrad.addColorStop(1, 'rgba(255,200,100,0)');
          ctx.fillStyle = bloomGrad;
          ctx.beginPath();
          ctx.arc(sunX, sunY, bloomR, 0, TAU);
          ctx.fill();
        }
        
        const sunGrad = ctx.createRadialGradient(
          sunX - sunRadius * 0.15, sunY - sunRadius * 0.15, 0,
          sunX, sunY, sunRadius
        );
        sunGrad.addColorStop(0, `rgba(255,255,250,${dayFactor})`);
        sunGrad.addColorStop(0.6, `rgba(255,245,220,${dayFactor * 0.95})`);
        sunGrad.addColorStop(0.85, `rgba(255,220,150,${dayFactor * 0.7})`);
        sunGrad.addColorStop(1, `rgba(255,180,80,0)`);
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, TAU);
        ctx.fill();
      }

      const moonProgress = ((phase + 0.5) % 1 - 0.2) / 0.6;
      const moonAngleRad = moonProgress * Math.PI;
      const moonX = W * (0.15 + moonProgress * 0.7);
      const moonY = H * 0.85 - Math.sin(moonAngleRad) * H * 0.6;
      const moonVisible = moonProgress > 0 && moonProgress < 1 && moonY < H * 0.9;
      
      if (moonVisible && nightFactor > 0.01) {
        const moonRadius = 22;
        
        for (let i = 3; i >= 0; i--) {
          const glowR = moonRadius + i * 25;
          const glowAlpha = nightFactor * 0.03 * (1 - i / 4);
          const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.3, moonX, moonY, glowR);
          moonGlow.addColorStop(0, `rgba(180,200,230,${glowAlpha})`);
          moonGlow.addColorStop(0.5, `rgba(140,160,200,${glowAlpha * 0.3})`);
          moonGlow.addColorStop(1, 'rgba(100,120,180,0)');
          ctx.fillStyle = moonGlow;
          ctx.beginPath();
          ctx.arc(moonX, moonY, glowR, 0, TAU);
          ctx.fill();
        }
        
        const moonGrad = ctx.createRadialGradient(
          moonX - moonRadius * 0.25, moonY - moonRadius * 0.25, 0,
          moonX, moonY, moonRadius
        );
        moonGrad.addColorStop(0, `rgba(230,235,245,${nightFactor * 0.95})`);
        moonGrad.addColorStop(0.5, `rgba(210,215,230,${nightFactor * 0.9})`);
        moonGrad.addColorStop(0.8, `rgba(185,195,215,${nightFactor * 0.8})`);
        moonGrad.addColorStop(1, `rgba(160,170,195,${nightFactor * 0.3})`);
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, TAU);
        ctx.fill();

        const craters = [
          { ox: -0.2, oy: -0.15, r: 0.18 },
          { ox: 0.15, oy: 0.2, r: 0.12 },
          { ox: -0.05, oy: 0.3, r: 0.09 },
          { ox: 0.25, oy: -0.1, r: 0.07 },
          { ox: -0.3, oy: 0.1, r: 0.1 },
        ];
        for (const c of craters) {
          const cx = moonX + c.ox * moonRadius;
          const cy = moonY + c.oy * moonRadius;
          const cr = c.r * moonRadius;
          ctx.beginPath();
          ctx.arc(cx, cy, cr, 0, TAU);
          ctx.fillStyle = `rgba(160,170,195,${nightFactor * 0.2})`;
          ctx.fill();
        }
      }

      for (const cloud of engine.clouds) {
        cloud.x += cloud.speed * dt * 0.15;
        if (cloud.x > 1.3) cloud.x = -0.3;
        
        const cx = cloud.x * W;
        const cy = cloud.y * H;
        const cw = cloud.width * W;
        const ch = cloud.height * H;
        
        const cloudBrightness = dayFactor > 0.5 ? lerp(180, 245, dayFactor) : lerp(40, 180, dayFactor * 2);
        const cloudR = cloudBrightness + (horizonGlow > 0.1 ? horizonGlow * 40 : 0);
        const cloudG = cloudBrightness + (horizonGlow > 0.1 ? horizonGlow * 15 : 0);
        const cloudB = cloudBrightness - (horizonGlow > 0.1 ? horizonGlow * 20 : 0);
        const layerOpacity = cloud.opacity * (0.6 + cloud.layer * 0.15);
        
        const puffs = [
          { ox: 0, oy: 0, sw: 1, sh: 1 },
          { ox: -0.3, oy: 0.1, sw: 0.7, sh: 0.8 },
          { ox: 0.3, oy: 0.05, sw: 0.65, sh: 0.75 },
          { ox: -0.15, oy: -0.15, sw: 0.8, sh: 0.6 },
          { ox: 0.15, oy: -0.1, sw: 0.75, sh: 0.65 },
        ];
        
        for (const puff of puffs) {
          const px = cx + puff.ox * cw;
          const py = cy + puff.oy * ch;
          const pw = cw * puff.sw;
          const ph = ch * puff.sh;
          
          const cloudGrad = ctx.createRadialGradient(px, py, 0, px, py, Math.max(pw, ph));
          cloudGrad.addColorStop(0, `rgba(${Math.round(cloudR)},${Math.round(cloudG)},${Math.round(cloudB)},${layerOpacity * 0.5})`);
          cloudGrad.addColorStop(0.5, `rgba(${Math.round(cloudR)},${Math.round(cloudG)},${Math.round(cloudB)},${layerOpacity * 0.25})`);
          cloudGrad.addColorStop(1, `rgba(${Math.round(cloudR)},${Math.round(cloudG)},${Math.round(cloudB)},0)`);
          
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(pw / Math.max(pw, ph), ph / Math.max(pw, ph));
          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(pw, ph), 0, TAU);
          ctx.fill();
          ctx.restore();
        }
      }

      if (dayFactor > 0.3) {
        const shimmerOpacity = dayFactor * 0.015;
        for (let i = 0; i < 3; i++) {
          const sy = H * (0.4 + i * 0.15);
          const shimmerX = Math.sin(time * 0.4 + i * 1.5) * W * 0.1;
          const shimmerW = W * 0.6;
          const shimmerGrad = ctx.createRadialGradient(
            W * 0.5 + shimmerX, sy, 0,
            W * 0.5 + shimmerX, sy, shimmerW
          );
          shimmerGrad.addColorStop(0, `rgba(255,250,230,${shimmerOpacity})`);
          shimmerGrad.addColorStop(0.5, `rgba(255,245,220,${shimmerOpacity * 0.3})`);
          shimmerGrad.addColorStop(1, 'rgba(255,245,220,0)');
          ctx.fillStyle = shimmerGrad;
          ctx.fillRect(0, sy - shimmerW, W, shimmerW * 2);
        }
      }

      if (nightFactor > 0.5) {
        if (timestamp - engine.lastMeteorTime > 800 + Math.random() * 2500 || !engine.lastMeteorTime) {