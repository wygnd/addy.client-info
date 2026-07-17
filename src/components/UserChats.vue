<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
import { IMessage } from "../types/message";

interface IClientChatProps {
  messages: IMessage[];
  hasMore?: boolean;
  loading?: boolean;
}
const props = withDefaults(defineProps<IClientChatProps>(), {
  hasMore: false,
  loading: false,
});
const emit = defineEmits<{
  (e: "load-more"): void;
}>();

const scrollRef = ref<HTMLElement | null>(null);
const sentinelRef = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;
let prevScrollHeight = ref<number>(0);
let shouldRestoreScroll = ref<boolean>(true);
let isFirstCallback = true;

function onIntersect(entries: IntersectionObserverEntry[]) {
  const [entry] = entries;

  if (isFirstCallback) {
    isFirstCallback = false;
    return;
  }

  if (entry.isIntersecting && props.hasMore && !props.loading) {
    prevScrollHeight.value = scrollRef.value?.scrollHeight ?? 0;
    shouldRestoreScroll.value = true;
    emit("load-more");
  }
}

function scrollToBottom() {
  if (!scrollRef.value) {
    return;
  }

  scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
}

onMounted(async () => {
  await nextTick();
  scrollToBottom();

  observer = new IntersectionObserver(onIntersect, {
    root: scrollRef.value,
    rootMargin: "200px 0px 0px 0px",
  });

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

watch(
  () => props.messages.length,
  async () => {
    if (!shouldRestoreScroll.value || !scrollRef.value) {
      return;
    }

    await nextTick();
    const newScrollHeight = scrollRef.value.scrollHeight;
    scrollRef.value.scrollTop += newScrollHeight - prevScrollHeight.value;
    shouldRestoreScroll.value = false;
  },
);
</script>

<template>
  <div ref="scrollRef" class="h-165 overflow-auto">
    <div ref="sentinelRef" class="chat-sentinel" />

    <div v-if="!hasMore && messages.length > 0" class="flex justify-center">
      <B24ChatShimmer text="Сообщений больше нет" :duration="0" />
    </div>

    <div v-if="messages.length === 0" class="flex justify-center">
      <B24ChatShimmer text="Сообщений пока нет..." :duration="0" />
    </div>

    <div v-if="loading" class="flex justify-center">
      <B24ChatShimmer text="Загрузка сообщений..." />
    </div>

    <B24ChatMessages
      :user="{
        side: 'right',
        variant: 'system',
        b24ui: {
          content:
            'rounded-2xl rounded-br-sm text-white bg-(--ui-color-accent-main-primary)',
        },
      }"
      :assistant="{
        side: 'left',
        variant: 'system',
        b24ui: {
          content:
            'rounded-2xl rounded-bl-sm w-fit text-(--b24ui-typography-description-color) bg-transparent border-1 border-(--b24ui-typography-description-color)',
        },
      }"
      :messages="messages"
      :autoScroll="false"
      :compact="true"
    />
  </div>
</template>

<style scoped></style>