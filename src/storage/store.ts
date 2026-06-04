import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

export function loadEnv() {
  dotenv.config();
  return {
    // Image generation config
    IMAGE_PROVIDER: process.env.IMAGE_PROVIDER || 'agnes',
    IMAGE_API_KEY: process.env.IMAGE_API_KEY || process.env.AGNES_API_KEY || '',
    IMAGE_API_URL: process.env.IMAGE_API_URL || process.env.AGNES_API_URL || 'https://apihub.agnes-ai.com/v1/images/generations',
    IMAGE_MODEL: process.env.IMAGE_MODEL || 'agnes-image-2.1-flash',
    
    // Vision/multimodal config
    VISION_PROVIDER: process.env.VISION_PROVIDER || 'mimo',
    VISION_API_KEY: process.env.VISION_API_KEY || process.env.MIMO_API_KEY || '',
    VISION_API_URL: process.env.VISION_API_URL || process.env.MIMO_API_URL || 'https://api.xiaomimimo.com/v1/chat/completions',
    VISION_MODEL: process.env.VISION_MODEL || 'mimo-v2-omni',
    
    // Legacy support
    AGNES_API_KEY: process.env.AGNES_API_KEY || process.env.IMAGE_API_KEY || '',
    AGNES_API_URL: process.env.AGNES_API_URL || process.env.IMAGE_API_URL || 'https://apihub.agnes-ai.com/v1/images/generations',
    MIMO_API_KEY: process.env.MIMO_API_KEY || process.env.VISION_API_KEY || '',
    MIMO_API_URL: process.env.MIMO_API_URL || process.env.VISION_API_URL || 'https://api.xiaomimimo.com/v1/chat/completions',
  };
}

interface MetaRecord {
  type: "generate" | "repaint";
  [key: string]: unknown;
}

const META_DIR = join(process.cwd(), "generated-meta");

export function saveMeta(url: string, meta: MetaRecord): void {
  mkdirSync(META_DIR, { recursive: true });
  const safeKey = url.replace(/[^a-zA-Z0-9]/g, "_");
  const filePath = join(META_DIR, `${safeKey}.json`);
  writeFileSync(filePath, JSON.stringify({ ...meta, image_url: url }, null, 2));
}

export function getMeta(url: string): MetaRecord | null {
  try {
    const safeKey = url.replace(/[^a-zA-Z0-9]/g, "_");
    const filePath = join(META_DIR, `${safeKey}.json`);
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function getHistory(): Array<{ url: string } & MetaRecord> {
  try {
    mkdirSync(META_DIR, { recursive: true });
    const files = readdirSync(META_DIR);
    const history: Array<{ url: string } & MetaRecord> = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = readFileSync(join(META_DIR, file), "utf-8");
        const meta = JSON.parse(content) as MetaRecord & { image_url: string };
        history.push({ url: meta.image_url, ...meta });
      }
    }
    return history.sort((a, b) => (b.timestamp as number) - (a.timestamp as number));
  } catch {
    return [];
  }
}
