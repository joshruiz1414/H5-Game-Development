class AudioManager {
  constructor() {
    this.music = null;
    this.musicEnabled = true;
    this.volume = 0.6;
    this.soundVolume = 2.0; // Even higher volume for sound effects
    this.audioElement = null;
    this.audioInitialized = false;
    this.soundEnabled = true;
    this.sounds = {};
    this.initSounds();
  }

  initSounds() {
    // Create audio contexts for specific sound effects
    this.createSound("powerup", this.generatePowerUpSound());
    this.createSound("playerHit", this.generatePlayerHitSound());
    this.createSound("gameOver", this.generateGameOverSound());
  }

  createSound(name, audioBuffer) {
    this.sounds[name] = audioBuffer;
  }

  playSound(name, volume = 1.0) {
    if (!this.soundEnabled || !this.sounds[name]) return;

    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = this.sounds[name];
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.value = this.soundVolume * volume;
    source.start(0);
  }

  // Generate power-up sound
  generatePowerUpSound() {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.3;
    const buffer = audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 400 + t * 200;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8) * 0.8;
    }

    return buffer;
  }

  // Generate player hit sound
  generatePlayerHitSound() {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.3;
    const buffer = audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 - t * 100;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8) * 0.9;
    }

    return buffer;
  }

  // Generate game over sound
  generateGameOverSound() {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.5;
    const buffer = audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 300 - t * 200;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 1.0;
    }

    return buffer;
  }

  initBackgroundMusic() {
    // Create HTML5 audio element (like how images are handled)
    this.audioElement = new Audio();
    this.audioElement.loop = true;
    this.audioElement.volume = this.volume;
    this.audioElement.preload = "auto";

    // Set the default music file path (like image src)
    this.audioElement.src = "src/assets/audio/background-music.mp3";

    console.log("Audio element created with src:", this.audioElement.src);
  }

  // Load external audio file
  async loadMusicFile(audioFileUrl) {
    if (this.audioInitialized) return;

    console.log("Loading music file:", audioFileUrl);
    try {
      if (!this.audioElement) {
        this.initBackgroundMusic();
      }

      this.audioElement.src = audioFileUrl;
      this.audioInitialized = true;
      console.log("Music file loaded successfully");

      // Start playing if music is enabled
      if (this.musicEnabled) {
        this.startBackgroundMusic();
      }
    } catch (error) {
      console.error("Error loading music file:", error);
      console.log("Falling back to generated music...");
      // Fallback to generated music if file loading fails
      this.createFallbackMusic();
    }
  }

  // Fallback to generated music if file loading fails
  createFallbackMusic() {
    console.log("Creating fallback music...");
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      // Create upbeat arcade-style game music
      const sampleRate = this.audioContext.sampleRate;
      const duration = 20; // 20 seconds loop for faster-paced music
      const buffer = this.audioContext.createBuffer(
        1,
        sampleRate * duration,
        sampleRate
      );
      const data = buffer.getChannelData(0);

      // Generate upbeat arcade music with multiple layers
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;

        // Main melody (upbeat synth)
        const melodyFreq = 440 + Math.sin(t * 2) * 100 + Math.sin(t * 4) * 50;
        const melody = Math.sin(2 * Math.PI * melodyFreq * t) * 0.15;

        // Bass line (punchy)
        const bassFreq = 110 + Math.sin(t * 1.5) * 20;
        const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.2;

        // High energy arpeggio
        const arpFreq = 880 + Math.sin(t * 8) * 200;
        const arp =
          Math.sin(2 * Math.PI * arpFreq * t) * 0.08 * Math.sin(t * 16);

        // Drum-like percussion (kick and snare pattern)
        let drum = 0;
        const beat = t % 0.5; // 120 BPM
        if (beat < 0.1) {
          // Kick drum
          drum =
            Math.sin(2 * Math.PI * 60 * beat * 10) * 0.3 * Math.exp(-beat * 50);
        } else if (beat > 0.2 && beat < 0.3) {
          // Snare drum
          drum = (Math.random() - 0.5) * 0.2 * Math.exp(-(beat - 0.25) * 20);
        }

        // High-hat pattern
        const hihat = (Math.random() - 0.5) * 0.05 * Math.sin(t * 32);

        // Combine all layers with some rhythm
        const rhythm = Math.sin(t * 4) * 0.5 + 0.5; // Rhythm envelope
        data[i] = (melody + bass + arp + drum + hihat) * this.volume * rhythm;
      }

      this.musicBuffer = buffer;
      this.audioInitialized = true;
      console.log("Fallback music created successfully");
      this.startBackgroundMusic();
    } catch (error) {
      console.warn("Audio context not supported:", error);
    }
  }

  startBackgroundMusic() {
    if (!this.audioElement || !this.musicEnabled || !this.audioInitialized)
      return;

    console.log("Starting background music...");
    try {
      // Use HTML5 audio play method
      this.audioElement
        .play()
        .then(() => {
          console.log("Background music started successfully");
        })
        .catch((error) => {
          console.warn("Could not start background music:", error);
          // If HTML5 audio fails, try fallback
          if (!this.audioContext) {
            this.createFallbackMusic();
          }
        });
    } catch (error) {
      console.warn("Could not start background music:", error);
    }
  }

  stopBackgroundMusic() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (error) {
        console.warn("Could not stop background music:", error);
      }
    }

    if (this.musicSource) {
      try {
        this.musicSource.stop();
        this.musicSource = null;
      } catch (error) {
        console.warn("Could not stop fallback music:", error);
      }
    }
  }

  // Toggle music
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;

    if (this.musicEnabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }

    return this.musicEnabled;
  }

  // Set volume
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }

    if (this.musicGain) {
      this.musicGain.gain.value = this.volume;
    }
  }

  // Resume audio context (needed for browser autoplay policies)
  resumeAudioContext() {
    console.log("ResumeAudioContext called");
    if (!this.audioInitialized) {
      console.log("Audio not initialized, initializing...");
      this.initBackgroundMusic();
      this.audioInitialized = true;
    }

    // Try to start the music
    if (this.musicEnabled) {
      this.startBackgroundMusic();
    }
  }

  // Load custom music file
  loadCustomMusic(fileUrl) {
    if (this.audioInitialized) {
      // Stop current music first
      this.stopBackgroundMusic();
    }
    this.loadMusicFile(fileUrl);
  }
}
