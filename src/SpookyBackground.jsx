import React from 'react';
import './SpookyBackground.css';

export default function SpookyBackground({ phase }) {
  // Checks the phase from your store to decide if it's night or day
  const isNight = phase.startsWith('night') || phase === 'night_transition';
  const themeClass = isNight ? 'theme-night' : 'theme-day';

  return (
    <div className={`scene-wrapper ${themeClass}`}>
      <div className="sky">
        <div className="sun"></div>
        <div className="moon"></div>
        <div className="clouds">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
      <div className="content">
        <div className="level-0">
          <div className="door">
            <div className="nosferatu"></div>
            <div className="logs">
              <span></span><span></span><span></span>
            </div>
          </div>
          <div className="shining"></div>
        </div>
        <div className="level-1">
          <div className="window">
            <div className="frankenstein"></div>
          </div>
          <div className="shining"></div>
        </div>
        <div className="level-2">
          <div className="window">
            <div className="witch"></div>
          </div>
          <div className="shining"></div>
        </div>	
        <div className="balcony"></div>
        <div className="bat-cat">
          <div className="body"></div>
          <div className="leg"></div>
          <div className="leg"></div>
          <div className="head"></div>
          <div className="ears"></div>
          <div className="tail"></div>
          <div className="wings">
            <div className="wing">
              <div className="finger"></div><div className="finger"></div><div className="finger"></div><div className="finger"></div>
              <div className="membrane"></div><div className="membrane"></div><div className="membrane"></div>
            </div>
            <div className="wing">
              <div className="finger"></div><div className="finger"></div><div className="finger"></div><div className="finger"></div>
              <div className="membrane"></div><div className="membrane"></div><div className="membrane"></div>
            </div>
          </div>
        </div>
        <div className="roof-0">
          <div className="window">
            <div className="phantom"></div><div className="phantom"></div>
          </div>
          <div className="shining"></div>
        </div>
        <div className="roof-1"></div>
        <div className="roof-2">
          <div className="chimney"></div>
          <div className="smoke">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div className="flying-bat"></div>
        <div className="fence">
          <span></span><span></span>
          <div className="bat">
            <div className="head">
              <div className="eyes"></div>
              <div className="mouth"></div>
            </div>
            <div className="wings"></div>
            <div className="legs"><div className="leg"></div><div className="leg"></div></div>
          </div>
          <div className="chimney"></div>
        </div>
        <div className="fence">
          <span></span><span></span>
          <div className="tomb">RIP</div>
          <div className="zombie-hand"></div>
          <div className="stones"></div>
        </div>
        <div className="skeleton-floating"></div>
        <div className="skeleton">
          <div className="head">
            <div className="cranium"></div><div className="nose"></div><div className="mouth"></div>
          </div>
          <div className="neck"></div>
          <div className="torso">
            <div className="pelvis"></div><div className="column"></div><div className="rib"></div><div className="rib"></div><div className="clavicle"></div>
          </div>
          <div className="arms">
            <div className="arm">
              <div className="bone"></div><div className="bone"></div>
              <div className="hand"><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div></div>
            </div>
            <div className="arm">
              <div className="bone"></div><div className="bone"></div>
              <div className="hand"><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div></div>
            </div>
          </div>
          <div className="legs">
            <div className="leg">
              <div className="bone"></div><div className="bone"></div><div className="bone ball"></div>
              <div className="foot"><div className="bone"></div><div className="bone"></div><div className="bone"></div></div>
            </div>
            <div className="leg">
              <div className="bone"></div><div className="bone"></div><div className="bone ball"></div>
              <div className="foot"><div className="bone"></div><div className="bone"></div><div className="bone"></div></div>
            </div>
          </div>
        </div>
        <div className="electricity">
          <div className="pole"></div><div className="bar"><span></span></div><div className="bar"><span></span></div>
          <div className="cable"><span></span><span></span><span></span></div>
          <div className="cable"></div>
          <div className="box"><div className="sparks"><span></span><span></span><span></span><span></span><span></span></div></div>
        </div>
        <div className="pumpkin">
          <span></span><span></span><span></span><span></span><span></span>
          <div className="eyes"></div><div className="nose"></div>
          <div className="mouth"><div className="teeth"></div></div>
        </div>
      </div>
    </div>
  );
}