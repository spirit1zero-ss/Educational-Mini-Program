const { getMiniappAgreements } = require('../../../../api/mine')

const FALLBACKS = {
  service: {
    title: '训练营服务协议',
    content: '<h2>训练营服务说明</h2><p>训练营提供直播课程、打卡陪跑和约定期限内的答疑服务。支付完成并经微信确认后开通永久会员身份；具体开营和入群安排由工作人员联系。</p><h3>支付与退款</h3><p>如发生重复扣款、支付成功未开通或需要退款，请联系客服。退款由工作人员核实后人工处理，并同步处理会员权益。</p><h3>学习效果</h3><p>学习效果受参与程度和个体情况影响，训练营不承诺特定分数或升学结果。</p>'
  },
  privacy: {
    title: '隐私政策',
    content: '<h2>我们收集的信息</h2><p>为提供登录、报名、支付、训练营服务、邀请和提现功能，我们会处理微信身份标识、联系方式、报名信息、订单和服务记录。</p><h3>信息用途</h3><p>上述信息仅用于身份识别、订单履行、服务联系、安全审计和依法处理售后事项。未成年人信息应由监护人填写并授权。</p><h3>信息保护</h3><p>我们采取合理措施保护信息安全。您可通过客服申请查询、更正或删除依法可以处理的信息。</p>'
  },
  registration: {
    title: '报名信息使用说明',
    content: '<h2>信息用途</h2><p>孩子姓名、年龄、性别、学习问题和联系电话用于老师了解情况、安排训练营服务和后续沟通，不用于与训练营无关的营销。</p><h3>监护人确认</h3><p>提交未成年人信息前，请确认您是其监护人或已取得监护人授权，并确保填写内容真实、必要。</p><h3>修改与删除</h3><p>您可以在小程序内修改报名信息；如需删除或停止使用，请联系客服处理，法律法规要求保留的订单和审计记录除外。</p>'
  }
}

Page({
  data: {
    key: 'service',
    title: '协议说明',
    content: '',
    loading: true
  },

  onLoad(options) {
    const key = FALLBACKS[options && options.key] ? options.key : 'service'
    const fallback = FALLBACKS[key]
    this.setData({ key, title: fallback.title })
    getMiniappAgreements()
      .then((response) => {
        const item = response && response.data && response.data[key]
        this.setData({
          title: (item && item.title) || fallback.title,
          content: (item && item.content) || fallback.content
        })
      })
      .catch((error) => {
        console.warn('[legal-document] load agreements failed:', error)
        this.setData({ content: fallback.content })
      })
      .finally(() => this.setData({ loading: false }))
  }
})
