# Homepage Design QA

source visual truth path: `reference/homepage-reference.jpg`

latest implementation screenshot path: removed during the confirmed unused-asset cleanup on 2026-07-23.

viewport: 408 x 451 cropped iPhone-style WeChat simulator view.

state: `pages/home/home`, action-list and bottom-navigation region.

## Full-view comparison evidence

The supplied screenshot identifies two remaining issues: the third/fourth list icons appear incomplete, and the wider solid “去查看” button makes the fourth control group start farther left than the first three.

## Focused region comparison evidence

- Pixel inspection confirmed the effective colored content in all four previous icon crops touched the source image's bottom edge. This means the original crops did not include sufficient lower margin.
- The first three buttons used an 88rpx minimum width while the fourth used 142rpx, so a shared right-aligned Flex group could align arrow tips but not button left edges.

## Findings

- [P1 fixed in assets] List icons were cropped too tightly.
  Location: `assets/home/reference-icon-*.png`.
  Evidence: visible icon content touched the previous asset bottom edge; the user highlighted the shield and calendar rows.
  Fix: re-uploaded the full source reference and recropped all four action icons with a consistent wide source area. Each final crop visibly includes the complete subject plus white breathing room above and below; measured bottom margins are 7–16px.

- [P2 fixed in code] Fourth control group did not align with the first three.
  Location: `components/home-action-row`, `.action-row__button`.
  Evidence: the solid button was 142rpx while other buttons were 88rpx, shifting only the fourth group's left edge.
  Fix: all four buttons now use the same 128rpx width and flex basis. They remain inside the same 190rpx relative Flex end group with the same arrow gap, so button left/right edges and arrow positions align across every row.

- [P2 pending visual evidence] A post-fix simulator capture is not yet available.
  Fix: recompile and capture the same list region.

## Required fidelity surfaces

- Fonts and typography: unchanged.
- Spacing and layout rhythm: every button now occupies the same 128rpx track; the shared group remains shifted down by 8rpx as requested.
- Colors and visual tokens: each button retains its original semantic color.
- Image quality and asset fidelity: all four action icons now come from complete, wider source crops.
- Copy and content: unchanged.

## Comparison history

- Previous iterations corrected safe areas, module icons, arrow assets, and relative button/arrow layout.
- Latest evidence exposed clipped action-icon source crops and unequal button widths.
- Current iteration rebuilt all four action icons from the full reference and standardized the button track.
- Post-fix simulator evidence is required for final visual approval.

## Automated checks

- `tests/miniprogram-smoke.mjs`: passed.
- `git diff --check`: passed.

## Camp details enlargement iteration

- source visual truth path: `C:/Users/lenovo/.codex/generated_images/019f5f8d-0b5e-7061-8a09-d83e34588258/camp-three-screen-long-preview.png`
- current user screenshot: `C:/Users/lenovo/AppData/Local/Temp/codex-clipboard-3476ada2-6113-4db4-bcc2-876be3c7e8f2.png`
- implementation screenshot path: pending refreshed WeChat simulator screenshot from the user.
- viewport: WeChat mobile simulator, same third-screen state as the supplied screenshot.
- full-view evidence: the supplied implementation is materially denser and smaller than the selected long-page visual, most noticeably in the suitable rows, fee hierarchy, four-step flow, closing statement, and fixed signup bar.
- focused-region evidence: the fee card lacks a readable secondary hierarchy and supporting value statement; the flow icons and labels are undersized relative to their card.
- fixes made: enlarged the third-screen typography, card heights, row icons, numbered badges, process illustrations, closing illustration, and signup bar; rebuilt the fee card around a program kicker, larger price hierarchy, promotion badge, original price, and included-service summary while preserving the 399 yuan action and checkout route.
- required fidelity surfaces: typography, spacing rhythm, warm fee-card token, existing transparent illustration assets, and original product copy were all addressed in code.
- comparison status: post-fix visual evidence is still required before this iteration can pass.

### Large reading scale pass

- source visual truth path: `C:/Users/lenovo/AppData/Local/Temp/codex-clipboard-ddfa6ccd-7c48-4504-9eca-915dbbaea03d.png`
- pre-fix implementation evidence: `C:/Users/lenovo/AppData/Local/Temp/codex-clipboard-d4c4af1e-383a-4839-ab4f-d63553610616.png`
- requested state: use the source screenshot's reading-scale cards and typography consistently across the full long page.
- changes made: model cards now use 176rpx minimum height, 122rpx illustrations, 35rpx titles, and 26rpx descriptions; the intro, goal, system, lessons, suitable, fee, process, closing, and fixed signup regions were increased in the same proportion.
- interaction and copy: navigation, signup action, price, payment route, and content data are unchanged.
- post-fix implementation screenshot: pending user capture from the WeChat simulator.
- final visual comparison: blocked until the refreshed screenshot is supplied.

