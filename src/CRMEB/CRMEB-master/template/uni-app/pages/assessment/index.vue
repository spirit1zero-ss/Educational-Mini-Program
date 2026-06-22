<template>
  <view class="assessment-page">
    <view class="hero">
      <view class="hero-copy">
        <view class="eyebrow">Assessment</view>
        <view class="title">入营测评</view>
        <view class="desc">用 3 个问题快速了解孩子的学习状态，生成第一版成长建议。</view>
        <view class="hero-tags">
          <text>专注力</text>
          <text>内驱力</text>
          <text>学习习惯</text>
        </view>
      </view>
      <view class="hero-icon">🌳</view>
    </view>

    <view class="progress-card">
      <view class="progress-head">
        <text>测评进度</text>
        <text>{{ answeredCount }}/{{ questions.length }}</text>
      </view>
      <view class="progress-track">
        <view class="progress-bar" :style="{ width: progressWidth }"></view>
      </view>
    </view>

    <view class="question-card" v-for="(question, qIndex) in questions" :key="question.id">
      <view class="question-index">Q{{ qIndex + 1 }}</view>
      <view class="question-title">{{ question.title }}</view>
      <view class="option-list">
        <view
          v-for="option in question.options"
          :key="option.value"
          class="option"
          :class="{ active: answers[question.id] === option.value }"
          @tap="selectAnswer(question.id, option)"
        >
          <view class="option-main">
            <text class="option-label">{{ option.label }}</text>
            <text class="option-desc">{{ option.desc }}</text>
          </view>
          <text class="option-score">{{ option.score }}分</text>
        </view>
      </view>
    </view>

    <view class="score-card">
      <view class="score-main">
        <view class="score-label">当前得分</view>
        <view class="score-value">{{ score }}</view>
      </view>
      <view class="profile-list">
        <view class="profile-item" v-for="item in abilityProfile" :key="item.label">
          <view class="profile-head">
            <text>{{ item.label }}</text>
            <text>{{ item.value }}%</text>
          </view>
          <view class="profile-track">
            <view class="profile-bar" :style="{ width: item.value + '%' }"></view>
          </view>
        </view>
      </view>
    </view>

    <view class="result-card" :class="{ ready: canSubmit }">
      <view class="result-label">{{ canSubmit ? "测评结果" : "当前画像" }}</view>
      <view class="result-title">{{ result.title }}</view>
      <view class="result-text">{{ result.text }}</view>
      <view class="tag-list">
        <text v-for="tag in result.tags" :key="tag" class="tag">{{ tag }}</text>
      </view>
    </view>

    <view class="plan-card">
      <view class="plan-icon">🚀</view>
      <view class="plan-copy">
        <view class="plan-label">推荐成长方案</view>
        <view class="plan-title">{{ result.plan }}</view>
      </view>
      <button class="plan-button" @tap="goTrainingCamp">了解</button>
    </view>

    <view v-if="submitted" class="saved-tip">已保存测评记录，后台可查看本次结果。</view>

    <button class="submit" :loading="submitting" :disabled="!canSubmit || submitting" @tap="submit">
      {{ submitText }}
    </button>
  </view>
</template>

<script>
import { submitAssessmentRecord } from "@/api/education.js";

