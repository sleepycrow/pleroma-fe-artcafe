import { mapGetters } from 'vuex'

const ExtraNotifications = {
  computed: {
    ...mapGetters(['unreadChatCount', 'unreadAnnouncementCount'])
  }
}

export default ExtraNotifications
