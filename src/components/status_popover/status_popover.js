import { find } from 'lodash'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { defineAsyncComponent } from 'vue'

library.add(
  faCircleNotch
)

const StatusPopover = {
  name: 'StatusPopover',
  props: [
    'statusId'
  ],
  data () {
    return {
      error: false
    }
  },
  computed: {
    status () {
      return find(this.$store.state.statuses.allStatuses, { id: this.statusId })
    }
  },
  components: {
    Status: defineAsyncComponent(() => import('../status/status.vue')),
    Popover: defineAsyncComponent(() => import('../popover/popover.vue'))
  },
  methods: {
    enter () {
      if (!this.status) {
        if (!this.statusId) {
          this.error = true
          return
        }
        this.$store.dispatch('fetchStatus', this.statusId)
          .then(data => (this.error = false))
          .catch(e => (this.error = true))
      }
    }
  },
  watch: {
    status (newStatus, oldStatus) {
      if (newStatus !== oldStatus) {
        this.$refs.popover.updateStyles()
      }
    }
  }
}

export default StatusPopover
