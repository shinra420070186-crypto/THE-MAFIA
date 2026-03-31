import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from './store';

const TRANSITION_MS = 5000;
const BEST_GRAPHICS_PROFILE = 'ultra';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  const normalized = clean.length === 3
    ? clean.split('').map((ch) => ch + ch).join('')
    : clean;
  const num = parseInt(normalized, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

const lerp = (a, b, t) => a + (b - a) * t;

const BODY_PATH = {
  dayX: 78,
  dayY: 18,
  horizonY: 108,
  moonX: 24,
  moonY: 20,
};

const GRAPHICS_PROFILES = {
  low: {
    skyFilter: 'saturate(0.95) contrast(1.02)',
    cloudBlend: false,
    haze: false,
    starsDensity: 0.7,
    starsSize: 180,
    sunShadowBoost: 0.72,
    moonShadowBoost: 0.78,
    textureOpacityBoost: 0.7,
    backdropBlur: 'blur(0px)'
  },
  high: {
    skyFilter: 'saturate(1.08) contrast(1.06)',
    cloudBlend: true,
    haze: true,
    starsDensity: 1,
    starsSize: 140,
    sunShadowBoost: 1,
    moonShadowBoost: 1,
    textureOpacityBoost: 1,
    backdropBlur: 'blur(0px)'
  },
  ultra: {
    skyFilter: 'saturate(1.16) contrast(1.1)',
    cloudBlend: true,
    haze: true,
    starsDensity: 1.15,
    starsSize: 120,
    sunShadowBoost: 1.2,
    moonShadowBoost: 1.16,
    textureOpacityBoost: 1.08,
    backdropBlur: 'blur(0px)'
  }
};

const lerpColor = (fromHex, toHex, t) => {
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  return {
    r: Math.round(lerp(from.r, to.r, t)),
    g: Math.round(lerp(from.g, to.g, t)),
    b: Math.round(lerp(from.b, to.b, t)),
  };
};

const interpolateFrame = (left, right, localT) => {
  const result = {};
  Object.keys(left).forEach((key) => {
    if (key === 't') return;
    if (typeof left[key] === 'string' && left[key].startsWith('#')) {
      result[key] = lerpColor(left[key], right[key], localT);
      return;
    }
    result[key] = lerp(left[key], right[key], localT);
  });
  return result;
};

const pickFrame = (timeline, t) => {
  if (t <= timeline[0].t) return timeline[0];
  if (t >= timeline[timeline.length - 1].t) return timeline[timeline.length - 1];

  for (let i = 0; i < timeline.length - 1; i += 1) {
    const left = timeline[i];
    const right = timeline[i + 1];
    if (t >= left.t && t <= right.t) {
      const span = right.t - left.t;
      const localT = span === 0 ? 0 : (t - left.t) / span;
      return interpolateFrame(left, right, localT);
    }
  }

  return timeline[timeline.length - 1];
};

const DAY_TO_NIGHT_TIMELINE = [
  {
    t: 0,
    skyTop: '#66a4f4',
    skyMid: '#91cbff',
    skyBottom: '#f4d9a8',
    cloudTint: '#ffffff',
    cloudOpacity: 0.32,
    sunColor: '#ffe3a6',
    sunX: BODY_PATH.dayX,
    sunY: BODY_PATH.dayY,
    sunSize: 90,
    sunGlow: 126,
    sunOpacity: 1,
    moonColor: '#e9eefb',
    moonX: BODY_PATH.moonX,
    moonY: BODY_PATH.horizonY,
    moonSize: 64,
    moonGlow: 22,
    moonOpacity: 0,
    starsOpacity: 0,
    warmHazeOpacity: 0.1,
    coolHazeOpacity: 0,
  },
  {
    t: 0.35,
    skyTop: '#4f78c6',
    skyMid: '#f5b06a',
    skyBottom: '#df7146',
    cloudTint: '#ffd9b2',
    cloudOpacity: 0.27,
    sunColor: '#ffbc6b',
    sunX: 73,
    sunY: 40,
    sunSize: 84,
    sunGlow: 142,
    sunOpacity: 1,
    moonColor: '#e4e8f6',
    moonX: BODY_PATH.moonX,
    moonY: 84,
    moonSize: 66,
    moonGlow: 24,
    moonOpacity: 0.14,
    starsOpacity: 0.09,
    warmHazeOpacity: 0.18,
    coolHazeOpacity: 0.05,
  },
  {
    t: 0.7,
    skyTop: '#20326c',
    skyMid: '#6a3f83',
    skyBottom: '#34253e',
    cloudTint: '#b6a5d3',
    cloudOpacity: 0.17,
    sunColor: '#ef7446',
    sunX: 68,
    sunY: 76,
    sunSize: 74,
    sunGlow: 82,
    sunOpacity: 0.58,
    moonColor: '#e9efff',
    moonX: BODY_PATH.moonX,
    moonY: 44,
    moonSize: 68,
    moonGlow: 30,
    moonOpacity: 0.68,
    starsOpacity: 0.56,
    warmHazeOpacity: 0.07,
    coolHazeOpacity: 0.16,
  },
  {
    t: 1,
    skyTop: '#090d1b',
    skyMid: '#101a35',
    skyBottom: '#06070d',
    cloudTint: '#9eaacc',
    cloudOpacity: 0.08,
    sunColor: '#502628',
    sunX: 64,
    sunY: BODY_PATH.horizonY,
    sunSize: 60,
    sunGlow: 30,
    sunOpacity: 0,
    moonColor: '#eff3ff',
    moonX: BODY_PATH.moonX,
    moonY: BODY_PATH.moonY,
    moonSize: 70,
    moonGlow: 36,
    moonOpacity: 1,
    starsOpacity: 1,
    warmHazeOpacity: 0,
    coolHazeOpacity: 0.14,
  },
];

const NIGHT_TO_DAY_TIMELINE = [
  {
    t: 0,
    skyTop: '#090d1b',
    skyMid: '#101a35',
    skyBottom: '#06070d',
    cloudTint: '#9eaacc',
    cloudOpacity: 0.08,
    sunColor: '#502628',
    sunX: 64,
    sunY: BODY_PATH.horizonY,
    sunSize: 60,
    sunGlow: 30,
    sunOpacity: 0,
    moonColor: '#eff3ff',
    moonX: BODY_PATH.moonX,
    moonY: BODY_PATH.moonY,
    moonSize: 70,
    moonGlow: 36,
    moonOpacity: 1,
    starsOpacity: 1,
    warmHazeOpacity: 0,
    coolHazeOpacity: 0.14,
  },
  {
    t: 0.33,
    skyTop: '#232f60',
    skyMid: '#65417f',
    skyBottom: '#65354d',
    cloudTint: '#c0b4ce',
    cloudOpacity: 0.16,
    sunColor: '#de6740',
    sunX: 68,
    sunY: 82,
    sunSize: 72,
    sunGlow: 80,
    sunOpacity: 0.5,
    moonColor: '#e8eefc',
    moonX: BODY_PATH.moonX,
    moonY: 46,
    moonSize: 68,
    moonGlow: 30,
    moonOpacity: 0.7,
    starsOpacity: 0.62,
    warmHazeOpacity: 0.06,
    coolHazeOpacity: 0.13,
  },
  {
    t: 0.68,
    skyTop: '#4e7ecf',
    skyMid: '#f7b36f',
    skyBottom: '#e18a5d',
    cloudTint: '#ffd8af',
    cloudOpacity: 0.25,
    sunColor: '#ffc777',
    sunX: 73,
    sunY: 43,
    sunSize: 84,
    sunGlow: 134,
    sunOpacity: 1,
    moonColor: '#d9e0f3',
    moonX: BODY_PATH.moonX,
    moonY: 82,
    moonSize: 66,
    moonGlow: 20,
    moonOpacity: 0.1,
    starsOpacity: 0.14,
    warmHazeOpacity: 0.19,
    coolHazeOpacity: 0.05,
  },
  {
    t: 1,
    skyTop: '#66a4f4',
    skyMid: '#91cbff',
    skyBottom: '#f4d9a8',
    cloudTint: '#ffffff',
    cloudOpacity: 0.32,
    sunColor: '#ffe3a6',
    sunX: BODY_PATH.dayX,
    sunY: BODY_PATH.dayY,
    sunSize: 90,
    sunGlow: 126,
    sunOpacity: 1,
    moonColor: '#d9dbe4',
    moonX: BODY_PATH.moonX,
    moonY: BODY_PATH.horizonY,
    moonSize: 64,
    moonGlow: 14,
    moonOpacity: 0,
    starsOpacity: 0,
    warmHazeOpacity: 0.1,
    coolHazeOpacity: 0,
  },
];

const toRgb = (color) => `rgb(${color.r}, ${color.g}, ${color.b})`;

const SkyTimelineTransition = ({ direction }) => {
  const skyRef = useRef(null);
  const sunRef = useRef(null);
  const moonRef = useRef(null);
  const starsRef = useRef(null);
  const cloudsRef = useRef(null);
  const warmHazeRef = useRef(null);
  const coolHazeRef = useRef(null);
  const timeline = direction === 'sunset' ? DAY_TO_NIGHT_TIMELINE : NIGHT_TO_DAY_TIMELINE;
  const profile = GRAPHICS_PROFILES[BEST_GRAPHICS_PROFILE];

  useEffect(() => {
    let rafId;
    const startedAt = performance.now();

    const applyFrame = (frame) => {
      if (skyRef.current) {
        skyRef.current.style.background = `linear-gradient(180deg, ${toRgb(frame.skyTop)} 0%, ${toRgb(frame.skyMid)} 56%, ${toRgb(frame.skyBottom)} 100%)`;
        skyRef.current.style.filter = profile.skyFilter;
      }

      if (sunRef.current) {
        sunRef.current.style.transform = `translate3d(${frame.sunX}vw, ${frame.sunY}vh, 0)`;
        sunRef.current.style.width = `${frame.sunSize}px`;
        sunRef.current.style.height = `${frame.sunSize}px`;
        sunRef.current.style.opacity = String(frame.sunOpacity);
        sunRef.current.style.backgroundColor = toRgb(frame.sunColor);
        sunRef.current.style.boxShadow = `0 0 ${Math.round(frame.sunGlow * profile.sunShadowBoost)}px ${Math.round(frame.sunGlow * 0.4 * profile.sunShadowBoost)}px rgba(${frame.sunColor.r}, ${frame.sunColor.g}, ${frame.sunColor.b}, 0.52)`;
      }

      if (moonRef.current) {
        moonRef.current.style.transform = `translate3d(${frame.moonX}vw, ${frame.moonY}vh, 0)`;
        moonRef.current.style.width = `${frame.moonSize}px`;
        moonRef.current.style.height = `${frame.moonSize}px`;
        moonRef.current.style.opacity = String(frame.moonOpacity);
        moonRef.current.style.backgroundColor = toRgb(frame.moonColor);
        moonRef.current.style.boxShadow = `0 0 ${Math.round(frame.moonGlow * profile.moonShadowBoost)}px ${Math.round(frame.moonGlow * 0.55 * profile.moonShadowBoost)}px rgba(210, 223, 255, 0.45)`;
      }

      if (starsRef.current) {
        starsRef.current.style.opacity = String(frame.starsOpacity * profile.starsDensity);
      }

      if (cloudsRef.current) {
        cloudsRef.current.style.opacity = String(frame.cloudOpacity * profile.textureOpacityBoost);
        cloudsRef.current.style.background = `radial-gradient(ellipse at 22% 24%, rgba(${frame.cloudTint.r}, ${frame.cloudTint.g}, ${frame.cloudTint.b}, 0.18) 0%, transparent 54%), radial-gradient(ellipse at 68% 33%, rgba(${frame.cloudTint.r}, ${frame.cloudTint.g}, ${frame.cloudTint.b}, 0.17) 0%, transparent 58%), radial-gradient(ellipse at 45% 58%, rgba(${frame.cloudTint.r}, ${frame.cloudTint.g}, ${frame.cloudTint.b}, 0.14) 0%, transparent 62%)`;
      }

      if (warmHazeRef.current) {
        warmHazeRef.current.style.opacity = profile.haze ? String(frame.warmHazeOpacity) : '0';
      }

      if (coolHazeRef.current) {
        coolHazeRef.current.style.opacity = profile.haze ? String(frame.coolHazeOpacity) : '0';
      }
    };

    const tick = (now) => {
      const p = clamp01((now - startedAt) / TRANSITION_MS);
      const frame = pickFrame(timeline, p);
      applyFrame(frame);

      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    applyFrame(timeline[0]);
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [timeline, profile]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div ref={skyRef} className="absolute inset-0" />
      <div
        ref={starsRef}
        className="absolute inset-0"
        style={{
          opacity: direction === 'sunset' ? 0 : 1,
          backgroundImage: 'radial-gradient(1px 1px at 10% 10%, #fff, transparent), radial-gradient(1px 1px at 30% 20%, #fff, transparent), radial-gradient(1px 1px at 50% 50%, #fff, transparent), radial-gradient(1px 1px at 70% 30%, #fff, transparent), radial-gradient(1px 1px at 90% 10%, #fff, transparent), radial-gradient(1.5px 1.5px at 20% 40%, #fff, transparent), radial-gradient(1.5px 1.5px at 60% 85%, #fff, transparent), radial-gradient(2px 2px at 40% 70%, #fff, transparent)',
          backgroundSize: `${profile.starsSize}px ${profile.starsSize}px`,
        }}
      />
      <div
        ref={cloudsRef}
        className="absolute inset-0"
        style={{
          opacity: 0.25,
          mixBlendMode: profile.cloudBlend ? 'soft-light' : 'normal',
        }}
      />
      <div
        ref={sunRef}
        className="absolute rounded-full"
        style={{
          transform: `translate3d(${BODY_PATH.dayX}vw, ${BODY_PATH.dayY}vh, 0)`,
          width: '90px',
          height: '90px',
          backgroundColor: '#ffe3a6',
          opacity: 1,
        }}
      />
      <div
        ref={moonRef}
        className="absolute rounded-full"
        style={{
          transform: `translate3d(${BODY_PATH.moonX}vw, ${BODY_PATH.horizonY}vh, 0)`,
          width: '64px',
          height: '64px',
          backgroundColor: '#eff3ff',
          opacity: 0,
        }}
      />
      <div
        ref={warmHazeRef}
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 52% 86%, rgba(255, 170, 104, 0.58) 0%, rgba(255, 120, 80, 0.18) 36%, transparent 72%)',
          mixBlendMode: 'screen',
          opacity: 0.12,
          backdropFilter: profile.backdropBlur,
        }}
      />
      <div
        ref={coolHazeRef}
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 48% 90%, rgba(130, 160, 255, 0.3) 0%, rgba(72, 98, 180, 0.14) 38%, transparent 70%)',
          mixBlendMode: 'screen',
          opacity: 0,
          backdropFilter: profile.backdropBlur,
        }}
      />
    </div>
  );
};

