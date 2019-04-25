<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px;">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 1100px; margin-left:50px;">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="计费方式" prop="method">
          <el-select v-model="temp.method" class="filter-item" placeholder="请选择计费方式" @change="methodSelectChanged">
            <el-option v-for="item of methodOptions" :key="item.key" :label="item.displayName" :value="item.key"/>
          </el-select>
        </el-form-item>
        <el-form-item label="配送区域及运费" prop="rules">
          <el-table :data="rulesProcessed" border style="width: 100%">
            <el-table-column prop="regionStr" label="可配送区域" width="200"/>
            <el-table-column :label="firstLabelName" prop="first" width="150">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.first" :min="0" :max="10" size="mini" controls-position="right"/>
              </template>
            </el-table-column>
            <el-table-column prop="firstFee" label="运费 (元)" width="150">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.firstFee" :precision="2" :min="0" :max="10" size="mini" controls-position="right"/>
              </template>
            </el-table-column>
            <el-table-column :label="additionalLabelName" prop="additional" width="150">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.additional" :min="0" :max="10" size="mini" controls-position="right"/>
              </template>
            </el-table-column>
            <el-table-column prop="additionalFee" label="续费 (元)" width="150">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.additionalFee" :precision="2" :min="0" :max="10" size="mini" controls-position="right"/>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!--
                <i class="el-icon-edit" @click="handleRuleEdit(scope.$index, scope.row)"></i>
                <i class="el-icon-delete" @click="handleRuleDelete(scope.$index, scope.row)"></i>
                -->
                <el-button size="mini" @click="handleRuleEdit(scope.$index, scope.row)">修改地区</el-button>
                <el-button size="mini" type="danger" @click="handleRuleDelete(scope.$index, scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button :disabled="createRulesButtonDisabled" type="primary" style="margin-top:10px;" @click="showCreateRule()">添加可配送区域和运费</el-button>
        </el-form-item>
        <el-form-item label="分类排序" prop="sort">
          <el-input v-model="temp.sort" placeholder="数字越小越靠前"/>
        </el-form-item>
        <el-button type="primary" @click="createData()">保存</el-button>
      </el-form>
    </div>

    <el-dialog :visible.sync="dialogCreateRuleVisible" :before-close="cancelCreateRule" title="请选择可配送区域">
      <el-checkbox v-model="createNationChecked">全国配送</el-checkbox>
      <el-tree ref="createTree" :data="regionData" :props="regionProps" node-key="id" show-checkbox @check-change="handleCreateTreeCheckChange"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCreateRule()">取消</el-button>
        <el-button type="primary" @click="createRule()">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogModifyRuleVisible" :before-close="cancelModifyRule" title="修改可配送区域">
      <el-checkbox v-model="modifyNationChecked">全国配送</el-checkbox>
      <el-tree ref="modifyTree" :data="regionData" :props="regionProps" :default-checked-keys="modifyTreeCheckedKeys" node-key="id" show-checkbox @check-change="handleModifyTreeCheckChange"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelModifyRule()">取消</el-button>
        <el-button type="primary" @click="modifyRule()">修改</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { allProvince, allCity } from '@/api/region'
import { deliveryCreate } from '@/api/delivery'
import { arrayRemove, arrayRemoveByIndex } from '@/utils/array'
const methodOptions = [
  { key: 10, displayName: '按件数' },
  { key: 20, displayName: '按重量' }
]

/* const methodKeyValue = methodOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.displayName
  return acc
}, {}) */

