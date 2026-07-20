const MODULE_A_PATH = "/packages/features/pages/module-a-assessment/module-a-assessment";

Page({
  data: {
    assessmentPath: MODULE_A_PATH,
    iconBase: "../../assets/module-2-logic/icons/",
    dividerImage: "../../assets/module-5-camp/camp-landscape-divider-v2.webp",
    heroTreeImage: "../../assets/module-5-camp/camp-closing-illustration-v2.png",
    stageOverviewImage: "../../assets/module-5-camp/camp-closing-illustration-v2.png",
    illustrationBase: "../../assets/module-2-logic/illustrations/",
    englishIllustration: "../../assets/module-2-logic/illustrations/english-abc-v2.webp",
    mathIllustration: "../../assets/module-2-logic/illustrations/math-abacus-v2.webp",
    closingIllustration: "../../assets/module-2-logic/illustrations/closing-window-tree-v2.webp",
    subjectIllustrations: "../../assets/module-2-logic/illustrations/subject-icons-v2.webp",
    articleBlocks: [
      {
        id: "pain",
        type: "quote",
        text: "孩子如果没有学科知识的基础逻辑， 那么，刷题越多，补课越多，孩子只会越痛苦！"
      },
      {
        id: "definition",
        type: "definition",
        icon: "idea-lightbulb.png",
        prefix: "什么是学科知识的基础逻辑呢？就是要清晰地了解：",
        highlight: "学好这门学科最基本的顺序是什么。"
      },
      {
        id: "english",
        type: "section",
        index: "01",
        title: "英语的基础逻辑",
        lines: [
          "比如：英语其实是最简单的一门学科，为什么孩子学了那么久还是一塌糊涂？",
          "因为英语的本质是声音，所以，对于非母语者，学英语的逻辑是：音标--单词--句子（语法）",
          "中国的学生大多数都缺乏第一个环节，必然是越学越累，而且根本不能在现实中使用。",
          "发音只要过关，整个中小学英语，考的不是智商，是肌肉习惯。英语只有两块积木："
        ],
        list: [
          {
            marker: "1",
            text: "1. 砖（词汇）：只要大部分字认识，卷子就能看懂。"
          },
          {
            marker: "2",
            text: "2. 框（句法）：只要能把单词塞进固定的位置，句子就能得分。"
          }
        ],
        note: "英语一旦开窍，三个月成绩必然突飞猛进，而且，可以进行基本的对话交流。"
      },
      {
        id: "math",
        type: "section",
        index: "02",
        title: "数学的基础逻辑",
        lines: [
          "再比如，孩子恐惧数学的根本原因，在于课本教材的知识体系存在巨大问题！现在的数学教材编排得七零八碎，导致孩子缺乏对数学知识结构的了解。",
          "其实，整个中小学数学的本质就两个东西："
        ],
        list: [
          {
            marker: "1",
            text: "1. 算：数的运算（为什么过去的小学数学教材叫《算术》？不会算，一切免谈）"
          },
          {
            marker: "2",
            text: "2. 图：几何与函数图像（看不懂图，大题必丢）"
          }
        ],
        noteLines: [
          "中差生提分，死磕“算”就能及格，弄懂“图”就能冲优。",
          "要诀：不要按章节学，要按“计算、方程、图形”这三大块打通。",
          "计算过关，数学就能及格；看懂图像，数学就能上110（满分150）。"
        ]
      },
      {
        id: "stages",
        type: "section",
        index: "03",
        title: "四个阶段，打通数学命脉",
        stages: [
          {
            key: "stage-1",
            icon: "calculation.png",
            lines: [
              "第一阶段：砍掉枝叶，死抓命根（计算能力重建）",
              "1. 降维打击：不要碰初中题从小学算术补起（每天只练10分钟）",
              "2. 代数通杀技：整式乘法与因式分解 这是整个初中代数的任督二脉。"
            ]
          },
          {
            key: "stage-2",
            icon: "equation-function.png",
            lines: [
              "第二阶段：建立核心逻辑（方程与函数）",
              "1. 方程的本质是“找齐”",
              "2. 函数就是“看天气预报”",
              "差生怕函数，是因为他们想求一个确定的数，但函数给的是关系。"
            ]
          },
          {
            key: "stage-3",
            icon: "geometry.png",
            lines: [
              "第三阶段：几何开窍（只吃“鱼中段”）"
            ]
          },
          {
            key: "stage-4",
            icon: "exam-target.png",
            lines: [
              "第四阶段：考场致胜术（功利大法）"
            ]
          }
        ]
      },
      {
        id: "closing",
        type: "section",
        index: "04",
        title: "苦海无边  回头是岸",
        lines: [
          "苦海无边  回头是岸",
          "不是孩子不聪明  也不是孩子不用功 只是那层窗户纸还没捅破！",
          "每门学科都不是冷冰冰的书本知识，真正的教育是：应试教育要和素质教育结合起来！"
        ],
        educationParts: {
          prefix: "每门学科都不是冷冰冰的书本知识，真正的教育是：",
          first: "应试教育",
          middle: "要和",
          second: "素质教育",
          suffix: "结合起来！"
        }
      },
      {
        id: "subjects",
        type: "section",
        index: "05",
        title: "三科本质，培养孩子核心能力",
        subjectLines: [
          {
            key: "英",
            className: "subject-pill--english",
            text: "英---本质是练“体商”--- 引领孩子勇于表达，展现自信！"
          },
          {
            key: "数",
            className: "subject-pill--math",
            text: "数---本质是练“智商”--- 引领孩子善于思考，注重逻辑！"
          },
          {
            key: "语",
            className: "subject-pill--chinese",
            text: "语---本质是练“情商”--- 引领孩子学会共情，提升认知！"
          }
        ],
        finalLines: [
          "学科性格开窍法，让孩子真正掌握学科的底层逻辑。"
        ]
      }
    ]
  },

  onStartAssessment() {
    wx.navigateTo({
      url: this.data.assessmentPath
    });
  }
});
