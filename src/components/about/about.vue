<template>
  <div class="column-inner">
    <instance-specific-panel v-if="showInstanceSpecificPanel" />
    <terms-of-service-panel />
    <staff-panel />
    <LocalBubblePanel v-if="showLocalBubblePanel" />
    <MRFTransparencyPanel />
    <features-panel v-if="showFeaturesPanel" />
  </div>
</template>

<script src="./about.js"></script>
