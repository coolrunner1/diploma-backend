import { aiCommentSummaryService } from "../services/aiCommentSummary.service.js";
import { safeNotify } from "./notify.js";

export const scheduleCommentSummaryRefresh = (projectId: number, taskId: number): void => {
  if (!aiCommentSummaryService.isEnabled()) {
    return;
  }

  safeNotify(async () => {
    await aiCommentSummaryService.summarizeTaskComments(projectId, taskId);
  });
};
