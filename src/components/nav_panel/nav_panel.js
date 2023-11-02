import ListsMenuContent from 'src/components/lists_menu/lists_menu_content.vue'
import AlbumsMenuContent from 'src/components/albums_menu/albums_menu_content.vue'
import { mapState, mapGetters } from 'vuex'
import { TIMELINES, ROOT_ITEMS } from 'src/components/navigation/navigation.js'
import { filterNavigation } from 'src/components/navigation/filter.js'
import NavigationEntry from 'src/components/navigation/navigation_entry.vue'
import NavigationPins from 'src/components/navigation/navigation_pins.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faUsers,
  faGlobe,
  faBookmark,
  faEnvelope,
  faChevronDown,
  faChevronUp,
  faComments,
  faBell,
  faInfoCircle,
  faStream,
  faList,
  faBullhorn,
  faFolder
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faUsers,
  faGlobe,
  faBookmark,
  faEnvelope,
  faChevronDown,
  faChevronUp,
  faComments,
  faBell,
  faInfoCircle,
  faStream,
  faList,
  faBullhorn,
  faFolder
)
const NavPanel = {
  props: ['forceExpand', 'forceEditMode'],
  created () {
  },
  components: {
    AlbumsMenuContent,
    ListsMenuContent,
    NavigationEntry,
    NavigationPins,
    Checkbox
  },
  data () {
    return {
      editMode: false,
      showTimelines: false,
      showLists: false,
      showAlbums: false,
      timelinesList: Object.entries(TIMELINES).map(([k, v]) => ({ ...v, name: k })),
      rootList: Object.entries(ROOT_ITEMS).map(([k, v]) => ({ ...v, name: k }))
    }
  },
  methods: {
    toggleTimelines () {
      this.showTimelines = !this.showTimelines
    },
    toggleLists () {
      this.showLists = !this.showLists
    },
    toggleAlbums () {
      this.showAlbums = !this.showAlbums
    },
    toggleEditMode () {
      this.editMode = !this.editMode
    },
    toggleCollapse () {
      this.$store.commit('setPreference', { path: 'simple.collapseNav', value: !this.collapsed })
      this.$store.dispatch('pushServerSideStorage')
    },
    isPinned (item) {
      return this.pinnedItems.has(item)
    },
    togglePin (item) {
      if (this.isPinned(item)) {
        this.$store.commit('removeCollectionPreference', { path: 'collections.pinnedNavItems', value: item })
      } else {
        this.$store.commit('addCollectionPreference', { path: 'collections.pinnedNavItems', value: item })
      }
      this.$store.dispatch('pushServerSideStorage')
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.users.currentUser,
      followRequestCount: state => state.api.followRequests.length,
      privateMode: state => state.instance.private,
      federating: state => state.instance.federating,
      pleromaChatMessagesAvailable: state => state.instance.pleromaChatMessagesAvailable,
      supportsAnnouncements: state => state.announcements.supportsAnnouncements,
      pinnedItems: state => new Set(state.serverSideStorage.prefsStorage.collections.pinnedNavItems),
      collapsed: state => state.serverSideStorage.prefsStorage.simple.collapseNav
    }),
    timelinesItems () {
      return filterNavigation(
        Object
          .entries({ ...TIMELINES })
          .map(([k, v]) => ({ ...v, name: k })),
        {
          hasChats: this.pleromaChatMessagesAvailable,
          hasAnnouncements: this.supportsAnnouncements,
          isFederating: this.federating,
          isPrivate: this.privateMode,
          currentUser: this.currentUser
        }
      )
    },
    rootItems () {
      return filterNavigation(
        Object
          .entries({ ...ROOT_ITEMS })
          .map(([k, v]) => ({ ...v, name: k })),
        {
          hasChats: this.pleromaChatMessagesAvailable,
          hasAnnouncements: this.supportsAnnouncements,
          isFederating: this.federating,
          isPrivate: this.privateMode,
          currentUser: this.currentUser
        }
      )
    },
    ...mapGetters(['unreadChatCount', 'unreadAnnouncementCount'])
  }
}

export default NavPanel
