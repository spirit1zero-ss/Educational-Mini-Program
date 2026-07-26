<template>
  <div class="identity-select" :class="{ compact }" v-loading="loading">
    <button
      v-for="item in options"
      :key="item.levelId"
      type="button"
      class="identity-option"
      :class="{ active: Number(value) === Number(item.levelId) }"
      :aria-checked="Number(value) === Number(item.levelId) ? 'true' : 'false'"
      role="radio"
      @click="$emit('input', Number(item.levelId))"
    >
      <span class="identity-key">{{ item.levelKey }}</span>
      <span class="identity-copy">
        <strong>{{ item.levelName }}</strong>
        <small>
          名额 {{ item.initialQuota }}
          <template v-if="Number(item.levelId) > 0"> · 一级返佣 ¥{{ item.firstCommission }}</template>
        </small>
      </span>
      <i v-if="Number(value) === Number(item.levelId)" class="el-icon-check"></i>
    </button>
  </div>
</template>

<script>
import { membershipDataListApi } from '@/api/membershipLevel';

export default {
  name: 'DistributionIdentitySelect',
  props: {
    value: {
      type: [Number, String],
      default: 0,
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      options: [],
    };
  },
  created() {
    this.loadOptions();
  },
  methods: {
    loadOptions() {
      this.loading = true;
      membershipDataListApi({ mode: 'training_camp' })
        .then((res) => {
          this.options = (res.data && res.data.list) || [];
        })
        .catch((error) => {
          this.$message.error(error.msg || '分销身份配置加载失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.identity-select {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  max-width: 560px;
}

.identity-option {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 68px;
  padding: 12px 38px 12px 12px;
  border: 1px solid #dfe4ec;
  border-radius: 6px;
  background: #fff;
  color: #303133;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;

  &:hover,
  &:focus {
    border-color: var(--prev-color-primary);
    outline: none;
  }

  &.active {
    border-color: var(--prev-color-primary);
    background: rgba(24, 144, 255, 0.05);
    box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.1);
  }

  .el-icon-check {
    position: absolute;
    right: 14px;
    color: var(--prev-color-primary);
    font-weight: 700;
  }
}

.identity-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
  height: 34px;
  margin-right: 10px;
  border-radius: 5px;
  background: #eef4ff;
  color: #3569d4;
  font-weight: 700;
  font-size: 16px;
}

.identity-copy {
  min-width: 0;

  strong,
  small {
    display: block;
  }

  strong {
    margin-bottom: 4px;
    font-size: 13px;
    line-height: 18px;
  }

  small {
    color: #909399;
    font-size: 12px;
    line-height: 16px;
  }
}

.identity-select.compact {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  max-width: none;

  .identity-option {
    min-height: 60px;
  }
}

@media (max-width: 900px) {
  .identity-select,
  .identity-select.compact {
    grid-template-columns: 1fr;
  }
}
</style>
