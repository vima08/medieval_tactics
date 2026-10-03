import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { AmbientPlayer, AMBIENT_THEMES } from '../src/ambience';

function audioHarness() {
  const nodes: any[] = [];
  const context: any = { currentTime: 0, sampleRate: 40, destination: {}, resume: vi.fn(async () => {}), createBuffer: () => ({ getChannelData: () => new Float32Array(120) }) };
  const makeNode = () => {
    const param = () => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), cancelAndHoldAtTime: vi.fn() });
    const node: any = { context, gain: param(), frequency: param(), start: vi.fn(), stop: vi.fn(), disconnect: vi.fn() };
    node.connect = vi.fn(() => node); nodes.push(node); return node;
  };
  context.createGain = context.createOscillator = context.createBiquadFilter = context.createBufferSource = makeNode;
  return { context: context as AudioContext, nodes };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

test('same scene and motif retain one session; volume reacts during rests', () => {
  const { context, nodes } = audioHarness(); let volume = .4;
  const player = new AmbientPlayer(() => context, () => volume);
  player.start('river', 'vera'); const count = nodes.length;
  player.start('river', 'vera'); expect(nodes).toHaveLength(count);
  volume = .1; vi.advanceTimersByTime(120);
  expect(nodes[1].gain.setTargetAtTime).toHaveBeenLastCalledWith(.1, 0, .08);
  player.stop(); vi.advanceTimersByTime(500);
  expect(vi.getTimerCount()).toBe(0);
  expect(nodes.every(node => node.disconnect.mock.calls.length > 0)).toBe(true);
});

test('motif change crossfades while retiring old nodes and timers', () => {
  const { context, nodes } = audioHarness();
  const player = new AmbientPlayer(() => context, () => .3);
  player.start('heights', 'caravan'); const oldNodes = [...nodes];
  player.start('heights', 'granary');
  expect(oldNodes[0].gain.cancelAndHoldAtTime).toHaveBeenCalledWith(0);
  expect(oldNodes[0].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 1.1);
  expect(oldNodes[0].disconnect).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1181);
  expect(oldNodes.every(node => node.disconnect.mock.calls.length > 0)).toBe(true);
  player.stop(); vi.advanceTimersByTime(500); expect(vi.getTimerCount()).toBe(0);
});

test('all route and character phrases differ and remain sparse', () => {
  const themes = Object.values(AMBIENT_THEMES);
  expect(themes).toHaveLength(9);
  expect(new Set(themes.map(theme => theme.notes.join(','))).size).toBe(9);
  expect(themes.every(theme => theme.notes.filter(note => note === 0).length >= 4)).toBe(true);
});
