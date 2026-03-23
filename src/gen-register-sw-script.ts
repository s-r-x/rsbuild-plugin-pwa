import path from "node:path";
import { DEFAULT_REG_SW_EVENTS } from "./config.ts";
import type { RegisterSwEvents } from "./types.ts";

// AI GENERATED
export function genRegisterSwScript({
  baseUrl,
  scope,
  swFilename,
  events: baseEvents = DEFAULT_REG_SW_EVENTS,
}: {
  baseUrl: string;
  scope: string;
  swFilename: string;
  events?: Partial<RegisterSwEvents>;
}) {
  const scriptUrl = path.posix.join(baseUrl, swFilename);
  const events: RegisterSwEvents = {
    ...DEFAULT_REG_SW_EVENTS,
    ...baseEvents,
  };

  return `
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        let refreshing = false;

        // Triggers the actual page reload AFTER the new worker activates
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

        navigator.serviceWorker.register("${scriptUrl}", { scope: "${scope}" })
          .then((reg) => {
            window.dispatchEvent(new CustomEvent("${events.registered}", { 
              detail: { registration: reg } 
            }));

            // Check if there is already a waiting worker from a previous visit
            if (reg.waiting) {
              dispatchWaitingRefresh(reg.waiting);
              return;
            }

            // Listen for a new service worker installing in the background
            reg.addEventListener("updatefound", () => {
              const newWorker = reg.installing;
              if (!newWorker) return;

              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed") {
                  // If there's a controller, it's an update
                  if (navigator.serviceWorker.controller) {
                    dispatchWaitingRefresh(newWorker);
                  } else {
                    // If no controller, it's the first install!
                    window.dispatchEvent(new CustomEvent("${events.offlineReady}"));
                  }
                }
              });
            });
          })
          .catch((err) => {
            console.error("SW registration failed:", err);
            window.dispatchEvent(new CustomEvent("${events.registerError}", { 
              detail: { error: err } 
            }));
          });

        function dispatchWaitingRefresh(worker) {
          const event = new CustomEvent("${events.waitingRefresh}", { 
            detail: { worker } 
          });
          window.dispatchEvent(event);
        }
      });
    }
  `;
}
