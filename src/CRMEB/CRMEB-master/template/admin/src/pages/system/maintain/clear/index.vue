<template>
  <div class="maintenance-page">
    <el-alert
      title="维护操作只影响当前服务实例"
      description="刷新缓存不会删除用户、订单、会员、佣金或提现数据。云托管存在多个实例时，其他实例会在重启或缓存到期后恢复。"
      type="info"
      :closable="false"
      show-icon
      class="mb16"
    />

    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="maintenance-card">
          <div class="card-icon cache-icon">
            <i class="el-icon-refresh"></i>
          </div>
          <div class="card-content">
            <h3>刷新系统缓存</h3>
            <p>清理配置、菜单、路由和运行缓存。设置保存后未生效或出现缓存解析错误时，可优先执行此操作。</p>
            <el-button type="primary" :loading="cacheLoading" v-db-click @click="refreshCache">立即刷新</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="maintenance-card">
          <div class="card-icon log-icon">
            <i class="el-icon-document"></i>
          </div>
          <div class="card-content">
            <h3>清理运行日志</h3>
            <p>删除当前实例 runtime 目录中的 PHP 运行日志，不会删除后台“系统日志”里的管理员操作记录。</p>
            <el-button :loading="logLoading" v-db-click @click="clearLogs">清理运行日志</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { clearRuntimeLogApi, refreshSystemCacheApi } from '@/api/system';

export default {
  name: 'systemClear',
  data() {
    return {
      cacheLoading: false,
      logLoading: false,
    };
  },
  methods: {
    refreshCache() {
      this.cacheLoading = true;
      refreshSystemCacheApi()
        .then((res) => {
          this.$message.success(res.msg || '系统缓存已刷新');
        })
        .catch((err) => {
          this.$message.error(err.msg || '缓存刷新失败');
        })
        .finally(() => {
          this.cacheLoading = false;
        });
    },
    clearLogs() {
      this.$confirm('清理后将无法通过服务器文件查看此前的 PHP 运行日志，是否继续？', '清理运行日志', {
        confirmButtonText: '确认清理',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.logLoading = true;
          return clearRuntimeLogApi();
        })
        .then((res) => {
          this.$message.success(res.msg || '运行日志已清理');
        })
        .catch((err) => {
          if (err !== 'cancel' && err !== 'close') {
            this.$message.error(err.msg || '运行日志清理失败');
          }
        })
        .finally(() => {
          this.logLoading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.maintenance-page {
  padding: 16px;
}

.mb16 {
  margin-bottom: 16px;
}

.maintenance-card {
  min-height: 230px;
  margin-bottom: 16px;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 18px;
  border-radius: 14px;
  font-size: 25px;
}

.cache-icon {
  color: #168a5b;
  background: #e9f7f0;
}

.log-icon {
  color: #b27818;
  background: #fff6e5;
}

.card-content h3 {
  margin: 0 0 10px;
  color: #17233d;
  font-size: 18px;
}

.card-content p {
  min-height: 48px;
  margin: 0 0 24px;
  color: #808695;
  font-size: 14px;
  line-height: 24px;
}
</style>
