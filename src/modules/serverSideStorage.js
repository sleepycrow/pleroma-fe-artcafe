import { toRaw } from 'vue'
import { isEqual, cloneDeep } from 'lodash'
import { CURRENT_UPDATE_COUNTER } from 'src/components/update_notification/update_notification.js'

export const VERSION = 1
export const NEW_USER_DATE = new Date('2022-08-04') // date of writing this, basically

export const COMMAND_TRIM_FLAGS = 1000
export const COMMAND_TRIM_FLAGS_AND_RESET = 1001

export const defaultState = {
  // do we need to update data on server?
  dirty: false,
  // storage of flags - stuff that can only be set and incremented
  flagStorage: {
    updateCounter: 0, // Counter for most recent update notification seen
    // TODO move to prefsStorage when that becomes a thing since only way
    // this can be reset is by complete reset of all flags
    dontShowUpdateNotifs: 0, // if user chose to not show update notifications ever again
    reset: 0 // special flag that can be used to force-reset all flags, debug purposes only
    // special reset codes:
    // 1000: trim keys to those known by currently running FE
    // 1001: same as above + reset everything to 0
  },
  // raw data
  raw: null,
  // local cache
  cache: null
}

export const newUserFlags = {
  ...defaultState.flagStorage,
  updateCounter: CURRENT_UPDATE_COUNTER // new users don't need to see update notification
}

const _wrapData = (data) => ({
  ...data,
  _timestamp: Date.now(),
  _version: VERSION
})

const _checkValidity = (data) => data._timestamp > 0 && data._version > 0

export const _getRecentData = (cache, live) => {
  const result = { recent: null, stale: null, needUpload: false }
  const cacheValid = _checkValidity(cache || {})
  const liveValid = _checkValidity(live || {})
  if (!liveValid && cacheValid) {
    result.needUpload = true
    console.debug('Nothing valid stored on server, assuming cache to be source of truth')
    result.recent = cache
    result.stale = live
  } else if (!cacheValid && liveValid) {
    console.debug('Valid storage on server found, no local cache found, using live as source of truth')
    result.recent = live
    result.stale = cache
  } else if (cacheValid && liveValid) {
    console.debug('Both sources have valid data, figuring things out...')
    if (live._timestamp === cache._timestamp && live._version === cache._version) {
      console.debug('Same version/timestamp on both source, source of truth irrelevant')
      result.recent = cache
      result.stale = live
    } else {
      console.debug('Different timestamp, figuring out which one is more recent')
      if (live._timestamp < cache._timestamp) {
        result.recent = cache
        result.stale = live
      } else {
        result.recent = live
        result.stale = cache
      }
    }
  } else {
    console.debug('Both sources are invalid, start from scratch')
    result.needUpload = true
  }
  return result
}

export const _getAllFlags = (recent, stale) => {
  return Array.from(new Set([
    ...Object.keys(toRaw((recent || {}).flagStorage || {})),
    ...Object.keys(toRaw((stale || {}).flagStorage || {}))
  ]))
}

export const _mergeFlags = (recent, stale, allFlagKeys) => {
  return Object.fromEntries(allFlagKeys.map(flag => {
    const recentFlag = recent.flagStorage[flag]
    const staleFlag = stale.flagStorage[flag]
    // use flag that is of higher value
    return [flag, Number((recentFlag > staleFlag ? recentFlag : staleFlag) || 0)]
  }))
}

