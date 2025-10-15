<script setup lang="ts">
import type { TypeDefaultConfig, TypeDefaultBody } from "../../../common/types";
import CustomScale from "./CustomScale.vue";
import { computed } from 'vue';

const props = defineProps<{
  userbody: TypeDefaultBody;
  userconfig: TypeDefaultConfig;
  modelValue: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>();

// Вычисляемое свойство для input с валидацией
const inputValue = computed({
  get: () => props.modelValue,
  set: (value: number) => {
    // Если значение пустое, NaN или не число - используем минимальное
    if (value === null || value === undefined || isNaN(value)) {
      emit('update:modelValue', props.userconfig.height.min);
      return;
    }
    
    let finalValue: number;
    
    if (value < props.userconfig.height.min) {
      finalValue = props.userconfig.height.min;
    } else if (value > props.userconfig.height.max) {
      finalValue = props.userconfig.height.max;
    } else {
      finalValue = Number(value.toFixed(1));
    }
    
    emit('update:modelValue', finalValue);
  }
});

function handleBlur(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.valueAsNumber;
  if (isNaN(value)) {
    inputValue.value = props.userconfig.height.min;
  }
}
</script>

<template>
  <div class="topic">
    <span>What is your</span>
    <p>Current height?</p>
  </div>
  <input
    v-model="inputValue"
    type="number"
    @blur="handleBlur"
    class="alter-input"
  />
  <CustomScale
    v-model="inputValue"
    :min="props.userconfig.height.min"
    :max="props.userconfig.height.max"
    :step="props.userconfig.height.step"
    :bigStep="props.userconfig.height.bigStep"
    :text="props.userconfig.height.text"
    :textAlt="props.userconfig.height.textAlt"
    :mod="props.userconfig.height.mod"
  />
</template>