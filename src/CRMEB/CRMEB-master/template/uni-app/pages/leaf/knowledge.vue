<template>
  <view class="knowledge-page">
    <view class="topbar">
      <button class="back-button" @tap="goBack"></button>
      <view class="top-title">叶 · 基础认知</view>
      <view class="top-space"></view>
    </view>

    <view class="hero-card">
      <view class="hero-copy">
        <view class="eyebrow">学科知识的基础逻辑</view>
        <view class="title">先开窍，再训练</view>
        <view class="lead">
          孩子如果没有学科知识的基础逻辑，那么，刷题越多，补课越多，孩子只会越痛苦！
        </view>
      </view>
      <view class="illustration">
        <view class="book">
          <view class="book-line line-a"></view>
          <view class="book-line line-b"></view>
          <view class="book-sprout">
            <view class="sprout-stem"></view>
            <view class="sprout-leaf left"></view>
            <view class="sprout-leaf right"></view>
          </view>
        </view>
        <view class="light-ring"></view>
      </view>
    </view>

    <view class="content-card important">
      <view class="quote-mark"></view>
      <view class="quote-text">
        什么是学科知识的基础逻辑呢？就是要清晰地了解：学好这门学科最基本的顺序是什么。
      </view>
    </view>

    <view class="content-card">
      <view class="section-label">英语为什么学了很久还是一塌糊涂？</view>
      <view class="paragraph">
        因为英语的本质是声音。所以，对于非母语者，学英语的逻辑是：
      </view>
      <view class="logic-flow">
        <view class="flow-item">音标</view>
        <view class="flow-arrow"></view>
        <view class="flow-item">单词</view>
        <view class="flow-arrow"></view>
        <view class="flow-item wide">句子（语法）</view>
      </view>
      <view class="paragraph muted">
        中国的学生大多数都缺乏第一个环节，必然是越学越累，而且根本不能在现实中使用。
      </view>
    </view>

    <view class="content-card">
      <view class="section-label">发音过关后，英语变成肌肉习惯</view>
      <view class="paragraph">
        发音只要过关，整个中小学英语，考的不是智商，是肌肉习惯。英语只有两块积木：
      </view>
      <view class="block-list">
        <view class="block-item brick">
          <view class="block-icon">砖</view>
          <view class="block-copy">
            <view class="block-title">词汇</view>
            <view class="block-desc">只要大部分字认识，卷子就能看懂。</view>
          </view>
        </view>
        <view class="block-item frame">
          <view class="block-icon">框</view>
          <view class="block-copy">
            <view class="block-title">句法</view>
            <view class="block-desc">只要能把单词塞进固定的位置，句子就能得分。</view>
          </view>
        </view>
      </view>
    </view>

    <view class="summary-card">
      <view class="summary-title">英语一旦开窍</view>
      <view class="summary-text">
        三个月成绩必然突飞猛进，而且，可以进行基本的对话交流。
      </view>
    </view>
  </view>
</template>

