import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from './store';
import Galaxy from './Galaxy';

// ─── CONSTANTS ───────────────────────────────────────
const TRANSITION_MS = 5000;
const TAU = Math.PI * 2;

// Anti-Glitch Helper for Mobile Taps
const tapSafeStyle = { 
  WebkitTapHighlightColor: 'rgba(0,0,0,0)', 
  WebkitTouchCallout: 'none', 
  userSelect: 'none', 
  outline: 'none' 
};

// ─── NATIVE ANIMATED SCROLL ITEM (ZERO DEPENDENCIES) ─
const AnimatedItem = ({ children, delay = 0, index }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Triggers scale/fade when 20% of the item enters the view
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.2 } 
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-index={index}
      style={{ 
        width: '100%',
        transition: `transform 0.25s ease-out ${delay}s, opacity 0.25s ease-out ${delay}s`,
        transform: inView ? 'scale(1)' : 'scale(0.8)',
        opacity: inView ? 1 : 0
      }}
    >
      {children}
    </div>
  );
};

// ─── PURE ISOLATED BACKGROUND LAYER (ZERO FLICKER) ───
const MemoizedGalaxy = React.memo(() => (
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
));

// ─── FULL SCREEN SPOOKY HOUSE BACKGROUND ─────────────
const FullScreenSpooky = ({ phase }) => {
  const isNight = phase.startsWith('night') || phase === 'night_transition';

  const [angles, setAngles] = useState({ sun: isNight ? 180 : 0, moon: isNight ? 0 : -180 });
  const prevIsNight = useRef(isNight);

  useEffect(() => {
    if (isNight !== prevIsNight.current) {
      setAngles(prev => ({
        sun: prev.sun + 180,
        moon: prev.moon + 180
      }));
      prevIsNight.current = isNight;
    }
  }, [isNight]);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{`
        /* ── SHARED RESET ── */
        .bg-root { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; }

        /* ══════════════════════════════════════
           NIGHT BACKGROUND  (haunted house party)
        ══════════════════════════════════════ */
        .night-bg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          display: flex; align-items: flex-end; justify-content: center; align-content: flex-end;
          background:
            linear-gradient(238deg, #000, #fff0, #fff0),
            linear-gradient(180deg, #000, #fff0, #fff0),
            radial-gradient(circle at 50% 100%, #005eff, #6d006d, #38005e);
          transition: opacity 5s ease-in-out;
        }
        .night-bg:after {
          content: "";
          position: fixed; width: 100%; height: 10vmin; z-index: -1; bottom: 0;
          background:
            radial-gradient(circle at calc(50% - 33vmin) calc(100% + 31vmin), #000000 40vmin, #fff0 calc(40vmin + 1px)),
            radial-gradient(circle at calc(50% + 33vmin) calc(100% + 30vmin), #000000 40vmin, #fff0 calc(40vmin + 1px)),
            radial-gradient(circle at 50% calc(100% + 43vmin), #000000 50vmin, #fff0 calc(50vmin + 1px));
          background-repeat: no-repeat;
        }

        /* night sky stars */
        .night-sky {
          background: linear-gradient(0deg, #673ab78a, #3c3c3c94);
          height: 100vh; z-index: -1; position: absolute; left: 0; width: 100vw;
        }
        .night-sky:after {
          content: ""; position: absolute; width: 100vw; height: 100vh; top: 0;
          background-image:
            radial-gradient(2px 2px at 20px 30px, #484341, transparent),
            radial-gradient(2px 2px at 43px 75px, #735454, transparent),
            radial-gradient(2px 1px at 54px 184px, #828282, transparent),
            radial-gradient(2px 2px at 93px 47px, #654b49, transparent),
            radial-gradient(1px 1px at 148px 87px, #3a1919, transparent),
            radial-gradient(2px 2px at 193px 137px, #a26662, transparent),
            radial-gradient(1px 2px at 210px 154px, #805241, transparent),
            radial-gradient(2px 2px at 243px 102px, #866356, transparent),
            radial-gradient(2px 1px at 264px 184px, #794937, transparent),
            radial-gradient(2px 2px at 293px 44px, #735454, transparent),
            radial-gradient(1px 1px at 223px 62px, #ad968e, transparent),
            radial-gradient(2px 2px at 249px 162px, #884228, transparent),
            radial-gradient(2px 2px at 73px 99px, #442e26, transparent),
            radial-gradient(1px 1px at 163px 42px, #403433, transparent),
            linear-gradient(180deg, #fff0 10%, #000000 25%, #111 50%, #222 75%, #111 100%);
          background-repeat: no-repeat, repeat;
          background-size: 333px 263px, 333px 163px, 333px 163px, 333px 163px,
            333px 163px, 333px 163px, 333px 163px, 333px 163px, 333px 163px, 333px 163px,
            333px 163px, 333px 163px, 333px 163px, 333px 163px, 100% 100%;
          opacity: 0.5; mix-blend-mode: color-burn;
        }

        /* night moon */
        .nh-moon {
          position: absolute; z-index: 2;
          width: 20vmin; height: 20vmin;
          left: 20vmin; top: 10vmin;
          border-radius: 100%;
          background: radial-gradient(circle at 50% 50%,#fdfdfd 0% 7vmin,#ffffff00 7.25vmin 100%),#fff;
          box-shadow: 0 0 8em 4em #6493a9, 0 0 20px 5px #fdfdfd;
        }
        .nh-moon:before {
          content: ""; background: radial-gradient(circle at 100% 60%,#ffffff00 0% 60%,#dddddd 75% 100%);
          width: 100%; height: 100%; position: absolute; top: 0; left: 0; border-radius: 100%;
        }
        .nh-moon:after {
          content: ""; background: radial-gradient(circle at 0% 40%,#efefef 0% 60%,#ededed 75% 100%);
          width: 4.5vmin; height: 4.5vmin; position: absolute;
          top: 20%; left: 20%; border-radius: 100%; filter: blur(2px);
        }

        /* night clouds */
        .nh-clouds { width: 100%; height: 40vmin; position: fixed; z-index: 2; top: 0; }
        .nh-clouds span {
          position: absolute; margin-left: -40vmin; width: 30vmin; height: 18vmin;
          background: #fff5; filter: blur(4vmin);
          border-radius: 70% 100% 93% 80% / 100% 69% 87% 82%;
          animation: nh-move-clouds 40s linear infinite;
        }
        @keyframes nh-move-clouds {
          0% { margin-left: -40vmin; }
          33% { transform: rotate(3deg); }
          66% { transform: rotate(4deg); }
          100% { margin-left: calc(100% + 40vmin); }
        }
        .nh-clouds span:before,.nh-clouds span:after {
          content: ""; left: -4vmin; position: absolute;
          width: 14vmin; height: 11vmin; background: #fff2; filter: blur(1vmin);
          border-radius: 70% 100% 93% 80% / 100% 69% 87% 82%;
          box-shadow: -4vmin 2vmin 1vmin 0 #fff9;
        }
        .nh-clouds span:after { content: ""; left: 24vmin; top: 10vmin; width: 12vmin; height: 10vmin; background: #fff2; filter: blur(1vmin); border-radius: 100% 69% 87% 82% / 70% 100% 93% 80%; }
        .nh-clouds span:nth-child(2) { transform: scale(0.7) rotate(170deg); animation-delay: -15s; animation-duration: 50s; height: 12vmin; width: 40vmin; }
        .nh-clouds span:nth-child(3) { transform: scale(0.6) rotate(180deg); animation-delay: -26s; animation-duration: 35s; }
        .nh-clouds span:nth-child(4) { transform: scale(1.1) rotate(-10deg); animation-delay: -33s; animation-duration: 65s; }

        /* haunted house content wrapper */
        .nh-content {
          width: 90vmin; height: 90vmin;
          position: relative; perspective: 100vmin; perspective-origin: top;
          bottom: 5vmin; flex-shrink: 0;
        }
        .nh-content * { position: absolute; transform-style: preserve-3d; }

        /* CSS variables for house */
        .nh-content {
          --nh-gray: #1a191a; --nh-black: #080708; --nh-dark: #443847;
          --nh-window: #ff8d00cf; --nh-house: #000000; --nh-bat: #070707;
          --nh-bounce: linear(0 0%, 0 2.27%, 0.02 4.53%, 0.04 6.8%, 0.06 9.07%, 0.1 11.33%, 0.14 13.6%, 0.25 18.15%, 0.39 22.7%, 0.56 27.25%, 0.77 31.8%, 1 36.35%, 0.89 40.9%, 0.85 43.18%, 0.81 45.45%, 0.79 47.72%, 0.77 50%, 0.75 52.27%, 0.75 54.55%, 0.75 56.82%, 0.77 59.1%, 0.79 61.38%, 0.81 63.65%, 0.85 65.93%, 0.89 68.2%, 1 72.7%, 0.97 74.98%, 0.95 77.25%, 0.94 79.53%, 0.94 81.8%, 0.94 84.08%, 0.95 86.35%, 0.97 88.63%, 1 90.9%, 0.99 93.18%, 0.98 95.45%, 0.99 97.73%, 1 100%);
        }

        .nh-level-0 { width:30vmin;height:25vmin;background:var(--nh-house);bottom:0;left:22vmin;transform:rotateX(82deg) skewX(5deg);z-index:1; }
        .nh-level-1 { width:16vmin;height:34vmin;background:var(--nh-house);bottom:3.75vmin;left:53vmin;transform:perspective(100vmin) rotateX(82deg) skewX(-10deg); }
        .nh-level-2 { width:19vmin;height:35vmin;background:var(--nh-house);bottom:31.5vmin;left:29vmin;transform:perspective(150vmin) rotateX(45deg) skewX(2deg) rotate(2deg);clip-path:polygon(0% 85%,0% 0%,100% 0%,100% 94%,48% 57%);z-index:1;box-shadow:0.25vmin -0.5vmin 0.5vmin 0 #fff3 inset,0.5vmin -0.5vmin 1.5vmin 0 #fff2 inset; }
        .nh-roof-0 { width:37vmin;height:23vmin;bottom:23.25vmin;left:18.75vmin;border:19vmin solid #0000;box-sizing:border-box;border-bottom:22vmin solid var(--nh-house);transform:skew(-8deg,-1deg) rotate(1.25deg);border-radius:0.5vmin; }
        .nh-roof-1 { background:radial-gradient(circle at -9vmin 1vmin,#fff0 18vmin,#fff3 calc(18vmin + 1px) 18vmin,#fff0 19vmin 100%),radial-gradient(circle at -9vmin 1vmin,#fff0 18vmin,var(--nh-house) calc(18vmin + 1px)),radial-gradient(circle at 24.5vmin -5vmin,#fff0 25vmin,var(--nh-house) calc(25vmin + 1px)),#0000;width:21vmin;height:17vmin;bottom:31.75vmin;left:52vmin;transform:skew(-8deg,-1deg) rotate(2deg);border-radius:0.5vmin;background-size:calc(50% - 1vmin) 100%,calc(50% - 1vmin) 100%,calc(50% + 1vmin) 100%;background-repeat:no-repeat;background-position:0 0,0 0,99% 0; }
        .nh-roof-2 { background:radial-gradient(circle at 34vmin -9vmin,#fff0 35vmin,var(--nh-house) calc(35vmin + 1px)),radial-gradient(circle at -18vmin 4vmin,#fff0 28vmin,#fff4 calc(28vmin + 1px),#fff0 28.75vmin),radial-gradient(circle at -18vmin 4vmin,#fff0 28vmin,var(--nh-house) calc(28vmin + 1px)),#0f00;width:34vmin;height:25vmin;bottom:63.9vmin;left:26vmin;transform:skew(-8deg,-1deg) rotate(1deg);border-radius:0.5vmin;background-size:calc(50% + 6.5vmin) 100%,calc(50% + 7vmin) 100%,calc(50% - 6.5vmin) 100%,calc(50% - 7vmin) 100%;background-repeat:no-repeat;background-position:99% 0,0 0,0 0; }

        .nh-door { background:linear-gradient(183deg,#fff0 7.5vmin,var(--nh-house) calc(7.5vmin + 1px) 8vmin,#fff0 calc(8vmin + 1px) 0),linear-gradient(94deg,var(--nh-house) 0.75vmin,#fff0 calc(0.75vmin + 1px)),linear-gradient(-94deg,var(--nh-house) 0.75vmin,#fff0 calc(0.75vmin + 1px)),linear-gradient(-5deg,var(--nh-house) 0.5vmin,#fff0 calc(0.5vmin + 1px)),linear-gradient(86deg,#fff0 3.5vmin,var(--nh-house) calc(3.5vmin + 1px) 4vmin,#fff0 calc(4vmin + 1px)),linear-gradient(95deg,#fff0 7vmin,var(--nh-house) calc(7vmin + 1px) 7.5vmin,#fff0 calc(7.5vmin + 1px)),linear-gradient(92deg,#fff0 10vmin,var(--nh-house) calc(10vmin + 1px) 10.5vmin,#fff0 calc(10.5vmin + 1px)),radial-gradient(circle at 50% 87%,#fff0 5.65vmin,var(--nh-house) calc(5.65vmin + 1px)),radial-gradient(circle at 46% 87%,#fff0 5.65vmin,var(--nh-house) calc(5.65vmin + 1px)),linear-gradient(38deg,#fff0 4.25vmin,var(--nh-house) calc(4.25vmin + 1px) 4.75vmin,#fff0 calc(4.75vmin + 1px)),linear-gradient(87deg,#fff0 1vmin,var(--nh-house) calc(1vmin + 1px)),linear-gradient(123deg,#fff0 5vmin,var(--nh-house) calc(5vmin + 1px) 5.5vmin,#fff0 calc(5.5vmin + 1px)),linear-gradient(150deg,#fff0 7vmin,var(--nh-house) calc(7vmin + 1px) 7.5vmin,#fff0 calc(7.5vmin + 1px)),linear-gradient(180deg,var(--nh-window),var(--nh-window)),#fff;width:13vmin;height:20vmin;bottom:1.5vmin;left:8vmin;transform:skew(2deg,-2deg);border-radius:100% 100% 0.5vmin 0.5vmin;background-repeat:no-repeat;background-size:100% 100%,100% 100%,100% 100%,100% 100%,100% 65%,100% 64%,100% 63%,105% 38%,105% 38%,60% 39%,11% 39%,58% 39%,56% 39%;background-position:0 0,0 0,0 0,0 0,0 100%,0 100%,0 100%,0 0,0 0,0 0,50% 0,100% 0,100% 0;perspective:10000vmin;perspective-origin:top; }

        .nh-window { width:8vmin;height:17vmin;background:linear-gradient(178deg,#fff0 0 12vmin,var(--nh-house) calc(12vmin + 1px) 12.4vmin,#fff0 calc(12.4vmin + 1px)),linear-gradient(183deg,#fff0 0 7vmin,var(--nh-house) calc(7vmin + 1px) 7.45vmin,#fff0 calc(7.45vmin + 1px)),linear-gradient(91deg,#fff0 0 3.65vmin,var(--nh-house) calc(3.65vmin + 1px) 4.1vmin,#fff0 calc(4.1vmin + 1px)),linear-gradient(180deg,var(--nh-window),var(--nh-window)),#fff;left:3.5vmin;top:8vmin;border-radius:4vmin 5vmin 0.1vmin 0.1vmin;overflow:hidden; }
        .nh-level-1 .nh-window { --nh-window:#ff9900cf; }
        .nh-level-2 .nh-window { --nh-window:#ff8100cf;transform:scale(0.75) rotateY(180deg) skewY(-2deg);top:1vmin;left:4.5vmin;border-radius:4vmin 5vmin 0.1vmin 0.1vmin;overflow:hidden;border-top:1px solid var(--nh-house); }
        .nh-roof-0 .nh-window { --nh-window:#084461e0;--nh-light:#111;border-radius:100%;height:7vmin;width:7vmin;background:linear-gradient(183deg,#fff0 0 3.25vmin,var(--nh-house) calc(3.25vmin + 1px) 3.65vmin,#fff0 calc(3.65vmin + 1px)),linear-gradient(91deg,#fff0 0 3.25vmin,var(--nh-house) calc(3.25vmin + 1px) 3.65vmin,#fff0 calc(3.65vmin + 1px)),linear-gradient(180deg,var(--nh-light),var(--nh-window));left:-3vmin; }

        .nh-balcony { width:12vmin;height:9vmin;background:linear-gradient(-101deg,#fff0 0 1.5vmin,var(--nh-house) calc(1.5vmin + 1px) 2.25vmin,#fff0 calc(2.25vmin + 1px)),linear-gradient(-98deg,#fff0 0 5.5vmin,var(--nh-house) calc(5.5vmin + 1px) 6.25vmin,#fff0 calc(6.25vmin + 1px)),linear-gradient(88deg,#fff0 0 4vmin,var(--nh-house) calc(4vmin + 1px) 4.75vmin,#fff0 calc(4.75vmin + 1px)),linear-gradient(85deg,#fff0 0 9vmin,var(--nh-house) calc(9vmin + 1px) 9.75vmin,#fff0 calc(9.75vmin + 1px)),linear-gradient(177deg,#fff0 1vmin,var(--nh-house) calc(1vmin + 1px) 2vmin,#fff0 calc(2vmin + 1px)),linear-gradient(183deg,#fff0 1vmin,var(--nh-house) calc(1vmin + 1px) 2vmin,#fff0 calc(2vmin + 1px));z-index:3;left:43vmin;top:34vmin;border-bottom:2vmin solid var(--nh-house);border-right:0.75vmin solid var(--nh-house);border-radius:0.25vmin;transform:skewX(-18deg) rotate(5deg);transition:transform 1s var(--nh-bounce) 0s;transform-origin:0 100%; }

        .nh-shining { width:28.75vmin;height:2vmin;left:-28.8vmin;top:0.015vmin;transform:rotate(-49.3deg);transform-origin:100% 0;border-radius:0 0 2.5vmin 500%;box-shadow:0.5vmin 0.5vmin 0.5vmin 0 #fff2 inset; }
        .nh-door + .nh-shining { transform:rotate(-90deg);filter:blur(2px);width:21.5vmin;left:-21.5vmin; }
        .nh-level-1 .nh-shining { transform:rotate(-91deg);filter:blur(4px); }
        .nh-level-2 .nh-shining { transform:rotate(-91deg);filter:blur(5px); }

        .nh-chimney { left:21vmin;top:8vmin;width:7vmin;height:12vmin; }
        .nh-chimney:after { content:"";position:absolute;border:1.5vmin solid #fff0;border-right:2vmin solid var(--nh-house);border-bottom:3vmin solid var(--nh-house);border-top:0;width:6vmin;height:6vmin;left:-4.75vmin;bottom:-1.85vmin;border-radius:5vmin 0vmin 6vmin; }

        .nh-smoke { background:#f000;width:30vmin;height:75vmin;top:-62vmin;z-index:-1;overflow:hidden;left:11vmin;clip-path:polygon(42% 100%,24% 91%,0% 80%,0% 0%,100% 0%,100% 80%,78% 90%,48.5% 100%); }
        .nh-smoke span { background:#fff2;width:5vmin;height:6vmin;border-radius:100%;bottom:-10vmin;filter:blur(1vmin);animation:nh-smoke-up 20s ease 0s infinite;left:10vmin; }
        .nh-smoke span:nth-child(2){animation-delay:0.75s;animation-duration:16s;}
        .nh-smoke span:nth-child(3){animation-delay:1.5s;animation-duration:12s;width:3vmin;height:4vmin;}
        .nh-smoke span:nth-child(4){animation-delay:2.25s;animation-duration:18s;}
        .nh-smoke span:nth-child(5){animation-delay:3.1s;animation-duration:21s;}
        .nh-smoke span:nth-child(6){animation-delay:3.85s;animation-duration:23s;}
        @keyframes nh-smoke-up { 0%{bottom:-10vmin;transform:scale(0.25);margin-left:1vmin;} 20%{transform:scale(0.5);} 100%{margin-left:5vmin;bottom:35vmin;transform:scale(4) rotate(1080deg);opacity:0;} }

        .nh-fence { background:radial-gradient(circle at 55% 32vmin,var(--nh-house) 16vmin,#fff0 calc(16vmin + 1px));width:22vmin;height:22vmin;bottom:0;z-index:-1; }
        .nh-fence:before { content:"";position:absolute;width:2vmin;height:18vmin;background:var(--nh-house);left:5vmin;top:5vmin;transform:skewY(30deg) rotate(-1deg);box-shadow:8vmin -5vmin 0 -0.25vmin var(--nh-house); }
        .nh-fence:after { content:"";position:absolute;width:1.75vmin;height:16vmin;background:var(--nh-house);left:10vmin;top:4vmin;transform:skewY(-20deg) rotate(1deg);box-shadow:5vmin 3vmin 0 0.1vmin var(--nh-house); }
        .nh-fence + .nh-fence { right:0; }
        .nh-fence + .nh-fence:before { left:4vmin;top:6vmin;height:12vmin;transform:skewY(30deg) rotate(-7deg);box-shadow:5vmin -2vmin 0 -0.25vmin var(--nh-house); }
        .nh-fence + .nh-fence:after { left:6.5vmin;top:7vmin;height:10vmin;transform:skewY(-23deg) rotate(-1deg);width:1.5vmin;box-shadow:5vmin 2vmin 0 -0.25vmin var(--nh-house),4.75vmin 3vmin 0 -0.25vmin var(--nh-house); }
        .nh-fence span { background:var(--nh-house);width:15vmin;height:1.85vmin;top:7vmin;left:3vmin;transform:skewX(15deg) rotate(-10deg); }
        .nh-fence span + span { width:15vmin;top:12.25vmin;left:2.5vmin;transform:rotate(-8deg) skewX(-18deg); }
        .nh-fence + .nh-fence span { width:11vmin;top:8vmin;transform:rotate(3deg) skewX(-4deg);height:2vmin;left:2.5vmin; }
        .nh-fence + .nh-fence span + span { top:12vmin;transform:rotate(-4deg) skewX(17deg);left:3.2vmin;width:10.2vmin; }

        .nh-pumpkin { width:8vmin;height:6vmin;right:9.15vmin;bottom:15.125vmin;display:flex;align-items:center;justify-content:center;transform:rotate(5deg);animation:nh-move-pumpkin 3s ease 0s 1; }
        .nh-pumpkin:before { content:"";position:absolute;border:0.51vmin solid var(--nh-house);width:0.75vmin;height:1vmin;top:-0.5vmin;left:calc(50% - 0.25vmin);border-right:0.25vmin solid #fff0;border-bottom-color:#fff0;border-top-width:0.25vmin;border-radius:0.75vmin; }
        @keyframes nh-move-pumpkin { 25%{transform:rotate(-9deg);}75%{transform:rotate(8deg);} }
        .nh-pumpkin span { width:2.5vmin;height:5.25vmin;background:var(--nh-house);border-radius:100%; }
        .nh-pumpkin span+span{height:5vmin;margin-left:2.25vmin;}
        .nh-pumpkin span+span+span{margin-left:-2.25vmin;}
        .nh-pumpkin span+span+span+span{height:4.5vmin;margin-left:4.5vmin;}
        .nh-pumpkin span+span+span+span+span{height:4.5vmin;margin-left:-4.5vmin;}

        .nh-flying-bat { position:absolute;width:15vmin;height:14vmin;bottom:27vmin;left:12vmin;z-index:1; }

        .nh-bat-cat { width:80vmin;height:40vmin;animation:nh-fly-move 1s ease 0s 1;z-index:2;transform:scale(0.2);left:18vmin;top:12vmin; }
        @keyframes nh-fly-move { 25%{transform:translateX(-0.5vmin) scale(0.2);}53%{margin-top:0.5vmin;}86%{margin-top:-0.5vmin;}75%{transform:translateX(0.5vmin) scale(0.2);} }
        .nh-bat-cat * { position:absolute;box-sizing:border-box; }
        .nh-bat-cat .nh-bc-body { width:20vmin;height:20vmin;background:var(--nh-black);border-radius:8vmin 100%;top:16.5vmin;left:30vmin;transform:rotate(45deg) skew(-5deg,-5deg);box-shadow:1vmin -0.15vmin 0 0 var(--nh-gray) inset;z-index:2;transition:all 1s ease 0s; }
        .nh-bat-cat .nh-bc-head { width:14vmin;height:13vmin;background:var(--nh-black);border-radius:90% 90% 100% 100%;top:7.25vmin;left:33vmin;box-shadow:1.2vmin 0.5vmin 0 0 inset var(--nh-gray);z-index:3; }
        .nh-bat-cat .nh-bc-head:before,.nh-bat-cat .nh-bc-head:after { content:"";position:absolute;width:3.75vmin;height:4.25vmin;background:radial-gradient(circle at 60% 50%,var(--nh-house) 1.15vmin,#fff0 calc(1.15vmin + 1px)),#fff;border-radius:100%;bottom:4vmin;left:2.15vmin;transform:rotate(-10deg);animation:nh-eye-blink 5s ease 0s infinite; }
        @keyframes nh-eye-blink { 0%,95%{max-height:4.25vmin;bottom:4vmin;}100%{max-height:0.25vmin;bottom:5vmin;} }
        .nh-bat-cat .nh-bc-head::after { transform:rotate(10deg) rotateY(180deg);left:8vmin; }
        .nh-bc-ears { width:18.25vmin;height:15vmin;left:31vmin;top:2vmin; }
        .nh-bc-ears:before,.nh-bc-ears:after { content:"";position:absolute;width:13vmin;height:13vmin;left:-2.1vmin;top:1.5vmin;background:var(--nh-black);border-radius:0.5vmin 100%;transform:skew(-5deg,-5deg) rotate(19deg);box-shadow:1.25vmin -0.2vmin 0 0 var(--nh-gray) inset; }
        .nh-bc-ears:after { left:7vmin;transform:rotate(69deg) skew(-5deg,-5deg);box-shadow:0.125vmin -1.5vmin 0 0 var(--nh-gray) inset; }
        .nh-bat-cat .nh-bc-tail { width:10vmin;height:11vmin;border-radius:1vmin 9vmin;left:25vmin;top:24vmin;transform:rotate(23deg);transform-origin:100% 100%;border:1vmin solid #fff0;border-bottom:1vmin solid var(--nh-black);border-left:1.55vmin solid var(--nh-black);z-index:1;animation:nh-tail-move 2s ease-in-out 0s infinite alternate;transition:all 0.4s ease 0.5s; }
        @keyframes nh-tail-move { 20%{transform:rotate(11deg);}72%{transform:rotate(7deg);} }
        .nh-bat-cat .nh-bc-wings { width:80vmin;height:40vmin;z-index:-1; }
        .nh-bat-cat .nh-bc-wing { background:#ffc10700;width:40vmin;height:23vmin;top:8vmin;transform-origin:90% 50%;opacity:1;animation:nh-stop-fly-right 1s linear 0s 1;animation-fill-mode:forwards; }
        .nh-bat-cat .nh-bc-wing + .nh-bc-wing { transform:rotateY(180deg);left:7vmin;animation:nh-stop-fly-left 1s linear 0s 1;animation-fill-mode:forwards; }
        @keyframes nh-stop-fly-right { 90%{opacity:1;}100%{transform:rotateZ(-90deg) scaleX(0.5) scaleY(0.75);opacity:0;} }
        @keyframes nh-stop-fly-left { 90%{opacity:1;}100%{transform:rotateY(180deg) rotateZ(-90deg) scaleX(0.5) scaleY(0.75);opacity:0;} }
        .nh-bc-leg { height:5vmin;background:var(--nh-black);box-shadow:0.75vmin 0 0 0 var(--nh-gray) inset;width:6vmin;border-radius:1vmin 1vmin 2.5vmin 2.5vmin;left:34vmin;top:32.5vmin;z-index:1;transform:rotate(5deg);transition:all 0.4s ease 0.25s; }
        .nh-bc-leg + .nh-bc-leg { border-radius:2vmin 1vmin;left:41vmin;transform:rotate(-5deg); }

        .nh-phantom { background:radial-gradient(circle at 60% 23%,#0e1d24 0.25vmin,#fff0 calc(0.25vmin + 1px)),radial-gradient(circle at 35% 25%,#0e1d24 0.25vmin,#fff0 calc(0.25vmin + 1px)),#ffffff10;width:3vmin;height:5vmin;border-radius:2vmin 2vmin 0 0;left:1vmin;top:1vmin;transform:skew(10deg,-10deg);clip-path:polygon(6% 90%,4% 66%,3% 56%,3% 48%,5% 35%,9% 22%,15% 13%,22% 8%,30% 4%,36% 3%,42% 3%,48% 4%,56% 6%,56% 8%,63% 9%,63% 9%,70% 13%,73% 17%,78% 24%,81% 28%,85% 36%,85% 38%,88% 44%,91% 51%,93% 62%,95% 74%,97% 88%,96% 89%,93% 88%,90% 87%,84% 88%,77% 90%,72% 91%,67% 93%,63% 92%,59% 92%,56% 91%,53% 90%,50% 91%,45% 94%,41% 96%,38% 96%,32% 96%,27% 94%,19% 96%,13% 97%,9% 98%,7% 99%,5% 98%,4% 96%,4% 96%,4% 93%);animation:nh-move-phantom 2s ease 0s infinite alternate; }
        @keyframes nh-move-phantom { 0%{left:0.5vmin;transform:skew(10deg,-10deg)}20%,60%,80%{transform:rotate(8deg) skew(10deg,-10deg);}0%,40%,70%{transform:rotate(-7deg) skew(10deg,-10deg);}45%{left:3.5vmin;}50%{bottom:-5vmin;}100%{left:0.5vmin;transform:skew(10deg,-10deg)} }
        .nh-phantom + .nh-phantom { transform:skew(-7deg,9deg) rotateY(180deg);animation-delay:-1s;animation-direction:reverse;animation-duration:2.1s;margin-top:-0.25vmin;width:3.5vmin;height:5.5vmin;animation:nh-move-phantom-2 2.03s ease -1s infinite alternate; }
        @keyframes nh-move-phantom-2 { 0%{left:0.5vmin;transform:skew(10deg,-10deg) rotateY(180deg);}20%,60%,80%{transform:rotate(8deg) skew(10deg,-10deg) rotateY(180deg);}0%,40%,70%{transform:rotate(-7deg) skew(10deg,-10deg) rotateY(180deg);}45%{left:3.5vmin;}50%{bottom:-5vmin;}100%{left:0.5vmin;transform:skew(10deg,-10deg) rotateY(180deg);} }

        .nh-witch { width:15vmin;height:18vmin;left:-9.5vmin;bottom:-0.15vmin;opacity:0.5;background:var(--nh-house);animation:nh-move-witch 4s ease 0s infinite alternate;box-sizing:border-box;clip-path:polygon(3% 55%,5% 55%,11% 55%,22% 56%,24% 57%,24% 55%,28% 56%,34% 53%,36% 51%,38% 48%,41% 42%,42% 41%,42% 38%,43% 36%,42% 36%,40% 38%,40% 38%,40% 36%,39% 33%,38% 33%,36% 33%,35% 34%,35% 33%,35% 32%,36% 30%,37% 29%,38% 27%,38% 26%,34% 23%,32% 21%,28% 17%,27% 14%,27% 12%,40% 20%,45% 17%,50% 14%,56% 10%,59% 8%,62% 8%,66% 8%,64% 9%,62% 10%,60% 13%,58% 15%,54% 18%,53% 18%,52% 24%,56% 25%,60% 27%,64% 27%,62% 28%,58% 29%,56% 30%,59% 32%,57% 31%,56% 33%,56% 32%,55% 33%,57% 33%,56% 33%,60% 36%,56% 36%,62% 37%,56% 38%,56% 40%,58% 42%,61% 45%,64% 48%,67% 52%,69% 54%,70% 56%,69% 58%,68% 59%,70% 60%,75% 60%,76% 57%,77% 56%,78% 55%,80% 56%,80% 56%,82% 57%,83% 56%,87% 56%,90% 56%,93% 56%,96% 55%,95% 56%,97% 57%,98% 60%,97% 64%,97% 67%,96% 70%,93% 69%,88% 68%,85% 67%,82% 66%,81% 66%,80% 67%,78% 66%,77% 66%,76% 66%,75% 65%,75% 63%,74% 62%,71% 61%,67% 60%,66% 61%,64% 61%,63% 62%,64% 65%,66% 67%,68% 70%,70% 72%,73% 73%,75% 75%,78% 77%,81% 78%,78% 79%,76% 80%,75% 82%,72% 81%,71% 82%,70% 82%,70% 82%,69% 81%,67% 81%,66% 79%,65% 79%,64% 78%,62% 78%,58% 78%,54% 78%,52% 77%,51% 77%,51% 77%,51% 78%,51% 79%,54% 82%,55% 84%,56% 86%,55% 86%,53% 87%,52% 89%,50% 90%,47% 92%,47% 92%,46% 91%,47% 91%,48% 90%,50% 89%,51% 87%,51% 84%,52% 84%,47% 78%,44% 75%,41% 73%,40% 79%,41% 83%,42% 85%,41% 85%,40% 84%,39% 85%,38% 86%,36% 88%,33% 89%,32% 89%,34% 87%,36% 86%,36% 84%,36% 83%,37% 82%,38% 80%,38% 74%,37% 70%,37% 68%,36% 67%,34% 66%,35% 64%,36% 62%,36% 59%,32% 59%,29% 58%,26% 59%,24% 58%,22% 57%,12% 56%,5% 56%,3% 55%); }
        @keyframes nh-move-witch { 0%{left:1.5vmin;}25%{bottom:-4vmin}50%{left:-5vmin;}75%{bottom:2vmin;}100%{left:1.5vmin;} }

        .nh-nosferatu { width:10vmin;height:12.5vmin;left:-4vmin;bottom:-0.15vmin;opacity:0.5;background:var(--nh-house);box-sizing:border-box;clip-path:polygon(75% 100%,69% 95%,66% 90%,62% 87%,60% 82%,58% 79%,57% 75%,57% 73%,58% 68%,59% 67%,59% 65%,59% 64%,59% 62%,60% 60%,60% 59%,61% 58%,61% 58%,61% 57%,62% 55.75%,67% 54.25%,70% 53.5%,73% 52%,75% 50.75%,77.5% 50%,78% 50%,79.5% 49%,79.5% 48.75%,82.5% 47.75%,83% 47.9%,84% 48%,86.25% 49%,88% 49.5%,90% 51%,89% 49%,88% 48%,86% 47%,84% 46%,83% 46%,83.5% 45.5%,85% 45.5%,88% 46%,89% 46.5%,90% 47%,91% 48%,91% 49%,91.5% 47%,91.5% 47%,91% 46%,89% 44.75%,86% 44%,83.5% 43.75%,83% 43.25%,84.15% 42.75%,86% 42.75%,89% 43.65%,90% 43.75%,91% 43.75%,92% 44.25%,92.5% 45%,92.5% 46.5%,93.5% 44%,92.75% 43%,90% 41.75%,88% 40.5%,85% 39.5%,84% 39.5%,82% 39.75%,81% 40%,80% 40%,79% 40.5%,78% 41%,77% 41.25%,76% 41.35%,74.5% 42.25%,72% 43%,69.5% 44%,70% 43%,70.5% 42%,71% 41%,71.75% 40%,72% 39%,71.75% 38%,71.5% 37%,72% 36%,72.2% 35%,72.5% 33%,73.25% 32%,74% 31%,74% 31%,75% 30%,76.5% 28.5%,78% 30%,78.5% 30.5%,79.2% 29%,79.5% 28%,79.6% 26%,79.25% 25%,79.1% 24%,80% 23%,80.2% 22%,80% 21%,81% 21%,81.35% 20.35%,80.95% 19.75%,80.5% 19.25%,80.4% 19%,80.5% 18.7%,80.65% 16%,80.5% 15%,79.75% 13%,78.75% 11%,78% 10%,76.75% 9%,74% 7%,73% 6.25%,71% 5.35%,69% 5%,68% 5%,67% 5.5%,66% 6%,65% 7%,64.75% 7.5%,64.5% 7.75%,64% 7.5%,63.25% 7.2%,62% 7%,61.25% 7.5%,60.5% 8%,59.5% 9%,58.5% 9.5%,57.5% 9.2%,56% 9.35%,55% 9.5%,52% 9%,50% 8.9%,47% 9%,44% 9.2%,42.5% 9.65%,41% 9.25%,40.5% 9.25%,39.5% 9.25%,38.5% 10%,36.5% 12%,35.25% 13%,34% 15%,33.75% 17%,33.25% 18%,32.5% 20%,30.5% 22%,29.5% 23%,27.25% 25%,27% 25.25%,25.75% 26%,24.7% 27%,23.8% 28%,23% 28.6%,22.25% 29.2%,20.7% 30.8%,20.1% 31.5%,20% 32%,19% 33%,18% 35%,17.25% 36%,17% 37%,17% 41%,18% 46%,18% 49%,18% 50%,18% 51%,19% 57%,19% 53%,19% 55%,18.7% 57%,18.6% 59%,19% 61%,19% 62%,19.5% 65%,19.7% 68%,19.6% 70%,19.5% 71%,18% 73%,17% 74%,15% 75%,14% 76%,12% 77%,11% 78%,10% 79%,9% 80%,8% 81%,7% 83%,7% 84.5%,8.3% 83%,9.3% 82%,10.75% 81%,12.2% 80%,14% 79%,15% 78%,17% 77.2%,18% 77.25%,17.5% 78%,16.5% 79%,15.25% 80%,14.5% 81%,13.5% 82%,13% 83%,12.25% 84%,11.7% 85%,11% 86%,11% 86%,9.27% 88%,9% 89%,9% 90%,10% 89%,11.55% 88%,12.5% 87%,13.5% 86%,15.3% 84%,16% 83%,18% 81%,20% 80%,19.75% 81%,19.5% 81.25%,19% 82%,18% 84%,16.7% 86%,15.7% 87%,15% 88%,15% 89%,16% 88%,18% 87%,19% 86%,20% 84%,21% 83.25%,22% 82%,22% 82%,23% 81%,26% 76%,29% 69%,30% 61%,29% 57%,29% 56%,29% 54%,28.75% 51%,29% 48%,28.8% 46%,29% 44%,29.6% 43.5%,30% 41.5%,29% 43%,31% 41%,32% 40%,32.8% 39.25%,34.5% 38.75%,33.25% 45%,33% 49%,32% 53%,31.8% 55%,30.2% 59%,29% 68%,27% 74%,25% 80%,22.65% 85%,19.85% 91%,19.5% 93%,18.25% 96%,16.75% 100%);animation:nh-move-nosferatu 10s linear(0 0%,0 1.8%,0.01 3.6%,0.03 6.35%,0.07 9.1%,0.13 11.4%,0.19 13.4%,0.27 15%,0.34 16.1%,0.54 18.35%,0.66 20.6%,0.72 22.4%,0.77 24.6%,0.81 27.3%,0.85 30.4%,0.88 35.1%,0.92 40.6%,0.94 47.2%,0.96 55%,0.98 64%,0.99 74.4%,1 86.4%,1 100%) 0s infinite; }
        @keyframes nh-move-nosferatu { 0%{left:-4vmin;}45%{left:1.75vmin;}50%{bottom:0;}100%{left:-4vmin;} }

        .nh-zombie-hand { width:5vmin;height:8vmin;left:12.75vmin;bottom:-2vmin;clip-path:polygon(24% 99%,30% 77%,32% 69%,33% 66%,34% 60%,32% 56%,27% 54%,25% 52%,22% 44%,22% 39%,21% 37%,16% 36%,15% 38%,11% 38%,6% 36%,5% 34%,7% 32%,10% 32%,12% 31%,14% 31%,16% 32%,20% 32%,25% 33%,28% 33%,29% 32%,30% 30%,28% 28%,25% 27%,23% 27%,20% 27%,17% 27%,16% 26%,17% 24%,18% 22%,19% 20%,24% 20%,28% 21%,33% 22%,35% 24%,36% 27%,38% 28%,42% 26%,42% 24%,41% 21%,38% 20%,33% 17%,31% 16%,28% 16%,26% 15%,27% 12%,29% 11%,33% 12%,36% 12%,37% 13%,39% 13%,42% 15%,45% 17%,48% 19%,49% 20%,50% 23%,53% 25%,53% 23%,53% 21%,52% 18%,52% 16%,52% 14%,48% 12%,46% 9%,44% 6%,45% 5%,48% 4%,49% 4%,52% 5%,54% 7%,58% 9%,59% 10%,60% 11%,61% 13%,63% 17%,64% 18%,66% 19%,67% 21%,67% 23%,67% 25%,66% 29%,66% 32%,68% 34%,68% 35%,70% 37%,72% 37%,74% 34%,76% 33%,77% 32%,76% 31%,76% 30%,77% 27%,81% 23%,85% 21%,88% 21%,92% 21%,93% 21%,94% 21%,94% 22%,92% 24%,92% 25%,91% 27%,90% 28%,92% 29%,92% 30%,93% 31%,94% 33%,94% 34%,91% 35%,89% 36%,88% 38%,85% 39%,84% 42%,84% 43%,83% 45%,80% 47%,75% 48%,72% 50%,68% 53%,66% 56%,64% 61%,64% 65%,63% 69%,64% 73%,64% 76%,66% 99%);background:var(--nh-house);transform-origin:75% 100%;transform:rotate(10deg);transition:bottom 1s ease 0s; }
        .nh-tomb { width:7vmin;height:8vmin;left:6.5vmin;bottom:5.75vmin;background:var(--nh-house);clip-path:polygon(50% 0%,84% 15%,100% 100%,0% 100%,15% 15%);transform:rotateX(12deg) skew(-11deg,20deg);text-align:center;color:#3a1752;padding-top:2vmin;font-family:serif;font-weight:bold;font-size:1.75vmin;z-index:1; }

        .nh-skeleton-floating { width:8vmin;height:20vmin;bottom:0vmin;left:5vmin;z-index:3; }
        .nh-skeleton { --nh-bone:var(--nh-house);opacity:0.965;width:32vmin;height:60vmin;position:absolute;z-index:1;display:flex;justify-content:center;transform:scale(0.375);left:-7vmin;bottom:-19.5vmin;animation:nh-floating-down 2s cubic-bezier(0.46,0.03,0.52,0.96) 0s 1; }
        @keyframes nh-move-frankenstein { 0%{left:-6.5vmin;}20%,60%,80%{transform:rotate(5deg)}0%,40%,70%{transform:rotate(-5deg)}45%{left:-5.5vmin;}50%{bottom:-5vmin;}100%{left:-6.5vmin;} }
        .nh-skeleton * { animation-play-state:paused !important; }
        @keyframes nh-floating-down { 0%{margin-bottom:0vmin;margin-left:0vmin}25%{margin-bottom:2vmin;}33%{margin-left:-3vmin;}66%{margin-left:1vmin;}75%{margin-bottom:1vmin;}100%{margin-bottom:0vmin;margin-left:0vmin;} }
        .nh-skeleton div { position:absolute; }
        .nh-sk-head { width:13vmin;height:17vmin;top:4.25vmin;animation:nh-swinging-right 0.55s ease-in-out 0s infinite alternate;transform-origin:50% 75%; }
        @keyframes nh-swinging-left { 0%{transform:rotate(-5deg);}100%{transform:rotate(5deg);} }
        @keyframes nh-swinging-right { 0%{transform:rotateY(180deg) rotate(5deg);}100%{transform:rotateY(180deg) rotate(-5deg);} }
        .nh-cranium { width:12vmin;height:13vmin;left:0.5vmin;top:0.25vmin;border-radius:6vmin 6vmin 4.5vmin 4.5vmin;background:radial-gradient(circle at 50% 74%,#fff0 9vmin,#fff6 100%),conic-gradient(from -24deg at 100% 75%,var(--nh-bone) 0 45deg,#fff0 0 100%),conic-gradient(from -24deg at 0% 75%,var(--nh-bone) 0 45deg,#fff0 0 100%),conic-gradient(from -24deg at 50% 75%,var(--nh-bone) 0 45deg,#fff0 0 100%),linear-gradient(180deg,var(--nh-bone) 0 59%,#fff0 0 90%,var(--nh-bone) 0 100%),radial-gradient(circle at 75% 73%,#fff0 0 1.75vmin,var(--nh-bone) calc(1.75vmin + 1px) 3vmin,#fff0 0 100%),radial-gradient(circle at 25% 73%,#fff0 0 1.75vmin,var(--nh-bone) calc(1.75vmin + 1px) 3vmin,#fff0 0 100%); }
        .nh-sk-neck { width:4vmin;height:3vmin;top:20vmin;margin-left:-0.25vmin; }
        .nh-sk-torso { width:10vmin;height:16vmin;top:21.5vmin;margin-left:-0.25vmin;z-index:2; }
        .nh-sk-arms { width:28vmin;height:18vmin;top:22.5vmin;z-index:2; }
        .nh-sk-arm { width:3.4vmin;height:20vmin;transform:rotate(3deg);left:7.25vmin;top:-0.5vmin;transform-origin:50% 1vmin;animation:nh-swinging-left 0.55s ease-in-out 0s infinite alternate; }
        .nh-sk-arm + .nh-sk-arm { transform:rotateY(180deg) rotate(3deg);left:17.25vmin;animation:nh-swinging-right 0.55s ease-in-out 0s infinite alternate;transform-origin:55% 1vmin; }
        .nh-sk-legs { width:15vmin;height:21vmin;top:37.5vmin;z-index:-1;margin-left:-0.2vmin; }
        .nh-sk-leg { width:4.25vmin;height:19vmin;transform:rotate(3deg);left:2.65vmin;top:-1vmin;border-radius:1px 1px 30% 40%;transform-origin:50% 1vmin;animation:nh-swinging-left 0.55s ease-in-out 0s infinite alternate; }
        .nh-sk-leg + .nh-sk-leg { transform:rotateY(180deg) rotate(3deg);left:8vmin;animation:nh-swinging-right 0.55s ease-in-out 0s infinite alternate;transform-origin:55% 1vmin; }

        .nh-electricity { width:50vmin;height:52vmin;bottom:0;left:-5vmin;z-index:-2; }
        .nh-pole { background:var(--nh-house);width:1.75vmin;height:60vmin;left:1vmin;bottom:-2vmin;transform:skew(-2deg,25deg) rotate(3deg);border-radius:0.25vmin; }

        /* ══════════════════════════════════════
           DAY BACKGROUND
        ══════════════════════════════════════ */
        .day-bg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          transition: opacity 5s ease-in-out;
          overflow: hidden;
        }
        /* Sky gradient — blue day sky */
        .day-sky {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, #1a6bb5 0%, #5ba4e5 40%, #87ceeb 70%, #b8e4f9 100%);
        }
        /* Day ground */
        .day-ground {
          position: absolute; bottom: 0; left: -5%; width: 110%; height: 22%;
          background: linear-gradient(180deg, #2d5a1b 0%, #1a3a0a 100%);
          border-radius: 50% 50% 0 0 / 20px 20px 0 0;
          z-index: 5;
        }
        /* Sun arc pivot — same mechanic as original */
        .day-sun-pivot {
          position: absolute; bottom: 0; left: 50%; width: 0; height: 0; z-index: 3;
          transition: transform 5s ease-in-out;
          transform: rotate(calc(var(--day-sun-angle) * 1deg));
        }
        .day-sun-body {
          position: absolute;
          left: -40px; top: calc(-1 * var(--day-arc-radius));
          width: 80px; height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, #fffde7 0%, #FFD700 40%, #FFA500 100%);
          box-shadow: 0 0 40px 20px rgba(255,215,0,0.5), 0 0 80px 40px rgba(255,165,0,0.2);
          transform: rotate(calc(var(--day-sun-angle) * -1deg));
          transition: transform 5s ease-in-out;
        }
        @media (max-width: 768px) {
          :root { --day-arc-radius: 70vh; }
          .day-sun-body { width: 55px; height: 55px; left: -27px; }
        }
        /* Sun rays */
        .day-sun-rays {
          position: absolute; left: -40px; top: calc(-1 * var(--day-arc-radius));
          width: 80px; height: 80px;
          transform: rotate(calc(var(--day-sun-angle) * -1deg));
          transition: transform 5s ease-in-out;
          animation: day-spin-rays 20s linear infinite;
        }
        @keyframes day-spin-rays { 100% { transform: rotate(calc(var(--day-sun-angle) * -1deg + 360deg)); } }
        .day-sun-rays:before {
          content: "";
          position: absolute;
          inset: -25px;
          background: repeating-conic-gradient(rgba(255,215,0,0.3) 0deg 10deg, transparent 10deg 30deg);
          border-radius: 50%;
        }
        /* Day clouds */
        .day-cloud {
          position: absolute;
          background: rgba(255,255,255,0.9);
          border-radius: 50%;
          filter: blur(3px);
        }
        .day-cloud-1 { width: 120px; height: 45px; top: 12%; animation: day-cloud-drift 35s linear infinite; left: -150px; }
        .day-cloud-2 { width: 90px; height: 35px; top: 20%; animation: day-cloud-drift 50s linear infinite; left: -120px; animation-delay: -18s; }
        .day-cloud-3 { width: 150px; height: 50px; top: 8%; animation: day-cloud-drift 42s linear infinite; left: -180px; animation-delay: -30s; }
        .day-cloud-4 { width: 80px; height: 30px; top: 25%; animation: day-cloud-drift 28s linear infinite; left: -100px; animation-delay: -10s; }
        @keyframes day-cloud-drift { 0%{left:-200px;} 100%{left:calc(100vw + 200px);} }
        /* cloud puffs */
        .day-cloud:before,.day-cloud:after { content:"";position:absolute;background:rgba(255,255,255,0.95);border-radius:50%;filter:blur(2px); }
        .day-cloud-1:before { width:70px;height:60px;top:-25px;left:20px; }
        .day-cloud-1:after { width:55px;height:50px;top:-20px;left:55px; }
        .day-cloud-2:before { width:55px;height:50px;top:-20px;left:15px; }
        .day-cloud-2:after { width:40px;height:40px;top:-15px;left:45px; }
        .day-cloud-3:before { width:90px;height:70px;top:-30px;left:25px; }
        .day-cloud-3:after { width:70px;height:60px;top:-25px;left:65px; }
        .day-cloud-4:before { width:50px;height:45px;top:-18px;left:12px; }
        .day-cloud-4:after { width:40px;height:35px;top:-14px;left:40px; }

        /* Day house — same spooky silhouette but slightly more visible */
        .day-house-wrap {
          position: absolute; bottom: 20%; left: 50%;
          transform: translateX(-50%) scale(1.6);
          z-index: 6;
        }
        @media (max-width: 768px) { .day-house-wrap { transform: translateX(-50%) scale(1.1); bottom: 21%; } }
        .day-house { position: relative; width: 120px; height: 150px; background-color: #1a1a1a; transform: rotate(5deg); }
        .day-house:before { content:"";position:absolute;width:0;height:0;border-bottom:30px solid #1a1a1a;border-right:50px solid transparent;left:115px;top:70px;transform:rotate(5deg); }
        .day-house:after { content:"";position:absolute;width:5px;height:65px;background-color:#1a1a1a;left:145px;top:95px; }
        .day-porch { position:absolute;width:30px;height:100px;background-color:#1a1a1a;left:-20px;top:55px;transform:rotate(-10deg); }
        .day-porch:before { content:"";position:absolute;width:0;height:0;border-bottom:20px solid #1a1a1a;border-left:40px solid transparent;left:-35px;top:45px; }
        .day-porch:after { content:"";position:absolute;width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-bottom:30px solid #1a1a1a;left:-5px;top:-25px; }
        .day-first-floor { position:absolute;transform:rotate(-10deg);background-color:#1a1a1a;width:5px;height:45px;left:-37px;top:125px; }
        .day-first-floor:before { content:"";position:absolute;background-color:#1a1a1a;width:85px;height:90px;top:-150px;left:50px; }
        .day-first-floor:after { content:"";position:absolute;border-left:52px solid transparent;border-right:52px solid transparent;border-bottom:50px solid #1a1a1a;top:-199px;left:40px; }
        .day-second-floor { position:absolute;background-color:#1a1a1a;width:35px;height:100px;transform:rotate(3deg);top:-70px;left:70px; }
        .day-second-floor:before { content:"";position:absolute;background-color:#1a1a1a;width:20px;height:100px;left:33px;top:40px;transform:rotate(-3deg); }
        .day-second-floor:after { content:"";position:absolute;width:0;height:0;border-left:25px solid transparent;border-right:25px solid transparent;border-bottom:30px solid #1a1a1a;top:12px;left:15px; }
        .day-roof { position:absolute;width:0;height:0;border-left:25px solid transparent;border-right:25px solid transparent;border-bottom:30px solid #1a1a1a;left:65px;top:-95px; }
        .day-door { position:absolute;background-color:#111;width:30px;height:50px;transform:rotate(-5deg);border-radius:30px 30px 0 0;top:90px;left:40px; }
        .day-big-window { position:absolute;background-color:#333;border-radius:30px 30px 0 0;transform:rotate(-7deg);width:30px;height:40px;top:-35px;left:10px; }
        /* birds in the day sky */
        .day-bird { position:absolute;z-index:4;animation:day-bird-fly linear infinite; }
        .day-bird:before,.day-bird:after { content:"";position:absolute;width:12px;height:6px;border-top:2px solid rgba(30,30,30,0.7);border-radius:50% 50% 0 0;border-right:2px solid rgba(30,30,30,0.7); }
        .day-bird:after { left:10px;transform:scaleX(-1); }
        .day-bird-1 { top:15%;left:-50px;animation-duration:18s;animation-delay:-5s; }
        .day-bird-2 { top:22%;left:-50px;animation-duration:24s;animation-delay:-12s;transform:scale(0.7); }
        .day-bird-3 { top:10%;left:-50px;animation-duration:15s;animation-delay:-8s;transform:scale(0.85); }
        @keyframes day-bird-fly { 0%{left:-60px;}100%{left:calc(100vw + 60px);} }
        /* Day mood ambient glow at bottom */
        .day-ambient { position:absolute;bottom:15%;left:0;right:0;height:30%;background:radial-gradient(ellipse at 50% 100%,rgba(255,200,50,0.15) 0%,transparent 70%);z-index:4;pointer-events:none; }
      `}</style>

      {/* ── NIGHT LAYER ── */}
      <div className="night-bg" style={{ opacity: isNight ? 1 : 0, transition: 'opacity 5s ease-in-out', pointerEvents: 'none' }}>
        <div className="night-sky"></div>
        <div className="nh-clouds">
          <span></span><span></span><span></span><span></span>
        </div>
        <div className="nh-moon"></div>
        <div className="nh-content">
          <div className="nh-level-0">
            <div className="nh-door"></div>
            <div className="nh-nosferatu"></div>
            <div className="nh-shining"></div>
          </div>
          <div className="nh-level-1">
            <div className="nh-window">
              <div className="nh-frankenstein" style={{width:'20vmin',height:'20vmin',left:'-6.5vmin',bottom:'-6.25vmin',opacity:0.5,background:'var(--nh-house)',boxSizing:'border-box',animation:'nh-move-frankenstein 8s ease 0s infinite alternate',transformOrigin:'50% 100%',clipPath:'polygon(29% 87%,31% 82%,32% 82%,38% 85%,39% 83%,41% 81%,42% 79%,46% 76%,49% 68%,49% 64%,50% 59%,51% 57%,52% 55%,52% 52%,50% 51%,49% 51%,51% 48%,52% 45%,53% 42%,54% 39%,54% 38%,53% 37%,52% 38%,51% 40%,50% 40%,48% 39%,46% 37%,45% 38%,44% 38%,43% 38%,41% 42%,40% 42%,40% 40%,41% 38%,40% 39%,38% 40%,37% 42%,36% 41%,36% 41%,35% 40%,34% 40%,35% 38%,38% 36%,40% 35%,43% 34%,43% 33%,45% 33%,47% 32%,47% 31%,46% 30%,43% 30%,39% 30%,37% 30%,37% 32%,36% 30%,36% 28%,34% 27%,31% 27%,30% 27%,28% 28%,25% 27%,24% 27%,24% 26%,23% 25%,22% 25%,22% 24%,23% 23%,22% 22%,24% 22%,26% 23%,28% 23%,30% 23%,33% 24%,35% 24%,36% 23%,37% 23%,40% 23%,45% 23%,50% 23%,53% 23%,54% 21%,55% 21%,56% 21%,58% 21%,60% 21%,60% 19%,62% 19%,62% 17%,60% 17%,59% 17%,58% 16%,58% 15%,59% 14%,58% 13%,59% 12%,59% 11%,58% 11%,57% 11%,57% 10%,58% 9%,59% 8%,59% 7%,58% 7%,58% 6%,59% 5%,59% 1%,60% 0%,61% 0%,63% 0%,64% 1%,65% 1%,66% 1%,67% 2%,68% 1%,69% 3%,70% 2%,71% 3%,72% 3%,73% 4%,72% 5%,72% 8%,72% 10%,70% 12%,71% 14%,69% 14%,69% 15%,70% 16%,69% 16%,68% 16%,69% 17%,69% 18%,70% 19%,72% 20%,73% 21%,74% 23%,74% 24%,74% 27%,74% 31%,74% 34%,73% 38%,73% 42%,73% 45%,73% 47%,73% 49%,73% 50%,73% 51%,73% 53%,73% 54%,74% 56%,72% 57%,71% 57%,71% 58%,70% 61%,70% 63%,70% 64%,71% 66%,71% 68%,71% 70%,70% 71%,71% 74%,72% 77%,73% 81%,75% 86%,76% 88%,76% 89%,77% 90%,77% 91%,77% 93%,76% 93%,76% 97%,72% 98%,66% 99%,60% 100%,59% 98%,59% 95%,60% 94%,62% 93%,64% 93%,65% 92%,64% 90%,64% 87%,64% 84%,63% 82%,62% 80%,61% 76%,60% 73%,58% 73%,55% 78%,52% 84%,52% 86%,51% 88%,49% 89%,48% 90%,46% 94%,44% 96%,43% 96%,42% 96%,37% 93%,31% 90%,29% 88%)'}}></div>
            </div>
            <div className="nh-shining"></div>
          </div>
          <div className="nh-level-2">
            <div className="nh-window">
              <div className="nh-witch"></div>
            </div>
            <div className="nh-shining"></div>
          </div>
          <div className="nh-balcony"></div>
          <div className="nh-bat-cat">
            <div className="nh-bc-body"></div>
            <div className="nh-bc-leg"></div>
            <div className="nh-bc-leg"></div>
            <div className="nh-bc-head"></div>
            <div className="nh-bc-ears"></div>
            <div className="nh-bat-cat nh-bc-tail" style={{position:'absolute'}}></div>
            <div className="nh-bc-wings">
              <div className="nh-bc-wing"></div>
              <div className="nh-bc-wing"></div>
            </div>
          </div>
          <div className="nh-roof-0">
            <div className="nh-roof-0-win" style={{position:'absolute',borderRadius:'100%',height:'7vmin',width:'7vmin',background:'linear-gradient(183deg,#fff0 0 3.25vmin,#000000 calc(3.25vmin + 1px) 3.65vmin,#fff0 calc(3.65vmin + 1px)),linear-gradient(91deg,#fff0 0 3.25vmin,#000000 calc(3.25vmin + 1px) 3.65vmin,#fff0 calc(3.65vmin + 1px)),linear-gradient(180deg,#111,#084461e0)',left:'-3vmin'}}>
              <div className="nh-phantom"></div>
              <div className="nh-phantom"></div>
            </div>
            <div className="nh-shining"></div>
          </div>
          <div className="nh-roof-1"></div>
          <div className="nh-roof-2">
            <div className="nh-chimney">
              <div className="nh-smoke">
                <span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <div className="nh-flying-bat"></div>
          <div className="nh-fence">
            <span></span><span></span>
            <div className="nh-bat-fence" style={{position:'absolute',width:'15vmin',height:'12vmin',bottom:'30vmin',left:'13.25vmin'}}></div>
            <div className="nh-chimney-fence" style={{position:'absolute',left:'24.5vmin',top:'-19.65vmin',width:'6vmin',height:'12vmin',zIndex:-1}}></div>
          </div>
          <div className="nh-fence">
            <span></span><span></span>
            <div className="nh-tomb">RIP</div>
            <div className="nh-zombie-hand"></div>
          </div>
          <div className="nh-skeleton-floating"></div>
          <div className="nh-skeleton">
            <div className="nh-sk-head">
              <div className="nh-cranium"></div>
            </div>
            <div className="nh-sk-neck" style={{background:'var(--nh-house)',width:'4vmin',height:'3vmin'}}></div>
            <div className="nh-sk-torso" style={{background:'var(--nh-house)'}}></div>
            <div className="nh-sk-arms">
              <div className="nh-sk-arm" style={{background:'var(--nh-house)'}}></div>
              <div className="nh-sk-arm" style={{background:'var(--nh-house)'}}></div>
            </div>
            <div className="nh-sk-legs">
              <div className="nh-sk-leg" style={{background:'var(--nh-house)'}}></div>
              <div className="nh-sk-leg" style={{background:'var(--nh-house)'}}></div>
            </div>
          </div>
          <div className="nh-electricity">
            <div className="nh-pole"></div>
          </div>
          <div className="nh-pumpkin">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>

      {/* ── DAY LAYER ── */}
      <div
        className="day-bg"
        style={{
          opacity: isNight ? 0 : 1,
          transition: 'opacity 5s ease-in-out',
          pointerEvents: 'none',
          '--day-sun-angle': angles.sun,
          '--day-arc-radius': '80vh',
        }}
      >
        <div className="day-sky"></div>
        {/* Sun arc — same pivot mechanic as original */}
        <div className="day-sun-pivot">
          <div className="day-sun-rays"></div>
          <div className="day-sun-body"></div>
        </div>
        {/* Clouds */}
        <div className="day-cloud day-cloud-1"></div>
        <div className="day-cloud day-cloud-2"></div>
        <div className="day-cloud day-cloud-3"></div>
        <div className="day-cloud day-cloud-4"></div>
        {/* Birds */}
        <div className="day-bird day-bird-1"></div>
        <div className="day-bird day-bird-2"></div>
        <div className="day-bird day-bird-3"></div>
        {/* Ambient glow */}
        <div className="day-ambient"></div>
        {/* Same spooky house silhouette */}
        <div className="day-house-wrap">
          <div className="day-house">
            <div className="day-porch"></div>
            <div className="day-first-floor"></div>
            <div className="day-second-floor"></div>
            <div className="day-roof"></div>
            <div className="day-door"></div>
            <div className="day-big-window"></div>
          </div>
        </div>
        <div className="day-ground"></div>
      </div>
    </div>
  );
};

