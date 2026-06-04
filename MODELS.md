# Supported Model Providers

## Image Generation Models

### Agnes AI (Recommended for Chinese users)
- **Website**: https://agnes-ai.com
- **API Endpoint**: `https://apihub.agnes-ai.com/v1/images/generations`
- **Models**: `agnes-image-2.1-flash`, `agnes-image-2.0-flash`
- **Features**: Fast generation, good quality
- **Get API Key**: Register at https://agnes-ai.com

### OpenAI DALL-E
- **Website**: https://platform.openai.com
- **API Endpoint**: `https://api.openai.com/v1/images/generations`
- **Models**: `dall-e-3`, `dall-e-2`
- **Features**: High quality, supports img2img
- **Get API Key**: https://platform.openai.com/api-keys

### Stability AI
- **Website**: https://stability.ai
- **API Endpoint**: `https://api.stability.ai/v1/generation/{engine_id}/image-to-image`
- **Models**: `stable-diffusion-xl-1024-v1-0`, `stable-diffusion-v1-6`
- **Features**: Open source, many variants
- **Get API Key**: https://platform.stability.ai/account/keys

### Replicate
- **Website**: https://replicate.com
- **API Endpoint**: `https://api.replicate.com/v1/predictions`
- **Models**: `stability-ai/sdxl`, `black-forest-labs/flux-schnell`
- **Features**: Many open-source models available
- **Get API Key**: https://replicate.com/account/api-tokens

## Vision/Multimodal Models (for image analysis)

### Xiaomi MIMO (Recommended for Chinese users)
- **Website**: https://api.xiaomimimo.com
- **API Endpoint**: `https://api.xiaomimimo.com/v1/chat/completions`
- **Models**: `mimo-v2-omni` (supports image + text)
- **Features**: Good Chinese support, fast
- **Get API Key**: https://api.xiaomimimo.com

### OpenAI GPT-4V
- **Website**: https://platform.openai.com
- **API Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Models**: `gpt-4o`, `gpt-4-vision-preview`
- **Features**: Best quality, expensive
- **Get API Key**: https://platform.openai.com/api-keys

### Anthropic Claude
- **Website**: https://console.anthropic.com
- **API Endpoint**: `https://api.anthropic.com/v1/messages`
- **Models**: `claude-3-opus-20240229`, `claude-3-sonnet-20240229`
- **Features**: Good quality, supports vision
- **Get API Key**: https://console.anthropic.com/settings/keys

### Google Gemini
- **Website**: https://makersuite.google.com
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent`
- **Models**: `gemini-pro-vision`
- **Features**: Free tier available
- **Get API Key**: https://makersuite.google.com/app/apikey

## Configuration Examples

### Agnes + MIMO (Default)
```json
{
  "IMAGE_PROVIDER": "agnes",
  "IMAGE_API_KEY": "your-agnes-key",
  "VISION_PROVIDER": "mimo",
  "VISION_API_KEY": "your-mimo-key"
}
```

### OpenAI (DALL-E + GPT-4V)
```json
{
  "IMAGE_PROVIDER": "openai",
  "IMAGE_API_KEY": "your-openai-key",
  "VISION_PROVIDER": "openai",
  "VISION_API_KEY": "your-openai-key"
}
```

### Mixed (Agnes + OpenAI Vision)
```json
{
  "IMAGE_PROVIDER": "agnes",
  "IMAGE_API_KEY": "your-agnes-key",
  "VISION_PROVIDER": "openai",
  "VISION_API_KEY": "your-openai-key"
}
```
