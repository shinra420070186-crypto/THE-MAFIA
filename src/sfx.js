class AudioManager {
  constructor() {
    this.nightBgm = new Audio('/night-bgm.mp3');
    this.nightBgm.loop = true;
    
    this.wolfHowl = new Audio('/wolf-howl.mp3');
  }

  playNightBgm() {
    if (this.nightBgm.paused) {
      this.nightBgm.play().catch(e => console.log("Auto-play prevented:", e));
    }
  }

  stopNightBgm() {
    this.nightBgm.pause();
    this.nightBgm.currentTime = 0;
  }

  playWolfHowl() {
    this.wolfHowl.currentTime = 0;
    this.wolfHowl.play().catch(e => console.log("Auto-play prevented:", e));
  }

  init() {
    // Placeholder for global init
  }

  tap() {
    // Placeholder for tap sound
  }
}

export const sfx = new AudioManager();