// ==============================================
// 1. EXACT NIGHT SKY BACKGROUND
// ==============================================
const MidnightSky = () => {
  const profile = GRAPHICS_PROFILES[BEST_GRAPHICS_PROFILE];
  const isLow = false;

  return (
  <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #090d1b 0%, #101a35 56%, #06070d 100%)', filter: profile.skyFilter }} />
    <div
      className="absolute inset-0 live-sky-night-haze"
      style={{
        background: 'radial-gradient(ellipse at 18% 36%, rgba(76, 105, 180, 0.22) 0%, transparent 54%), radial-gradient(ellipse at 72% 44%, rgba(63, 90, 165, 0.2) 0%, transparent 58%), radial-gradient(ellipse at 50% 82%, rgba(40, 64, 130, 0.15) 0%, transparent 60%)',
        mixBlendMode: 'screen',
        opacity: profile.haze ? 0.22 : 0,
      }}
    />
    <div
      className="absolute inset-0 live-sky-twinkle"
      style={{
        backgroundImage: 'radial-gradient(1px 1px at 10% 10%, #fff, transparent), radial-gradient(1px 1px at 30% 20%, #fff, transparent), radial-gradient(1px 1px at 50% 50%, #fff, transparent), radial-gradient(1px 1px at 70% 30%, #fff, transparent), radial-gradient(1px 1px at 90% 10%, #fff, transparent), radial-gradient(1.5px 1.5px at 20% 40%, #fff, transparent), radial-gradient(1.5px 1.5px at 60% 85%, #fff, transparent), radial-gradient(2px 2px at 40% 70%, #fff, transparent)',
        backgroundSize: `${profile.starsSize}px ${profile.starsSize}px`,
        opacity: 0.95 * profile.starsDensity,
      }}
    />
    {!isLow && (
      <div
        className="absolute inset-0 live-sky-twinkle"
        style={{
          backgroundImage: 'radial-gradient(1px 1px at 12% 76%, #fff, transparent), radial-gradient(1px 1px at 26% 52%, #fff, transparent), radial-gradient(1px 1px at 46% 16%, #fff, transparent), radial-gradient(1px 1px at 62% 68%, #fff, transparent), radial-gradient(1px 1px at 82% 42%, #fff, transparent), radial-gradient(1.5px 1.5px at 90% 78%, #fff, transparent)',
          backgroundSize: `${Math.round(profile.starsSize * 0.8)}px ${Math.round(profile.starsSize * 0.8)}px`,
          opacity: 0.45 * profile.starsDensity,
          animationDuration: '3.6s',
          animationDelay: '0.9s',
        }}
      />
    )}
    <div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse at 22% 24%, rgba(190, 204, 234, 0.12) 0%, transparent 56%), radial-gradient(ellipse at 68% 33%, rgba(178, 192, 223, 0.1) 0%, transparent 60%), radial-gradient(ellipse at 45% 58%, rgba(160, 174, 207, 0.08) 0%, transparent 64%)',
        mixBlendMode: profile.cloudBlend ? 'soft-light' : 'normal',
        opacity: 0.12 * profile.textureOpacityBoost,
      }}
    />
    <div
      className="absolute rounded-full live-sky-moon-drift"
      style={{
        transform: `translate3d(${BODY_PATH.moonX}vw, ${BODY_PATH.moonY}vh, 0)`,
        width: '70px',
        height: '70px',
        backgroundColor: '#eff3ff',
        boxShadow: '0 0 36px 18px rgba(210, 223, 255, 0.45)',
      }}
    />
    <div
      className="absolute rounded-full live-sky-aura-pulse"
      style={{
        transform: `translate3d(${BODY_PATH.moonX}vw, ${BODY_PATH.moonY}vh, 0)`,
        width: '155px',
        height: '155px',
        marginLeft: '-42px',
        marginTop: '-42px',
        background: 'radial-gradient(circle, rgba(189, 207, 255, 0.22) 0%, rgba(136, 162, 236, 0.08) 56%, transparent 78%)',
        opacity: isLow ? 0.6 : 1,
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(circle at 48% 90%, rgba(130, 160, 255, 0.3) 0%, rgba(72, 98, 180, 0.14) 38%, transparent 70%)',
        mixBlendMode: 'screen',
        opacity: profile.haze ? 0.14 : 0,
      }}
    />
  </div>
  );
};

