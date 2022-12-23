<template>
  <div
    ref="root"
    class="emoji-input"
    :class="{ 'with-picker': !hideEmojiButton }"
  >
    <slot />
    <!-- TODO: make the 'x' disappear if at the end maybe? -->
    <div
      ref="hiddenOverlay"
      class="hidden-overlay"
      :style="overlayStyle"
    >
      <span>{{ preText }}</span>
      <span
        ref="hiddenOverlayCaret"
        class="caret"
      >x</span>
      <span>{{ postText }}</span>
    </div>
    <template v-if="enableEmojiPicker">
      <button
        v-if="!hideEmojiButton"
        class="button-unstyled emoji-picker-icon"
        type="button"
        @click.prevent="togglePicker"
      >
        <FAIcon :icon="['far', 'smile-beam']" />
      </button>
      <EmojiPicker
        v-if="enableEmojiPicker"
        ref="picker"
        :enable-sticker-picker="enableStickerPicker"
        class="emoji-picker-panel"
        @emoji="insert"
        @sticker-uploaded="onStickerUploaded"
        @sticker-upload-failed="onStickerUploadFailed"
        @show="onPickerShown"
        @close="onPickerClosed"
      />
    </template>
    <Popover
      ref="suggestorPopover"
      class="autocomplete-panel"
      placement="bottom"
    >
      <template #content>
        <div
          ref="panel-body"
          class="autocomplete-panel-body"
        >
          <div
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="autocomplete-item"
            :class="{ highlighted: index === highlighted }"
            @click.stop.prevent="onClick($event, suggestion)"
          >
            <span class="image">
              <img
                v-if="suggestion.img"
                :src="suggestion.img"
              >
              <span v-else>{{ suggestion.replacement }}</span>
            </span>
            <div class="label">
              <span
                v-if="suggestion.user"
                class="displayText"
              >
                {{ suggestion.displayText }}<UnicodeDomainIndicator
                  :user="suggestion.user"
                  :at="false"
                />
              </span>
              <span
                v-if="!suggestion.user"
                class="displayText"
              >
                {{ maybeLocalizedEmojiName(suggestion) }}
              </span>
              <span class="detailText">{{ suggestion.detailText }}</span>
            </div>
          </div>
        </div>
      </template>
    </Popover>
  </div>
</template>

<script src="./emoji_input.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.emoji-input {
  display: flex;
  flex-direction: column;
  position: relative;

  &.with-picker input {
    padding-right: 30px;
  }

  .emoji-picker-icon {
    position: absolute;
    top: 0;
    right: 0;
    margin: .2em .25em;
    font-size: 1.3em;
    cursor: pointer;
    line-height: 24px;

    &:hover i {
      color: $fallback--text;
      color: var(--text, $fallback--text);
    }
  }

  .emoji-picker-panel {
    position: absolute;
    z-index: 20;
    margin-top: 2px;

    &.hide {
      display: none
    }
  }

  input, textarea {
    flex: 1 0 auto;
  }

  .hidden-overlay {
    opacity: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    overflow: hidden;
    /* DEBUG STUFF */
    color: red;
    /* set opacity to non-zero to see the overlay */

    .caret {
      width: 0;
      margin-right: calc(-1ch - 1px);
      border: 1px solid red;
    }
  }
}
.autocomplete {
  &-panel {
    position: absolute;
  }

  &-item {
    display: flex;
    cursor: pointer;
    padding: 0.2em 0.4em;
    border-bottom: 1px solid rgba(0, 0, 0, 0.4);
    height: 32px;

    .image {
      width: 32px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      font-size: 32px;

      margin-right: 4px;

      img {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }
    }

    .label {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 0 0.1em 0 0.2em;

      .displayText {
        line-height: 1.5;
      }

      .detailText {
        font-size: 9px;
        line-height: 9px;
      }
    }

    &.highlighted {
      background-color: $fallback--fg;
      background-color: var(--selectedMenuPopover, $fallback--fg);
      color: var(--selectedMenuPopoverText, $fallback--text);
      --faint: var(--selectedMenuPopoverFaintText, $fallback--faint);
      --faintLink: var(--selectedMenuPopoverFaintLink, $fallback--faint);
      --lightText: var(--selectedMenuPopoverLightText, $fallback--lightText);
      --icon: var(--selectedMenuPopoverIcon, $fallback--icon);
    }
  }
}
</style>
