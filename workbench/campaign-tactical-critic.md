# Campaign tactical review

Actual engine runs on 2026-10-02. No source or tests edited. `node workbench/campaign-tactical-critic.mjs` runs authored armies/maps via `createGame({map:mission.map,mode:'ai',mission:mission.id})`; blue hard versus red easy; every command checked with `previewAction`; final states reproduced exactly by `replayGame`. Gate rerun after the root fixed control victory bypass.

| Mission | Result | Round / commands | First-turn opportunity |
|---|---|---|---|
| Ford | Blue | 3 / 15 | No initial attacks; both swords can reach contact on first turn. Central bridge and lower ford both reachable. |
| Watch | Blue | 3 / 15 | Archer can shoot either enemy immediately for 3 damage; aimed shot does 4. Sword has 24 legal move destinations. |
| Steps | Blue | 2 / 14 | Sword starts between spear and enemy. Move sword to (4,3), spear to (3,3): aligned allied formation enables spear attack on (5,3). |
| Gate | Baseline blue loses | 6 / 43 | Archer has immediate targets; spear can move to (5,3) and hit (7,3). Blue rushing alone through doorway loses spear to focused reply. |
| Marsh | Blue | 2 / 21 | Scout has 28 movement choices and can cross lower ford immediately; upper group can progress over bridge. Enemy commander reachable turn 2. |
| Kiln | Blue | 5 / 54 | Archer aimed shot hits shield for 4; sword crosses upper bridge immediately. Engineer has 10 first-turn destinations. |

Every mission has a verified winning replay in `workbench/campaign-replays`: use `ford.json`, `watch.json`, `steps.json`, `gate-reserve-shield.json`, `marsh.json`, `kiln.json`. `summary.json` contains baseline data; Gate baseline is a loss and intentionally preserved. The Gate winning replay uses real red easy AI and legal player commands; tactical choices reserve the shield through fighting, then occupy both flags. It wins round 6 / 48 commands, streak 2:0, with all four blue units alive. Shield ends at 1HP. Gate is winnable, but direct AI control play loses at all three tested blue difficulties; shielding and avoiding isolated doorway advances need clearer teaching.

Class progression introduces exactly sword, archer, spear, shield, scout, engineer. New classes are on the blue team in their introducing mission. Kiln omits shield from its five-unit roster, a sensible five-unit limit tradeoff. All fixed variants are empty and no hidden bonuses appear. Commander objectives finish on commander death before eliminating the enemy army (Steps and Marsh demonstrate this). Elimination missions finish with no surviving red units. Root corrected Gate: eliminating red no longer bypasses its required occupation streak. The strict Gate win above verifies actual score-based completion.

## Largest remaining defect: the Marsh trap lesson contradicts movement resolution

The lower path is a one-cell-wide ford: (4,5) and (4,7) are water. Its trap is (4,6), so no adjacent safe walking route around that trap exists. More seriously, ordinary move (3,6) → (7,5) follows [(4,6),(5,6),(6,6),(7,6),(7,5)] through the trap, but preview reports hazardDamage 0, scout remains 4HP, and the trap remains armed. Only the destination receives hazard damage. This is verified against the untouched authored initial mission, not a fabricated board. The winning Marsh replay uses this traversal. Evidence: `lesson-probes.json`, reproduced by `node workbench/campaign-lesson-probes.mjs`.

Small verified campaign fix: change briefing to explain that stopping on a trap causes damage and that the scout can finish beyond it; remove the claim that a safe adjacent route exists. The probe establishes a valid 5-cost destination beyond the trap. If traversal should instead activate traps, update preview and application to process path hazards together and revise the movement undo rules; that is a wider engine change requiring explicit movement tests. Moving this trap beside the ford onto water would not teach a reachable hazard.

## Other lesson discrepancies

Shield guarding itself does not strengthen adjacent ally protection. An adjacent sword takes 2 damage from a 3-damage enemy sword both before and after shield guard; the neighbour always receives the passive -1, while shield guard adds protection only to the shield itself. `lesson-probes.json` contains both valid previews. The campaign guard lesson should explicitly say that guard protects the shield itself, or the engine should implement its advertised ally benefit.

Lesson checklist records command type plus archetype, not geometry. Steps' spear attack checkbox can complete without attacking through an ally; Gate's protected spear attack can complete with no shield nearby; Marsh's flank step can complete against an enemy with no engaged ally. These are optional practice hints, so they do not block progression, but their checkmarks overstate demonstrated learning. Suggested small fix: label them as actions tried; a stronger fix should persist actual preview properties/positions when a command is performed.

Kiln bridges can be sabotaged into water and both crossings removed; a player can strand melee units. This is a reversible mission retry scenario with a 12-round failure limit, not an initial-map softlock. Avoid prompting indiscriminate demolition before units cross. Both original bridges are reachable and baseline replay wins with normal terrain interactions.
