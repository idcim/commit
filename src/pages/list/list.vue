<template>
  <view class="custom-navbar">
    <view class="nav-left" @click="goBack">
      <uni-icons type="back" size="22" color="#6366f1" />
    </view>
    <view class="nav-title">漫画目录</view>
    <view class="nav-right"></view>
  </view>
  <view v-if="comics.length" class="banner-wrap">
    <uni-swiper-dot :info="bannerList" :current="bannerCurrent" mode="round" field="title" class="banner-dot">
      <swiper
        class="banner-swiper"
        :indicator-dots="false"
        :autoplay="true"
        :interval="4000"
        :duration="500"
        circular
        @change="onBannerChange"
      >
        <swiper-item v-for="(item, idx) in bannerList" :key="item.Id">
          <view class="banner-item" @click="goToDetail(item)">
            <image :src="item.cover_url" class="banner-img" mode="center" />
            <view class="banner-title">{{ item.title }}</view>
          </view>
        </swiper-item>
      </swiper>
    </uni-swiper-dot>
  </view>
  <view class="list-bg">
    <scroll-view scroll-y class="list-scroll">
      <view v-for="comic in comics" :key="comic.Id" class="comic-section">
        <uni-section
          :title="comic.title"
          type="line"
          padding
          class="comic-card"
          @click="goToDetail(comic)"
        >
          <view class="comic-main" @click="goToDetail(comic)">
            <image :src="comic.cover_url" class="comic-cover" mode="aspectFill" />
            <view class="comic-info">
              <view class="comic-meta">
                <text class="meta-item">作者：{{ comic.author }}</text>
                <text class="meta-item">地区：{{ comic.area }}</text>
                <text class="meta-item">状态：{{ comic.status }}</text>
                <text class="meta-item">章节：{{ comic.chapters }}</text>
                <text class="meta-item">热度：{{ comic.views }}</text>
                <text class="meta-item">更新：{{ comic.update_time }}</text>
              </view>
              <view class="comic-tags">
                <uni-tag
                  v-for="tag in comic.tags"
                  :key="tag"
                  :text="tag"
                  type="primary"
                  size="mini"
                  class="tag"
                />
              </view>
            </view>
          </view>
        </uni-section>
      </view>
      <view v-if="!pageInfo.isLastPage" class="load-more">
        <button class="load-more-btn" :loading="loading" @click="getComics(true)">加载更多</button>
      </view>
      <view v-else class="no-more">—— 没有更多了 ——</view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      comics: [],
      pageInfo: {
        page: 1,
        pageSize: 25,
        isLastPage: false
      },
      loading: false,
      bannerCurrent: 0
    }
  },
  computed: {
    bannerList() {
      return this.comics.slice(0, 5);
    }
  },
  async onLoad() {
    this.getComics()
  },
  methods: {
    goToDetail(comic) {
      uni.navigateTo({ url: `/pages/detail/detail?id=${comic.Id}` })
    },
    getComics(loadMore = false) {
      if (this.loading || (loadMore && this.pageInfo.isLastPage)) return;
      this.loading = true;
      uni.request({
        url: import.meta.env.VITE_SUPABASE_URL + '/books/list?limit='+import.meta.env.VITE_PAGE_SIZE+'&sort='+import.meta.env.VITE_PAGE_SORT,
        method: 'GET',
        data: {
          page: loadMore ? this.pageInfo.page + 1 : 1,
          pageSize: this.pageInfo.pageSize
        },
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        success: (res) => {
          if (res.statusCode !== 200) {
            uni.showToast({
              title: '请求失败',
              icon: 'error'
            })
            return;
          }
          const data = res.data.data || res.data;
          data.list = data.list.map(item => {
            item.tags = item.tags.split(',');
            return item;
          });
          if (loadMore) {
            this.comics = this.comics.concat(data.list);
          } else {
            this.comics = data.list;
          }
          this.pageInfo = data.pageInfo;
        },
        complete: () => {
          this.loading = false;
        }
      })
    },
    goBack() {
      uni.navigateBack();
    },
    onBannerChange(e) {
      this.bannerCurrent = e.detail.current;
    }
  }
}
</script>

<style>
.list-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
  padding: 0;
}
.list-scroll {
  padding: 24rpx 0;
}
.comic-section {
  margin: 0 24rpx 32rpx 24rpx;
}
.comic-card {
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx #6366f122;
  background: #fff;
  transition: box-shadow 0.2s;
}
.comic-card:active {
  box-shadow: 0 8rpx 32rpx #6366f144;
}
.comic-main {
  display: flex;
  align-items: flex-start;
}
.comic-cover {
  width: 140rpx;
  height: 190rpx;
  border-radius: 16rpx;
  margin-right: 32rpx;
  object-fit: cover;
  background: #e0e7ff;
  box-shadow: 0 2rpx 8rpx #b3bcdf44;
}
.comic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.comic-meta {
  font-size: 24rpx;
  color: #6366f1;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 32rpx;
  margin-bottom: 12rpx;
}
.meta-item {
  background: #f3f4f6;
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
  margin-bottom: 8rpx;
}
.comic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.tag {
  margin-bottom: 4rpx;
}
.load-more {
  display: flex;
  justify-content: center;
  margin: 32rpx 0;
}
.load-more-btn {
  background: linear-gradient(90deg, #6366f1 0%, #60a5fa 100%);
  color: #fff;
  font-size: 28rpx;
  border-radius: 32rpx;
  padding: 16rpx 48rpx;
  box-shadow: 0 4rpx 16rpx #6366f122;
}
.no-more {
  text-align: center;
  color: #b3b3b3;
  font-size: 28rpx;
  margin: 32rpx 0;
  letter-spacing: 2rpx;
}
.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx #6366f122;
  position: sticky;
  top: 0;
  z-index: 99;
}
.nav-left, .nav-right {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #6366f1;
  letter-spacing: 2rpx;
}
.banner-wrap {
  margin: 0 0 32rpx 0;
  padding: 0 24rpx;
}
.banner-swiper {
  width: 100%;
  height: 320rpx;
  border-radius: 24rpx;
  overflow: hidden;
}
.banner-item {
  position: relative;
  width: 100%;
  height: 320rpx;
}
.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24rpx;
}
.banner-title {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  padding: 24rpx 24rpx 16rpx 24rpx;
  border-radius: 0 0 24rpx 24rpx;
  letter-spacing: 2rpx;
}
.banner-dot {
  margin-top: 12rpx;
}
</style>
