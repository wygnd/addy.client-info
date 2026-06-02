<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { LoggerInterface, SdkError } from "@bitrix24/b24jssdk";
import { useBitrixStore } from "../store/bitrix-store.ts";
import LeadsChart from "./LeadsChart.vue";
import LeadsTable from "./LeadsTable.vue";
import { useFetch } from "../composables/use-fetch.ts";
import UnavailableIcon from "@bitrix24/b24icons-vue/main/UnavailableIcon";
import type { SelectMenuItem } from "@bitrix24/b24ui-nuxt";
import { UserStatDimensionType } from "../types";

const enum UserStatDepartmentType {
  ALL = "all",
  SALES = "office_sales",
  SALE_1 = "office_sale_1",
  SALE_2 = "office_sale_2",
  HOME_SALES = "home_sales",
  C = "office_1c",
  ADDY = "office_addy",
}

type UserStatDimensions = {
  [key in UserStatDimensionType]: number;
};

const departmentList: Record<UserStatDepartmentType, number[]> = {
  [UserStatDepartmentType.ALL]: [42, 48, 74, 228, 230],
  [UserStatDepartmentType.SALES]: [42, 48],
  [UserStatDepartmentType.SALE_1]: [42],
  [UserStatDepartmentType.SALE_2]: [48],
  [UserStatDepartmentType.HOME_SALES]: [74],
  [UserStatDepartmentType.ADDY]: [228],
  [UserStatDepartmentType.C]: [230],
};

interface IChartDataset<T> {
  label: string;
  data: T[];
  borderWidth: number;
  backgroundColor: string;
}

export interface IStatData {
  user_id: string;
  username: string;
  statistics: UserStatDimensions;
}

interface IStatResponse {
  request_date: string;
  data: IStatData[];
  timestamp: number;
}

type SelectMenuItemExtended = SelectMenuItem & {
  value?: UserStatDepartmentType;
};

const bitrixStore = useBitrixStore();
const toast = useToast();

const labelMap: Record<UserStatDimensionType, string> = {
  [UserStatDimensionType.BASE]: "Лиды из Базы",
  [UserStatDimensionType.C_LEAD]: "1C Лиды",
  [UserStatDimensionType.NEW]: "Новые Лиды",
  [UserStatDimensionType.CONVERTED]: "Качественные Лиды",
};
const dateStart = ref<string>(new Date().toISOString().split("T")[0]);
const dateEnd = ref<string>(new Date().toISOString().split("T")[0]);
const chartLabels = ref<string[]>([]);
const chartDatasets = ref<any[]>([]);
const loading = ref<boolean>(false);
const departmentSelectItems: SelectMenuItemExtended[] = [
  {
    label: "Все отделы",
    value: UserStatDepartmentType.ALL,
  },
  {
    label: "Все офисные менеджеры",
    value: UserStatDepartmentType.SALES,
  },
  {
    label: "Отдел продаж 1",
    value: UserStatDepartmentType.SALE_1,
  },
  {
    label: "Отдел продаж 2",
    value: UserStatDepartmentType.SALE_2,
  },
  {
    label: "Все удаленщики",
    value: UserStatDepartmentType.HOME_SALES,
  },
  {
    label: "1C",
    value: UserStatDepartmentType.C,
  },
  {
    label: "Addy",
    value: UserStatDepartmentType.ADDY,
  },
];
const departmentSelectValue = ref<SelectMenuItemExtended>(
  departmentSelectItems[0],
);
const tableData = ref<IStatData[]>([]);

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
  if (new Date(dateStart.value) > new Date(dateEnd.value)) {
    toast.add({
      title: "Не правильно выбраны даты",
      description: "Дата начала не может быть позже даты конца",
      icon: UnavailableIcon,
      color: "air-primary-alert",
    });
    return;
  }

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
      date_start: dateStart.value,
      date_end: dateEnd.value,
      department: departmentList[departmentSelectValue.value.value].join(","),
    });

    const { error, data } = await useFetch<IStatResponse>(
      `/v1/users/statistics/leads?` + params.toString(),
    );

    if (error) {
      throw new Error(error);
    }

    if (!data) {
      throw new Error("Сервер вернул пустой результат");
    }

    const labelsSet: string[] = [];
    const datasets: Record<string, IChartDataset<number>> = {};

    data.data.forEach(({ username, statistics }) => {
      for (const [key, countLeads] of Object.entries(statistics)) {
        let backgroundColor: string;

        switch (key) {
          case "new_leads":
            backgroundColor = "#3b80c4";
            break;

          case "leads_1c":
            backgroundColor = "#c4b93b";
            break;

          case "converted_leads":
            backgroundColor = "#28b128";
            break;

          case "base_leads":
            backgroundColor = "#b17628";
            break;

          default:
            backgroundColor = "";
            break;
        }

        if (!(key in datasets)) {
          datasets[key] = {
            label: labelMap[key as UserStatDimensionType],
            data: [countLeads],
            borderWidth: 1,
            backgroundColor: backgroundColor,
          };
        } else {
          datasets[key] = {
            ...datasets[key],
            data: [...datasets[key].data, countLeads],
          };
        }
      }

      labelsSet.push(username);
    });

    chartDatasets.value = Object.values(datasets);
    chartLabels.value = labelsSet;

    tableData.value = data.data;
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
    <div>
      <div class="flex justify-between items-center gap-2xl mb-10">
        <div>
          <ProseH2 class="text-center" v-if="dateStart"
            >Статистика за {{ dateStart }}
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
            :loading="loading"
          />
          <B24Input
            type="date"
            v-model="dateStart"
            :loading="loading"
            class="min-w-42"
            tag="Начало"
          />
          <B24Input
            type="date"
            v-model="dateEnd"
            :loading="loading"
            class="min-w-42"
            tag="Конец"
          />
          <B24Button
            :loading="loading"
            @click="handleClickButton"
            color="air-primary"
          >
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
            :dateStart="dateStart"
            :dateEnd="dateEnd"
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
