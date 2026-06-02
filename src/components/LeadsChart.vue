<script setup lang="ts">
import { onMounted, watch } from "vue";
import Chart, { Chart as TChart } from "chart.js/auto";
import UnavailableIcon from "@bitrix24/b24icons-vue/main/UnavailableIcon";

interface ILeadsChartProps {
  datasets: any[];
  labels: string[];
  dateStart: string;
  dateEnd: string;
}

const props = defineProps<ILeadsChartProps>();

let chartInstance: TChart | null = null;
const toast = useToast();

onMounted(async () => {
  const ctx = document.getElementById("leads-chart");

  if (!ctx) {
    toast.add({
      title: "Ошибка рендеринга",
      color: "air-primary-alert",
      icon: UnavailableIcon,
    });
    return;
  }

  chartInstance = new Chart(ctx as HTMLCanvasElement, {
    type: "bar",
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
});

watch([() => props.datasets, () => props.labels], () => {
  if (!chartInstance) {
    return;
  }

  chartInstance.data.labels = props.labels;
  chartInstance.data.datasets = props.datasets;
  chartInstance.update();
});
</script>

<template>
  <canvas id="leads-chart" width="1200" height="400"></canvas>
</template>

<style scoped></style>
