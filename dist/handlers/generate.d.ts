export interface GenerateResult {
    url: string;
    prompt: string;
    size: string;
    model: string;
    timestamp: number;
}
export declare function generateImage(params: {
    prompt: string;
    size?: string;
    model?: string;
    n?: number;
}): Promise<GenerateResult>;
