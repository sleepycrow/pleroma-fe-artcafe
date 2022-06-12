const Popover = {
  name: 'Popover',
  props: {
    // Action to trigger popover: either 'hover' or 'click'
    trigger: String,

    // Either 'top' or 'bottom'
    placement: String,

    // Takes object with properties 'x' and 'y', values of these can be
    // 'container' for using offsetParent as boundaries for either axis
    // or 'viewport'
    boundTo: Object,

    // Takes a selector to use as a replacement for the parent container
    // for getting boundaries for x an y axis
    boundToSelector: String,

    // Takes a top/bottom/left/right object, how much space to leave
    // between boundary and popover element
    margin: Object,

    // Takes a x/y object and tells how many pixels to offset from
    // anchor point on either axis
    offset: Object,

    // Replaces the classes you may want for the popover container.
    // Use 'popover-default' in addition to get the default popover
    // styles with your custom class.
    popoverClass: String,

    // If true, subtract padding when calculating position for the popover,
    // use it when popover offset looks to be different on top vs bottom.
    removePadding: Boolean,

    // self-explanatory (i hope)
    disabled: Boolean
  },
  data () {
    return {
      hidden: true,
      styles: {},
      oldSize: { width: 0, height: 0 },
      // used to avoid blinking if hovered onto popover
      graceTimeout: null
    }
  },
  methods: {
    containerBoundingClientRect () {
      const container = this.boundToSelector ? this.$el.closest(this.boundToSelector) : this.$el.offsetParent
      return container.getBoundingClientRect()
    },
    updateStyles () {
      if (this.hidden) {
        this.styles = {}
        return
      }

      // Popover will be anchored around this element, trigger ref is the container, so
      // its children are what are inside the slot. Expect only one v-slot:trigger.
      const anchorEl = (this.$refs.trigger && this.$refs.trigger.children[0]) || this.$el
      // SVGs don't have offsetWidth/Height, use fallback
      const anchorHeight = anchorEl.offsetHeight || anchorEl.clientHeight
      const anchorWidth = anchorEl.offsetWidth || anchorEl.clientWidth
      const anchorScreenBox = anchorEl.getBoundingClientRect()

      const anchorStyle = getComputedStyle(anchorEl)
      const topPadding = parseFloat(anchorStyle.paddingTop)
      const bottomPadding = parseFloat(anchorStyle.paddingBottom)

      // Screen position of the origin point for popover = center of the anchor
      const origin = {
        x: anchorScreenBox.left + anchorWidth * 0.5,
        y: anchorScreenBox.top + anchorHeight * 0.5
      }
      const content = this.$refs.content

      // Minor optimization, don't call a slow reflow call if we don't have to
      const parentScreenBox = this.boundTo &&
        (this.boundTo.x === 'container' || this.boundTo.y === 'container') &&
        this.containerBoundingClientRect()

      const margin = this.margin || {}

      // What are the screen bounds for the popover? Viewport vs container
      // when using viewport, using default margin values to dodge the navbar
      const xBounds = this.boundTo && this.boundTo.x === 'container' ? {
        min: parentScreenBox.left + (margin.left || 0),
        max: parentScreenBox.right - (margin.right || 0)
      } : {
        min: 0 + (margin.left || 10),
        max: window.innerWidth - (margin.right || 10)
      }

      const yBounds = this.boundTo && this.boundTo.y === 'container' ? {
        min: parentScreenBox.top + (margin.top || 0),
        max: parentScreenBox.bottom - (margin.bottom || 0)
      } : {
        min: 0 + (margin.top || 50),
        max: window.innerHeight - (margin.bottom || 5)
      }

      let horizOffset = content.offsetWidth * -0.5
      const leftBorder = origin.x + horizOffset
      const rightBorder = origin.x - horizOffset
      // If overflowing from left, move it so that it doesn't
      if (leftBorder < xBounds.min) {
        horizOffset += xBounds.min - leftBorder
      }

      // If overflowing from right, move it so that it doesn't
      if (rightBorder > xBounds.max) {
        horizOffset -= rightBorder - xBounds.max
      }

      // Default to whatever user wished with placement prop
      let usingTop = this.placement !== 'bottom'

      // Handle special cases, first force to displaying on top if there's not space on bottom,
      // regardless of what placement value was. Then check if there's not space on top, and
      // force to bottom, again regardless of what placement value was.
      const topBoundary = origin.y - anchorHeight * 0.5 + (this.removePadding ? topPadding : 0)
      const bottomBoundary = origin.y + anchorHeight * 0.5 - (this.removePadding ? bottomPadding : 0)
      if (bottomBoundary + content.offsetHeight > yBounds.max) usingTop = true
      if (topBoundary - content.offsetHeight < yBounds.min) usingTop = false

      const yOffset = (this.offset && this.offset.y) || 0
      const translateY = usingTop
        ? topBoundary - yOffset - content.offsetHeight
        : bottomBoundary + yOffset

      const xOffset = (this.offset && this.offset.x) || 0
      const translateX = origin.x + horizOffset + xOffset

      // Note, separate translateX and translateY avoids blurry text on chromium,
      // single translate or translate3d resulted in blurry text.
      this.styles = {
        left: `${Math.round(translateX)}px`,
        top: `${Math.round(translateY)}px`,
        position: 'fixed'
      }

      if (parentScreenBox) {
        this.styles.maxWidth = `${Math.round(parentScreenBox.width)}px`
      }
    },
    showPopover () {
      if (this.disabled) return
      const wasHidden = this.hidden
      this.hidden = false
      this.$nextTick(() => {
        if (wasHidden) this.$emit('show')
        this.updateStyles()
      })
    },
    hidePopover () {
      if (!this.hidden) this.$emit('close')
      this.hidden = true
    },
    onMouseenter (e) {
      if (this.trigger === 'hover') {
        clearTimeout(this.graceTimeout)
        this.graceTimeout = null
        this.showPopover()
      }
    },
    onMouseleave (e) {
      if (this.trigger === 'hover') {
        this.graceTimeout = setTimeout(() => this.hidePopover(), 1)
      }
    },
    onMouseenterContent (e) {
      if (this.trigger === 'hover') {
        clearTimeout(this.graceTimeout)
        this.graceTimeout = null
        this.showPopover()
      }
    },
    onMouseleaveContent (e) {
      if (this.trigger === 'hover') {
        this.graceTimeout = setTimeout(() => this.hidePopover(), 1)
      }
    },
    onClick (e) {
      if (this.trigger === 'click') {
        if (this.hidden) {
          this.showPopover()
        } else {
          this.hidePopover()
        }
      }
    },
    onClickOutside (e) {
      if (this.hidden) return
      if (this.$el.contains(e.target)) return
      this.hidePopover()
    },
    onScroll () {
      this.hidePopover()
    }
  },
  updated () {
    // Monitor changes to content size, update styles only when content sizes have changed,
    // that should be the only time we need to move the popover box if we don't care about scroll
    // or resize
    const content = this.$refs.content
    if (!content) return
    if (this.oldSize.width !== content.offsetWidth || this.oldSize.height !== content.offsetHeight) {
      this.updateStyles()
      this.oldSize = { width: content.offsetWidth, height: content.offsetHeight }
    }
  },
  created () {
    document.addEventListener('click', this.onClickOutside)
    window.addEventListener('scroll', this.onScroll)
  },
  unmounted () {
    document.removeEventListener('click', this.onClickOutside)
    window.removeEventListener('scroll', this.onScroll)
    this.hidePopover()
  }
}

export default Popover
