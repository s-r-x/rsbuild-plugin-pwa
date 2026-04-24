import { useRef } from "preact/hooks";
import "./App.css";
import { useRegisterSW } from "rsbuild-plugin-pwa_vm/preact";

const App = () => {
  const offlineReadyDialogRef = useRef<HTMLDialogElement>(null);
  const {
    skipWaiting,
    newSwWaiting: [newSwWaiting],
    newSwActive: [newSwActive],
  } = useRegisterSW({
    onOfflineReady() {
      offlineReadyDialogRef.current?.showModal();
    },
  });
  return (
    <>
      <div class="content">
        <h1>Rsbuild with React</h1>
        <p>Start building amazing things with Rsbuild</p>
        <p>(and rsbuild-plugin-pwa)</p>
        {newSwWaiting && (
          <div>
            <p>New version is available</p>
            <button
              type="button"
              onClick={function acceptUpdate() {
                skipWaiting();
              }}
            >
              Install
            </button>
          </div>
        )}
        {newSwActive && (
          <div>
            <p>
              Update is installed. Refresh the page or something bad is gonna
              happen
            </p>
            <button
              onClick={function confirmPageRefresh() {
                window.location.reload();
              }}
              type="button"
            >
              If you say so
            </button>
          </div>
        )}
      </div>
      <dialog
        ref={offlineReadyDialogRef}
        onCancel={function () {
          offlineReadyDialogRef.current?.close();
        }}
      >
        <p>The app is ready to work offline</p>
        <button
          type="button"
          onClick={function () {
            offlineReadyDialogRef.current?.close();
          }}
        >
          Cool
        </button>
      </dialog>
    </>
  );
};

export default App;
