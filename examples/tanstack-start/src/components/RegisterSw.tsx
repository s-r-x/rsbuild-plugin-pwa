import { useRef } from "react";
import { useRegisterSW } from "rsbuild-plugin-pwa_vm/react";

export default function RegisterSw() {
  const newSwWAitingDialogRef = useRef<HTMLDialogElement>(null);
  const { skipWaiting } = useRegisterSW({
    onNewSwWaiting() {
      newSwWAitingDialogRef.current?.showModal();
    },
    onNewSwActive() {
      window.location.reload();
    },
  });
  return (
    <dialog
      ref={newSwWAitingDialogRef}
      onCancel={function () {
        newSwWAitingDialogRef.current?.close();
      }}
    >
      <p>New version is available</p>
      <button
        type="button"
        onClick={function () {
          skipWaiting();
          newSwWAitingDialogRef.current?.close();
        }}
      >
        Accept
      </button>
    </dialog>
  );
}
