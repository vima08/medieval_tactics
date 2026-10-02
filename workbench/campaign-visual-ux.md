# Independent campaign visual and UX review

Reviewed the actual 1440 × 900 browser screenshots: campaign-map, campaign-ford, campaign-watch, campaign-steps, campaign-gate, campaign-marsh, and damage-trap-source. No implementation source or builder conclusions were used to judge the visuals.

## Largest observed issue: exact terrain height is difficult to read

The raised watch terrace communicates elevation through its dark vertical faces, but the small pale height numerals have weak contrast under the cyan movement overlay. Several numbers sit close to a unit or a step edge. In the steps and gate scenes, numerals also compete with stone blocks and objective markers. A player can see that ground is raised without confidently reading which tile is height 1 or 2. This matters because the archer lesson explicitly depends on height and the selected archer panel only reports the archer's current height.

Recommended change: give height numerals a small dark backing or outline, increase their size, and place them consistently away from unit feet and objective numbers. Preserve the existing vertical faces, which already make broad elevation differences understandable. This is a readability issue, not an observed gameplay blocker.

## First launch and gradual learning

The campaign screen clearly identifies six missions, shows one active mission and five locked chapters, gives a concrete story objective, introduces one new class, and presents a prominent start button. The first battlefield has only three swordsmen and a visible ford; gold crowns make both commanders identifiable. The objective panel states the 12-round limit and the requirement to protect the friendly commander.

Each subsequent screenshot adds a class and a distinct objective or terrain problem. The active lesson and its 0/3 progress appear directly below the mandatory objective, and the text explicitly says the hints are optional practice. This separates victory requirements from training progress reasonably well. One smaller ambiguity: the watch mission opens with the archer selected while the first instruction asks the player to move the swordsman. The roster enables selection, but a beginner must infer that the instruction refers to a different unit.

## Objective readability

Commander crowns and team colors remain identifiable across the small early maps. Gate control points stand out through gold flags, light, and large 1/2 labels. The first point is partially hidden by allied units and the movement overlay at initial deployment; its beacon remains visible. The right panel explains that both points must be held at the end of a full round and that lost control resets the streak. The mandatory objective and score are readable.

## Damage source

The actual trap movement frame shows a large outlined red “−2” and a separate high-contrast “Ловушка” label directly above the damaged scout. The selected unit panel and roster both show 2/4 health. The source is understandable in this captured frame without reading the chronicle. The chronicle reports that the scout moved and received 2 damage but omits the trap source; adding that source would help after the floating label expires. A static screenshot cannot establish how long the source label remains visible.

## Conclusion

The inspected campaign frames support a clear progression from a small commander fight to additional classes and control objectives. The largest visible improvement is consistent, higher-contrast terrain-height labeling; the trap source is clearly presented in the live damage frame.
