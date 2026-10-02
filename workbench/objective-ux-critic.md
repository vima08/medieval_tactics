# First-use UX and visual critique

Inspected the running game at `http://localhost:5173/` in a 1440 × 900 Chrome viewport, plus `objective-commander.png`, `objective-elimination.png`, and `damage-number-replay.png`. I entered both AI and local PvP setup and selected alternate goals without reading implementation notes.

## Observed facts

- The menu offers AI and local PvP. Both setup flows use a native **Цель матча** selector with control, commander, and elimination goals. AI defaults to control. Changing the selector updates its visible value. PvP keeps the chosen goal while preparing the first side.
- The goal selector sits below the initial 900 px viewport in both setup flows. The prominent action at the top of AI setup is **Начать битву**, so a new player can begin without seeing that the win condition is configurable.
- Below the selector, commander and elimination choices show the same generic sentence about playing until the goal is met and using survivors and health at round 12. This does not explain which unit is the commander or explicitly state the elimination condition. The goal-specific explanation appears in the battle's right panel after starting.
- In the supplied battle screenshots, the objective panel clearly changes its title and instruction for commander versus elimination. The commander panel includes a crown marker and health counts; elimination shows fighter counts. The panels are visually aligned with the existing dark, gold-accented interface.
- The battlefield remains the visual focus. The objective panel is readable at screenshot size, though its body copy and count line are considerably smaller than its title.

## Largest issue

**The chosen win condition is easy to miss before battle.** It is below the fold in a long roster editor, while the main start action is already visible. The short text beside the selector is also generic for the two new goals. A player can commit to a match before learning that goals are selectable or what the selected goal requires. Bring the goal choice and a one-sentence goal-specific rule into the initial setup view, close to the start action.

## Damage number

The pink **−2** in `damage-number-replay.png` is legible in the still image: its size, dark outline, and contrast separate it from the green board. It sits near other pieces and terrain marks but is not confused with unit health. The screenshot alone cannot establish whether the number remains visible long enough during animation.
