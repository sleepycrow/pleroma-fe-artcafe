import apiService, { getMastodonSocketURI, ProcessedWS } from '../api/api.service.js'
import timelineFetcher from '../timeline_fetcher/timeline_fetcher.service.js'
import notificationsFetcher from '../notifications_fetcher/notifications_fetcher.service.js'
import followRequestFetcher from '../../services/follow_request_fetcher/follow_request_fetcher.service'
import listsFetcher from '../../services/lists_fetcher/lists_fetcher.service.js'
import albumsFetcher from '../albums_fetcher/albums_fetcher.service.js'

const backendInteractorService = credentials => ({
  startFetchingTimeline ({ timeline, store, userId = false, listId = false, albumId = false, tag }) {
    return timelineFetcher.startFetching({ timeline, store, credentials, userId, listId, albumId, tag })
  },

  fetchTimeline (args) {
    return timelineFetcher.fetchAndUpdate({ ...args, credentials })
  },

  startFetchingNotifications ({ store }) {
    return notificationsFetcher.startFetching({ store, credentials })
  },

  fetchNotifications (args) {
    return notificationsFetcher.fetchAndUpdate({ ...args, credentials })
  },

  startFetchingFollowRequests ({ store }) {
    return followRequestFetcher.startFetching({ store, credentials })
  },

  startFetchingLists ({ store }) {
    return listsFetcher.startFetching({ store, credentials })
  },

  startFetchingAlbums ({ store }) {
    return albumsFetcher.startFetching({ store, credentials })
  },

  startUserSocket ({ store }) {
    const serv = store.rootState.instance.server.replace('http', 'ws')
    const url = serv + getMastodonSocketURI({ credentials, stream: 'user' })
    return ProcessedWS({ url, id: 'User' })
  },

  ...Object.entries(apiService).reduce((acc, [key, func]) => {
    return {
      ...acc,
      [key]: (args) => func({ credentials, ...args })
    }
  }, {}),

  verifyCredentials: apiService.verifyCredentials
})

export default backendInteractorService
