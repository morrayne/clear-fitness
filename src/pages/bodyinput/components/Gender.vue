<script setup lang="ts">
import type { TypeDefaultConfig, TypeDefaultBody } from "../../../common/types";

const props = defineProps<{
  userbody: TypeDefaultBody;
  userconfig: TypeDefaultConfig;
  modelValue: number;
}>();

const emit = defineEmits<{'update:modelValue': [value: number]}>();

const getGenderText = (value: number): string => {
  if (value === 5) return "Male";
  if (value === -161) return "Female";
  return "Secret";
};

function changeGender(val: number) {
  emit('update:modelValue', val);
}
</script>

<template>
  <div class="topic">
    <p>What</p>
    <span>are you?</span>
  </div>
  <div class="gender-options">
    <div class="option" @click="changeGender(value)" v-for="value in props.userconfig.gender" :key="value" :class="{ active: value === modelValue }">
      {{ getGenderText(value) }}
    </div>
  </div>
</template>