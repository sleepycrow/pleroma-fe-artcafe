import { showDesktopNotification as swDesktopNotification } from '../sw/sw.js'

export const showDesktopNotification = (rootState, desktopNotificationOpts) => {
  if (!('Notification' in window && window.Notification.permission === 'granted')) return
  if (rootState.statuses.notifications.desktopNotificationSilence) { return }

  swDesktopNotification(desktopNotificationOpts)
}
