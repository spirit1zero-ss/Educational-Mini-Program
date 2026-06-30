# Homepage Design Spec

## Product Design Target

- Product: 自主学习训练营 WeChat Mini Program homepage
- Reference mockup: `design/homepage-approved-mockup.png`
- Goal: Explain the three-part growth model first, then route users into exactly three actions: two assessments and one download.
- Visual tone: clean mini program, friendly education, parent-trustworthy, light sage/white surfaces, restrained deep green accents.

## Page Structure

Route candidate: `pages/home/home`

1. Custom header
   - Title: `自主学习训练营`
   - Right side reserves WeChat capsule space.

2. Model hero
   - Headline: `自主学习是 AI 时代的根本能力`
   - Subtitle: `内驱力、学习习惯、学科开窍，三大能力一起生长`
   - Left visual: growth tree.
   - Right model cards:
     - `学科开窍` / `学科性格开窍法`
     - `学习习惯` / `SOP高效作业法`
     - `内驱力` / `慧眼读心赋能法`

3. Action section
   - Section title: `先从一个入口开始`
   - Action 1:
     - Title: `一张图让孩子学科开窍`
     - Desc: `启发灵感，让学习更加生动有趣`
     - Action: `去测评`
   - Action 2:
     - Title: `一张图让家长读懂孩子心`
     - Desc: `读懂孩子，让内心更有自信力量`
     - Action: `去测评`
   - Action 3:
     - Title: `一张图养成作业好习惯`
     - Desc: `运用工具，让流程更加科学高效`
     - Action: `下载`

4. Training camp strip
   - Text: `21天线上特训营 · 直播课 + 打卡陪跑 + 答疑`
   - Chip: `399元`
   - Role: secondary conversion only; do not compete with the three action rows.

5. Bottom tab
   - `首页`
   - `我的`
   - `线下`
   - Active: `首页`

## Image vs WXSS

### Use Image Assets

- Growth tree hero image:
  - Use `miniprogram/assets/home-tree-rounded-sparse-roots-v3.png` as the initial source if building from the selected tree direction.
  - If closer fidelity to the mockup is needed, export a cleaned tree-only asset from the mockup direction before implementation.
  - The tree and subtle connector-line base may be image-backed only if alignment is easier. Prefer cards and text as WXML/WXSS overlays.

### Use WXSS

- Page background color and soft section surfaces.
- Header layout and safe-area spacing.
- Headline, subtitle, all text.
- Three model cards on the right.
- Action rows/cards.
- Chips, tags, buttons, arrows, borders, shadows, radius.
- Training camp strip.
- Bottom tab layout and active state.

Do not slice the whole hero or full homepage as an image. Keep UI text and cards native.

## Component Plan

- `home-hero-model`
  - Props/data: `modules`
  - Owns tree image placement and the three connected model cards.

- `home-action-entry`
  - Props/data: `title`, `desc`, `actionText`, `type`
  - Emits: `tap`
  - Variants: `subject-test`, `heart-test`, `download`

- `home-camp-strip`
  - Props/data: `text`, `chip`
  - Emits: `tap`

- `bottom-tab`
  - Props/data: active tab, tab list
  - Emits: `change`

For first implementation, these can be page-local WXML blocks. Extract to `components/` when the second page uses the same action rows or bottom tab.

## Data Shape

```js
{
  modules: [
    { key: 'subject', title: '学科开窍', subtitle: '学科性格开窍法' },
    { key: 'habit', title: '学习习惯', subtitle: 'SOP高效作业法' },
    { key: 'drive', title: '内驱力', subtitle: '慧眼读心赋能法' }
  ],
  actions: [
    {
      key: 'subject-test',
      title: '一张图让孩子学科开窍',
      desc: '启发灵感，让学习更加生动有趣',
      actionText: '去测评',
      path: '/pages/assessment/subject'
    },
    {
      key: 'heart-test',
      title: '一张图让家长读懂孩子心',
      desc: '读懂孩子，让内心更有自信力量',
      actionText: '去测评',
      path: '/pages/assessment/heart'
    },
    {
      key: 'sop-download',
      title: '一张图养成作业好习惯',
      desc: '运用工具，让流程更加科学高效',
      actionText: '下载',
      path: ''
    }
  ],
  tabs: [
    { key: 'home', text: '首页' },
    { key: 'mine', text: '我的' },
    { key: 'offline', text: '线下' }
  ]
}
```

## Adaptation Checks

- iPhone: reserve top safe area and WeChat capsule area; bottom tab uses safe-area bottom padding.
- Small Android: hero model must not force horizontal overflow; tree can shrink and cards stay readable.
- Text: long action titles wrap to one or two lines without clipping.
- Tap targets: action rows and bottom tabs keep at least 88rpx height.
- Hero: if tree/card overlap becomes tight, reduce tree size before reducing text size.
