import * as NotificationUtils from 'src/services/notification_utils/notification_utils.js'

describe('NotificationUtils', () => {
  describe('filteredNotificationsFromStore', () => {
    it('should return sorted notifications with configured types', () => {
      const store = {
        state: {
          notifications: {
            data: [
              {
                id: 1,
                action: { id: '1' },
                type: 'like'
              },
              {
                id: 2,
                action: { id: '2' },
                type: 'mention'
              },
              {
                id: 3,
                action: { id: '3' },
                type: 'repeat'
              }
            ]
          }
        },
        getters: {
          mergedConfig: {
            notificationVisibility: {
              likes: true,
              repeats: true,
              mentions: false
            }
          }
        }
      }
      const expected = [
        {
          action: { id: '3' },
          id: 3,
          type: 'repeat'
        },
        {
          action: { id: '1' },
          id: 1,
          type: 'like'
        }
      ]
      expect(NotificationUtils.filteredNotificationsFromStore(store)).to.eql(expected)
    })
  })

  describe('unseenNotificationsFromStore', () => {
    it('should return only notifications not marked as seen', () => {
      const store = {
        state: {
          notifications: {
            data: [
              {
                action: { id: '1' },
                type: 'like',
                seen: false
              },
              {
                action: { id: '2' },
                type: 'mention',
                seen: true
              }
            ]
          }
        },
        getters: {
          mergedConfig: {
            notificationVisibility: {
              likes: true,
              repeats: true,
              mentions: false
            }
          }
        }
      }
      const expected = [
        {
          action: { id: '1' },
          type: 'like',
          seen: false
        }
      ]
      expect(NotificationUtils.unseenNotificationsFromStore(store)).to.eql(expected)
    })
  })
})
