<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px;">
      <el-input v-model="name" placeholder="运费模板名称" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">新增运费模板</el-button>
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
      <el-table-column label="模板名称" min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模板排序" class-name="status-col" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.sort }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计费方式" class-name="status-col" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.method | methodFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" width="170px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.addTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="580" class-name="small-padding fixed-width">
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
import { deliveryList, deliveryCount } from '@/api/delivery'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils/time'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const methodOptions = [
  { key: 10, displayName: '按件数' },
  { key: 20, displayName: '按重量' }
]

const methodKeyValue = methodOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.displayName
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    methodFilter(type) {
      return methodKeyValue[type]
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
      deliveryList({
        name: this.name === '' ? undefined : this.name,
        offset: this.offset,
        limit: this.limit
      }).then(response => {
        this.list = response.data
      })
      deliveryCount({
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
      this.$router.replace('/delivery/create')
    },
    handleUpdate(row) {
      // console.log('跳转到编辑' + row.id)
      this.$router.replace({ path: '/delivery/modify', query: { id: row.id }})
    }
  }
}
</script>