<script>
export default {
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
.knowledge-page {
  min-height: 100vh;
  padding: 24rpx 28rpx 72rpx;
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background:
    radial-gradient(circle at 80% 3%, rgba(194, 233, 255, 0.62), transparent 34%),
    linear-gradient(180deg, #f1fbf5 0%, #f8fbff 44%, #ffffff 100%);
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
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10rpx 30rpx rgba(31, 65, 48, 0.08);
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
  background: linear-gradient(145deg, #ffffff 0%, #e9f8ee 58%, #eaf4ff 100%);
  box-shadow: 0 24rpx 70rpx rgba(45, 89, 68, 0.12);
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
  color: #008f5a;
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
  right: -12rpx;
  bottom: -8rpx;
  width: 298rpx;
  height: 300rpx;
}

.light-ring {
  position: absolute;
  right: 24rpx;
  bottom: 18rpx;
  width: 232rpx;
  height: 232rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 226, 118, 0.5), rgba(117, 207, 148, 0.08) 60%, transparent 70%);
}

.book {
  position: absolute;
  left: 24rpx;
  bottom: 40rpx;
  width: 236rpx;
  height: 150rpx;
  z-index: 2;
  border-radius: 18rpx 18rpx 32rpx 32rpx;
  background: linear-gradient(90deg, #fff8e7 0%, #ffffff 50%, #fff2d3 100%);
  box-shadow: 0 18rpx 38rpx rgba(107, 76, 35, 0.16);
}

.book::before {
  content: "";
  position: absolute;
  left: 114rpx;
  top: 14rpx;
  bottom: 18rpx;
  width: 3rpx;
  border-radius: 999rpx;
  background: #f2c166;
}

.book-line {
  position: absolute;
  left: 26rpx;
  height: 5rpx;
  border-radius: 999rpx;
  background: #f0c778;
}

.line-a {
  top: 50rpx;
  width: 70rpx;
}

.line-b {
  top: 78rpx;
  width: 88rpx;
}

.book-sprout {
  position: absolute;
  left: 96rpx;
  top: -98rpx;
  width: 90rpx;
  height: 118rpx;
}

.sprout-stem {
  position: absolute;
  left: 43rpx;
  bottom: 0;
  width: 8rpx;
  height: 92rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #7fd35b, #1d9652);
}

.sprout-leaf {
  position: absolute;
  width: 48rpx;
  height: 34rpx;
  border-radius: 100% 0 100% 0;
  background: linear-gradient(135deg, #bce765, #45ad5e);
}

.sprout-leaf.left {
  left: 0;
  top: 30rpx;
  transform: rotate(-34deg);
}

.sprout-leaf.right {
  right: 0;
  top: 12rpx;
  transform: rotate(24deg) scaleX(-1);
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
  background: linear-gradient(145deg, #ffffff 0%, #effaf4 100%);
}

.quote-mark {
  width: 46rpx;
  height: 46rpx;
  flex-shrink: 0;
  border-radius: 16rpx;
  background: #00a768;
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

.paragraph.muted {
  color: #6a788a;
}

.logic-flow {
  display: flex;
  align-items: center;
  margin-top: 26rpx;
  padding: 22rpx;
  border-radius: 28rpx;
  background: #f2f8ff;
}

.flow-item {
  min-width: 104rpx;
  height: 72rpx;
  padding: 0 18rpx;
  border-radius: 22rpx;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 900;
  background: linear-gradient(135deg, #72abff, #1768d6);
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.flow-item.wide {
  min-width: 164rpx;
}

.flow-arrow {
  width: 28rpx;
  height: 4rpx;
  margin: 0 12rpx;
  border-radius: 999rpx;
  background: #aab7c8;
  position: relative;
  flex-shrink: 0;
}

.flow-arrow::after {
  content: "";
  position: absolute;
  right: -2rpx;
  top: -7rpx;
  width: 14rpx;
  height: 14rpx;
  border-top: 4rpx solid #aab7c8;
  border-right: 4rpx solid #aab7c8;
  transform: rotate(45deg);
}

.block-list {
  margin-top: 24rpx;
}

.block-item {
  display: flex;
  align-items: center;
  min-height: 132rpx;
  padding: 22rpx;
  border-radius: 28rpx;
  background: #f7fafc;
}

.block-item + .block-item {
  margin-top: 18rpx;
}

.block-item.brick {
  background: #fff7e8;
}

.block-item.frame {
  background: #eef7ff;
}

.block-icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 26rpx;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 900;
  background: linear-gradient(135deg, #ffb45f, #f0831e);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.block-item.frame .block-icon {
  background: linear-gradient(135deg, #72abff, #1768d6);
}

.block-copy {
  padding-left: 22rpx;
}

.block-title {
  color: #18212b;
  font-size: 30rpx;
  font-weight: 900;
}

.block-desc {
  margin-top: 8rpx;
  color: #637286;
  font-size: 26rpx;
  line-height: 1.5;
}

.summary-card {
  color: #ffffff;
  background: linear-gradient(135deg, #00b06b, #006d40);
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
