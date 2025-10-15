<script setup lang="ts">
const props = defineProps<{
  data: {
    text: string;
    textDisplay: boolean;
    svg: string;
    path: string;
  };
}>();
</script>

<template>
  <router-link
    :to="props.data.path"
    class="header-link"
    :class="{ plus: !props.data.textDisplay }"
  >
    <img :src="props.data.svg" />
    <p v-if="props.data.textDisplay">{{ props.data.text }}</p>
  </router-link>
</template>
