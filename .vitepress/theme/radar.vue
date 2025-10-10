<script setup>
import { ref } from 'vue'

const radarUrl = ref('./radar.html')

function onIframeLoad() {
  console.log('Technology radar loaded successfully')
}
</script>

<template>
  <div class="tech-radar-container">
    <iframe
      :src="radarUrl"
      width="100%"
      height="800"
      frameborder="0"
      title="Canon Technology Radar"
      @load="onIframeLoad"
    />
  </div>
</template>

<style scoped>
.tech-radar-container {
  width: 100%;
  min-height: 800px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.tech-radar-container iframe {
  display: block;
  border: none;
}
</style>
