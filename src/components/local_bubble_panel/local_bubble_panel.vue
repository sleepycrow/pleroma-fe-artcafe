<template>
  <div class="local-bubble-panel">
    <div class="panel panel-default base01-background">
      <div class="panel-heading timeline-heading base02-background base04">
        <div class="title">
          {{ $t('about.local_bubble_instances') }}
        </div>
      </div>
      <div class="panel-body local-bubble-panel">
        <p>{{ $t('about.bubble_instance_info') }}</p>

        <ul>
          <li
            v-for="instance in localBubbleInstances"
            :key="instance"
          >
            <a
              target="_blank"
              :href="'https://' + instance"
            >
              {{ instance }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script src="./local_bubble_panel.js"></script>

<style lang="scss">
  .local-bubble-panel {
    padding: 0.1px;

    p {
      /* why is pleroma making me do this??? */
      padding: 0;
      margin: 1rem;
    }

    ul {
      padding: 0 1rem;
      list-style-type: none;
    }

    li {
      display: inline-block;
      margin: 0 0.5rem 0.5rem 0;

      a {
        display: inline-block;
        padding: 0.5rem;
        background-color: var(--faintLink);
        border-radius: 4px;
      }
    }
  }
</style>
