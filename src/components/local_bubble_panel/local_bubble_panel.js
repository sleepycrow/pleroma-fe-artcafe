const LocalBubblePanel = {
  computed: {
    localBubbleInstances: function () { return this.$store.state.instance.localBubbleInstances }
  }
}

export default LocalBubblePanel
