import { AgnesClient } from "../api/client.js";
import { loadEnv } from "../storage/store.js";

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

const OBSERVATION_PROMPT = `你是一个专业的图像理解助手。请按照以下【图片局部重绘·自然语言指令模板】的结构分析这张图片，然后等待用户给出编辑指令。

【目标元素识别】
- 元素名称/角色：（列出图中所有主要元素）
- 视觉特征（形状、颜色、纹理、图案）：（对每个元素详细描述）
- 当前大致位置（画面左上/中心偏右等）：（标注每个元素的位置）
- 相对参考物（在XX的左边、靠近YY等）：（描述元素间的位置关系）
- 唯一性标识（确保不会误选其他元素）：（对每个元素给出唯一标识）

【场景整体描述】
- 背景环境：
- 重要的次要细节：
- 风格与光照：
- 构图：

请只输出分析结果，不要输出其他内容。`;

const OPTIMIZATION_PROMPT = `你是一个专业的图像编辑指令转译助手。你的任务是将用户的自然语言编辑指令转换为适合 img2img 模型执行的详细优化提示词。

请严格参考以下模板结构来处理用户的编辑请求：

---

【图片局部重绘·自然语言指令模板】

【任务类型】
局部重绘 / 元素移动 / 区域替换 / 新增 / 删除 / 替换

【目标元素识别】
- 元素名称/角色：
- 视觉特征（形状、颜色、纹理、图案）：
- 当前大致位置（画面左上/中心偏右等）：
- 相对参考物（在XX的左边、靠近YY等）：
- 唯一性标识（确保不会误选其他元素）：

【移动/修改指令】
- 动作类型：平移 / 旋转 / 缩放 / 翻转 / 重新生成 / 复合操作
- 移动方向与距离：
  - 方向（左/右/上/下/对角线）：
  - 距离（像素/厘米/画面比例/相对参照物间距）：
- 旋转角度与方向（顺时针/逆时针）：
- 缩放比例（放大X倍 / 缩小X%）：
- 最终目标位置（精确描述放到哪里）：
- 参考基准（相对于画面中心/边缘/其他元素/网格线）：

【层次与空间关系】
- 前置/后置：移动到XX的前面还是后面
- 遮挡关系：是否需要遮挡或被遮挡
- 距离关系：与最近参照物的间距
- 空间合理性：是否符合物理规律（如放在桌面上而非悬空）

【原位置处理】
- 处理方式：自动修复 / 用XX材质填充 / 留空
- 修复要求：与原背景无缝衔接 / 保留环境光影

【保持不变的约束】
以下项目绝对不要修改：
- [ ] 颜色/色调
- [ ] 形状/轮廓
- [ ] 纹理/材质
- [ ] 光影方向与强度
- [ ] 元素大小/比例
- [ ] 表情/姿态
- [ ] 背景中其他所有元素

【风格一致性要求】
- 光影方向：（如：光源来自左上方，45度角）
- 阴影要求：（如：投影方向一致，长度按比例）
- 色调统一：（如：整体偏暖色调，色温一致）
- 分辨率/清晰度：（如：保持与原图相同清晰度）

---

原始图像分析：
{observation}

用户编辑指令：
{edit_prompt}

【输出要求】
- 输出格式：PNG
- 分辨率：与输入图像保持一致
- 是否需要多版本/多角度：不需要，生成一张即可

请根据以上信息，生成一个完整、详细的优化提示词。提示词需要包含：
1. 原图中所有应该保持不变的内容（详细说明）
2. 需要修改/移动/新增/删除的内容（精确描述）
3. 风格、光影、构图的一致性约束
4. 原位置修复的要求

输出格式：用一段连贯、详细的英文提示词（img2img 模型通常对英文理解更好），但要涵盖模板中的所有关键信息。

Only output the optimized prompt, nothing else.`;

const COMBINED_PROMPT = `You are an expert image editor. Analyze this image and generate an optimized prompt for img2img modification.

User edit request: {edit_prompt}

Requirements:
1. First, describe what you see in the image (subject, background, details, style, lighting, composition)
2. Then, generate an optimized English prompt that:
   - Preserves all elements that should stay unchanged
   - Clearly describes what should change based on the user's request
   - Maintains the same style and lighting
   - Keep composition constraints explicit

Output ONLY the optimized prompt (no analysis, no explanation). The prompt should be ready to use directly for img2img generation.`;

async function analyzeAndOptimize(imageUrl: string, editPrompt: string): Promise<string> {
  const env = loadEnv();
  const visionApiKey = env.VISION_API_KEY;
  const visionApiUrl = env.VISION_API_URL;
  const visionProvider = env.VISION_PROVIDER;
  const visionModel = env.VISION_MODEL;

  if (!visionApiKey || !visionApiUrl) {
    throw new Error(
      "Vision API key and URL are required for image analysis. " +
        "Set VISION_API_KEY and VISION_API_URL in environment variables."
    );
  }

  const prompt = COMBINED_PROMPT.replace("{edit_prompt}", editPrompt);

  // Different request formats for different vision providers
  let body: any;
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  switch (visionProvider) {
    case 'mimo':
    case 'openai':
      headers["Authorization"] = `Bearer ${visionApiKey}`;
      body = {
        model: visionModel,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 1024,
      };
      break;
    
    case 'anthropic':
      headers["x-api-key"] = visionApiKey;
      headers["anthropic-version"] = "2023-06-01";
      body = {
        model: visionModel,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image",
                source: {
                  type: "url",
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      };
      break;
    
    default:
      headers["Authorization"] = `Bearer ${visionApiKey}`;
      body = {
        model: visionModel,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 1024,
      };
  }

  const response = await fetch(visionApiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${visionProvider} API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  // Parse response based on provider
  switch (visionProvider) {
    case 'mimo':
    case 'openai':
      return data.choices?.[0]?.message?.content || editPrompt;
    case 'anthropic':
      return data.content?.[0]?.text || editPrompt;
    default:
      return data.choices?.[0]?.message?.content || data.content?.[0]?.text || editPrompt;
  }
}

export async function repaintImage(params: {
  image_url: string;
  edit_prompt: string;
  strength?: number;
  size?: string;
  model?: string;
}): Promise<RepaintResult> {
  const size = params.size || "1024x768";
  const model = params.model || "agnes-image-2.1-flash";
  const strength = params.strength ?? 0.7;

  // Single MIMO call: analyze image + generate optimized prompt
  const optimizedPrompt = await analyzeAndOptimize(params.image_url, params.edit_prompt);

  // Call Agnes img2img API
  const client = new AgnesClient();
  const response = await client.generateImageToImage(
    params.image_url,
    optimizedPrompt,
    { size, model }
  );

  return {
    url: response.url,
    source_url: params.image_url,
    edit_prompt: params.edit_prompt,
    optimized_prompt: optimizedPrompt,
    strength,
    size,
    model,
    timestamp: Date.now(),
  };
}
