<template>
  <div class="ExtraNotifications">
    <div class="notification unseen">
      <div class="notification-overlay"></div>
      <router-link
        v-if="shouldShowChats"
        class="button-unstyled -link extra-notification"
        :to="{ name: 'chats', params: { username: currentUser.screen_name } }"
      >
        <FAIcon
          fixed-width
          class="fa-scale-110 icon"
          icon="comments"
        />
        {{ $tc('notifications.unread_chats', unreadChatCount, { num: unreadChatCount }) }}
      </router-link>
    </div>
    <div class="notification unseen">
      <div class="notification-overlay"></div>
      <router-link
        v-if="shouldShowAnnouncements"
        class="button-unstyled -link extra-notification"
        :to="{ name: 'announcements' }"
      >
        <FAIcon
          fixed-width
          class="fa-scale-110 icon"
          icon="bullhorn"
        />
        {{ $tc('notifications.unread_announcements', unreadAnnouncementCount, { num: unreadAnnouncementCount }) }}
      </router-link>
    </div>
    <div class="notification unseen">
      <div class="notification-overlay"></div>
      <router-link
        v-if="shouldShowFollowRequests"
        class="button-unstyled -link extra-notification"
        :to="{ name: 'friend-requests' }"
      >
        <FAIcon
          fixed-width
          class="fa-scale-110 icon"
          icon="user-plus"
        />
        {{ $tc('notifications.unread_follow_requests', followRequestCount, { num: followRequestCount }) }}
      </router-link>
    </div>
    <i18n-t
      v-if="shouldShowCustomizationTip"
      tag="span"
      class="notification tip extra-notification"
      keypath="notifications.configuration_tip"
    >
      <template #theSettings>
        <button
          class="button-unstyled -link"
          @click="openNotificationSettings"
        >
          {{ $t('notifications.configuration_tip_settings') }}
        </button>
      </template>
      <template #dismiss>
        <button
          class="button-unstyled -link"
          @click="dismissConfigurationTip"
        >
          {{ $t('notifications.configuration_tip_dismiss') }}
        </button>
      </template>
    </i18n-t>
  </div>
</template>

<script src="./extra_notifications.js" />

<style lang="scss">
@import "../../variables";

.ExtraNotifications {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  .notification {
    width: 100%;
    border-bottom: 1px solid;
    border-color: $fallback--border;
    border-color: var(--border, $fallback--border);
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .extra-notification {
    padding: 1em;
  }

  .icon {
    margin-right: 0.5em;
  }

  .tip {
    display: inline;
  }
}
</style>
