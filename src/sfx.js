class AudioManager {
  constructor() {
    this.nightBgm = new Audio('/night-bgm.mp3');
    this.nightBgm.loop = true;
  }

  playNightBgm() {
    // Only play if it's currently paused to avoid restarting it if already playing
    if (this.nightBgm.paused) {
      this.nightBgm.play().catch(e => console.log("Auto-play prevented by browser:", e));
    }
  }

  stopNightBgm() {
    this.nightBgm.pause();
    this.nightBgm.currentTime = 0;
  }

  init() {
    // Placeholder for future global init
  }

  tap() {
    // Placeholder for future UI tap sound
  }
}

export const sfx = new AudioManager();