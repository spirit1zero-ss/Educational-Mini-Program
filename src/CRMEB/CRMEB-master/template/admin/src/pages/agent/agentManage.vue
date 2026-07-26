<template>
  <div class="camp-agent-page">
    <el-card shadow="never" class="filter-card" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <div class="page-heading">
          <div>
            <h2>训练营分销员管理</h2>
            <p>身份、有效团队、固定返佣和提现状态统一按训练营数据统计</p>
          </div>
          <el-tag size="small" effect="plain" type="success">固定返佣模式</el-tag>
        </div>
        <el-form :model="formValidate" inline @submit.native.prevent>
          <el-form-item label="加入时间：">
            <el-date-picker
              v-model="timeVal"
              clearable
              type="daterange"
              :editable="false"
              format="yyyy/MM/dd"
              value-format="yyyy/MM/dd"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              style="width: 250px"
              @change="changeTime"
            />
          </el-form-item>
          <el-form-item label="搜索：">
            <el-input
              v-model.trim="formValidate.nickname"
              clearable
              class="form_content_width"
              placeholder="姓名、电话或 UID"
              @clear="search"
              @keyup.enter.native="search"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-db-click @click="search">查询</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <div class="summary-grid">
      <div v-for="item in summaryCards" :key="item.key" class="summary-card">
        <span class="summary-label">{{ item.label }}</span>
        <strong :class="item.tone"
          >{{ item.money ? '¥' : '' }}{{ summary[item.key] || (item.money ? '0.00' : 0) }}</strong
        >
        <small>{{ item.hint }}</small>
      </div>
    </div>

    <el-card shadow="never" class="table-card">
      <div class="table-head">
        <div>
          <strong>分销账户</strong>
          <span>共 {{ total }} 人</span>
        </div>
        <el-alert
          title="这里只统计训练营有效订单及训练营返佣；历史商城余额、积分和百分比佣金不计入。"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <el-table v-loading="loading" :data="tableList" size="small" empty-text="暂无训练营分销会员">
        <el-table-column label="用户" min-width="190">
          <template slot-scope="scope">
            <div class="user-cell">
              <img :src="scope.row.avatar || defaultAvatar" alt="" />
              <div>
                <strong>{{ scope.row.nickname || `用户 ${scope.row.uid}` }}</strong>
                <span
                  >UID {{ scope.row.uid }}<template v-if="scope.row.phone"> · {{ scope.row.phone }}</template></span
                >
                <span v-if="scope.row.realName">{{ scope.row.realName }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="分销身份" min-width="125">
          <template slot-scope="scope">
            <div class="identity-cell">
              <span class="identity-key">{{ scope.row.levelKey }}</span>
              <div>
                <strong>{{ scope.row.levelName }}</strong>
                <small>{{ scope.row.identityCode }}</small>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="资格状态" min-width="120">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.isMember ? 'success' : 'info'">
              {{ scope.row.memberStatusText }}
            </el-tag>
            <el-tag size="mini" :type="scope.row.canPromote ? 'success' : 'warning'" class="status-tag">
              {{ scope.row.promotionStatusText }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="返佣名额" min-width="160">
          <template slot-scope="scope">
            <template v-if="Number(scope.row.agentLevel) === 0">
              <div class="quota-line"><strong>1</strong><span>固定显示，不递减</span></div>
            </template>
            <template v-else>
              <div class="quota-line">
                <strong>{{ scope.row.remainingQuota }}</strong>
                <span>剩余 / {{ scope.row.initialQuota }}</span>
              </div>
              <el-progress :percentage="quotaPercent(scope.row)" :show-text="false" :stroke-width="5" color="#4d7cfe" />
              <small class="muted">已用 {{ scope.row.usedQuota }}</small>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="有效团队" min-width="115">
          <template slot-scope="scope">
            <div class="stacked-data">
              <span
                >一级 <strong>{{ scope.row.firstLevelCount }}</strong></span
              >
              <span
                >二级 <strong>{{ scope.row.secondLevelCount }}</strong></span
              >
            </div>
          </template>
        </el-table-column>

        <el-table-column label="训练营收入" min-width="165">
          <template slot-scope="scope">
            <div class="income-cell">
              <strong>¥{{ scope.row.income.totalAmount }}</strong>
              <span>待审核 ¥{{ scope.row.income.pendingAmount }}</span>
              <span>可提现 ¥{{ scope.row.income.availableAmount }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="已提现" min-width="100">
          <template slot-scope="scope">
            <strong class="money-success">¥{{ scope.row.income.withdrawnAmount }}</strong>
          </template>
        </el-table-column>

        <el-table-column prop="spreadName" label="邀请人" min-width="125" />

        <el-table-column label="操作" fixed="right" width="155">
          <template slot-scope="scope">
            <a v-db-click @click="$refs.distributionDetails.open(scope.row)">分销详情</a>
            <el-divider direction="vertical" />
            <el-dropdown size="small" @command="changeMenu(scope.row, $event, scope.$index)">
              <span class="el-dropdown-link">更多<i class="el-icon-arrow-down el-icon--right"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="identity">设置分销身份</el-dropdown-item>
                <el-dropdown-item command="parent">调整邀请关系</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.spreadUid" command="unlink">解除邀请关系</el-dropdown-item>
                <el-dropdown-item :command="scope.row.canPromote ? 'freeze' : 'resume'">
                  {{ scope.row.canPromote ? '冻结推广资格' : '恢复推广资格' }}
                </el-dropdown-item>
                <el-dropdown-item command="refund" divided>退款会员处理</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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

    <distribution-details ref="distributionDetails" />
    <distribution-identity-dialog ref="distributionIdentityDialog" @success="refresh" />

    <el-dialog
      :visible.sync="promoterShow"
      title="调整邀请关系"
      width="540px"
      :close-on-click-modal="false"
      @closed="resetPromoter"
    >
      <el-alert
        title="调整后只影响后续团队归属；历史订单、佣金和提现记录继续保留。"
        type="warning"
        :closable="false"
        show-icon
      />
      <el-form ref="formInline" :model="formInline" label-width="100px" class="promoter-form" @submit.native.prevent>
        <el-form-item label="新邀请人：" prop="image">
          <div class="selected-promoter" v-db-click @click="customerShow = true">
            <template v-if="formInline.spread_uid">
              <img :src="formInline.image || defaultAvatar" alt="" />
              <span>UID {{ formInline.spread_uid }}</span>
            </template>
            <template v-else>
              <i class="el-icon-user"></i>
              <span>点击选择用户</span>
            </template>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="promoterShow = false">取消</el-button>
        <el-button type="primary" :loading="relationSubmitting" @click="submitPromoter">确认调整</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="customerShow" title="选择新的邀请人" width="1000px" append-to-body>
      <customer-info v-if="customerShow" @imageObject="imageObject" />
    </el-dialog>
  </div>
</template>

<script>
import { agentListApi, statisticsApi, agentSpreadApi } from '@/api/agent';
import { editUser } from '@/api/user';
import customerInfo from '@/components/customerInfo';
import DistributionDetails from '@/pages/user/list/handle/distributionDetails';
import DistributionIdentityDialog from '@/components/distribution/identityDialog';

export default {
  name: 'agentManage',
  components: {
    customerInfo,
    DistributionDetails,
    DistributionIdentityDialog,
  },
  data() {
    return {
      loading: false,
      relationSubmitting: false,
      customerShow: false,
      promoterShow: false,
      pickerOptions: this.$timeOptions,
      timeVal: [],
      total: 0,
      tableList: [],
      defaultAvatar: require('@/assets/images/moren.jpg'),
      summary: {},
      summaryCards: [
        { key: 'memberCount', label: '有效分销会员', hint: '含 C / M / D / H', tone: '' },
        { key: 'inviteCount', label: '有效拉新人数', hint: '已支付且未退款', tone: 'tone-blue' },
        { key: 'orderCount', label: '有效拉新订单', hint: '仅训练营订单', tone: 'tone-green' },
        { key: 'orderAmount', label: '有效订单金额', hint: '虚拟支付实付', tone: '', money: true },
        { key: 'pendingAmount', label: '待审核佣金', hint: '等待管理员审核', tone: 'tone-orange', money: true },
        { key: 'availableAmount', label: '可提现佣金', hint: '审核通过可申请', tone: 'tone-blue', money: true },
        { key: 'withdrawnAmount', label: '已提现金额', hint: '扣费后实际到账', tone: 'tone-green', money: true },
      ],
      formValidate: {
        nickname: '',
        data: '',
        page: 1,
        limit: 15,
      },
      formInline: {
        uid: 0,
        spread_uid: 0,
        image: '',
      },
    };
  },
  created() {
    this.refresh();
  },
  methods: {
    refresh() {
      this.getList();
      this.getStatistics();
    },
    getList() {
      this.loading = true;
      agentListApi(this.formValidate)
        .then((res) => {
          this.tableList = (res.data && res.data.list) || [];
          this.total = Number((res.data && res.data.count) || 0);
        })
        .catch((error) => {
          this.$message.error(error.msg || '训练营分销员加载失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getStatistics() {
      statisticsApi({
        nickname: this.formValidate.nickname,
        data: this.formValidate.data,
      })
        .then((res) => {
          this.summary = (res.data && (res.data.res || res.data)) || {};
        })
        .catch((error) => {
          this.$message.error(error.msg || '训练营分销统计加载失败');
        });
    },
    search() {
      this.formValidate.page = 1;
      this.refresh();
    },
    reset() {
      this.timeVal = [];
      this.formValidate = { nickname: '', data: '', page: 1, limit: 15 };
      this.refresh();
    },
    changeTime(value) {
      this.timeVal = value || [];
      this.formValidate.data = this.timeVal.length ? this.timeVal.join('-') : '';
      this.search();
    },
    quotaPercent(row) {
      const total = Number(row.initialQuota || 0);
      if (!total) return 0;
      return Math.min(100, Math.round((Number(row.usedQuota || 0) / total) * 100));
    },
    changeMenu(row, command, index) {
      if (command === 'identity') {
        this.$refs.distributionIdentityDialog.open(row);
      } else if (command === 'parent') {
        this.formInline.uid = Number(row.uid);
        this.promoterShow = true;
      } else if (command === 'unlink') {
        this.unlinkParent(row, index);
      } else if (command === 'freeze') {
        this.togglePromotion(row, false);
      } else if (command === 'resume') {
        this.togglePromotion(row, true);
      } else if (command === 'refund') {
        this.$router.push({ name: 'user_trainingCampOrders', query: { keyword: String(row.uid) } });
      }
    },
    unlinkParent(row, index) {
      this.$modalSure({
        title: `确认解除 ${row.nickname || `UID ${row.uid}`} 的邀请关系？历史订单和财务记录会保留。`,
        num: index,
        url: `agent/stair/delete_spread/${row.uid}`,
        method: 'PUT',
        ids: '',
      })
        .then((res) => {
          this.$message.success(res.msg || '邀请关系已解除');
          this.refresh();
        })
        .catch((error) => {
          if (error !== 'cancel') this.$message.error(error.msg || '解除邀请关系失败');
        });
    },
    togglePromotion(row, enabled) {
      const action = enabled ? '恢复' : '冻结';
      this.$confirm(
        `${action} ${row.nickname || `UID ${row.uid}`} 的推广资格？历史团队、佣金和提现记录不会删除。`,
        `${action}推广资格`,
        { type: 'warning', confirmButtonText: `确认${action}` },
      )
        .then(() => this.updateUserPromotion(row.uid, enabled))
        .then((res) => {
          this.$message.success(res.msg || `推广资格已${action}`);
          this.refresh();
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') this.$message.error(error.msg || `${action}推广资格失败`);
        });
    },
    updateUserPromotion(uid, enabled) {
      return editUser({
        uid: Number(uid),
        distribution_only: 'promotion',
        enabled: enabled ? 1 : 0,
      });
    },
    imageObject(user) {
      this.customerShow = false;
      this.formInline.spread_uid = Number(user.uid || 0);
      this.formInline.image = user.image || user.avatar || '';
    },
    submitPromoter() {
      if (!this.formInline.spread_uid) {
        return this.$message.warning('请选择新的邀请人');
      }
      if (this.formInline.uid === this.formInline.spread_uid) {
        return this.$message.warning('用户不能成为自己的邀请人');
      }
      this.relationSubmitting = true;
      agentSpreadApi(this.formInline)
        .then((res) => {
          this.$message.success(res.msg || '邀请关系已更新');
          this.promoterShow = false;
          this.refresh();
        })
        .catch((error) => {
          this.$message.error(error.msg || '邀请关系更新失败');
        })
        .finally(() => {
          this.relationSubmitting = false;
        });
    },
    resetPromoter() {
      this.formInline = { uid: 0, spread_uid: 0, image: '' };
      this.relationSubmitting = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.camp-agent-page {
  --camp-border: #e7ebf1;
  --camp-muted: #8792a2;
}

.filter-card,
.table-card {
  border-color: var(--camp-border);
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;

  h2 {
    margin: 0 0 5px;
    color: #252b3a;
    font-size: 18px;
    line-height: 24px;
  }

  p {
    margin: 0;
    color: var(--camp-muted);
    font-size: 12px;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(145px, 1fr));
  gap: 12px;
  margin: 16px 0;
  overflow-x: auto;
}

.summary-card {
  min-width: 145px;
  padding: 16px;
  border: 1px solid var(--camp-border);
  border-radius: 6px;
  background: #fff;

  span,
  strong,
  small {
    display: block;
  }

  .summary-label {
    color: #60656f;
    font-size: 12px;
  }

  strong {
    margin: 7px 0 5px;
    color: #252b3a;
    font-size: 22px;
    line-height: 28px;
    font-variant-numeric: tabular-nums;
  }

  small {
    color: #a0a8b4;
    font-size: 11px;
  }

  .tone-blue {
    color: #3569d4;
  }

  .tone-green {
    color: #1f9d68;
  }

  .tone-orange {
    color: #d9822b;
  }
}

.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;

  > div {
    flex: 0 0 auto;

    strong {
      margin-right: 8px;
      color: #303133;
      font-size: 14px;
    }

    span {
      color: var(--camp-muted);
      font-size: 12px;
    }
  }

  .el-alert {
    max-width: 650px;
    padding: 6px 12px;
  }
}

.user-cell,
.identity-cell {
  display: flex;
  align-items: center;
}

.user-cell {
  img {
    flex: 0 0 38px;
    width: 38px;
    height: 38px;
    margin-right: 10px;
    border-radius: 50%;
    object-fit: cover;
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: #303133;
    font-size: 13px;
  }

  span {
    margin-top: 2px;
    color: var(--camp-muted);
    font-size: 11px;
    line-height: 15px;
  }
}

.identity-cell {
  .identity-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 30px;
    height: 30px;
    margin-right: 8px;
    border-radius: 5px;
    background: #eef4ff;
    color: #3569d4;
    font-weight: 700;
  }

  strong,
  small {
    display: block;
  }

  strong {
    color: #303133;
    font-size: 12px;
  }

  small {
    margin-top: 2px;
    color: var(--camp-muted);
  }
}

.status-tag {
  display: block;
  width: max-content;
  margin-top: 5px;
}

.quota-line {
  display: flex;
  align-items: baseline;
  margin-bottom: 5px;

  strong {
    margin-right: 5px;
    color: #303133;
    font-size: 16px;
  }

  span {
    color: var(--camp-muted);
    font-size: 11px;
  }
}

.muted {
  color: var(--camp-muted);
  font-size: 11px;
}

.stacked-data,
.income-cell {
  span {
    display: block;
    color: #606266;
    font-size: 11px;
    line-height: 18px;
  }
}

.stacked-data strong {
  margin-left: 3px;
  color: #303133;
  font-variant-numeric: tabular-nums;
}

.income-cell {
  > strong {
    display: block;
    margin-bottom: 2px;
    color: #303133;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
}

.money-success {
  color: #1f9d68;
  font-variant-numeric: tabular-nums;
}

.promoter-form {
  margin-top: 18px;
}

.selected-promoter {
  display: inline-flex;
  align-items: center;
  min-width: 180px;
  min-height: 54px;
  padding: 8px 12px;
  border: 1px dashed #c8d0dc;
  border-radius: 6px;
  color: #606266;
  cursor: pointer;

  &:hover {
    border-color: var(--prev-color-primary);
    color: var(--prev-color-primary);
  }

  img {
    width: 36px;
    height: 36px;
    margin-right: 10px;
    border-radius: 50%;
    object-fit: cover;
  }

  i {
    margin-right: 8px;
    font-size: 20px;
  }
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(4, minmax(155px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-heading,
  .table-head {
    display: block;
  }

  .page-heading .el-tag,
  .table-head .el-alert {
    margin-top: 10px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(150px, 1fr));
  }
}
</style>
