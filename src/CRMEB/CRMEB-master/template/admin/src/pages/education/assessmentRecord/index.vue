<template>
  <div>
    <el-card shadow="never" class="ivu-mt" :body-style="{ padding: '20px' }">
      <el-form :model="query" inline label-width="80px" @submit.native.prevent>
        <el-form-item label="UID">
          <el-input v-model="query.uid" clearable placeholder="用户ID" class="form_content_width" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="query.nickname" clearable placeholder="用户昵称" class="form_content_width" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="query.mobile" clearable placeholder="手机号" class="form_content_width" />
        </el-form-item>
        <el-form-item label="提交时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            clearable
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="onDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="ivu-mt" :body-style="{ padding: '20px' }">
      <el-table :data="records" v-loading="loading" empty-text="暂无数据">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="uid" label="UID" width="90" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="mobile" label="手机号" min-width="120">
          <template slot-scope="{ row }">{{ row.mobile || '-' }}</template>
        </el-table-column>
        <el-table-column prop="score" label="分数" width="100">
          <template slot-scope="{ row }">{{ row.score === null || row.score === '' ? '-' : row.score }}</template>
        </el-table-column>
        <el-table-column prop="result_text" label="结果" min-width="180" show-overflow-tooltip />
        <el-table-column prop="created_at" label="提交时间" min-width="170" />
        <el-table-column label="操作" fixed="right" width="110">
          <template slot-scope="{ row }">
            <el-button type="text" @click="openDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="acea-row row-right page">
        <el-pagination
          :current-page="query.page"
          :page-size="query.limit"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @current-change="pageChange"
        />
      </div>
    </el-card>

    <el-drawer :visible.sync="detailVisible" title="测评记录详情" size="520px">
      <div class="detail" v-loading="detailLoading">
        <template v-if="detail">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="记录ID">{{ detail.id }}</el-descriptions-item>
            <el-descriptions-item label="用户">{{ detail.nickname }}（UID: {{ detail.uid }}）</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ detail.mobile || '-' }}</el-descriptions-item>
            <el-descriptions-item label="分数">{{ detail.score === null ? '-' : detail.score }}</el-descriptions-item>
            <el-descriptions-item label="结果">{{ detail.result_text }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ detail.created_at }}</el-descriptions-item>
          </el-descriptions>

          <div v-if="resultSummary" class="answer-title">结果摘要</div>
          <el-card v-if="resultSummary" shadow="never" class="summary-card">
            <div class="summary-title">{{ resultSummary.title || detail.result_text || '-' }}</div>
            <div class="summary-text">{{ resultSummary.text || '-' }}</div>
            <div v-if="resultTags.length" class="summary-tags">
              <el-tag v-for="tag in resultTags" :key="tag" size="small">{{ tag }}</el-tag>
            </div>
          </el-card>

          <div class="answer-title">答案明细</div>
          <el-timeline v-if="answerList.length">
            <el-timeline-item v-for="item in answerList" :key="item.question_id" :timestamp="`${item.score || 0} 分`">
              <div class="question">{{ item.question }}</div>
              <div class="answer">{{ item.answer || '-' }}</div>
            </el-timeline-item>
          </el-timeline>
          <el-input
            v-else-if="rawAnswersText"
            :value="rawAnswersText"
            type="textarea"
            :rows="8"
            readonly
          />
          <el-empty v-else description="暂无答案明细" />
        </template>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { assessmentRecordDetail, assessmentRecordList } from '@/api/education';

export default {
  name: 'EducationAssessmentRecord',
  data() {
    return {
      loading: false,
      detailLoading: false,
      detailVisible: false,
      records: [],
      total: 0,
      dateRange: [],
      detail: null,
      query: {
        page: 1,
        limit: 20,
        uid: '',
        nickname: '',
        mobile: '',
        data: [],
      },
    };
  },
  computed: {
    answerList() {
      const answers = this.detail && this.detail.answers;
      if (!answers) return [];
      if (Array.isArray(answers)) return answers;
      return Array.isArray(answers.answers) ? answers.answers : [];
    },
    resultSummary() {
      const answers = this.detail && this.detail.answers;
      return answers && !Array.isArray(answers) && answers.result ? answers.result : null;
    },
    resultTags() {
      const tags = this.resultSummary && this.resultSummary.tags;
      return Array.isArray(tags) ? tags : [];
    },
    rawAnswersText() {
      if (!this.detail || !this.detail.answers_json) return '';
      return this.detail.answers_json;
    },
  },
  created() {
    this.getList();
  },
  methods: {
    onDateChange(value) {
      this.query.data = value || [];
    },
    getList() {
      this.loading = true;
      assessmentRecordList(this.query)
        .then((res) => {
          const data = res.data || {};
          this.records = data.list || [];
          this.total = data.count || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    search() {
      this.query.page = 1;
      this.getList();
    },
    reset() {
      this.dateRange = [];
      this.query = {
        page: 1,
        limit: 20,
        uid: '',
        nickname: '',
        mobile: '',
        data: [],
      };
      this.getList();
    },
    pageChange(page) {
      this.query.page = page;
      this.getList();
    },
    openDetail(id) {
      this.detailVisible = true;
      this.detailLoading = true;
      assessmentRecordDetail(id)
        .then((res) => {
          this.detail = res.data;
        })
        .finally(() => {
          this.detailLoading = false;
        });
    },
  },
};
</script>

<style scoped>
.page {
  margin-top: 20px;
}

.detail {
  padding: 0 24px 24px;
}

.answer-title {
  margin: 24px 0 16px;
  font-size: 16px;
  font-weight: 700;
  color: #303133;
}

.question {
  font-weight: 700;
  color: #303133;
}

.answer {
  margin-top: 6px;
  color: #606266;
}

.summary-card {
  border-color: #eef2f7;
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.summary-text {
  margin-top: 8px;
  line-height: 1.7;
  color: #606266;
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
</style>
