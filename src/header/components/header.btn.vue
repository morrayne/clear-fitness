<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <router-link :to="props.data.path" class="header-link">
    <img :src="props.data.svg" />
    <span>{{ props.data.textEN }}</span>
  </router-link>
</template>
