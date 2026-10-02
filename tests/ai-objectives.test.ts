import { describe, expect, it } from 'vitest';
import { playHeadless } from '../src/ai/selfplay';
import { replayGame } from '../src/engine';

describe('AI with selectable victory objectives', () => {
  for (const objective of ['commander', 'elimination'] as const) {
    it(`finishes and replays a ${objective} match`, () => {
      const game = playHeadless({ objective, difficultyBlue: 'easy', difficultyRed: 'easy', maxCommands: 260 });
      expect(game.winner).toBeDefined();
      expect(game.endedByLimit).toBe(false);
      expect(game.commands.some(command => command.type === 'attack')).toBe(true);
      const replayed = replayGame(game.final.initial!, game.commands);
      expect(replayed).toEqual(game.final);
    }, 60000);
  }
});
