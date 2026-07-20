Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('select', { item: this.data.item })
    }
  }
})
