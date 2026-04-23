<script setup lang="ts">
import { useRegisterSW } from "rsbuild-plugin-pwa_vm/vue";
import { ref } from "vue";

const offlineReadyDialogRef = ref<HTMLDialogElement | null>(null);

const { skipWaiting, newSwWaiting, newSwActive } = useRegisterSW({
  onOfflineReady() {
    offlineReadyDialogRef.value?.showModal();
  },
});

function confirmPageRefresh() {
  window.location.reload();
}

function closeDialog() {
  offlineReadyDialogRef.value?.close();
}
</script>

<template>
  <div class="content">
    <h1>Rsbuild with Vue</h1>
    <p>Start building amazing things with Rsbuild</p>
    <p>(and rsbuild-plugin-pwa)</p>

    <div v-if="newSwWaiting">
      <p>New version is available</p>
      <button type="button" @click="skipWaiting">
        Install
      </button>
    </div>

    <div v-if="newSwActive">
      <p>
        Update is installed. Refresh the page or something bad is gonna happen
      </p>
      <button type="button" @click="confirmPageRefresh">
        If you say so
      </button>
    </div>
  </div>

  <dialog ref="offlineReadyDialogRef" @cancel="closeDialog">
    <p>The app is ready to work offline</p>
    <button type="button" @click="closeDialog">
      Cool
    </button>
  </dialog>
</template>
<style scoped>
.content {
  display: flex;
  min-height: 100vh;
  line-height: 1.1;
  text-align: center;
  flex-direction: column;
  justify-content: center;
}

.content h1 {
  font-size: 3.6rem;
  font-weight: 700;
}

.content p {
  font-size: 1.2rem;
  font-weight: 400;
  opacity: 0.5;
}
</style>
