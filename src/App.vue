<script setup lang="ts">
import { useRoute } from "vue-router";
import headerComponent from "./header/header.vue";
const route = useRoute();
</script>

<template>
  <headerComponent v-if="route.meta.header" />
  <router-view />
</template>
