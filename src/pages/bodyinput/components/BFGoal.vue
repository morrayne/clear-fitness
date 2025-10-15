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
      emit('update:modelValue', props.userconfig.bf.min);
      return;
    }
    
    let finalValue: number;
    
    if (value < props.userconfig.bf.min) {
      finalValue = props.userconfig.bf.min;
    } else if (value > props.userconfig.bf.max) {
      finalValue = props.userconfig.bf.max;
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
    inputValue.value = props.userconfig.bf.min;
  }
}
</script>

<template>
  <div class="topic">
    <span>What is your</span>
    <p>Goal BF %?</p>
  </div>
  <input
    v-model="inputValue"
    type="number"
    @blur="handleBlur"
    class="alter-input"
  />
  <CustomScale
    v-model="inputValue"
    :min="props.userconfig.bf.min"
    :max="props.userconfig.bf.max"
    :step="props.userconfig.bf.step"
    :bigStep="props.userconfig.bf.bigStep"
    :text="props.userconfig.bf.text"
    :textAlt="props.userconfig.bf.text"
    :mod="props.userconfig.bf.mod"
  />
</template>