<template>
  <view class="home-page">
    <view class="hero">
      <image
        class="hero-bg"
        src="/static/images/edu-home/home-tree-bg.png"
        mode="widthFix"
      ></image>

      <view class="hero-copy">
        <view class="hero-pill">
          <image
            class="pill-icon"
            src="/static/images/edu-home/icon-leaf.png"
            mode="aspectFit"
          ></image>
          <text>自主学习是AI时代的根本能力！</text>
        </view>
        <view class="hero-title">自主学习训练营</view>
        <view class="hero-subtitle">大道至简：三大核心模块</view>
      </view>

      <view class="module-list">
        <button
          v-for="item in modules"
          :key="item.key"
          class="module-card tap-clean"
          :class="item.key"
          @tap="goTo(item.url)"
        >
          <view class="connector">
            <view class="connector-dot"></view>
            <view class="connector-line"></view>
          </view>
          <view class="module-badge">{{ item.mark }}</view>
          <view class="module-copy">
            <view class="module-title-row">
              <text class="module-title">{{ item.title }}</text>
              <image class="module-icon" :src="item.icon" mode="aspectFit"></image>
            </view>
            <view class="module-desc">{{ item.desc }}</view>
            <view v-if="item.extra" class="module-extra">{{ item.extra }}</view>
          </view>
        </button>
      </view>
    </view>

    <view class="entry-section">
      <button
        v-for="item in entries"
        :key="item.key"
        class="entry-card tap-clean"
        :class="item.key"
        @tap="handleEntry(item)"
      >
        <image class="entry-icon" :src="item.icon" mode="aspectFit"></image>
        <view class="entry-copy">
          <view class="entry-title">{{ item.title }}</view>
          <view class="entry-desc">{{ item.desc }}</view>
        </view>
        <view class="entry-action">{{ item.action }}</view>
        <view class="entry-arrow"></view>
      </button>
    </view>

    <view class="bottom-nav">
      <button
        v-for="item in tabs"
        :key="item.key"
        class="nav-item tap-clean"
        :class="{ active: item.key === 'home' }"
        @tap="handleTab(item)"
      >
        <image class="nav-icon" :src="item.icon" mode="aspectFit"></image>
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
          mark: "叶",
          title: "知识",
          desc: "学科性格开窍法",
          icon: "/static/images/edu-home/icon-leaf.png",
          url: "/pages/leaf/knowledge",
        },
        {
          key: "stem",
          mark: "茎",
          title: "习惯",
          desc: "习惯养成",
          extra: "SOP高效作业法",
          icon: "/static/images/edu-home/icon-clipboard.png",
          url: "/pages/stem/habits",
        },
        {
          key: "root",
          mark: "根",
          title: "内驱",
          desc: "慧眼读心赋能法",
          icon: "/static/images/edu-home/icon-heart.png",
          url: "/pages/root/inner",
        },
      ],
      entries: [
        {
          key: "leaf-entry",
          icon: "/static/images/edu-home/icon-open.png",
          title: "一张图让孩子学科开窍",
          desc: "启发灵感，让学习更加生动有趣",
          action: "测评",
          url: "/pages/leaf/knowledge",
        },
        {
          key: "stem-entry",
          icon: "/static/images/edu-home/icon-clipboard.png",
          title: "一张图养成作业好习惯",
          desc: "运用工具，让流程更加科学高效",
          action: "下载",
          url: "/pages/stem/habits",
        },
        {
          key: "root-entry",
          icon: "/static/images/edu-home/icon-shield.png",
          title: "一张图让家长读懂孩子心",
          desc: "读懂孩子，让内心更有自信力量！",
          action: "测评",
          url: "/pages/root/inner",
        },
        {
          key: "plan-entry",
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
          icon: "/static/images/edu-home/tab-home.png",
        },
        {
          key: "mine",
          label: "我的",
          icon: "/static/images/edu-home/tab-user.png",
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
    goTo(url) {
      if (!url) return;
      uni.navigateTo({ url });
    },
    handleEntry(item) {
      this.goTo(item.url);
    },
    handleTab(item) {
      if (item.key === "home") return;
      uni.showToast({
        title: item.key === "mine" ? "我的页面规划中" : "线下服务规划中",
        icon: "none",
      });
    },
  },
};
</script>

<style lang="scss">
.home-page {
  min-height: 100vh;
  padding-bottom: calc(138rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #e9f9ff 0%, #f5fbf4 52%, #ffffff 100%);
  overflow-x: hidden;
}

.tap-clean {
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  line-height: normal;
  text-align: left;
}

.tap-clean::after {
  border: 0;
}

.hero {
  position: relative;
  min-height: 886rpx;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 750rpx;
  height: auto;
  z-index: 0;
}

.hero::after {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2rpx;
  height: 96rpx;
  z-index: 1;
  content: "";
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), #ffffff 72%);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 3;
  padding: calc(34rpx + env(safe-area-inset-top)) 38rpx 0;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  max-width: 650rpx;
  height: 58rpx;
  padding: 0 28rpx 0 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10rpx 26rpx rgba(35, 116, 82, 0.1);
  color: #07955b;
  font-size: 27rpx;
  font-weight: 800;
}

