<template>
  <view class="home-page">
    <view class="hero">
      <view class="hero-top">
        <view class="hero-pill">
          <image class="pill-icon" src="/static/images/edu-home/icon-leaf.png" mode="aspectFit"></image>
          <text class="pill-text">自主学习是AI时代的根本能力！</text>
        </view>
        <text class="hero-title">自主学习训练营</text>
        <text class="hero-subtitle">大道至简：三大核心模块</text>
      </view>

      <view class="hero-body">
        <image class="tree-scene" src="/static/images/edu-home/tree-scene.png" mode="aspectFill"></image>

        <view class="module-stack">
          <view
            v-for="item in modules"
            :key="item.key"
            class="module-card"
            :class="'mod-' + item.tone"
            @tap="goModule(item)"
          >
            <view class="mod-badge">{{ item.badge }}</view>
            <view class="mod-info">
              <text class="mod-title">{{ item.title }}</text>
              <text class="mod-line" v-for="(line, i) in item.lines" :key="i">{{ line }}</text>
            </view>
            <view class="mod-icon">
              <image v-if="item.image" :src="item.image" mode="aspectFit" class="mod-img"></image>
              <text v-else class="mod-emoji">{{ item.emoji }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="entry-list">
      <view
        v-for="entry in entries"
        :key="entry.title"
        class="entry-card"
        :class="'ent-' + entry.tone"
        @tap="goEntry(entry)"
      >
        <view class="ent-icon">
          <image v-if="entry.image" :src="entry.image" mode="aspectFit" class="ent-img"></image>
          <text v-else class="ent-emoji">{{ entry.emoji }}</text>
        </view>
        <view class="ent-copy">
          <text class="ent-title">{{ entry.title }}</text>
          <text class="ent-desc">{{ entry.desc }}</text>
        </view>
        <view class="ent-action">{{ entry.action }}</view>
        <text class="ent-arrow">›</text>
      </view>
    </view>

    <view class="tabbar">
      <view
        v-for="tab in tabs"
        :key="tab.label"
        class="tab-item"
        :class="{ 'is-active': tab.active }"
        @tap="handleTab(tab)"
      >
        <image class="tab-icon" :src="tab.icon" mode="aspectFit"></image>
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      modules: [
        { key: 'leaf', badge: '叶', title: '知识', lines: ['学科性格开窍法'], tone: 'green', emoji: '🌱', url: '/pages/assessment/subject' },
        { key: 'stem', badge: '茎', title: '习惯', lines: ['习惯养成', 'SOP高效作业法'], tone: 'blue', image: '/static/images/edu-home/icon-clipboard.png', url: '/pages/profile/camp' },
        { key: 'root', badge: '根', title: '内驱', lines: ['慧眼读心赋能法'], tone: 'orange', emoji: '❤️', url: '/pages/assessment/heart' }
      ],
      entries: [
        { image: '/static/images/edu-home/icon-open.png', title: '一张图让孩子学科开窍', desc: '启发灵感，让学习更加生动有趣', action: '测评', tone: 'green', url: '/pages/assessment/subject' },
        { image: '/static/images/edu-home/icon-clipboard.png', title: '一张图养成作业好习惯', desc: '运用工具，让流程更加科学高效', action: '下载', tone: 'blue', url: '/pages/profile/camp' },
        { emoji: '🛡️', title: '一张图让家长读懂孩子心', desc: '读懂孩子，让内心更有自信力量！', action: '测评', tone: 'orange', url: '/pages/assessment/heart' },
        { emoji: '📅', title: '21天训练营计划', desc: '21天陪伴式训练，见证孩子的成长蜕变', action: '去查看', tone: 'solid', url: '/pages/profile/camp' }
      ],
      tabs: [
        { label: '首页', active: true, icon: '/static/images/edu-home/tab-home.png' },
        { label: '我的', active: false, icon: '/static/images/edu-home/tab-user.png' },
        { label: '线下', active: false, icon: '/static/images/edu-home/tab-offline.png' }
      ]
    };
  },
  methods: {
    goModule(item) {
      uni.navigateTo({ url: item.url });
    },
    goEntry(entry) {
      uni.navigateTo({ url: entry.url });
    },
    handleTab(tab) {
      if (tab.label === '我的') {
        uni.navigateTo({ url: '/pages/profile/index' });
      } else if (tab.label === '线下') {
        uni.showToast({ title: '线下服务规划中', icon: 'none' });
      }
    }
  }
};
</script>

<style lang="scss">
.home-page {
  min-height: 100vh;
  padding-bottom: calc(130rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #cfeefa 0%, #f5fbff 54%, #eef7f7 100%);
}

.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #bfeaff 0%, #f3fbff 51%, #f5fbf8 100%);
}

