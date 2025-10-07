<script setup lang="ts">
const props = defineProps<{
  kcal: number;
  portionSize: number;
  carbs: number;
  fats: number;
  proteins: number;
  name: string;
  deleteBtn: boolean;
}>();
</script>

<template>
  <div class="food-item">
    <div class="left"></div>
    <div class="right">
      <div class="name">
        <span>{{ props.name }}</span>
        <p>{{ props.portionSize }} g</p>
        <button v-if="props.deleteBtn">
          <img src="../../../../public/svg/cross.svg" />
        </button>
      </div>
      <div class="info">
        <p>{{ props.kcal }} kacl</p>
        <p>{{ props.proteins }} p</p>
        <p>{{ props.carbs }} c</p>
        <p>{{ props.fats }} f</p>
      </div>
    </div>
  </div>
</template>
