<script setup lang="ts">
import type { TypeDefaultConfig, TypeDefaultBody } from "../../../common/types";

const props = defineProps<{
  userbody: TypeDefaultBody;
  userconfig: TypeDefaultConfig;
  modelValue: "Normal" | "Athletic";
}>();

const emit = defineEmits<{'update:modelValue': [value: string]}>();

function changeAcuracy(val: string) {
  emit('update:modelValue', val);
}
</script>

<template>
  <div class="topic">
    <span></span>
    <p>How athletic</p>
    <span>are you? In 95% of cases do not change</span>
  </div>
  <div class="accuracy-options">
    <div class="option" v-for="value in props.userconfig.accuracy" @click="changeAcuracy(value)" :key="value" :class="{ active: value === modelValue }">
      {{ value }}
    </div>
  </div>
</template>