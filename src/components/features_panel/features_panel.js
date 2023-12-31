import fileSizeFormatService from '../../services/file_size_format/file_size_format.js'

const FeaturesPanel = {
  computed: {
    shout: function () { return this.$store.state.instance.shoutAvailable },
    pleromaChatMessages: function () { return this.$store.state.instance.pleromaChatMessagesAvailable },
    gopher: function () { return this.$store.state.instance.gopherAvailable },
    whoToFollow: function () { return this.$store.state.instance.suggestionsEnabled },
    mediaProxy: function () { return this.$store.state.instance.mediaProxyAvailable },
    minimalScopesMode: function () { return this.$store.state.instance.minimalScopesMode },
    textlimit: function () { return this.$store.state.instance.textlimit },
    uploadlimit: function () { return fileSizeFormatService.fileSizeFormat(this.$store.state.instance.uploadlimit) },
    albums: function () { return this.$store.state.instance.albumsAvailable },
    bubbleTimeline: function () { return this.$store.state.instance.bubbleTimelineAvailable }
  }
}

export default FeaturesPanel
