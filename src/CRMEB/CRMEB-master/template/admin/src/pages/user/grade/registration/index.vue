<template>
  <div>
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form
          ref="formValidate"
          :model="formValidate"
          :label-width="labelWidth"
          :label-position="labelPosition"
          inline
          @submit.native.prevent
          class="tabform"
        >
          <el-form-item label="关键词：">
            <el-input
              clearable
              placeholder="姓名/电话/用户/订单号"
              v-model="formValidate.keyword"
              class="form_content_width"
              @keyup.enter.native="userSearchs"
            />
          </el-form-item>
          <el-form-item label="提交时间：">
            <el-date-picker
              clearable
              v-model="timeVal"
              type="daterange"
              :editable="false"
              @change="onchangeTime"
              format="yyyy/MM/dd"
              value-format="yyyy/MM/dd"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              style="width: 250px"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-db-click @click="userSearchs">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card :bordered="false" shadow="never" class="ivu-mt mt16">
      <el-table :data="tbody" ref="table" v-loading="loading" size="small">
        <el-table-column label="用户" min-width="130">
          <template slot-scope="scope">
            <div>{{ scope.row.nickname || '--' }}</div>
            <div class="muted">UID: {{ scope.row.uid }}</div>
          </template>
        </el-table-column>
        <el-table-column label="孩子姓名" min-width="100">
          <template slot-scope="scope">{{ scope.row.child_name }}</template>
        </el-table-column>
        <el-table-column label="年龄" width="70">
          <template slot-scope="scope">{{ scope.row.child_age }}</template>
        </el-table-column>
        <el-table-column label="性别" width="90">
          <template slot-scope="scope">{{ scope.row.child_gender_text || '--' }}</template>
        </el-table-column>
        <el-table-column label="联系电话" min-width="120">
          <template slot-scope="scope">{{ scope.row.contact_phone }}</template>
        </el-table-column>
        <el-table-column label="主要问题" min-width="220">
          <template slot-scope="scope">{{ scope.row.problem_text || '--' }}</template>
        </el-table-column>
        <el-table-column label="其它说明" min-width="180">
          <template slot-scope="scope">{{ scope.row.other_problem || '--' }}</template>
        </el-table-column>
        <el-table-column label="关联订单" min-width="160">
          <template slot-scope="scope">{{ scope.row.order_sn || '--' }}</template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="150">
          <template slot-scope="scope">{{ scope.row.update_time || '--' }}</template>
        </el-table-column>
      </el-table>
      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="tablePage.page"
          :limit.sync="tablePage.limit"
          @pagination="getList"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { trainingCampRegistrationList } from '@/api/user';
import { mapState } from 'vuex';

export default {
  name: 'trainingCampRegistration',
  data() {
    return {
      tbody: [],
      loading: false,
      total: 0,
      formValidate: {
        keyword: '',
        add_time: '',
      },
      pickerOptions: this.$timeOptions,
      timeVal: [],
      tablePage: {
        page: 1,
        limit: 15,
      },
    };
  },
  computed: {
    ...mapState('media', ['isMobile']),
    labelWidth() {
      return this.isMobile ? undefined : '90px';
    },
    labelPosition() {
      return this.isMobile ? 'top' : 'right';
    },
  },
  created() {
    this.getList();
  },
  methods: {
    userSearchs() {
      this.tablePage.page = 1;
      this.getList();
    },
    onchangeTime(e) {
      this.timeVal = e || [];
      this.formValidate.add_time = this.timeVal[0] ? (this.timeVal ? this.timeVal.join('-') : '') : '';
      this.tablePage.page = 1;
      this.getList();
    },
    getList() {
      this.loading = true;
      const data = {
        page: this.tablePage.page,
        limit: this.tablePage.limit,
        keyword: this.formValidate.keyword,
        add_time: this.formValidate.add_time,
      };
      trainingCampRegistrationList(data)
        .then((res) => {
          this.loading = false;
          const { list, count } = res.data;
          this.tbody = list;
          this.total = count;
        })
        .catch((err) => {
          this.loading = false;
          this.$message.error(err.msg || '获取登记表失败');
        });
    },
  },
};
</script>

<style scoped>
.muted {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}
</style>
