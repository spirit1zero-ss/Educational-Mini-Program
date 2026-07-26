<template>
  <el-dialog
    :visible.sync="visible"
    width="1080px"
    append-to-body
    :close-on-click-modal="false"
    custom-class="distribution-detail-dialog"
    @closed="reset"
  >
    <template slot="title">
      <div class="dialog-title">
        <span>训练营分销详情</span>
        <el-tag v-if="overview.identity" size="small" effect="plain" type="success">
          {{ overview.identity.levelKey }} · {{ overview.identity.levelName }}
        </el-tag>
      </div>
    </template>

    <div v-loading="loading" class="distribution-detail">
      <template v-if="overview.user">
        <div class="account-head">
          <div class="user-block">
            <img :src="overview.user.avatar || defaultAvatar" class="avatar" />
            <div>
              <div class="user-name">{{ overview.user.nickname || '用户' + overview.user.uid }}</div>
              <div class="user-meta">
                UID {{ overview.user.uid }}
                <span v-if="overview.user.phone"> · {{ overview.user.phone }}</span>
              </div>
            </div>
          </div>
          <div class="identity-block">
            <span class="identity-label">身份编号</span>
            <strong>{{ overview.identity.identityCode }}</strong>
            <el-tag :type="overview.user.canPromote ? 'success' : 'info'" size="small">
              {{ overview.user.canPromote ? '推广资格正常' : '推广资格关闭' }}
            </el-tag>
          </div>
        </div>

        <el-alert
          title="客户统一支付399元进入公司账户；推广人仅获得固定佣金。名额只由一级有效支付订单占用，退款后恢复。"
          type="success"
          :closable="false"
          show-icon
        />

        <section class="detail-section">
          <div class="section-title">
            <span>团队与名额</span>
            <small>二级成交不重复占用上级名额</small>
          </div>
          <div class="metric-grid team-grid">
            <div class="metric-card">
              <span>团队初始名额</span>
              <strong>{{ overview.team.initialQuota }}</strong>
              <small>由合作身份决定</small>
            </div>
            <div class="metric-card">
              <span>已使用名额</span>
              <strong>{{ overview.team.usedQuota }}</strong>
              <small>一级有效成交</small>
            </div>
            <div class="metric-card">
              <span>剩余名额</span>
              <strong class="green">{{ overview.team.remainingQuota }}</strong>
              <small>退款后自动恢复</small>
            </div>
            <div class="metric-card">
              <span>分销拉新人数</span>
              <strong>{{ overview.team.pullNewCount }}</strong>
              <small>一级＋二级有效团队</small>
            </div>
            <div class="metric-card compact">
              <span>一级团队</span>
              <strong>{{ overview.team.firstLevelCount }}</strong>
            </div>
            <div class="metric-card compact">
              <span>二级团队</span>
              <strong>{{ overview.team.secondLevelCount }}</strong>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <div class="section-title">
            <span>收入状态</span>
            <small>已提现按扣除手续费后的实际到账金额统计</small>
          </div>
          <div class="metric-grid income-grid">
            <div class="metric-card money primary">
              <span>总收入</span>
              <strong>¥{{ overview.income.totalAmount }}</strong>
              <small>退款、撤销不计入</small>
            </div>
            <div class="metric-card money">
              <span>待结算</span>
              <strong>¥{{ overview.income.pendingAmount }}</strong>
              <small>等待后台审核</small>
            </div>
            <div class="metric-card money">
              <span>可提现</span>
              <strong>¥{{ overview.income.availableAmount }}</strong>
              <small>已审核可申请</small>
            </div>
            <div class="metric-card money">
              <span>提现中</span>
              <strong>¥{{ overview.income.withdrawingAmount }}</strong>
              <small>审核或收款确认中</small>
            </div>
            <div class="metric-card money">
              <span>已提现</span>
              <strong class="green">¥{{ overview.income.withdrawnAmount }}</strong>
              <small>实际到账净额</small>
            </div>
            <div class="metric-card money refund">
              <span>退款扣回</span>
              <strong>¥{{ overview.income.refundAmount }}</strong>
              <small>退款订单累计扣回佣金</small>
            </div>
            <div class="metric-card money debt">
              <span>待抵扣佣金</span>
              <strong>¥{{ overview.income.debtAmount }}</strong>
              <small>后续佣金将优先抵扣</small>
            </div>
          </div>
          <div class="income-breakdown">
            <span>一级收入 <strong>¥{{ overview.income.firstAmount }}</strong></span>
            <span>二级收入 <strong>¥{{ overview.income.secondAmount }}</strong></span>
            <span>已撤销佣金 <strong>¥{{ overview.income.revokedAmount }}</strong></span>
            <span>提现手续费 <strong>{{ overview.rules.withdrawalFeeRate }}%</strong></span>
          </div>
        </section>

        <section class="detail-section team-detail-section">
          <div class="section-title">
            <span>有效团队明细</span>
            <small>仅展示已完成训练营支付且未退款的成员</small>
          </div>
          <div class="team-toolbar">
            <el-radio-group v-model="teamForm.grade" size="small" @change="changeGrade">
              <el-radio-button :label="1">一级团队（{{ overview.team.firstLevelCount }}）</el-radio-button>
              <el-radio-button :label="2">二级团队（{{ overview.team.secondLevelCount }}）</el-radio-button>
            </el-radio-group>
            <div class="team-search">
              <el-input
                v-model.trim="teamForm.keyword"
                clearable
                placeholder="昵称、手机号或UID"
                @clear="searchTeam"
                @keyup.enter.native="searchTeam"
              />
              <el-button type="primary" @click="searchTeam">查询</el-button>
            </div>
          </div>

          <el-table v-loading="teamLoading" :data="teamList" empty-text="暂无有效团队成员">
            <el-table-column label="成员" min-width="180">
              <template slot-scope="scope">
                <div class="member-cell">
                  <img :src="scope.row.avatar || defaultAvatar" />
                  <div>
                    <div>{{ scope.row.nickname || '用户' + scope.row.uid }}</div>
                    <small>UID {{ scope.row.uid }}</small>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="成员身份" min-width="130">
              <template slot-scope="scope">
                <div>{{ scope.row.identityCode }}</div>
                <small>{{ scope.row.levelName }}</small>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" min-width="120" />
            <el-table-column prop="orderId" label="有效订单" min-width="180" />
            <el-table-column prop="paidTime" label="支付时间" min-width="150" />
            <el-table-column prop="joinedTime" label="绑定时间" min-width="150" />
          </el-table>
          <div class="acea-row row-right page">
            <pagination
              v-if="teamTotal"
              :total="teamTotal"
              :page.sync="teamForm.page"
              :limit.sync="teamForm.limit"
              @pagination="loadTeam"
            />
          </div>
        </section>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import { userDistributionOverviewApi, userDistributionTeamApi } from '@/api/user';

