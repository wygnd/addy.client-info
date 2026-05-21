<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

export interface IBarProps<T = any> {
  data: IBarData<T>;
  options: Record<string, any>;
}

export interface IBarData<T = any> {
  labels: string[];
  datasets: T[];
}

defineProps<IBarProps>();
</script>

<template>
  <Bar id="my-chart" :options="options" :data="data" />
</template>

<style scoped></style>
