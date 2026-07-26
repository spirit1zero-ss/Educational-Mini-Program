<template>
  <div class="camp-orders-page">
    <div class="summary-grid">
      <el-card v-for="item in summaryCards" :key="item.key" shadow="never" class="summary-card">
        <div class="summary-label">{{ item.label }}</div>
        <div class="summary-value" :class="item.tone">{{ summary[item.key] || 0 }}</div>
      </el-card>
    </div>

    <el-card shadow="never" class="ivu-mt mt16" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form :model="form" inline @submit.native.prevent>
          <el-form-item label="关键词：">
            <el-input
              v-model="form.keyword"
              clearable
              class="form_content_width"
              placeholder="订单号/用户/手机号/孩子姓名"
              @keyup.enter.native="search"
            />
          </el-form-item>
          <el-form-item label="订单状态：">
            <el-select v-model="form.order_state" clearable class="form_content_width" @change="search">
              <el-option label="待支付" value="pending" />
              <el-option label="支付处理中" value="paying" />
              <el-option label="已支付" value="paid" />
              <el-option label="已关闭" value="closed" />
              <el-option label="已退款" value="refunded" />
              <el-option label="异常" value="exception" />
            </el-select>
          </el-form-item>
          <el-form-item label="发货确认：">
            <el-select v-model="form.delivery_state" clearable class="form_content_width" @change="search">
              <el-option label="未确认" value="not_delivered" />
              <el-option label="已确认" value="delivered" />
              <el-option label="确认失败" value="failed" />
            </el-select>
          </el-form-item>
          <el-form-item label="退款状态：">
            <el-select v-model="form.refund_state" clearable class="form_content_width" @change="search">
              <el-option label="无退款" value="none" />
              <el-option label="退款中" value="refunding" />
              <el-option label="已退款" value="refunded" />
              <el-option label="退款失败" value="failed" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间：">
            <el-date-picker
              v-model="timeVal"
              clearable
              type="daterange"
              format="yyyy/MM/dd"
              value-format="yyyy/MM/dd"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              style="width: 250px"
              @change="changeTime"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-db-click @click="search">查询</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card shadow="never" class="ivu-mt mt16">
      <el-table v-loading="loading" :data="list" size="small">
        <el-table-column label="订单/用户" min-width="210">
          <template slot-scope="scope">
            <div class="strong">{{ scope.row.orderId }}</div>
            <div class="muted">{{ scope.row.nickname || '未设置昵称' }} · UID {{ scope.row.uid }}</div>
            <div class="muted">{{ scope.row.phone || scope.row.contactPhone || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="90">
          <template slot-scope="scope"><span class="price">¥{{ scope.row.price }}</span></template>
        </el-table-column>
        <el-table-column label="本地订单" min-width="120">
          <template slot-scope="scope">
            <el-tag size="small" :type="orderTagType(scope.row.orderState)">{{ scope.row.orderStateText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="微信支付" min-width="150">
          <template slot-scope="scope">
            <template v-if="scope.row.latestAttempt">
              <el-tag size="small" :type="wxTagType(scope.row.latestAttempt.wxStatus)">{{ scope.row.latestAttempt.wxStatusText }}</el-tag>
              <div class="muted trade-no">{{ scope.row.latestAttempt.outTradeNo }}</div>
            </template>
            <span v-else class="muted">尚未发起</span>
          </template>
        </el-table-column>
        <el-table-column label="会员权益" min-width="110">
          <template slot-scope="scope">
            <el-tag size="small" :type="entitlementTagType(scope.row.entitlementState)">{{ scope.row.entitlementStateText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发货确认" min-width="110">
          <template slot-scope="scope">
            <el-tag size="small" :type="deliveryTagType(scope.row.deliveryState)">{{ scope.row.deliveryStateText }}</el-tag>
            <div v-if="scope.row.latestAttempt && scope.row.latestAttempt.deliveryRetryCount" class="muted">
              已重试 {{ scope.row.latestAttempt.deliveryRetryCount }} 次
            </div>
          </template>
        </el-table-column>
        <el-table-column label="退款" min-width="105">
          <template slot-scope="scope">
            <el-tag size="small" :type="refundTagType(scope.row.refundState)">{{ scope.row.refundStateText }}</el-tag>
            <div v-if="scope.row.refundSource" class="muted">{{ scope.row.refundSourceText }}</div>
            <div v-if="scope.row.refundAccountFrozen" class="muted">账号已冻结待复核</div>
          </template>
        </el-table-column>
        <el-table-column label="时间" min-width="155">
          <template slot-scope="scope">
            <div>{{ scope.row.payTime || scope.row.addTime }}</div>
            <div class="muted">更新 {{ scope.row.updateTime || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="390">
          <template slot-scope="scope">
            <el-button type="text" @click="openDetail(scope.row)">详情</el-button>
            <el-button
              v-if="scope.row.canSync"
              v-auth="['admin-user-training-camp-order-sync']"
              type="text"
              :loading="actionId === scope.row.id"
              @click="syncOrder(scope.row)"
            >核对支付</el-button>
            <el-button
              v-if="scope.row.canRetryDelivery"
              v-auth="['admin-user-training-camp-order-retry-delivery']"
              type="text"
              class="warning-action"
              :loading="actionId === scope.row.id"
              @click="retryDelivery(scope.row)"
            >重试权益确认</el-button>
            <el-button
              v-if="scope.row.canRegisterOfflineRefund"
              v-auth="['admin-user-training-camp-order-offline-refund']"
              type="text"
              class="danger-action"
              :loading="actionId === scope.row.id"
              @click="openOfflineRefund(scope.row)"
            >登记线下退款</el-button>
            <template v-if="scope.row.canReviewRefund">
              <el-button
                v-auth="['admin-user-training-camp-order-refund-review']"
                type="text"
                class="danger-action"
                :loading="actionId === scope.row.id"
                @click="reviewRefund(scope.row, 'revoke')"
              >撤销会员</el-button>
              <el-button
                v-auth="['admin-user-training-camp-order-refund-review']"
                type="text"
                :loading="actionId === scope.row.id"
                @click="reviewRefund(scope.row, 'retain')"
              >保留会员</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="page.page"
          :limit.sync="page.limit"
          @pagination="loadList"
        />
      </div>
    </el-card>

    <el-drawer title="训练营订单详情" :visible.sync="drawerVisible" size="680px" destroy-on-close>
      <div v-loading="detailLoading" class="drawer-body">
        <template v-if="detail && detail.order">
          <div class="detail-title">订单信息</div>
          <div class="detail-grid">
            <div><span>订单号</span><strong>{{ detail.order.orderId }}</strong></div>
            <div><span>用户</span><strong>{{ detail.order.nickname || '--' }}（UID {{ detail.order.uid }}）</strong></div>
            <div><span>金额</span><strong>¥{{ detail.order.price }}</strong></div>
            <div><span>孩子姓名</span><strong>{{ detail.order.childName || '--' }}</strong></div>
            <div><span>本地订单</span><strong>{{ detail.order.orderStateText }}</strong></div>
            <div><span>会员权益</span><strong>{{ detail.order.entitlementStateText }}</strong></div>
            <div><span>发货确认</span><strong>{{ detail.order.deliveryStateText }}</strong></div>
            <div>
              <span>退款</span>
              <strong>{{ detail.order.refundStateText }}{{ detail.order.refundAccountFrozen ? '（账号已冻结）' : '' }}</strong>
            </div>
            <template v-if="detail.order.refundSource">
              <div><span>退款来源</span><strong>{{ detail.order.refundSourceText }}</strong></div>
              <div><span>退款金额</span><strong>¥{{ detail.order.refundAmount }}</strong></div>
              <div><span>退款渠道</span><strong>{{ detail.order.refundChannelText }}</strong></div>
              <div><span>退款时间</span><strong>{{ detail.order.refundTime || '--' }}</strong></div>
              <div><span>外部流水号</span><strong>{{ detail.order.refundReference || '--' }}</strong></div>
              <div>
                <span>登记人员</span>
                <strong>
                  {{ detail.order.refundOperatorName || '--' }}
                  {{ detail.order.refundOperatorId ? `（ID ${detail.order.refundOperatorId}）` : '' }}
                </strong>
              </div>
              <div class="detail-wide"><span>退款备注</span><strong>{{ detail.order.refundNote || '--' }}</strong></div>
            </template>
          </div>
          <el-alert
            v-if="detail.order.lastError"
            class="detail-alert"
            type="warning"
            :closable="false"
            :title="detail.order.lastError"
          />

          <div class="detail-title">支付尝试</div>
          <el-table :data="detail.attempts || []" size="mini" border>
            <el-table-column prop="outTradeNo" label="虚拟支付单号" min-width="190" />
            <el-table-column prop="wxStatusText" label="微信状态" width="120" />
            <el-table-column prop="localState" label="本地状态" width="105" />
            <el-table-column prop="deliveryRetryCount" label="发货重试" width="80" />
            <el-table-column prop="updateTime" label="更新时间" min-width="150" />
          </el-table>

          <div class="detail-title">订单状态记录</div>
          <el-timeline v-if="detail.statusLogs && detail.statusLogs.length">
            <el-timeline-item v-for="(item, index) in detail.statusLogs" :key="index" :timestamp="item.time">
              <div class="strong">{{ item.message || item.changeType }}</div>
              <div class="muted">{{ item.changeType }}</div>
            </el-timeline-item>
          </el-timeline>
          <div v-else class="empty-text">暂无状态记录</div>
        </template>
      </div>
    </el-drawer>

    <el-dialog
      title="登记线下退款"
      :visible.sync="offlineRefundVisible"
      width="560px"
      append-to-body
      :close-on-click-modal="false"
      @closed="resetOfflineRefund"
    >
      <el-alert
        class="offline-refund-alert"
        type="warning"
        :closable="false"
        show-icon
        title="此处只登记已经在线下实际完成的退款，不会自动向用户付款。"
        description="提交后账号会冻结并进入退款待复核；只有后续点击“撤销会员”时，才会撤销会员与分销资格并扣回本订单佣金。"
      />
      <el-form
        ref="offlineRefundForm"
        :model="offlineRefundForm"
        :rules="offlineRefundRules"
        label-width="110px"
      >
        <el-form-item label="训练营订单">
          <div class="refund-order-readonly">
            <strong>{{ offlineRefundOrder.orderId || '--' }}</strong>
            <span>{{ offlineRefundOrder.nickname || '未设置昵称' }} · UID {{ offlineRefundOrder.uid || '--' }}</span>
          </div>
        </el-form-item>
        <el-form-item label="退款金额" prop="amount">
          <el-input v-model="offlineRefundForm.amount" disabled>
            <template slot="append">元（仅支持全额）</template>
          </el-input>
        </el-form-item>
        <el-form-item label="退款渠道" prop="channel">
          <el-select v-model="offlineRefundForm.channel" placeholder="请选择实际付款渠道" style="width: 100%">
            <el-option label="微信转账" value="wechat_transfer" />
            <el-option label="银行卡" value="bank" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="现金" value="cash" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="外部流水号" :required="offlineRefundForm.channel !== 'cash'">
          <el-input
            v-model.trim="offlineRefundForm.reference"
            maxlength="96"
            show-word-limit
            :placeholder="offlineRefundForm.channel === 'cash' ? '现金退款可填写收据编号' : '请填写转账或退款流水号'"
          />
        </el-form-item>
        <el-form-item label="实际退款时间" prop="refund_time">
          <el-date-picker
            v-model="offlineRefundForm.refund_time"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择线下实际付款时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="退款原因/备注" prop="note">
          <el-input
            v-model.trim="offlineRefundForm.note"
            type="textarea"
            :rows="4"
            maxlength="255"
            show-word-limit
            placeholder="必填：说明退款原因、收款人或其他核验信息"
          />
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button :disabled="offlineRefundSubmitting" @click="offlineRefundVisible = false">取消</el-button>
        <el-button type="danger" :loading="offlineRefundSubmitting" @click="submitOfflineRefund">
          确认已线下退款并登记
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  trainingCampOrderList,
  trainingCampOrderDetail,
  trainingCampOrderSync,
  trainingCampOrderRetryDelivery,
  trainingCampOrderRegisterOfflineRefund,
  trainingCampOrderReviewRefund,
} from '@/api/user';

export default {
  name: 'trainingCampOrders',
  data() {
    return {
      loading: false,
      detailLoading: false,
      drawerVisible: false,
      actionId: 0,
      offlineRefundVisible: false,
      offlineRefundSubmitting: false,
      offlineRefundOrder: {},
      offlineRefundForm: {
        amount: '',
        channel: '',
        reference: '',
        refund_time: '',
        note: '',
      },
      offlineRefundRules: {
        amount: [{ required: true, message: '缺少退款金额', trigger: 'blur' }],
        channel: [{ required: true, message: '请选择退款渠道', trigger: 'change' }],
        refund_time: [{ required: true, message: '请选择实际退款时间', trigger: 'change' }],
        note: [{ required: true, message: '请填写退款原因和备注', trigger: 'blur' }],
      },
      list: [],
      total: 0,
      detail: null,
      summary: {},
      summaryCards: [
        { key: 'total', label: '全部训练营订单', tone: '' },
        { key: 'pending', label: '待支付/处理中', tone: 'tone-blue' },
        { key: 'paid', label: '已支付', tone: 'tone-green' },
        { key: 'deliveryFailed', label: '发货确认失败', tone: 'tone-orange' },
        { key: 'refundReview', label: '退款待复核', tone: 'tone-red' },
      ],
      form: { keyword: '', order_state: '', delivery_state: '', refund_state: '', add_time: '' },
      timeVal: [],
      pickerOptions: this.$timeOptions,
      page: { page: 1, limit: 15 },
    };
  },
  created() {
    if (this.$route.query.keyword) {
      this.form.keyword = String(this.$route.query.keyword);
    }
    this.loadList();
  },
  methods: {
    loadList() {
      this.loading = true;
      trainingCampOrderList({ ...this.form, ...this.page })
        .then((res) => {
          this.list = res.data.list || [];
          this.total = Number(res.data.count || 0);
          this.summary = res.data.summary || {};
        })
        .catch((err) => this.$message.error(err.msg || '获取训练营订单失败'))
        .finally(() => { this.loading = false; });
    },
    search() {
      this.page.page = 1;
      this.loadList();
    },
    reset() {
      this.form = { keyword: '', order_state: '', delivery_state: '', refund_state: '', add_time: '' };
      this.timeVal = [];
      this.search();
    },
    changeTime(value) {
      this.timeVal = value || [];
      this.form.add_time = this.timeVal.length ? this.timeVal.join('-') : '';
      this.search();
    },
    openDetail(row) {
      this.drawerVisible = true;
      this.detailLoading = true;
      trainingCampOrderDetail(row.id)
        .then((res) => { this.detail = res.data; })
        .catch((err) => this.$message.error(err.msg || '获取订单详情失败'))
        .finally(() => { this.detailLoading = false; });
    },
    syncOrder(row) {
      this.runAction(row, trainingCampOrderSync, '确认向微信查询并核对该订单的真实支付状态？系统不会手工修改支付结果。');
    },
    retryDelivery(row) {
      this.runAction(row, trainingCampOrderRetryDelivery, '确认重试微信会员权益交付确认？该操作不会重复开通会员。');
    },
    openOfflineRefund(row) {
      this.offlineRefundOrder = { ...row };
      this.offlineRefundForm = {
        amount: row.price || '',
        channel: '',
        reference: '',
        refund_time: this.localDateTime(new Date()),
        note: '',
      };
      this.offlineRefundVisible = true;
      this.$nextTick(() => {
        if (this.$refs.offlineRefundForm) this.$refs.offlineRefundForm.clearValidate();
      });
    },
    submitOfflineRefund() {
      if (this.offlineRefundSubmitting) return;
      if (this.offlineRefundForm.channel !== 'cash' && !this.offlineRefundForm.reference) {
        this.$message.warning('请填写线下退款流水号');
        return;
      }
      this.$refs.offlineRefundForm.validate((valid) => {
        if (!valid) return;
        const row = this.offlineRefundOrder;
        this.$confirm(
          `请再次确认：已在线下向该用户实际退还 ¥${this.offlineRefundForm.amount}。本操作只登记事实，不会自动付款；提交后账号将被冻结。`,
          '确认线下退款已完成',
          {
            type: 'warning',
            confirmButtonText: '确认已付款并登记',
            cancelButtonText: '返回检查',
          }
        ).then(() => {
          this.offlineRefundSubmitting = true;
          this.actionId = row.id;
          return trainingCampOrderRegisterOfflineRefund(row.id, { ...this.offlineRefundForm });
        }).then((res) => {
          this.$message.success((res.data && res.data.message) || '线下退款已登记');
          this.offlineRefundVisible = false;
          this.loadList();
          if (this.drawerVisible) this.openDetail(row);
        }).catch((err) => {
          if (err !== 'cancel' && err !== 'close') this.$message.error(err.msg || '线下退款登记失败');
        }).finally(() => {
          this.offlineRefundSubmitting = false;
          this.actionId = 0;
        });
      });
    },
    resetOfflineRefund() {
      this.offlineRefundOrder = {};
      this.offlineRefundForm = {
        amount: '',
        channel: '',
        reference: '',
        refund_time: '',
        note: '',
      };
    },
    localDateTime(date) {
      const pad = (value) => String(value).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    },
    reviewRefund(row, decision) {
      const revoke = decision === 'revoke';
      const title = revoke ? '撤销退款订单会员' : '保留退款订单会员';
      const refundSource = row.refundSource === 'offline' ? '已登记的线下退款' : '微信退款';
      const message = revoke
        ? `仅在${refundSource}已经核验、且会员确由这笔订单开通时撤销。系统会关闭会员/分销资格、扣回本订单佣金，并解除退款冻结。请输入处理备注：`
        : '该操作会保留用户的永久会员，并解除退款冻结。请输入保留原因：';
      this.$prompt(message, title, {
        confirmButtonText: revoke ? '确认撤销' : '确认保留',
        cancelButtonText: '取消',
        type: revoke ? 'warning' : 'info',
        inputPlaceholder: '必填，最多 120 个字',
        inputValidator: (value) => {
          const note = String(value || '').trim();
          if (!note) return '请填写处理备注';
          if (note.length > 120) return '处理备注不能超过 120 个字';
          return true;
        },
      }).then(({ value }) => {
        this.actionId = row.id;
        return trainingCampOrderReviewRefund(row.id, { decision, note: String(value || '').trim() });
      }).then((res) => {
        this.$message.success((res.data && res.data.message) || '退款复核完成');
        this.loadList();
        if (this.drawerVisible) this.openDetail(row);
      }).catch((err) => {
        if (err !== 'cancel' && err !== 'close') this.$message.error(err.msg || '退款复核失败');
      }).finally(() => { this.actionId = 0; });
    },
    runAction(row, action, message) {
      this.$confirm(message, '操作确认', { type: 'warning' })
        .then(() => {
          this.actionId = row.id;
          return action(row.id);
        })
        .then((res) => {
          this.$message.success((res.data && res.data.message) || '操作完成');
          this.loadList();
          if (this.drawerVisible) this.openDetail(row);
        })
        .catch((err) => {
          if (err !== 'cancel' && err !== 'close') this.$message.error(err.msg || '操作失败');
        })
        .finally(() => { this.actionId = 0; });
    },
    orderTagType(state) {
      return { paid: 'success', closed: 'info', refunded: 'warning', exception: 'danger', paying: '' }[state] || '';
    },
    wxTagType(status) {
      if (status === 4) return 'success';
      if ([2, 3].includes(status)) return '';
      if ([5, 7, 8].includes(status)) return 'danger';
      if (status === 6) return 'info';
      return 'warning';
    },
    entitlementTagType(state) {
      return { granted: 'success', review: 'danger', revoked: 'info', retained: 'success', not_granted: 'info' }[state] || '';
    },
    deliveryTagType(state) {
      return { delivered: 'success', failed: 'danger', not_delivered: 'warning' }[state] || '';
    },
    refundTagType(state) {
      return { none: 'info', refunded: 'danger', refunding: 'warning', failed: 'danger' }[state] || '';
    },
  },
};
</script>

<style scoped>
.summary-grid { display: grid; grid-template-columns: repeat(5, minmax(150px, 1fr)); gap: 14px; }
.summary-card { border: 0; }
.summary-label { color: #87909c; font-size: 13px; }
.summary-value { margin-top: 9px; color: #17233d; font-size: 28px; font-weight: 700; }
.tone-blue { color: #2d8cf0; }.tone-green { color: #19be6b; }.tone-orange { color: #ff9900; }.tone-red { color: #ed4014; }
.strong { color: #303133; font-weight: 600; }.muted { margin-top: 4px; color: #909399; font-size: 12px; }
.price { color: #d48806; font-size: 15px; font-weight: 700; }.trade-no { max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
.warning-action { color: #e6a23c; }.danger-action { color: #f56c6c; }.drawer-body { box-sizing: border-box; min-height: 300px; padding: 0 24px 30px; }
.detail-title { margin: 22px 0 14px; color: #17233d; font-size: 16px; font-weight: 700; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; overflow: hidden; border: 1px solid #ebeef5; border-radius: 6px; background: #ebeef5; }
.detail-grid > div { display: flex; min-height: 44px; padding: 10px 12px; background: #fff; }
.detail-grid span { width: 82px; color: #909399; }.detail-grid strong { flex: 1; color: #303133; font-weight: 500; }
.detail-grid .detail-wide { grid-column: 1 / -1; }
.detail-alert { margin-top: 14px; }.empty-text { padding: 18px 0; color: #909399; text-align: center; }
.offline-refund-alert { margin-bottom: 20px; }
.refund-order-readonly { display: flex; flex-direction: column; min-height: 40px; padding: 8px 12px; border: 1px solid #ebeef5; border-radius: 4px; background: #f7f8fa; line-height: 22px; }
.refund-order-readonly strong { color: #303133; }.refund-order-readonly span { color: #909399; font-size: 12px; }
@media (max-width: 1200px) { .summary-grid { grid-template-columns: repeat(3, 1fr); } }
</style>
