import { Show } from "solid-js";
import "./App.css";
import { useRegisterSW } from "rsbuild-plugin-pwa_vm/solid";

const App = () => {
  let offlineReadyDialogRef: HTMLDialogElement | undefined;

  const { skipWaiting, newSwWaiting, setNewSwWaiting, newSwActive } =
    useRegisterSW({
      onOfflineReady() {
        offlineReadyDialogRef?.showModal();
      },
    });

  return (
    <>
      <div class="content">
        <h1>Rsbuild with SolidJS</h1>
        <p>Start building amazing things with Rsbuild</p>
        <p>(and rsbuild-plugin-pwa)</p>

        <Show when={newSwWaiting()}>
          <div>
            <p>New version is available</p>
            <button type="button" onClick={() => skipWaiting()}>
              Install
            </button>
            <button type="button" onClick={() => setNewSwWaiting(false)}>
              Dismiss
            </button>
          </div>
        </Show>

        <Show when={newSwActive()}>
          <div>
            <p>
              Update is installed. Refresh the page or something bad is gonna
              happen
            </p>
            <button type="button" onClick={() => window.location.reload()}>
              If you say so
            </button>
          </div>
        </Show>
      </div>

      <dialog
        ref={offlineReadyDialogRef}
        onCancel={() => offlineReadyDialogRef?.close()}
      >
        <p>The app is ready to work offline</p>
        <button type="button" onClick={() => offlineReadyDialogRef?.close()}>
          Cool
        </button>
      </dialog>
    </>
  );
};

export default App;