// ─── IMAGE PRELOADER & CARD COMPONENTS ───────────────
const roleImages = { 'Mafia': '/mafia-card.jpg', 'Doctor': '/doctor-card.jpg', 'Detective': '/detective-card.jpg', 'Sheriff': '/sheriff-card.jpg', 'Civilian': '/civilian-card.jpg' };
const glowColors = { 'Mafia': '#ff003c', 'Doctor': '#00ff75', 'Detective': '#00d2ff', 'Sheriff': '#f2994a', 'Civilian': '#8e44ad' };

const ImagePreloader = () => (
  <div className="hidden">{Object.values(roleImages).map((src, index) => <img key={index} src={src} alt="preload" fetchpriority="high" />)}</div>
);

const RoleCard = ({ isFlipped, role }) => {
  return (
    <div className="my-6 relative w-[240px] h-[360px] [perspective:1000px] select-none touch-none" style={tapSafeStyle}>
      <div className="relative w-full h-full transition-transform duration-[600ms] [transform-style:preserve-3d]" style={{ transform: isFlipped ? 'rotateY(180deg) translateZ(0)' : 'rotateY(0deg) translateZ(0)' }}>
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-[2rem] bg-[#0a0a0a] border border-slate-800 flex flex-col items-center justify-center p-4 shadow-xl">
           <p className="text-slate-500 font-black tracking-widest uppercase text-center text-xl">Secret Role</p>
           <p className="text-[10px] text-slate-600 mt-4 tracking-widest uppercase font-bold animate-pulse">Tap & Hold to Reveal</p>
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-[2rem] bg-black" style={{ transform: 'rotateY(180deg)', backgroundImage: `url(${roleImages[role] || roleImages.Civilian})`, backgroundPosition: 'center', backgroundSize: '105%', backgroundRepeat: 'no-repeat', boxShadow: isFlipped ? `0px 0px 50px 10px ${glowColors[role] || glowColors.Civilian}40` : 'none' }}></div>
      </div>
    </div>
  );
};

// ─── MAIN GAMEBOARD COMPONENT ────────────────────────
export default function GameBoard() {
  const state = useGameStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardViewed, setCardViewed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const alivePlayers = state.players.filter(p => p.isAlive);
  const availableRecentNames = state.recentNames.filter(n => !state.players.some(p => p.name === n));
  
  const selectedMafiaCount = state.settings?.mafiaCount || 'auto';
  const selectedSheriffMode = state.settings?.sheriffMode || 'auto';
  const requestedMafiaCount = selectedMafiaCount === 'auto' ? (state.players.length >= 8 ? 2 : 1) : Number(selectedMafiaCount) || 1;
  const resolvedMafiaCount = Math.max(1, Math.min(requestedMafiaCount, Math.max(1, state.players.length - 2 || 1)));
  const sheriffWanted = selectedSheriffMode === 'always' || (selectedSheriffMode === 'auto' && state.players.length >= 8);
  const hasSheriff = sheriffWanted && (2 + resolvedMafiaCount < state.players.length);
  const baseRoles = 2 + resolvedMafiaCount + (hasSheriff ? 1 : 0);
  const civilians = Math.max(state.players.length - baseRoles, 0);

  useEffect(() => {
    let timer;
    if (state.phase === 'night_transition') { timer = setTimeout(() => { state.startNightRoles(); }, TRANSITION_MS); } 
    else if (state.phase === 'day_transition') { timer = setTimeout(() => { state.startDayRecap(); }, TRANSITION_MS); }
    return () => clearTimeout(timer);
  }, [state.phase]);

  useEffect(() => { setCardViewed(false); }, [state.phase]);

  const isGalaxyPhase = state.phase === 'lobby' || state.phase === 'role_reveal';
  const isSpookyPhase = state.phase !== 'splash' && state.phase !== 'lobby' && state.phase !== 'role_reveal';

  const renderBackButton = () => {
    if (state.phase === 'lobby' || state.phase === 'splash') return null;
    return (
      <button 
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => { if (window.confirm("Abort current game and go back to Lobby?")) { state.resetToLobby(); } }}
        className="absolute top-4 left-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-90 z-50 p-3 bg-[#0a0a0a]/80 backdrop-blur-md rounded-lg border border-slate-800 shadow-xl pointer-events-auto"
        style={tapSafeStyle}
      ><span>◀</span> LOBBY</button>
    );
  };

  // ARCHITECT FIX: Added strict hideCondition logic to permanently erase names from the list.
  const renderPlayerList = (onSelect, includeSkip = false, hideCondition = () => false) => {
    const visiblePlayers = alivePlayers.filter(p => !hideCondition(p));
    
    return (
      <div className="w-full max-w-sm relative z-10 pointer-events-auto mt-2 mb-6" style={tapSafeStyle}>
        <div 
          className="w-full space-y-3 max-h-[280px] overflow-y-auto px-2 pb-2 pt-2 hide-scrollbar"
          style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)' }}
        >
          {visiblePlayers.map((p, index) => (
            <AnimatedItem key={p.id} index={index} delay={0.05}>
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onSelect(p.id)}
                className="w-full p-4 bg-[#111] text-white active:scale-95 border border-slate-700 rounded-xl font-bold uppercase transition-all hover:border-slate-500"
                style={tapSafeStyle}
              >{p.name}</button>
            </AnimatedItem>
          ))}
          {includeSkip && (
            <AnimatedItem index={visiblePlayers.length} delay={0.05}>
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onSelect(null)}
                className="w-full p-4 bg-transparent border border-slate-700/80 text-slate-400 rounded-xl font-bold uppercase mt-2 active:scale-95 transition-all hover:border-slate-500 hover:text-slate-300"
                style={tapSafeStyle}
              >Skip / Nobody</button>
            </AnimatedItem>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        /* PERMANENT FIX: Root level reset to kill tap highlights and stop whole-page scrolling */
        html, body, #root { 
          width: 100vw; height: 100vh; height: 100dvh; 
          overflow: hidden; position: fixed; overscroll-behavior: none; 
          background-color: #050505 !important; user-select: none; 
          margin: 0; padding: 0; 
          -webkit-tap-highlight-color: transparent !important; 
          -webkit-touch-callout: none !important; 
        }
        * { -webkit-tap-highlight-color: transparent !important; outline: none !important; }
        input { user-select: auto; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* ─── PERMANENT BACKGROUND MOUNTS (ZERO FLICKER) ─── */}
      <div className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ease-in-out" style={{ backgroundColor: '#e5e5e5', opacity: state.phase === 'splash' ? 1 : 0, zIndex: state.phase === 'splash' ? 0 : -100, visibility: state.phase === 'splash' ? 'visible' : 'hidden' }} />
      <div className="fixed inset-0 w-full h-full pointer-events-auto transition-opacity duration-700 ease-in-out" style={{ opacity: isGalaxyPhase ? 1 : 0, zIndex: isGalaxyPhase ? 0 : -50, visibility: isGalaxyPhase ? 'visible' : 'hidden' }}>
        <MemoizedGalaxy />
      </div>
      <div className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ease-in-out" style={{ opacity: isSpookyPhase ? 1 : 0, zIndex: isSpookyPhase ? 0 : -50, visibility: isSpookyPhase ? 'visible' : 'hidden' }}>
        <FullScreenSpooky phase={state.phase} />
      </div>

      {/* ─── SPLASH PHASE ─── */}
      {state.phase === 'splash' && (
        <div className="relative h-[100dvh] w-full flex flex-col items-center justify-center p-6 overflow-hidden z-10 transition-opacity duration-1000" style={tapSafeStyle}>
          <ImagePreloader />
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { setTimeout(() => { state.enterLobby(); }, 800); }} className="splash-batman-btn" style={tapSafeStyle}>
            <span>PLAY GAME</span>
          </button>
        </div>
      )}

      {/* ─── LOBBY PHASE ─── */}
      {state.phase === 'lobby' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 overflow-hidden pointer-events-none z-10" style={tapSafeStyle}>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setShowSettings((prev) => !prev)} className="absolute top-4 left-4 z-50 w-12 h-12 rounded-xl border border-cyan-300/40 bg-[#02060a]/80 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all hover:border-cyan-200/70 hover:bg-[#07111a]/85 pointer-events-auto" style={tapSafeStyle}>
            <svg className={`w-6 h-6 text-cyan-100 ${showSettings ? 'animate-spin' : ''}`} style={{ animationDuration: '0.8s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.9 1.9 0 0 1-2.7 2.7l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.9 1.9 0 0 1-2.7-2.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.9 1.9 0 0 1 2.7 2.7l-.1.1a1 1 0 0 0 1.1.2h0a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9h0a1 1 0 0 0 1.1-.2l.1-.1a1.9 1.9 0 0 1 2.7 2.7l-.1.1a1 1 0 0 0-.2 1.1v0a1 1 0 0 0 .9.6h.2a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6Z" /></svg>
          </button>
          
          <h1 className="text-5xl md:text-6xl font-black uppercase mb-10 tracking-[0.2em] mt-14 relative z-10 shine-text text-center pointer-events-none">THE MAFIA</h1>

          {showSettings && (
            <div className="w-full max-w-sm mb-8 p-4 rounded-2xl border border-cyan-300/30 bg-[#02060a]/85 backdrop-blur-lg relative z-10 shadow-xl pointer-events-auto">
              <p className="text-cyan-200 text-[11px] font-black uppercase tracking-[0.2em] mb-4">Game Settings</p>
              <div className="mb-4">
                <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-2">Mafia Count</p>
                <div className="grid grid-cols-3 gap-2">
                  {['auto', 1, 2].map((mode) => <button key={String(mode)} onPointerDown={(e) => e.stopPropagation()} onClick={() => state.setMafiaCount(mode)} className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedMafiaCount === mode ? 'bg-rose-400/20 text-rose-200 border-rose-300/60' : 'bg-slate-900/70 text-slate-300 border-slate-700/70 hover:border-slate-500'}`} style={tapSafeStyle}>{mode}</button>)}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-2">Sheriff Role</p>
                <div className="grid grid-cols-3 gap-2">
                  {['auto', 'always', 'off'].map((mode) => <button key={mode} onPointerDown={(e) => e.stopPropagation()} onClick={() => state.setSheriffMode(mode)} className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedSheriffMode === mode ? 'bg-violet-400/20 text-violet-200 border-violet-300/60' : 'bg-slate-900/70 text-slate-300 border-slate-700/70 hover:border-slate-500'}`} style={tapSafeStyle}>{mode}</button>)}
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between bg-[#010201]/50 border border-slate-700/50 p-3 rounded-xl">
                  <span className="font-bold text-[10px] tracking-widest uppercase text-slate-400">Reveal Roles on Death?</span>
                  <button onPointerDown={(e) => e.stopPropagation()} onClick={state.toggleRevealRoles} className={`px-3 py-1 rounded text-[10px] uppercase font-black tracking-widest transition-colors ${state.settings?.revealRoles ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-[#222] text-slate-500 border border-slate-700'}`} style={tapSafeStyle}>{state.settings?.revealRoles ? 'ON' : 'OFF'}</button>
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
              <div className="poda-glow"></div><div className="poda-darkBorderBg"></div><div className="poda-darkBorderBg"></div><div className="poda-darkBorderBg"></div><div className="poda-white"></div><div className="poda-border"></div>
              <div className="poda-main">
                <input placeholder="Add Player..." type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newPlayerName.trim()) { state.addPlayer(newPlayerName.trim()); setNewPlayerName(''); } }} className="poda-input" />
                <div className="poda-input-mask"></div><div className="poda-pink-mask"></div><div className="poda-filterBorder"></div>
                <div className="poda-filter-icon" onPointerDown={(e) => e.stopPropagation()} onClick={() => { if(newPlayerName.trim()) { state.addPlayer(newPlayerName.trim()); setNewPlayerName(''); } }} style={tapSafeStyle}>
                  <svg preserveAspectRatio="none" height="27" width="27" viewBox="4.8 4.56 14.832 15.408" fill="none"><path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z" stroke="#d6d6e6" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {availableRecentNames.length > 0 && (
            <div className="w-full mb-6 relative z-10 pointer-events-auto" style={tapSafeStyle}>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 pl-2 text-center drop-shadow-md">Recent Players</p>
              <div className="flex flex-wrap justify-center gap-2">
                {availableRecentNames.slice(0, 6).map(name => (
                  <button key={name} onPointerDown={(e) => e.stopPropagation()} onClick={() => state.addPlayer(name)} className="px-4 py-2 bg-[#222] text-[#e81cff] border border-[#e81cff]/30 rounded-full text-xs font-bold tracking-wider active:scale-95 transition-all shadow-md" style={tapSafeStyle}>
                    + {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="w-full max-w-sm relative z-10 pointer-events-auto mb-10" style={tapSafeStyle}>
            <div 
              className="w-full space-y-2 max-h-[135px] overflow-y-auto px-2 pb-2 pt-2 hide-scrollbar"
              style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' }}
            >
              {state.players.map((p, index) => (
                <AnimatedItem key={p.id} index={index} delay={0.05}>
                  <div className="flex justify-between items-center py-4 px-6 bg-[#010201]/80 backdrop-blur-md border border-[#40c9ff]/30 rounded-2xl shadow-sm transition-all">
                    <span className="font-bold tracking-widest text-white">{p.name}</span>
                    <button onPointerDown={(e) => e.stopPropagation()} onClick={() => state.removePlayer(p.id)} className="text-rose-500 font-bold active:scale-90 flex items-center justify-center w-6 h-6" style={tapSafeStyle}>✕</button>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </div>

          <div className="w-full flex justify-center relative z-10 mb-6 pointer-events-auto">
            <button disabled={state.players.length < 4} onPointerDown={(e) => e.stopPropagation()} onClick={() => { setTimeout(() => { state.startGame(); }, 250); }} className="stealth-btn" style={tapSafeStyle}>
              <strong className="stealth-strong">BEGIN GAME ({state.players.length})</strong>
              <div className="stealth-container-stars"><div className="stealth-stars"></div></div>
              <div className="stealth-glow"><div className="stealth-circle"></div><div className="stealth-circle"></div></div>
            </button>
          </div>
        </div>
      )}

      {/* ─── ROLE REVEAL ─── */}
      {state.phase === 'role_reveal' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-2 relative z-10 pointer-events-none">Pass phone to</p>
          <h2 className="text-4xl font-black text-white uppercase mb-8 drop-shadow-md relative z-10 pointer-events-none">{state.players[state.revealIndex]?.name}</h2>
          
          <div 
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={() => setIsFlipped(true)}
            onMouseUp={() => { setIsFlipped(false); setCardViewed(true); }}
            onMouseLeave={() => setIsFlipped(false)}
            onTouchStart={() => setIsFlipped(true)}
            onTouchEnd={() => { setIsFlipped(false); setCardViewed(true); }}
            className="cursor-pointer relative z-10 pointer-events-auto"
            style={tapSafeStyle}
          >
            <RoleCard isFlipped={isFlipped} role={state.players[state.revealIndex]?.role} />
          </div>

          {/* ARCHITECT FIX: Fading the text instead of removing it prevents the layout jump! */}
          <div className="relative w-full max-w-sm flex justify-center mt-12 z-10 pointer-events-none h-[80px]">
            <p className={`absolute top-0 text-slate-400 font-bold text-sm transition-opacity duration-500 pointer-events-none ${cardViewed ? 'opacity-0' : 'opacity-100 animate-pulse'}`}>
              👆 Tap the card to view your role
            </p>
            <button 
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={() => { setIsFlipped(false); setCardViewed(false); state.nextRoleReveal(); }} 
              disabled={!cardViewed} 
              className={`absolute top-0 p-5 w-full rounded-xl font-black uppercase tracking-widest transition-all duration-500 pointer-events-auto ${!cardViewed ? 'opacity-0 translate-y-4 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100 bg-[#0a0a0a]/90 backdrop-blur-md text-white border border-slate-800 hover:border-slate-500 active:scale-95'}`} 
              style={tapSafeStyle}
            >
              {state.revealIndex === state.players.length - 1 ? 'Give to Moderator' : 'Next Player'}
            </button>
          </div>
        </div>
      )}

      {/* ─── NIGHT PHASES ─── */}
      {state.phase === 'night_transition' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-96 h-96 bg-black/30 rounded-full blur-3xl animate-pulse"></div></div>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] relative z-20 animate-in fade-in duration-1000">EVERYONE</h2>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] relative z-20 mt-4 animate-in fade-in duration-1000 delay-500">CLOSE YOUR EYES</h2>
            <p className="text-slate-300 mt-8 text-lg tracking-widest font-bold relative z-20 animate-pulse">Get ready for the night...</p>
          </div>
        </div>
      )}

      {state.phase === 'night_mafia' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <h2 className="text-3xl md:text-4xl font-black text-red-500 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
          <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🌙 Moderator: Ask the Mafia to wake up and point.</p>
          <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)] tracking-[0.1em] pointer-events-none">Who does the Mafia kill?</h3>
          {renderPlayerList((id) => state.submitNightAction('Mafia', id), true, (p) => p.role === 'Mafia')}
        </div>
      )}

      {state.phase === 'night_doctor' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <h2 className="text-3xl md:text-4xl font-black text-green-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
          <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🌙 Moderator: Ask the Doctor to wake up and point.</p>
          <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] tracking-[0.1em] pointer-events-none">Who does the Doctor save?</h3>
          {renderPlayerList((id) => state.submitNightAction('Doctor', id), true, (p) => p.id === state.doctorLastSaved || (p.role === 'Doctor' && state.doctorHasSelfSaved))}
        </div>
      )}

      {state.phase === 'night_detective' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          {state.investigationResult ? (
            <>
              {/* ARCHITECT FIX: Detective alignment perfectly matches other screens now */}
              <h2 className="text-3xl md:text-4xl font-black text-blue-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)] tracking-[0.15em] pointer-events-none">Investigation</h2>
              <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">{state.investigationResult === 'DEAD_ROLE' ? "🔍 Moderator: Pretend to give an answer!" : "🔍 Moderator: Nod or shake your head."}</p>
              <h3 className={`text-5xl md:text-6xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)] tracking-[0.1em] pointer-events-none ${state.investigationResult === 'DEAD_ROLE' ? 'text-slate-500 drop-shadow-[0_0_20px_rgba(107,114,128,0.5)]' : state.investigationResult === 'MAFIA' ? 'text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.7)]' : 'text-green-400 drop-shadow-[0_0_30px_rgba(34,197,94,0.7)]'}`}>
                {state.investigationResult === 'DEAD_ROLE' ? 'ROLE DEAD' : state.investigationResult}
              </h3>
              <div className="relative w-full max-w-sm flex justify-center mt-12 z-10 pointer-events-none">
                <button onPointerDown={(e) => e.stopPropagation()} onClick={state.advanceFromDetective} className="p-5 w-full rounded-xl font-black tracking-widest uppercase active:scale-95 bg-[#0a0a0a]/90 backdrop-blur-md border border-slate-700 hover:border-slate-500 transition-colors shadow-lg pointer-events-auto" style={tapSafeStyle}>Continue →</button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-black text-blue-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
              <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🔍 Moderator: Ask the Detective to wake up and point.</p>
              <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)] tracking-[0.1em] pointer-events-none">Who is investigated?</h3>
              {renderPlayerList((id) => state.submitNightAction('Detective', id), false, (p) => p.role === 'Detective')}
            </>
          )}
        </div>
      )}

      {state.phase === 'night_sheriff' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <h2 className="text-3xl md:text-4xl font-black text-purple-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
          <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">⚔️ Moderator: Ask the Sheriff to wake up and point.</p>
          <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] tracking-[0.1em] pointer-events-none">Who does the Sheriff execute?</h3>
          {renderPlayerList((id) => state.submitNightAction('Sheriff', id), true, (p) => p.role === 'Sheriff')}
        </div>
      )}

      {/* ─── DAY PHASES ─── */}
      {state.phase === 'day_transition' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"></div></div>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_40px_rgba(255,210,0,0.8)] relative z-20 animate-in fade-in duration-1000">EVERYONE</h2>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_40px_rgba(255,210,0,0.8)] relative z-20 mt-4 animate-in fade-in duration-1000 delay-500">OPEN YOUR EYES</h2>
            <p className="text-yellow-100 mt-8 text-lg tracking-widest font-bold relative z-20 animate-pulse">The sun is rising...</p>
          </div>
        </div>
      )}

      {(state.phase === 'day_recap' || state.phase === 'day_recap_post_vote') && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-12 text-white tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] mt-14 relative z-10 animate-in fade-in duration-1000 pointer-events-none">The Town Awakens</h2>
          <div className="w-full max-w-2xl space-y-4 relative z-10 pointer-events-none">
            {state.dayRecap.map((msg, i) => (
              <div key={i} className="p-6 bg-slate-900/50 backdrop-blur-md rounded-xl text-lg font-bold border-l-4 border-amber-400 shadow-xl animate-in fade-in duration-1000 transition-colors pointer-events-auto hover:bg-slate-900/70" style={{ animationDelay: `${i * 200}ms` }}><span className="text-amber-300">▸ </span>{msg}</div>
            ))}
          </div>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={state.phase === 'day_recap' ? state.startVoting : state.advanceToNight} className="mt-12 p-5 w-full max-w-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 rounded-xl font-black tracking-widest uppercase active:scale-95 transition-transform shadow-xl relative z-10 hover:shadow-[0_0_30px_rgba(255,193,7,0.5)] pointer-events-auto" style={tapSafeStyle}>{state.phase === 'day_recap' ? '→ Begin Voting' : '→ Go To Sleep (Next Night)'}</button>
        </div>
      )}

      {state.phase === 'day_voting' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <h2 className="text-slate-300 font-bold uppercase tracking-widest text-[12px] mt-14 mb-3 relative z-10 drop-shadow-md pointer-events-none">⚖️ Town Voting Phase</h2>
          <h3 className="text-5xl md:text-6xl font-black text-amber-300 my-4 uppercase relative z-10 drop-shadow-[0_0_20px_rgba(255,193,7,0.5)] pointer-events-none">{alivePlayers[state.votingState.currentVoterIndex]?.name}</h3>
          <p className="text-lg font-bold text-red-400 tracking-widest uppercase relative z-10 drop-shadow-md pointer-events-none">Who do you exile?</p>
          
          <div className="w-full max-w-sm relative z-10 pointer-events-auto mt-6 mb-6" style={tapSafeStyle}>
            <div 
              className="w-full space-y-3 max-h-[280px] overflow-y-auto px-2 pb-2 pt-2 hide-scrollbar"
              style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)' }}
            >
              {alivePlayers.filter(p => p.id !== alivePlayers[state.votingState.currentVoterIndex]?.id).map((p, index) => (
                <AnimatedItem key={p.id} index={index} delay={0.05}>
                  <button onPointerDown={(e) => e.stopPropagation()} onClick={() => state.submitVote(p.id)} className="w-full p-4 bg-slate-900/70 backdrop-blur-md text-white border-2 border-slate-700/70 rounded-lg font-bold uppercase active:scale-95 transition-all hover:border-slate-500 hover:bg-slate-900" style={tapSafeStyle}>→ Vote {p.name}</button>
                </AnimatedItem>
              ))}
              {/* ARCHITECT FIX: Voting skip completely unlocked for everyone, including Player 1 */}
              <AnimatedItem index={999} delay={0.05}>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => state.submitVote(null)} className="w-full p-4 border-2 rounded-lg font-bold uppercase mt-2 active:scale-95 transition-all bg-transparent border-slate-600/50 backdrop-blur-sm text-slate-300 hover:border-slate-400 hover:text-slate-200" style={tapSafeStyle}>⊘ Pass / No Vote</button>
              </AnimatedItem>
            </div>
          </div>
          <p className="mt-10 text-slate-400 font-bold text-[11px] uppercase tracking-wider relative z-10 bg-slate-900/40 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700/50 pointer-events-none">Vote {state.votingState.currentVoterIndex + 1} of {alivePlayers.length}</p>
        </div>
      )}

      {/* ─── GAME OVER PHASE ─── */}
      {state.phase === 'gameover' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <div className="relative z-10 flex flex-col items-center pointer-events-none">
            <h1 className={`text-6xl md:text-7xl font-black uppercase mb-2 mt-14 ${state.winner === 'Mafia' ? 'text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]' : 'text-blue-400 drop-shadow-[0_0_40px_rgba(96,165,250,0.8)]'}`}>{state.winner} WIN!</h1>
            <p className={`text-sm tracking-[0.2em] font-bold ${state.winner === 'Mafia' ? 'text-red-400' : 'text-blue-300'}`}>{state.winner === 'Mafia' ? '🔴 THE MAFIA HAS TAKEN OVER THE TOWN' : '✓ THE TOWN HAS ELIMINATED THE THREAT'}</p>
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
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { setTimeout(() => { state.playAgain(); }, 1500); }} className="splash-batman-btn" style={tapSafeStyle}>
              <span>PLAY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}