<template>
  <view class="custom-navbar">
    <view class="nav-left" @click="goBack">
      <uni-icons type="back" size="22" color="#6366f1" />
    </view>
    <view class="nav-title">{{  '漫画详情' }}</view>
    <view class="nav-right"></view>
  </view>
  <view class="detail-content">
    <image :src="comic.cover_url || comic.cover" class="detail-cover" mode="aspectFill" v-if="comic.cover_url || comic.cover" :lazy-load="true"></image>
    <view class="detail-title">{{ comic.title || comic.name || '漫画详情' }}</view>
    <view class="detail-alias" v-if="comic.aliases">别名：{{ comic.aliases }}</view>
    <view class="info-card">
      <view class="info-row">
        <text class="info-label">作者：</text><text class="info-value">{{ comic.author || '未知' }}</text>
        <text class="info-label">地区：</text><text class="info-value">{{ comic.area || '未知' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">状态：</text><text class="info-value">{{ comic.status || '未知' }}</text>
        <text class="info-label">更新时间：</text><text class="info-value">{{ comic.update_time || comic.UpdatedAt || '未知' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">浏览量：</text><text class="info-value">{{ comic.views || 0 }}</text>
        <text class="info-label">章节数：</text><text class="info-value">{{ comic.chapters || (chapters.length || 0) }}</text>
      </view>
      <view class="info-row" v-if="comic.tags">
        <text class="info-label">标签：</text>
        <view class="tags">
          <text v-for="tag in comic.tags.split(',')" :key="tag" class="tag">{{ tag }}</text>
        </view>
      </view>
    </view>
    <view class="detail-desc">{{ comic.description || '暂无简介' }}</view>
    <view v-if="loading" style="text-align:center;margin:32rpx 0;">加载中...</view>
    <view v-if="error" style="color:#f00;text-align:center;margin:32rpx 0;">{{ error }}</view>
    <view v-if="!loading && !error">
      <view class="divider"></view>
      <view class="chapter-title">
        章节列表 <text v-if="chapters.length">({{ chapters.length }})</text>
      </view>
      <view v-if="chapters.length">
        <view v-for="chapter in chapters" :key="chapter.id || chapter.Id" class="chapter-item" @click="goToChapter(chapter.Id)">
          <text>{{ chapter.title || chapter.name }}</text>
        </view>
      </view>
      <view v-else style="text-align:center;color:#aaa;">暂无章节</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      comic: {},
      chapters: [],
      chapterId: '',
      loading: false,
      error: ''
    }
  },
  async onLoad(options) {
    this.chapterId = options.id
    this.getDetail()
    this.getChapterList()
  },
  methods: {
    goToChapter(chapterId) {
      uni.navigateTo({ url: `/pages/detail/chapter?id=${chapterId}` })
    },
    getDetail() {
      this.loading = true
      this.error = ''
      uni.request({
        url: import.meta.env.VITE_SUPABASE_URL + '/books/read/' + this.chapterId,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        success: (res) => {
          console.log(res.data.data)
          if (res.data && res.data.data) {
            this.comic = res.data.data
            console.log(this.comic)
          }
        },
        fail: () => {
          this.error = '加载失败，请检查网络或稍后重试';
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    getChapterList() { 
      uni.request({
        url: import.meta.env.VITE_SUPABASE_URL + '/chapters/list/?where=(book_id,eq,'+this.chapterId+')&sort=order_num&limit=0&fields=book_id,title,Id,order_num',
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        success: (res) => {
          if (res.data && res.data.data && res.data.data.list) {
            this.chapters = res.data.data.list;
            console.log(this.chapters)
          } else {
            this.error = '未找到章节信息';
            this.chapters = []
          }
        },
        fail: () => {
          this.error = '加载失败，请检查网络或稍后重试';
        },
      })
    },
    goBack() {
      uni.navigateTo({
        url: '/pages/list/list'
      });
    }
  }
}
</script>

<style>
.detail-content {
  padding: 32rpx;
  background: #f8fafc;
  min-height: 100vh;
}
.detail-cover {
  width:100%;
  height: 30rem;
  border-radius: 16rpx;
  margin: 0 auto 32rpx auto;
  display: block;
  box-shadow: 0 8rpx 24rpx #b3bcdf44;
}
.detail-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #22223b;
  text-align: center;
  margin-bottom: 8rpx;
}
.detail-alias {
  font-size: 26rpx;
  color: #6366f1;
  text-align: center;
  margin-bottom: 12rpx;
}
.info-card {
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx #6366f122;
  padding: 20rpx 24rpx 12rpx 24rpx;
  margin-bottom: 24rpx;
}
.info-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 8rpx;
}
.info-label {
  color: #6366f1;
  font-size: 26rpx;
  margin-right: 8rpx;
}
.info-value {
  color: #22223b;
  font-size: 26rpx;
  margin-right: 24rpx;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}
.tag {
  background: linear-gradient(90deg, #a5b4fc 0%, #6366f1 100%);
  color: #fff;
  border-radius: 24rpx;
  padding: 4rpx 18rpx;
  font-size: 24rpx;
  margin-right: 8rpx;
  margin-bottom: 4rpx;
}
.detail-desc {
  font-size: 28rpx;
  color: #4b5563;
  margin-bottom: 32rpx;
  text-align: center;
}
.divider {
  height: 2rpx;
  background: linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%);
  margin: 32rpx 0 16rpx 0;
  border-radius: 2rpx;
}
.chapter-title {
  font-size: 32rpx;
  color: #6366f1;
  margin-bottom: 16rpx;
  font-weight: 500;
}
.chapter-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #22223b;
  box-shadow: 0 2rpx 8rpx #6366f122;
  transition: background 0.2s;
}
.chapter-item:active {
  background: #e0e7ff;
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
</style>
