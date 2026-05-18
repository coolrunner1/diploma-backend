/** Global status IDs that cannot be edited or deleted. */
export const PREDETERMINED_STATUS_IDS = new Set([1, 2, 3, 4, 5, 6, 7]);

export const isPredeterminedStatus = (statusId: number): boolean =>
  PREDETERMINED_STATUS_IDS.has(statusId);
