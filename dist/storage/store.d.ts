export declare function loadEnv(): {
    IMAGE_PROVIDER: string;
    IMAGE_API_KEY: string;
    IMAGE_API_URL: string;
    IMAGE_MODEL: string;
    VISION_PROVIDER: string;
    VISION_API_KEY: string;
    VISION_API_URL: string;
    VISION_MODEL: string;
    AGNES_API_KEY: string;
    AGNES_API_URL: string;
    MIMO_API_KEY: string;
    MIMO_API_URL: string;
};
interface MetaRecord {
    type: "generate" | "repaint";
    [key: string]: unknown;
}
export declare function saveMeta(url: string, meta: MetaRecord): void;
export declare function getMeta(url: string): MetaRecord | null;
export declare function getHistory(): Array<{
    url: string;
} & MetaRecord>;
export {};
