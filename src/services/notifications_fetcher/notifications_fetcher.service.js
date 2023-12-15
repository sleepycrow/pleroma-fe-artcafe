import apiService from '../api/api.service.js'
import { promiseInterval } from '../promise_interval/promise_interval.js'

// For using include_types when fetching notifications.
// Note: chat_mention excluded as pleroma-fe polls them separately
const mastoApiNotificationTypes = [
  'mention',
  'favourite',
  'reblog',
  'follow',
  'move',
  'pleroma:emoji_reaction',
  'pleroma:report'
]

const update = ({ store, notifications, older }) => {
  store.dispatch('addNewNotifications', { notifications, older })
}

const fetchAndUpdate = ({ store, credentials, older = false, since }) => {
  const args = { credentials }
  const { getters } = store
  const rootState = store.rootState || store.state
  const timelineData = rootState.notifications
  const hideMutedPosts = getters.mergedConfig.hideMutedPosts

  args.includeTypes = mastoApiNotificationTypes
  args.withMuted = !hideMutedPosts

  args.timeline = 'notifications'
  if (older) {
    if (timelineData.minId !== Number.POSITIVE_INFINITY) {
      args.until = timelineData.minId
    }
    return fetchNotifications({ store, args, older })
  } else {
    // fetch new notifications
    if (since === undefined && timelineData.maxId !== Number.POSITIVE_INFINITY) {
      args.since = timelineData.maxId
    } else if (since !== null) {
      args.since = since
    }
    const result = fetchNotifications({ store, args, older })

    // If there's any unread notifications, try fetch notifications since
    // the newest read notification to check if any of the unread notifs
    // have changed their 'seen' state (marked as read in another session), so
    // we can update the state in this session to mark them as read as well.
    // The normal maxId-check does not tell if older notifications have changed
    const notifications = timelineData.data
    const readNotifsIds = notifications.filter(n => n.seen).map(n => n.id)
    const unreadNotifsIds = notifications.filter(n => !n.seen).map(n => n.id)
    if (readNotifsIds.length > 0 && readNotifsIds.length > 0) {
      const minId = Math.min(...unreadNotifsIds) // Oldest known unread notification
      if (minId !== Infinity) {
        args.since = false // Don't use since_id since it sorta conflicts with min_id
        args.minId = minId - 1 // go beyond
        fetchNotifications({ store, args, older })
      }
    }

    return result
  }
}

const fetchNotifications = ({ store, args, older }) => {
  return apiService.fetchTimeline(args)
    .then((response) => {
      if (response.errors) {
        throw new Error(`${response.status} ${response.statusText}`)
      }
      const notifications = response.data
      update({ store, notifications, older })
      return notifications
    })
    .catch((error) => {
      store.dispatch('pushGlobalNotice', {
        level: 'error',
        messageKey: 'notifications.error',
        messageArgs: [error.message],
        timeout: 5000
      })
      console.error(error)
    })
}

const startFetching = ({ credentials, store }) => {
  // Initially there's set flag to silence all desktop notifications so
  // that there won't spam of them when user just opened up the FE we
  // reset that flag after a while to show new notifications once again.
  setTimeout(() => store.dispatch('setNotificationsSilence', false), 10000)
  const boundFetchAndUpdate = () => fetchAndUpdate({ credentials, store })
  boundFetchAndUpdate()
  return promiseInterval(boundFetchAndUpdate, 10000)
}

const notificationsFetcher = {
  fetchAndUpdate,
  startFetching
}

export default notificationsFetcher
