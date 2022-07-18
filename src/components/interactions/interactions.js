import Notifications from '../notifications/notifications.vue'
import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'

const tabModeDict = {
  mentions: ['mention'],
  'likes+repeats': ['repeat', 'like'],
  follows: ['follow'],
  reactions: ['pleroma:emoji_reaction'],
  reports: ['pleroma:report'],
  moves: ['move']
}

const Interactions = {
  data () {
    return {
      allowFollowingMove: this.$store.state.users.currentUser.allow_following_move,
      filterMode: tabModeDict['mentions'],
      canSeeReports: ['moderator', 'admin'].includes(this.$store.state.users.currentUser.role)
    }
  },
  methods: {
    onModeSwitch (key) {
      this.filterMode = tabModeDict[key]
    }
  },
  components: {
    Notifications,
    TabSwitcher
  }
}

export default Interactions
