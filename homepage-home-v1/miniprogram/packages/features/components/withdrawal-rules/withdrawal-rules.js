Component({
  properties: {
    rules: { type: Array, value: [] },
    error: { type: Boolean, value: false },
    compact: { type: Boolean, value: false }
  },
  methods: {
    retry() { this.triggerEvent('retry') }
  }
})
