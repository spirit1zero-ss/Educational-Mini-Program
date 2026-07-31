<template>
  <div>
    <el-card :bordered="false" shadow="never" class="ivu-mb-16" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form
          ref="formValidate"
          :model="formValidate"
          :label-width="labelWidth"
          label-position="right"
          inline
          @submit.native.prevent
        >
          <el-form-item label="时间选择：">
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
              class="mr20"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="提现状态：">
            <el-select
              clearable
              v-model="formValidate.status"
              placeholder="请选择状态"
              @change="selChange"
              class="form_content_width"
            >
              <el-option
                v-for="(item, index) in treeData.withdrawal"
                :key="index"
                :value="item.value"
                :label="item.title"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="提现方式：">
            <el-select
              clearable
              v-model="formValidate.extract_type"
              placeholder="请选择状态"
              @change="selChange"
              class="form_content_width"
            >
              <el-option
                v-for="(item, index) in treeData.payment"
                :key="index"
                :value="item.value"
                :label="item.title"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="搜索：">
            <el-input
              clearable
              placeholder="微信昵称/姓名/支付宝账号/银行卡尾号"
              v-model="formValidate.nireid"
              class="form_content_width"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-db-click @click="selChange">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <cards-data :cardLists="cardLists" v-if="extractStatistics"></cards-data>
    <el-card :bordered="false" shadow="never">
      <router-link :to="$routeProStr + '/finance/finance/commission'">
        <el-button type="primary">佣金记录</el-button>
      </router-link>
      <el-table ref="table" :data="tabList" v-loading="loading" empty-text="暂无数据" class="mt14">
        <el-table-column label="ID" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" min-width="130">
          <template slot-scope="scope">
            <div>
              用户昵称: {{ scope.row.nickname }} <br />
              用户id:{{ scope.row.uid }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提现金额" min-width="100">
          <template slot-scope="scope">
            <div>{{ scope.row.extract_price }}</div>
          </template>
        </el-table-column>
        <el-table-column label="提现手续费" min-width="100">
          <template slot-scope="scope">
            <div>{{ scope.row.extract_fee }}</div>
          </template>
        </el-table-column>
        <el-table-column label="到账金额" min-width="100">
          <template slot-scope="scope">
            <div class="f-price">{{ scope.row.receive_price }}</div>
          </template>
        </el-table-column>
        <el-table-column label="提现方式" min-width="130">
          <template slot-scope="scope">
            <div class="type" v-if="scope.row.extract_type === 'bank'">
              <div class="item">银行卡提现</div>
              <div class="item">姓名：{{ scope.row.real_name || '已保护' }}</div>
              <div class="item">卡号：{{ scope.row.bank_code || ('尾号 ' + scope.row.bank_code_last4) }}</div>
            </div>
            <div class="type" v-if="scope.row.extract_type === 'weixin'">
              <div class="item">昵称:{{ scope.row.nickname }}</div>
              <div class="item">微信号:{{ scope.row.wechat }}</div>
            </div>
            <div class="type" v-if="scope.row.extract_type === 'alipay'">
              <div class="item">姓名:{{ scope.row.real_name }}</div>
              <div class="item">支付宝号:{{ scope.row.alipay_code }}</div>
            </div>
            <div class="type" v-if="scope.row.extract_type === 'balance'">
              <div class="item">姓名:{{ scope.row.real_name }}</div>
              <div class="item">提现方式：佣金转入余额</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收款码" min-width="90">
          <template slot-scope="scope">
            <div
              class="tabBox_img"
              v-viewer
              v-if="scope.row.extract_type === 'weixin' || scope.row.extract_type === 'alipay'"
            >
              <img v-lazy="scope.row.qrcode_url" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" min-width="130">
          <template slot-scope="scope">
            <span>{{ scope.row.add_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="130">
          <template slot-scope="scope">
            <span>{{ scope.row.mark }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" min-width="130">
          <template slot-scope="scope">
            <div class="status" v-if="scope.row.status === 0">
              <div class="statusVal">申请中</div>
              <div></div>
            </div>
            <div class="statusVal" v-if="scope.row.status === 1">提现通过</div>
            <div class="statusVal status-payment" v-if="scope.row.status === 2">审核通过，待财务转账</div>
            <div class="statusVal" v-if="scope.row.status === -1">
              提现未通过<br />未通过原因：{{ scope.row.fail_msg }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="230">
          <template slot-scope="scope">
            <template v-if="scope.row.extract_type === 'bank' && (scope.row.status === 0 || scope.row.status === 2)">
              <a href="javascript:void(0);" v-db-click @click="showBankDetails(scope.row)">查看收款资料</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <template v-if="scope.row.status === 0">
              <template v-if="scope.row.extract_type !== 'bank'">
                <a href="javascript:void(0);" v-db-click @click="edit(scope.row)">编辑</a>
                <el-divider direction="vertical"></el-divider>
              </template>
              <a class="item" v-db-click @click="adopt(scope.row, scope.row.extract_type === 'bank' ? '确认审核通过并转交财务付款？' : '审核通过')">
                {{ scope.row.extract_type === 'bank' ? '通过审核' : '通过' }}
              </a>
              <el-divider direction="vertical"></el-divider>
              <a class="item" v-db-click @click="invalid(scope.row)">驳回</a>
            </template>
            <template v-else-if="scope.row.extract_type === 'bank' && scope.row.status === 2">
              <a class="item" v-db-click @click="openBankPayment(scope.row)">确认已转账</a>
              <el-divider direction="vertical"></el-divider>
              <a class="item" v-db-click @click="invalid(scope.row)">付款前驳回</a>
            </template>
            <template v-else-if="scope.row.extract_type === 'bank' && scope.row.status === 1">
              <span>流水号：{{ scope.row.payout_reference || '--' }}</span>
              <el-link
                v-if="scope.row.payout_proof"
                type="primary"
                :href="scope.row.payout_proof"
                target="_blank"
                class="proof-link"
              >付款凭证</el-link>
            </template>
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

    <!-- 编辑表单-->
    <edit-from ref="edits" :FromData="FromData" @submitFail="submitFail"></edit-from>
    <!-- 拒绝通过-->
    <el-dialog :visible.sync="modals" title="未通过原因" :close-on-click-modal="false" width="540px">
      <el-input v-model="fail_msg.message" type="textarea" :rows="4" placeholder="请输入未通过原因" />
      <div slot="footer">
        <el-button type="primary" size="small" v-db-click @click="oks">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="bankDetailsVisible"
      title="银行卡收款资料"
      :close-on-click-modal="false"
      width="560px"
      @closed="clearBankDetails"
    >
      <el-alert
        title="敏感资料仅限本次审核及付款使用，请勿复制到聊天工具或个人设备。"
        type="warning"
        :closable="false"
        show-icon
        class="bank-security-alert"
      />
      <div v-loading="bankDetailsLoading" class="bank-details-box">
        <el-descriptions v-if="bankDetails" :column="1" border>
          <el-descriptions-item label="用户 UID">{{ bankDetails.uid }}</el-descriptions-item>
          <el-descriptions-item label="开户姓名">{{ bankDetails.realName }}</el-descriptions-item>
          <el-descriptions-item label="银行卡号">{{ bankDetails.bankCard }}</el-descriptions-item>
          <el-descriptions-item label="开户银行">{{ bankDetails.bankName }}</el-descriptions-item>
          <el-descriptions-item label="申请金额">¥{{ bankDetails.amount }}</el-descriptions-item>
          <el-descriptions-item label="实际到账">¥{{ bankDetails.receivedAmount }}</el-descriptions-item>
          <el-descriptions-item label="用户授权">
            {{ bankDetails.consentAt ? '已授权' : '历史记录（无独立授权记录）' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div slot="footer">
        <el-button @click="bankDetailsVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="bankPaymentVisible"
      title="确认银行转账到账"
      :close-on-click-modal="false"
      width="560px"
      @closed="clearBankPayment"
    >
      <el-alert
        title="仅在银行转账已经成功后确认。确认后将计入用户“已到账”，且不可在本页面撤销。"
        type="warning"
        :closable="false"
        show-icon
        class="bank-security-alert"
      />
      <el-form label-width="100px">
        <el-form-item label="银行流水号" required>
          <el-input
            v-model.trim="bankPaymentForm.payout_reference"
            maxlength="96"
            show-word-limit
            autocomplete="off"
            placeholder="请输入银行回单或交易流水号"
          />
        </el-form-item>
        <el-form-item label="付款凭证" required>
          <el-upload
            action="#"
            :show-file-list="false"
            :http-request="uploadProof"
            :before-upload="beforeProofUpload"
            accept="image/jpeg,image/png,image/webp"
          >
            <el-button :loading="proofUploading" type="primary" plain>
              {{ bankPaymentForm.payout_proof ? '重新上传' : '上传图片凭证' }}
            </el-button>
          </el-upload>
          <el-image
            v-if="bankPaymentForm.payout_proof"
            class="proof-preview"
            :src="bankPaymentForm.payout_proof"
            :preview-src-list="[bankPaymentForm.payout_proof]"
            fit="cover"
          />
          <div class="proof-help">仅支持 JPG、PNG、WebP，大小不超过 5MB。</div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="bankPaymentVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="bankPaymentSubmitting"
          v-db-click
          @click="confirmBankPayment"
        >确认已经转账</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import cardsData from '@/components/cards/cards';
import searchFrom from '@/components/publicSearchFrom';
import { mapState } from 'vuex';
import {
  cashListApi,
  cashEditApi,
  refuseApi,
  bankDetailsApi,
  confirmBankPaymentApi,
} from '@/api/finance';
import { fileUpload } from '@/api/setting';
import { formatDate } from '@/utils/validate';
import editFrom from '@/components/from/from';
export default {
  name: 'cashApply',
  components: { cardsData, searchFrom, editFrom },
  filters: {
    formatDate(time) {
      if (time !== 0) {
        let date = new Date(time * 1000);
        return formatDate(date, 'yyyy-MM-dd hh:mm');
      }
    },
  },
  data() {
    return {
      images: ['1.jpg', '2.jpg'],
      modal_loading: false,
      fail_msg: {
        message: '输入信息不完整或有误!',
      },
      modals: false,
      total: 0,
      cardLists: [],
      loading: false,
      tabList: [],
      pickerOptions: this.$timeOptions,
      treeData: {
        withdrawal: [
          {
            title: '全部',
            value: '',
          },
          {
            title: '未通过',
            value: -1,
          },
          {
            title: '申请中',
            value: 0,
          },
          {
            title: '待财务转账',
            value: 2,
          },
          {
            title: '已通过',
            value: 1,
          },
        ],
        payment: [
          {
            title: '全部',
            value: '',
          },
          {
            title: '微信',
            value: 'wx',
          },
          {
            title: '支付宝',
            value: 'alipay',
          },
          {
            title: '银行卡',
            value: 'bank',
          },
        ],
      },
      formValidate: {
        status: '',
        extract_type: '',
        nireid: '',
        data: '',
        page: 1,
        limit: 20,
      },
      extractStatistics: {},
      timeVal: [],
      FromData: null,
      extractId: 0,
      bankDetailsVisible: false,
      bankDetailsLoading: false,
      bankDetails: null,
      bankPaymentVisible: false,
      bankPaymentSubmitting: false,
      proofUploading: false,
      bankPaymentId: 0,
      bankPaymentForm: {
        payout_reference: '',
        payout_proof: '',
      },
    };
  },
  watch: {
    $route() {
      if (this.$route.fullPath === this.$routeProStr + '/finance/user_extract/index?status=0') {
        this.getPath();
      }
    },
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
    if (this.$route.fullPath === this.$routeProStr + '/finance/user_extract/index?status=0') {
      this.getPath();
    } else {
      this.getList();
    }
  },
  methods: {
    getPath() {
      this.formValidate.page = 1;
      this.formValidate.status = parseInt(this.$route.query.status);
      this.getList();
    },
    // 无效
    invalid(row) {
      this.extractId = row.id;
      this.modals = true;
    },
    // 确定
    oks() {
      this.modal_loading = true;
      refuseApi(this.extractId, this.fail_msg)
        .then(async (res) => {
          this.$message.success(res.msg);
          this.modal_loading = false;
          this.modals = false;
          this.getList();
        })
        .catch((res) => {
          this.$message.error(res.msg);
        });
    },
    // 通过
    adopt(row, tit) {
      let delfromData = {
        title: tit,
        num: row.id,
        url: `finance/extract/adopt/${row.id}`,
        method: 'put',
        ids: '',
      };
      this.$modalSure(delfromData)
        .then((res) => {
          this.$message.success(res.msg);
          this.getList();
        })
        .catch((res) => {
          this.$message.error(res.msg);
        });
    },
    showBankDetails(row) {
      this.bankDetailsVisible = true;
      this.bankDetailsLoading = true;
      this.bankDetails = null;
      bankDetailsApi(row.id)
        .then((res) => {
          this.bankDetails = res.data;
        })
        .catch((res) => {
          this.bankDetailsVisible = false;
          this.$message.error(res.msg || '银行卡资料读取失败');
        })
        .finally(() => {
          this.bankDetailsLoading = false;
        });
    },
    clearBankDetails() {
      this.bankDetails = null;
      this.bankDetailsLoading = false;
    },
    openBankPayment(row) {
      this.bankPaymentId = row.id;
      this.bankPaymentForm = {
        payout_reference: '',
        payout_proof: '',
      };
      this.bankPaymentVisible = true;
    },
    beforeProofUpload(file) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        this.$message.error('付款凭证仅支持 JPG、PNG 或 WebP 图片');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.$message.error('付款凭证图片不能超过 5MB');
        return false;
      }
      return true;
    },
    uploadProof(option) {
      const formData = new FormData();
      formData.append('file', option.file);
      this.proofUploading = true;
      fileUpload(formData)
        .then((res) => {
          const src = res && res.data ? res.data.src : '';
          if (!src) throw new Error('付款凭证上传返回为空');
          this.bankPaymentForm.payout_proof = src;
          this.$message.success('付款凭证上传成功');
        })
        .catch((res) => {
          this.$message.error(res.msg || res.message || '付款凭证上传失败');
        })
        .finally(() => {
          this.proofUploading = false;
        });
    },
    confirmBankPayment() {
      const reference = String(this.bankPaymentForm.payout_reference || '').trim();
      if (reference.length < 4) {
        this.$message.error('请输入至少4位银行流水号');
        return;
      }
      if (!this.bankPaymentForm.payout_proof) {
        this.$message.error('请上传付款凭证图片');
        return;
      }
      this.$confirm('请再次确认银行转账已经成功。确认后将计入用户已到账。', '确认到账', {
        confirmButtonText: '已核对，确认到账',
        cancelButtonText: '返回检查',
        type: 'warning',
      }).then(() => {
        this.bankPaymentSubmitting = true;
        confirmBankPaymentApi(this.bankPaymentId, this.bankPaymentForm)
          .then((res) => {
            this.$message.success(res.msg);
            this.bankPaymentVisible = false;
            this.getList();
          })
          .catch((res) => {
            this.$message.error(res.msg || '确认银行转账失败');
          })
          .finally(() => {
            this.bankPaymentSubmitting = false;
          });
      }).catch(() => {});
    },
    clearBankPayment() {
      this.bankPaymentId = 0;
      this.proofUploading = false;
      this.bankPaymentSubmitting = false;
      this.bankPaymentForm = {
        payout_reference: '',
        payout_proof: '',
      };
    },
    // 具体日期
    onchangeTime(e) {
      this.timeVal = e;
      this.formValidate.data = this.timeVal ? this.timeVal.join('-') : '';
      this.formValidate.page = 1;
      this.getList();
    },
    // 选择时间
    selectChange(tab) {
      this.formValidate.page = 1;
      this.formValidate.data = tab;
      this.timeVal = [];
      this.getList();
    },
    // 选择
    selChange() {
      this.formValidate.page = 1;
      this.getList();
    },
    // 列表
    getList() {
      this.loading = true;
      cashListApi(this.formValidate)
        .then(async (res) => {
          let data = res.data;
          this.tabList = data.list.list;
          this.total = data.list.count;
          this.extractStatistics = data.extract_statistics;
          this.cardLists = [
            {
              col: 6,
              count: this.extractStatistics.brokerage_count,
              name: '佣金总金额',
              className: 'iconyuezhifujine',
            },
            { col: 6, count: this.extractStatistics.price, name: '待提现金额', className: 'iconfufeihuiyuanjine' },
            { col: 6, count: this.extractStatistics.priced, name: '已提现金额', className: 'iconzhifuyongjinjine' },
            {
              col: 6,
              count: this.extractStatistics.brokerage_not,
              name: '未提现金额',
              className: 'iconshangpintuikuanjine',
            },
          ];
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
          this.$message.error(res.msg);
        });
    },
    // 编辑
    edit(row) {
      cashEditApi(row.id)
        .then(async (res) => {
          if (res.data.status === false) {
            return this.$authLapse(res.data);
          }
          this.FromData = res.data;
          this.$refs.edits.modals = true;
        })
        .catch((res) => {
          this.$message.error(res.msg);
        });
    },
    // 编辑提交成功
    submitFail() {
      // this.getList();
    },
  },
};
</script>
<style lang="scss" scoped>
.ivu-mt .type .item {
  margin: 3px 0;
}
.tabform {
  margin-bottom: 10px;
}
.Refresh {
  font-size: 12px;
  color: var(--prev-color-primary);
  cursor: pointer;
}
.ivu-form-item {
  margin-bottom: 10px;
}
.status ::v-deep .item ~ .item {
  margin-left: 6px;
}
.status ::v-deep .statusVal {
  margin-bottom: 7px;
}
/*.ivu-mt ::v-deep .ivu-table-header*/
/*    border-top:1px dashed #ddd!important*/
.type {
  padding: 3px 0;
  box-sizing: border-box;
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
.z-price {
  color: red;
}
.f-price {
  color: green;
}
.status-payment {
  color: #e6a23c;
  font-weight: 600;
}
.proof-link {
  display: block;
  margin-top: 6px;
}
.bank-security-alert {
  margin-bottom: 20px;
}
.bank-details-box {
  min-height: 160px;
}
.proof-preview {
  display: block;
  width: 120px;
  height: 90px;
  margin-top: 12px;
  border-radius: 6px;
}
.proof-help {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
