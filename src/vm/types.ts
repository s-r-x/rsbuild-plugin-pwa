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
}
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
