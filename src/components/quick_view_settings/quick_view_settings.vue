<template>
  <Popover
    trigger="click"
    class="QuickViewSettings"
    :bound-to="{ x: 'container' }"
    :trigger-attrs="{ title: $t('timeline.quick_view_settings') }"
  >
    <template #content>
      <div class="dropdown-menu">
        <button
          class="button-default dropdown-item"
          @click="conversationDisplay = 'tree'"
        >
          <span
            class="menu-checkbox -radio"
            :class="{ 'menu-checkbox-checked': conversationDisplay === 'tree' }"
          /><FAIcon icon="folder-tree" /> {{ $t('settings.conversation_display_tree_quick') }}
        </button>
        <button
          class="button-default dropdown-item"
          @click="conversationDisplay = 'linear'"
        >
          <span
            class="menu-checkbox -radio"
            :class="{ 'menu-checkbox-checked': conversationDisplay === 'linear' }"
          /><FAIcon icon="list" /> {{ $t('settings.conversation_display_linear_quick') }}
        </button>
        <div
          role="separator"
          class="dropdown-divider"
        />
        <button
          class="button-default dropdown-item"
          @click="showUserAvatars = !showUserAvatars"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': showUserAvatars }"
          />{{ $t('settings.mention_link_show_avatar_quick') }}
        </button>
        <button
          v-if="!conversation"
          class="button-default dropdown-item"
          @click="autoUpdate = !autoUpdate"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': autoUpdate }"
          />{{ $t('settings.auto_update') }}
        </button>
        <button
          v-if="!conversation"
          class="button-default dropdown-item"
          @click="collapseWithSubjects = !collapseWithSubjects"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': collapseWithSubjects }"
          />{{ $t('settings.collapse_subject') }}
        </button>
        <button
          class="button-default dropdown-item dropdown-item-icon"
          @click="openTab('general')"
        >
          <FAIcon icon="wrench" />{{ $t('settings.more_settings') }}
        </button>
      </div>
    </template>
    <template #trigger>
      <FAIcon icon="bars" />
    </template>
  </Popover>
</template>

<script src="./quick_view_settings.js"></script>
