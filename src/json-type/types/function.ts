export interface DocMethod {
  title: string;
  intro?: string;
  description?: string;
  function: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'HEAD';
  urlStructure?: string;
  format?: 'rest' | 'rpc';
  authentication?: string;
  authorization?: string;
  examples?: DocMethodExample[];
  payload?: DocPayload[];
  returns?: DocReturn[];
  errors?: DocError[];
}

export interface DocMethodExample {
  title?: string;
  description?: string;
  payload?: unknown;
  result?: unknown;
  error?: unknown;
}

export interface DocPayload {
  title?: string;
  // type: JsonObject;
}

export interface DocReturn {
  title?: string;
  description?: string;
  // type: Json;
  // type: JsonObject;
}

export interface DocError {
  title?: string;
  description?: string;
  // types: Json[];
}
