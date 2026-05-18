/** Fire-and-forget notification dispatch; never fails the HTTP request. */
export const safeNotify = (fn: () => Promise<void>): void => {
  fn().catch((error) => console.error("[notifications]", error));
};
