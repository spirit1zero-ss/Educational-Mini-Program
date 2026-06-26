import {
  CalendarDays,
  Heart,
  Home as HomeIcon,
  Leaf,
  Sprout,
  ShieldCheck,
  Target,
  UserRound
} from 'lucide-react';
import treeScene from '../CRMEB/CRMEB-master/template/uni-app/static/images/edu-home/tree-scene.png';
import iconClipboard from '../CRMEB/CRMEB-master/template/uni-app/static/images/edu-home/icon-clipboard.png';
import iconOpen from '../CRMEB/CRMEB-master/template/uni-app/static/images/edu-home/icon-open.png';

const modules = [
  {
    key: 'leaf',
    badge: '叶',
    title: '知识',
    lines: ['学科性格开窍法'],
    tone: 'green',
    icon: <Sprout size={54} strokeWidth={2.4} />
  },
  {
    key: 'stem',
    badge: '茎',
    title: '习惯',
    lines: ['习惯养成', 'SOP高效作业法'],
    tone: 'blue',
    image: iconClipboard
  },
  {
    key: 'root',
    badge: '根',
    title: '内驱',
    lines: ['慧眼读心赋能法'],
    tone: 'orange',
    icon: <Heart size={62} fill="currentColor" strokeWidth={1.7} />
  }
];

const entries = [
  {
    icon: iconOpen,
    title: '一张图让孩子学科开窍',
    desc: '启发灵感，让学习更加生动有趣',
    action: '测评',
    tone: 'green'
  },
  {
    icon: iconClipboard,
    title: '一张图养成作业好习惯',
    desc: '运用工具，让流程更加科学高效',
    action: '下载',
    tone: 'blue'
  },
  {
    title: '一张图让家长读懂孩子心',
    desc: '读懂孩子，让内心更有自信力量！',
    action: '测评',
    tone: 'orange',
    icon: ShieldCheck
  },
  {
    title: '21天训练营计划',
    desc: '21天陪伴式训练，见证孩子的成长蜕变',
    action: '去查看',
    tone: 'solid',
    icon: CalendarDays
  }
];

const tabs = [
  { label: '首页', active: true, icon: HomeIcon },
  { label: '我的', active: false, icon: UserRound },
  { label: '线下', active: false, icon: Target }
];

export default function Home() {
  return (
    <main className="home-preview-page">
      <section className="home-artboard" aria-label="自主学习训练营首页视觉预览">
        <div className="hero-area">
          <div className="hero-pill">
            <Leaf size={25} fill="currentColor" strokeWidth={2.2} />
            <span>自主学习是AI时代的根本能力！</span>
          </div>

          <h1 className="hero-title">自主学习训练营</h1>
          <p className="hero-subtitle">大道至简：三大核心模块</p>

          <img className="tree-scene" src={treeScene} alt="" />

          <div className="module-stack" aria-label="三大核心模块">
            {modules.map((item) => (
              <button className={`module-card module-${item.tone}`} key={item.key} type="button">
                <span className="module-badge">{item.badge}</span>
                <span className="module-copy">
                  <strong>{item.title}</strong>
                  {item.lines.map((line) => (
                    <em key={line}>{line}</em>
                  ))}
                </span>
                <span className="module-icon">
                  {item.image ? <img src={item.image} alt="" /> : item.icon}
                </span>
              </button>
            ))}
          </div>
        </div>

        <section className="entry-list" aria-label="首页入口">
          {entries.map((entry) => (
            <button className={`entry-card entry-${entry.tone}`} key={entry.title} type="button">
              <span className="entry-icon">
                {typeof entry.icon === 'string' ? <img src={entry.icon} alt="" /> : <entry.icon size={66} strokeWidth={2.4} />}
              </span>
              <span className="entry-copy">
                <strong>{entry.title}</strong>
                <em>{entry.desc}</em>
              </span>
              <span className="entry-action">{entry.action}</span>
              <span className="entry-chevron" aria-hidden="true">›</span>
            </button>
          ))}
        </section>

        <nav className="visual-tabbar" aria-label="底部导航">
          {tabs.map((tab) => (
            <button className={`tab-item${tab.active ? ' is-active' : ''}`} key={tab.label} type="button">
              <tab.icon size={34} strokeWidth={2.5} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}
