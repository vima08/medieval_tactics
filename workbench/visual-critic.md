# Independent visual and first-time UX critique

Reviewed the five 1440 × 900 captures in `workbench/shots` and opened the tutorial in Chrome through Playwright.

## Largest gap: the battlefield is too small to read or feel consequential

In `04-highland.png`, the map spans roughly 780 × 380 pixels and leaves broad unused space above and below it. Units, flags, bridges, hazards, and elevation cues become tiny marks within that area. The five blue units and five red units read mainly as colored pegs; their classes and tactical roles are clearer in the sidebar than on the field. `02-tutorial.png` has the same problem at a smaller map scale. At an indie tactics game bar, the battlefield should carry the first impression and let a player quickly identify units and actionable terrain. Here the surrounding interface is more legible and more visually dominant than the action.

The selected unit interaction does work: clicking the blue unit near (674, 355) changes the left panel to unit details. However, that action does not solve the initial scan problem. A new player must inspect the sidebar or select units to understand pieces that ought to be recognizable on the board.

## Other first-time friction

- `01-menu.png` is elegant typography over a geometric frame but shows no battlefield or unit art. It does little to communicate the game's actual look before the first click.
- `03-roster.png` uses six nearly identical dark cards and small symbol icons. The class names and descriptions do most of the differentiation; the large blank lower-left area makes this screen feel unfinished beside the dense right column.
- The tutorial opens directly on a battle with text saying “Choose a fighter.” This gives a workable first action, though the tiny board and many simultaneous panels make the first decision harder to locate than it needs to be.
- `05-after-turn.png` shows a chronological event log, but turn events use small, low-contrast text and technical labels such as `red-4`, so the result of the turn is hard to connect back to individual figures on the map.

## Browser check

The tutorial loaded and unit selection responded. No page errors or failed network responses occurred during the Playwright check. The bundled Playwright Chromium was absent, so the check used installed Chrome.