export default {

  data() {
    return {
      regionData: [],
      regionProps: {
        children: 'children',
        label: 'name'
      },
      provinceAllData: [],
      cityAllData: [],
      cityKeyValue: {},
      methodOptions,
      // deliveryRulesData: [],
      firstLabelName: '首件（个）',
      additionalLabelName: '续件（个）',
      dialogCreateRuleVisible: false,
      dialogModifyRuleVisible: false,
      createRulesButtonDisabled: true,
      modifyTreeCheckedKeys: [],
      currentModifyRuleIndex: undefined,
      // modifyTempCities: [],
      temp: {
        name: '',
        rules: [],
        method: undefined,
        sort: undefined
      },
      createNationChecked: false,
      modifyNationChecked: false,
      tempRule: {
        region: [],
        regionStr: '',
        first: 0,
        firstFee: 0.00,
        additional: 0,
        additionalFee: 0.00
      },
      rules: {
        name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
        method: [{ required: true, message: '计费方式不能为空', trigger: 'change' }],
        rules: [{ type: 'array', required: true, message: '配送区域及运费至少要有1条', trigger: 'change' }],
        sort: [{ required: true, message: '模板排序不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    rulesProcessed: function() {
      // console.log('进入computed')
      // 根据region数组，构建regionStr字符串
      for (const rule of this.temp.rules) {
        // console.log(rule.region)
        rule.regionStr = ''
        for (const cityId of rule.region) {
          if (cityId === 0) {
            rule.regionStr += '全国配送,'
          } else {
            rule.regionStr += this.cityKeyValue[cityId] + ','
          }
        }
        if (rule.regionStr !== '') {
          rule.regionStr = rule.regionStr.substring(0, rule.regionStr.length - 1)
        }
      }
      return this.temp.rules
    }
  },
  created() {
    allProvince({}).then((response) => {
      this.provinceAllData = response.data
      return allCity({})
    }).then((response) => {
      this.cityAllData = response.data
      // 开始拼接regionData
      this.concatRegionData()
      this.createRulesButtonDisabled = false
      // console.log(this.regionData)
      // console.log(this)
    })
  },
  methods: {
    concatRegionData() {
      const objArray = []
      for (const province of this.provinceAllData) {
        objArray.push({ id: province.id, name: province.name, level: 1, children: [] })
      }
      for (const province of objArray) {
        for (const city of this.cityAllData) {
          if (city.pid === province.id) {
            province.children.push({ id: city.id, name: city.name, level: 2 })
          }
        }
      }
      this.regionData = objArray

      this.cityKeyValue = this.cityAllData.reduce((result, city) => {
        result[city.id] = city.name
        return result
      }, {})
    },
    handleBack() {
      // console.log('点击了返回')
      this.$router.go(-1)
    },
    showCreateRule() {
      // this.$refs.createTree.setCheckedKeys([])
      // console.log(this)
      this.createNationChecked = false
      this.dialogCreateRuleVisible = true
    },
    methodSelectChanged(val) {
      // console.log('进入了changed,val为：' + val)
      if (val === 10) {
        this.firstLabelName = '首件（个）'
        this.additionalLabelName = '续件（个）'
      } else if (val === 20) {
        this.firstLabelName = '首重（kg）'
        this.additionalLabelName = '续重（kg）'
      }
    },
    createRule() {
      if (!this.createNationChecked && this.tempRule.region.length === 0) {
        this.$message('至少要选择1个城市')
        return
      }
      this.$refs.createTree.setCheckedKeys([])
      // 检测是否选择了全国配送，然后写死
      if (this.createNationChecked) {
        this.tempRule.region = []
        this.tempRule.region.push(0)
      }
      this.temp.rules.push(Object.assign({}, this.tempRule))
      this.tempRule = {
        region: [],
        regionStr: '',
        first: 0,
        firstFee: 0.00,
        additional: 0,
        additionalFee: 0.00
      } // 清空
      this.dialogCreateRuleVisible = false
      // console.log(this.temp.rules)
    },
    cancelCreateRule() {
      // console.log('进入cancelCreateRule')
      this.$refs.createTree.setCheckedKeys([])
      this.tempRule = {
        region: [],
        regionStr: '',
        first: 0,
        firstFee: 0.00,
        additional: 0,
        additionalFee: 0.00
      } // 清空
      this.dialogCreateRuleVisible = false
    },
    modifyRule() {
      if (!this.modifyNationChecked && this.modifyTreeCheckedKeys.length === 0) {
        this.$message('至少要选择1个城市')
        return
      }
      // 判断是否选择了全国配送
      if (this.modifyNationChecked) {
        for (const checkedCity of this.modifyTreeCheckedKeys) {
          this.$refs.modifyTree.setChecked(checkedCity, false, true)
        }
        this.modifyTreeCheckedKeys = []
        // console.log(this.modifyTreeCheckedKeys)
        this.modifyTreeCheckedKeys.push(0)
        this.temp.rules[this.currentModifyRuleIndex].region = Object.assign([], this.modifyTreeCheckedKeys)
        this.modifyTreeCheckedKeys = []
      } else {
        arrayRemove(this.modifyTreeCheckedKeys, 0)
        this.temp.rules[this.currentModifyRuleIndex].region = Object.assign([], this.modifyTreeCheckedKeys)
        for (const checkedCity of this.modifyTreeCheckedKeys) {
          this.$refs.modifyTree.setChecked(checkedCity, false, true)
        }
      }
      // this.$refs.modifyTree.setCheckedKeys([])
      this.dialogModifyRuleVisible = false
    },
    cancelModifyRule() {
      // console.log('进入cancelModifyRule')
      // this.$refs.modifyTree.setCheckedKeys(this.modifyTreeCheckedKeys, true)
      for (const checkedCity of this.modifyTreeCheckedKeys) {
        this.$refs.modifyTree.setChecked(checkedCity, false, true)
      }
      this.modifyNationChecked = false
      // this.modifyTreeCheckedKeys = []
      this.dialogModifyRuleVisible = false
    },
    handleCreateTreeNodeClick(data) {
      // console.log(data)
    },
    handleModifyTreeNodeClick(data) {
      // console.log(data)
    },
    handleCreateTreeCheckChange(data, checked, indeterminate) {
      // console.log(data, checked, indeterminate)
      if (data.level === 1 && checked) {
        // 增加该省所有市
        for (const city of this.cityAllData) {
          if (city.pid === data.id && this.tempRule.region.indexOf(city.id) === -1) {
            this.tempRule.region.push(city.id)
          }
        }
      } else if (data.level === 1 && !checked && !indeterminate) {
        // 清除该省所有市
        for (const city of this.cityAllData) {
          if (city.pid === data.id) {
            arrayRemove(this.tempRule.region, city.id)
          }
        }
      } else if (data.level === 2 && checked) {
        // 增加该市
        if (this.tempRule.region.indexOf(data.id) === -1) {
          this.tempRule.region.push(data.id)
        }
      } else if (data.level === 2 && !checked) {
        // 清除该市
        arrayRemove(this.tempRule.region, data.id)
      }
    },
    handleModifyTreeCheckChange(data, checked, indeterminate) {
      // console.log('进入handleModifyTreeCheckChange')
      // console.log(data, checked, indeterminate)
      // console.log(this.currentModifyRuleIndex)
      if (data.level === 1 && checked) {
        // 增加该省所有市
        for (const city of this.cityAllData) {
          if (city.pid === data.id && this.modifyTreeCheckedKeys.indexOf(city.id) === -1) {
            this.modifyTreeCheckedKeys.push(city.id)
          }
        }
      } else if (data.level === 1 && !checked && !indeterminate) {
        // 清除该省所有市
        for (const city of this.cityAllData) {
          if (city.pid === data.id) {
            arrayRemove(this.modifyTreeCheckedKeys, city.id)
          }
        }
      } else if (data.level === 2 && checked) {
        // 增加该市
        if (this.modifyTreeCheckedKeys.indexOf(data.id) === -1) {
          this.modifyTreeCheckedKeys.push(data.id)
        }
      } else if (data.level === 2 && !checked) {
        // 清除该市
        arrayRemove(this.modifyTreeCheckedKeys, data.id)
      }
    },
    handleRuleDelete(index, row) {
      // console.log('要删除第' + index + '条数据')
      arrayRemoveByIndex(this.temp.rules, index)
    },
    handleRuleEdit(index, row) {
      // console.log('要编辑第' + index + '条数据')
      this.currentModifyRuleIndex = index
      // this.modifyTempCities = Object.assign({}, row.cities)
      // console.log(row.cities)
      // console.log(this)
      // 设置选中
      if (row.region.indexOf(0) > -1) {
        this.modifyNationChecked = true
      }
      this.modifyTreeCheckedKeys = []
      this.modifyTreeCheckedKeys = Object.assign([], row.region)
      this.dialogModifyRuleVisible = true
      // console.log(this.$refs.modifyTree)
      // this.$refs.modifyTree.setCheckedKeys(row.cities)
      // this.modifyTreeCheckedKeys = row.cities
      console.log(this.modifyTreeCheckedKeys)
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // console.log(this.temp)
          deliveryCreate(Object.assign({}, this.temp)).then(() => {
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.$router.replace('/delivery/index')
          })
        }
      })
    }
  }
}
</script>
