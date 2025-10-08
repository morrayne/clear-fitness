<script setup lang="ts">
import type { HeaderLinkData } from "../../common/types";

const props = defineProps<{
  data: HeaderLinkData;
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
