/// <reference types="../types/react.d.ts" />
import toast, { Toaster } from "react-hot-toast";
import { useRegisterSW } from "rsbuild-plugin-pwa_vm/react";

export default function ServiceWorkerManager() {
  const { skipWaiting } = useRegisterSW({
    onOfflineReady() {
      toast("Ready to work offline");
    },
    onNewSwWaiting() {
      toast(
        function (t) {
          return (
            <div>
              <div>A new version is available</div>
              <button
                type="button"
                onClick={function () {
                  toast.dismiss(t.id);
                  skipWaiting();
                }}
                style={{
                  marginTop: "0.25rem",
                  backgroundColor: "var(--rp-c-brand)",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                Update
              </button>
            </div>
          );
        },
        { duration: 5000 },
      );
    },
    onNewSwActive() {
      window.location.reload();
    },
  });
  return (
    <Toaster
      toastOptions={{
        style: {
          backgroundColor: "var(--rp-c-bg)",
          color: "var(--rp-c-text-1)",
          textAlign: "center",
        },
      }}
    />
  );
}
