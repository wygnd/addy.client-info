<script setup lang="ts">

const {isBitrixMobile} = useDevice();
const toaster = {
  position: isBitrixMobile.value ? "bottom-center" : "top-right",
  duration: 3000,
  max: 5,
};
</script>

<template>
  <Suspense>
    <B24App :toaster="toaster">
      <B24Main>
        <RouterView/>
      </B24Main>
      <AppFooter/>
    </B24App>
  </Suspense>
</template>
