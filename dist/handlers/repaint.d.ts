export interface RepaintResult {
    url: string;
    source_url: string;
    edit_prompt: string;
    optimized_prompt: string;
    strength: number;
    size: string;
    model: string;
    timestamp: number;
}
export declare function repaintImage(params: {
    image_url: string;
    edit_prompt: string;
    strength?: number;
    size?: string;
    model?: string;
}): Promise<RepaintResult>;
