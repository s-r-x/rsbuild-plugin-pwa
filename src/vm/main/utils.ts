export async function defaultSkipWaitingFn() {
  console.warn(
    "registerSW hasn't been called yet so this doesn't have any effect",
  );
}
