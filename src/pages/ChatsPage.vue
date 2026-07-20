<script setup lang="ts">
import UserChats from "../components/UserChats.vue";
import { useAddyChatStore } from "../store/addyChatStore.ts";
import { computed, onMounted } from "vue";
import { NavigationMenuItem } from "@bitrix24/b24ui-nuxt";
import { useRoute } from "vue-router";
import { IMessage } from "../types/message";

const addyChatStore = useAddyChatStore();
const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Addy",
    active: route.query.type === "addy",
    to: "?type=addy",
  },
  {
    label: "Jivo",
    active: route.query.type === "jivo",
    to: "?type=jivo",
  },
]);

onMounted(() => {
  if (
    route.query.type &&
    route.query.type === "addy" &&
    addyChatStore.hasMore
  ) {
    addyChatStore.fetchMessages();
  }
});

const addyMessages = computed<IMessage[]>(() => {
  if (!addyChatStore.messages) {
    return [];
  }

  return addyChatStore.messages
    .map((msg) => ({
      id: msg.id.toString(),
      parts: [
        {
          type: "text",
          text: msg.message,
        },
      ],
      role: msg.is_admin ? "assistant" : "user",
    }))
    .reverse() as IMessage[];
});

const handleLoadMoreAddyMessages = () => {
  addyChatStore.fetchMessages(
    addyChatStore.pagination.limit,
    addyChatStore.pagination.page + 1,
  );
};

const pageTitle = computed<string>(() => {
  if ("type" in route.query) {
    switch (route.query.type) {
      case "addy":
        return "Диалог из сервиса ADDY";

      case "jivo":
        return "Диалог из Jivo";
    }
  }

  return "Чаты";
});
</script>

<template>
  <div
    class="mb-0 pb-5 flex items-center justify-between gap-5 border-b border-b-(--ui-color-design-outline-stroke)"
  >
    <ProseH1>{{ pageTitle }}</ProseH1>

    <B24NavigationMenu
      :items="items"
      class="data-[orientation=vertical]:w-1/5 shrink-0"
    />
  </div>

  <B24PageBody class="w-full m-0 p-5 pb-0">
    <div v-if="route.query.type === 'addy'">
      <UserChats
        :messages="addyMessages"
        :hasMore="addyChatStore.hasMore"
        :loading="addyChatStore.isLoading"
        @loadMore="handleLoadMoreAddyMessages"
      />
    </div>

    <div v-if="route.query.type === 'jivo'">
      <JivoChats />
    </div>

    <ProseP v-if="!route.query.type"> Чтобы продолжить, Выберите чат </ProseP>
  </B24PageBody>
</template>

<style scoped></style>
