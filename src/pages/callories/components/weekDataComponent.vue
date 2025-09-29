<script setup lang="ts">
interface WeekData {
  name: string;
  date: number;
  today: boolean;
  goalsFinished: number;
}

const data: WeekData[] = [
  {
    name: "m",
    date: 29,
    today: false,
    goalsFinished: 70,
  },
  {
    name: "t",
    date: 30,
    today: false,
    goalsFinished: 100,
  },
  {
    name: "w",
    date: 1,
    today: false,
    goalsFinished: 80,
  },
  {
    name: "t",
    date: 2,
    today: true,
    goalsFinished: 30,
  },
  {
    name: "f",
    date: 3,
    today: false,
    goalsFinished: 80,
  },
  {
    name: "s",
    date: 4,
    today: false,
    goalsFinished: 80,
  },
  {
    name: "s",
    date: 5,
    today: false,
    goalsFinished: 80,
  },
];
</script>

<template>
  <div class="week-holder">
    <div v-for="value in data" :key="value.date" class="item"  :class="value.today ? 'active' : ''">
      <span>{{ value.name }}</span>
      <p>{{ value.date }}</p>
    </div>
  </div>
</template>