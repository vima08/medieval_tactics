# Round 2 AI and balance audit

I ran 14 complete Highland self-play matches against the current source (control target **5**, scoring once after red ends its turn), plus two complete tutorial matches. Every saved command stream was replayed with `replayGame(initial, commands)` and the full final state matched the headless result. Each run used a 300-command cap; none reached it. The replay files and machine-readable results are in [`round2-replays/`](round2-replays/), with a combined [`summary.json`](round2-replays/summary.json).

The default and swapped Highland cases use presets 0 and 1 from `src/engine/catalog.ts`. `n` means normal AI and `h` hard AI, blue difficulty first. The two seed-2 checks duplicated the corresponding seed-1 command streams exactly, so they confirm determinism but are **not independent strategic samples**.

| Scenario | Winner | Final turn | Score blue:red | Deaths | Attack / ability actions |
| --- | --- | ---: | ---: | ---: | ---: |
| [Default n/n](round2-replays/default-nn.json) | Blue | 11 | 5:0 | 5 | 2 / 42 |
| [Swapped n/n](round2-replays/swap-nn.json) | Red | 6 | 0:5 | 2 | 3 / 21 |
| [Mirror preset 0 n/n](round2-replays/mirror0-nn.json) | Blue | 6 | 4:0 | 3 | 4 / 18 |
| [Mirror preset 1 n/n](round2-replays/mirror1-nn.json) | Blue | 12 | 2:0 | 5 | 6 / 47 |
| [Default h/h](round2-replays/default-hh.json) | Blue | 8 | 5:0 | 6 | 7 / 24 |
| [Swapped h/h](round2-replays/swap-hh.json) | Red | 8 | 0:5 | 4 | 3 / 25 |
| [Mirror preset 0 h/h](round2-replays/mirror0-hh.json) | Red | 8 | 0:2 | 5 | 2 / 27 |
| [Mirror preset 1 h/h](round2-replays/mirror1-hh.json) | Blue | 10 | 5:0 | 5 | 5 / 37 |
| [Default h/n](round2-replays/default-hn.json) | Blue | 9 | 5:0 | 5 | 2 / 38 |
| [Default n/h](round2-replays/default-nh.json) | Blue | 9 | 5:0 | 6 | 4 / 33 |
| [Swapped h/n](round2-replays/swap-hn.json) | Red | 8 | 0:5 | 5 | 5 / 27 |
| [Swapped n/h](round2-replays/swap-nh.json) | Red | 6 | 0:5 | 3 | 3 / 21 |
| [Default n/n, seed 2](round2-replays/default-nn-s2.json) | Blue | 11 | 5:0 | 5 | 2 / 42 |
| [Default h/h, seed 2](round2-replays/default-hh-s2.json) | Blue | 8 | 5:0 | 6 | 7 / 24 |

Across all 14 Highland runs: blue won 9, red 5; mean ending turn was 8.6 (mean 94.2 commands); 65 of 140 deployed units died. The commands comprise 601 moves, 55 ordinary attacks, 426 abilities, and 237 end turns. Ability use includes 212 shield guards, 75 engineer traps, 32 scout dashes, and 107 sword/spear/archer combat abilities, so the raw ability count is not an attack count.

| Class | Survived / deployed, both teams |
| --- | ---: |
| Shield | 26 / 28 |
| Sword | 11 / 14 |
| Spear | 20 / 28 |
| Archer | 13 / 28 |
| Engineer | 5 / 14 |
| Scout | 0 / 28 |

The two [tutorial](round2-replays/tutorial-1.json) [runs](round2-replays/tutorial-2.json) both ended with blue winning on turn 4 after 28 commands and one death per side. Their command streams also matched exactly across seeds.

## Largest tactical balance flaw

**Preset 1 cannot contest preset 0's objective plan in this self-play matchup.** Preset 0 won **all eight distinct head-to-head Highland setups**, whether deployed blue or red and whether the AIs were normal/normal, hard/hard, hard/normal, or normal/hard. Every one ended 5:0 for preset 0. This makes the result stronger than a first-player explanation: [normal default](round2-replays/default-nn.json) finishes blue 5:0 on turn 11, whereas [normal swapped](round2-replays/swap-nn.json) finishes red 5:0 on turn 6. The same side reversal occurs on [hard/hard](round2-replays/default-hh.json) and [hard/hard swapped](round2-replays/swap-hh.json). In contrast, mirrored preset-0 battles split one blue and one red win across normal and hard. These complete replays make the matchup failure reproducible.

The fight is not purely a scoring race without casualties: the eight head-to-head runs had 2–7 ordinary attacks each, combat abilities, and 2–6 deaths. However, preset 1 never sustained the two-point occupation needed to score a single full-round point against preset 0. The records establish a roster/AI matchup problem, not which unit or evaluation weight causes it. A focused next experiment would replace preset 1's engineer with preset 0's sword while keeping the other four choices fixed, run both sides at equal difficulty, and compare occupation and survival. The 0/28 scout survival result also merits a separate mobility and risk audit, but scouts dying on contested objectives does not by itself prove a bad trade.
