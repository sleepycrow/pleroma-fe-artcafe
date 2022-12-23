import Popover from '../popover/popover.vue'
import { ensureFinalFallback } from '../../i18n/languages.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faSmileBeam } from '@fortawesome/free-regular-svg-icons'
import { trim } from 'lodash'

library.add(
  faPlus,
  faTimes,
  faSmileBeam
)

const ReactButton = {
  props: ['status'],
  data () {
    return {
      filterWord: '',
      expanded: false
    }
  },
  components: {
    Popover
  },
  methods: {
    addReaction (event, emoji, close) {
      const existingReaction = this.status.emoji_reactions.find(r => r.name === emoji)
      if (existingReaction && existingReaction.me) {
        this.$store.dispatch('unreactWithEmoji', { id: this.status.id, emoji })
      } else {
        this.$store.dispatch('reactWithEmoji', { id: this.status.id, emoji })
      }
      close()
    },
    onShow () {
      this.expanded = true
      this.focusInput()
    },
    onClose () {
      this.expanded = false
    },
    focusInput () {
      this.$nextTick(() => {
        const input = this.$el.querySelector('input')
        if (input) input.focus()
      })
    },
    // Vaguely adjusted copypaste from emoji_input and emoji_picker!
    maybeLocalizedEmojiNamesAndKeywords (emoji) {
      const names = [emoji.displayText]
      const keywords = []

      if (emoji.displayTextI18n) {
        names.push(this.$t(emoji.displayTextI18n.key, emoji.displayTextI18n.args))
      }

      if (emoji.annotations) {
        this.languages.forEach(lang => {
          names.push(emoji.annotations[lang]?.name)

          keywords.push(...(emoji.annotations[lang]?.keywords || []))
        })
      }

      return {
        names: names.filter(k => k),
        keywords: keywords.filter(k => k)
      }
    },
    maybeLocalizedEmojiName (emoji) {
      if (!emoji.annotations) {
        return emoji.displayText
      }

      if (emoji.displayTextI18n) {
        return this.$t(emoji.displayTextI18n.key, emoji.displayTextI18n.args)
      }

      for (const lang of this.languages) {
        if (emoji.annotations[lang]?.name) {
          return emoji.annotations[lang].name
        }
      }

      return emoji.displayText
    }
  },
  computed: {
    commonEmojis () {
      const hardcodedSet = new Set(['👍', '😠', '👀', '😂', '🔥'])
      return this.$store.getters.standardEmojiList.filter(emoji => hardcodedSet.has(emoji.replacement))
    },
    languages () {
      return ensureFinalFallback(this.$store.getters.mergedConfig.interfaceLanguage)
    },
    emojis () {
      if (this.filterWord !== '') {
        const keywordLowercase = trim(this.filterWord.toLowerCase())

        const orderedEmojiList = []
        for (const emoji of this.$store.getters.standardEmojiList) {
          const indices = this.maybeLocalizedEmojiNamesAndKeywords(emoji)
            .keywords
            .map(k => k.toLowerCase().indexOf(keywordLowercase))
            .filter(k => k > -1)

          const indexOfKeyword = indices.length ? Math.min(...indices) : -1

          if (indexOfKeyword > -1) {
            if (!Array.isArray(orderedEmojiList[indexOfKeyword])) {
              orderedEmojiList[indexOfKeyword] = []
            }
            orderedEmojiList[indexOfKeyword].push(emoji)
          }
        }
        return orderedEmojiList.flat()
      }
      return this.$store.getters.standardEmojiList || []
    },
    mergedConfig () {
      return this.$store.getters.mergedConfig
    }
  }
}

export default ReactButton
