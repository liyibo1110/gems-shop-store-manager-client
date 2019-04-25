<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px;">
      <el-input v-model="name" placeholder="视频名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="storeId" placeholder="所属分店" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item of storeAllData" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="status" placeholder="视频状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item of videoStatusOptions" :key="item.key" :label="item.displayName" :value="item.key"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <!-- <el-table-column label="编号" prop="id" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="视频名称" min-width="50px">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属房间" class-name="status-col" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.roomName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频状态" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | videoStatusTagTypeFilter">{{ scope.row.status | videoStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="新增时间" width="170px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.addTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="handlePlayer(scope.row)">预览播放</el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="currentPage" :limit.sync="limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="视频名称" prop="name">
          <el-input v-model="temp.name" disabled/>
        </el-form-item>
        <el-form-item label="所属状态" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择视频状态">
            <el-option v-for="item of videoStatusOptions" :key="item.key" :label="item.displayName" :value="item.key"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="modifyData()">确认</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogPlayerVisible" title="预览播放" @close="handleClosePlayer">
      <video-player ref="videoPlayer" :options="playerOptions" :playsinline="true" class="vjs-custom-skin"/>
    </el-dialog>
  </div>
</template>

<script>
import constants from '@/utils/constants'
import { storeAll } from '@/api/store'
import { videoList, videoCount, videoModify } from '@/api/video'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils/time'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import videojs from 'video.js'
// window.videojs = videojs
videojs.addLanguage('zh-CN', {
  'Play': '播放',
  'Pause': '暂停',
  'Current Time': '当前时间',
  'Duration': '时长',
  'Remaining Time': '剩余时间',
  'Stream Type': '媒体流类型',
  'LIVE': '直播',
  'Loaded': '加载完毕',
  'Progress': '进度',
  'Fullscreen': '全屏',
  'Non-Fullscreen': '退出全屏',
  'Mute': '静音',
  'Unmute': '取消静音',
  'Playback Rate': '播放速度',
  'Subtitles': '字幕',
  'subtitles off': '关闭字幕',
  'Captions': '内嵌字幕',
  'captions off': '关闭内嵌字幕',
  'Chapters': '节目段落',
  'Close Modal Dialog': '关闭弹窗',
  'Descriptions': '描述',
  'descriptions off': '关闭描述',
  'Audio Track': '音轨',
  'You aborted the media playback': '视频播放被终止',
  'A network error caused the media download to fail part-way.': '网络错误导致视频下载中途失败。',
  'The media could not be loaded, either because the server or network failed or because the format is not supported.': '视频因格式不支持或者服务器或网络的问题无法加载。',
  'The media playback was aborted due to a corruption problem or because the media used features your browser did not support.': '由于视频文件损坏或是该视频使用了你的浏览器不支持的功能，播放终止。',
  'No compatible source was found for this media.': '无法找到此视频兼容的源。',
  'The media is encrypted and we do not have the keys to decrypt it.': '视频已加密，无法解密。',
  'Play Video': '播放视频',
  'Close': '关闭',
  'Modal Window': '弹窗',
  'This is a modal window': '这是一个弹窗',
  'This modal can be closed by pressing the Escape key or activating the close button.': '可以按ESC按键或启用关闭按钮来关闭此弹窗。',
  ', opens captions settings dialog': ', 开启标题设置弹窗',
  ', opens subtitles settings dialog': ', 开启字幕设置弹窗',
  ', opens descriptions settings dialog': ', 开启描述设置弹窗',
  ', selected': ', 选择',
  'captions settings': '字幕设定',
  'Audio Player': '音频播放器',
  'Video Player': '视频播放器',
  'Replay': '重播',
  'Progress Bar': '进度小节',
  'Volume Level': '音量',
  'subtitles settings': '字幕设定',
  'descriptions settings': '描述设定',
  'Text': '文字',
  'White': '白',
  'Black': '黑',
  'Red': '红',
  'Green': '绿',
  'Blue': '蓝',
  'Yellow': '黄',
  'Magenta': '紫红',
  'Cyan': '青',
  'Background': '背景',
  'Window': '视窗',
  'Transparent': '透明',
  'Semi-Transparent': '半透明',
  'Opaque': '不透明',
  'Font Size': '字体尺寸',
  'Text Edge Style': '字体边缘样式',
  'None': '无',
  'Raised': '浮雕',
  'Depressed': '压低',
  'Uniform': '均匀',
  'Dropshadow': '下阴影',
  'Font Family': '字体库',
  'Proportional Sans-Serif': '比例无细体',
  'Monospace Sans-Serif': '单间隔无细体',
  'Proportional Serif': '比例细体',
  'Monospace Serif': '单间隔细体',
  'Casual': '舒适',
  'Script': '手写体',
  'Small Caps': '小型大写字体',
  'Reset': '重启',
  'restore all settings to the default values': '恢复全部设定至预设值',
  'Done': '完成',
  'Caption Settings Dialog': '字幕设定视窗',
  'Beginning of dialog window. Escape will cancel and close the window.': '开始对话视窗。离开会取消及关闭视窗',
  'End of dialog window.': '结束对话视窗'
})

