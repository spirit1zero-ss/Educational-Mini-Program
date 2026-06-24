<template>
  <div>
    <el-dialog
      :visible.sync="modals"
      title="选择链接"
      :close-on-click-modal="false"
      append-to-body
      width="1000px"
    >
      <div class="table_box">
        <div class="left_box" v-if="fromType !== 'diyPage'">
          <el-tree
            :data="categoryData"
            node-key="id"
            default-expand-all
            :props="props"
            highlight-current
            :current-node-key="treeId"
            @node-click="handleCheckChange"
          />
        </div>

        <div class="right_box" v-if="currenType === 'link'">
          <div v-if="tableList.length">
            <div class="cont">请选择链接</div>
            <div class="Box">
              <div
                class="cont_box"
                :class="currenId === item.id ? 'on' : ''"
                v-for="(item, index) in tableList"
                :key="index"
                v-db-click
                @click="getUrl(item)"
              >
                {{ item.name || item.title }}
              </div>
            </div>
          </div>
        </div>

        <div
          class="right_box"
          :class="fromType === 'diyPage' ? 'diy' : ''"
          v-if="['product_category', 'product'].includes(currenType)"
        >
          <el-form ref="formValidate" :model="formValidate" class="tabform" v-if="currenType === 'product'">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="" label-for="pid">
                  <el-cascader
                    style="width: 180px"
                    v-model="formValidate.cate_id"
                    size="small"
                    :options="treeSelect"
                    :props="{ multiple: true, checkStrictly: true, emitPath: false }"
                    filterable
                    clearable
                    @change="userSearchs"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="" label-for="store_name">
                  <el-input
                    search
                    enter-button
                    placeholder="请输入商品名称、关键字、编号"
                    v-model="formValidate.store_name"
                    style="width: 200px"
                    @change="userSearchs"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <el-table
            row-key="id"
            ref="table"
            empty-text="暂无数据"
            :data="tableList"
            v-loading="loading"
            :max-height="currenType === 'product_category' ? '460' : '428'"
          >
            <el-table-column :width="currenType !== 'product_category' ? 50 : 80">
              <template slot-scope="scope">
                <el-radio
                  v-model="templateRadio"
                  :label="scope.row.id"
                  @change.native="getTemplateRow(scope.row)"
                >
                  &nbsp;
                </el-radio>
              </template>
            </el-table-column>
            <el-table-column
              :label="item.title"
              :width="item.width"
              :min-width="item.minWidth"
              v-for="(item, index) in currenType === 'product_category' ? columnsCategory : columnsProduct"
              :key="index"
            >
              <template slot-scope="scope">
                <span v-if="item.key">{{ scope.row[item.key] }}</span>
                <viewer v-else-if="item.slot === 'pic' && scope.row.hasOwnProperty('pic')">
                  <div class="tabBox_img">
                    <img v-lazy="scope.row.pic" />
                  </div>
                </viewer>
                <viewer v-else-if="item.slot === 'image' && scope.row.hasOwnProperty('image')">
                  <div class="tabBox_img">
                    <img v-lazy="scope.row.image" />
                  </div>
                </viewer>
              </template>
            </el-table-column>
          </el-table>
          <div class="acea-row row-right page" v-if="currenType === 'product'">
            <pagination
              v-if="total"
              :total="total"
              :page.sync="formValidate.page"
              :limit.sync="formValidate.limit"
              @pagination="getList"
            />
          </div>
        </div>

        <div class="right_box" v-if="currenType === 'custom'">
          <div style="width: 340px; margin: 150px 100px 0 120px">
            <el-form ref="customdate" :model="customdate" :rules="ruleValidate" :label-width="100">
              <div class="mb30 radioGroup">
                <el-radio-group v-model="customdate.status">
                  <el-radio :label="2">
                    <span>跳转其他小程序</span>
                  </el-radio>
                  <el-radio :label="1">
                    <span>普通链接</span>
                  </el-radio>
                </el-radio-group>
              </div>
              <el-form-item v-if="customdate.status === 1" label="跳转路径：" prop="url" key="url">
                <el-input v-model="customdate.url" placeholder="请输入正确跳转路径" />
              </el-form-item>
              <div v-if="customdate.status === 2">
                <el-form-item label="APPID：" prop="appid" key="appid">
                  <el-input v-model="customdate.appid" placeholder="请输入正确APPID" />
                </el-form-item>
                <el-form-item label="小程序路径：" prop="mpUrl" key="mpUrl">
                  <el-input v-model="customdate.mpUrl" placeholder="请输入正确小程序路径" />
                </el-form-item>
              </div>
            </el-form>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button v-db-click @click="cancel">取消</el-button>
        <el-button type="primary" v-db-click @click="handleSubmit('customdate')" v-if="currenType === 'custom'">
          确定
        </el-button>
        <el-button type="primary" v-db-click @click="ok" v-else>确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { pageCategory } from '@/api/diy';
