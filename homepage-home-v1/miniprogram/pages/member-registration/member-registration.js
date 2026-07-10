const {
  getTrainingCampRegistration,
  saveTrainingCampRegistration
} = require('../../api/mine')

const DEFAULT_FORM = {
  child_name: '',
  child_age: '',
  child_gender: '',
  problems: [],
  other_problem: '',
  contact_phone: ''
}

Page({
  data: {
    loading: false,
    submitting: false,
    completed: false,
    canRegister: false,
    from: '',
    form: Object.assign({}, DEFAULT_FORM),
    problemMap: {},
    genderOptions: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' },
      { value: 'unknown', label: '暂不填写' }
    ],
    problemOptions: [
      { key: 'internet_school_refusal', label: '网瘾厌学' },
      { key: 'homework_delay', label: '作业拖拉磨蹭' },
      { key: 'hard_work_low_score', label: '学习用功但成绩不理想' },
      { key: 'partial_subject', label: '偏科' },
      { key: 'other', label: '其它' }
    ]
  },

  onLoad(options) {
    this.setData({
      from: (options && options.from) || ''
    })
    this.loadRegistration()
  },

  loadRegistration() {
    this.setData({ loading: true })

    getTrainingCampRegistration()
      .then((response) => {
        const payload = response.data || {}
        const form = Object.assign({}, DEFAULT_FORM, payload.form || {})
        form.child_age = form.child_age ? String(form.child_age) : ''
        form.problems = Array.isArray(form.problems) ? form.problems : []

        this.setData({
          completed: !!payload.completed,
          canRegister: !!payload.canRegister,
          form,
          problemMap: this.buildProblemMap(form.problems),
          problemOptions: Array.isArray(payload.problemOptions) && payload.problemOptions.length
            ? payload.problemOptions
            : this.data.problemOptions
        })
      })
      .catch((error) => {
        wx.showToast({
          title: (error && error.message) || '登记信息获取失败',
          icon: 'none'
        })
      })
      .then(() => {
        this.setData({ loading: false })
      })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    if (!field) return

    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  onGenderChange(e) {
    this.setData({
      'form.child_gender': e.detail.value
    })
  },

  onProblemsChange(e) {
    const problems = e.detail.value || []
    const next = {
      'form.problems': problems,
      problemMap: this.buildProblemMap(problems)
    }

    if (problems.indexOf('other') === -1) {
      next['form.other_problem'] = ''
    }

    this.setData(next)
  },

  onSubmit() {
    if (this.data.submitting || !this.data.canRegister) return

    const error = this.validateForm()
    if (error) {
      wx.showToast({
        title: error,
        icon: 'none'
      })
      return
    }

    this.setData({ submitting: true })

    saveTrainingCampRegistration(this.normalizeSubmitData())
      .then((response) => {
        const payload = response.data || {}
        wx.showToast({
          title: response.msg || '登记信息已保存',
          icon: 'success'
        })
        if (payload.form) {
          const form = Object.assign({}, DEFAULT_FORM, payload.form)
          form.child_age = form.child_age ? String(form.child_age) : ''
          form.problems = Array.isArray(form.problems) ? form.problems : []
          this.setData({
            completed: true,
            form,
            problemMap: this.buildProblemMap(form.problems)
          })
        } else {
          this.setData({ completed: true })
        }
      })
      .catch((error) => {
        wx.showToast({
          title: (error && error.message) || '保存失败',
          icon: 'none'
        })
      })
      .then(() => {
        this.setData({ submitting: false })
      })
  },

  onGoOrders() {
    wx.redirectTo({
      url: '/pages/camp-orders/camp-orders'
    })
  },

  validateForm() {
    const form = this.data.form
    const childName = (form.child_name || '').trim()
    const age = Number(form.child_age)
    const problems = form.problems || []
    const phone = (form.contact_phone || '').trim()

    if (!childName) return '请填写孩子姓名'
    if (!age || age < 3 || age > 18) return '请填写3-18之间的年龄'
    if (['male', 'female', 'unknown'].indexOf(form.child_gender) === -1) return '请选择孩子性别'
    if (!problems.length) return '请选择主要问题'
    if (problems.indexOf('other') >= 0 && !(form.other_problem || '').trim()) return '请填写其它问题说明'
    if (!/^1[3-9]\d{9}$/.test(phone)) return '请填写正确手机号'

    return ''
  },

  normalizeSubmitData() {
    const form = this.data.form

    return {
      child_name: (form.child_name || '').trim(),
      child_age: Number(form.child_age),
      child_gender: form.child_gender,
      problems: form.problems || [],
      other_problem: (form.other_problem || '').trim(),
      contact_phone: (form.contact_phone || '').trim()
    }
  },

  buildProblemMap(problems) {
    const map = {}
    ;(problems || []).forEach((key) => {
      map[key] = true
    })
    return map
  }
})
