Component({
  properties: {
    text: {
      type: String,
      value: ""
    },
    secondaryText: {
      type: String,
      value: ""
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onPrimary() {
      if (this.properties.disabled) return;
      this.triggerEvent("primary");
    },

    onSecondary() {
      this.triggerEvent("secondary");
    }
  }
});
