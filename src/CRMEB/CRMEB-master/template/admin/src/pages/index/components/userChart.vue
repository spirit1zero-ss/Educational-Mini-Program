<template>
  <div @resize="handleResize">
    <el-row :gutter="16">
      <el-col :span="24" class="ivu-mb dashboard-console-visit">
        <el-card :bordered="false" shadow="never">
          <div class="card-title">
            <el-avatar
              icon="el-icon-user-solid"
              size="small"
              style="color: var(--prev-color-primary); background-color: #e6f7ff"
            ></el-avatar>
            <h4 class="ivu-pl-8">用户</h4>
          </div>
          <echarts-from
            ref="userChart"
            :echartsTitle="line"
            :infoList="infoList"
            :series="series"
            v-if="infoList && series.length !== 0"
          ></echarts-from>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { userApi } from '@/api/index';
import echartsFrom from '@/components/echarts/index';
export default {
  name: 'user-chart',
  components: { echartsFrom },
  data() {
    return {
      line: 'line',
      circle: 'circle',
      infoList: {},
      series: [],
      xData: [],
      y1Data: [],
      y2Data: [],
      lists: [],
      bing_data: [],
      bing_xdata: [],
    };
  },
  methods: {
    // 统计
    getStatistics() {
      userApi()
        .then(async (res) => {
          this.infoList = res.data;
          this.series = [
            {
              data: res.data.series,
              name: '人数（人）',
              type: 'line',
              tooltip: true,
              smooth: true,
              symbol: 'none',
              areaStyle: {
                normal: {
                  opacity: 0.2,
                },
              },
            },
          ];
          this.bing_data = res.bing_data;
          this.bing_xdata = res.bing_xdata;
        })
        .catch((res) => {
          this.$message.error(res.msg);
        });
    },
    // 监听页面宽度变化，刷新表格
    handleResize() {
      if (this.infoList && this.series.length !== 0) this.$refs.userChart.handleResize();
    },
  },
  mounted() {
    this.getStatistics();
  },
  beforeDestroy() {
    if (this.visitChart) {
      this.visitChart.dispose();
      this.visitChart = null;
    }
  },
};
</script>

<style scoped lang="scss">
.dashboard-console-visit {
  ul {
    li {
      list-style-type: none;
      margin-top: 12px;
    }
  }
}
.trees-coadd {
  width: 100%;
  height: 100%;
  .scollhide {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
  }
}
.scollhide::-webkit-scrollbar {
  display: none;
}
.names {
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 84%;
  margin-bottom: -7px;
}
.card-title {
  display: flex;
  align-items: center;
  ::v-deep .el-avatar--small {
    background-color: var(--prev-color-primary-light-9) !important;
  }
}
</style>
