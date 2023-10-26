import { showDesktopNotification as swDesktopNotification, isSWSupported } from '../sw/sw.js'
const state = { failCreateNotif: false }

export const showDesktopNotification = (rootState, desktopNotificationOpts) => {
  if (!('Notification' in window && window.Notification.permission === 'granted')) return
  if (rootState.statuses.notifications.desktopNotificationSilence) { return }

  if (isSWSupported()) {
    swDesktopNotification(desktopNotificationOpts)
  } else if (!state.failCreateNotif) {
    try {
      const desktopNotification = new window.Notification(desktopNotificationOpts.title, desktopNotificationOpts)
      setTimeout(desktopNotification.close.bind(desktopNotification), 5000)
    } catch {
      state.failCreateNotif = true
    }
  }
}
