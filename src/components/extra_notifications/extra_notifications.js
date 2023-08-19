import { mapGetters } from 'vuex'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faUserPlus,
  faComments,
  faBullhorn
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faUserPlus,
  faComments,
  faBullhorn
)

const ExtraNotifications = {
  computed: {
    shouldShowChats () {
      return this.mergedConfig.showExtraNotifications && this.mergedConfig.showChatsInExtraNotifications && this.unreadChatCount
    },
    shouldShowAnnouncements () {
      return this.mergedConfig.showExtraNotifications && this.mergedConfig.showAnnouncementsInExtraNotifications && this.unreadAnnouncementCount
    },
    shouldShowFollowRequests () {
      return this.mergedConfig.showExtraNotifications && this.mergedConfig.showFollowRequestsInExtraNotifications && this.followRequestCount
    },
    hasAnythingToShow () {
      return this.shouldShowChats || this.shouldShowAnnouncements || this.shouldShowFollowRequests
    },
    shouldShowCustomizationTip () {
      return this.mergedConfig.showExtraNotificationsTip && this.hasAnythingToShow
    },
    currentUser () {
      return this.$store.state.users.currentUser
    },
    ...mapGetters(['unreadChatCount', 'unreadAnnouncementCount', 'followRequestCount', 'mergedConfig'])
  },
  methods: {
    openNotificationSettings () {
      return this.$store.dispatch('openSettingsModalTab', 'notifications')
    },
    dismissConfigurationTip () {
      return this.$store.dispatch('setOption', { name: 'showExtraNotificationsTip', value: false })
    }
  }
}

export default ExtraNotifications
