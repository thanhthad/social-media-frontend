// Web Audio Ambient Soundscapes — 100% Native Web Audio, zero external audio assets
class AmbientSoundscapes {
  constructor() {
    this.ctx = null;
    this.currentTrack = null;
    this.isPlaying = false;
    this.nodes = [];
    this.gainNode = null;
    this.volume = 0.5;
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  stop() {
    this.nodes.forEach((n) => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (e) {}
    });
    this.nodes = [];
    this.isPlaying = false;
  }

  // 1. City Rain: Filtered Pink/Brown Noise
  startRain() {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise approximation
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.gainNode);

    noise.start();
    this.nodes.push(noise, filter, rainGain);
    this.isPlaying = true;
    this.currentTrack = 'rain';
  }

  // 2. Deep Space Drone: Dual Detuned Sine Waves with LFO modulation
  startSpace() {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc3.type = 'sine';

    osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
    osc2.frequency.setValueAtTime(164.81, this.ctx.currentTime); // E3
    osc3.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 bass

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, this.ctx.currentTime);
    filter.Q.setValueAtTime(4, this.ctx.currentTime);

    // LFO to slowly sweep filter
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 0.12 Hz slow wave
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(droneGain);
    filter.connect(droneGain);
    droneGain.connect(this.gainNode);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    this.nodes.push(osc1, osc2, osc3, lfo, lfoGain, filter, droneGain);
    this.isPlaying = true;
    this.currentTrack = 'space';
  }

  // 3. Lo-Fi Cafe Chords & Vinyl Warmth
  startCafe() {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    // Major 7th chord (Cmaj7 / Am9) warm synth
    const freqs = [130.81, 196.0, 246.94, 329.63]; // C3, G3, B3, E4
    const oscillators = freqs.map((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      return osc;
    });

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, this.ctx.currentTime);

    const cafeGain = this.ctx.createGain();
    cafeGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    oscillators.forEach((osc) => {
      osc.connect(filter);
      osc.start();
      this.nodes.push(osc);
    });

    filter.connect(cafeGain);
    cafeGain.connect(this.gainNode);
    this.nodes.push(filter, cafeGain);

    this.isPlaying = true;
    this.currentTrack = 'cafe';
  }

  // 4. Campfire Crackle: Random Impulses + Warm Noise
  startCampfire() {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Sporadic crackle spikes
      if (Math.random() < 0.002) {
        data[i] = (Math.random() * 2 - 1) * 0.9;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.03;
      }
    }

    const crackle = this.ctx.createBufferSource();
    crackle.buffer = buffer;
    crackle.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const fireGain = this.ctx.createGain();
    fireGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    crackle.connect(filter);
    filter.connect(fireGain);
    fireGain.connect(this.gainNode);

    crackle.start();
    this.nodes.push(crackle, filter, fireGain);
    this.isPlaying = true;
    this.currentTrack = 'campfire';
  }

  playTrack(trackId) {
    if (trackId === 'rain') this.startRain();
    else if (trackId === 'space') this.startSpace();
    else if (trackId === 'cafe') this.startCafe();
    else if (trackId === 'campfire') this.startCampfire();
  }
}

export const ambientSynth = new AmbientSoundscapes();
export default ambientSynth;
