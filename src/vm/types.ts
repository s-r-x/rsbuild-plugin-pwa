import type { Workbox } from "workbox-window";

export interface RegisterSWOptions {
  /**
   * Setting this to true will register the SW immediately, even if the window has not loaded.
   */
  immediate?: boolean;
  /**
   * The new SW is waiting for activation. You may prompt the user and send "SKIP_WAITING" message to the SW.
   */
  onNewSwWaiting?: () => void;
  /**
   * The new SW is controlling the page. You might want to refresh the page.
   */
  onNewSwActive?: () => void;
  /**
   * The SW is installed.
   */
  onOfflineReady?: () => void;
  /**
   * The SW is registered.
   */
  onRegister?: (event: {
    registration: ServiceWorkerRegistration | undefined;
    swUrl: string;
  }) => void;
  /**
   * Something went wrong during the SW registration.
   */
  onRegisterError?: (error: any) => void;
  /**
   * workbox-window is lazy loaded by default
   * if you're, for example, already lazy loading the virtual module
   * you might want to minimize the number of generated chunks by importing workbox-window synchronously
   */
  createWorkbox?: CreateWorkboxFn;
}

export type CreateWorkboxFn = (args: {
  swUrl: string;
  swScope: string;
}) => Promise<Workbox> | Workbox;

export interface RegisterSWReturnValue {
  /**
   * Sends a `{type: 'SKIP_WAITING'}` message to the SW that's currently in the `waiting` state associated with the current registration.
   */
  skipWaiting: () => Promise<void>;
  /**
   * Removes all attached event listeners from the SW.
   */
  detachEventListeners: () => Promise<void>;
}

export interface RegisterSwBindingReturnValue<
  TNewSwActiveState,
  TNewSwWaitingState,
  TOfflineReadyState,
> extends Pick<RegisterSWReturnValue, "skipWaiting"> {
  /**
   * The new SW is controlling the page.
   */
  newSwActive: TNewSwActiveState;
  /**
   * The newer SW gets installed alongside the previous one, but the old one is still controlling the page.
   */
  newSwWaiting: TNewSwWaitingState;
  /**
   * The SW is ready to work offline.
   */
  offlineReady: TOfflineReadyState;
}
