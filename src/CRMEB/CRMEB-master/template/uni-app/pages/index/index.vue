<template>
  <view class="home-screen">
    <view class="hero-copy">
      <view class="hero-pill">
        <image class="pill-icon" src="/static/images/edu-home/icon-leaf.png" mode="aspectFit"></image>
        <text>自主学习是AI时代的根本能力！</text>
      </view>
      <view class="hero-title">自主学习训练营</view>
      <view class="hero-subtitle">大道至简： 三大核心模块</view>
    </view>

    <view class="hero-visual">
      <image class="tree-scene" src="/static/images/edu-home/tree-scene.png" mode="widthFix"></image>

      <view class="module-stack">
        <button
          v-for="item in modules"
          :key="item.key"
          class="module-card"
          :class="item.tone"
          @tap="openModule(item.url)"
        >
          <view class="connector">
            <view class="connector-dot"></view>
            <view class="connector-line"></view>
          </view>
          <view class="module-badge">{{ item.symbol }}</view>
          <view class="module-text">
            <view class="module-name">{{ item.name }}</view>
            <view class="module-sub">{{ item.sub }}</view>
            <view v-if="item.extra" class="module-extra">{{ item.extra }}</view>
          </view>
          <image class="module-icon" :src="item.icon" mode="aspectFit"></image>
        </button>
      </view>
    </view>

    <view class="entry-list">
      <button
        v-for="item in entries"
        :key="item.key"
        class="entry-card"
        :class="item.tone"
        @tap="handleEntry(item)"
      >
        <image class="entry-icon" :src="item.icon" mode="aspectFit"></image>
        <view class="entry-copy">
          <view class="entry-title">{{ item.title }}</view>
          <view class="entry-desc">{{ item.desc }}</view>
        </view>
        <view class="entry-action">{{ item.action }}</view>
        <view class="entry-chevron">›</view>
      </button>
    </view>

    <view class="bottom-nav">
      <button
        v-for="item in tabs"
        :key="item.key"
        class="tab-button"
        :class="{ active: item.active }"
        @tap="handleTab(item)"
      >
        <image class="tab-icon" :src="item.icon" mode="aspectFit"></image>
        <text>{{ item.label }}</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      modules: [
        {
          key: "leaf",
          symbol: "叶",
          tone: "leaf",
          name: "知识",
          sub: "学科性格开窍法",
          icon: "/static/images/edu-home/icon-leaf.png",
          url: "/pages/leaf/knowledge",
        },
        {
          key: "stem",
          symbol: "茎",
          tone: "stem",
          name: "习惯",
          sub: "习惯养成",
          extra: "SOP高效作业法",
          icon: "/static/images/edu-home/icon-task.png",
          url: "/pages/stem/habits",
        },
        {
          key: "root",
          symbol: "根",
          tone: "root",
          name: "内驱",
          sub: "慧眼读心赋能法",
          icon: "/static/images/edu-home/icon-heart.png",
          url: "/pages/root/inner",
        },
      ],
      entries: [
        {
          key: "leaf-entry",
          tone: "leaf",
          icon: "/static/images/edu-home/icon-open.png",
          title: "一张图让孩子学科开窍",
          desc: "启发灵感，让学习更加生动有趣",
          action: "测评",
          url: "/pages/leaf/knowledge",
        },
        {
          key: "stem-entry",
          tone: "stem",
          icon: "/static/images/edu-home/icon-clipboard.png",
          title: "一张图养成作业好习惯",
          desc: "运用工具，让流程更加科学高效",
          action: "下载",
          url: "/pages/stem/habits",
        },
        {
          key: "root-entry",
          tone: "root",
          icon: "/static/images/edu-home/icon-shield.png",
          title: "一张图让家长读懂孩子心",
          desc: "读懂孩子，让内心更有自信力量！",
          action: "测评",
          url: "/pages/root/inner",
        },
        {
          key: "plan-entry",
          tone: "plan",
          icon: "/static/images/edu-home/icon-calendar.png",
          title: "21天训练营计划",
          desc: "21天陪伴式训练，见证孩子的成长蜕变",
          action: "去查看",
          url: "/pages/stem/habits",
        },
      ],
      tabs: [
        {
          key: "home",
          label: "首页",
          active: true,
          icon: "/static/images/edu-home/tab-home.png",
        },
        {
          key: "mine",
          label: "我的",
          icon: "/static/images/edu-home/tab-user.png",
          url: "/pages/user/index",
        },
        {
          key: "offline",
          label: "线下",
          icon: "/static/images/edu-home/tab-offline.png",
        },
      ],
    };
  },
  methods: {
    openModule(url) {
      uni.navigateTo({ url });
    },
    handleEntry(item) {
      this.openModule(item.url);
    },
    handleTab(item) {
      if (item.key === "home") return;
      if (item.url) {
        uni.navigateTo({ url: item.url });
        return;
      }
      uni.showToast({
        title: "线下服务规划中",
        icon: "none",
      });
    },
  },
};
</script>

