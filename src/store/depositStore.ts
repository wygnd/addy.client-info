import { defineStore } from "pinia";
import { ref } from "vue";
import { useClientStore } from "./clientStore.ts";
import { useApi } from "../composables/useApi.ts";
import { IBitrixPauseDeposit } from "../types";
import { IApiBitrixPaginationResponse } from "../types/api";
import { API_BITRIX_URL } from "../constants/api.ts";

export const useDepositStore = defineStore("depositStore", () => {
  const clientStore = useClientStore();

  const items = ref<IBitrixPauseDeposit[]>([]);
  const currentPage = ref<number>(1);
  const currentLimit = ref<number>(20);
  const isLoading = ref<boolean>(true);
  const hasMore = ref<boolean>(true);
  const visitedPages = ref<Set<number>>(new Set<number>());

  const fetchHistory = async (limit?: number, page?: number) => {
    try {
      isLoading.value = true;
      const requestLimit = limit ? limit : currentLimit.value;
      let requestPage = page ? page : currentPage.value;

      while (true) {
        if (visitedPages.value.has(requestPage)) {
          requestPage += 1;
          continue;
        }

        break;
      }

      visitedPages.value.add(requestPage);

      const { error, data } = await useApi<
        IApiBitrixPaginationResponse<IBitrixPauseDeposit[]>
      >(
        `${API_BITRIX_URL}/v1/integration/addy/clients/${clientStore.clientId}/deposits/history?limit=${requestLimit}&page=${requestPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `baa ${import.meta.env.VITE_BITRIX_BACKEND_API_KEY}`,
          },
        },
      );

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error("Не удалось получить данные. Ответ пустой");
      }

      if (data.totalRows === 0) {
        hasMore.value = false;
      }

      currentPage.value = requestPage;
      currentLimit.value = requestLimit;

      items.value.push(...data.result);
    } catch (err) {
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    items,
    isLoading,
    hasMore,
    fetchHistory,
    pagination: {
      page: currentPage,
      limit: currentLimit,
    },
  };
});
