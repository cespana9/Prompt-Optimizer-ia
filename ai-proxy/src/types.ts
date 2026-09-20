export interface Env {
  OPENAI_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  DEFAULT_MODEL?: string;
  MAX_PROMPT_CHARS?: string;
  REQUEST_TIMEOUT_MS?: string;
  RATE_LIMIT_PER_DAY?: string;
  CLIENT_TOKEN_HASHES?: string;
  OPENROUTER_API_KEY?: string;
  NVIDIA_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  GEMINI_API_KEY?: string;
  MIMO_API_KEY?: string;
  MIMO_BASE_URL?: string;
  AI_BASE_URL?: string;
  AI_API_KEY?: string;
  DEFAULT_PROVIDER?: string;
  PROVIDER_MODELS?: string;
}

export interface GenerateInput {
  instructions: string;
  prompt: string;
  provider?: string;
  model?: string;
}

export interface AIProvider {
  generate(instructions: string, prompt: string, model: string, signal: AbortSignal): Promise<string>;
}
