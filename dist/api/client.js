import { loadEnv } from "../storage/store.js";
export class AgnesClient {
    apiKey;
    apiUrl;
    provider;
    constructor() {
        const env = loadEnv();
        this.apiKey = env.IMAGE_API_KEY;
        this.apiUrl = env.IMAGE_API_URL;
        this.provider = env.IMAGE_PROVIDER;
    }
    async generate(request) {
        const headers = {
            "Content-Type": "application/json",
        };
        // Different auth headers for different providers
        switch (this.provider) {
            case 'agnes':
            case 'openai':
                headers["Authorization"] = `Bearer ${this.apiKey}`;
                break;
            case 'stability':
                headers["Authorization"] = `Bearer ${this.apiKey}`;
                headers["Accept"] = "application/json";
                break;
            default:
                headers["Authorization"] = `Bearer ${this.apiKey}`;
        }
        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`${this.provider} API error: ${response.status} - ${error}`);
        }
        const data = await response.json();
        // Parse response based on provider
        switch (this.provider) {
            case 'agnes':
                return {
                    url: data.data?.[0]?.url || data.url,
                    id: data.id,
                };
            case 'openai':
                return {
                    url: data.data?.[0]?.url || data.url,
                    id: data.created?.toString(),
                };
            case 'stability':
                return {
                    url: data.artifacts?.[0]?.base64 ? `data:image/png;base64,${data.artifacts[0].base64}` : '',
                    id: data.id,
                };
            default:
                return {
                    url: data.data?.[0]?.url || data.url || '',
                    id: data.id,
                };
        }
    }
    async generateTextToImage(prompt, options = {}) {
        const env = loadEnv();
        const model = options.model || env.IMAGE_MODEL;
        const size = options.size || "1024x1024";
        // Different request formats for different providers
        switch (this.provider) {
            case 'agnes':
                return this.generate({
                    model,
                    prompt,
                    size,
                    n: options.n || 1,
                    extra_body: {
                        response_format: "url",
                    },
                });
            case 'openai':
                return this.generate({
                    model,
                    prompt,
                    size,
                    n: options.n || 1,
                    response_format: "url",
                });
            case 'stability':
                return this.generate({
                    text_prompts: [{ text: prompt, weight: 1 }],
                    cfg_scale: 7,
                    height: parseInt(size.split('x')[1]),
                    width: parseInt(size.split('x')[0]),
                    steps: 30,
                    samples: options.n || 1,
                });
            default:
                return this.generate({
                    model,
                    prompt,
                    size,
                    n: options.n || 1,
                });
        }
    }
    async generateImageToImage(imageUrl, prompt, options = {}) {
        const env = loadEnv();
        const model = options.model || env.IMAGE_MODEL;
        const size = options.size || "1024x768";
        // Different request formats for different providers
        switch (this.provider) {
            case 'agnes':
                return this.generate({
                    model,
                    prompt,
                    size,
                    extra_body: {
                        image: [imageUrl],
                        response_format: "url",
                    },
                });
            case 'openai':
                return this.generate({
                    model: "dall-e-2", // DALL-E 2 supports img2img
                    prompt,
                    size,
                    image: imageUrl,
                    response_format: "url",
                });
            case 'stability':
                return this.generate({
                    text_prompts: [{ text: prompt, weight: 1 }],
                    init_image: imageUrl,
                    init_image_mode: "IMAGE_STRENGTH",
                    image_strength: 0.35,
                    cfg_scale: 7,
                    steps: 30,
                    samples: 1,
                });
            default:
                return this.generate({
                    model,
                    prompt,
                    size,
                    extra_body: {
                        image: [imageUrl],
                        response_format: "url",
                    },
                });
        }
    }
}
