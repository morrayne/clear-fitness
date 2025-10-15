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
      emit('update:modelValue', props.userconfig.age.min);
      return;
    }
    
    let finalValue: number;
    
    if (value < props.userconfig.age.min) {
      finalValue = props.userconfig.age.min;
    } else if (value > props.userconfig.age.max) {
      finalValue = props.userconfig.age.max;
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
    inputValue.value = props.userconfig.age.min;
  }
}
</script>

<template>
  <div class="topic">
    <span>How</span>
    <p>Old</p>
    <span>are you?</span>
  </div>
  <input
    v-model="inputValue"
    type="number"
    @blur="handleBlur"
    class="alter-input"
  />
  <CustomScale
    v-model="inputValue"
    :min="props.userconfig.age.min"
    :max="props.userconfig.age.max"
    :step="props.userconfig.age.step"
    :bigStep="props.userconfig.age.bigStep"
    :text="props.userconfig.age.text"
    :textAlt="props.userconfig.age.text"
    :mod="props.userconfig.age.mod"
  />
</template>