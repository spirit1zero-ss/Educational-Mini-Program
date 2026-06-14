<template>
  <view class="assessment-page">
    <view class="assessment-card">
      <view class="eyebrow">Assessment</view>
      <view class="title">入营测评</view>
      <view class="desc">
        这里预留训练营入营测评入口，可对接问卷、表单或测评题库。
      </view>
      <button class="primary" @tap="goCourses">先看训练营课程</button>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goCourses() {
      uni.navigateTo({
        url: "/pages/goods/goods_list/index?title=训练营",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.assessment-page {
  min-height: 100vh;
  padding: 40rpx 24rpx;
  background: #f5f7fb;
}

.assessment-card {
  padding: 44rpx 34rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 8rpx 30rpx rgba(31, 41, 55, 0.08);
}

.eyebrow {
  font-size: 24rpx;
  line-height: 34rpx;
  color: #1f8a70;
}

.title {
  margin-top: 10rpx;
  font-size: 44rpx;
  line-height: 58rpx;
  font-weight: 700;
  color: #111827;
}

.desc {
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 42rpx;
  color: #4b5563;
}

.primary {
  margin-top: 40rpx;
  height: 88rpx;
  border-radius: 44rpx;
  color: #fff;
  font-size: 30rpx;
  background: #2563eb;
}
</style>
