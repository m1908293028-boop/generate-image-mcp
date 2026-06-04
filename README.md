# Generate Image MCP

MCP server for AI image generation and repaint with vision analysis.

## Features

- **Text-to-Image**: Generate images from text prompts
- **Image-to-Image (Repaint)**: Edit existing images using natural language descriptions
- **Vision Analysis**: Intelligent image understanding and prompt optimization
- **Multi-provider support**: Works with Agnes, OpenAI DALL-E, Stability AI, and more
- **Metadata tracking**: Automatic metadata storage for all generated/edited images
- **Multi-platform support**: Works with OpenCode, Claude Desktop, Cursor, Windsurf, and more

## Supported Providers

### Image Generation
- **Agnes AI** - Recommended for Chinese users, fast generation
- **OpenAI DALL-E** - High quality, supports img2img
- **Stability AI** - Open source, many variants

### Vision/Multimodal
- **Xiaomi MIMO** - Recommended for Chinese users, fast
- **OpenAI GPT-4V** - Best quality, expensive
- **Anthropic Claude** - Good quality, supports vision

For detailed information, see [MODELS.md](MODELS.md).

## Tools

### `generate_image`

Generate an image from a text prompt.

**Parameters:**
- `prompt` (string, required): Description of the image
- `size` (string, optional): Output size, default `1024x1024`
- `model` (string, optional): Model name, default `agnes-image-2.1-flash`
- `n` (number, optional): Number of images, default `1`

### `repaint_image`

Edit an existing image using natural language.

**Parameters:**
- `image_url` (string, required): URL of the original image
- `edit_prompt` (string, required): Natural language description of what to change
- `size` (string, optional): Output size, default `1024x768`
- `model` (string, optional): Model name, default `agnes-image-2.1-flash`
- `strength` (number, optional): Edit strength 0-1, default `0.7`

## Quick Setup

```bash
npx generate-image-mcp-setup
```

The setup wizard will:
1. Ask for your API keys
2. Let you choose which platform to configure
3. Automatically update the configuration file

## Installation

### From npm (Recommended)

```bash
npm install -g generate-image-mcp
generate-image-mcp-setup
```

### From GitHub

```bash
# Option 1: Direct install from GitHub
npm install -g github:m1908293028-boop/generate-image-mcp

# Option 2: Clone and install
git clone https://github.com/m1908293028-boop/generate-image-mcp.git
cd generate-image-mcp
npm install
npm run build
npm link

# Then run setup
generate-image-mcp-setup
```

### Via npx (No Installation)

```bash
npx --yes generate-image-mcp
```

The setup wizard will:
1. Ask for your API keys
2. Let you choose which platform to configure
3. Automatically update the configuration file

## Manual Installation

```bash
# Install globally
npm install -g generate-image-mcp

# Run setup wizard
generate-image-mcp-setup
```

## Platform-Specific Configuration

### OpenCode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "generate-image": {
      "type": "local",
      "command": ["npx", "--yes", "generate-image-mcp"],
      "enabled": true,
      "environment": {
        "IMAGE_PROVIDER": "agnes",
        "IMAGE_API_KEY": "your-image-api-key",
        "IMAGE_API_URL": "https://apihub.agnes-ai.com/v1/images/generations",
        "IMAGE_MODEL": "agnes-image-2.1-flash",
        "VISION_PROVIDER": "mimo",
        "VISION_API_KEY": "your-vision-api-key",
        "VISION_API_URL": "https://api.xiaomimimo.com/v1/chat/completions",
        "VISION_MODEL": "mimo-v2-omni"
      },
      "timeout": 120000
    }
  },
  "experimental": {
    "mcp_timeout": 120000
  }
}
```

### Claude Desktop

Add to `~/.claude/mcp.json` (macOS/Linux) or `%USERPROFILE%\.claude\mcp.json` (Windows):

```json
{
  "mcpServers": {
    "generate-image": {
      "command": "npx",
      "args": ["--yes", "generate-image-mcp"],
      "env": {
        "IMAGE_PROVIDER": "agnes",
        "IMAGE_API_KEY": "your-image-api-key",
        "IMAGE_API_URL": "https://apihub.agnes-ai.com/v1/images/generations",
        "IMAGE_MODEL": "agnes-image-2.1-flash",
        "VISION_PROVIDER": "mimo",
        "VISION_API_KEY": "your-vision-api-key",
        "VISION_API_URL": "https://api.xiaomimimo.com/v1/chat/completions",
        "VISION_MODEL": "mimo-v2-omni"
      }
    }
  }
}
```

**Note**: You can also use project-level config at `<project-root>/.claude/mcp.json` to override global settings.

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "generate-image": {
      "command": "npx",
      "args": ["--yes", "generate-image-mcp"],
      "env": {
        "IMAGE_PROVIDER": "agnes",
        "IMAGE_API_KEY": "your-image-api-key",
        "IMAGE_API_URL": "https://apihub.agnes-ai.com/v1/images/generations",
        "IMAGE_MODEL": "agnes-image-2.1-flash",
        "VISION_PROVIDER": "mimo",
        "VISION_API_KEY": "your-vision-api-key",
        "VISION_API_URL": "https://api.xiaomimimo.com/v1/chat/completions",
        "VISION_MODEL": "mimo-v2-omni"
      }
    }
  }
}
```

