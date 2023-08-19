import { mapGetters } from 'vuex'

const ExtraNotifications = {
  computed: {
    shouldShowChats () {
      return this.unreadChatCount
    },
    shouldShowAnnouncements () {
      return this.unreadAnnouncementCount
    },
    shouldShowFollowRequests () {
      return this.followRequestCount
    },
    ...mapGetters(['unreadChatCount', 'unreadAnnouncementCount', 'followRequestCount'])
  }
}

export default ExtraNotifications