<style lang="scss">
.home-screen {
  min-height: 100vh;
  padding: 32rpx 30rpx 148rpx;
  padding-top: calc(32rpx + env(safe-area-inset-top));
  background:
    radial-gradient(circle at 82% 6%, rgba(255, 255, 255, 0.96), transparent 20%),
    linear-gradient(180deg, #bfeeff 0%, #eaf8ff 34%, #f4fbf2 56%, #ffffff 100%);
}

.hero-copy {
  position: relative;
  z-index: 2;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  height: 56rpx;
  padding: 0 24rpx 0 16rpx;
  border-radius: 999rpx;
  color: #07955b;
  font-size: 27rpx;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10rpx 28rpx rgba(42, 118, 91, 0.08);
}

.pill-icon {
  width: 38rpx;
  height: 38rpx;
  margin-right: 10rpx;
}

.hero-title {
  margin-top: 26rpx;
  color: #061b58;
  font-size: 74rpx;
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: 0;
}

.hero-subtitle {
  margin-top: 18rpx;
  color: #29466d;
  font-size: 34rpx;
  line-height: 1.25;
  font-weight: 800;
}

.hero-visual {
  position: relative;
  height: 676rpx;
  margin: 14rpx -30rpx 0;
  overflow: hidden;
}

.tree-scene {
  position: absolute;
  left: 0;
  top: 0;
  width: 430rpx;
  z-index: 1;
}

.module-stack {
  position: absolute;
  right: 30rpx;
  top: 38rpx;
  width: 292rpx;
  z-index: 3;
}

.module-card,
.entry-card,
.tab-button {
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  line-height: normal;
}

.module-card::after,
.entry-card::after,
.tab-button::after {
  border: 0;
}

.module-card {
  position: relative;
  width: 292rpx;
  min-height: 150rpx;
  padding: 26rpx 20rpx 22rpx 30rpx;
  border-radius: 28rpx;
  border: 2rpx solid rgba(35, 166, 105, 0.2);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12rpx 32rpx rgba(44, 90, 96, 0.12);
  display: flex;
  align-items: center;
  text-align: left;
}

.module-card + .module-card {
  margin-top: 34rpx;
}

.module-card.stem {
  border-color: rgba(37, 116, 236, 0.24);
}

.module-card.root {
  border-color: rgba(247, 139, 28, 0.28);
}

.connector {
  position: absolute;
  left: -122rpx;
  top: 50%;
  width: 122rpx;
  height: 78rpx;
  transform: translateY(-50%);
}

.connector-line {
  position: absolute;
  right: 0;
  top: 34rpx;
  width: 116rpx;
  height: 38rpx;
  border-left: 6rpx solid currentColor;
  border-bottom: 6rpx solid currentColor;
  border-radius: 0 0 0 34rpx;
}

.connector-dot {
  position: absolute;
  left: 0;
  top: 25rpx;
  width: 20rpx;
  height: 20rpx;
  border: 6rpx solid #ffffff;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 4rpx 10rpx rgba(28, 103, 75, 0.16);
}

.stem .connector-line {
  top: 20rpx;
  height: 58rpx;
}

.root .connector-line {
  top: 0;
  height: 76rpx;
  border-top: 0;
}

.module-badge {
  width: 62rpx;
  height: 62rpx;
  border-radius: 50%;
  color: #ffffff;
  font-size: 31rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #00a665;
}

.module-card.leaf {
  color: #00a665;
}

.module-card.stem {
  color: #2274ee;
}

.module-card.root {
  color: #f38720;
}

.module-card.stem .module-badge {
  background: #2274ee;
}

.module-card.root .module-badge {
  background: #f38720;
}

.module-text {
  min-width: 0;
  flex: 1;
  padding-left: 16rpx;
}

.module-name {
  color: currentColor;
  font-size: 33rpx;
  line-height: 1.15;
  font-weight: 900;
}

.module-sub {
  margin-top: 14rpx;
  color: currentColor;
  font-size: 25rpx;
  line-height: 1.25;
  font-weight: 800;
}

.module-extra {
  margin-top: 8rpx;
  color: #22324a;
  font-size: 24rpx;
  line-height: 1.25;
}

.module-icon {
  width: 62rpx;
  height: 62rpx;
  margin-left: 8rpx;
  flex-shrink: 0;
}

.stem .module-icon,
.root .module-icon {
  width: 70rpx;
  height: 70rpx;
}

.entry-list {
  position: relative;
  z-index: 4;
  margin-top: 20rpx;
}

.entry-card {
  width: 100%;
  min-height: 132rpx;
  margin-bottom: 20rpx;
  padding: 20rpx 20rpx 20rpx 24rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16rpx 44rpx rgba(42, 72, 97, 0.1);
  display: flex;
  align-items: center;
  text-align: left;
}

.entry-icon {
  width: 88rpx;
  height: 88rpx;
  flex-shrink: 0;
}

.entry-copy {
  min-width: 0;
  flex: 1;
  padding-left: 30rpx;
}

.entry-title {
  color: #121826;
  font-size: 31rpx;
  line-height: 1.25;
  font-weight: 900;
}

.entry-desc {
  margin-top: 12rpx;
  color: #697891;
  font-size: 24rpx;
  line-height: 1.32;
}

.entry-action {
  min-width: 76rpx;
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  border: 2rpx solid currentColor;
  color: #03a566;
  font-size: 24rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.entry-card.stem .entry-action {
  color: #2473ef;
}

.entry-card.root .entry-action {
  color: #f18822;
}

.entry-card.plan .entry-action {
  min-width: 128rpx;
  height: 56rpx;
  border: 0;
  color: #ffffff;
  font-size: 27rpx;
  background: linear-gradient(135deg, #18bf76, #08a765);
  box-shadow: 0 8rpx 20rpx rgba(14, 170, 98, 0.2);
}

.entry-chevron {
  width: 30rpx;
  margin-left: 14rpx;
  color: #9aa8b8;
  font-size: 52rpx;
  line-height: 1;
  font-weight: 300;
  text-align: center;
  flex-shrink: 0;
}

.entry-card.plan .entry-chevron {
  color: #ffffff;
  margin-left: -28rpx;
  font-size: 44rpx;
  z-index: 2;
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  height: 116rpx;
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 34rpx 34rpx 0 0;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -12rpx 40rpx rgba(43, 73, 105, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.tab-button {
  width: 170rpx;
  height: 94rpx;
  color: #75849a;
  font-size: 23rpx;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tab-button.active {
  color: #08a765;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 6rpx;
}
</style>
