import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { IJivoMessage } from "../types/message";
import { useApi } from "../composables/useApi.ts";
import { IJivoChat } from "../types";
import { API_BITRIX_URL } from "../constants/api.ts";
import { useClientStore } from "./clientStore.ts";
import { IApiBitrixPaginationResponse } from "../types/api";

export const useJivoChatStore = defineStore("jivoChatStore", () => {
  const clientStore = useClientStore();

  const chats = ref<IJivoChat[]>([]);
  const currentChatPage = ref<number>(1);
  const currentChatLimit = ref<number>(20);
  const isChatLoading = ref<boolean>(true);
  const hasMoreChats = ref<boolean>(true);
  const visitedChatPages = ref<Set<number>>(new Set<number>());

  const messages = ref<Map<number, IJivoMessage[]>>(new Map());
  const currentMessagePage = ref<Map<number, number>>(new Map());
  const currentMessageLimit = ref<Map<number, number>>(new Map());
  const isMessageLoading = ref<Map<number, boolean>>(new Map());
  const hasMoreMessages = ref<Map<number, boolean>>(new Map());
  const visitedMessagePages = ref<Map<number, Set<number>>>(new Map());

  const fetchChats = async (page?: number, limit?: number) => {
    try {
      isChatLoading.value = true;
      const requestLimit = limit ?? currentChatLimit.value;
      let requestPage = page ?? currentChatPage.value;

      while (visitedChatPages.value.has(requestPage)) {
        requestPage += 1;
      }
      visitedChatPages.value.add(requestPage);

      const { error, data } = await useApi<
        IApiBitrixPaginationResponse<IJivoChat[]>
      >(
        `${API_BITRIX_URL}/v1/integration/addy/clients/${clientStore.clientId}/chats?limit=${requestLimit}&page=${requestPage}`,
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

      currentChatPage.value = requestPage;
      currentChatLimit.value = requestLimit;

      if (data.currentPage >= data.totalPages || data.result.length === 0) {
        hasMoreChats.value = false;
      }

      chats.value.push(...data.result);
    } finally {
      isChatLoading.value = false;
    }
  };

  const fetchMessages = async (
    chatId: number,
    limit?: number,
    page?: number,
  ) => {
    if (isMessageLoading.value.get(chatId)) {
      return;
    }

    const hasMore = hasMoreMessages.value.get(chatId) ?? true;
    if (!hasMore) return;

    try {
      isMessageLoading.value.set(chatId, true);

      const requestLimit = limit ?? currentMessageLimit.value.get(chatId) ?? 20;
      let requestPage = page ?? currentMessagePage.value.get(chatId) ?? 1;

      const visitedPages =
        visitedMessagePages.value.get(chatId) ?? new Set<number>();

      while (visitedPages.has(requestPage)) {
        requestPage += 1;
      }
      visitedPages.add(requestPage);
      visitedMessagePages.value.set(chatId, visitedPages);

      const { error, data } = await useApi<
        IApiBitrixPaginationResponse<IJivoMessage[]>
      >(
        `${API_BITRIX_URL}/v1/integration/addy/clients/${clientStore.clientId}/chats/${chatId}/messages?limit=${requestLimit}&page=${requestPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `baa ${import.meta.env.VITE_BITRIX_BACKEND_API_KEY}`,
          },
        },
      );

      if (error) throw new Error(error);
      if (!data) throw new Error("Не удалось получить данные. Ответ пустой");

      currentMessagePage.value.set(chatId, requestPage);
      currentMessageLimit.value.set(chatId, requestLimit);

      if (data.currentPage >= data.totalPages || data.result.length === 0) {
        hasMoreMessages.value.set(chatId, false);
      }

      const existing = messages.value.get(chatId) ?? [];
      messages.value.set(chatId, [...existing, ...data.result]);
    } finally {
      isMessageLoading.value.set(chatId, false);
    }
  };

  const getChatMessages = (chatId: number) =>
    computed(() => messages.value.get(chatId) ?? []);

  const getIsMessageLoading = (chatId: number) =>
    computed(() => isMessageLoading.value.get(chatId) ?? false);

  const getHasMoreMessages = (chatId: number) =>
    computed(() => hasMoreMessages.value.get(chatId) ?? true);

  return {
    chats: {
      items: chats,
      isLoading: isChatLoading,
      hasMore: hasMoreChats,
      pagination: {
        limit: currentChatLimit,
        page: currentChatPage,
      },
    },
    fetchChats,
    fetchMessages,
    getChatMessages,
    getIsMessageLoading,
    getHasMoreMessages,
  };
});