## Homepage tap-spark affordance

- source visual truth path: `C:/Users/lenovo/.codex/generated_images/019f5f8d-0b5e-7061-8a09-d83e34588258/exec-32f14b50-1430-478c-98b4-36fac2950f72.png`
- selected state: Product Design ideation option 3, theme-colored four-point tap sparkle with one offset dot.
- implementation screenshot path: pending refreshed homepage screenshot from the user.
- viewport: same mobile WeChat homepage crop as `C:/Users/lenovo/AppData/Local/Temp/codex-clipboard-25e7da47-0785-4fe9-b6d7-283a248b528c.png`.
- implementation evidence: four transparent 96 x 96 PNG assets were created for green, blue, orange, and white states; both homepage modules and action buttons consume the real image assets instead of text glyphs or CSS drawings.
- typography and copy: unchanged.
- spacing and layout rhythm: the module marker occupies a 36rpx image slot; the action marker occupies a 30rpx slot after the action label.
- colors and tokens: green, blue, orange, and white variants follow the existing semantic themes.
- image quality: transparent corners and non-empty alpha bounds were validated; each final asset is under 6 KB.
- interaction: existing tap targets and navigation paths are unchanged.
- final visual comparison: blocked until the refreshed homepage screenshot is supplied.

## Implementation checklist

1. Recompile `pages/home/home` in WeChat Developer Tools.
2. Confirm all four list icons are complete and visually centered.
3. Confirm all four button rectangles and arrow columns align.

final result: blocked

### Iteration — adaptive poster height

- pre-fix implementation screenshot: `C:/Users/lenovo/AppData/Local/Temp/codex-clipboard-68a078bf-d4bc-4692-9c77-0bb5337bc4e2.png`.
- visible defect: the inner-drive section 02 card ended near the middle of its colored poster, while a forced `900rpx` poster minimum left a large empty background before the landscape divider.
- root cause: the shared learning-habit stylesheet applied `min-height: 900rpx` to every poster and `min-height: 800rpx` to the first spotlight card; the inner-drive page imports the same stylesheet, so both pages inherited the gap.
- fix: removed both fixed minimum heights so poster and spotlight sections now size from their actual text and illustration content, retaining the existing 56rpx section-bottom breathing room.
- related-page audit: learning habit and inner drive share the repaired rule; the subject-logic and 21-day training-camp pages do not use the same fixed `900rpx` poster minimum and therefore were not changed.
- content and interaction: no text, image source, navigation path, CTA, API, or business logic changed.
- blocker: the user requested no desktop control, so refreshed WeChat simulator screenshots remain user-supplied.

final result: blocked

## Learning Habit and Inner Drive — large-poster redesign

- homepage module reference: `C:/Users/lenovo/AppData/Local/Temp/codex-clipboard-3a72f8a1-d301-4a52-a688-288931d7297f.png`.
- visual-system reference: the existing 21-day training-camp page and its large illustration, 39rpx-plus section headings, 26–30rpx body scale, rounded white cards, landscape dividers, and in-flow action card.
- implementation files: `miniprogram/packages/features/pages/module-3-habit/module-3-habit.*` and `miniprogram/packages/features/pages/module-4-drive/module-4-drive.*`.
- built-in ImageGen assets: `habit-hero-v2.webp`, `habit-child-v2.webp`, `drive-hero-v2.webp`, and `drive-family-v2.webp`; generated as soft educational illustrations, chroma-keyed, and saved with transparent backgrounds.
- layout changes: both text-card pages now use a large illustrated hero, definition strip, three poster-like reading sections, landscape separators, 40rpx section titles, 31rpx body copy, and a large in-flow CTA that does not cover text.
- content and interaction audit: every original `articleBlocks` string, navigation title, CTA label, and target route is unchanged; JavaScript diffs contain only the three new asset paths per page.
- automated validation: `npm run test:miniprogram` passed with 34 JavaScript files, 31 JSON files, and 21 pages; `git diff --check` reported no whitespace errors for both modules and their new assets.
- blocker: the user explicitly requested no desktop control, so no automated WeChat simulator capture was attempted. Refreshed user screenshots are required for final visual comparison.

final result: blocked

## Subject Logic — selected visual option 2

