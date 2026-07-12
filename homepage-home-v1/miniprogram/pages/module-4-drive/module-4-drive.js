const MODULE_B_PATH = "/pages/module-b-inline/module-b-inline";

Page({
  data: {
    assessmentPath: MODULE_B_PATH,
    iconBase: "../../assets/module-2-logic/icons/",
    articleBlocks: [
      {
        id: "opening",
        type: "quote",
        text: "自主学习力的根是孩子的内驱力。当孩子不想学习时，再好的老师和学习条件都毫无作用。"
      },
      {
        id: "source",
        type: "definition",
        icon: "idea-lightbulb.png",
        prefix: "那么，孩子的内驱力究竟来自哪里？",
        highlight: "内驱力其实是来自家庭环境！换句话讲，内驱力是由家庭教育产生的！"
      },
      {
        id: "confidence",
        type: "section",
        index: "01",
        title: "内驱力的本质是孩子内在的自信与勇气",
        lines: [
          "当家长能真正读懂孩子的心时，自然就会给孩子注入强大的自信与勇气。所以，家长的首要责任是真正了解孩子、共情孩子，创造良好和谐的家庭氛围。"
        ]
      },
      {
        id: "method",
        type: "section",
        index: "02",
        title: "“慧眼读心赋能法”是以中国传统文化精髓为核心的原创教育心理学体系；",
        lines: [
          "既是理论又是方法，具有简洁化、体系化、实用化的特点。给孩子一个最简洁的成功捷径。这也使得“因材施教”这个教育的核心理念真正落地生根。"
        ]
      },
      {
        id: "effect",
        type: "section",
        index: "03",
        title: "这套方法可以让广大非心理学、教育学专业的普通家长一听就懂、一学就会、一用就灵；",
        lines: [
          "轻松读懂孩子的心，有效和谐亲子关系。",
          "同时，可以有效疏导孩子的情绪、启发孩子的灵性思维，在不额外增加孩子学习强度的前提下，快速提高孩子自主学习力和学习成绩。"
        ]
      },
      {
        id: "heart",
        type: "section",
        index: "04",
        title: "阳明先生讲：心外无物。",
        noteLines: [
          "我们外在一切成果的本质，是我们内心的变现。",
          "家长唯有读懂孩子的心，才能培养出孩子强大的内心！"
        ]
      },
    ]
  },

  onStartAssessment() {
    wx.navigateTo({
      url: this.data.assessmentPath
    });
  }
});
