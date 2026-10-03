import type { Ambience } from './story-data';

type Profile = { notes: readonly number[]; bass: number; tempo: number; wind: number; cutoff: number };
export const AMBIENT_PROFILES: Record<Ambience, Profile> = {
  river: { notes: [196,0,220,0,293.66,0,246.94,0], bass: 98, tempo: 1150, wind: .009, cutoff: 630 },
  heights: { notes: [146.83,0,220,0,174.61,0,164.81,0], bass: 73.42, tempo: 1400, wind: .006, cutoff: 820 },
  marsh: { notes: [130.81,0,0,155.56,0,0,196,0], bass: 65.41, tempo: 1800, wind: .01, cutoff: 390 },
  kiln: { notes: [110,0,116.54,0,164.81,0,0,146.83], bass: 55, tempo: 970, wind: .007, cutoff: 680 },
};
type Theme = { notes: readonly number[]; bass: number; tempo: number; voice: OscillatorType };
/** Original sparse phrases; frequencies in Hz, zeroes are rests, tempo is milliseconds per step. */
export const AMBIENT_THEMES = {
  vera: { notes: [196,0,220,196,0,146.83,0,196,0,0], tempo: 1180, voice: 'triangle', bass: 98 },
  ilya: { notes: [293.66,0,329.63,0,392,329.63,0,293.66,0,0], tempo: 1370, voice: 'sine', bass: 73.42 },
  rada: { notes: [220,0,261.63,293.66,0,220,0,196,0,0], tempo: 1050, voice: 'triangle', bass: 110 },
  bor: { notes: [146.83,0,0,164.81,0,196,0,146.83,0,0], tempo: 1570, voice: 'sine', bass: 73.42 },
  tisa: { notes: [329.63,0,293.66,0,0,246.94,293.66,0,0,0], tempo: 1250, voice: 'sine', bass: 82.41 },
  savva: { notes: [174.61,0,220,0,261.63,220,0,174.61,0,0], tempo: 1450, voice: 'triangle', bass: 87.31 },
  caravan: { notes: [146.83,0,220,0,196,0,174.61,0,0,0], tempo: 1400, voice: 'triangle', bass: 73.42 },
  granary: { notes: [130.81,0,0,155.56,0,174.61,0,130.81,0,0], tempo: 1690, voice: 'sine', bass: 65.41 },
  ending: { notes: [196,0,246.94,0,293.66,0,392,0,293.66,0,0,0], tempo: 1500, voice: 'sine', bass: 98 },
} as const satisfies Record<string, Theme>;
export type AmbientMotif = keyof typeof AMBIENT_THEMES;

type Session = {
  kind: Ambience; motif?: AmbientMotif; fade: GainNode; volume: GainNode;
  nodes: Set<AudioNode>; sources: Set<AudioScheduledSourceNode>;
  timer: ReturnType<typeof setInterval>; volumeTimer: ReturnType<typeof setInterval>;
};

/** Shared context and volume callback; local synthesis never touches game RNG. */
export class AmbientPlayer {
  private session: Session | null = null;
  constructor(private context: () => AudioContext, private volume: () => number) {}
  start(kind: Ambience, motif?: AmbientMotif) {
    if (this.session?.kind === kind && this.session.motif === motif) { this.refreshVolume(); return; }
    const old = this.session;
    try {
      const ctx = this.context(); void ctx.resume().catch(() => {});
      const profile = AMBIENT_PROFILES[kind], theme = motif ? AMBIENT_THEMES[motif] : undefined;
      const fade = ctx.createGain(), volume = ctx.createGain();
      const nodes = new Set<AudioNode>([fade,volume]), sources = new Set<AudioScheduledSourceNode>();
      volume.gain.value = this.level(); volume.connect(fade).connect(ctx.destination);
      fade.gain.setValueAtTime(0,ctx.currentTime); fade.gain.linearRampToValueAtTime(1,ctx.currentTime + 1.1);
      const wind = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), windGain = ctx.createGain();
      const buffer = ctx.createBuffer(1,ctx.sampleRate * 3,ctx.sampleRate), samples = buffer.getChannelData(0);
      let seed = 17;
      for (let i = 0; i < samples.length; i++) { seed = seed * 16807 % 2147483647; samples[i] = seed / 2147483647 * 2 - 1; }
      wind.buffer = buffer; wind.loop = true; filter.type = 'lowpass'; filter.frequency.value = profile.cutoff;
      windGain.gain.value = profile.wind; wind.connect(filter).connect(windGain).connect(volume); wind.start();
      sources.add(wind); [wind,filter,windGain].forEach(node => nodes.add(node));
      const drone = ctx.createOscillator(), droneGain = ctx.createGain();
      drone.type = 'sine'; drone.frequency.value = theme?.bass ?? profile.bass; droneGain.gain.value = .009;
      drone.connect(droneGain).connect(volume); drone.start(); sources.add(drone); nodes.add(drone); nodes.add(droneGain);
      let beat = 0;
      const tick = () => {
        const notes = theme?.notes ?? profile.notes, note = notes[beat++ % notes.length];
        if (!note) return;
        const oscillator = ctx.createOscillator(), envelope = ctx.createGain(), now = ctx.currentTime;
        oscillator.type = theme?.voice ?? 'triangle'; oscillator.frequency.value = note;
        envelope.gain.setValueAtTime(.0001,now); envelope.gain.exponentialRampToValueAtTime(.019,now + .22);
        envelope.gain.exponentialRampToValueAtTime(.0001,now + 2.8);
        oscillator.connect(envelope).connect(volume); sources.add(oscillator); nodes.add(oscillator); nodes.add(envelope);
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); sources.delete(oscillator); nodes.delete(oscillator); nodes.delete(envelope); };
        oscillator.start(); oscillator.stop(now + 2.9);
      };
      const timer = setInterval(tick,theme?.tempo ?? profile.tempo);
      const volumeTimer = setInterval(() => volume.gain.setTargetAtTime(this.level(),ctx.currentTime,.08),120);
      this.session = { kind,motif,fade,volume,nodes,sources,timer,volumeTimer }; tick();
      if (old) this.retire(old,1.1);
    } catch { this.stop(); }
  }
  play(kind: Ambience, motif?: AmbientMotif) { this.start(kind,motif); }
  refreshVolume() {
    const session = this.session;
    if (session) session.volume.gain.setTargetAtTime(this.level(),session.volume.context.currentTime,.08);
  }
  private level() { const value = this.volume(); return Number.isFinite(value) ? Math.max(0,Math.min(1,value)) : 0; }
  private retire(session: Session, seconds: number) {
    clearInterval(session.timer);
    try {
      const now = session.fade.context.currentTime;
      session.fade.gain.cancelAndHoldAtTime(now); session.fade.gain.linearRampToValueAtTime(0,now + seconds);
    } catch { session.fade.gain.value = 0; }
    setTimeout(() => {
      clearInterval(session.volumeTimer);
      for (const source of session.sources) try { source.stop(); } catch { /* Note already ended. */ }
      for (const node of session.nodes) try { node.disconnect(); } catch { /* Context may be closed. */ }
      session.sources.clear(); session.nodes.clear();
    },seconds * 1000 + 80);
  }
  stop() { const old = this.session; this.session = null; if (old) this.retire(old,.35); }
}
