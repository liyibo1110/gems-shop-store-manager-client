<template>
  <div class="app-container">
    <el-table
      :data="headerList"
      :show-header="showHeader"
      border
      fit
      style="width: 100%; margin-bottom: 20px">
      <el-table-column label="订单信息" min-width="55px">
        <template slot-scope="scope">
          <span>{{ scope.row[0] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品信息" min-width="80px">
        <template slot-scope="scope">
          <span>{{ scope.row[1] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单价/数量" min-width="30px">
        <template slot-scope="scope">
          <span>{{ scope.row[2] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实付款" min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row[3] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="买家" min-width="20px">
        <template slot-scope="scope">
          <span>{{ scope.row[4] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交易状态" min-width="40px">
        <template slot-scope="scope">
          <span>{{ scope.row[5] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row[6] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-table
      :data="listProcessed"
      :show-header="showHeader"
      border
      fit
      style="width: 100%;">
      <el-table-column label="订单信息" min-width="55px">
        <template slot-scope="scope">
          <div>{{ scope.row.addTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</div>
          <div>订单号：{{ scope.row.orderNo }}</div>
        </template>
      </el-table-column>
      <el-table-column label="商品信息" min-width="80px">
        <template slot-scope="scope">
          <el-table
            :data="scope.row.fileList"
            :show-header="showHeader"
            style="width: 100%;">
            <el-table-column label="商品信息" min-width="50px">
              <template slot-scope="scope">
                <el-image :src="scope.row.fileName" fit="fill" style="width: 50px; height: 50px"/>
                <span>{{ scope.row.goodsName }}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="单价/数量" min-width="30px">
        <template slot-scope="scope">
          <el-table
            :data="scope.row.goodList"
            :show-header="showHeader"
            style="width: 100%;">
            <el-table-column label="单价/数量" min-width="50px">
              <template slot-scope="scope">
                <span>{{ scope.row.price }}元 * {{ scope.row.totalNum }}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="实付款" min-width="50px">
        <template slot-scope="scope">
          <span>{{ scope.row.payPrice }}元（含运费：{{ scope.row.expressPrice }}元）</span>
        </template>
      </el-table-column>
      <el-table-column label="买家" min-width="20px">
        <template slot-scope="scope">
          <span>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交易状态" min-width="40px">
        <template slot-scope="scope">
          <span>付款状态：{{ scope.row.payStatus | payStatusFilter }}</span>
          <span>发货状态：{{ scope.row.deliveryStatus | deliveryStatusFilter }}</span>
          <span>收货状态：{{ scope.row.receiptStatus | receiptStatusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="50px">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDetail(scope.row)">订单明细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="currentPage" :limit.sync="limit" @pagination="getList" />

  </div>
</template>

<script>
import constants from '@/utils/constants'
// import { storeAll } from '@/api/store'
import { orderList, orderCount } from '@/api/order'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils/time'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const payStatusOptions = [
  { key: 10, displayName: '待付款' },
  { key: 20, displayName: '已付款' }
]

const payStatusKeyValue = payStatusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.displayName
  return acc
}, {})

const deliveryStatusOptions = [
  { key: 10, displayName: '待发货' },
  { key: 20, displayName: '已发货' }
]

const deliveryStatusKeyValue = deliveryStatusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.displayName
  return acc
}, {})

const receiptStatusOptions = [
  { key: 10, displayName: '待收货' },
  { key: 20, displayName: '已收货' }
]

const receiptStatusKeyValue = receiptStatusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.displayName
  return acc
}, {})

export default {
  components: { Pagination },
  directives: { waves },
  filters: {
    payStatusFilter(type) {
      return payStatusKeyValue[type]
    },
    deliveryStatusFilter(type) {
      return deliveryStatusKeyValue[type]
    },
    receiptStatusFilter(type) {
      return receiptStatusKeyValue[type]
    },
    parseTime
  },
  data() {
    return {
      tableKey: 0,
      headerList: [
        ['订单信息', '商品信息', '单价/数量', '实付款', '买家', '交易状态', '操作']
      ],
      showHeader: false,
      list: null,
      limit: constants.PAGE_LIMIT,
      currentPage: 1,
      total: 0,
      listLoading: true,
      payStatus: undefined,
      deliveryStatus: undefined,
      receiptStatus: undefined
    }
  },
  computed: {
    /* listProcessed: function() {
      if (this.list == null) return null
      for (const order of this.list) {
        if (order.fileList[0] && order.fileList[0].fileName) {
          order.fileList[0].fileName = process.env.IMAGE_BASE + 'goodImages/' + order.fileList[0].fileName
        }
      }
      return this.list
    }, */
    listProcessed: function() {
      if (this.list == null) return null
      for (const order of this.list) {
        order.fileList = order.fileList.map(f => {
          return { ...f, fileName: process.env.IMAGE_BASE + 'goodImages/' + f.fileName }
        })
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
      orderList({
        payStatus: this.payStatus,
        deliveryStatus: this.deliveryStatus,
        receiptStatus: this.receiptStatus,
        offset: this.offset,
        limit: this.limit
      }).then(response => {
        this.list = response.data
        console.log(this.list)
      })
      orderCount({
        payStatus: this.payStatus,
        deliveryStatus: this.deliveryStatus,
        receiptStatus: this.receiptStatus
      }).then(response => {
        this.total = response.data
        console.log(this.total)
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleDetail(row) {
      this.$router.replace({ path: '/order/detail', query: { id: row.id }})
    }
  }
}
</script>
