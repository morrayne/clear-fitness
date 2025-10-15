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
      emit('update:modelValue', props.userconfig.weight.min);
      return;
    }
    
    let finalValue: number;
    
    if (value < props.userconfig.weight.min) {
      finalValue = props.userconfig.weight.min;
    } else if (value > props.userconfig.weight.max) {
      finalValue = props.userconfig.weight.max;
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
    inputValue.value = props.userconfig.weight.min;
  }
}
</script>

<template>
  <div class="topic">
    <span>What is your</span>
    <p>Goal body weight?</p>
  </div>
  <input
    v-model="inputValue"
    type="number"
    @blur="handleBlur"
    class="alter-input"
  />
  <CustomScale
    v-model="inputValue"
    :min="props.userconfig.weight.min"
    :max="props.userconfig.weight.max"
    :step="props.userconfig.weight.step"
    :bigStep="props.userconfig.weight.bigStep"
    :text="props.userconfig.weight.text"
    :textAlt="props.userconfig.weight.textAlt"
    :mod="props.userconfig.weight.mod"
  />
</template>