import { mapState } from 'vuex'
import { USERNAME_ROUTES } from 'src/components/navigation/navigation.js'
import OptionalRouterLink from 'src/components/optional_router_link/optional_router_link.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons'

library.add(faThumbtack)

const NavigationEntry = {
  props: ['item', 'showPin'],
  components: {
    OptionalRouterLink
  },
  methods: {
    isPinned (value) {
      return this.pinnedItems.has(value)
    },
    togglePin (value) {
      if (this.isPinned(value)) {
        this.$store.commit('removeCollectionPreference', { path: 'collections.pinnedNavItems', value })
      } else {
        this.$store.commit('addCollectionPreference', { path: 'collections.pinnedNavItems', value })
      }
      this.$store.dispatch('pushServerSideStorage')
    }
  },
  computed: {
    routeTo () {
      if (!this.item.route && !this.item.routeObject) return null
      let route
      if (this.item.routeObject) {
        route = this.item.routeObject
      } else {
        route = { name: (this.item.anon || this.currentUser) ? this.item.route : this.item.anonRoute }
      }
      if (USERNAME_ROUTES.has(route.name)) {
        route.params = { username: this.currentUser.screen_name, name: this.currentUser.screen_name }
      }
      return route
    },
    getters () {
      return this.$store.getters
    },
    ...mapState({
      currentUser: state => state.users.currentUser,
      pinnedItems: state => new Set(state.serverSideStorage.prefsStorage.collections.pinnedNavItems)
    })
  }
}

export default NavigationEntry