// ==============================================
// 2. EXACT MORNING SKY BACKGROUND
// ==============================================
const MorningSky = () => {
  const profile = GRAPHICS_PROFILES[BEST_GRAPHICS_PROFILE];
  const isLow = false;

  return (
  <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #66a4f4 0%, #91cbff 56%, #f4d9a8 100%)', filter: profile.skyFilter }} />
    <div
      className="absolute inset-0 live-sky-cloud-drift-slow"
      style={{
        background: 'radial-gradient(ellipse at 12% 18%, rgba(255, 255, 255, 0.35) 0%, transparent 42%), radial-gradient(ellipse at 42% 28%, rgba(255, 255, 255, 0.28) 0%, transparent 45%), radial-gradient(ellipse at 76% 22%, rgba(255, 255, 255, 0.26) 0%, transparent 42%)',
        opacity: 0.36 * profile.textureOpacityBoost,
      }}
    />
    {!isLow && (
      <div
        className="absolute inset-0 live-sky-cloud-drift-fast"
        style={{
          background: 'radial-gradient(ellipse at 20% 52%, rgba(255, 242, 220, 0.22) 0%, transparent 48%), radial-gradient(ellipse at 62% 60%, rgba(255, 240, 214, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 88% 46%, rgba(255, 234, 204, 0.18) 0%, transparent 48%)',
          opacity: 0.3 * profile.textureOpacityBoost,
          mixBlendMode: 'screen',
        }}
      />
    )}
    <div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse at 22% 24%, rgba(255, 255, 255, 0.2) 0%, transparent 56%), radial-gradient(ellipse at 68% 33%, rgba(255, 255, 255, 0.19) 0%, transparent 60%), radial-gradient(ellipse at 45% 58%, rgba(255, 255, 255, 0.16) 0%, transparent 64%)',
        mixBlendMode: profile.cloudBlend ? 'soft-light' : 'normal',
        opacity: 0.32 * profile.textureOpacityBoost,
      }}
    />
    <div
      className="absolute rounded-full live-sky-aura-pulse"
      style={{
        transform: `translate3d(${BODY_PATH.dayX}vw, ${BODY_PATH.dayY}vh, 0)`,
        width: '180px',
        height: '180px',
        marginLeft: '-45px',
        marginTop: '-45px',
        background: 'radial-gradient(circle, rgba(255, 208, 132, 0.36) 0%, rgba(255, 173, 96, 0.08) 56%, transparent 76%)',
      }}
    />
    <div
      className="absolute rounded-full"
      style={{
        transform: `translate3d(${BODY_PATH.dayX}vw, ${BODY_PATH.dayY}vh, 0)`,
        width: '90px',
        height: '90px',
        backgroundColor: '#ffe3a6',
        boxShadow: '0 0 126px 50px rgba(255, 205, 133, 0.52)',
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(circle at 52% 86%, rgba(255, 170, 104, 0.58) 0%, rgba(255, 120, 80, 0.18) 36%, transparent 72%)',
        mixBlendMode: 'screen',
        opacity: profile.haze ? 0.1 : 0,
      }}
    />
    {!isLow && (
      <div
        className="absolute inset-0 live-sky-day-shimmer"
        style={{
          background: 'linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.12) 44%, transparent 68%)',
          mixBlendMode: 'screen',
          opacity: 0.2,
        }}
      />
    )}
  </div>
  );
};

