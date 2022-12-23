import { get, set } from 'lodash'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import ModifiedIndicator from './modified_indicator.vue'
import ServerSideIndicator from './server_side_indicator.vue'
export default {
  components: {
    Checkbox,
    ModifiedIndicator,
    ServerSideIndicator
  },
  props: [
    'path',
    'disabled',
    'expert'
  ],
  computed: {
    pathDefault () {
      const [firstSegment, ...rest] = this.path.split('.')
      return [firstSegment + 'DefaultValue', ...rest].join('.')
    },
    state () {
      const value = get(this.$parent, this.path)
      if (value === undefined) {
        return this.defaultState
      } else {
        return value
      }
    },
    defaultState () {
      return get(this.$parent, this.pathDefault)
    },
    isServerSide () {
      return this.path.startsWith('serverSide_')
    },
    isChanged () {
      return !this.path.startsWith('serverSide_') && this.state !== this.defaultState
    },
    matchesExpertLevel () {
      return (this.expert || 0) <= this.$parent.expertLevel
    }
  },
  methods: {
    update (e) {
      const [firstSegment, ...rest] = this.path.split('.')
      set(this.$parent, this.path, e)
      // Updating nested properties does not trigger update on its parent.
      // probably still not as reliable, but works for depth=1 at least
      if (rest.length > 0) {
        set(this.$parent, firstSegment, { ...get(this.$parent, firstSegment) })
      }
    },
    reset () {
      set(this.$parent, this.path, this.defaultState)
    }
  }
}
