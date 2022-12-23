import { get, set } from 'lodash'
import ModifiedIndicator from './modified_indicator.vue'
import Select from 'src/components/select/select.vue'

export const allCssUnits = ['cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%']
export const defaultHorizontalUnits = ['px', 'rem', 'vw']
export const defaultVerticalUnits = ['px', 'rem', 'vh']

export default {
  components: {
    ModifiedIndicator,
    Select
  },
  props: {
    path: String,
    disabled: Boolean,
    min: Number,
    units: {
      type: [String],
      default: () => allCssUnits
    },
    expert: [Number, String]
  },
  computed: {
    pathDefault () {
      const [firstSegment, ...rest] = this.path.split('.')
      return [firstSegment + 'DefaultValue', ...rest].join('.')
    },
    stateUnit () {
      return (this.state || '').replace(/\d+/, '')
    },
    stateValue () {
      return (this.state || '').replace(/\D+/, '')
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
    isChanged () {
      return this.state !== this.defaultState
    },
    matchesExpertLevel () {
      return (this.expert || 0) <= this.$parent.expertLevel
    }
  },
  methods: {
    update (e) {
      set(this.$parent, this.path, e)
    },
    reset () {
      set(this.$parent, this.path, this.defaultState)
    },
    updateValue (e) {
      set(this.$parent, this.path, parseInt(e.target.value) + this.stateUnit)
    },
    updateUnit (e) {
      set(this.$parent, this.path, this.stateValue + e.target.value)
    }
  }
}