export const _resetFlags = (totalFlags, knownKeys = defaultState.flagStorage) => {
  let result = { ...totalFlags }
  const allFlagKeys = Object.keys(totalFlags)
  // flag reset functionality
  if (totalFlags.reset >= COMMAND_TRIM_FLAGS && totalFlags.reset <= COMMAND_TRIM_FLAGS_AND_RESET) {
    console.debug('Received command to trim the flags')
    const knownKeysSet = new Set(Object.keys(knownKeys))

    // Trim
    result = {}
    allFlagKeys.forEach(flag => {
      if (knownKeysSet.has(flag)) {
        result[flag] = totalFlags[flag]
      }
    })

    // Reset
    if (totalFlags.reset === COMMAND_TRIM_FLAGS_AND_RESET) {
      // 1001 - and reset everything to 0
      console.debug('Received command to reset the flags')
      Object.keys(knownKeys).forEach(flag => { result[flag] = 0 })
    }
  } else if (totalFlags.reset > 0 && totalFlags.reset < 9000) {
    console.debug('Received command to reset the flags')
    allFlagKeys.forEach(flag => { result[flag] = 0 })
  }
  result.reset = 0
  return result
}

export const _doMigrations = (cache) => {
  if (!cache) return cache

  if (cache._version < VERSION) {
    console.debug('Local cached data has older version, seeing if there any migrations that can be applied')

    // no migrations right now since we only have one version
    console.debug('No migrations found')
  }

  if (cache._version > VERSION) {
    console.debug('Local cached data has newer version, seeing if there any reverse migrations that can be applied')

    // no reverse migrations right now but we leave a possibility of loading a hotpatch if need be
    if (window._PLEROMA_HOTPATCH) {
      if (window._PLEROMA_HOTPATCH.reverseMigrations) {
        console.debug('Found hotpatch migration, applying')
        return window._PLEROMA_HOTPATCH.reverseMigrations.call({}, 'serverSideStorage', { from: cache._version, to: VERSION }, cache)
      }
    }
  }

  return cache
}

export const mutations = {
  setServerSideStorage (state, userData) {
    const live = userData.storage
    state.raw = live
    let cache = state.cache

    cache = _doMigrations(cache)

    let { recent, stale, needsUpload } = _getRecentData(cache, live)

    const userNew = userData.created_at > NEW_USER_DATE
    const flagsTemplate = userNew ? newUserFlags : defaultState.flagStorage
    let dirty = false

    if (recent === null) {
      console.debug(`Data is empty, initializing for ${userNew ? 'new' : 'existing'} user`)
      recent = _wrapData({
        flagStorage: { ...flagsTemplate }
      })
    }

    if (!needsUpload && recent && stale) {
      console.debug('Checking if data needs merging...')
      // discarding timestamps and versions
      const { _timestamp: _0, _version: _1, ...recentData } = recent
      const { _timestamp: _2, _version: _3, ...staleData } = stale
      dirty = !isEqual(recentData, staleData)
      console.debug(`Data ${dirty ? 'needs' : 'doesn\'t need'} merging`)
    }

    const allFlagKeys = _getAllFlags(recent, stale)
    let totalFlags
    if (dirty) {
      // Merge the flags
      console.debug('Merging the flags...')
      totalFlags = _mergeFlags(recent, stale, allFlagKeys)
    } else {
      totalFlags = recent.flagStorage
    }

    totalFlags = _resetFlags(totalFlags)

    recent.flagStorage = totalFlags

    state.dirty = dirty || needsUpload
    state.cache = recent
    // set local timestamp to smaller one if we don't have any changes
    if (stale && recent && !state.dirty) {
      state.cache._timestamp = Math.min(stale._timestamp, recent._timestamp)
    }
    state.flagStorage = state.cache.flagStorage
  },
  setFlag (state, { flag, value }) {
    state.flagStorage[flag] = value
    state.dirty = true
  }
}

const serverSideStorage = {
  state: {
    ...cloneDeep(defaultState)
  },
  mutations,
  actions: {
    pushServerSideStorage ({ state, rootState, commit }, { force = false } = {}) {
      const needPush = state.dirty || force
      if (!needPush) return
      state.cache = _wrapData({
        flagStorage: toRaw(state.flagStorage)
      })
      const params = { pleroma_settings_store: { 'pleroma-fe': state.cache } }
      rootState.api.backendInteractor
        .updateProfile({ params })
        .then((user) => commit('setServerSideStorage', user))
      state.dirty = false
    }
  }
}

export default serverSideStorage