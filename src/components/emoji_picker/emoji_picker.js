import { defineAsyncComponent } from 'vue'
import Checkbox from '../checkbox/checkbox.vue'
import Popover from 'src/components/popover/popover.vue'
import StillImage from '../still-image/still-image.vue'
import { ensureFinalFallback } from '../../i18n/languages.js'
import lozad from 'lozad'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBoxOpen,
  faStickyNote,
  faSmileBeam,
  faSmile,
  faUser,
  faPaw,
  faIceCream,
  faBus,
  faBasketballBall,
  faLightbulb,
  faCode,
  faFlag
} from '@fortawesome/free-solid-svg-icons'
import { debounce, trim } from 'lodash'

library.add(
  faBoxOpen,
  faStickyNote,
  faSmileBeam,
  faSmile,
  faUser,
  faPaw,
  faIceCream,
  faBus,
  faBasketballBall,
  faLightbulb,
  faCode,
  faFlag
)

const UNICODE_EMOJI_GROUP_ICON = {
  'smileys-and-emotion': 'smile',
  'people-and-body': 'user',
  'animals-and-nature': 'paw',
  'food-and-drink': 'ice-cream',
  'travel-and-places': 'bus',
  activities: 'basketball-ball',
  objects: 'lightbulb',
  symbols: 'code',
  flags: 'flag'
}

const maybeLocalizedKeywords = (emoji, languages, nameLocalizer) => {
  const res = [emoji.displayText, nameLocalizer(emoji)]
  if (emoji.annotations) {
    languages.forEach(lang => {
      const keywords = emoji.annotations[lang]?.keywords || []
      const name = emoji.annotations[lang]?.name
      res.push(...(keywords.concat([name]).filter(k => k)))
    })
  }
  return res
}

