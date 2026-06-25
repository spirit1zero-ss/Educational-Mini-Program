<template>
  <view class="habits-page">
    <view class="topbar">
      <button class="back-button" @tap="goBack"></button>
      <view class="top-title">茎 · 习惯养成</view>
      <view class="top-space"></view>
    </view>

    <view class="hero-card">
      <view class="hero-copy">
        <view class="eyebrow">SOP 高效作业法</view>
        <view class="title">让流程变清楚</view>
        <view class="lead">运用工具，让流程更加科学。把每天的作业拆成看得见、做得到、能复盘的小步骤。</view>
      </view>

      <view class="illustration">
        <view class="clipboard">
          <view class="clip"></view>
          <view class="paper-line line-a"></view>
          <view class="paper-line line-b"></view>
          <view class="paper-line line-c"></view>
          <view class="pie">
            <view class="pie-cut"></view>
          </view>
        </view>
        <view class="blue-bubble"></view>
      </view>
    </view>

    <view class="content-card intro-card">
      <view class="icon-box">
        <view class="check-mark"></view>
      </view>
      <view class="intro-copy">
        <view class="section-label">一张图养成作业好习惯</view>
        <view class="paragraph">优化作业流程，养成高效作业习惯。</view>
      </view>
    </view>

    <view class="content-card">
      <view class="section-label">作业不是靠催，是靠流程</view>
      <view class="paragraph">
        孩子拖拉、漏题、写完不检查，很多时候不是态度问题，而是缺少一套稳定的执行顺序。
      </view>
      <view class="process-list">
        <view class="process-item" v-for="item in process" :key="item.title">
          <view class="step-dot">{{ item.index }}</view>
          <view class="step-copy">
            <view class="step-title">{{ item.title }}</view>
            <view class="step-desc">{{ item.desc }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="content-card tool-card">
      <view class="section-label">每天只抓三个关键动作</view>
      <view class="tool-grid">
        <view class="tool-item" v-for="item in tools" :key="item.title">
          <view class="tool-symbol">{{ item.symbol }}</view>
          <view class="tool-title">{{ item.title }}</view>
          <view class="tool-desc">{{ item.desc }}</view>
        </view>
      </view>
    </view>

    <view class="summary-card">
      <view class="summary-title">习惯的核心</view>
      <view class="summary-text">不是要求孩子一下子变自律，而是让流程稳定下来，让每一次完成都更轻松。</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      process: [
        {
          index: "1",
          title: "先整理任务",
          desc: "把今天要完成的内容写清楚，先知道要做什么。",
        },
        {
          index: "2",
          title: "再专注完成",
          desc: "按顺序推进，一次只处理一个任务，减少反复切换。",
        },
        {
          index: "3",
          title: "最后检查复盘",
          desc: "检查错漏，记录卡住的地方，让明天更容易开始。",
        },
      ],
      tools: [
        {
          symbol: "单",
          title: "任务清单",
          desc: "让作业量可视化",
        },
        {
          symbol: "钟",
          title: "专注时段",
          desc: "让注意力有边界",
        },
        {
          symbol: "复",
          title: "复盘记录",
          desc: "让进步被看见",
        },
      ],
    };
  },
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
        return;
      }
      uni.switchTab({
        url: "/pages/index/index",
      });
    },
  },
};
</script>

