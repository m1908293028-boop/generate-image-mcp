import { AgnesClient } from "../api/client.js";

export interface GenerateResult {
  url: string;
  prompt: string;
  size: string;
  model: string;
  timestamp: number;
}

export async function generateImage(params: {
  prompt: string;
  size?: string;
  model?: string;
  n?: number;
}): Promise<GenerateResult> {
  const client = new AgnesClient();
  const size = params.size || "1024x1024";
  const model = params.model || "agnes-image-2.1-flash";

  const response = await client.generateTextToImage(params.prompt, {
    size,
    model,
    n: params.n,
  });

  return {
    url: response.url,
    prompt: params.prompt,
    size,
    model,
    timestamp: Date.now(),
  };
}
