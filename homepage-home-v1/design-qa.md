# Homepage Design QA

source visual truth path: `reference/homepage-reference.jpg`

latest implementation screenshot path: `reference/homepage-implementation-icon-button-width-before-fix.png`

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
