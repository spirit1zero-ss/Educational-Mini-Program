const { getMemberPlans } = require('../../../../api/mine')

Page({
  data: {
    memberPrice: '--',
    memberOriginalPrice: '',
    showOriginalPrice: false,
    iconBase: "../../assets/module-2-logic/icons/",
    campAssetBase: "../../assets/module-5-camp/",
    heroScene: "../../assets/module-5-camp/camp-hero-scene-v2.webp",
    dividerImage: "../../assets/module-5-camp/camp-landscape-divider-v2.webp",
    closingImage: "../../assets/module-5-camp/camp-closing-illustration-v2.png",
    introLines: [
      "线上特训营以提高孩子自主学习能力为根本目的，打破以补习学科知识为导向的传统模式，帮助家长和孩子真正掌握学习与成长的底层逻辑。",
      "同时倡导家庭教育和亲子关系的实际应用，提升内驱力，改善孩子学习的生态系统，让提质减负真正落地。",
      "化繁为简、大道至简。特训营融合东方心法理念与西方质量管理体系，21天内即可看到明显效果。"
    ],
    goals: [
      "完善自主学习能力，并在语数外三科上开窍",
      "掌握正确的学习方法，并养成良好的学习习惯",
      "提升孩子学习状态，增强亲子关系的和谐度"
    ],
    models: [
      {
        theme: "green",
        iconSrc: "../../assets/module-5-camp/camp-icon-drive-v2.png",
        title: "内驱力",
        description: "慧眼读心赋能法：激发学习动力，让孩子愿意主动学。"
      },
      {
        theme: "blue",
        iconSrc: "../../assets/module-5-camp/camp-icon-habit-v2.png",
        title: "学习习惯",
        description: "SOP高效作业法：形成计划、执行、复盘的良好习惯。"
      },
      {
        theme: "orange",
        iconSrc: "../../assets/module-5-camp/camp-icon-subject-v2.png",
        title: "学科知识",
        description: "学科性格开窍法：掌握语数外关键方法，突破薄弱点。"
      }
    ],
    systemItems: [
      { value: "3", label: "次直播", theme: "green" },
      { value: "21", label: "天打卡督导陪跑", theme: "blue" },
      { value: "3", label: "个月答疑解惑", theme: "orange" }
    ],
    lessons: [
      {
        theme: "green",
        iconSrc: "../../assets/module-2-logic/icons/callout-star.png",
        title: "开营仪式",
        description: "让孩子自主学习的核心法门"
      },
      {
        theme: "blue",
        iconSrc: "../../assets/module-5-camp/camp-icon-drive-v2.png",
        title: "内驱力建设",
        description: "一招教会家长读懂孩子的内心"
      },
      {
        theme: "orange",
        iconSrc: "../../assets/module-2-logic/icons/exam-target.png",
        title: "学能开窍",
        description: "大道至简的学习开窍法"
      }
    ],
    suitableItems: [
      {
        iconSrc: "../../assets/module-5-camp/camp-icon-drive-v2.png",
        text: "9—17岁青少年"
      },
      {
        iconSrc: "../../assets/module-5-camp/camp-icon-habit-v2.png",
        text: "希望改善孩子学习状态的家长"
      },
      {
        iconSrc: "../../assets/module-5-camp/camp-icon-subject-v2.png",
        text: "尤其适合希望实现快速逆袭的中等生"
      }
    ],
    processSteps: [
      {
        theme: "green",
        iconSrc: "../../assets/module-5-camp/camp-process-form-v2.png",
        title: "提交报名"
      },
      {
        theme: "blue",
        iconSrc: "../../assets/module-5-camp/camp-icon-habit-v2.png",
        title: "助教联系"
      },
      {
        theme: "orange",
        iconSrc: "../../assets/module-5-camp/camp-process-tutor-v2.png",
        title: "听课打卡"
      },
      {
        theme: "gold",
        iconSrc: "../../assets/module-5-camp/camp-process-house-v2.png",
        title: "学习分享"
      }
    ],
    closing: "加入我们的社群，通过专业老师直播、打卡、督导的形式，让您和孩子21天真正掌握自主学习的乐趣！"
  },

  onLoad() {
    getMemberPlans()
      .then((response) => {
        const plans = Array.isArray(response.data) ? response.data : []
        const plan = plans.find((item) => item && !item.isFree && item.mcId)
        if (!plan) return

        const memberPrice = String(plan.price || '')
        const memberOriginalPrice = String(plan.originalPrice || '')
        this.setData({
          memberPrice: memberPrice || '--',
          memberOriginalPrice,
          showOriginalPrice: !!memberOriginalPrice && memberOriginalPrice !== memberPrice
        })
      })
      .catch((error) => {
        console.warn('[module-5-camp] load member price failed:', error)
      })
  },

  onJoinTap() {
    wx.navigateTo({
      url: "/packages/features/pages/camp-checkout/camp-checkout",
      fail: () => {
        wx.showToast({
          title: "支付页面打开失败",
          icon: "none"
        });
      }
    });
  }
});
