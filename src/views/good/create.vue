<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px;">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 1100px; margin-left:50px;">
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="temp.categoryId" class="filter-item" placeholder="请选择商品分类">
            <el-option v-for="category of categoryAllData" :key="category.id" :label="category.name" :value="category.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="商品图片" prop="imageIds">
          <el-tooltip class="item" effect="dark" content="尺寸750x750像素以上，大小2M以下" placement="right">
            <el-button v-waves type="primary" icon="el-icon-upload" @click="handleImages">选择图片</el-button>
          </el-tooltip>
          <el-button v-waves type="info" icon="el-icon-delete" @click="handleClearImages">清空图片</el-button>
          <el-input v-model="temp.imageIds" type="hidden"/>
        </el-form-item>
        <el-form-item>
          <div style="margin-top: 10px">
            <el-row :gutter="20" style="margin-bottom: 10px">
              <el-col v-for="(item, index) in selectedImagesProcessed" :span="6" :key="index">
                <el-card :body-style="{ padding: '0px' }" style="margin-top: 5px">
                  <div @click="handleCardClick(index)">
                    <el-image :src="item.url" fit="fill"/>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-form-item>
        <el-divider content-position="left">规格/库存</el-divider>
        <el-form-item label="商品编码" prop="no">
          <el-input v-model="temp.no" />
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input v-model.number="temp.price" />
        </el-form-item>
        <el-form-item label="商品划线价" prop="linePrice">
          <el-input v-model="temp.linePrice" />
        </el-form-item>
        <el-form-item label="当前库存数量" prop="stockNum">
          <el-input v-model.number="temp.stockNum" />
        </el-form-item>
        <el-form-item label="商品重量（Kg）" prop="weight">
          <el-input v-model="temp.weight" />
        </el-form-item>
        <el-form-item label="库存计算方式" prop="deductStockType">
          <el-select v-model="temp.deductStockType" class="filter-item" placeholder="请选择库存计算方式">
            <el-option v-for="item of deductStockTypeOptions" :key="item.key" :label="item.displayName" :value="item.key"/>
          </el-select>
        </el-form-item>
        <el-divider content-position="left">商品详情</el-divider>
        <el-form-item label="商品详情" prop="content">
          <vue-ueditor-wrap v-model="temp.content"/>
        </el-form-item>
        <el-divider content-position="left">其它</el-divider>
        <el-form-item label="运费模板" prop="deliveryId">
          <el-select v-model="temp.deliveryId" class="filter-item" placeholder="请选择运费模板">
            <el-option v-for="delivery of deliveryAllData" :key="delivery.id" :label="delivery.name" :value="delivery.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择商品状态">
            <el-option v-for="item of statusOptions" :key="item.key" :label="item.displayName" :value="item.key"/>
          </el-select>
        </el-form-item>
        <el-form-item label="初始销量" prop="salesInitial">
          <el-input v-model.number="temp.salesInitial" />
        </el-form-item>
        <el-form-item label="商品排序" prop="sort">
          <el-input v-model.number="temp.sort" />
        </el-form-item>
        <el-button type="primary" @click="createData()">保存</el-button>
      </el-form>
    </div>

    <el-dialog :visible.sync="dialogImagesVisible" :before-close="cancelImages" width="80%" title="图片库">
      <el-container>
        <el-aside width="250px">
          <el-table :data="imageGroups" :show-header="imageGroupsTableShowHeader">
            <el-table-column prop="name">
              <template slot-scope="scope">
                <el-dropdown trigger="click" size="medium" split-button @click="handleDropdownClick(scope.row)" @command="handleDropdownModifyCommand">
                  {{ scope.row.name }}
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="scope.row" icon="el-icon-edit">修改</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <el-button size="mini" type="primary" icon="el-icon-folder-add" style="margin-top: 20px" @click="handleCreateImageGroup">新增分组</el-button>
        </el-aside>
        <el-main>
          <div>
            <!-- <el-button size="mini" type="primary" icon="el-icon-folder-add" @click="handleCreateImageGroup">移动至</el-button> -->
            <el-dropdown split-button type="primary" @command="handleDropdownMoveCommand">
              移动至
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="imageMoveGroup in imageMoveGroups" :key="imageMoveGroup.id" :command="imageMoveGroup.id">{{ imageMoveGroup.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button type="danger" icon="el-icon-folder-delete" @click="handleDeleteImage">删除</el-button>
            <!-- <el-button size="mini" type="primary" icon="el-icon-folder-add" style="float: right" @click="handleCreateImageGroup">上传图片</el-button> -->
            <el-upload :action="imageUploadUrl" :headers="imageUploadHeader" :before-upload="beforeUploadImage" :on-success="handleUploadImageSuccess" :show-file-list="imageUploadShowFileList" name="fileToUpload" with-credentials style="float: right">
              <el-button type="primary">点击上传</el-button>
            </el-upload>
          </div>
          <div style="margin-top: 10px">
            <el-row :gutter="10" style="margin-bottom: 10px">
              <el-col v-for="(item, index) in imagesProcessed" :span="8" :key="index">
                <el-card :body-style="{ padding: '0px' }" style="margin-top: 5px">
                  <el-checkbox v-model="item.selected" style="margin: 5px" @change="imageSelectChanged(index)">选择该图片</el-checkbox>
                  <div @click="handleCardClick(index)">
                    <el-image :src="item.url" fit="fill"/>
                  </div>
                  <div style="padding: 5px;">
                    <span>{{ item.fileName }}</span>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-main>
      </el-container>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelImages">取消</el-button>
        <el-button type="primary" @click="createImages">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { categoryAll } from '@/api/category'
import { deliveryAll } from '@/api/delivery'
import { uploadGroupAll, uploadGroupCreate, uploadGroupModify } from '@/api/uploadGroup'
import { uploadFileList, uploadFileModify } from '@/api/uploadFile'
import { goodCreate } from '@/api/good'
import { getToken } from '@/utils/auth'
const deductStockTypeOptions = [
  { key: 10, displayName: '下单减库存' },
  { key: 20, displayName: '付款减库存' }
]
const statusOptions = [
  { key: 10, displayName: '上架' },
  { key: 20, displayName: '下架' }
]
export default {
  directives: { waves },
  data() {
    const checkNumberAndZero = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('数值不能为空或0'))
      }
      if (!Number.isInteger(value)) {
        return callback(new Error('请输入数字值'))
      }
      callback()
    }
    /* const checkNumber = (rule, value, callback) => {
      if (!Number.isInteger(value)) {
        return callback(new Error('请输入数字值'))
      }
      callback()
    } */
    const checkWeight = (rule, value, callback) => {
      const reg = /^-?\d{1,5}(?:\.\d{1,2})?$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的重量数字'))
      }
    }
    return {
      imageUploadUrl: process.env.BASE_API + '/api/uploadFile/create',
      imageUploadShowFileList: false,
      imageUploadHeader: {
        'User-Token': getToken()
      },
      categoryAllData: [],
      deliveryAllData: [],
      deductStockTypeOptions,
      statusOptions,
      temp: {
        name: '',
        categoryId: undefined,
        imageIds: '',
        no: '',
        price: 100,
        linePrice: 100,
        stockNum: 1000,
        weight: 0,
        deductStockType: 10,
        deliveryId: undefined,
        status: 10,
        salesInitial: 50,
        sort: 100,
        content: ''
      },
      dialogImagesVisible: false,
      imageGroupsTableShowHeader: false,
      tempImageGroup: {
        id: undefined,
        name: ''
      },
      imageGroups: [],
      imageMoveGroups: [],
      images: [],
      selectedImages: [],
      rules: {
        name: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
        categoryId: [{ required: true, message: '商品分类不能为空', trigger: 'change' }],
        images: [{ required: true, message: '图片不能为空', trigger: 'blur' }],
        price: [{ required: true, validator: checkNumberAndZero, trigger: 'blur' }],
        stockNum: [{ required: true, validator: checkNumberAndZero, trigger: 'blur' }],
        // goodWeight: [{ required: true, validator: checkNumber, trigger: 'blur' }],
        weight: [
          { required: true, message: '请输入重量', trigger: 'blur' },
          { validator: checkWeight, trigger: 'blur' }
        ],
        deductStockType: [{ required: true, message: '计算库存方式不能为空', trigger: 'change' }],
        deliveryId: [{ required: true, message: '运费模板不能为空', trigger: 'change' }],
        status: [{ required: true, message: '商品状态不能为空', trigger: 'change' }],
        salesInitial: [
          { required: true, message: '初始销量不能为空', trigger: 'blur' },
          { type: 'number', message: '初始销量必须为数字值', trigger: 'blur' }
          // { validator: checkNumber, trigger: 'blur' }
        ],
        sort: [{ required: true, message: '商品排序不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    imagesProcessed: function() {
      if (this.images == null) return null
      if (this.images.length === 0) return []
      for (const image of this.images) {
        if (image.fileName) {
          image.url = process.env.IMAGE_BASE + 'goodImages/' + image.fileName
        }
      }
      return this.images
    },
    selectedImagesProcessed: function() {
      // this.temp.imageIds = ''
      if (this.selectedImages == null) return null
      if (this.selectedImages.length === 0) return []
      for (const image of this.selectedImages) {
        if (image.fileName) {
          image.url = process.env.IMAGE_BASE + 'goodImages/' + image.fileName
        }
      }
      return this.selectedImages
    }
  },
  watch: {
    selectedImages: function(newSelectedImages, oldSelectImages) {
      this.temp.imageIds = ''
      for (const image of newSelectedImages) {
        this.temp.imageIds += image.id + ','
      }
      if (this.temp.imageIds !== '') {
        this.temp.imageIds = this.temp.imageIds.substring(0, this.temp.imageIds.length - 1)
      }
    }
  },
  created() {
    categoryAll({}).then((response) => {
      this.categoryAllData = response.data
      return deliveryAll({})
    }).then((response) => {
      this.deliveryAllData = response.data
    })
  },
  methods: {
    resetTempImageGroup() {
      this.tempImageGroup = {
        id: undefined,
        name: ''
      }
    },
    resetImageGroups() {
      this.imageGroups = []
      this.imageMoveGroups = []
      this.imageGroups.push({
        id: -1,
        name: '全部',
        custom: false
      })
      this.imageGroups.push({
        id: 0,
        name: '未分组',
        custom: false
      })
      // 追加自定义分组
      uploadGroupAll({}).then((response) => {
        const customUploadGroups = response.data
        for (const group of customUploadGroups) {
          group.custom = true
          this.imageGroups.push(group)
          this.imageMoveGroups.push(group)
        }
      })
    },
    handleImages() {
      console.log('打开图片管理界面')
      this.resetImageGroups()
      this.images = []
      // 加载全部分组图片
      uploadFileList({ groupId: 0 }).then((response) => {
        console.log(response.data)
        this.images = response.data
      })
      this.dialogImagesVisible = true
    },
    handleClearImages() {
      this.selectedImages = []
    },
    cancelImages() {
      this.dialogImagesVisible = false
      // console.log('取消了图片库')
    },
    createImages() {
      // console.log('保存了图片库')
      this.selectedImages = []
      for (const image of this.images) {
        if (image.selected) {
          this.selectedImages.push(image)
        }
      }
      // console.log('界面上有' + this.selectedImages.length + '个图片')
      this.dialogImagesVisible = false
    },
    beforeUploadImage(file) {
      console.log(file)
      const isJPGOrPNG = (file.type === 'image/jpeg' || file.type === 'image/png')
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPGOrPNG) {
        this.$message.error('上传图片只能是JPG/PNG格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过2MB!')
      }
      return isJPGOrPNG && isLt2M
    },
    handleUploadImageSuccess() {
      // console.log('新增图片成功')
      // 默认切换未分组里面
      uploadFileList({ groupId: 0 }).then((response) => {
        console.log(response.data)
        this.images = response.data
      })
    },
    handleCreateImageGroup() {
      // console.log('点击了新增分组')
      this.resetTempImageGroup()
      this.$prompt('请输入新分组名称', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (value == null || value === '') {
          this.$message({
            type: 'info',
            message: '分组名称不能为空'
          })
          return
        }
        this.tempImageGroup.name = value
        uploadGroupCreate(this.tempImageGroup).then(() => {
          this.resetImageGroups()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消新增分组'
        })
      })
    },
    handleDropdownClick(row) {
      // console.log('点击了dropdown')
      // console.log(row)
      uploadFileList({ groupId: row.id }).then((response) => {
        console.log(response.data)
        this.images = response.data
      })
    },
    handleDropdownModifyCommand(row) {
      // console.log('点击了修改编号' + row.id)
      if (row.id === -1 || row.id === 0) {
        this.$message({
          type: 'info',
          message: '不能修改系统默认分组名称'
        })
        return
      }
      this.tempImageGroup = Object.assign({}, row)
      this.$prompt('修改分组名称', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: this.tempImageGroup.name
      }).then(({ value }) => {
        if (value == null || value === '') {
          this.$message({
            type: 'info',
            message: '分组名称不能为空'
          })
          return
        }
        this.tempImageGroup.name = value
        uploadGroupModify(this.tempImageGroup).then(() => {
          this.resetImageGroups()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消修改分组'
        })
      })
    },
    handleDropdownMoveCommand(id) {
      // console.log('点击了move的id为：' + id)
      // 将目前选中的图片放到id的组里
      let ids = ''
      for (const image of this.images) {
        if (image.selected) {
          ids += image.id + ','
        }
      }
      if (ids !== '') {
        ids = ids.substring(0, ids.length - 1)
      }
      uploadFileModify({
        ids: ids,
        groupId: id
      }).then(() => {
        this.$notify({
          title: '移动成功',
          message: '指定图片已移至相应分组',
          type: 'success',
          duration: 2000
        })
        return uploadFileList({ groupId: id })
      }).then((response) => {
        this.images = response.data
      })
    },
    handleCardClick(index) {
      // console.log('点击了图片' + index)
    },
    imageSelectChanged(index) {
      // console.log('选择了选中项' + index)
      // console.log('变成了' + this.images[index].selected)
    },
    handleDeleteImage() {
      this.$notify({
        title: '不支持的操作',
        message: '目前不支持删除图片的功能',
        type: 'warning',
        duration: 2000
      })
    },
    createData() {
      console.log(this.temp)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          goodCreate(Object.assign({}, this.temp)).then(() => {
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.$router.replace('/good/index')
          })
        }
      })
    }
  }
}
</script>
