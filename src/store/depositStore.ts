import { defineStore } from "pinia";
import { ref } from "vue";
import { IApiAddyResponse, IDeposit } from "../types";
import {
  API_ADDY_URL,
  API_AUTH_KEY,
  API_LIMIT_POSTS,
} from "../constants/api.ts";
import { useApi } from "../composables/useApi.ts";
import { IAddyListResponse } from "../types/api/addy/response.ts";
import CloudErrorIcon from "@bitrix24/b24icons-vue/main/CloudErrorIcon";

export const useDepositStore = defineStore("depositStore", () => {
  const depositVisitedSet = new Set<number>();
  const depositList = ref<IDeposit[]>([]);
  const isLoading = ref<boolean>(false);
  const toast = useToast();
  const canLoadMore = ref<boolean>(true);
  const currentPage = ref<number>(0);

  const fetchDeposits = async (clientId: number): Promise<void> => {
    isLoading.value = true;
    try {
      currentPage.value += 1;
      const params = new URLSearchParams({
        page: currentPage.value.toString(),
        limit: API_LIMIT_POSTS.toString(),
      });

      const url =
        API_ADDY_URL +
        `/bx24/user/${clientId}/transactions?${params.toString()}`;

      const { data, error } = await useApi<
        IApiAddyResponse<IAddyListResponse<IDeposit[]>>
      >(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${API_AUTH_KEY}`,
        },
      });

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error("Не удалось получить данные");
      }

      for (const deposit of data.resource.data) {
        if (depositVisitedSet.has(deposit.id)) {
          continue;
        }

        depositList.value.push(deposit);
      }

      if (data.resource.meta.current_page === data.resource.meta.last_page) {
        canLoadMore.value = false;
      }
    } catch (error) {
      let errorMessage = "Непредвиденная ошбика";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.add({
        title: "Ошибка получения транзакций",
        description: errorMessage,
        color: "air-primary-alert",
        icon: CloudErrorIcon,
      });
    } finally {
      isLoading.value = false;
    }
  };

  return {
    deposits: depositList,
    fetchDeposits: fetchDeposits,
    loading: isLoading,
    canLoadMore: canLoadMore,
  };
});