export default {
  data() {
    return {
      submitting: false,
      submitted: false,
      answers: {},
      questions: [
        {
          id: "focus",
          shortLabel: "专注力",
          title: "孩子完成学习任务时的专注状态更接近哪一种？",
          options: [
            { value: "stable", label: "能稳定完成", desc: "大多数时候能跟上节奏", score: 30 },
            { value: "swing", label: "状态起伏", desc: "需要提醒和陪伴", score: 20 },
            { value: "avoid", label: "容易逃避", desc: "一开始就抗拒或拖延", score: 10 },
          ],
        },
        {
          id: "drive",
          shortLabel: "内驱力",
          title: "孩子面对难题时通常会怎么做？",
          options: [
            { value: "try", label: "愿意尝试", desc: "会主动想办法", score: 30 },
            { value: "wait", label: "等待帮助", desc: "需要家长或老师启动", score: 20 },
            { value: "giveup", label: "很快放弃", desc: "担心做错或没有信心", score: 10 },
          ],
        },
        {
          id: "habit",
          shortLabel: "学习习惯",
          title: "孩子目前的学习习惯更偏向哪一种？",
          options: [
            { value: "ordered", label: "有基本秩序", desc: "能按计划完成大部分任务", score: 30 },
            { value: "loose", label: "偶尔松散", desc: "计划感不稳定", score: 20 },
            { value: "chaos", label: "缺少方法", desc: "经常不知道先做什么", score: 10 },
          ],
        },
      ],
    };
  },
  computed: {
    answeredCount() {
      return Object.keys(this.answers).length;
    },
    canSubmit() {
      return this.answeredCount === this.questions.length;
    },
    score() {
      return this.questions.reduce((total, question) => {
        const value = this.answers[question.id];
        const option = question.options.find((item) => item.value === value);
        return total + (option ? option.score : 0);
      }, 0);
    },
    abilityProfile() {
      return this.questions.map((question) => {
        const value = this.answers[question.id];
        const option = question.options.find((item) => item.value === value);
        const raw = option ? option.score : 0;
        return {
          label: question.shortLabel,
          value: Math.round((raw / 30) * 100),
        };
      });
    },
    progressWidth() {
      return `${Math.round((this.answeredCount / this.questions.length) * 100)}%`;
    },
    result() {
      if (!this.canSubmit) {
        return {
          title: "完成测评后生成画像",
          text: "请选择每一道题中最接近孩子当前状态的选项，系统会实时生成第一版成长建议。",
          tags: ["3题快速测评", "提交后保存", "后台可查看"],
          plan: "21天自主学习训练营",
        };
      }
      if (this.score >= 80) {
        return {
          title: "稳定成长型",
          text: "孩子已有不错的自主学习基础，适合进一步建立复盘和目标管理。",
          tags: ["专注力稳定", "内驱力较好", "适合进阶训练"],
          plan: "21天自主学习进阶营",
        };
      }
      if (this.score >= 55) {
        return {
          title: "陪伴启动型",
          text: "孩子具备成长潜力，但需要更清晰的任务拆解和持续鼓励。",
          tags: ["需要陪伴", "习惯待巩固", "适合21天训练营"],
          plan: "21天自主学习训练营",
        };
      }
      return {
        title: "信心重建型",
        text: "孩子可能对学习有压力感，第一阶段建议先重建安全感和成功体验。",
        tags: ["先建信心", "降低挫败", "从小任务开始"],
        plan: "内驱力建设训练营",
      };
    },
    submitText() {
      if (this.submitting) return "提交中";
      if (this.submitted) return "重新提交测评记录";
      return "提交测评记录";
    },
    answerPayload() {
      return this.questions.map((question) => {
        const value = this.answers[question.id];
        const option = question.options.find((item) => item.value === value);
        return {
          question_id: question.id,
          question: question.title,
          answer: option ? option.label : "",
          value,
          score: option ? option.score : 0,
        };
      });
    },
  },
  methods: {
    selectAnswer(questionId, option) {
      this.$set(this.answers, questionId, option.value);
      this.submitted = false;
    },
    goTrainingCamp() {
      uni.navigateTo({
        url: "/pages/goods/goods_list/index?searchValue=训练营&title=训练营",
      });
    },
    submit() {
      if (!this.canSubmit || this.submitting) return;
      this.submitting = true;
      submitAssessmentRecord({
        score: this.score,
        result_text: this.result.title,
        answers_json: {
          result: this.result,
          answers: this.answerPayload,
        },
      })
        .then(() => {
          this.submitted = true;
          uni.showToast({ title: "提交成功", icon: "success" });
        })
        .catch((err) => {
          uni.showToast({
            title: typeof err === "string" ? err : err.msg || "提交失败",
            icon: "none",
          });
        })
        .finally(() => {
          this.submitting = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.assessment-page {
  min-height: 100vh;
  padding: 28rpx 24rpx 52rpx;
  background: #f5f7fb;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  padding: 36rpx 32rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #eaf2ff 0%, #ffffff 48%, #eafff4 100%);
  box-shadow: 0 14rpx 34rpx rgba(47, 74, 121, 0.08);
}

.hero-copy {
  min-width: 0;
  flex: 1;
}

.eyebrow {
  font-size: 24rpx;
  line-height: 34rpx;
  font-weight: 700;
  color: #4f8cff;
}

.title {
  margin-top: 8rpx;
  font-size: 48rpx;
  line-height: 60rpx;
  font-weight: 900;
  color: #0f172a;
}

.desc {
  margin-top: 16rpx;
  font-size: 28rpx;
  line-height: 42rpx;
  color: #64748b;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 22rpx;
}

.hero-tags text {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(79, 140, 255, 0.1);
  font-size: 22rpx;
  font-weight: 800;
  color: #4f8cff;
}

.hero-icon {
  display: grid;
  width: 104rpx;
  height: 104rpx;
  place-items: center;
  border-radius: 28rpx;
  background: #ffffff;
  font-size: 48rpx;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.06);
}

.progress-card,
.question-card,
.result-card,
.score-card,
.plan-card {
  margin-top: 24rpx;
  padding: 30rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 28rpx rgba(47, 74, 121, 0.06);
}

.progress-head {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  font-weight: 800;
  color: #334155;
}

.progress-track {
  height: 14rpx;
  margin-top: 18rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #e2e8f0;
}

.progress-bar {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #4f8cff, #6dd3a0);
}

.question-index {
  display: inline-flex;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #eff6ff;
  font-size: 24rpx;
  font-weight: 900;
  color: #4f8cff;
}

.question-title {
  margin-top: 18rpx;
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 900;
  color: #0f172a;
}

.option-list {
  margin-top: 22rpx;
}

.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  min-height: 112rpx;
  margin-top: 16rpx;
  padding: 22rpx 24rpx;
  border: 2rpx solid #eef2f7;
  border-radius: 22rpx;
  background: #f8fafc;
}

.option.active {
  border-color: #4f8cff;
  background: #eff6ff;
}

.option-main {
  min-width: 0;
  flex: 1;
}

.option-label {
  display: block;
  font-size: 30rpx;
  line-height: 40rpx;
  font-weight: 900;
  color: #1e293b;
}

.option-desc {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  line-height: 34rpx;
  color: #64748b;
}

.option-score {
  flex-shrink: 0;
  font-size: 26rpx;
  font-weight: 900;
  color: #6dd3a0;
}

.score-card {
  display: flex;
  gap: 28rpx;
}

.score-main {
  display: flex;
  width: 168rpx;
  min-height: 168rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #4f8cff, #71b6ff);
  color: #ffffff;
}

.score-label {
  font-size: 22rpx;
  font-weight: 800;
  opacity: 0.82;
}

.score-value {
  margin-top: 8rpx;
  font-size: 54rpx;
  line-height: 60rpx;
  font-weight: 900;
}

.profile-list {
  min-width: 0;
  flex: 1;
}

.profile-item + .profile-item {
  margin-top: 18rpx;
}

.profile-head {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  font-weight: 800;
  color: #334155;
}

.profile-track {
  height: 12rpx;
  margin-top: 10rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #e2e8f0;
}

.profile-bar {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #4f8cff, #6dd3a0);
}

.result-label {
  font-size: 24rpx;
  font-weight: 800;
  color: #6dd3a0;
}

.result-card.ready {
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
}

.result-title {
  margin-top: 10rpx;
  font-size: 40rpx;
  line-height: 52rpx;
  font-weight: 900;
  color: #0f172a;
}

.result-text {
  margin-top: 14rpx;
  font-size: 28rpx;
  line-height: 42rpx;
  color: #64748b;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 22rpx;
}

.tag {
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: #eff6ff;
  font-size: 24rpx;
  font-weight: 800;
  color: #4f8cff;
}

.plan-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.plan-icon {
  display: grid;
  width: 86rpx;
  height: 86rpx;
  flex-shrink: 0;
  place-items: center;
  border-radius: 24rpx;
  background: #eff6ff;
  font-size: 40rpx;
}

.plan-copy {
  min-width: 0;
  flex: 1;
}

.plan-label {
  font-size: 22rpx;
  font-weight: 800;
  color: #94a3b8;
}

.plan-title {
  margin-top: 6rpx;
  font-size: 30rpx;
  line-height: 40rpx;
  font-weight: 900;
  color: #0f172a;
}

.plan-button {
  width: 116rpx;
  height: 64rpx;
  margin: 0;
  border-radius: 999rpx;
  background: #eef7ff;
  color: #4f8cff;
  font-size: 26rpx;
  font-weight: 900;
  line-height: 64rpx;
}

.plan-button::after {
  border: 0;
}

.saved-tip {
  margin-top: 24rpx;
  padding: 22rpx 26rpx;
  border-radius: 22rpx;
  background: #ecfdf5;
  font-size: 26rpx;
  line-height: 38rpx;
  font-weight: 800;
  color: #059669;
}

.submit {
  height: 96rpx;
  margin-top: 30rpx;
  border-radius: 48rpx;
  background: #4f8cff;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 900;
  box-shadow: 0 16rpx 30rpx rgba(79, 140, 255, 0.24);
}

.submit[disabled] {
  background: #cbd5e1;
  box-shadow: none;
}
</style>
