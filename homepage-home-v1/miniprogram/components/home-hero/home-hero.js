Component({
  properties: {
    modules: {
      type: Array,
      value: []
    }
  },

  methods: {
    onModuleTap(event) {
      const index = Number(event.currentTarget.dataset.index)
      const item = this.data.modules[index]

      if (item) {
        this.triggerEvent('select', { item })
      }
    }
  }
})
