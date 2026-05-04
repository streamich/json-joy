export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatCompletionMessage {
  role: MessageRole;
  content: string | ChatCompletionContentPart[];
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string; // Required for role: 'tool'
}

export interface ChatCompletionContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string; // Base64 or URL
    detail?: 'auto' | 'low' | 'high';
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, any>; // JSON Schema object
  };
}

export interface OpenRouterRequestBody {
  model: string;
  messages: ChatCompletionMessage[];
  prompt?: string;
  tools?: ToolDefinition[];
  tool_choice?: 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } };
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  repetition_penalty?: number;
  seed?: number;
  stop?: string | string[];
  
  // OpenRouter Specific Extensions
  transforms?: string[];
  models?: string[]; // Fallback list
  route?: 'fallback';
  provider?: {
    order?: string[];
    allow_fallbacks?: boolean;
    require_parameters?: boolean;
    data_collection?: 'deny' | 'allow';
  };
}

export interface OpenRouterResponse {
  id: string;
  /** Usually "chat.completion" */
  object: string;
  /** Unix timestamp */
  created: number;
  /** The specific model used (useful for fallbacks) */
  model: string;
  choices: Choice[];
  usage?: Usage;
  /** Included if the request was a 'completion' (non-chat) */
  system_fingerprint?: string;
}

export interface Choice {
  /** Why the generation stopped */
  finish_reason: "stop" | "length" | "tool_calls" | "content_filter" | null;
  index: number;
  message: {
    role: "assistant";
    content: string | null;
    /** Present if the model is calling a tool */
    tool_calls?: ToolCall[];
  };
  /** Only present in streaming responses */
  delta?: {
    role?: "assistant";
    content?: string;
    tool_calls?: ToolCall[];
  };
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/** Re-using the ToolCall from the request module */  
export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // Valid JSON string
  };
}
