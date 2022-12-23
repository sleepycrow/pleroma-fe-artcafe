<template>
  <Popover
    ref="popover"
    trigger="click"
    popover-class="emoji-picker popover-default"
    @show="onPopoverShown"
    @close="onPopoverClosed"
  >
    <template #content>
      <div class="heading">
        <span
          ref="header"
          class="emoji-tabs"
        >
          <span
            v-for="group in filteredEmojiGroups"
            :ref="setGroupRef('group-header-' + group.id)"
            :key="group.id"
            class="emoji-tabs-item"
            :class="{
              active: activeGroupView === group.id
            }"
            :title="group.text"
            @click.prevent="highlight(group.id)"
          >
            <span
              v-if="group.image"
              class="emoji-picker-header-image"
            >
              <still-image
                :alt="group.text"
                :src="group.image"
              />
            </span>
            <FAIcon
              v-else
              :icon="group.icon"
              fixed-width
            />
          </span>
        </span>
        <span
          v-if="stickerPickerEnabled"
          class="additional-tabs"
        >
          <span
            class="stickers-tab-icon additional-tabs-item"
            :class="{active: showingStickers}"
            :title="$t('emoji.stickers')"
            @click.prevent="toggleStickers"
          >
            <FAIcon
              icon="sticky-note"
              fixed-width
            />
          </span>
        </span>
      </div>
      <div
        v-if="contentLoaded"
        class="content"
      >
        <div
          class="emoji-content"
          :class="{hidden: showingStickers}"
        >
          <div class="emoji-search">
            <input
              ref="search"
              v-model="keyword"
              type="text"
              class="form-control"
              :placeholder="$t('emoji.search_emoji')"
              @input="$event.target.composing = false"
            >
          </div>
          <div
            ref="emoji-groups"
            class="emoji-groups"
            :class="groupsScrolledClass"
            @scroll="onScroll"
          >
            <div
              v-for="group in filteredEmojiGroups"
              :key="group.id"
              class="emoji-group"
            >
              <h6
                :ref="setGroupRef('group-' + group.id)"
                class="emoji-group-title"
              >
                {{ group.text }}
              </h6>
              <span
                v-for="emoji in group.emojis"
                :key="group.id + emoji.displayText"
                :title="maybeLocalizedEmojiName(emoji)"
                class="emoji-item"
                @click.stop.prevent="onEmoji(emoji)"
              >
                <span
                  v-if="!emoji.imageUrl"
                  class="emoji-picker-emoji -unicode"
                >{{ emoji.replacement }}</span>
                <still-image
                  v-else
                  :ref="setEmojiRef(group.id + emoji.displayText)"
                  class="emoji-picker-emoji -custom"
                  :data-src="emoji.imageUrl"
                  :data-emoji-name="group.id + emoji.displayText"
                />
              </span>
              <span :ref="setGroupRef('group-end-' + group.id)" />
            </div>
          </div>
          <div class="keep-open">
            <Checkbox v-model="keepOpen">
              {{ $t('emoji.keep_open') }}
            </Checkbox>
          </div>
        </div>
        <div
          v-if="showingStickers"
          class="stickers-content"
        >
          <sticker-picker
            @uploaded="onStickerUploaded"
            @upload-failed="onStickerUploadFailed"
          />
        </div>
      </div>
    </template>
  </Popover>
</template>

<script src="./emoji_picker.js"></script>
<style lang="scss" src="./emoji_picker.scss"></style>
