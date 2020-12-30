new Vue({
  el: "#app",
  data: {
    queryResults: [],
    songUrl: "",
    albumCoverUrl: "albumDefaultCover.jpg",
    lyricContentPerLine: [],    // 单行的歌词
    lyricTimestamp: []     // 每行单词的时间戳
  },
  methods: {
    search(query) {
      let self = this;
      axios.get("https://autumnfish.cn/search?keywords=" + query)
      .then(function(value){
        console.log(value);
        self.queryResults = value.data.result.songs
      })
      .catch(function(error) {

      })
    },
    chooseSong(index) {
      let songId = this.queryResults[index].id
      let self = this
      //console.log(songId)
      // 获取播放歌曲url
      axios.get("https://autumnfish.cn/song/url?id=" + songId)
      .then(function(value){
        console.log(value)
        self.songUrl = value.data.data[0].url
      })
      .catch(function(error){})

      // 获取播放歌曲详情，以获取专辑封面url等
      axios.get("https://autumnfish.cn/song/detail?ids=" + songId)
      .then(function(response){
        console.log(response)
        self.albumCoverUrl = response.data.songs[0].al.picUrl

        // 专辑封面旋转动画
        let albumCover = document.querySelector(".album-cover");
        albumCover.style.animationPlayState = "running";

        // 歌曲结束清空歌词
        const songDuration = response.data.songs[0].dt
        console.log(songDuration)
        setTimeout(function(){
          self.lyricTimestamp = []
          self.lyricContentPerLine = []
        }, songDuration-5000)    // 提前5s清空歌词
      })
      .catch(function(error){})

      // 获取播放歌曲歌词
      let lyricPerLine = []
      axios.get("https://autumnfish.cn/lyric?id=" + songId)
      .then(function(response){
        lyricPerLine = response.data.lrc.lyric.split(/\n/)

        self.lyricTimestamp = response.data.lrc.lyric.match(/[0-9]{2}:[0-9]{2}\.[0-9]{3}/g)
        console.log(self.lyricTimestamp)

        self.lyricContentPerLine = response.data.lrc.lyric.replace(/\[[0-9]{2}:[0-9]{2}\.[0-9]{3}\]/g, '').split(/\n/)
        console.log(self.lyricContentPerLine)

        lyricRoll(self, 0)
      })
      .catch(function(error){})
    }
  }

})

function getMs(time) {
  // 输入格式为字符串"00:11.320"
  const minute = parseInt(time.substring(0, 2))
  const s = parseInt(time.substring(3, 5))
  const ms = parseInt(time.substring(6))
  return ms + 1000 * (60*minute + s)
}

// 滚动歌词功能
function lyricRoll(self, lastTimeStamp) {
  if (self.lyricTimestamp.length > 1) {
    const interval = getMs(self.lyricTimestamp[1]) - lastTimeStamp
    // console.log(interval)
    setTimeout(function(){
      const lastStamp = getMs(self.lyricTimestamp[1])
      // 删除第一行歌词
      self.lyricContentPerLine.shift()
      self.lyricTimestamp.shift()
      // 开启下一次定时
      lyricRoll(self, lastStamp)
    }, interval)
  }
}