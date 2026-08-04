const MODULE_B_TABLE_PATH = "/packages/features/pages/module-b-table/module-b-table";

Page({
  data: {
    iconBase: "/packages/features/assets/module-2-logic/icons/",
    dividerImage: "/packages/features/assets/module-5-camp/camp-landscape-divider-v2.webp",
    heroIllustration: "/packages/features/assets/module-3-habit/illustrations/habit-hero-v2.png",
    sectionIllustration: "/packages/features/assets/module-3-habit/illustrations/habit-child-v2.png",
    articleBlocks: [
      {
        id: "opening",
        type: "quote",
        text: "授人以鱼不如授人以渔，学习方法比学科知识更重要！"
      },
      {
        id: "reality",
        type: "definition",
        icon: "idea-lightbulb.png",
        prefix: "触目惊心的现实是：",
        highlight: "孩子寒窗苦读十余年，几乎没有老师系统讲解学习方法的应用，更缺乏有针对性的训练！"
      },
      {
        id: "mentor",
        type: "section",
        index: "01",
        title: "除了极少数有天赋的学霸，可以自己摸索出来事半功倍的学习方法，绝大多数普通孩子则缺乏有效的明师点拨！"
      },
      {
        id: "habit",
        type: "section",
        index: "02",
        title: "孩子学习吃力、厌学的核心原因是大多数孩子缺乏良好的学习习惯。",
        lines: [
          "什么是良好的学习习惯呢？所谓习惯就是把一套正确的流程和方法变成一种肌肉记忆。这才是习惯的本质。比如：作为一个孩子来讲，他每天都要写作业。那么写作业的正确流程是什么？这个流程能不能形成孩子的肌肉记忆？这才是孩子，尤其在小学阶段，最应该养成的！"
        ]
      },
      {
        id: "parents",
        type: "section",
        index: "03",
        title: "我们家长应该注意什么呢？",
        lines: [
          "很多家长都在盯孩子写作业，但是你会发现，大多数家长都是只见树木不见森林。也就是，家长会看到他做对了、错了几道题、几个字，都纠结在这些细节上。但是，作为一套作业的标准流程是什么？作业前、作业中、作业后，这些模块应该让孩子注意什么要点呢？很多家长，包括老师都没有说明白。比如，在作业前的预习、作业中的计时以及作业后的复盘。是必须让孩子形成一个清晰的流程，养成一个良好的习惯并且形成肌肉记忆。",
          "如果孩子在小学阶段没有这些训练，那么到初中以后，这个孩子会越学越累，成绩也会大幅度下降。"
        ]
      },
      {
        id: "sop",
        type: "section",
        index: "04",
        title: "我们课题组研发出来了《SOP高效作业流程规范表格》，指导孩子在作业当中有意识使用。",
        noteLines: [
          "在教学实践当中，凡是坚持使用一个月，孩子的作业效率和学习成绩都有明显进步，效果十分明显！（在特训营中会讲解使用要点）"
        ]
      },
    ]
  },

  onDownloadTap() {
    wx.navigateTo({
      url: MODULE_B_TABLE_PATH
    });
  }
});