import { cascaderListApi, changeListApi } from '@/api/product';
import { linkListApi } from '@/api/setting';

const ALLOWED_TYPES = ['link', 'product', 'product_category', 'custom'];
const RETIRED_LINK_KEYWORDS = [
  '/pages/activity/',
  '/pages/points_mall',
  '/pages/goods/lottery',
  '/pages/goods/receive_gift',
  '/pages/goods/receive_gifts_status',
  '/pages/users/user_coupon',
  '/pages/users/user_get_coupon',
  '/pages/users/user_integral',
  '/pages/users/user_money',
  '/pages/users/user_payment',
  '/pages/columnGoods/HotNewGoods',
  '/pages/columnGoods/live_list',
  '/pages/extension/news',
  '/pages/extension/customer_list',
];

function hasRetiredUrl(value) {
  return RETIRED_LINK_KEYWORDS.some((keyword) => String(value || '').includes(keyword));
}

function filterTree(nodes = []) {
  return nodes
    .filter((node) => ALLOWED_TYPES.includes(node.type) || (node.children && node.children.length))
    .map((node) => ({ ...node, children: filterTree(node.children || []) }))
    .filter((node) => ALLOWED_TYPES.includes(node.type) || node.children.length);
}

export default {
  name: 'linkaddress',
  props: {
    fromType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      modals: false,
      categoryData: [],
      currenType: 'link',
      props: {
        label: 'name',
        children: 'children',
      },
      templateRadio: 0,
      columnsCategory: [
        { title: 'ID', key: 'id', width: 60 },
        { title: '分类名称', key: 'cate_name', tree: true },
        { title: '分类图标', slot: 'pic' },
      ],
      columnsProduct: [
        { title: 'ID', key: 'id', width: 60 },
        { title: '商品图片', slot: 'image', width: 90 },
        { title: '商品名称', key: 'store_name' },
      ],
      formValidate: {
        page: 1,
        limit: 15,
        cate_id: '',
        store_name: '',
      },
      total: 0,
      currenId: '',
      currenUrl: '',
      loading: false,
      tableList: [],
      presentId: 0,
      categoryId: '',
      treeSelect: [],
      customdate: {
        url: '',
        appid: '',
        mpUrl: '',
        status: 2,
      },
      ruleValidate: {
        url: [{ required: true, message: '请输入跳转路径', trigger: 'blur' }],
        appid: [{ required: true, message: '请输入APPID', trigger: 'blur' }],
      },
      treeId: 0,
    };
  },
  created() {
    this.getSort();
    this.goodsCategory();
  },
  methods: {
    getTemplateRow(row) {
      this.presentId = row.id;
      this.currenUrl = row.url;
    },
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (!valid) {
          this.$message.error('请填写信息');
          return;
        }
        const url = this.customdate.status === 1
          ? this.customdate.url
          : `${this.customdate.mpUrl}@APPID=${this.customdate.appid}`;
        this.$emit('linkUrl', url);
        this.modals = false;
        this.reset();
      });
    },
    goodsCategory() {
      cascaderListApi(1)
        .then((res) => {
          this.treeSelect = res.data;
        })
        .catch((res) => {
          this.$message.error(res.msg || '获取商品分类失败');
        });
    },
    userSearchs() {
      this.formValidate.page = 1;
      this.getList();
    },
    reset() {
      this.currenUrl = '';
      this.presentId = 0;
      this.currenId = '';
      this.customdate.url = '';
    },
    getUrl(item) {
      this.currenId = item.id;
      this.currenUrl = item.url;
    },
    getSort() {
      pageCategory()
        .then((res) => {
          this.categoryData = filterTree(res.data);
          const firstGroup = this.categoryData.find((item) => item.children && item.children.length);
          const firstNode = firstGroup && firstGroup.children[0];
          if (firstNode) this.handleCheckChange(firstNode);
        })
        .catch((err) => {
          this.$message.error(err.msg || '获取链接分类失败');
        });
    },
    getList() {
      this.loading = true;
      this.formValidate.limit = 15;
      changeListApi(this.formValidate)
        .then((res) => {
          const data = res.data;
          data.list.forEach((item) => {
            item.url = `/pages/goods_details/index?id=${item.id}`;
          });
          this.tableList = data.list;
          this.total = data.count;
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
          this.$message.error(res.msg || '获取商品列表失败');
        });
    },
    handleCheckChange(data) {
      this.reset();
      this.treeId = data.id;
      if (!data.pid || !ALLOWED_TYPES.includes(data.type)) return;

      this.categoryId = data.id;
      this.currenType = data.type;
      this.loading = true;

      if (this.currenType === 'product') {
        this.getList();
        return;
      }
      if (this.currenType === 'custom') {
        this.loading = false;
        return;
      }

      linkListApi({ id: data.id, page: 1 })
        .then((res) => {
          const list = res.data.list || [];
          this.total = res.data.count;
          this.tableList = list
            .filter((item) => !hasRetiredUrl(item.url || item.value || item.val))
            .map((item) => {
              if (this.currenType !== 'product_category') return item;
              const url = item.url || `/pages/goods/goods_list/index?cid=${item.id}&title=${item.cate_name}`;
              return { ...item, url };
            });
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          this.$message.error(err.msg || '获取链接列表失败');
        });
    },
    ok() {
      if (!this.currenUrl) {
        return this.$message.warning('请选择链接');
      }
      this.$emit('linkUrl', this.currenUrl);
      this.modals = false;
      this.reset();
    },
    cancel() {
      this.modals = false;
      this.reset();
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__body {}

::v-deep .el-tree-node__content {
  height: 30px;
}

::v-deep .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  background-color: var(--prev-bg-menu-hover-ba-color) !important;
  border-right: 2px solid var(--prev-color-primary);
}

