<template>
  <view class="custom-navbar">
    <view class="nav-left" @click="goBack">
      <uni-icons type="back" size="22" color="#6366f1" />
    </view>
    <view class="nav-title" @click="scrollToTop">漫画详情</view>
    <view class="nav-right">
      <uni-icons type="list" size="22" color="#6366f1" @click="toggleList" />
    </view>
  </view>
  <view class="chapter-content" @click="showScrollIcon">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="error" class="error">{{ error }}</view>
    <view class="chapter-title" v-if="comic && comic.title" @click="goLink(comic.Id)">{{ comic.title }}：{{ chapter.title }}</view>
    <view class="chapter-nav-bottom">
    <button
      v-if="prevChapter"
      class="chapter-nav-btn"
      @click="goToChapter(prevChapter.id)"
      size="mini"
    >上一章节：{{ prevChapter.title }}</button>
    <button
      v-if="nextChapter"
      class="chapter-nav-btn"
      @click="goToChapter(nextChapter.id)"
      size="mini"
    >下一章节：{{ nextChapter.title }}</button>
  </view>
    <view class="chapter-content-box">
      <rich-text :nodes="chapter.content"></rich-text>
    </view>
  </view>
  <uni-popup ref="listChapter" background-color="#fff" @change="change">
    <view class="popup-content" :class="{ 'popup-height': type === 'right' }">
      <view>
        <view class="popup-title">章节目录({{ comic.chapters }})</view>
        <!-- 返回漫画页 -->
        <view class="chapter-item" @click="goLink(comic.Id)">
          <uni-icons type="back" size="22" color="#6366f1"></uni-icons>
          返回漫画页
        </view>
        <view class="popup-divider"></view>
        <scroll-view scroll-y class="popup-scroll"> 
          <view v-for="(item, index) in chatpterList" :key="index" class="chapter-list">
            <view
              class="chapter-item"
              :class="{ active: String(item.id) === String(chapterId) }"
              @click="goToChapter(item.id)"
            >
              <text class="chapter-item-title">{{ item.title }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </uni-popup>
  <view class="chapter-nav-bottom">
    <button
      v-if="prevChapter"
      class="chapter-nav-btn"
      @click="goToChapter(prevChapter.id)"
    >上一章节：{{ prevChapter.title }}</button>
    <button
      v-if="nextChapter"
      class="chapter-nav-btn"
      @click="goToChapter(nextChapter.id)"
    >下一章节：{{ nextChapter.title }}</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      comic: {},
      chapter: {},
      chapterId: '',
      chatpterList: [],
      booksId: '',
      rId: '',
      loading: false,
      error: '',
      pattern:{
        icon: 'arrow-up',
        direction: 'horizontal',
        position: 'rightBottom',
        iconSize: 22,
        color: '#e96900'
      },
      scrollTop: 0,
      scrollShow: false
    }
  },
  onLoad(options) {
    console.log(options)
    // 检验参数(options, ['id', 'booksId'])
    if (options.id == null || options.rId == null || options.id === '' || options.rId === '') {
      // 缺少参数提示并点确认跳转到上一页
      uni.showModal({
        content: '缺少参数',
        showCancel: false,
        confirmText: '返回上一页',
        success: function (res) {
          if (res.confirm) {
            uni.navigateBack()
          }
        }
      })
      return;
    }

    this.chapterId = options.id
    this.rId = options.rId
    this.getChapter()
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop;
  },
  methods: {
    goToChapter(chapterId) {
      uni.navigateTo({
        url: `/pages/detail/chapter?id=${chapterId}&rId=${this.rId}`, 
      })
    },
    toggleList() {
      this.$refs.listChapter.open('right');
    },
    change(e) {
      if (e.show === false) {
        this.$refs.listChapter.close()
      }
    },
    onPageScroll(e) {
      this.scrollTop = e.scrollTop;
    },
    goBack() {
      uni.navigateBack();
    },
    getDetail() {
      uni.request({
        url: import.meta.env.VITE_SUPABASE_URL + '/books/read/' + this.rId,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        success: (res) => {
          if (res.data && res.data.data) {
            this.comic = res.data.data
          }
        },
        fail: () => {
          this.error = '加载失败，请检查网络或稍后重试';
        },
        complete: () => {
        }
      })
    },
    getChapterList() { 
      uni.request({
        url: import.meta.env.VITE_SUPABASE_URL + '/chapters/list/?where=(book_id,eq,'+this.booksId+')&sort=order_num&limit=0&fields=book_id,title,Id,order_num',
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        success: (res) => {
          if (res.data && res.data.data && res.data.data.list) {
            this.chatpterList = res.data.data.list.map(item => ({
              ...item,
              id: item.id || item.Id // 兼容两种字段
            }));
            console.log(this.chatpterList)
          } else {
            this.error = '未找到章节信息';
            this.chatpterList = []
          }
        },
        fail: () => {
          this.error = '加载失败，请检查网络或稍后重试';
        },
      })
    },
    getChapter() {
      this.loading = true;
      this.error = '';
      uni.request({
        url: import.meta.env.VITE_SUPABASE_URL + '/chapters/read/' + this.chapterId,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        success: (res) => {
          this.loading = false;
          if (res.data) {
            this.chapter = res.data.data;
            this.booksId = res.data.data.book_id
            this.getDetail()
            this.getChapterList()
          } else {
            this.error = '未找到详情信息';
            this.chapter = { title: '', images: [] };
          }
        },
        fail: () => {
          this.loading = false;
          this.error = '加载失败，请检查网络或稍后重试';
        },
      })
    },
    scrollToTop() {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300
      });
    },
    showScrollIcon() {
      this.scrollShow =!this.scrollShow
    },
    goLink(id) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      })
    }
  },
  computed: {
    currentChapterIndex() {
      return this.chatpterList.findIndex(item => String(item.id) === String(this.chapterId));
    },
    prevChapter() {
      if (this.currentChapterIndex > 0) {
        return this.chatpterList[this.currentChapterIndex - 1];
      }
      return null;
    },
    nextChapter() {
      if (this.currentChapterIndex < this.chatpterList.length - 1 && this.currentChapterIndex !== -1) {
        return this.chatpterList[this.currentChapterIndex + 1];
      }
      return null;
    }
  }
}
</script>

