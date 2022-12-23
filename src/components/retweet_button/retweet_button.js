import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faRetweet,
  faPlus,
  faMinus,
  faCheck
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faRetweet,
  faPlus,
  faMinus,
  faCheck
)

const RetweetButton = {
  props: ['status', 'loggedIn', 'visibility'],
  data () {
    return {
      animated: false
    }
  },
  methods: {
    retweet () {
      if (!this.status.repeated) {
        this.$store.dispatch('retweet', { id: this.status.id })
      } else {
        this.$store.dispatch('unretweet', { id: this.status.id })
      }
      this.animated = true
      setTimeout(() => {
        this.animated = false
      }, 500)
    }
  },
  computed: {
    mergedConfig () {
      return this.$store.getters.mergedConfig
    },
    remoteInteractionLink () {
      return this.$store.getters.remoteInteractionLink({ statusId: this.status.id })
    }
  }
}

export default RetweetButton
