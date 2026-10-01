# Focused preset 1 roster experiment

This uses the Highland map, seed 1, control target 5, a 300-command cap, and complete headless AI matches. Each completed command stream is stored in [`roster-experiment-replays/`](roster-experiment-replays/) with its initial state and outcome. The runner is [`roster-experiment.ts`](roster-experiment.ts). All tested blueprints passed `validateBlueprint` and cost at most 25. None of the 26 completed games reached the command cap. The runner was stopped after the first two engineer-mobility matches to keep the experiment focused.

`n` = normal; `h` = hard; difficulty is blue then red. Preset 0 is the unchanged opponent. Candidate score is the candidate team's final control score; a win can also occur by elimination.

| Preset 1 candidate | Cost | n/n wins | h/h wins | h/n wins | n/h wins | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Original shield tower, spear raider, archer longbow, engineer sapper, scout runner | 22 | 0/2 | 0/2 | 0/2 | 0/2 | 0/8 |
| Replace engineer sapper with sword duelist | 22 | 1/2 | 0/2 | 1/2 | 1/2 | 3/8 |
| Sword swap plus shield escort and archer hunter | 20 | 0/2 | 2/2 | 1/2 | 1/2 | 4/8 |
| Keep engineer, use shield escort and archer hunter | 20 | 0/2 | untested | untested | untested | 0/2 |

The single sword swap is the **smallest observed improvement**: it changes one preset slot, stays at 22 points, and wins three of eight matchups where the original wins none. Its red n/n win is by elimination on turn 11 while trailing 0:3 in control score. Its blue h/n win is also by elimination while trailing 0:4. The red n/h win is a 5:0 control victory. Both h/h games remain 0:5 losses, so the swap does not solve the hard-AI objective matchup by itself.

Adding escort shield and hunter archer to that sword roster wins both h/h orientations, including a red 5:0 control victory, but loses both n/n games. It is a three-slot change and costs 20, so it is weaker evidence for a minimal preset fix. Keeping the engineer while making the two mobility changes loses both completed n/n games, though it scores once in each; no conclusion about hard AI follows from those two games.

**Recommendation:** If making one catalog change now, replace preset 1's sapper engineer with a duelist sword. This changes roster composition without changing any class rules, and the engineer remains available in the catalog and preset 2. Treat it as a partial balance improvement and separately investigate why hard AI still loses both side orientations 0:5. The fixed seed is deterministic, so these outcomes are scenario comparisons rather than independent statistical samples.