- source visual truth path: `C:/Users/lenovo/.codex/generated_images/019f7d60-c91f-7ca2-bf7d-d704cc210274/exec-c38550b5-6ae4-4db8-9e38-2fde79a91ef4.png`
- selected direction: large flowering tree on the left, headline and quotation on the right, a white definition strip, then a large ABC illustration and editorial reading rhythm.
- implementation files: `miniprogram/packages/features/pages/module-2-logic/module-2-logic.wxml`, `module-2-logic.wxss`, and `module-2-logic.js`.
- generated transparent assets: `hero-tree-v3.webp`, `english-bricks-v3.webp`, and `english-frame-v3.webp`.
- copy audit: every original quote, definition, English paragraph, English rule, takeaway, math paragraph, math rule, stage line, closing statement, subject line, and final line remains data-driven and rendered; the assessment navigation is unchanged.
- automated validation: `npm run test:miniprogram` passed with 34 JavaScript files, 31 JSON files, and 21 pages.
- visual capture status: WeChat Developer Tools is running, but its captured window is currently covered by another full-screen application and could not be activated through the desktop-control API. A same-viewport post-build screenshot is still needed for pixel-level comparison.

### Iteration — hero overlap repair

- pre-fix implementation screenshot path: `C:/Users/lenovo/AppData/Local/Temp/codex-clipboard-f3530437-1cbb-4b4e-a50b-fa5f14b65988.png`
- normalized comparison path: `C:/Users/lenovo/.codex/visualizations/2026/07/20/019f7d60-c91f-7ca2-bf7d-d704cc210274/subject-logic-reference-vs-implementation-20260723.png`
- source pixels: 840 x 1760; pre-fix implementation pixels: 431 x 887; comparison normalized to equal height.
- state: first poster at the top of the `学科开窍` page with native mini-program navigation retained.
- [P0 fixed in code] `.hero-definition` was absolutely positioned inside `.hero-copy`, so its containing block was the narrow headline column. It overlapped the headline and quotation and forced definition copy into near-vertical wrapping. The definition card is now a sibling of `.hero-copy` and is positioned against `.hero-poster`.
- [P1 fixed in code] Hero proportions drifted from the selected design. Hero height, landscape crop, tree scale, headline width, quote metrics, and bottom-card insets were remeasured and tightened.
- [P1 fixed in code] The first content poster was too sparse and tall. English illustration, reading spacing, list-row height, supporting icons, and takeaway padding were reduced while preserving every source sentence.
- [P2 fixed in assets] Added `definition-book-v4.webp`, a transparent built-in ImageGen asset matching the source's open-book-and-sprout motif.
- automated validation: mini-program smoke test passed; `git diff --check` reported no whitespace errors.
- blocker: the Windows capture API continues to return an unrelated full-screen surface for the WeChat Developer Tools window, so a truthful post-fix rendered comparison cannot yet be produced.

final result: blocked

### Iteration — 21-day camp typography scale

- implementation evidence supplied by user: `C:/Users/lenovo/AppData/Local/Temp/codex-clipboard-0ab69e72-f33f-4f66-b49f-c70fc8cdb214.png`, `codex-clipboard-cd22a31d-ae6b-49d4-ab81-55ed6fdab4c1.png`, and `codex-clipboard-769238e8-60a1-47a5-86e5-4227364ce5a0.png`.
- typography comparison path: `C:/Users/lenovo/.codex/visualizations/2026/07/20/019f7d60-c91f-7ca2-bf7d-d704cc210274/logic-typography-vs-camp-reference-20260723.png`.
- reference implementation: `miniprogram/packages/features/pages/module-5-camp/module-5-camp.wxss`, especially its 39rpx section titles, 30–35rpx card titles, 26–30rpx body copy, and stronger 600–900 text weights.
- finding: the repaired layout is structurally acceptable, but long-form body copy, definition copy, rule rows, stage details, subject rows, and supporting text read materially smaller and lighter than the 21-day camp page.
- fix: enlarged the logic page's body scale to 30–32rpx, section titles to 44rpx, stage titles to 33rpx, closing headline to 42rpx, and supporting labels to 28–29rpx; increased matching line heights and weights to preserve comfortable reading rhythm.
- interaction and content: all original text, scrolling behavior, navigation, and the assessment action remain unchanged.
- automated validation: mini-program smoke test passed.
- blocker: the user explicitly requested no desktop control, so no automated WeChat simulator capture was attempted. A refreshed user screenshot is required for the post-fix visual comparison.

final result: blocked
