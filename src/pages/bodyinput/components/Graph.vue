<script setup lang="ts">
import type { TypeMacro } from "../../../common/types";

const props = defineProps<{
  data: TypeMacro;
}>();

const all = props.data.proteins + props.data.carbs + props.data.fats;

function getHeight(macro: keyof TypeMacro): string {
  const value = props.data[macro];
  const percentage = (value / all) * 100;
  return `${percentage.toFixed(1)}%`;
}
</script>

<template>
  <div class="kcal">
    {{ props.data.kcal }} k
  </div>
  <div class="pcf">
    <div class="p" :style="{ height: getHeight('proteins') }">
        {{ props.data.proteins }} p
    </div>
    <div class="c" :style="{ height: getHeight('carbs') }">
        {{ props.data.carbs }} c
    </div>
    <div class="f" :style="{ height: getHeight('fats') }">
        {{ props.data.fats }} f
    </div>
  </div>
</template>