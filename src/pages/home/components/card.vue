<script setup lang="ts">
interface CardItem {
  text: string;
  time: string;
  value: number;
  measurement: string;
}

const props = defineProps<{
  card: CardItem;
}>();
</script>

<template>
  <div class="card">
    <span>{{ props.card.text }}</span>
    <p>{{ props.card.time }}</p>
    <div class="more">
      <span>{{ props.card.value }}</span>
      <p>{{ props.card.measurement }}</p>
      <img src="../../../../public/svg/arrow-more.svg" />
    </div>
  </div>
</template>