export default {
  name: 'distributionDetails',
  data() {
    return {
      visible: false,
      loading: false,
      teamLoading: false,
      uid: 0,
      overview: {},
      teamList: [],
      teamTotal: 0,
      teamForm: {
        grade: 1,
        keyword: '',
        page: 1,
        limit: 10,
      },
      defaultAvatar: require('@/assets/images/moren.jpg'),
    };
  },
  methods: {
    open(row) {
      this.uid = Number(row.uid || 0);
      this.visible = true;
      this.loading = true;
      Promise.all([this.loadOverview(), this.loadTeam()])
        .catch((error) => {
          this.$message.error(error.msg || '分销详情加载失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    loadOverview() {
      return userDistributionOverviewApi(this.uid).then((res) => {
        this.overview = res.data || {};
      });
    },
    loadTeam() {
      this.teamLoading = true;
      return userDistributionTeamApi(this.uid, this.teamForm)
        .then((res) => {
          this.teamList = (res.data && res.data.list) || [];
          this.teamTotal = Number((res.data && res.data.count) || 0);
        })
        .finally(() => {
          this.teamLoading = false;
        });
    },
    changeGrade() {
      this.teamForm.page = 1;
      this.teamForm.keyword = '';
      this.loadTeam();
    },
    searchTeam() {
      this.teamForm.page = 1;
      this.loadTeam();
    },
    reset() {
      this.uid = 0;
      this.overview = {};
      this.teamList = [];
      this.teamTotal = 0;
      this.teamForm = { grade: 1, keyword: '', page: 1, limit: 10 };
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #17233d;
}

.distribution-detail {
  min-height: 320px;
}

.account-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  margin-bottom: 14px;
  border: 1px solid #dcefe5;
  border-radius: 10px;
  background: linear-gradient(135deg, #f3fbf6 0%, #fffdf6 100%);
}

.user-block,
.identity-block,
.member-cell,
.team-toolbar,
.team-search,
.income-breakdown {
  display: flex;
  align-items: center;
}

.avatar {
  width: 48px;
  height: 48px;
  margin-right: 12px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  margin-bottom: 4px;
  font-size: 17px;
  font-weight: 600;
  color: #1f2d3d;
}

.user-meta,
.identity-label,
.section-title small,
.metric-card small,
.member-cell small,
td small {
  color: #909399;
}

.identity-block {
  gap: 12px;
}

.identity-block strong {
  font-size: 22px;
  letter-spacing: 1px;
  color: #128254;
}

.detail-section {
  margin-top: 22px;
}

.section-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #17233d;
}

.section-title small {
  font-size: 12px;
  font-weight: 400;
}

.metric-grid {
  display: grid;
  gap: 12px;
}

.team-grid {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.income-grid {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.metric-card {
  min-height: 102px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 9px;
  background: #fff;
}

.metric-card span,
.metric-card small {
  display: block;
}

.metric-card strong {
  display: block;
  margin: 9px 0 5px;
  font-size: 25px;
  color: #17233d;
}

.metric-card.compact strong {
  font-size: 21px;
}

.metric-card.money strong {
  font-size: 20px;
}

.metric-card.primary {
  border-color: #b8e2cb;
  background: #f5fbf7;
}

.metric-card.refund {
  border-color: #f1d1bc;
  background: #fff9f4;
}

.metric-card.debt {
  border-color: #f1b9b9;
  background: #fff7f7;
}

.metric-card.refund strong,
.metric-card.debt strong {
  color: #d64545;
}

.metric-card strong.green {
  color: #16a36a;
}

.income-breakdown {
  gap: 30px;
  padding: 12px 16px;
  margin-top: 10px;
  color: #606266;
  border-radius: 8px;
  background: #f7f8fa;
}

.income-breakdown strong {
  margin-left: 4px;
  color: #17233d;
}

.team-detail-section {
  padding-top: 18px;
  border-top: 1px solid #ebeef5;
}

.team-toolbar {
  justify-content: space-between;
  margin-bottom: 14px;
}

.team-search {
  gap: 8px;
  width: 330px;
}

.member-cell img {
  width: 34px;
  height: 34px;
  margin-right: 9px;
  border-radius: 50%;
  object-fit: cover;
}

@media (max-width: 1100px) {
  .team-grid,
  .income-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
