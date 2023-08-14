<template>
  <div class="ExtraNotifications">
    <router-link
      v-if="unreadChatCount"
      class="button-unstyled -link extra-notification"
      to="chats"
    >
      {{ $tc('notifications.unread_chats', unreadChatCount, { num: unreadChatCount }) }}
    </router-link>
    <router-link
      v-if="unreadAnnouncementCount"
      class="button-unstyled -link extra-notification"
      to="announcements"
    >
      {{ $tc('notifications.unread_announcements', unreadAnnouncementCount, { num: unreadAnnouncementCount }) }}
    </router-link>
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

  .extra-notification {
    width: 100%;
    padding: 1em;
  }

  .extra-notification {
    border-bottom: 1px solid;
    border-color: $fallback--border;
    border-color: var(--border, $fallback--border);
  }
}
</style>
