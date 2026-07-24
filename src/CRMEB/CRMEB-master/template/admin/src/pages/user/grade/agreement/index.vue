<template>
  <div>
    <el-card :bordered="false" shadow="never" class="ivu-mt">
      <el-alert
        title="这里维护小程序支付与报名页面展示的正式协议。发布前请由业务负责人核对文本。"
        type="warning"
        :closable="false"
        show-icon
        class="agreement-tip"
      />
      <el-tabs v-model="activeKey" @tab-click="loadAgreement">
        <el-tab-pane v-for="item in types" :key="item.key" :label="item.label" :name="item.key" />
      </el-tabs>
      <el-form label-width="100px" @submit.native.prevent v-loading="loading">
        <el-form-item label="协议名称：">
          <el-input v-model="agreement.title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="协议内容：">
          <WangEditor
            :key="activeKey + '-' + editorVersion"
            :content="agreement.content"
            @editorContent="getEditorContent"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-db-click :loading="saving" @click="saveAgreement">保存当前协议</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import WangEditor from '@/components/wangEditor/index.vue';
import { getAgreements, setAgreements } from '@/api/system';

export default {
  name: 'miniappAgreements',
  components: { WangEditor },
  data() {
    return {
      types: [
        { key: 'service', label: '训练营服务协议', type: 1 },
        { key: 'privacy', label: '隐私政策', type: 3 },
        { key: 'registration', label: '报名信息使用说明', type: 9 },
      ],
      activeKey: 'service',
      loading: false,
      saving: false,
      editorVersion: 0,
      agreement: {
        id: 0,
        type: 1,
        title: '',
        content: '',
      },
    };
  },
  created() {
    this.loadAgreement();
  },
  methods: {
    currentType() {
      return this.types.find((item) => item.key === this.activeKey) || this.types[0];
    },
    getEditorContent(content) {
      this.agreement.content = content;
    },
    loadAgreement() {
      const current = this.currentType();
      this.loading = true;
      getAgreements(current.type)
        .then((res) => {
          const data = res.data || {};
          this.agreement = {
            id: Number(data.id || 0),
            type: current.type,
            title: data.title || current.label,
            content: data.content || '',
          };
          this.editorVersion += 1;
        })
        .catch((error) => this.$message.error(error.msg || '协议加载失败'))
        .finally(() => {
          this.loading = false;
        });
    },
    saveAgreement() {
      if (!this.agreement.title.trim()) {
        this.$message.warning('请填写协议名称');
        return;
      }
      if (!this.agreement.content.trim()) {
        this.$message.warning('请填写协议内容');
        return;
      }
      this.saving = true;
      setAgreements(this.agreement)
        .then((res) => {
          this.$message.success(res.msg || '保存成功');
          this.loadAgreement();
        })
        .catch((error) => this.$message.error(error.msg || '保存失败'))
        .finally(() => {
          this.saving = false;
        });
    },
  },
};
</script>

<style scoped>
.agreement-tip {
  margin-bottom: 18px;
}
</style>