### Windsurf

Add to `~/.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "generate-image": {
      "command": "npx",
      "args": ["--yes", "generate-image-mcp"],
      "env": {
        "IMAGE_PROVIDER": "agnes",
        "IMAGE_API_KEY": "your-image-api-key",
        "IMAGE_API_URL": "https://apihub.agnes-ai.com/v1/images/generations",
        "IMAGE_MODEL": "agnes-image-2.1-flash",
        "VISION_PROVIDER": "mimo",
        "VISION_API_KEY": "your-vision-api-key",
        "VISION_API_URL": "https://api.xiaomimimo.com/v1/chat/completions",
        "VISION_MODEL": "mimo-v2-omni"
      }
    }
  }
}
```

### Cline (VS Code)

Add to `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` (Windows) or `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` (macOS):

```json
{
  "mcpServers": {
    "generate-image": {
      "command": "npx",
      "args": ["--yes", "generate-image-mcp"],
      "env": {
        "IMAGE_PROVIDER": "agnes",
        "IMAGE_API_KEY": "your-image-api-key",
        "IMAGE_API_URL": "https://apihub.agnes-ai.com/v1/images/generations",
        "IMAGE_MODEL": "agnes-image-2.1-flash",
        "VISION_PROVIDER": "mimo",
        "VISION_API_KEY": "your-vision-api-key",
        "VISION_API_URL": "https://api.xiaomimimo.com/v1/chat/completions",
        "VISION_MODEL": "mimo-v2-omni"
      }
    }
  }
}
```

## API Keys

### Image Generation Provider

Choose one of the following:

#### Agnes AI (Recommended for Chinese users)
- Website: https://agnes-ai.com
- Get API Key: Register at https://agnes-ai.com
- Endpoint: `https://apihub.agnes-ai.com/v1/images/generations`

#### OpenAI DALL-E
- Website: https://platform.openai.com
- Get API Key: https://platform.openai.com/api-keys
- Endpoint: `https://api.openai.com/v1/images/generations`

#### Stability AI
- Website: https://stability.ai
- Get API Key: https://platform.stability.ai/account/keys
- Endpoint: `https://api.stability.ai/v1/generation`

### Vision/Multimodal Provider

Choose one of the following:

#### Xiaomi MIMO (Recommended for Chinese users)
- Website: https://api.xiaomimimo.com
- Get API Key: https://api.xiaomimimo.com
- Endpoint: `https://api.xiaomimimo.com/v1/chat/completions`

#### OpenAI GPT-4V
- Website: https://platform.openai.com
- Get API Key: https://platform.openai.com/api-keys
- Endpoint: `https://api.openai.com/v1/chat/completions`

#### Anthropic Claude
- Website: https://console.anthropic.com
- Get API Key: https://console.anthropic.com/settings/keys
- Endpoint: `https://api.anthropic.com/v1/messages`

## How It Works

1. **Text-to-Image**: Sends prompt directly to Agnes API
2. **Image-to-Image**:
   - MIMO analyzes the original image and user's edit request
   - Generates an optimized prompt preserving unchanged elements
   - Sends optimized prompt + original image to Agnes API
   - Returns the edited image

## Example Usage

### Generate Image

```
Generate a cyberpunk street night scene with neon lights
```

### Repaint Image

```
Change the sky to blood red with a blood moon, keep everything else the same
```

## License

MIT
