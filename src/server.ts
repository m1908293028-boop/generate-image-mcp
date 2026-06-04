#!/usr/bin/env node
import { mkdir } from "fs/promises";
import { join } from "path";
import { generateImage, GenerateResult } from "./handlers/generate.js";
import { repaintImage, RepaintResult } from "./handlers/repaint.js";
import { saveMeta, getMeta, getHistory } from "./storage/store.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const STORAGE_DIR = join(process.cwd(), "generated-images");
const META_DIR = join(process.cwd(), "generated-meta");

export async function runServer(): Promise<void> {
  await mkdir(STORAGE_DIR, { recursive: true });
  await mkdir(META_DIR, { recursive: true });

  const server = new McpServer({
    name: "generate-image-mcp",
    version: "1.0.0",
  });

  // --- Tools ---

  server.tool(
    "generate_image",
    {
      prompt: z.string().describe("图片生成的自然语言提示词"),
      size: z
        .enum(["512x512", "768x768", "1024x1024", "1024x768", "768x1024", "1280x720", "720x1280"])
        .optional()
        .default("1024x1024"),
      model: z.string().optional().default("agnes-image-2.1-flash"),
      n: z.number().int().min(1).max(4).optional().default(1),
    },
    async ({ prompt, size, model, n }) => {
      const result = await generateImage({ prompt, size, model, n });
      await saveMeta(result.url, {
        type: "generate",
        prompt,
        size,
        model,
        timestamp: result.timestamp,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "图片生成成功",
              url: result.url,
              prompt: result.prompt,
              size: result.size,
              model: result.model,
              timestamp: result.timestamp,
            }),
          },
        ],
      };
    }
  );

  server.tool(
    "repaint_image",
    {
      image_url: z.string().url().describe("原图的 URL"),
      edit_prompt: z.string().describe("编辑需求的自然语言描述"),
      size: z
        .enum(["512x512", "768x768", "1024x1024", "1024x768", "768x1024", "1280x720", "720x1280"])
        .optional()
        .default("1024x768"),
      model: z.string().optional().default("agnes-image-2.1-flash"),
      strength: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .default(0.7),
    },
    async ({ image_url, edit_prompt, size, model, strength }) => {
      const result = await repaintImage({
        image_url,
        edit_prompt,
        size,
        model,
        strength,
      });
      await saveMeta(result.url, {
        type: "repaint",
        source_url: result.source_url,
        edit_prompt: result.edit_prompt,
        optimized_prompt: result.optimized_prompt,
        size: result.size,
        model: result.model,
        strength: result.strength,
        timestamp: result.timestamp,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "图片重绘成功",
              url: result.url,
              source_url: result.source_url,
              edit_prompt: result.edit_prompt,
              optimized_prompt: result.optimized_prompt,
              strength: result.strength,
              size: result.size,
              model: result.model,
              timestamp: result.timestamp,
            }),
          },
        ],
      };
    }
  );

  // --- Resources ---

  server.resource(
    "meta",
    "meta://{path}",
    async (uri) => {
      const path = uri.pathname?.replace(/^\/+/, "") || "";
      const meta = getMeta(path);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: meta ? JSON.stringify(meta, null, 2) : '{"error": "metadata not found"}',
          },
        ],
      };
    }
  );

  server.resource(
    "history",
    "history://",
    async (uri) => {
      const history = getHistory();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(history, null, 2),
          },
        ],
      };
    }
  );

  // --- Start ---

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(console.error);