::v-deep .el-table .cell {
  display: flex;
  align-items: center;
}

.tabBox_img {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
  }
}

::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 6px #ddd;
}

::-webkit-scrollbar {
  width: 4px !important;
}

.on {
  background-color: var(--prev-color-primary) !important;
  color: #fff !important;
}

.radioGroup {
  ::v-deep .ivu-radio-wrapper {
    margin-right: 30px;
  }
}

.table_box {
  display: flex;
  position: relative;

  .left_box {
    width: 171px;
    height: 470px;
    border-right: 1px solid #eeeeee;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .right_box {
    margin-left: 23px;
    font-size: 13px;
    font-family: PingFang SC;
    flex: 1;
    height: 470px;
    overflow-x: hidden;
    overflow-y: auto;

    .cont {
      font-weight: bold;
      color: #000000;
    }

    .Box {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;

      .cont_box {
        font-weight: 400;
        color: rgba(0, 0, 0, 0.85);
        background: #fafafa;
        border-radius: 3px;
        text-align: center;
        padding: 7px 30px;
        margin-right: 10px;
        margin-bottom: 10px;
        cursor: pointer;

        &:hover {
          background-color: var(--prev-bg-menu-hover-ba-color);
          color: #333;
        }
      }
    }
  }

  ::v-deep .el-table .cell {
    padding-right: 0;
  }

  ::v-deep .page {
    margin-top: 10px;
  }
}
</style>
