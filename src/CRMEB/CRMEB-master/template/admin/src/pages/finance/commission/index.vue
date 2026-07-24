<template>
  <div>
    <el-card :bordered="false" shadow="never">
      <div class="settlement-head">
        <div>
          <div class="settlement-title">训练营佣金结算审核</div>
          <div class="settlement-desc">一级固定返佣120/150/200/300元，二级固定返佣20元；审核通过后才可提现。</div>
        </div>
        <div class="settlement-filters">
          <el-input
            v-model="settlementForm.keyword"
            placeholder="用户、手机号或订单号"
            clearable
            class="settlement-keyword"
            @keyup.enter.native="searchSettlements"
          />
          <el-select v-model="settlementForm.status" @change="searchSettlements">
            <el-option label="待结算" value="pending" />
            <el-option label="可提现" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
          <el-button type="primary" @click="searchSettlements">查询</el-button>
        </div>
      </div>
      <el-table :data="settlementList" v-loading="settlementLoading" empty-text="暂无训练营佣金记录" class="mt14">
        <el-table-column label="推广人" min-width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.nickname || '用户' + scope.row.uid }}</div>
            <small>{{ scope.row.identityCode }} · {{ scope.row.levelName }}</small>
          </template>
        </el-table-column>
        <el-table-column prop="commissionType" label="佣金类型" min-width="90" />
        <el-table-column label="佣金金额" min-width="90">
          <template slot-scope="scope"><strong>¥{{ scope.row.amount }}</strong></template>
        </el-table-column>
        <el-table-column label="关联客户" min-width="130">
          <template slot-scope="scope">
            <div>{{ scope.row.buyerName || '—' }}</div>
            <small>{{ scope.row.buyerPhone || scope.row.orderId || '—' }}</small>
          </template>
        </el-table-column>
        <el-table-column prop="orderId" label="订单号" min-width="180" />
        <el-table-column prop="addTime" label="产生时间" min-width="150" />
        <el-table-column prop="statusText" label="状态" min-width="80" />
        <el-table-column label="操作" fixed="right" min-width="150">
          <template slot-scope="scope">
            <template v-if="scope.row.status === 'pending'">
              <el-button type="text" @click="reviewSettlement(scope.row, 'approve')">通过</el-button>
              <el-button type="text" class="danger-text" @click="reviewSettlement(scope.row, 'reject')">驳回</el-button>
            </template>
            <span v-else>已处理</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="acea-row row-right page">
        <pagination
          v-if="settlementTotal"
          :total="settlementTotal"
          :page.sync="settlementForm.page"
          :limit.sync="settlementForm.limit"
          @pagination="getSettlementList"
        />
      </div>
    </el-card>

    <el-card :bordered="false" shadow="never" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form ref="formValidate" :label-width="labelWidth" label-position="right" inline @submit.native.prevent>
          <el-form-item label="昵称/ID：">
            <el-input placeholder="请输入" v-model="formValidate.nickname" clearable class="form_content_width" />
          </el-form-item>
          <el-form-item label="佣金范围：" class="tab_data">
            <el-input-number :controls="false" :min="0" class="mr10" v-model="formValidate.price_min" />
            <span class="mr10">一</span>
            <el-input-number :controls="false" :min="0" v-model="formValidate.price_max" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-db-click @click="userSearchs">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card :bordered="false" shadow="never" class="mt16">
      <el-button v-auth="['export-userCommission']" class="export" v-db-click @click="exports">导出</el-button>
      <el-table
        ref="table"
        :data="tabList"
        v-loading="loading"
        empty-text="暂无数据"
        @on-sort-change="sortChanged"
        class="mt14"
      >
        <el-table-column label="用户信息" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.nickname }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总佣金金额" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.sum_number }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="账户余额" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.now_money }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="账户佣金" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.brokerage_price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提现佣金" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.extract_price }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="formValidate.page"
          :limit.sync="formValidate.limit"
          @pagination="getList"
        />
      </div>
    </el-card>
    <commission-details ref="commission"></commission-details>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import {
  commissionListApi,
  memberCommissionListApi,
  reviewMemberCommissionApi,
  userCommissionApi,
} from '@/api/finance';
import commissionDetails from './handle/commissionDetails';