// ==============================================
// 3A/3B. SYNCHRONIZED SUNSET/SUNRISE TIMELINE
// ==============================================
const SunsetSky = () => <SkyTimelineTransition direction="sunset" />;

const SunriseSky = () => <SkyTimelineTransition direction="sunrise" />;

// ==============================================
// 3C. INTERSTELLAR-STYLE SPACE SKY (LOBBY + FLIP CARD)
// ==============================================
const InterstellarSky = () => {
  const profile = GRAPHICS_PROFILES[BEST_GRAPHICS_PROFILE];
  const isLow = false;
  const isUltra = true;

  return (
  <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
    <div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(140% 110% at 50% 130%, #090d15 0%, #05070c 40%, #020305 72%, #000000 100%)',
        filter: profile.skyFilter,
      }}
    />

    <div
      className="absolute inset-0 interstellar-nebula-drift"
      style={{
        background: 'radial-gradient(ellipse at 18% 26%, rgba(108, 130, 168, 0.14) 0%, transparent 58%), radial-gradient(ellipse at 78% 20%, rgba(94, 112, 146, 0.1) 0%, transparent 62%), radial-gradient(ellipse at 44% 70%, rgba(86, 102, 136, 0.1) 0%, transparent 60%)',
        mixBlendMode: 'screen',
        opacity: 0.22,
      }}
    />

    <div
      className="absolute inset-0 interstellar-film-grain"
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 0.5px, transparent 0.5px)',
        backgroundSize: '3px 3px',
        mixBlendMode: 'soft-light',
        opacity: isLow ? 0.08 : 0.13,
      }}
    />

    <div
      className="absolute inset-0 interstellar-stars-near"
      style={{
        backgroundImage: 'radial-gradient(1.2px 1.2px at 12% 14%, #f5f9ff, transparent), radial-gradient(1.2px 1.2px at 28% 33%, #fffef8, transparent), radial-gradient(1.3px 1.3px at 45% 22%, #f7fbff, transparent), radial-gradient(1.2px 1.2px at 63% 41%, #e8f0ff, transparent), radial-gradient(1.3px 1.3px at 82% 27%, #fffaf0, transparent), radial-gradient(1.5px 1.5px at 73% 73%, #f9fbff, transparent), radial-gradient(1.2px 1.2px at 21% 74%, #f0f5ff, transparent), radial-gradient(1.7px 1.7px at 90% 58%, #ffffff, transparent)',
        backgroundSize: `${Math.round(profile.starsSize * 0.92)}px ${Math.round(profile.starsSize * 0.92)}px`,
        opacity: 0.78 * profile.starsDensity,
      }}
    />

    <div
      className="absolute inset-0 interstellar-stars-far"
      style={{
        backgroundImage: 'radial-gradient(1px 1px at 10% 52%, #f6f9ff, transparent), radial-gradient(1px 1px at 34% 66%, #fffaf5, transparent), radial-gradient(1px 1px at 52% 84%, #edf3ff, transparent), radial-gradient(1px 1px at 68% 12%, #fefefe, transparent), radial-gradient(1px 1px at 88% 38%, #e5eeff, transparent), radial-gradient(1.1px 1.1px at 56% 56%, #f8fbff, transparent)',
        backgroundSize: `${Math.round(profile.starsSize * 0.66)}px ${Math.round(profile.starsSize * 0.66)}px`,
        opacity: 0.38 * profile.starsDensity,
      }}
    />

    <div
      className="absolute inset-0 interstellar-dust-flow"
      style={{
        background: 'linear-gradient(112deg, transparent 12%, rgba(188, 204, 230, 0.05) 44%, rgba(148, 168, 198, 0.08) 54%, transparent 82%)',
        mixBlendMode: 'screen',
        opacity: isLow ? 0.08 : 0.16,
      }}
    />

    <div
      className="absolute"
      style={{
        top: '36%',
        left: '57%',
        width: '250px',
        height: '250px',
        marginLeft: '-125px',
        marginTop: '-125px',
        borderRadius: '9999px',
        background: 'radial-gradient(circle, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.92) 42%, rgba(0, 0, 0, 0.5) 66%, rgba(0, 0, 0, 0) 100%)',
        opacity: 0.7,
      }}
    />

    {!isLow && (
      <>
        <div
          className="absolute inset-0 interstellar-depth-drift"
          style={{
            background: 'radial-gradient(ellipse at 50% 104%, rgba(28, 40, 62, 0.35) 0%, rgba(12, 18, 32, 0.16) 42%, transparent 72%)',
            mixBlendMode: 'screen',
            opacity: 0.16,
          }}
        />

        <div
          className="absolute interstellar-lens-spin"
          style={{
            top: '36%',
            left: '57%',
            width: isUltra ? '330px' : '300px',
            height: isUltra ? '330px' : '300px',
            marginLeft: isUltra ? '-165px' : '-150px',
            marginTop: isUltra ? '-165px' : '-150px',
            borderRadius: '9999px',
            background: 'conic-gradient(from 0deg, rgba(185, 206, 235, 0.02), rgba(135, 163, 198, 0.1), rgba(68, 88, 120, 0.16), rgba(185, 206, 235, 0.02))',
            filter: 'blur(8px)',
            opacity: isUltra ? 0.45 : 0.34,
            mixBlendMode: 'screen',
          }}
        />

        {isUltra && <div className="interstellar-shooting interstellar-shooting-a" />}
      </>
    )}

    <div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(180% 130% at 50% 112%, transparent 22%, rgba(0, 0, 0, 0.46) 68%, rgba(0, 0, 0, 0.76) 100%)',
      }}
    />
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
  const [fadeIn, setFadeIn] = useState(true);
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

  // --- AUTOMATIC CINEMATIC TIMERS (5 seconds for full sunset/sunrise timeline) ---
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

  // --- BACKGROUND FADE EFFECT (skip for animated transitions) ---
  useEffect(() => {
    // Reset interaction states when phase changes
    setCardViewed(false);
    setVoteSelected(false);
    
    // Don't do fade-in/out for animated transitions - they have their own animations
    if (state.phase === 'night_transition' || state.phase === 'day_transition') {
      setFadeIn(true);
      return;
    }
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [state.phase]);

  // --- RESET VOTE SELECTION BETWEEN VOTERS ---
  useEffect(() => {
    setVoteSelected(false);
  }, [state.votingState.currentVoterIndex]);

  // Background Engine
  const renderBackground = () => {
    const BgComponent = (() => {
      if (state.phase === 'splash') return null; 
      if (state.phase === 'lobby' || state.phase === 'role_reveal') return <InterstellarSky />;
      if (state.phase === 'night_transition') return <SunsetSky />;
      if (state.phase === 'day_transition') return <SunriseSky />;
      if (state.phase.startsWith('day_')) return <MorningSky />;
      return <MidnightSky />; 
    })();

    return BgComponent ? (
      <div className={`absolute inset-0 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        {BgComponent}
      </div>
    ) : null;
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

  // --- LOBBY (MidnightSky + Poda Input + Stealth Button + Briefcase Lists) ---
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