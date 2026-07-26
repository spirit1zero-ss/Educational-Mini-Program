<template>
  <el-dialog
    :visible.sync="visible"
    title="设置分销合作身份"
    width="680px"
    append-to-body
    :close-on-click-modal="false"
    @closed="reset"
  >
    <div v-loading="loading">
      <div class="user-summary">
        <img :src="user.avatar || defaultAvatar" alt="" />
        <div>
          <strong>{{ user.nickname || `用户 ${user.uid || ''}` }}</strong>
          <span
            >UID {{ user.uid || '--' }}<template v-if="user.phone"> · {{ user.phone }}</template></span
          >
        </div>
      </div>

      <distribution-identity-select v-model="agentLevel" />

      <el-alert class="identity-alert" :title="identityTip" type="info" :closable="false" show-icon />
    </div>

    <span slot="footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">确认设置</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { editUser, getUserInfo } from '@/api/user';
import DistributionIdentitySelect from './identitySelect';

export default {
  name: 'DistributionIdentityDialog',
  components: { DistributionIdentitySelect },
  data() {
    return {
      visible: false,
      loading: false,
      submitting: false,
      user: {},
      agentLevel: 0,
      originalLevel: 0,
      defaultAvatar: require('@/assets/images/moren.jpg'),
    };
  },
  computed: {
    identityTip() {
      if (Number(this.agentLevel) > 0) {
        return '设置为 M / D / H 后将同步开通训练营会员与推广资格，小程序会显示对应身份和名额。';
      }
      return '设置为 C 普通会员只调整返佣档位，不会自动撤销现有训练营会员资格。';
    },
  },
  methods: {
    open(row) {
      this.visible = true;
      this.loading = true;
      getUserInfo(Number(row.uid || 0))
        .then((res) => {
          this.user = (res.data && res.data.userInfo) || {};
          this.agentLevel = Number(this.user.agent_level || 0);
          this.originalLevel = this.agentLevel;
        })
        .catch((error) => {
          this.$message.error(error.msg || '用户信息加载失败');
          this.visible = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submit() {
      if (!this.user.uid) return;
      this.submitting = true;
      editUser({
        uid: this.user.uid,
        distribution_only: 'identity',
        agent_level: Number(this.agentLevel || 0),
      })
        .then((res) => {
          this.$message.success(res.msg || '分销身份已更新');
          this.visible = false;
          this.$emit('success');
        })
        .catch((error) => {
          this.$message.error(error.msg || '分销身份更新失败');
        })
        .finally(() => {
          this.submitting = false;
        });
    },
    reset() {
      this.user = {};
      this.agentLevel = 0;
      this.originalLevel = 0;
      this.loading = false;
      this.submitting = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.user-summary {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  padding: 12px 14px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #f8fafc;

  img {
    width: 42px;
    height: 42px;
    margin-right: 12px;
    border-radius: 50%;
    object-fit: cover;
  }

  strong,
  span {
    display: block;
  }

  strong {
    margin-bottom: 4px;
    color: #303133;
    font-size: 14px;
  }

  span {
    color: #909399;
    font-size: 12px;
  }
}

.identity-alert {
  margin-top: 16px;
}
</style>