const filterByKeyword = (list, keyword = '', languages, nameLocalizer) => {
  if (keyword === '') return list

  const keywordLowercase = keyword.toLowerCase()
  const orderedEmojiList = []
  for (const emoji of list) {
    const indices = maybeLocalizedKeywords(emoji, languages, nameLocalizer)
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

const EmojiPicker = {
  props: {
    enableStickerPicker: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      keyword: '',
      activeGroup: 'custom',
      showingStickers: false,
      groupsScrolledClass: 'scrolled-top',
      keepOpen: false,
      customEmojiTimeout: null,
      // Lazy-load only after the first time `showing` becomes true.
      contentLoaded: false,
      groupRefs: {},
      emojiRefs: {},
      filteredEmojiGroups: []
    }
  },
  components: {
    StickerPicker: defineAsyncComponent(() => import('../sticker_picker/sticker_picker.vue')),
    Checkbox,
    StillImage,
    Popover
  },
  methods: {
    showPicker () {
      this.$refs.popover.showPopover()
      this.onShowing()
    },
    hidePicker () {
      this.$refs.popover.hidePopover()
    },
    setAnchorEl (el) {
      this.$refs.popover.setAnchorEl(el)
    },
    setGroupRef (name) {
      return el => { this.groupRefs[name] = el }
    },
    setEmojiRef (name) {
      return el => { this.emojiRefs[name] = el }
    },
    onPopoverShown () {
      this.$emit('show')
    },
    onPopoverClosed () {
      this.$emit('close')
    },
    onStickerUploaded (e) {
      this.$emit('sticker-uploaded', e)
    },
    onStickerUploadFailed (e) {
      this.$emit('sticker-upload-failed', e)
    },
    onEmoji (emoji) {
      const value = emoji.imageUrl ? `:${emoji.displayText}:` : emoji.replacement
      if (!this.keepOpen) {
        this.$refs.popover.hidePopover()
      }
      this.$emit('emoji', { insertion: value, keepOpen: this.keepOpen })
    },
    onScroll (e) {
      const target = (e && e.target) || this.$refs['emoji-groups']
      this.updateScrolledClass(target)
      this.scrolledGroup(target)
    },
    scrolledGroup (target) {
      const top = target.scrollTop + 5
      this.$nextTick(() => {
        this.allEmojiGroups.forEach(group => {
          const ref = this.groupRefs['group-' + group.id]
          if (ref && ref.offsetTop <= top) {
            this.activeGroup = group.id
          }
        })
        this.scrollHeader()
      })
    },
    scrollHeader () {
      // Scroll the active tab's header into view
      const headerRef = this.groupRefs['group-header-' + this.activeGroup]
      const left = headerRef.offsetLeft
      const right = left + headerRef.offsetWidth
      const headerCont = this.$refs.header
      const currentScroll = headerCont.scrollLeft
      const currentScrollRight = currentScroll + headerCont.clientWidth
      const setScroll = s => { headerCont.scrollLeft = s }

      const margin = 7 // .emoji-tabs-item: padding
      if (left - margin < currentScroll) {
        setScroll(left - margin)
      } else if (right + margin > currentScrollRight) {
        setScroll(right + margin - headerCont.clientWidth)
      }
    },
    highlight (key) {
      const ref = this.groupRefs['group-' + key]
      const top = ref.offsetTop
      this.setShowStickers(false)
      this.activeGroup = key
      this.$nextTick(() => {
        this.$refs['emoji-groups'].scrollTop = top + 1
      })
    },
    updateScrolledClass (target) {
      if (target.scrollTop <= 5) {
        this.groupsScrolledClass = 'scrolled-top'
      } else if (target.scrollTop >= target.scrollTopMax - 5) {
        this.groupsScrolledClass = 'scrolled-bottom'
      } else {
        this.groupsScrolledClass = 'scrolled-middle'
      }
    },
    toggleStickers () {
      this.showingStickers = !this.showingStickers
    },
    setShowStickers (value) {
      this.showingStickers = value
    },
    filterByKeyword (list, keyword) {
      return filterByKeyword(list, keyword, this.languages, this.maybeLocalizedEmojiName)
    },
    initializeLazyLoad () {
      this.destroyLazyLoad()
      this.$nextTick(() => {
        this.$lozad = lozad('.still-image.emoji-picker-emoji', {
          load: el => {
            const name = el.getAttribute('data-emoji-name')
            const vn = this.emojiRefs[name]
            if (!vn) {
              return
            }

            vn.loadLazy()
          }
        })
        this.$lozad.observe()
      })
    },
    waitForDomAndInitializeLazyLoad () {
      this.$nextTick(() => this.initializeLazyLoad())
    },
    destroyLazyLoad () {
      if (this.$lozad) {
        if (this.$lozad.observer) {
          this.$lozad.observer.disconnect()
        }
        if (this.$lozad.mutationObserver) {
          this.$lozad.mutationObserver.disconnect()
        }
      }
    },
    onShowing () {
      const oldContentLoaded = this.contentLoaded
      this.$nextTick(() => {
        this.$refs.search.focus()
      })
      this.contentLoaded = true
      this.waitForDomAndInitializeLazyLoad()
      this.filteredEmojiGroups = this.getFilteredEmojiGroups()
      if (!oldContentLoaded) {
        this.$nextTick(() => {
          if (this.defaultGroup) {
            this.highlight(this.defaultGroup)
          }
        })
      }
    },
    getFilteredEmojiGroups () {
      return this.allEmojiGroups
        .map(group => ({
          ...group,
          emojis: this.filterByKeyword(group.emojis, trim(this.keyword))
        }))
        .filter(group => group.emojis.length > 0)
    }
  },
  watch: {
    keyword () {
      this.onScroll()
      this.debouncedHandleKeywordChange()
    },
    allCustomGroups () {
      this.waitForDomAndInitializeLazyLoad()
      this.filteredEmojiGroups = this.getFilteredEmojiGroups()
    }
  },
  destroyed () {
    this.destroyLazyLoad()
  },
  computed: {
    activeGroupView () {
      return this.showingStickers ? '' : this.activeGroup
    },
    stickersAvailable () {
      if (this.$store.state.instance.stickers) {
        return this.$store.state.instance.stickers.length > 0
      }
      return 0
    },
    allCustomGroups () {
      return this.$store.getters.groupedCustomEmojis
    },
    defaultGroup () {
      return Object.keys(this.allCustomGroups)[0]
    },
    unicodeEmojiGroups () {
      return this.$store.getters.standardEmojiGroupList.map(group => ({
        id: `standard-${group.id}`,
        text: this.$t(`emoji.unicode_groups.${group.id}`),
        icon: UNICODE_EMOJI_GROUP_ICON[group.id],
        emojis: group.emojis
      }))
    },
    allEmojiGroups () {
      return Object.entries(this.allCustomGroups)
        .map(([_, v]) => v)
        .concat(this.unicodeEmojiGroups)
    },
    stickerPickerEnabled () {
      return (this.$store.state.instance.stickers || []).length !== 0
    },
    debouncedHandleKeywordChange () {
      return debounce(() => {
        this.waitForDomAndInitializeLazyLoad()
        this.filteredEmojiGroups = this.getFilteredEmojiGroups()
      }, 500)
    },
    languages () {
      return ensureFinalFallback(this.$store.getters.mergedConfig.interfaceLanguage)
    },
    maybeLocalizedEmojiName () {
      return emoji => {
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
    }
  }
}

export default EmojiPicker
