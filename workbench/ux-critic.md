# First-time UX pass

Tested in fresh Chromium at `http://localhost:5173/`, 1440×900, Russian UI. I clicked through tutorial steps 1–4, made a move and attack, ended the turn, then opened the AI skirmish setup and started its default roster. No browser console or page errors occurred during the completed paths. Screenshots are in `workbench/ux-*.png`.

## Biggest blocker: start action hidden in skirmish setup

After **Схватка с ИИ**, the default five-unit roster fills the right column beyond the bottom edge. **Начать битву →** is fully below the 900 px viewport in the initial view ([initial screenshot](ux-12-skirmish-setup.png)). There is no visible scroll bar or cue near the cut-off panel. The page itself has `overflow: hidden` and document scroll height 900 px; scrolling the inner setup area reveals the button ([scrolled screenshot](ux-13-skirmish-bottom.png)). I could start a battle after scrolling. This makes the primary next action easy to miss for a first-time player. Keep Start visible or make the panel's scrollability explicit.

## Other observed confusion

- Tutorial step 3 says to hover an enemy for damage, knockback, and line-of-sight prediction. Hovering the red spearman with the blue archer showed **Атака — Урон 1. 1 урона** ([screenshot](ux-08-archer-hover.png)). The duplicated damage wording offers no explanation for *why* damage is 1 rather than the archer's listed attack 2. If elevation/defense reduced it, the forecast should name that modifier.
- Tutorial objective says **Победите командира ♛**, but both the blue swordsman and the red swordsman show a crown ([selected blue unit](ux-03-selected.png), [tutorial board](ux-02-tutorial-start.png)). A novice has to infer that the red crowned unit is the target. Say “командира Ржавчины” or visually identify the target.
- The AI skirmish objective says to hold at least two signal fires for three consecutive turns, while the adjacent counter says **Цель: 5** ([battle screenshot](ux-14-skirmish-start.png)). The counter's 5 is unexplained against the stated three-turn condition, so the win condition is hard to track.
- The tutorial's step 4 asks the player to end the turn after attacking, but leaves a third blue unit unused ([screenshot](ux-09-attack.png)). That is valid play, yet the prompt could say unused units can still act before ending; a new player may think the game has forced the turn to end.

## Worked as expected

Selecting a blue unit advanced the tutorial to movement. Hovering a reachable tile showed route cost; clicking it advanced to attack. Hovering a target gave an attack preview; clicking dealt the shown 1 damage. Ending the turn let the AI act and returned control to blue. The default skirmish roster started once the hidden button was found.

The live development page reloaded during one repeated scripted pass while other work was in progress; I excluded that transient event from the findings above.
