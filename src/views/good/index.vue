<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px;">
      <el-input v-model="name" placeholder="商品名称" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">新增商品</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="listProcessed"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <!-- <el-table-column label="编号" prop="id" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="商品图片" min-width="50px">
        <template slot-scope="scope">
          <el-image :src="scope.row.fileList[0].fileName" fit="fill" style="width: 50px; height: 50px"/>
          <!-- <img :src="scope.row.fileList[0].fileName" height="50px" width="50px"> -->
        </template>
      </el-table-column>
      <el-table-column label="商品名称" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品分类" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.categoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际销量" min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row.salesActual }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模板排序" class-name="status-col" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.sort }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品状态" min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row.status | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" width="170px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.addTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="100px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="currentPage" :limit.sync="limit" @pagination="getList" />

  </div>
</template>

<script>
import constants from '@/utils/constants'
// import { storeAll } from '@/api/store'
import { goodList, goodCount } from '@/api/good'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils/time'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const statusOptions = [
  { key: 10, displayName: '上架' },
  { key: 20, displayName: '下架' }
]

const statusKeyValue = statusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.displayName
  return acc
}, {})

export default {
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(type) {
      return statusKeyValue[type]
    },
    parseTime
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      limit: constants.PAGE_LIMIT,
      currentPage: 1,
      total: 0,
      listLoading: true,
      name: ''
    }
  },
  computed: {
    listProcessed: function() {
      if (this.list == null) return null
      for (const good of this.list) {
        if (good.fileList[0] && good.fileList[0].fileName) {
          good.fileList[0].fileName = process.env.IMAGE_BASE + 'goodImages/' + good.fileList[0].fileName
        }
      }
      return this.list
    },
    offset() {
      return (this.currentPage - 1) * constants.PAGE_LIMIT
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      goodList({
        name: this.name === '' ? undefined : this.name,
        offset: this.offset,
        limit: this.limit
      }).then(response => {
        this.list = response.data
      })
      goodCount({
        name: this.name === '' ? undefined : this.name
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
    handleCreate() {
      this.$router.replace('/good/create')
    },
    handleUpdate(row) {
      this.$router.replace({ path: '/good/modify', query: { id: row.id }})
    }
  }
}
</script>
