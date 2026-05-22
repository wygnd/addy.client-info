<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { LoggerInterface, SdkError } from "@bitrix24/b24jssdk";
import { useBitrixStore } from "../store/bitrix-store.ts";
import LeadsChart from "./LeadsChart.vue";
import { useDebounceFn } from "@vueuse/core";
import { useFetch } from "../composables/use-fetch.ts";
import UnavailableIcon from "@bitrix24/b24icons-vue/main/UnavailableIcon";

interface IStatDataItem {
  user_id: string;
  count_leads: number;
  username: string;
}

interface IStatData {
  label: string;
  name: string;
  items: IStatDataItem[];
}

interface IStatResponse {
  request_date: string;
  data: IStatData[];
  timestamp: number;
}

const bitrixStore = useBitrixStore();
const toast = useToast();

const date = ref<string>("");
const chartLabels = ref<string[]>([]);
const chartDatasets = ref<any[]>([]);
const loading = ref<boolean>(false);

onMounted(async () => {
  try {
    await bitrixStore.init();

    await loadData(date.value);
  } catch (e) {
    let messageError = "Неизвестная ошибка";
    let loggerType: keyof LoggerInterface = "error";

    if (e instanceof SdkError) {
      messageError = "Ошибка подключения";
    }

    if (e instanceof TypeError) {
      messageError = e.message;
      loggerType = "warning";
    }

    await bitrixStore.logger[loggerType](messageError, { error: e });
  }
});

onUnmounted(() => {
  bitrixStore.destroy();
});

const debouncedChangeInput = useDebounceFn(async (value: unknown) => {
  await loadData(value as string);
}, 0);

const loadData = async (date: string) => {
  loading.value = true;
  try {
    const { error, data } = await useFetch<IStatResponse>(
      `/v1/users/statistics/leads?date=${date}`,
    );

    if (error) {
      toast.add({
        title: "Ошибка при отправке запроса",
        description: error,
        color: "air-primary-alert",
        icon: UnavailableIcon,
      });
      return;
    }

    if (!data) {
      toast.add({
        title: "Ошибка получения данных",
        description: "Сервер вернул пустой результат",
        color: "air-primary-alert",
        icon: UnavailableIcon,
      });

      return;
    }

    let labels = new Map<string, string>();
    let datasets: any[] = [];

    data.data.forEach(({ label, name, items }) => {
      let backgroundColor: string;

      switch (name) {
        case "leads":
          backgroundColor = "#3b80c4";
          break;

        case "leads_converted":
          backgroundColor = "#28b128";
          break;

        default:
          backgroundColor = "";
          break;
      }

      datasets.push({
        label: label,
        data: items.map((i) => {
          if (!labels.has(i.user_id)) {
            labels.set(i.user_id, i.username);
          }
          return i.count_leads;
        }),
        backgroundColor: backgroundColor,
        borderWidth: 1,
      });
    });

    chartLabels.value = Array.from(labels.values());
    chartDatasets.value = datasets;
  } catch (error) {
    toast.add({
      title: "Непредвиденная ошибка",
      description: "",
      color: "air-primary-alert",
      icon: UnavailableIcon,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="lg:px-8 py-10 max-w-400 mx-auto">
    <div v-if="bitrixStore.isInit">
      <div class="flex justify-between gap-2xl mb-10">
        <ProseH2 class="mb-6 text-center" v-if="date"
          >Статистика за {{ date }}
        </ProseH2>
        <ProseH2 class="mb-6 text-center" v-else>Статистика</ProseH2>
        <B24Input
          type="date"
          v-model="date"
          :loading="loading"
          @update:modelValue="debouncedChangeInput"
        />
      </div>
      <div class="relative">
        <B24Skeleton
          v-if="loading"
          class="w-full h-full absolute top-0 left-0 z-10 bg-gray-300"
        />
        <LeadsChart
          :date="date"
          :datasets="chartDatasets"
          :labels="chartLabels"
        />
      </div>
    </div>
    <B24Error
      v-else
      :clear="false"
      :error="{
        statusCode: 403,
        statusMessage: 'Страница не найдена',
      }"
    />
  </div>
</template>
