<template>
  <view class="inner-page">
    <view class="topbar">
      <button class="back-button" @tap="goBack"></button>
      <view class="top-title">根 · 慧眼读心</view>
      <view class="top-space"></view>
    </view>

    <view class="hero-card">
      <view class="hero-copy">
        <view class="eyebrow">内驱力养成</view>
        <view class="title">先读懂，再赋能</view>
        <view class="lead">一张图让家长读懂孩子心。读懂孩子，才能让内心长出更稳定的自信力量。</view>
      </view>

      <view class="illustration">
        <view class="heart-leaf">
          <view class="leaf-half left"></view>
          <view class="leaf-half right"></view>
          <view class="leaf-vein"></view>
        </view>
        <view class="root-line root-a"></view>
        <view class="root-line root-b"></view>
        <view class="root-line root-c"></view>
        <view class="warm-ring"></view>
      </view>
    </view>

    <view class="content-card important">
      <view class="quote-mark"></view>
      <view class="quote-text">孩子很多表面的“不配合”，背后往往藏着压力、害怕、失控感，或者没有被看见的需求。</view>
    </view>

    <view class="content-card">
      <view class="section-label">慧眼读心，不是猜孩子</view>
      <view class="paragraph">
        它是帮助家长把孩子的行为、情绪和真实需求分开看。先看见原因，再选择沟通方式。
      </view>
      <view class="insight-list">
        <view class="insight-item" v-for="item in insights" :key="item.title">
          <view class="insight-symbol">{{ item.symbol }}</view>
          <view class="insight-copy">
            <view class="insight-title">{{ item.title }}</view>
            <view class="insight-desc">{{ item.desc }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="content-card">
      <view class="section-label">从三个问题开始</view>
      <view class="question-card" v-for="item in questions" :key="item.title">
        <view class="question-title">{{ item.title }}</view>
        <view class="question-desc">{{ item.desc }}</view>
      </view>
    </view>

    <view class="summary-card">
      <view class="summary-title">根稳了，成长才有力量</view>
      <view class="summary-text">当孩子感觉自己被理解，学习才更容易从外部催促，慢慢转向内部愿意。</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      insights: [
        {
          symbol: "行",
          title: "看见行为",
          desc: "孩子做了什么，不急着贴标签。",
        },
        {
          symbol: "情",
          title: "看见情绪",
          desc: "害怕、烦躁、逃避，都先被允许表达。",
        },
        {
          symbol: "需",
          title: "看见需求",
          desc: "找到孩子真正需要支持的地方。",
        },
      ],
      questions: [
        {
          title: "孩子现在最卡在哪里？",
          desc: "是听不懂、不会做、怕出错，还是不知道怎么开始。",
        },
        {
          title: "孩子最需要哪种支持？",
          desc: "是方法、节奏、鼓励，还是一个更清楚的目标。",
        },
        {
          title: "今天可以给孩子一个什么小成功？",
          desc: "让孩子先体验到“我能做到”，自信才会慢慢长出来。",
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
.inner-page {
  min-height: 100vh;
  padding: 24rpx 28rpx 72rpx;
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background:
    radial-gradient(circle at 78% 6%, rgba(255, 220, 182, 0.62), transparent 34%),
    linear-gradient(180deg, #fff8ee 0%, #f9fbff 46%, #ffffff 100%);
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
  box-shadow: 0 10rpx 30rpx rgba(95, 64, 34, 0.08);
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
  background: linear-gradient(145deg, #ffffff 0%, #fff2df 54%, #eef9f1 100%);
  box-shadow: 0 24rpx 70rpx rgba(112, 72, 35, 0.12);
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
  color: #de7615;
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
  right: -8rpx;
  bottom: -6rpx;
  width: 300rpx;
  height: 306rpx;
}

.warm-ring {
  position: absolute;
  right: 26rpx;
  bottom: 28rpx;
  width: 236rpx;
  height: 236rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 185, 92, 0.36), rgba(255, 185, 92, 0.08) 62%, transparent 74%);
}

.heart-leaf {
  position: absolute;
  left: 72rpx;
  top: 46rpx;
  width: 170rpx;
  height: 152rpx;
  z-index: 2;
  transform: rotate(-8deg);
}

.leaf-half {
  position: absolute;
  top: 20rpx;
  width: 94rpx;
  height: 118rpx;
  border-radius: 80rpx 80rpx 20rpx 80rpx;
  background: linear-gradient(145deg, #6fd58a, #18a65f);
  box-shadow: inset -10rpx -12rpx 22rpx rgba(15, 95, 54, 0.1);
}

.leaf-half.left {
  left: 10rpx;
  transform: rotate(-38deg);
}

.leaf-half.right {
  right: 10rpx;
  transform: rotate(38deg) scaleX(-1);
}

.leaf-vein {
  position: absolute;
  left: 82rpx;
  top: 84rpx;
  width: 8rpx;
  height: 130rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffffff, #29a463);
  transform: rotate(12deg);
}

.root-line {
  position: absolute;
  z-index: 1;
  width: 118rpx;
  height: 22rpx;
  border-radius: 999rpx;
  background: #b6783f;
  transform-origin: left center;
}

.root-a {
  left: 128rpx;
  bottom: 68rpx;
  transform: rotate(20deg);
}

.root-b {
  left: 122rpx;
  bottom: 76rpx;
  transform: rotate(156deg);
}

.root-c {
  left: 138rpx;
  bottom: 64rpx;
  width: 86rpx;
  transform: rotate(92deg);
}

.content-card,
.summary-card {
  margin-top: 24rpx;
  padding: 30rpx 28rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18rpx 54rpx rgba(30, 58, 78, 0.08);
}

.content-card.important {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  background: linear-gradient(145deg, #ffffff 0%, #fff3e5 100%);
}

.quote-mark {
  width: 46rpx;
  height: 46rpx;
  flex-shrink: 0;
  border-radius: 16rpx;
  background: #f0831e;
  position: relative;
}

.quote-mark::before,
.quote-mark::after {
  content: "";
  position: absolute;
  width: 10rpx;
  height: 20rpx;
  top: 13rpx;
  border-radius: 999rpx;
  background: #ffffff;
}

.quote-mark::before {
  left: 13rpx;
}

.quote-mark::after {
  right: 13rpx;
}

.quote-text {
  color: #1a2a3a;
  font-size: 30rpx;
  line-height: 1.65;
  font-weight: 800;
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

.insight-list {
  margin-top: 24rpx;
}

.insight-item {
  display: flex;
  align-items: center;
  min-height: 126rpx;
  padding: 20rpx;
  border-radius: 28rpx;
  background: #f8faf8;
}

.insight-item + .insight-item {
  margin-top: 18rpx;
}

.insight-symbol {
  width: 72rpx;
  height: 72rpx;
  border-radius: 26rpx;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 900;
  background: linear-gradient(135deg, #ffb45f, #f0831e);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-copy {
  padding-left: 22rpx;
  flex: 1;
}

.insight-title,
.question-title {
  color: #18212b;
  font-size: 30rpx;
  font-weight: 900;
}

.insight-desc,
.question-desc {
  margin-top: 8rpx;
  color: #637286;
  font-size: 26rpx;
  line-height: 1.5;
}

.question-card {
  margin-top: 18rpx;
  padding: 24rpx;
  border-radius: 28rpx;
  background: linear-gradient(145deg, #fff8ef 0%, #f4fbf5 100%);
}

.summary-card {
  color: #ffffff;
  background: linear-gradient(135deg, #f2992e, #ce6510);
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
