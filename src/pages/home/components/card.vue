<script setup lang="ts">
interface CardItem {
  textEN: string;
  textRU: string;
  timeEN: string;
  timeRU: string;
  value: number;
  measurement: string;
}

const props = defineProps<{
  card: CardItem;
}>();
</script>

<template>
  <div class="card">
    <span>{{ props.card.textEN }}</span>
    <p>{{ props.card.timeEN }}</p>
    <div class="more">
      <span>{{ props.card.value }}</span>
      <p>{{ props.card.measurement }}</p>
      <img src="../../../../public/svg/arrow-more.svg" />
    </div>
  </div>
</template>
