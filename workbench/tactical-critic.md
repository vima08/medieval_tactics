# Tactical critic: complete AI self-play after scoring-threat change

## Method

I reran 15 complete matches against the current `src/ai/index.ts` after its objective-evaluation change. Each match has a 300-command cap, and each saved command stream was replayed from its initial configuration with `replayGame`; every final state matched. Run from the repository root:

```text
node --experimental-strip-types workbench/run-tactical-selfplay.mjs
node --experimental-strip-types workbench/run-tactical-selfplay.mjs scenarios
```

Individual initial configurations, command streams, and results are in `workbench/replays/`. These files replace the previous baseline replays. Seeds 1–6 produce identical normal-AI command streams, so they establish reproducibility rather than six independent strategic samples.

## Fresh results

| Setup | Matches | Outcome | End state |
| --- | ---: | --- | --- |
| Tutorial, normal vs normal, seeds 1–6 | 6 | Blue wins 6/6 | Turn 4, 28 commands; two survivors per side |
| Highland, default rosters, normal vs normal, seeds 1–6 | 6 | Blue wins 6/6 | Turn 7, 58 commands, blue 3–0; four survivors per side |
| Highland, mirrored roster, normal vs normal | 1 | Blue wins | Turn 7, 55 commands, blue 3–0; four survivors per side |
| Highland, swapped rosters, normal vs normal | 1 | Blue wins | Turn 4, 34 commands, blue 3–0; **all ten units alive** |
| Highland, mirrored roster, hard vs hard | 1 | Blue wins | Turn 12, 94 commands, blue 3–0; blue two, red three survivors |

The change improves the default Highland match: it now has two explicit attacks and loses both scouts before ending, where the baseline ended on turn 4 without combat. Hard AI also engages and prolongs the match. The outcome remains blue in every setup.

## Largest remaining flaw

First-mover control scoring still allows a 3–0 victory without deciding the battle. The clearest current reproduction is [swap-normal.json](replays/swap-normal.json), where blue receives the former red roster and red receives the former blue roster. Blue takes home `(3,9)` on turn 1 and center `(8,9)` on turn 2. Red closes to `(9,9)` and attacks the blue scout on its third turn, but the attack does not kill it. Blue immediately ends turn 4, reaches three control points, and wins with all ten units alive. Red never scores because it holds only its home objective. This is a side and tempo issue rather than a stronger default blue roster: switching rosters did not switch the winner, and mirror matches still favor blue.

The AI's revised `controlValue` rewards occupying points and approaching an enemy-held point. It improves movement toward the center, but it evaluates positions within the current turn. It cannot assign enough value to a sequence that removes an entrenched scout *before the next blue scoring end turn*. With a three-point target, the defender has only two response turns after the first blue score.

## One testable correction

Increase the Highland control target from **3 to 5** in `createGame`, then rerun the saved roster-order scenarios and mirrored self-play. In the swapped replay, this gives red at least one additional turn after its first attack on the center scout to finish the contest before blue can win. A useful acceptance check is that the swapped-roster match no longer ends with all ten units alive and blue holding center unchallenged; the broader balance check is wins and control scores across both roster orders and mirrored configurations. This is a tuning proposal, not a verified fix; the complete matches should determine whether five points is enough or whether the AI still needs an opponent-turn scoring probe.