<style>
.chapter-content {
  /* padding: 24rpx; */
  background: #f1f5f9;
  min-height: 100vh;
  position: relative;

}
.chapter-title {
  font-size: 36rpx;
  color: #6366f1;
  font-weight: bold;
  margin-bottom: 24rpx;
  text-align: center;
  padding: 24rpx 0;
}
.chapter-scroll {
  max-height: 80vh;
}
.chapter-img {
  width: 100%;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx #6366f122;
  object-fit: contain;
}
.loading {
  text-align: center;
  color: #6366f1;
  margin: 40rpx 0;
}
.error {
  text-align: center;
  color: #f43f5e;
  margin: 40rpx 0;
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
.comic-image{
  display: flex;
}
.comic-image img{
  height: auto;
  width: 100%;
}
.chapter-content-box{
  z-index: -1;
}
.chapter-mask{
  position: fixed;
  top: 88rpx;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 99;
}
.fab-button{
  z-index: 99999;
}
.popup-content {
  border-radius: 32rpx 0 0 32rpx;
  box-shadow: -8rpx 0 32rpx #6366f122;
  padding: 0 0 0 0;
  min-width: 480rpx;
  max-width: 80vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #6366f1;
  text-align: center;
  padding: 32rpx 0 16rpx 0;
  letter-spacing: 2rpx;
}

.popup-divider {
  height: 2rpx;
  background: #f1f5f9;
  margin: 0 32rpx 16rpx 32rpx;
  border-radius: 2rpx;
}

.popup-scroll {
  max-height: 80vh;
  padding: 0 24rpx 24rpx 24rpx;
  overflow-y: auto;
}

.chapter-list {
  margin-bottom: 8rpx;
}

.chapter-item {
  background: #f6f8ff;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 30rpx;
  color: #6366f1;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  margin-bottom: 8rpx;
  box-shadow: 0 2rpx 8rpx #6366f122;
  display: flex;
  align-items: center;
}

.chapter-item:hover {
  background: #6366f1;
  color: #fff;
}

.chapter-item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 滚动条美化（仅H5有效，微信小程序不支持） */
.popup-scroll::-webkit-scrollbar {
  width: 8rpx;
  background: #f1f5f9;
  border-radius: 8rpx;
}
.popup-scroll::-webkit-scrollbar-thumb {
  background: #dbeafe;
  border-radius: 8rpx;
}

.chapter-item.active {
  background: #6366f1;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 4rpx 16rpx #6366f144;
}

.chapter-nav-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx 48rpx 24rpx;
  background: #fff;
  border-top: 2rpx solid #f1f5f9;
  /* position: sticky; */
  bottom: 0;
  z-index: 10;
  gap: 24rpx;
  font-weight: 300 !important;
  font-size: 14px !important;
}
.chapter-nav-btn {
  flex: 1;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  line-height: 150% !important;

  /* font-size: 30rpx; */
  padding: 20rpx 10rpx !important;
  /* margin: 0 8rpx; 
  font-weight: bold;*/
  box-shadow: 0 2rpx 8rpx #6366f122;
  transition: background 0.2s;
}
.chapter-nav-btn:active {
  background: #4f46e5;
}
</style>
