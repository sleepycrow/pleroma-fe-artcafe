<template>
  <Popover
    trigger="click"
    class="ReactButton"
    placement="top"
    :offset="{ y: 5 }"
    :bound-to="{ x: 'container' }"
    remove-padding
    popover-class="ReactButton popover-default"
    @show="onShow"
    @close="onClose"
  >
    <template #content="{close}">
      <div class="reaction-picker-filter">
        <input
          v-model="filterWord"
          size="1"
          :placeholder="$t('emoji.search_emoji')"
          @input="$event.target.composing = false"
        >
      </div>
      <div class="reaction-picker">
        <span
          v-for="emoji in commonEmojis"
          :key="emoji.replacement"
          class="emoji-button"
          :title="maybeLocalizedEmojiName(emoji)"
          @click="addReaction($event, emoji.replacement, close)"
        >
          {{ emoji.replacement }}
        </span>
        <div class="reaction-picker-divider" />
        <span
          v-for="(emoji, key) in emojis"
          :key="key"
          class="emoji-button"
          :title="maybeLocalizedEmojiName(emoji)"
          @click="addReaction($event, emoji.replacement, close)"
        >
          {{ emoji.replacement }}
        </span>
        <div class="reaction-bottom-fader" />
      </div>
    </template>
    <template #trigger>
      <span
        class="button-unstyled popover-trigger"
        :title="$t('tool_tip.add_reaction')"
      >
        <FALayers>
          <FAIcon
            class="fa-scale-110 fa-old-padding"
            :icon="['far', 'smile-beam']"
          />
          <FAIcon
            v-show="!expanded"
            class="focus-marker"
            transform="shrink-6 up-9 right-17"
            icon="plus"
          />
          <FAIcon
            v-show="expanded"
            class="focus-marker"
            transform="shrink-6 up-9 right-17"
            icon="times"
          />
        </FALayers>
      </span>
    </template>
  </Popover>
</template>

<script src="./react_button.js"></script>

<style lang="scss">
@import '../../_variables.scss';
@import '../../_mixins.scss';

.ReactButton {
  .reaction-picker-filter {
    padding: 0.5em;
    display: flex;

    input {
      flex: 1;
    }
  }

  .reaction-picker-divider {
    height: 1px;
    width: 100%;
    margin: 0.5em;
    background-color: var(--border, $fallback--border);
  }

  .reaction-picker {
    width: 10em;
    height: 9em;
    font-size: 1.5em;
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;
    padding: 0.5em;
    text-align: center;
    align-content: flex-start;
    user-select: none;

    mask: linear-gradient(to top, white 0, transparent 100%) bottom no-repeat,
          linear-gradient(to bottom, white 0, transparent 100%) top no-repeat,
          linear-gradient(to top, white, white);
    transition: mask-size 150ms;
    mask-size: 100% 20px, 100% 20px, auto;

    /* Autoprefixed seem to ignore this one, and also syntax is different */
    -webkit-mask-composite: xor;
    mask-composite: exclude;

    .emoji-button {
      cursor: pointer;

      flex-basis: 20%;
      line-height: 1.5;
      align-content: center;

      &:hover {
        transform: scale(1.25);
      }
    }
  }

  /* override of popover internal stuff */
  .popover-trigger-button {
    width: auto;
  }

  .popover-trigger {
    padding: 10px;
    margin: -10px;

    &:hover .svg-inline--fa {
      color: $fallback--text;
      color: var(--text, $fallback--text);
    }

  }

  .popover-trigger-button {
    @include unfocused-style {
      .focus-marker {
        visibility: hidden;
      }
    }

    @include focused-style {
      .focus-marker {
        visibility: visible;
      }
    }
  }
}

</style>
