const { getMemberPlans } = require('../../../../api/mine')
const { applyCloudAssets, restoreLocalAsset } = require('../../utils/cloud-assets')

const CAMP_ASSET_ROOT = '/packages/features/assets/module-5-camp/'
const ICON_ROOT = '/packages/features/assets/module-2-logic/icons/'

const LOCAL_ASSETS = {
  heroScene: '/packages/features/assets/module-5-camp/camp-hero-scene-v2.png',
  dividerImage: '/packages/features/assets/module-5-camp/camp-landscape-divider-v2.png',
  closingImage: '/packages/features/assets/module-5-camp/camp-closing-illustration-v2.png',
  introIcon: '/packages/features/assets/module-5-camp/camp-icon-drive-v2.png',
  priceIcon: '/packages/features/assets/module-5-camp/camp-process-house-v2.png',
  'models[0].iconSrc': '/packages/features/assets/module-5-camp/camp-icon-drive-v2.png',
  'models[1].iconSrc': '/packages/features/assets/module-5-camp/camp-icon-habit-v2.png',
  'models[2].iconSrc': '/packages/features/assets/module-5-camp/camp-icon-subject-v2.png',
  'lessons[1].iconSrc': '/packages/features/assets/module-5-camp/camp-icon-drive-v2.png',
  'suitableItems[0].iconSrc': '/packages/features/assets/module-5-camp/camp-icon-drive-v2.png',
  'suitableItems[1].iconSrc': '/packages/features/assets/module-5-camp/camp-icon-habit-v2.png',
  'suitableItems[2].iconSrc': '/packages/features/assets/module-5-camp/camp-icon-subject-v2.png',
  'processSteps[0].iconSrc': '/packages/features/assets/module-5-camp/camp-process-form-v2.png',
  'processSteps[1].iconSrc': '/packages/features/assets/module-5-camp/camp-icon-habit-v2.png',
  'processSteps[2].iconSrc': '/packages/features/assets/module-5-camp/camp-process-tutor-v2.png',
  'processSteps[3].iconSrc': '/packages/features/assets/module-5-camp/camp-process-house-v2.png'
}

const CLOUD_ASSET_FIELDS = {
  heroScene: 'module5.heroScene',
  dividerImage: 'module5.divider',
  closingImage: 'module5.closing',
  introIcon: 'module5.driveIcon',
  priceIcon: 'module5.processHouse',
  'models[0].iconSrc': 'module5.driveIcon',
  'models[1].iconSrc': 'module5.habitIcon',
  'models[2].iconSrc': 'module5.subjectIcon',
  'lessons[1].iconSrc': 'module5.driveIcon',
  'suitableItems[0].iconSrc': 'module5.driveIcon',
  'suitableItems[1].iconSrc': 'module5.habitIcon',
  'suitableItems[2].iconSrc': 'module5.subjectIcon',
  'processSteps[0].iconSrc': 'module5.processForm',
  'processSteps[1].iconSrc': 'module5.habitIcon',
  'processSteps[2].iconSrc': 'module5.processTutor',
  'processSteps[3].iconSrc': 'module5.processHouse'
}

Page({
  data: {
    memberPrice: '--',
    memberOriginalPrice: '',
    showOriginalPrice: false,
    iconBase: ICON_ROOT,
    heroScene: LOCAL_ASSETS.heroScene,
    dividerImage: LOCAL_ASSETS.dividerImage,
    closingImage: LOCAL_ASSETS.closingImage,
    introIcon: LOCAL_ASSETS.introIcon,
    priceIcon: LOCAL_ASSETS.priceIcon,
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
        iconSrc: `${CAMP_ASSET_ROOT}camp-icon-drive-v2.png`,
        assetField: 'models[0].iconSrc',
        title: "内驱力",
        description: "慧眼读心赋能法：激发学习动力，让孩子愿意主动学。"
      },
      {
        theme: "blue",
        iconSrc: `${CAMP_ASSET_ROOT}camp-icon-habit-v2.png`,
        assetField: 'models[1].iconSrc',
        title: "学习习惯",
        description: "SOP高效作业法：形成计划、执行、复盘的良好习惯。"
      },
      {
        theme: "orange",
        iconSrc: `${CAMP_ASSET_ROOT}camp-icon-subject-v2.png`,
        assetField: 'models[2].iconSrc',
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
        iconSrc: `${ICON_ROOT}callout-star.png`,
        title: "开营仪式",
        description: "让孩子自主学习的核心法门"
      },
      {
        theme: "blue",
        iconSrc: `${CAMP_ASSET_ROOT}camp-icon-drive-v2.png`,
        assetField: 'lessons[1].iconSrc',
        title: "内驱力建设",
        description: "一招教会家长读懂孩子的内心"
      },
      {
        theme: "orange",
        iconSrc: `${ICON_ROOT}exam-target.png`,
        title: "学能开窍",
        description: "大道至简的学习开窍法"
      }
    ],
    suitableItems: [
      {
        iconSrc: `${CAMP_ASSET_ROOT}camp-icon-drive-v2.png`,
        assetField: 'suitableItems[0].iconSrc',
        text: "9—17岁青少年"
      },
      {
        iconSrc: `${CAMP_ASSET_ROOT}camp-icon-habit-v2.png`,
        assetField: 'suitableItems[1].iconSrc',
        text: "希望改善孩子学习状态的家长"
      },
      {
        iconSrc: `${CAMP_ASSET_ROOT}camp-icon-subject-v2.png`,
        assetField: 'suitableItems[2].iconSrc',
        text: "尤其适合希望实现快速逆袭的中等生"
      }
    ],
    processSteps: [
      {
        theme: "green",
        iconSrc: `${CAMP_ASSET_ROOT}camp-process-form-v2.png`,
        assetField: 'processSteps[0].iconSrc',
        title: "提交报名"
      },
      {
        theme: "blue",
        iconSrc: `${CAMP_ASSET_ROOT}camp-icon-habit-v2.png`,
        assetField: 'processSteps[1].iconSrc',
        title: "助教联系"
      },
      {
        theme: "orange",
        iconSrc: `${CAMP_ASSET_ROOT}camp-process-tutor-v2.png`,
        assetField: 'processSteps[2].iconSrc',
        title: "听课打卡"
      },
      {
        theme: "gold",
        iconSrc: `${CAMP_ASSET_ROOT}camp-process-house-v2.png`,
        assetField: 'processSteps[3].iconSrc',
        title: "学习分享"
      }
    ],
    closing: "加入我们的社群，通过专业老师直播、打卡、督导的形式，让您和孩子21天真正掌握自主学习的乐趣！"
  },

  onLoad() {
    applyCloudAssets(this, CLOUD_ASSET_FIELDS)

    getMemberPlans()
      .then((response) => {
        const plans = Array.isArray(response.data) ? response.data : []
        const plan = plans.find((item) => item && item.type === 'ever' && !item.isFree && item.mcId)
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

  onCloudImageError(event) {
    restoreLocalAsset(this, event, LOCAL_ASSETS)
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
