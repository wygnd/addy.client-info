import { defineStore } from "pinia";
import { IAddyMessage, IApiResponse } from "../types";
import { ref } from "vue";
import { useApi } from "../composables/useApi.ts";
import { API_URL } from "../constants/api.ts";
import { useClientStore } from "./clientStore.ts";
import { IAddyMessageResponse } from "../types/api";

export const useAddyChatStore = defineStore("chats", () => {
  const clientStore = useClientStore();

  const messages = ref<IAddyMessage[]>([]);
  const currentPage = ref<number>(1);
  const currentLimit = ref<number>(20);
  const isLoading = ref<boolean>(false);
  const hasMore = ref<boolean>(true);
  const visitedPages = ref<Set<number>>(new Set<number>());

  const fetchMessages = async (limit?: number, page?: number) => {
    try {
      isLoading.value = true;
      const requestLimit = limit ? limit : currentLimit.value;
      let requestPage = page ? page : currentPage.value;

      while(true) {
        if (visitedPages.value.has(requestPage)) {
          requestPage += 1;
          continue;
        }

        break;
      }


      visitedPages.value.add(requestPage);

      const { error, data } = await useApi<IApiResponse<IAddyMessageResponse>>(
        `${API_URL}/user/${clientStore.clientId}/chats?limit=${requestLimit}&page=${requestPage}`,
      );

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error("Не удалось получить данные. Ответ пустой");
      }

      if (data.resource.data.length === 0) {
        hasMore.value = false;
      }

      currentPage.value = requestPage;
      currentLimit.value = requestLimit;

      messages.value.push(...data.resource.data);
    } catch (err) {
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    messages,
    isLoading,
    hasMore,
    fetchMessages,
    pagination: {
      limit: currentLimit,
      page: currentPage,
    },
  };
});
