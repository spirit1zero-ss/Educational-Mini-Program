Component({
  properties: {
    tabs: {
      type: Array,
      value: []
    },
    active: {
      type: String,
      value: 'home'
    },
    safeBottom: {
      type: Number,
      value: 0
    }
  },

  methods: {
    onTabTap(event) {
      const index = Number(event.currentTarget.dataset.index)
      const item = this.data.tabs[index]

      if (item) {
        this.triggerEvent('change', { item })
      }
    }
  }
})