.pill-icon {
  width: 38rpx;
  height: 38rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.hero-title {
  width: 660rpx;
  margin-top: 32rpx;
  color: #061b58;
  font-size: 74rpx;
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: 0;
}

.hero-subtitle {
  margin-top: 16rpx;
  color: #29466d;
  font-size: 33rpx;
  line-height: 1.2;
  font-weight: 800;
}

.module-list {
  position: absolute;
  right: 30rpx;
  top: 310rpx;
  z-index: 4;
  width: 286rpx;
}

.module-card {
  position: relative;
  width: 286rpx;
  min-height: 150rpx;
  padding: 24rpx 20rpx 20rpx 28rpx;
  border-radius: 28rpx;
  border: 2rpx solid rgba(27, 172, 107, 0.22);
  background: rgba(255, 255, 255, 0.93);
  box-shadow: 0 14rpx 34rpx rgba(47, 87, 96, 0.14);
  display: flex;
  align-items: center;
}

.module-card + .module-card {
  margin-top: 34rpx;
}

.module-card.leaf {
  color: #03a566;
}

.module-card.stem {
  color: #2473ef;
  border-color: rgba(36, 115, 239, 0.24);
}

.module-card.root {
  color: #f28a24;
  border-color: rgba(242, 138, 36, 0.26);
}

.connector {
  position: absolute;
  left: -128rpx;
  top: 50%;
  width: 128rpx;
  height: 74rpx;
  transform: translateY(-50%);
  color: inherit;
}

.connector-line {
  position: absolute;
  right: 0;
  top: 30rpx;
  width: 116rpx;
  height: 34rpx;
  border-left: 6rpx solid currentColor;
  border-bottom: 6rpx solid currentColor;
  border-radius: 0 0 0 32rpx;
}

.stem .connector-line {
  top: 18rpx;
  height: 54rpx;
}

.root .connector-line {
  top: 0;
  height: 74rpx;
}

.connector-dot {
  position: absolute;
  left: 0;
  top: 24rpx;
  width: 20rpx;
  height: 20rpx;
  border: 6rpx solid #ffffff;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
}

.module-badge {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: currentColor;
  color: #ffffff;
  font-size: 31rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.module-copy {
  min-width: 0;
  flex: 1;
  padding-left: 18rpx;
}

.module-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.module-title {
  color: currentColor;
  font-size: 32rpx;
  line-height: 1.1;
  font-weight: 900;
}

.module-icon {
  width: 50rpx;
  height: 50rpx;
  margin-left: 10rpx;
  flex-shrink: 0;
}

.stem .module-icon,
.root .module-icon {
  width: 58rpx;
  height: 58rpx;
}

.module-desc {
  margin-top: 14rpx;
  color: currentColor;
  font-size: 24rpx;
  line-height: 1.24;
  font-weight: 800;
}

.module-extra {
  margin-top: 8rpx;
  color: #24334b;
  font-size: 23rpx;
  line-height: 1.22;
  font-weight: 500;
}

.entry-section {
  position: relative;
  z-index: 5;
  padding: 10rpx 30rpx 0;
  margin-top: -10rpx;
}

.entry-card {
  width: 100%;
  min-height: 128rpx;
  margin-bottom: 18rpx;
  padding: 18rpx 20rpx 18rpx 24rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 16rpx 42rpx rgba(44, 75, 105, 0.1);
  display: flex;
  align-items: center;
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
  font-size: 30rpx;
  line-height: 1.22;
  font-weight: 900;
}

.entry-desc {
  margin-top: 12rpx;
  color: #697891;
  font-size: 24rpx;
  line-height: 1.34;
  font-weight: 500;
}

.entry-action {
  min-width: 78rpx;
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

.stem-entry .entry-action {
  color: #2473ef;
}

.root-entry .entry-action {
  color: #f28a24;
}

.plan-entry .entry-action {
  min-width: 130rpx;
  height: 58rpx;
  padding-right: 34rpx;
  border: 0;
  color: #ffffff;
  font-size: 27rpx;
  background: linear-gradient(135deg, #19bf77, #08a765);
  box-shadow: 0 8rpx 20rpx rgba(14, 170, 98, 0.22);
}

.entry-arrow {
  width: 20rpx;
  height: 20rpx;
  margin-left: 16rpx;
  border-top: 5rpx solid #a5b0bf;
  border-right: 5rpx solid #a5b0bf;
  transform: rotate(45deg);
  flex-shrink: 0;
}

.plan-entry .entry-arrow {
  margin-left: -38rpx;
  border-color: #ffffff;
  z-index: 2;
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  height: 112rpx;
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 36rpx 36rpx 0 0;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 -12rpx 42rpx rgba(43, 73, 105, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.nav-item {
  width: 170rpx;
  height: 94rpx;
  color: #748399;
  font-size: 23rpx;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nav-item.active {
  color: #08a765;
}

.nav-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 6rpx;
}
</style>
