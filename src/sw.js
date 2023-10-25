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
  console.log(event)

  if (type === 'desktopNotification') {
    const { title, body, icon, id } = content
    if (state.notificationIds.has(id)) return
    state.notificationIds.add(id)
    setTimeout(() => state.notificationIds.remove(id), 10000)
    self.registration.showNotification('SWTEST:  ' + title, { body, icon })
  }

  if (type === 'updateFocus') {
    state.lastFocused = event.source.id
    console.log(state)
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(getWindowClients().then((list) => {
    for (let i = 0; i < list.length; i++) {
      const client = list[i]
      if (state.lastFocused === null || client.id === state.lastFocused) {
        if ('focus' in client) return client.focus()
      }
    }

    if (clients.openWindow) return clients.openWindow('/')
  }))
})
