/* eslint-env serviceworker */

import localForage from 'localforage'
import { parseNotification } from './services/entity_normalizer/entity_normalizer.service.js'
import { prepareNotificationObject } from './services/notification_utils/notification_utils.js'
import { createI18n } from 'vue-i18n'
import messages from './i18n/service_worker_messages.js'

const i18n = createI18n({
  // By default, use the browser locale, we will update it if neccessary
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

const state = {
  lastFocused: null,
  notificationIds: new Set()
}

function getWindowClients () {
  return clients.matchAll({ includeUncontrolled: true })
    .then((clientList) => clientList.filter(({ type }) => type === 'window'))
}

const setLocale = async () => {
  const state = await localForage.getItem('vuex-lz')
  const locale = state.config.interfaceLanguage || 'en'
  i18n.locale = locale
}

const showPushNotification = async (event) => {
  const activeClients = await getWindowClients()
  await setLocale()
  // Only show push notifications if all tabs/windows are closed
  if (activeClients.length === 0) {
    const data = event.data.json()

    const url = `${self.registration.scope}api/v1/notifications/${data.notification_id}`
    const notification = await fetch(url, { headers: { Authorization: 'Bearer ' + data.access_token } })
    const notificationJson = await notification.json()
    const parsedNotification = parseNotification(notificationJson)

    const res = prepareNotificationObject(parsedNotification, i18n)

    self.registration.showNotification(res.title, res)
  }
}

self.addEventListener('push', async (event) => {
  console.log(event)
  if (event.data) {
    event.waitUntil(showPushNotification(event))
  }
})

self.addEventListener('message', async (event) => {
  const { type, content } = event.data

  if (type === 'desktopNotification') {
    const { title, ...rest } = content
    const { tag } = rest
    if (state.notificationIds.has(tag)) return
    state.notificationIds.add(tag)
    setTimeout(() => state.notificationIds.delete(tag), 10000)
    self.registration.showNotification(title, rest)
  }

  if (type === 'desktopNotificationClose') {
    const { id, all } = content
    const search = all ? null : { tag: id }
    const notifications = await self.registration.getNotifications(search)
    notifications.forEach(n => n.close())
  }

  if (type === 'updateFocus') {
    state.lastFocused = event.source.id

    const notifications = await self.registration.getNotifications()
    notifications.forEach(n => n.close())
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(getWindowClients().then((list) => {
    for (let i = 0; i < list.length; i++) {
      const client = list[i]
      client.postMessage({ type: 'notificationClicked', id: event.notification.tag })
    }

    for (let i = 0; i < list.length; i++) {
      const client = list[i]
      if (state.lastFocused === null || client.id === state.lastFocused) {
        if ('focus' in client) return client.focus()
      }
    }

    if (clients.openWindow) return clients.openWindow('/')
  }))
})
