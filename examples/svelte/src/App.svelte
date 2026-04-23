<script lang="ts">
  import { useRegisterSW } from "rsbuild-plugin-pwa_vm/svelte";

  let offlineReadyDialogRef: HTMLDialogElement;

  const { skipWaiting, newSwWaiting, newSwActive } = useRegisterSW({
    onOfflineReady() {
      offlineReadyDialogRef?.showModal();
    },
  });

  function acceptUpdate() {
    skipWaiting();
  }

  function confirmPageRefresh() {
    window.location.reload();
  }

  function closeDialog() {
    offlineReadyDialogRef?.close();
  }
</script>

<div class="content">
  <h1>Rsbuild with Svelte</h1>
  <p>Start building amazing things with Rsbuild</p>
  <p>(and rsbuild-plugin-pwa)</p>

  {#if $newSwWaiting}
    <div>
      <p>New version is available</p>
      <button type="button" on:click={acceptUpdate}> Install </button>
    </div>
  {/if}

  {#if $newSwActive}
    <div>
      <p>
        Update is installed. Refresh the page or something bad is gonna happen
      </p>
      <button type="button" on:click={confirmPageRefresh}>
        If you say so
      </button>
    </div>
  {/if}
</div>

<dialog bind:this={offlineReadyDialogRef} on:cancel={closeDialog}>
  <p>The app is ready to work offline</p>
  <button type="button" on:click={closeDialog}> Cool </button>
</dialog>

