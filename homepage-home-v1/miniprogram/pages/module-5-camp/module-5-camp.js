Page({
  data: {
    iconBase: "../../assets/module-2-logic/icons/",
    resultIconBase: "../../assets/module-a-result/",
    heroImage: "../../assets/module-5-camp/hero-characters.png",
    intro: {
      quote: "线上特训营是以提高孩子自主学习能力为根本目的的创新型训练系统。打破以补习学科知识为导向的传统模式，我们运用最为简便的方法和流程，帮助家长和孩子，真正掌握学习和成长的底层逻辑。",
      lines: [
        "同时倡导家庭教育和亲子关系的实际应用，真正提升内驱力，改善孩子学习的生态系统，使提质减负真正落地。",
        "化繁为简、大道至简是特训营的核心特点。特训营融合东方心法理念与西方质量管理体系，21天内即可见到明显效果。"
      ]
    },
    sections: [
      {
        id: "goals",
        index: "01",
        title: "【目标】",
        kind: "numbered",
        icon: "exam-target.png",
        items: [
          "1.完善自主学习能力并在“语数外”三科上开窍",
          "2.掌握正确的学习方法并养成良好的学习习惯",
          "3.提升孩子学习状态并增强亲子关系的和谐度"
        ]
      },
      {
        id: "content",
        index: "02",
        title: "【内容】",
        subtitle: "三大核心原创技术模型",
        kind: "models",
        models: [
          {
            iconSrc: "../../assets/module-2-logic/icons/idea-lightbulb.png",
            text: "内驱力 ---- 慧眼读心赋能法"
          },
          {
            iconSrc: "../../assets/module-2-logic/icons/equation-function.png",
            text: "学习习惯----SOP高效作业法"
          },
          {
            iconSrc: "../../assets/module-2-logic/icons/geometry.png",
            text: "学科知识----学科性格开窍法"
          }
        ]
      },
      {
        id: "system",
        index: "03",
        title: "【学制】",
        kind: "system",
        text: "三次直播（每周一次）+21天打卡督导陪跑 + 3个月答疑解惑 = 让孩子自主学习！",
        items: [
          {
            iconSrc: "../../assets/module-2-logic/icons/calculation.png",
            text: "三次直播（每周一次）"
          },
          {
            iconSrc: "../../assets/module-2-logic/icons/equation-function.png",
            text: "21天打卡督导陪跑"
          },
          {
            iconSrc: "../../assets/module-2-logic/icons/callout-star.png",
            text: "3个月答疑解惑"
          }
        ]
      },
      {
        id: "lessons",
        index: "04",
        title: "三次直播（每周一次）",
        kind: "lessons",
        items: [
          "1《开营仪式---让孩子自主学习的核心法门》",
          "2《内驱力建设---一招教会家长读懂孩子的内心》",
          "3《学能开窍----大道至简的学习开窍法》"
        ]
      },
      {
        id: "details",
        index: "05",
        title: "【适合】/【导师】/【收费】/【入班流程】",
        kind: "details",
        groups: [
          {
            title: "【适合】",
            lines: [
              "9--17岁青少年及家长，尤其是希望实现快速逆袭的中等生"
            ]
          },
          {
            title: "【导师】",
            lines: [
              "梁政教授",
              "“自主学习”系统主创人",
              "浙师大继续教育学院特邀讲师",
              "浙江教育厅“读心教育”课题组导师"
            ]
          },
          {
            title: "【收费】",
            lines: [
              "599元 限时福利价  399元"
            ],
            price: true
          },
          {
            title: "【入班流程】",
            lines: [
              "1、在线填写手机号，支付费用",
              "2、等待助教老师联系，安排入群学习",
              "3、按时听课并完成相应打卡",
              "4、欢迎建立学习型家长圈，学习分享有额外惊喜"
            ]
          }
        ]
      }
    ],
    closing: "加入我们的社群，通过专业老师直播、打卡、督导的形式，让您和孩子21天真正掌握自主学习的乐趣！"
  },

  onJoinTap() {
    wx.showToast({
      title: "社群报名准备中",
      icon: "none"
    });
  }
});
