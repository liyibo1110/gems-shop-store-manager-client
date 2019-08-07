<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px;">
      <el-divider content-position="left">基本信息</el-divider>
      <el-table
        :data="orderList"
        border
        fit
        style="width: 100%;">
        <el-table-column label="订单号" min-width="55px">
          <template slot-scope="scope">
            <span>{{ scope.row.orderNo }}</span>
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
            <div>付款状态：{{ scope.row.payStatus | payStatusFilter }}</div>
            <div>发货状态：{{ scope.row.deliveryStatus | deliveryStatusFilter }}</div>
            <div>收货状态：{{ scope.row.receiptStatus | receiptStatusFilter }}</div>
          </template>
        </el-table-column>
      </el-table>
      <el-divider content-position="left">商品信息</el-divider>
      <el-table
        :data="orderGoodListProcessed"
        border
        fit
        style="width: 100%;">
        <el-table-column label="商品信息" min-width="50px">
          <template slot-scope="scope">
            <el-image :src="scope.row.file.fileName" fit="fill" style="width: 50px; height: 50px"/>
            <span>{{ scope.row.goodName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品编码" prop="no" min-width="20px" />
        <el-table-column label="重量（Kg）" prop="weight" min-width="20px" />
        <el-table-column label="单价" min-width="20px">
          <template slot-scope="scope">
            <span>{{ scope.row.price }}元</span>
          </template>
        </el-table-column>
        <el-table-column label="购买数量" prop="totalNum" min-width="20px" />
        <el-table-column label="商品总价" min-width="50px">
          <template slot-scope="scope">
            {{ scope.row.totalPrice }}元
          </template>
        </el-table-column>
      </el-table>
      <el-divider content-position="left">收货信息</el-divider>
      <el-table
        :data="orderAddressList"
        border
        fit
        style="width: 100%;">
        <el-table-column label="收货人" min-width="50px">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收货电话" min-width="50px">
          <template slot-scope="scope">
            <span>{{ scope.row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收货地址" min-width="100px">
          <template slot-scope="scope">
            <span>{{ scope.row.mergerName }} {{ scope.row.detail }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-divider content-position="left">发货信息</el-divider>
      <el-form v-if="order.payStatus === 20 && order.deliveryStatus === 10" ref="dataForm" :rules="rules" :model="expressTemp" label-position="left" label-width="120px" style="width: 1100px; margin-left:50px;">
        <el-form-item label="物流公司名称" prop="companyName">
          <el-input v-model="expressTemp.companyName" placeholder="如：顺丰速运、申通快递"/>
        </el-form-item>
        <el-form-item label="物流单号" prop="no">
          <el-input v-model="expressTemp.no" />
        </el-form-item>
        <el-button type="primary" @click="modifyDeliveryStatus()">确认发货</el-button>
      </el-form>
      <el-form v-else-if="order.payStatus === 20 && order.deliveryStatus === 20" ref="dataForm" label-position="left" label-width="120px" style="width: 1100px; margin-left:50px;">
        <el-form-item label="物流公司名称">
          <el-input v-model="order.expressCompany" readonly />
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="order.expressNo" readonly />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { parseTime } from '@/utils/time'
import { orderGetById, orderDeliveryStatusModify } from '@/api/order'
// import { getToken } from '@/utils/auth'

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
      order: {},
      orderList: [],
      orderGoodList: [],
      orderAddressList: [],
      expressTemp: {
        companyName: '',
        no: ''
      },
      rules: {
        companyName: [{ required: true, message: '公司名称不能为空', trigger: 'blur' }],
        no: [{ required: true, message: '单号不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    orderGoodListProcessed: function() {
      if (this.orderGoodList == null) return null
      for (const orderGood of this.orderGoodList) {
        orderGood.file.fileName = process.env.IMAGE_BASE + 'goodImages/' + orderGood.file.fileName
      }
      return this.orderGoodList
    }
  },
  created() {
    orderGetById({ id: this.$route.query.id })
      .then((response) => {
        this.order = response.data.order
        this.orderList = [response.data.order]
        this.orderGoodList = response.data.orderGoods
        this.orderAddressList = [response.data.orderAddress]
      })
  },
  methods: {
    getOrderGoodSummaries({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总价'
          return
        }
        if (index === 5) {
          const values = data.map(item => {
            return Number(item[column.property])
          })
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0)
            sums[index] = '总计金额：' + sums[index] + ' 元'
          }
        }
      })
      return sums
    },
    orderGoodTableSpan({ row, column, rowIndex, columnIndex }) {
      //  console.log('rowIndex:' + rowIndex)
      if (rowIndex === this.orderGoodList.length) {
        //  console.log('进来了')
        if (columnIndex === 5) {
          //  console.log('进来了2')
          return [1, 4]
        }
      }
    },
    modifyDeliveryStatus() {
      console.log(this.expressTemp)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          orderDeliveryStatusModify({ id: this.$route.query.id, ...this.expressTemp }).then(() => {
            this.$notify({
              title: '成功',
              message: '修改发货状态成功',
              type: 'success',
              duration: 2000
            })
            this.$router.replace('/order/index')
          })
        }
      })
    }
  }
}
</script>
