<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px;">
      <el-input v-model="name" placeholder="分类名称" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">新增分类</el-button>
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
      <el-table-column label="分类名称" min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类排序" class-name="status-col" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.sort }}</span>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="分类排序" prop="sort">
          <el-input v-model="temp.sort" placeholder="数字越小越靠前"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():modifyData()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import constants from '@/utils/constants'
// import { storeAll } from '@/api/store'
import { categoryList, categoryCount, categoryCreate, categoryModify } from '@/api/category'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils/time'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
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
      name: '',
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
        sort: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新建'
      },
      rules: {
        name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '分类排序不能为空', trigger: 'blur' }]
      }
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
      categoryList({
        name: this.name === '' ? undefined : this.name,
        offset: this.offset,
        limit: this.limit
      }).then(response => {
        this.list = response.data
      })
      categoryCount({
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
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        sort: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          categoryCreate(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
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
          categoryModify(tempData).then(() => {
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
    }
  }
}
</script>
