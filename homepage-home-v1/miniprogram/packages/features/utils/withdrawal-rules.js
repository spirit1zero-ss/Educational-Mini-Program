function buildWithdrawalRules(config) {
  const minimum = config && Number(config.minAmount)
  const fee = config && Number(config.feeRate)
  const available = config && Number(config.availableAmount)
  const hasBalance = config && config.availableAmount != null && Number.isFinite(available)
  return [
    {
      title: '可提现额度',
      desc: (hasBalance ? `当前可提现 ${Math.max(0, available).toFixed(2)} 元；` : '') +
        (config && Number.isFinite(minimum)
          ? `单笔最低 ${Math.max(0.1, minimum).toFixed(2)} 元，最高不超过当前可提现余额。`
          : '最低提现金额正在读取，单笔最高不超过当前可提现余额。') +
        '待结算佣金不可提现，退款欠款须先抵扣。'
    },
    {
      title: '每日提现次数',
      desc: '平台不设每日固定申请次数上限；同一时间只接受 1 笔待审核或待财务付款申请，处理结束后方可再次申请。'
    },
    {
      title: '提现申请时间',
      desc: config && config.windowLabel
        ? `${config.windowLabel}开放申请（北京时间，开始日 00:00 至结束日 23:59），其余日期不可申请。`
        : '正在读取每月提现开放日期，请加载成功后查看具体申请时间。'
    },
    {
      title: '审核与到账时间',
      desc: (config && config.windowLabel ? `${config.windowLabel}集中办理审核及打款。` : '') +
        '申请后预计 1—3 个工作日内完成审核并发起转账，非工作日顺延。微信零钱提现需在“我的收益”确认收款，实际到账以微信转账结果为准。' +
        (config && config.methods && config.methods.bank && config.methods.bank.enabled
          ? '银行卡提现由财务转账，到账以银行处理结果为准。' : '')
    },
    {
      title: '提现手续费',
      desc: config && Number.isFinite(fee)
        ? (fee > 0 ? `按申请金额的 ${fee}% 收取，从提现金额中扣除，到账金额为扣费后的净额。` : '当前不收取提现手续费。')
        : '正在读取当前手续费，请加载成功后查看费率。'
    }
  ]
}

module.exports = { buildWithdrawalRules }
