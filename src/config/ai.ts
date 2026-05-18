const truthy = (value: string | undefined): boolean =>
  value === "1" || value === "true" || value === "yes";

const envFlag = (specific: string | undefined, fallback: boolean): boolean => {
  if (specific !== undefined) {
    return truthy(specific);
  }
  return fallback;
};

export const aiConfig = {
  isEnabled(): boolean {
    return truthy(process.env.AI_ENABLED);
  },

  isCommentSummaryEnabled(): boolean {
    return envFlag(process.env.AI_COMMENT_SUMMARY_ENABLED, this.isEnabled());
  },

  isTaskCheckEnabled(): boolean {
    return envFlag(process.env.AI_TASK_CHECK_ENABLED, this.isEnabled());
  },

  hasGigaChatCredentials(): boolean {
    return Boolean(process.env.GIGACHAT_CREDENTIALS?.trim());
  },

  maxOpenTasksGlobal(): number {
    return Number(process.env.MAX_OPEN_TASKS_PER_USER ?? 8);
  },

  maxOpenTasksInProject(): number {
    return Number(process.env.MAX_OPEN_TASKS_PER_USER_PROJECT ?? process.env.MAX_OPEN_TASKS_PER_USER ?? 8);
  },

  commentSummaryMaxChars(): number {
    return Number(process.env.AI_COMMENT_SUMMARY_MAX_CHARS ?? 2000);
  },

  gigachatModel(): string {
    return process.env.GIGACHAT_MODEL ?? "GigaChat-2";
  },

  gigachatScope(): string {
    return process.env.GIGACHAT_SCOPE ?? "GIGACHAT_API_PERS";
  },

  gigachatBaseUrl(): string | undefined {
    const url = process.env.GIGACHAT_BASE_URL?.trim();
    return url || undefined;
  },

  gigachatTimeoutSec(): number {
    return Number(process.env.GIGACHAT_TIMEOUT ?? 60);
  },

  gigachatTlsInsecure(): boolean {
    return truthy(process.env.GIGACHAT_TLS_INSECURE);
  }
};
