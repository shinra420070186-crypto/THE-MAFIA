import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from './store';
import Galaxy from './Galaxy';

// ─── CONSTANTS ───────────────────────────────────────
const TRANSITION_MS = 5000;
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
      c.width = 256;
      c.height = 256;
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
          if (Math.random() < 0.4) {
            engine.meteors.push({
              x: Math.random() * W * 0.8 + W * 0.1,
              y: Math.random() * H * 0.3,
              angle: Math.PI * 0.2 + Math.random() * Math.PI * 0.15,
              speed: 400 + Math.random() * 350,
              length: 60 + Math.random() * 80,
              life: 0,
              maxLife: 0.4 + Math.random() * 0.4,
              brightness: 0.5 + Math.random() * 0.5,
            });
            engine.lastMeteorTime = timestamp;
          }
        }
        
        for (let i = engine.meteors.length - 1; i >= 0; i--) {
          const m = engine.meteors[i];
          m.life += dt;
          if (m.life > m.maxLife) {
            engine.meteors.splice(i, 1);
            continue;
          }
          
          const lifeProgress = m.life / m.maxLife;
          const fade = lifeProgress < 0.1 ? lifeProgress / 0.1 : 1 - smoothstep(0.3, 1, lifeProgress);
          
          const mx = m.x + Math.cos(m.angle) * m.speed * m.life;
          const my = m.y + Math.sin(m.angle) * m.speed * m.life;
          const tailX = mx - Math.cos(m.angle) * m.length * fade;
          const tailY = my - Math.sin(m.angle) * m.length * fade;
          
          const trailGrad = ctx.createLinearGradient(tailX, tailY, mx, my);
          trailGrad.addColorStop(0, 'rgba(255,255,255,0)');
          trailGrad.addColorStop(0.7, `rgba(200,220,255,${fade * m.brightness * nightFactor * 0.3})`);
          trailGrad.addColorStop(1, `rgba(255,255,255,${fade * m.brightness * nightFactor * 0.8})`);
          
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineWidth = 2;
          ctx.strokeStyle = trailGrad;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(mx, my);
          ctx.stroke();
          
          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(255,255,255,${fade * m.brightness * nightFactor})`;
          ctx.beginPath();
          ctx.moveTo(mx - Math.cos(m.angle) * 4, my - Math.sin(m.angle) * 4);
          ctx.lineTo(mx, my);
          ctx.stroke();
          
          const headGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 8);
          headGlow.addColorStop(0, `rgba(220,240,255,${fade * m.brightness * nightFactor * 0.4})`);
          headGlow.addColorStop(1, 'rgba(220,240,255,0)');
          ctx.fillStyle = headGlow;
          ctx.fillRect(mx - 8, my - 8, 16, 16);
          ctx.restore();
        }
      }

      ctx.save();
      ctx.globalAlpha = 0.035;
      ctx.globalCompositeOperation = 'overlay';
      const grainOffX = (Math.random() * 256) | 0;
      const grainOffY = (Math.random() * 256) | 0;
      const pattern = ctx.createPattern(engine.noiseCanvas, 'repeat');
      if (pattern) {
        ctx.translate(grainOffX, grainOffY);
        ctx.fillStyle = pattern;
        ctx.fillRect(-grainOffX, -grainOffY, W + 256, H + 256);
      }
      ctx.restore();

      const vignetteGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, W * 0.25, W * 0.5, H * 0.5, W * 0.85);
      vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(0.7, 'rgba(0,0,0,0.05)');
      vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, W, H);

      drawLandscape(ctx, W, H, phase, dayFactor, nightFactor, time);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

// ─── SPOOKY HOUSE DAY/NIGHT COMPONENT ────────────────
const SpookyHouse = ({ phase }) => {
  const isNight = phase.startsWith('night');
  const themeClass = isNight ? 'theme-night' : 'theme-day';

  return (
    <div className={`spooky-anim-wrapper ${themeClass}`}>
      <style>{`
        .spooky-anim-wrapper {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          pointer-events: none;
          transition: all 5s ease;
          z-index: 1;
        }
        @media (max-width: 600px) {
          .spooky-anim-wrapper {
            transform: translate(-50%, -50%) scale(0.65);
          }
        }

        .theme-night {
          --sky-bg: #212f3c;
          --window-light: #ffd166;
          --celestial-bg: #95a5a6;
          --celestial-shadow: inset 7px -7px 0 rgba(0, 0, 0, 0.09);
          --crater-opacity: 1;
          --rain-opacity: 1;
        }

        .theme-day {
          --sky-bg: #87ceeb;
          --window-light: #222;
          --celestial-bg: #FFD700;
          --celestial-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
          --crater-opacity: 0;
          --rain-opacity: 0;
        }

        .spooky-house {
          position: relative;
        }

        .content-circle {
          position: relative;
          width: 450px;
          height: 450px;
          overflow: hidden;
          background-color: var(--sky-bg);
          transition: background-color 5s ease;
          border-radius: 50%;
          -webkit-backface-visibility: hidden;
          -moz-backface-visibility: hidden;
          -webkit-transform: translate3d(0, 0, 0);
          -moz-transform: translate3d(0, 0, 0);
          box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }

        .content-circle:before {
          content: "";
          position: absolute;
          width: 450px;
          height: 200px;
          top: 300px;
          border-radius: 50% 50% 0 0;
          background-color: #000;
        }

        .house {
          position: absolute;
          width: 120px;
          height: 150px;
          background-color: black;
          left: 180px;
          top: 160px;
          transform: rotate(5deg);
          z-index: 2;
        }

        .house:before {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-bottom: 30px solid black;
          border-right: 50px solid transparent;
          left: 115px;
          top: 70px;
          transform: rotate(5deg);
        }

        .house:after {
          content: "";
          position: absolute;
          width: 5px;
          height: 65px;
          background-color: black;
          left: 145px;
          top: 95px;
        }

        .porch {
          position: absolute;
          width: 30px;
          height: 100px;
          background-color: black;
          left: -20px;
          top: 55px;
          transform: rotate(-10deg);
        }
        .porch:before {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-bottom: 20px solid black;
          border-left: 40px solid transparent;
          left: -35px;
          top: 45px;
        }

        .porch:after {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 30px solid black;
          left: -5px;
          top: -25px;
        }

        .first-floor {
          position: absolute;
          transform: rotate(-10deg);
          background-color: black;
          width: 5px;
          height: 45px;
          left: -37px;
          top: 125px;
        }

        .first-floor:before {
          content: "";
          position: absolute;
          background-color: #000;
          width: 85px;
          height: 90px;
          top: -150px;
          left: 50px;
        }

        .first-floor:after {
          content: "";
          position: absolute;
          border-left: 52px solid transparent;
          border-right: 52px solid transparent;
          border-bottom: 50px solid black;
          top: -199px;
          left: 40px;
        }

        .second-floor {
          position: absolute;
          background-color: black;
          width: 35px;
          height: 100px;
          transform: rotate(3deg);
          top: -70px;
          left: 70px;
        }

        .second-floor:before {
          content: "";
          position: absolute;
          background-color: black;
          width: 20px;
          height: 100px;
          left: 33px;
          top: 40px;
          transform: rotate(-3deg);
        }

        .second-floor:after {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-left: 25px solid transparent;
          border-right: 25px solid transparent;
          border-bottom: 30px solid black;
          top: 12px;
          left: 15px;
        }

        .roof {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 25px solid transparent;
          border-right: 25px solid transparent;
          border-bottom: 30px solid black;
          left: 65px;
          top: -95px;
        }

        .roof:before {
          content: "";
          position: absolute;
          width: 6px;
          height: 20px;
          background-color: black;
          top: 5px;
          left: 10px;
          box-shadow: 20px 35px black;
        }

        .roof:after {
          content: "";
          position: absolute;
          width: 6px;
          height: 20px;
          background-color: black;
          transform: rotate(-10deg);
          left: -110px;
          top: 35px;
          box-shadow: -27px 97px black;
        }

        .door {
          position: absolute;
          background-color: var(--window-light);
          transition: background-color 5s ease;
          width: 30px;
          height: 50px;
          transform: rotate(-5deg);
          border-radius: 30px 30px 0 0;
          box-shadow: inset -10px 5px rgba(0, 0, 0, 0.5);
          top: 90px;
          left: 40px;
        }

        .door:before {
          content: "";
          position: absolute;
          background-color: var(--window-light);
          transition: background-color 5s ease;
          border-radius: 30px 30px 0 0;
          box-shadow: inset -5px 2px rgba(0, 0, 0, 0.5);
          width: 20px;
          height: 30px;
          left: -40px;
          transform: rotate(-3deg);
        }

        .door:after {
          content: "";
          position: absolute;
          background-color: var(--window-light);
          transition: background-color 5s ease;
          box-shadow: inset -5px 2px rgba(0, 0, 0, 0.5);
          border-radius: 30px 30px 0 0;
          width: 20px;
          height: 30px;
          left: 45px;
          transform: rotate(3deg);
        }

        .small-windows {
          position: absolute;
          background-color: var(--window-light);
          transition: background-color 5s ease, box-shadow 5s ease;
          border-radius: 30px 30px 0 0;
          width: 13px;
          height: 25px;
          left: 100px;
          top: -20px;
          box-shadow: -19px -40px var(--window-light), inset -4px 2px rgba(0, 0, 0, 0.5);
        }

        .small-windows:before {
          content: "";
          position: absolute;
          background-color: var(--window-light);
          transition: background-color 5s ease, box-shadow 5s ease;
          border-radius: 30px 30px 0 0;
          width: 13px;
          height: 25px;
          transform: rotate(-7deg);
          left: -60px;
          top: 50px;
          box-shadow: -60px 20px var(--window-light);
        }

        .big-window {
          position: absolute;
          background-color: var(--window-light);
          transition: background-color 5s ease;
          border-radius: 30px 30px 0 0;
          transform: rotate(-7deg);
          width: 30px;
          height: 40px;
          top: -35px;
          left: 10px;
        }

        .big-window:before,
        .big-window:after {
          content: "";
          position: absolute;
          background-color: black;
        }

        .big-window:before {
          height: 40px;
          width: 2px;
          left: 15px;
          box-shadow: 13px 55px black, -47px 80px black, -32px 120px black;
        }

        .big-window:after {
          height: 2px;
          width: 40px;
          top: 22px;
          box-shadow: 10px 58px black, -45px 78px black, -30px 120px black;
        }

        .frames {
          position: absolute;
          width: 2px;
          height: 40px;
          background-color: black;
          top: -65px;
          left: 86.5px;
          box-shadow: 19px 40px black, 7px 150px black;
        }

        .frames:before {
          content: "";
          position: absolute;
          height: 2px;
          width: 30px;
          background-color: black;
          top: 17px;
          left: -10px;
          box-shadow: 10px 40px black, 5px 150px black;
        }

        .moon {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background-color: var(--celestial-bg);
          z-index: 1;
          left: 80px;
          top: 40px;
          box-shadow: var(--celestial-shadow);
          transition: all 5s ease;
        }

        .moon:before,
        .moon:after {
          content: "";
          position: absolute;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.09);
          box-shadow: inset -5px 5px 0 rgba(0, 0, 0, 0.09);
          opacity: var(--crater-opacity);
          transition: opacity 5s ease;
        }
        .moon:before {
          width: 30px;
          height: 30px;
          top: 50px;
          left: 45px;
        }

        .moon:after {
          width: 40px;
          height: 40px;
          top: 100px;
          left: 30px;
        }

        .rain {
          position: absolute;
          z-index: 5;
          opacity: var(--rain-opacity);
          transition: opacity 5s ease;
        }

        .rain:before {
          content: "";
          position: absolute;
          width: 450px;
          height: 450px;
          background: #fff;
          opacity: 0;
          animation: lighting 3s linear infinite;
        }

        .dropOne,
        .dropTwo,
        .dropThree,
        .dropFour,
        .dropFive {
          position: absolute;
          background-color: rgba(211, 211, 211, 0.3);
          height: 10px;
          width: 1px;
          top: 0;
          box-shadow: 0 -270px rgba(211, 211, 211, 0.3),
            -50px -50px rgba(211, 211, 211, 0.3), -50px -150px rgba(211, 211, 211, 0.3),
            50px -395px rgba(211, 211, 211, 0.3), 50px -200px rgba(211, 211, 211, 0.3),
            50px -100px rgba(211, 211, 211, 0.3), 100px -400px rgba(211, 211, 211, 0.3),
            100px -320px rgba(211, 211, 211, 0.3), 100px -150px rgba(211, 211, 211, 0.3),
            150px -200px rgba(211, 211, 211, 0.3), 200px -100px rgba(211, 211, 211, 0.3),
            200px -370px rgba(211, 211, 211, 0.3), 250px -330px rgba(211, 211, 211, 0.3),
            250px -220px rgba(211, 211, 211, 0.3), 300px -70px rgba(211, 211, 211, 0.3),
            300px -140px rgba(211, 211, 211, 0.3), 300px -300px rgba(211, 211, 211, 0.3);
        }

        .dropOne {
          animation: rainAnim 1.5s linear infinite;
          left: 100px;
        }

        .dropTwo {
          left: -50px;
          animation: rainAnim 1.2s linear infinite;
        }

        .dropThree {
          left: 50px;
          animation: rainAnim 1.7s linear infinite;
        }

        .dropFour {
          left: 150px;
          animation: rainAnim 1.4s linear infinite;
        }

        .dropFive {
          left: 80px;
          animation: rainAnim 1.3s linear infinite;
        }

        @keyframes rainAnim {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(1000px);
          }
        }

        @keyframes lighting {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 0;
          }
          11% {
            opacity: 1;
          }
          14% {
            opacity: 0;
          }
          20% {
            opacity: 0;
          }
          21% {
            opacity: 1;
          }
          24% {
            opacity: 0;
          }
          104% {
            opacity: 0;
          }
        }
      `}</style>
      <div className="spooky-house">
        <div className="content-circle">
          <div className="house">
            <div className="porch"></div>
            <div className="first-floor"></div>
            <div className="second-floor"></div>
            <div className="roof"></div>
            <div className="door"></div>
            <div className="small-windows"></div>
            <div className="big-window"></div>
            <div className="frames"></div>
          </div>
          <div className="moon"></div>
          <div className="rain">
            <div className="dropOne"></div>
            <div className="dropTwo"></div>
            <div className="dropThree"></div>
            <div className="dropFour"></div>
            <div className="dropFive"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  
  const selectedMafiaCount = state.settings?.mafiaCount || 'auto';
  const selectedSheriffMode = state.settings?.sheriffMode || 'auto';

  const requestedMafiaCount = selectedMafiaCount === 'auto'
    ? (state.players.length >= 8 ? 2 : 1)
    : Number(selectedMafiaCount) || 1;
  const resolvedMafiaCount = Math.max(1, Math.min(requestedMafiaCount, Math.max(1, state.players.length - 2 || 1)));
  const sheriffWanted = selectedSheriffMode === 'always'
    || (selectedSheriffMode === 'auto' && state.players.length >= 8);
  const hasSheriff = sheriffWanted && (2 + resolvedMafiaCount < state.players.length);
  const baseRoles = 2 + resolvedMafiaCount + (hasSheriff ? 1 : 0);
  const civilians = Math.max(state.players.length - baseRoles, 0);

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

  useEffect(() => {
    setCardViewed(false);
    setVoteSelected(false);
  }, [state.phase]);

  const renderBackground = () => {
    if (state.phase === 'splash') return null; 
    
    if (state.phase === 'lobby' || state.phase === 'role_reveal') {
      return (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-auto">
          <Galaxy 
            mouseRepulsion={true}
            mouseInteraction={true}
            density={1}
            glowIntensity={0.3}
            saturation={0}
            hueShift={140}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.5}
            speed={1}
          />
        </div>
      );
    }
    
    return (
      <>
        <CinematicSky gamePhase={state.phase} />
        <SpookyHouse phase={state.phase} />
      </>
    );
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
        className="absolute top-4 left-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-90 z-50 p-3 bg-[#0a0a0a]/80 backdrop-blur-md rounded-lg border border-slate-800 shadow-xl pointer-events-auto"
      >
        <span>◀</span> LOBBY
      </button>
    );
  };

  const renderPlayerList = (onSelect, includeSkip = false, disableCondition = () => false) => (
    <div className="w-full max-w-sm space-y-2 mt-6 max-h-[50vh] overflow-y-auto pr-2 relative z-10 pointer-events-auto">
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

  if (state.phase === 'lobby') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 overflow-hidden pointer-events-none">
        {renderBackground()}

        <button
          onClick={() => setShowSettings((prev) => !prev)}
          aria-label="Toggle settings"
          className="absolute top-4 left-4 z-50 w-12 h-12 rounded-xl border border-cyan-300/40 bg-[#02060a]/80 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all hover:border-cyan-200/70 hover:bg-[#07111a]/85 pointer-events-auto"
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
            <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.9 1.9 0 0 1-2.7 2.7l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.9 1.9 0 0 1-2.7-2.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.9 1.9 0 0 1 2.7 2.7l-.1.1a1 1 0 0 0 1.1.2h0a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9h0a1 1 0 0 0 1.1-.2l.1-.1a1.9 1.9 0 0 1 2.7 2.7l-.1.1a1 1 0 0 0-.2 1.1v0a1 1 0 0 0 .9.6h.2a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
          </svg>
        </button>
        
        <h1 className="text-5xl md:text-6xl font-black uppercase mb-10 tracking-[0.2em] mt-14 relative z-10 shine-text text-center pointer-events-none">
          THE MAFIA
        </h1>

        {showSettings && (
          <div className="w-full max-w-sm mb-8 p-4 rounded-2xl border border-cyan-300/30 bg-[#02060a]/85 backdrop-blur-lg relative z-10 shadow-xl pointer-events-auto">
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
        
        <div className="w-full mb-10 flex justify-center relative z-10 pointer-events-auto">
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

        {availableRecentNames.length > 0 && (
          <div className="w-full mb-6 relative z-10 pointer-events-auto">
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

        <div className="w-full space-y-2 mb-10 max-h-[300px] overflow-y-auto px-2 relative z-10 pointer-events-auto">
          {state.players.map((p) => (
            <div key={p.id} className="flex justify-between items-center py-4 px-6 bg-[#010201]/80 backdrop-blur-md border border-[#40c9ff]/30 rounded-2xl shadow-sm transition-all">
              <span className="font-bold tracking-widest text-white">{p.name}</span>
              <button onClick={() => state.removePlayer(p.id)} className="text-rose-500 font-bold active:scale-90 flex items-center justify-center w-6 h-6">✕</button>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm flex items-center justify-between bg-[#010201]/80 backdrop-blur-md border border-[#40c9ff]/30 p-4 rounded-xl mb-10 relative z-10 pointer-events-auto">
          <span className="font-bold text-[10px] tracking-widest uppercase text-slate-400">Reveal Roles on Death?</span>
          <button 
            onClick={state.toggleRevealRoles} 
            className={`px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest transition-colors ${state.settings?.revealRoles ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-[#222] text-slate-500 border border-slate-700'}`}
          >
            {state.settings?.revealRoles ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="w-full flex justify-center relative z-10 mb-6 pointer-events-auto">
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

  if (state.phase === 'role_reveal') {
    const currentPlayer = state.players[state.revealIndex];
    const isLastPlayer = state.revealIndex === state.players.length - 1;

    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-2 relative z-10 pointer-events-none">Pass phone to</p>
        <h2 className="text-4xl font-black text-white uppercase mb-8 drop-shadow-md relative z-10 pointer-events-none">{currentPlayer.name}</h2>
        
        <div 
          onMouseDown={() => setIsFlipped(true)}
          onMouseUp={() => { setIsFlipped(false); setCardViewed(true); }}
          onMouseLeave={() => setIsFlipped(false)}
          onTouchStart={() => setIsFlipped(true)}
          onTouchEnd={() => { setIsFlipped(false); setCardViewed(true); }}
          className="cursor-pointer relative z-10 pointer-events-auto"
        >
          <RoleCard isFlipped={isFlipped} role={currentPlayer.role} />
        </div>

        {!cardViewed && (
          <p className="mt-12 text-slate-400 font-bold text-sm relative z-10 animate-pulse pointer-events-none">👆 Tap the card to view your role</p>
        )}

        <button 
          onClick={() => { setIsFlipped(false); setCardViewed(false); state.nextRoleReveal(); }}
          disabled={!cardViewed} 
          className={`mt-12 p-5 w-full max-w-sm rounded-xl font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${!cardViewed ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0 bg-[#0a0a0a]/90 backdrop-blur-md text-white border border-slate-800 active:scale-95 pointer-events-auto'}`}
        >
          {isLastPlayer ? 'Give to Moderator' : 'Next Player'}
        </button>
      </div>
    );
  }

  if (state.phase === 'night_transition') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
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

  if (state.phase === 'night_mafia') {
    const disableCondition = (p) => p.role === 'Mafia';
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-red-500 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🌙 Moderator: Ask the Mafia to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)] tracking-[0.1em] pointer-events-none">Who does the Mafia kill?</h3>
        {renderPlayerList((id) => state.submitNightAction('Mafia', id), true, disableCondition)}
      </div>
    );
  }

  if (state.phase === 'night_doctor') {
    const disableCondition = (p) => p.id === state.doctorLastSaved || (p.role === 'Doctor' && state.doctorHasSelfSaved);
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-green-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🌙 Moderator: Ask the Doctor to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] tracking-[0.1em] pointer-events-none">Who does the Doctor save?</h3>
        {renderPlayerList((id) => state.submitNightAction('Doctor', id), true, disableCondition)}
      </div>
    );
  }

  if (state.phase === 'night_detective') {
    if (state.investigationResult) {
      const isDeadRole = state.investigationResult === 'DEAD_ROLE';
      const isMafia = state.investigationResult === 'MAFIA';
      return (
        <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden pointer-events-none">
          {renderBackground()}
          {renderBackButton()}
          <p className="text-slate-300 uppercase font-bold tracking-widest text-[11px] mb-6 relative z-10 pointer-events-none">
            {isDeadRole ? "🔍 Moderator: Pretend to give an answer!" : "🔍 Moderator: Nod or shake your head."}
          </p>
          <h1 className={`text-6xl md:text-7xl font-black uppercase relative z-10 pointer-events-none ${isDeadRole ? 'text-slate-500 drop-shadow-[0_0_20px_rgba(107,114,128,0.5)]' : isMafia ? 'text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.7)]' : 'text-green-400 drop-shadow-[0_0_30px_rgba(34,197,94,0.7)]'}`}>
            {isDeadRole ? 'ROLE DEAD' : state.investigationResult}
          </h1>
          <button 
            onClick={state.advanceFromDetective}
            className="mt-12 p-5 w-full max-w-sm bg-[#0a0a0a]/90 backdrop-blur-md rounded-xl font-black tracking-widest uppercase active:scale-95 relative z-10 border border-slate-700 hover:border-slate-500 transition-colors shadow-lg pointer-events-auto"
          >
            Continue →
          </button>
        </div>
      );
    }
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-blue-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🔍 Moderator: Ask the Detective to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)] tracking-[0.1em] pointer-events-none">Who is investigated?</h3>
        {renderPlayerList((id) => state.submitNightAction('Detective', id), false)}
      </div>
    );
  }

  if (state.phase === 'night_sheriff') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-purple-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">⚔️ Moderator: Ask the Sheriff to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] tracking-[0.1em] pointer-events-none">Who does the Sheriff execute?</h3>
        {renderPlayerList((id) => state.submitNightAction('Sheriff', id), true)}
      </div>
    );
  }

  if (state.phase === 'day_transition') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
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

  if (state.phase === 'day_recap' || state.phase === 'day_recap_post_vote') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-4xl md:text-5xl font-black uppercase mb-12 text-white tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] mt-14 relative z-10 animate-in fade-in duration-1000 pointer-events-none">The Town Awakens</h2>
        <div className="w-full max-w-2xl space-y-4 relative z-10 pointer-events-none">
          {state.dayRecap.map((msg, i) => (
            <div 
              key={i} 
              className="p-6 bg-slate-900/50 backdrop-blur-md rounded-xl text-lg font-bold border-l-4 border-amber-400 shadow-xl animate-in fade-in duration-1000 transition-colors pointer-events-auto hover:bg-slate-900/70"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <span className="text-amber-300">▸ </span>{msg}
            </div>
          ))}
        </div>
        <button 
          onClick={state.phase === 'day_recap' ? state.startVoting : state.advanceToNight}
          className="mt-12 p-5 w-full max-w-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 rounded-xl font-black tracking-widest uppercase active:scale-95 transition-transform shadow-xl relative z-10 hover:shadow-[0_0_30px_rgba(255,193,7,0.5)] pointer-events-auto"
        >
          {state.phase === 'day_recap' ? '→ Begin Voting' : '→ Go To Sleep (Next Night)'}
        </button>
      </div>
    );
  }

  if (state.phase === 'day_voting') {
    const currentVoter = alivePlayers[state.votingState.currentVoterIndex];
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-slate-300 font-bold uppercase tracking-widest text-[12px] mt-14 mb-3 relative z-10 drop-shadow-md pointer-events-none">⚖️ Town Voting Phase</h2>
        <h3 className="text-5xl md:text-6xl font-black text-amber-300 my-4 uppercase relative z-10 drop-shadow-[0_0_20px_rgba(255,193,7,0.5)] pointer-events-none">{currentVoter.name}</h3>
        <p className="text-lg font-bold text-red-400 tracking-widest uppercase relative z-10 drop-shadow-md pointer-events-none">Who do you exile?</p>
        
        <div className="w-full max-w-sm mt-10 space-y-3 max-h-[50vh] overflow-y-auto pr-2 relative z-10 pointer-events-auto">
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
          <p className="mt-8 text-slate-400 font-bold text-sm relative z-10 animate-pulse pointer-events-none">👉 Select a vote first, then you can pass</p>
        )}
        <p className="mt-10 text-slate-400 font-bold text-[11px] uppercase tracking-wider relative z-10 bg-slate-900/40 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700/50 pointer-events-none">
          Vote {state.votingState.currentVoterIndex + 1} of {alivePlayers.length}
        </p>
      </div>
    );
  }

  if (state.phase === 'gameover') {
    const isMafiaWin = state.winner === 'Mafia';
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center pointer-events-none">
          <h1 className={`text-6xl md:text-7xl font-black uppercase mb-2 mt-14 ${isMafiaWin ? 'text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]' : 'text-blue-400 drop-shadow-[0_0_40px_rgba(96,165,250,0.8)]'}`}>
            {state.winner} WIN!
          </h1>
          <p className={`text-sm tracking-[0.2em] font-bold ${isMafiaWin ? 'text-red-400' : 'text-blue-300'}`}>
            {isMafiaWin ? '🔴 THE MAFIA HAS TAKEN OVER THE TOWN' : '✓ THE TOWN HAS ELIMINATED THE THREAT'}
          </p>
        </div>
        
        <div className="w-full max-w-2xl mt-12 text-left bg-gradient-to-b from-slate-900/60 to-slate-950/60 backdrop-blur-md p-8 rounded-2xl border border-slate-700/50 relative z-10 shadow-2xl pointer-events-auto">
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

        <div className="w-full flex justify-center mt-14 mb-6 relative z-10 pointer-events-auto">
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