.hero-top {
  position: relative;
  z-index: 5;
  padding: 64rpx 78rpx 0;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 14rpx;
  height: 54rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8rpx 20rpx rgba(30, 125, 128, 0.08);
}

.pill-icon {
  width: 30rpx;
  height: 30rpx;
}

.pill-text {
  color: #0aa462;
  font-size: 24rpx;
  font-weight: 800;
}

.hero-title {
  display: block;
  margin-top: 32rpx;
  color: #071b53;
  font-size: 72rpx;
  font-weight: 950;
  line-height: 1.05;
  text-shadow: 0 3rpx 0 rgba(255, 255, 255, 0.28);
}

.hero-subtitle {
  display: block;
  margin-top: 16rpx;
  color: #365175;
  font-size: 34rpx;
  font-weight: 850;
  line-height: 1.15;
}

.hero-body {
  position: relative;
  margin-top: 30rpx;
  height: 580rpx;
}

.tree-scene {
  position: absolute;
  left: 0;
  top: 0;
  width: 431rpx;
  height: 580rpx;
  z-index: 1;
}

.module-stack {
  position: relative;
  z-index: 6;
  margin-left: 420rpx;
  margin-right: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.module-card {
  display: flex;
  align-items: flex-start;
  padding: 24rpx 18rpx 21rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12rpx 26rpx rgba(56, 95, 128, 0.14);
}

.mod-green { border: 1px solid rgba(0, 173, 102, 0.38); }
.mod-blue { border: 1px solid rgba(47, 123, 255, 0.3); }
.mod-orange { border: 1px solid rgba(255, 141, 23, 0.33); }

.mod-badge {
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  color: #fff;
  font-size: 32rpx;
  font-weight: 950;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mod-green .mod-badge { background: linear-gradient(135deg, #05aa66, #12bf71); }
.mod-blue .mod-badge { background: linear-gradient(135deg, #2a72ff, #2688ff); }
.mod-orange .mod-badge { background: linear-gradient(135deg, #ff8615, #ff9b28); }

.mod-info {
  flex: 1;
  min-width: 0;
  padding-left: 18rpx;
}

.mod-title {
  display: block;
  font-size: 32rpx;
  font-weight: 950;
  line-height: 1;
}

.mod-line {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  font-weight: 850;
  line-height: 1.2;
  opacity: 0.8;
}

.mod-icon {
  flex-shrink: 0;
  margin-left: 10rpx;
}

.mod-img {
  width: 56rpx;
  height: 56rpx;
}

.mod-emoji {
  font-size: 48rpx;
  line-height: 1;
}

.entry-list {
  position: relative;
  z-index: 7;
  padding: 20rpx 30rpx 0;
}

.entry-card {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx;
  margin-bottom: 18rpx;
  border-radius: 27rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10rpx 28rpx rgba(39, 86, 124, 0.1);
}

.ent-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 24rpx;
  background: #f1fbf7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ent-img {
  width: 80rpx;
  height: 80rpx;
}

.ent-emoji {
  font-size: 44rpx;
}

.ent-orange .ent-icon { background: #fff7ec; }
.ent-solid .ent-icon { background: #effaf4; }

.ent-copy {
  flex: 1;
  min-width: 0;
  padding: 0 20rpx;
}

.ent-title {
  display: block;
  overflow: hidden;
  color: #071224;
  font-size: 28rpx;
  font-weight: 950;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ent-desc {
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  color: #60718d;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ent-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80rpx;
  height: 50rpx;
  padding: 0 20rpx;
  border: 2rpx solid currentColor;
  border-radius: 999rpx;
  background: #fff;
  font-size: 22rpx;
  font-weight: 900;
  white-space: nowrap;
  flex-shrink: 0;
}

.ent-green .ent-action { color: #06ad65; }
.ent-blue .ent-action { color: #1c72ff; }
.ent-orange .ent-action { color: #ff8316; }

.ent-solid .ent-action {
  min-width: 160rpx;
  height: 64rpx;
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #09ad68, #16c87a);
  box-shadow: 0 10rpx 18rpx rgba(9, 173, 104, 0.24);
  font-size: 28rpx;
}

.ent-arrow {
  margin-left: 12rpx;
  color: #9aa8b7;
  font-size: 48rpx;
  font-weight: 300;
  flex-shrink: 0;
}

.ent-solid .ent-arrow {
  display: none;
}

.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  height: 110rpx;
  padding: 10rpx 60rpx 0;
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 68rpx 68rpx 0 0;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -12rpx 28rpx rgba(37, 78, 116, 0.08);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  color: #738296;
}

.tab-item.is-active {
  color: #09b96b;
}

.tab-icon {
  width: 44rpx;
  height: 44rpx;
}

.tab-label {
  font-size: 22rpx;
  font-weight: 800;
}
</style>