export default {
  name: 'commissionRecord',
  components: { commissionDetails },
  data() {
    return {
      total: 0,
      loading: false,
      tabList: [],
      settlementLoading: false,
      settlementList: [],
      settlementTotal: 0,
      settlementForm: {
        status: 'pending',
        keyword: '',
        page: 1,
        limit: 10,
      },
      formValidate: {
        nickname: '',
        price_max: undefined,
        price_min: undefined,
        excel: 0,
        page: 1, // 当前页
        limit: 20, // 每页显示条数
      },
    };
  },
  computed: {
    ...mapState('media', ['isMobile']),
    labelWidth() {
      return this.isMobile ? undefined : '80px';
    },
    labelPosition() {
      return this.isMobile ? 'top' : 'right';
    },
  },
  mounted() {
    this.getSettlementList();
    this.getList();
  },
  methods: {
    getSettlementList() {
      this.settlementLoading = true;
      memberCommissionListApi(this.settlementForm)
        .then((res) => {
          this.settlementList = res.data.list || [];
          this.settlementTotal = Number(res.data.count || 0);
        })
        .catch((res) => this.$message.error(res.msg || '结算记录加载失败'))
        .finally(() => {
          this.settlementLoading = false;
        });
    },
    searchSettlements() {
      this.settlementForm.page = 1;
      this.getSettlementList();
    },
    reviewSettlement(row, decision) {
      if (decision === 'approve') {
        this.$confirm(`确认将¥${row.amount}结算为可提现吗？`, '结算审核', { type: 'warning' })
          .then(() => reviewMemberCommissionApi(row.id, { decision: 'approve', reason: '' }))
          .then((res) => {
            this.$message.success(res.msg);
            this.getSettlementList();
          })
          .catch((error) => {
            if (error && error.msg) this.$message.error(error.msg);
          });
        return;
      }
      this.$prompt('请输入驳回原因', '驳回结算', {
        confirmButtonText: '确认驳回',
        cancelButtonText: '取消',
        inputValidator: (value) => (String(value || '').trim() ? true : '请填写驳回原因'),
      })
        .then(({ value }) => reviewMemberCommissionApi(row.id, { decision: 'reject', reason: value }))
        .then((res) => {
          this.$message.success(res.msg);
          this.getSettlementList();
        })
        .catch((error) => {
          if (error && error.msg) this.$message.error(error.msg);
        });
    },
    // 列表
    getList() {
      this.loading = true;
      commissionListApi(this.formValidate)
        .then(async (res) => {
          let data = res.data;
          this.tabList = data.list;
          this.total = data.count;
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
          this.$message.error(res.msg);
        });
    },
    // 搜索
    userSearchs() {
      this.formValidate.page = 1;
      this.getList();
    },
    // 导出
    exports() {
      let formValidate = this.formValidate;
      let data = {
        price_max: formValidate.price_max,
        price_min: formValidate.price_min,
        nickname: formValidate.nickname,
      };
      userCommissionApi(data)
        .then((res) => {
          location.href = res.data[0];
        })
        .catch((res) => {
          this.$message.error(res.msg);
        });
    },
    // 详情
    Info(row) {
      this.$refs.commission.modals = true;
      this.$refs.commission.getDetails(row.uid);
      this.$refs.commission.getList(row.uid);
    },
    // 排序
    sortChanged(e) {
      if (e.key == 'sum_number') {
        delete this.formValidate.brokerage_price;
      } else {
        delete this.formValidate.sum_number;
      }
      this.formValidate[e.key] = e.order;
      this.getList();
    },
  },
};
</script>

<style lang="scss" scoped>
.lines {
  padding-top: 6px !important;
}
.tabform .export {
  margin-left: 10px;
}
.tab_data ::v-deep .ivu-form-item-content {
  display: flex !important;
}
.settlement-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}
.settlement-title {
  color: #17233d;
  font-size: 18px;
  font-weight: 700;
}
.settlement-desc {
  margin-top: 6px;
  color: #808695;
  font-size: 13px;
}
.settlement-filters {
  display: flex;
  align-items: center;
  gap: 10px;
}
.settlement-keyword {
  width: 230px;
}
.danger-text {
  color: #f56c6c;
}
small {
  color: #909399;
}
@media (max-width: 900px) {
  .settlement-head {
    align-items: stretch;
    flex-direction: column;
  }
  .settlement-filters {
    flex-wrap: wrap;
  }
}
</style>
