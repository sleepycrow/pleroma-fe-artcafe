<template>
  <div>
    <div
      v-if="error"
      class="error-box"
    >
      <h3>An error occurred</h3>
      <p>{{ error }}</p>
    </div>

    <h1
      v-if="loading"
      class="loading-text"
    >
      Loading...
    </h1>

    <div
      v-if="albumData"
      class="album-timeline-panel panel panel-default"
    >
      <div class="album-timeline-heading timeline-heading panel-heading">
        <header>
          <h2>{{ albumData.title }}</h2>
          <div class="author-info">
            <router-link :to="authorProfileLink">
              <img
                :src="albumData.account.avatar"
                :alt="albumData.account.acct"
              >
              {{ ' ' }}
              {{ albumData.account.acct }}
            </router-link>
          </div>
        </header>

        <p>{{ albumData.description }}</p>
      </div>

      <Timeline
        v-if="!loading && !error"
        :title="albumTitle"
        :timeline="timeline"
        :album-id="albumId"
        :embedded="true"
        timeline-name="album"
        :footer-slipgate="footerRef"
      />

      <div
        :ref="setFooterRef"
        class="panel-footer"
      />
    </div>
  </div>
</template>

<script src="./albums_timeline.js"></script>

<style lang="scss">
.album-timeline-heading {
  height: auto;
  display: block;

  * {
    line-height: normal;
  }

  header {
    margin: 0.5rem 0 1rem 0;

    h2 {
      margin: 0.5rem 0;
    }

    .author-info img {
      width: 1rem;
      height: 1rem;
      vertical-align: middle;
      border-radius: 50%;
    }
  }

  p {
    margin: 1rem 0 0.5rem 0;
  }
}

.error-box{
  border: 1px solid rgba(204, 2, 2, 1);
  background-color: rgba(204, 2, 2, 0.5);
  padding: 6px;
}

.error-box h3 {
  text-align: center;
}

.loading-text {
  text-align: center;
  animation: loading-flashes 1s infinite;
}

@keyframes loading-flashes {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
