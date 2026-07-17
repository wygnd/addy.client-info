<script setup lang="ts">
import { useJivoChatStore } from "../store/jivoChatStore.ts";
import { computed, onMounted } from "vue";
import type { NavigationMenuItem } from "@bitrix24/b24ui-nuxt";
import { useRoute } from "vue-router";
import UserChats from "./UserChats.vue";
import { IMessage } from "../types/message";

const jivoChatStore = useJivoChatStore();
const route = useRoute();

const selectedChatId = computed(() => {
  if (!route.query.chat_id) {
    return null;
  }

  return Number(route.query.chat_id);
});
const links = computed<NavigationMenuItem[]>(() => {
  return jivoChatStore.chats.items.map<NavigationMenuItem>((item, index) => ({
    label: `Чат #${index + 1}`,
    active: route.query.chat_id
      ? parseInt(route.query.chat_id.toString()) === item.id
      : false,
    to: `?type=jivo&chat_id=${item.id}`,
    onSelect: () => {
      jivoChatStore.fetchMessages(item.id);
    },
  }));
});

const messages = computed<IMessage[]>(() => {
  if (!selectedChatId.value) {
    return [];
  }

  return jivoChatStore
    .getChatMessages(selectedChatId.value)
    .value.map((message) => ({
      id: message.id.toString(),
      role: message.sender === "USER" ? "user" : "assistant",
      parts: [{ type: "text", text: message.message }],
    }));
});

onMounted(() => {
  if (jivoChatStore.chats.items.length === 0 && jivoChatStore.chats.hasMore) {
    jivoChatStore.fetchChats();
  }

  if (route.query.chat_id) {
    jivoChatStore.fetchMessages(Number(route.query.chat_id));
  }
});

const handleLoadMoreMessages = () => {
  if (!route.query.chat_id) {
    return;
  }

  jivoChatStore.fetchMessages(Number(route.query.chat_id));
};
</script>

<template>
  <div v-if="jivoChatStore.chats.items.length > 0" class="flex justify-between">
    <div class="w-full">
      <div v-if="!selectedChatId">
        <ProseP> Чтобы продолжить, Выберите чат </ProseP>
      </div>
      <UserChats
        v-if="selectedChatId"
        :messages="messages"
        :hasMore="jivoChatStore.getHasMoreMessages(selectedChatId).value"
        :loading="jivoChatStore.getIsMessageLoading(selectedChatId).value"
        @loadMore="handleLoadMoreMessages"
      />
    </div>
    <B24NavigationMenu
      :items="links"
      orientation="vertical"
      class="w-1/5 border-l border-l-(--ui-color-design-outline-stroke) min-h-50 ml-10 pl-10 shrink-0"
    />
  </div>

  <div v-else class="flex justify-center">
    <B24ChatShimmer text="Сообщений пока нет..." :duration="0" />
  </div>
</template>

<style scoped></style>
