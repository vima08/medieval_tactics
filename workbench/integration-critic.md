# Live integration recheck — 1440 × 900

The AI skirmish setup now has a visible **Start battle** button in the header at x=1135–1310, y=45–94; it is enabled and needs no scrolling. The original button remains below the viewport at y=956–1005. Starting through the header opened the Highland battle. The live objective panel explicitly says that two of four signal fires score one point per full round, with a target of five, so the win condition is clearer than in earlier captures. No console or page errors occurred through setup and battle opening.

**Biggest remaining issue: battlefield scale.** In the current 1440 × 900 capture (`integration-battle.png`), the playable terrain occupies roughly x=270–1170 and y=247–713, leaving about 170 px of empty space below and a large gap above. Units are about 25–35 px tall and class silhouettes and tile features still require close inspection. The side panels are more immediately legible than the pieces and tactical terrain. This is the largest remaining first-glance usability gap.

Movement and preview were **not verified in this recheck**. During the follow-up interaction the development page navigated back to `/` while Playwright waited for a battle unit, so no valid move result was captured. Prior workbench captures show those flows, but they are not evidence for this latest live build.
