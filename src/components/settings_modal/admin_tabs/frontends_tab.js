import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import IntegerSetting from '../helpers/integer_setting.vue'
import StringSetting from '../helpers/string_setting.vue'
import GroupSetting from '../helpers/group_setting.vue'
import Popover from 'src/components/popover/popover.vue'

import SharedComputedObject from '../helpers/shared_computed_object.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faGlobe
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faGlobe
)

const FrontendsTab = {
  provide () {
    return {
      defaultDraftMode: true,
      defaultSource: 'admin'
    }
  },
  components: {
    BooleanSetting,
    ChoiceSetting,
    IntegerSetting,
    StringSetting,
    GroupSetting,
    Popover
  },
  created () {
    if (this.user.rights.admin) {
      this.$store.dispatch('loadFrontendsStuff')
    }
  },
  computed: {
    frontends () {
      return this.$store.state.adminSettings.frontends
    },
    ...SharedComputedObject()
  },
  methods: {
    update (frontend, suggestRef) {
      const ref = suggestRef || frontend.refs[0]
      const { name } = frontend
      const payload = { name, ref }

      this.$store.state.api.backendInteractor.installFrontend({ payload })
        .then((externalUser) => {
          this.$store.dispatch('loadFrontendsStuff')
        })
    },
    setDefault (frontend, suggestRef) {
      const ref = suggestRef || frontend.refs[0]
      const { name } = frontend

      this.$store.commit('updateAdminDraft', { path: [':pleroma', ':frontends', ':primary'], value: { name, ref } })
    }
  }
}

export default FrontendsTab
