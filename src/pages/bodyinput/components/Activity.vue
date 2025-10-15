<script setup lang="ts">
import type { TypeDefaultConfig, TypeDefaultBody } from "../../../common/types";

const props = defineProps<{
  userbody: TypeDefaultBody;
  userconfig: TypeDefaultConfig;
  modelValue: number;
}>();

const emit = defineEmits<{'update:modelValue': [value: number]}>();

const getActivityText = (value: number): string => {
  if (value === 1.2) return "Minimum action";
  if (value === 1.275) return "Walking usually";
  if (value === 1.375) return "Low activity";
  if (value === 1.55) return "Average activity";
  if (value === 1.725) return "High activity";
  return "Extreme";
};

function changeGender(val: number) {
  emit('update:modelValue', val);
}
</script>

<template>
  <div class="topic">
    <span>What is your</span>
    <p>Daily Activity?</p>
  </div>
  <div class="activity-options">
    <div class="option" @click="changeGender(value)" v-for="value in props.userconfig.activity" :key="value" :class="{ active: value === modelValue }">
      {{ getActivityText(value) }}
    </div>
  </div>
</template>