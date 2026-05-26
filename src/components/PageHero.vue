<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { LoggerInterface, SdkError } from "@bitrix24/b24jssdk";
import { useBitrixStore } from "../store/bitrix-store.ts";
import LeadsChart from "./LeadsChart.vue";
import LeadsTable, { ILeadTableItem } from "./LeadsTable.vue";
import { useFetch } from "../composables/use-fetch.ts";
import UnavailableIcon from "@bitrix24/b24icons-vue/main/UnavailableIcon";
import type { SelectMenuItem } from "@bitrix24/b24ui-nuxt";

const enum B24UserStatDepartmentType {
  ALL = "all",
  SALES = "office_sales",
  SALE_1 = "office_sale_1",
  SALE_2 = "office_sale_2",
  HOME_SALES = "home_sales",
  C = "office_1c",
  ADDY = "office_addy",
}

const departmentList: Record<B24UserStatDepartmentType, number[]> = {
  [B24UserStatDepartmentType.ALL]: [42, 48, 74, 228, 230],
  [B24UserStatDepartmentType.SALES]: [42, 48],
  [B24UserStatDepartmentType.SALE_1]: [42],
  [B24UserStatDepartmentType.SALE_2]: [48],
  [B24UserStatDepartmentType.HOME_SALES]: [74],
  [B24UserStatDepartmentType.ADDY]: [228],
  [B24UserStatDepartmentType.C]: [230],
};

interface IChartData {
  [key: string]: any;
}

interface IChartDataset {
  label: string;
  data: any[];
  borderWidth: number;
  backgroundColor: string;
}

interface IStatDataItem {
  user_id: string;
  leads: number[];
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

interface ILabelOptions {
  label: string;
  backgroundColor: string;
  index: number;
}

type SelectMenuItemExtended = SelectMenuItem & {
  value?: B24UserStatDepartmentType;
};

const bitrixStore = useBitrixStore();
const toast = useToast();

const date = ref<string>(new Date().toISOString().split("T")[0]);
const chartLabels = ref<string[]>([]);
const chartDatasets = ref<any[]>([]);
const loading = ref<boolean>(false);
const departmentSelectItems: SelectMenuItemExtended[] = [
  {
    label: "Все отделы",
    value: B24UserStatDepartmentType.ALL,
  },
  {
    label: "Все офисные менеджеры",
    value: B24UserStatDepartmentType.SALES,
  },
  {
    label: "Отдел продаж 1",
    value: B24UserStatDepartmentType.SALE_1,
  },
  {
    label: "Отдел продаж 2",
    value: B24UserStatDepartmentType.SALE_2,
  },
  {
    label: "Все удаленщики",
    value: B24UserStatDepartmentType.HOME_SALES,
  },
  {
    label: "1C",
    value: B24UserStatDepartmentType.C,
  },
  {
    label: "Addy",
    value: B24UserStatDepartmentType.ADDY,
  },
];
const departmentSelectValue = ref<SelectMenuItemExtended>(
  departmentSelectItems[0],
);
const tableData = ref<Map<string, ILeadTableItem>>(
  new Map<string, ILeadTableItem>(),
);

onMounted(async () => {
  try {
    await bitrixStore.init();
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

  await loadData();
});

onUnmounted(() => {
  bitrixStore.destroy();
});

const handleClickButton = async () => {
  await loadData();
};

const loadData = async () => {
  loading.value = true;
  try {
    if (!departmentSelectValue.value || !departmentSelectValue.value.value) {
      toast.add({
        title: "Не выбран отдел",
        icon: UnavailableIcon,
      });

      return;
    }

    const params = new URLSearchParams({
      date: date.value,
      department: departmentList[departmentSelectValue.value.value].join(","),
    });

    const { error, data } = await useFetch<IStatResponse>(
      `/v1/users/statistics/leads?` + params.toString(),
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

    const chartData = new Map<string, IChartData>();
    const labelsMap = new Map<string, ILabelOptions>();
    let dataTable = new Map<string, ILeadTableItem>();

    data.data.forEach(({ label, name, items }, index) => {
      let backgroundColor: string;

      switch (name) {
        case "new_leads":
          backgroundColor = "#3b80c4";
          break;

        case "1c_leads":
          backgroundColor = "#c4b93b";
          break;

        case "converted_leads":
          backgroundColor = "#28b128";
          break;

        default:
          backgroundColor = "";
          break;
      }

      for (const { user_id: userId, username, leads } of items) {
        const tableDataItem = dataTable.get(userId);

        if (!tableDataItem) {
          dataTable.set(userId, {
            user: {
              id: userId,
              name: username,
            },
            [name]: new Set(leads),
          });
          continue;
        }

        dataTable.set(userId, {
          ...tableDataItem,
          [name]: new Set([...(tableDataItem[name] ?? []), ...leads]),
        });
      }

      labelsMap.set(name, { label, backgroundColor, index });
    });

    for (const item of dataTable.values()) {
      const { id: userId, name: username } = item.user;

      for (const key of Object.keys(item)) {
        if (!labelsMap.has(key)) {
          continue;
        }

        const chartUserData = chartData.get(userId);

        if (!chartUserData) {
          chartData.set(userId, {
            [key]: [...item[key]],
            username: username,
          });
          continue;
        }

        chartData.set(userId, {
          ...chartUserData,
          [key]: [...(chartUserData[key] ?? []), ...item[key]],
        });
      }
    }

    chartLabels.value = Array.from(chartData.values()).map((d) => d.username);
    chartDatasets.value = Array.from(chartData.values()).reduce<
      IChartDataset[]
    >((acc, d) => {
      for (const key of Object.keys(d)) {
        if (!labelsMap.has(key)) {
          continue;
        }

        const { label, backgroundColor, index } = labelsMap.get(key)!;

        if (!(index in acc)) {
          acc[index] = {
            label: label,
            backgroundColor: backgroundColor,
            borderWidth: 1,
            data: [d[key].length],
          };

          continue;
        }

        acc[index].data.push(d[key].length);
      }

      return acc;
    }, []);

    tableData.value = dataTable;
  } catch (error) {
    let errMessage: string;

    if (error instanceof Error) {
      errMessage = error.message;
    } else if (typeof error === "string") {
      errMessage = error;
    } else {
      errMessage = "Internal Server Error";
    }

    toast.add({
      title: "Непредвиденная ошибка",
      description: errMessage,
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
      <div class="flex justify-between items-center gap-2xl mb-10">
        <div>
          <ProseH2 class="text-center" v-if="date"
            >Статистика за {{ date }}
          </ProseH2>
          <ProseH2 class="text-center" v-else>Статистика</ProseH2>
        </div>
        <div class="flex items-center gap-5">
          <B24SelectMenu
            v-model="departmentSelectValue"
            :items="departmentSelectItems"
            color="air-primary"
            placeholder="Выберите отдел"
            :search-input="{
              placeholder: 'Отдел',
            }"
          />
          <B24Input
            type="date"
            v-model="date"
            :loading="loading"
            class="min-w-42"
          />
          <B24Button color="air-primary" @click="handleClickButton">
            Показать
          </B24Button>
        </div>
      </div>
      <div class="relative">
        <B24Skeleton
          v-if="loading"
          class="w-full h-full absolute top-0 left-0 z-10 bg-gray-300"
        />
        <div>
          <LeadsChart
            :date="date"
            :datasets="chartDatasets"
            :labels="chartLabels"
          />
          <LeadsTable :items="tableData" class="mt-16" />
        </div>
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
