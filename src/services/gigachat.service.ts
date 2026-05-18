import { Agent } from "node:https";
import GigaChat from "gigachat";
import { aiConfig } from "../config/ai.js";
import { AiNotConfiguredError, AiProviderError } from "../errors/ai.js";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

let client: GigaChat | null = null;

const getClient = (): GigaChat => {
  if (!aiConfig.hasGigaChatCredentials()) {
    throw new AiNotConfiguredError();
  }

  if (!client) {
    const httpsAgent = aiConfig.gigachatTlsInsecure()
      ? new Agent({ rejectUnauthorized: false })
      : undefined;

    client = new GigaChat({
      credentials: process.env.GIGACHAT_CREDENTIALS!,
      scope: aiConfig.gigachatScope(),
      model: aiConfig.gigachatModel(),
      baseUrl: aiConfig.gigachatBaseUrl(),
      timeout: aiConfig.gigachatTimeoutSec(),
      httpsAgent
    });
  }

  return client;
};

export const gigachatService = {
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const giga = getClient();
      const response = await giga.chat({ messages });
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AiProviderError("GigaChat returned an empty response");
      }
      return content;
    } catch (error) {
      if (error instanceof AiNotConfiguredError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "GigaChat request failed";
      throw new AiProviderError(message, error);
    }
  }
};