<style lang="scss">
.habits-page {
  min-height: 100vh;
  padding: 24rpx 28rpx 72rpx;
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background:
    radial-gradient(circle at 16% 8%, rgba(202, 226, 255, 0.68), transparent 34%),
    linear-gradient(180deg, #f3f8ff 0%, #f9fbff 46%, #ffffff 100%);
}

.topbar {
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button,
.top-space {
  width: 68rpx;
  height: 68rpx;
}

.back-button {
  position: relative;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 10rpx 30rpx rgba(31, 65, 92, 0.08);
}

.back-button::before {
  content: "";
  position: absolute;
  left: 28rpx;
  top: 23rpx;
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #284055;
  border-bottom: 4rpx solid #284055;
  transform: rotate(45deg);
}

.top-title {
  color: #152238;
  font-size: 30rpx;
  font-weight: 900;
}

.hero-card {
  position: relative;
  min-height: 420rpx;
  margin-top: 18rpx;
  overflow: hidden;
  padding: 38rpx 32rpx;
  border-radius: 40rpx;
  background: linear-gradient(145deg, #ffffff 0%, #eef6ff 54%, #fff8e9 100%);
  box-shadow: 0 24rpx 70rpx rgba(38, 80, 129, 0.12);
}

.hero-copy {
  position: relative;
  z-index: 2;
  width: 62%;
}

.eyebrow {
  display: inline-flex;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  color: #1768d6;
  font-size: 24rpx;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.78);
}

.title {
  margin-top: 28rpx;
  color: #0b315f;
  font-size: 58rpx;
  line-height: 1.12;
  font-weight: 900;
}

.lead {
  margin-top: 22rpx;
  color: #475668;
  font-size: 28rpx;
  line-height: 1.62;
  font-weight: 650;
}

.illustration {
  position: absolute;
  right: -6rpx;
  bottom: -4rpx;
  width: 300rpx;
  height: 300rpx;
}

.blue-bubble {
  position: absolute;
  right: 22rpx;
  bottom: 22rpx;
  width: 238rpx;
  height: 238rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(123, 176, 255, 0.42), rgba(122, 176, 255, 0.08) 62%, transparent 72%);
}

.clipboard {
  position: absolute;
  left: 52rpx;
  top: 36rpx;
  width: 190rpx;
  height: 224rpx;
  z-index: 2;
  border-radius: 30rpx;
  background: linear-gradient(180deg, #ffffff 0%, #eef6ff 100%);
  border: 8rpx solid #4d8ff0;
  box-shadow: 0 18rpx 38rpx rgba(31, 85, 158, 0.16);
}

.clip {
  position: absolute;
  left: 54rpx;
  top: -28rpx;
  width: 82rpx;
  height: 54rpx;
  border-radius: 18rpx 18rpx 14rpx 14rpx;
  background: linear-gradient(180deg, #74adff, #1768d6);
}

.clip::before {
  content: "";
  position: absolute;
  left: 28rpx;
  top: 12rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #dcecff;
}

.paper-line {
  position: absolute;
  left: 32rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #c9daf2;
}

.line-a {
  top: 72rpx;
  width: 96rpx;
}

.line-b {
  top: 106rpx;
  width: 76rpx;
}

.line-c {
  top: 140rpx;
  width: 108rpx;
}

.pie {
  position: absolute;
  right: -20rpx;
  bottom: 18rpx;
  width: 94rpx;
  height: 94rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #7ab0ff, #1768d6);
}

.pie-cut {
  position: absolute;
  right: 0;
  top: 0;
  width: 48rpx;
  height: 48rpx;
  background: #eef6ff;
  border-radius: 0 999rpx 0 0;
}

.content-card,
.summary-card {
  margin-top: 24rpx;
  padding: 30rpx 28rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18rpx 54rpx rgba(30, 58, 78, 0.08);
}

.intro-card {
  display: flex;
  align-items: center;
  gap: 22rpx;
  background: linear-gradient(145deg, #ffffff 0%, #edf6ff 100%);
}

.icon-box {
  width: 92rpx;
  height: 92rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #7ab0ff, #1768d6);
  position: relative;
  flex-shrink: 0;
}

.check-mark {
  position: absolute;
  left: 28rpx;
  top: 30rpx;
  width: 32rpx;
  height: 18rpx;
  border-left: 8rpx solid #ffffff;
  border-bottom: 8rpx solid #ffffff;
  transform: rotate(-45deg);
}

.intro-copy {
  flex: 1;
}

.section-label {
  color: #10233d;
  font-size: 34rpx;
  line-height: 1.35;
  font-weight: 900;
}

.paragraph {
  margin-top: 18rpx;
  color: #415163;
  font-size: 29rpx;
  line-height: 1.72;
}

.process-list {
  margin-top: 24rpx;
}

.process-item {
  display: flex;
  gap: 20rpx;
  padding: 22rpx 0;
  border-top: 1rpx solid #edf1f6;
}

.step-dot {
  width: 58rpx;
  height: 58rpx;
  margin-top: 4rpx;
  border-radius: 20rpx;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 900;
  background: linear-gradient(135deg, #7ab0ff, #1768d6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-copy {
  flex: 1;
}

.step-title {
  color: #18212b;
  font-size: 30rpx;
  font-weight: 900;
}

.step-desc {
  margin-top: 8rpx;
  color: #637286;
  font-size: 26rpx;
  line-height: 1.5;
}

.tool-card {
  background: linear-gradient(145deg, #ffffff 0%, #fffaf0 100%);
}

.tool-grid {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.tool-item {
  flex: 1;
  min-width: 0;
  padding: 22rpx 14rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.82);
  text-align: center;
}

.tool-symbol {
  width: 66rpx;
  height: 66rpx;
  margin: 0 auto;
  border-radius: 22rpx;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 900;
  background: linear-gradient(135deg, #ffb45f, #f0831e);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-title {
  margin-top: 16rpx;
  color: #18212b;
  font-size: 27rpx;
  font-weight: 900;
}

.tool-desc {
  margin-top: 8rpx;
  color: #6f7f91;
  font-size: 23rpx;
  line-height: 1.42;
}

.summary-card {
  color: #ffffff;
  background: linear-gradient(135deg, #2479ef, #0b4caa);
}

.summary-title {
  font-size: 36rpx;
  font-weight: 900;
}

.summary-text {
  margin-top: 12rpx;
  font-size: 29rpx;
  line-height: 1.65;
  opacity: 0.94;
}
</style>
