export interface GenerateRequest {
    model?: string;
    prompt: string;
    size?: string;
    n?: number;
    extra_body?: {
        image?: string[];
        response_format?: string;
    };
}
export interface GenerateResponse {
    url: string;
    id?: string;
}
export interface ObservationResult {
    subject: string;
    background: string;
    details: string;
    style: string;
    composition: string;
    keep_unchanged: string;
}
export declare class AgnesClient {
    private apiKey;
    private apiUrl;
    private provider;
    constructor();
    generate(request: GenerateRequest): Promise<GenerateResponse>;
    generateTextToImage(prompt: string, options?: {
        size?: string;
        model?: string;
        n?: number;
    }): Promise<GenerateResponse>;
    generateImageToImage(imageUrl: string, prompt: string, options?: {
        size?: string;
        model?: string;
    }): Promise<GenerateResponse>;
}
