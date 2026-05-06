import type {OpenRouterRequestBody, OpenRouterResponse} from './types';

export const chat = async (body: OpenRouterRequestBody, key: string) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',

      // These two can be used for OpenRouter's rankings and analytics
      // "HTTP-Referer": "",
      // "X-Title": ""
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data as OpenRouterResponse;
};
