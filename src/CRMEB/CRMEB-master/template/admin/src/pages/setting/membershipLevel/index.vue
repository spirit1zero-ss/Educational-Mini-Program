<template>
  <div class="distribution-policy-page">
    <el-card :bordered="false" shadow="never">
      <div class="policy-header">
        <div>
          <div class="policy-title">训练营分销身份与返佣规则</div>
          <div class="policy-subtitle">终端客户统一支付 ¥399，订单款进入公司账户，再按推广人身份产生固定返佣。</div>
        </div>
        <div class="switch-control">
          <span>训练营分销</span>
          <el-switch
            v-model="distributionEnabled"
            :disabled="switchLoading"
            active-text="开启"
            inactive-text="关闭"
            @change="changeDistributionSwitch"
          />
        </div>
      </div>

      <el-alert
        class="policy-alert"
        title="这是训练营独立分销配置，不再使用旧商城分销开关和百分比字段。关闭后停止生成推广关系和新佣金，历史团队、佣金与提现记录仍保留。"
        type="success"
        :closable="false"
        show-icon
      />

      <div class="policy-summary">
        <div class="summary-item">
          <span class="summary-label">统一售价</span>
          <strong>¥399</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">一级返佣</span>
          <strong>¥120–¥300</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">二级返佣</span>
          <strong>统一 ¥20</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">结算方式</span>
          <strong>人工审核</strong>
        </div>
      </div>
    </el-card>

    <el-card :bordered="false" shadow="never" class="mt16">
      <div class="table-toolbar">
        <div>
          <div class="table-title">身份规则</div>
          <div class="table-tip">金额由支付结算服务统一提供，后台展示与实际发放保持一致。</div>
        </div>
        <div class="table-search">
          <el-input
            v-model.trim="formValidate.keyword"
            clearable
            placeholder="搜索身份名称或代码"
            @keyup.enter.native="search"
            @clear="search"
          />
          <el-button type="primary" v-db-click @click="search">查询</el-button>
        </div>
      </div>

      <el-table
        class="mt14"
        :data="tabList"
        v-loading="loading"
        highlight-current-row
        empty-text="暂无身份规则"
      >
        <el-table-column label="身份代码" min-width="100">
          <template slot-scope="scope">
            <span class="identity-code" :class="`identity-${scope.row.levelKey.toLowerCase()}`">
              {{ scope.row.levelKey }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="levelName" label="合作身份" min-width="140" />
        <el-table-column label="团队初始名额" min-width="150">
          <template slot-scope="scope">
            <strong class="quota-value">{{ scope.row.initialQuota }}</strong>
            <span class="unit">人</span>
          </template>
        </el-table-column>
        <el-table-column label="名额内一级返佣" min-width="160">
          <template slot-scope="scope">
            <strong class="commission-value">¥{{ money(scope.row.firstCommission) }}</strong>
            <span class="unit">/ 单</span>
          </template>
        </el-table-column>
        <el-table-column label="名额用完后" min-width="145">
          <template slot-scope="scope">
            <span v-if="scope.row.quotaLimited">
              ¥{{ money(scope.row.fallbackCommission) }} / 单
            </span>
            <span v-else>始终 ¥{{ money(scope.row.firstCommission) }} / 单</span>
          </template>
        </el-table-column>
        <el-table-column label="二级固定返佣" min-width="160">
          <template slot-scope="scope">
            <strong class="commission-value second">¥{{ money(scope.row.secondCommission) }}</strong>
            <span class="unit">/ 单</span>
          </template>
        </el-table-column>
        <el-table-column label="规则状态" min-width="120">
          <template>
            <el-tag type="success" size="small">已生效</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="rule-grid mt16">
      <el-card :bordered="false" shadow="never">
        <div class="table-title">佣金计算示例</div>
        <div class="table-tip">盟友产生3个一级成交、2个二级成交</div>
        <div class="formula-box">
          <div>
            <span>一级收入</span>
            <strong>3 × ¥150 = ¥450</strong>
          </div>
          <div>
            <span>二级收入</span>
            <strong>2 × ¥20 = ¥40</strong>
          </div>
          <div class="formula-total">
            <span>总收入</span>
            <strong>¥490</strong>
          </div>
        </div>
        <div class="rule-note">
          ¥399订单款全部进入公司账户，不进入推广人余额；推广人只获得对应的一级或二级佣金。
        </div>
      </el-card>

      <el-card :bordered="false" shadow="never">
        <div class="table-title">团队名额口径</div>
        <div class="table-tip">团队人数和名额均以有效支付订单为准</div>
        <div class="definition-list">
          <div>
            <span>一级团队</span>
            <p>直接邀请且完成399元支付、未退款的成员。</p>
          </div>
          <div>
            <span>二级团队</span>
            <p>一级有效成员继续邀请并完成支付的成员。</p>
          </div>
          <div>
            <span>名额占用</span>
            <p>M/D/H 仅一级有效订单占用高返佣名额；名额用完后一级按普通会员 ¥120/单返佣。</p>
          </div>
          <div>
            <span>退款恢复</span>
            <p>订单退款后，团队人数减少、一级名额恢复、对应佣金撤销。</p>
          </div>
          <div>
            <span>普通会员</span>
            <p>C 身份页面固定显示 1 个名额，暂不消耗也不递减，一级始终返佣 ¥120/单。</p>
          </div>
        </div>
      </el-card>
    </div>

    <el-card :bordered="false" shadow="never" class="mt16">
      <div class="table-title">收入状态链路</div>
      <div class="table-tip">人工审核控制佣金结算与提现，已提现只统计用户实际确认到账的净额。</div>
      <div class="status-flow">
        <template v-for="(step, index) in flowSteps">
          <div :key="step" class="flow-step">
            <span>{{ index + 1 }}</span>
            <strong>{{ step }}</strong>
          </div>
          <i v-if="index < flowSteps.length - 1" :key="step + '-arrow'" class="el-icon-arrow-right"></i>
        </template>
      </div>
      <div class="withdraw-example">
        <span>提现示例</span>
        <strong>申请 ¥490</strong>
        <i>−</i>
        <strong>手续费 ¥2.94（0.6%）</strong>
        <i>=</i>
        <strong class="received">实际到账 ¥487.06</strong>
      </div>
    </el-card>

    <div class="rule-grid mt16">
      <el-card :bordered="false" shadow="never">
        <div class="table-title">小程序展示口径</div>
        <div class="display-groups">
          <div>
            <strong>分销中心</strong>
            <p>已邀请：一级有效成交人数</p>
            <p>总收入：有效一级佣金＋二级佣金</p>
            <p>已提现：扣除手续费后的实际到账金额</p>
          </div>
          <div>
            <strong>我的团队</strong>
            <p>团队初始名额、已使用名额、剩余名额</p>
            <p>一级团队、二级团队及成员明细</p>
          </div>
          <div>
            <strong>我的收益</strong>
            <p>待结算、可提现、提现中、已到账</p>
            <p>一级收入明细、二级收入明细</p>
          </div>
        </div>
      </el-card>

      <el-card :bordered="false" shadow="never">
        <div class="table-title">身份开通方式</div>
        <div class="table-tip">第一版不做自动升级，也不提供线上购买合作身份。</div>
        <div class="activation-list">
          <div>
            <span class="identity-code identity-c">C</span>
            <p><strong>普通会员</strong>购买399元训练营并确认支付后自动获得。</p>
          </div>
          <div>
            <span class="identity-code identity-m">M</span>
            <p><strong>盟友</strong>线下确认合作款后，由后台人工设置。</p>
          </div>
          <div>
            <span class="identity-code identity-d">D</span>
            <p><strong>代理</strong>线下确认合作款后，由后台人工设置。</p>
          </div>
          <div>
            <span class="identity-code identity-h">H</span>
            <p><strong>合伙人</strong>线下确认合作款后，由后台人工设置。</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import {
  membershipDataListApi,
  trainingCampDistributionSwitchApi,
} from '@/api/membershipLevel';

export default {
  name: 'trainingCampDistributionPolicy',
  data() {
    return {
      formValidate: {
        keyword: '',
        mode: 'training_camp',
      },
      tabList: [],
      loading: false,
      switchLoading: false,
      distributionEnabled: true,
      flowSteps: [
        '客户支付399元',
        '开通永久会员',
        '生成固定佣金',
        '进入待结算',
        '后台审核',
        '变为可提现',
        '申请提现',
        '后台转账',
        '用户确认到账',
      ],
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    money(value) {
      const amount = Number(value || 0);
      return Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2);
    },
    getList() {
      this.loading = true;
      membershipDataListApi(this.formValidate)
        .then((res) => {
          this.tabList = (res.data && res.data.list) || [];
          this.distributionEnabled = !!(res.data && res.data.enabled);
        })
        .catch((res) => {
          this.$message.error(res.msg || '身份规则加载失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    search() {
      this.getList();
    },
    changeDistributionSwitch(enabled) {
      this.switchLoading = true;
      trainingCampDistributionSwitchApi(enabled)
        .then((res) => {
          this.$message.success(res.msg || (enabled ? '训练营分销已开启' : '训练营分销已关闭'));
        })
        .catch((res) => {
          this.distributionEnabled = !enabled;
          this.$message.error(res.msg || '训练营分销开关保存失败');
        })
        .finally(() => {
          this.switchLoading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.distribution-policy-page {
  .policy-header,
  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .switch-control {
    display: flex;
    align-items: center;
    gap: 14px;
    color: #515a6e;
    white-space: nowrap;
  }

  .policy-title,
  .table-title {
    color: #17233d;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.5;
  }

  .table-title {
    font-size: 17px;
  }

  .policy-subtitle,
  .table-tip {
    margin-top: 5px;
    color: #808695;
    font-size: 13px;
    line-height: 1.7;
  }

  .policy-alert {
    margin-top: 20px;
  }

  .policy-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-top: 20px;
  }

  .summary-item {
    min-height: 92px;
    padding: 18px 20px;
    border: 1px solid #e5f2ea;
    border-radius: 10px;
    background: linear-gradient(135deg, #f7fcf8 0%, #ffffff 100%);

    strong {
      display: block;
      margin-top: 9px;
      color: #087a4f;
      font-size: 22px;
      line-height: 1.2;
    }
  }

  .summary-label {
    color: #808695;
    font-size: 13px;
  }

  .table-search {
    display: flex;
    gap: 10px;
    width: 340px;
  }

  .identity-code {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    box-shadow: 0 5px 12px rgba(8, 122, 79, 0.16);
  }

  .identity-c {
    background: #2f8f68;
  }

  .identity-m {
    background: #159d6b;
  }

  .identity-d {
    background: #3b82d0;
  }

  .identity-h {
    background: #e79a2c;
  }

  .quota-value,
  .commission-value {
    color: #17233d;
    font-size: 18px;
  }

  .commission-value {
    color: #159d6b;
  }

  .commission-value.second {
    color: #3b82d0;
  }

  .unit {
    margin-left: 4px;
    color: #808695;
    font-size: 12px;
  }

  .rule-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .formula-box {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 18px;

    div {
      padding: 16px;
      border-radius: 9px;
      background: #f7f8fa;
    }

    span,
    strong {
      display: block;
    }

    span {
      margin-bottom: 8px;
      color: #808695;
      font-size: 13px;
    }

    strong {
      color: #17233d;
      font-size: 17px;
    }

    .formula-total {
      background: #eff9f3;

      strong {
        color: #087a4f;
        font-size: 22px;
      }
    }
  }

  .rule-note {
    padding: 12px 14px;
    margin-top: 12px;
    color: #7a5b19;
    line-height: 1.7;
    border: 1px solid #f3dfac;
    border-radius: 8px;
    background: #fffaf0;
  }

  .definition-list {
    margin-top: 12px;

    > div {
      display: grid;
      grid-template-columns: 90px 1fr;
      padding: 11px 0;
      border-bottom: 1px solid #f0f1f3;
    }

    > div:last-child {
      border-bottom: 0;
    }

    span {
      color: #17233d;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #606266;
      line-height: 1.6;
    }
  }

  .status-flow {
    display: flex;
    align-items: center;
    margin-top: 20px;
    overflow-x: auto;
    padding-bottom: 6px;

    > i {
      flex: 0 0 auto;
      margin: 0 8px;
      color: #a9b0bb;
    }
  }

  .flow-step {
    flex: 1 0 92px;
    min-height: 82px;
    padding: 12px 8px;
    text-align: center;
    border: 1px solid #e4eee8;
    border-radius: 9px;
    background: #f8fcf9;

    span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-bottom: 8px;
      color: #fff;
      font-size: 12px;
      border-radius: 50%;
      background: #16a36a;
    }

    strong {
      display: block;
      color: #344050;
      font-size: 13px;
      line-height: 1.45;
    }
  }

  .withdraw-example {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    margin-top: 16px;
    border-radius: 9px;
    background: #f7f8fa;

    span {
      color: #808695;
    }

    i {
      color: #a9b0bb;
      font-style: normal;
    }

    .received {
      color: #087a4f;
      font-size: 18px;
    }
  }

  .display-groups {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;

    > div {
      padding: 16px;
      border: 1px solid #ebeef5;
      border-radius: 9px;
    }

    strong {
      color: #17233d;
      font-size: 15px;
    }

    p {
      margin: 9px 0 0;
      color: #606266;
      line-height: 1.6;
    }
  }

  .activation-list {
    margin-top: 12px;

    > div {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 0;
    }

    .identity-code {
      flex: 0 0 36px;
    }

    p {
      margin: 0;
      color: #606266;
      line-height: 1.6;
    }

    strong {
      color: #17233d;
    }
  }
}

@media (max-width: 900px) {
  .distribution-policy-page {
    .policy-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .table-toolbar,
    .rule-grid {
      align-items: flex-start;
      flex-direction: column;
    }

    .rule-grid {
      display: grid;
      grid-template-columns: 1fr;
    }

    .table-search {
      width: 100%;
    }

    .formula-box,
    .display-groups {
      grid-template-columns: 1fr;
    }

    .withdraw-example {
      align-items: flex-start;
      flex-direction: column;
      gap: 6px;
    }
  }
}
</style>
