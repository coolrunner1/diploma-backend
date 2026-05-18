import { safeNotify } from "../lib/notify.js";
import { deadlineReminderService } from "../services/deadlineReminder.service.js";

const defaultIntervalMs = 60 * 60 * 1000;

export const startDeadlineReminderJob = (): (() => void) => {
  if (process.env.ENABLE_DEADLINE_REMINDERS === "false") {
    return () => undefined;
  }

  const intervalMs = Number(process.env.DEADLINE_REMINDER_INTERVAL_MS ?? defaultIntervalMs);

  const run = () => {
    safeNotify(async () => {
      const sent = await deadlineReminderService.processApproachingDeadlines();
      if (sent > 0) {
        console.log(`[deadline-reminders] sent ${sent} notification(s)`);
      }
    });
  };

  run();
  const timer = setInterval(run, intervalMs);

  return () => clearInterval(timer);
};