// window.videojs = videojs
// import 'video.js/dist/video-js.css'
// import { videoPlayer } from 'vue-video-player'
// import 'video.js/dist/lang/zh-CN'
const videoStatusOptions = [
  { key: 1, displayName: '未开启' },
  { key: 2, displayName: '已开启' },
  { key: 3, displayName: '已关闭' }
]

const videoStatusKeyValue = videoStatusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.displayName
  return acc
}, {})

const videoStatusTagTypeOptions = [
  { key: 1, tagType: 'info' },
  { key: 2, tagType: 'success' },
  { key: 3, tagType: 'danger' }
]

const videoStatusTagTypeKeyValue = videoStatusTagTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.tagType
  return acc
}, {})

export default {
  name: 'ComplexTable',
  // components: { Pagination, videoPlayer },
  components: { Pagination },
  directives: { waves },
  filters: {
    videoStatusTagTypeFilter(status) {
      return videoStatusTagTypeKeyValue[status]
    },
    videoStatusFilter(type) {
      return videoStatusKeyValue[type]
    },
    parseTime
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      storeAllData: [],
      limit: constants.PAGE_LIMIT,
      currentPage: 1,
      total: 0,
      listLoading: true,
      name: '',
      storeId: undefined,
      status: undefined,
      videoStatusOptions,
      /* listQuery: {
        // offset: (this.currentPage - 1) * this.limit,
        // limit: this.limit,
        limit: constants.PAGE_LIMIT,
        name: '',
        deviceNumber: ''
      }, */
      temp: {
        id: undefined,
        name: '',
        status: undefined
      },
      dialogFormVisible: false,
      dialogPlayerVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑'
      },
      rules: {
        status: [{ required: true, message: '视频状态不能为空', trigger: 'change' }]
      },
      playerOptions: {
        height: '360',
        autoplay: true,
        muted: true,
        language: 'zh-CN',
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        sources: [{
          type: 'video/mp4',
          src: ''
        }]
      }
    }
  },
  computed: {
    offset() {
      return (this.currentPage - 1) * constants.PAGE_LIMIT
    }
  },
  created() {
    storeAll({}).then((response) => {
      this.storeAllData = response.data
      this.getList()
    })
  },
  methods: {
    getList() {
      this.listLoading = true
      videoList({
        name: this.name,
        status: this.status,
        offset: this.offset,
        limit: this.limit
      }).then(response => {
        this.list = response.data
      })
      videoCount({
        name: this.name,
        status: this.status
      }).then(response => {
        this.total = response.data
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.currentPage = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        status: undefined
      }
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    modifyData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          videoModify(tempData).then(() => {
            /* for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            } */
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handlePlayer(row) {
      console.log(process.env.VIDEO_BASE + row.storeId + row.url)
      this.playerOptions.sources[0].src = process.env.VIDEO_BASE + row.storeId + row.url
      this.dialogPlayerVisible = true
    },
    handleClosePlayer() {
      // this.$refs.videoPlayer.player.seek(0)
      this.$refs.videoPlayer.player.pause()
    }
  }
}
</script>
