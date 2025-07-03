<template>
  <view class="home-content">
    <!-- <image class="home-logo" src="/static/logo.png"></image> -->
    <view class="home-title">欢迎来到漫画世界</view>
    <button class="home-btn" @click="goToList">进入漫画目录</button>
  </view>
</template>

<script>
export default {
  methods: {
    goToList() {
      uni.navigateTo({ url: '/pages/list/list' })
    }
  }
}
</script>

<style>
.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
}
.home-logo {
  width: 180rpx;
  height: 180rpx;
  margin-top: 120rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx #b3bcdf44;
}
.home-title {
  font-size: 44rpx;
  color: #333;
  margin: 48rpx 0 32rpx 0;
  font-weight: bold;
  letter-spacing: 2rpx;
}
.home-btn {
  background: #6366f1;
  color: #fff;
  font-size: 32rpx;
  border-radius: 32rpx;
  padding: 20rpx 60rpx;
  box-shadow: 0 4rpx 16rpx #6366f122;
}
</style>
