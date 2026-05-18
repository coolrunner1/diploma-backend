export class AiFeatureDisabledError extends Error {
  readonly statusCode = 503;
  readonly feature: string;

  constructor(feature: string) {
    super(`AI feature "${feature}" is disabled. Set the corresponding AI_* env variable to enable it.`);
    this.name = "AiFeatureDisabledError";
    this.feature = feature;
  }
}

export class AiNotConfiguredError extends Error {
  readonly statusCode = 503;

  constructor() {
    super("GigaChat is not configured. Set GIGACHAT_CREDENTIALS and enable AI via AI_ENABLED.");
    this.name = "AiNotConfiguredError";
  }
}

export class AiProviderError extends Error {
  readonly statusCode = 502;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "AiProviderError";
    if (cause instanceof Error) {
      this.cause = cause;
    }
  }
}
