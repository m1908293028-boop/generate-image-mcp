#!/usr/bin/env node

import { createInterface } from 'readline';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

interface Platform {
  name: string;
  configPath: string;
  format: 'opencode' | 'claude' | 'cursor' | 'windsurf' | 'cline';
}

interface ModelProvider {
  name: string;
  apiUrl: string;
  models: string[];
  description: string;
}

const imageProviders: Record<string, ModelProvider> = {
  agnes: {
    name: 'Agnes AI',
    apiUrl: 'https://apihub.agnes-ai.com/v1/images/generations',
    models: ['agnes-image-2.1-flash', 'agnes-image-2.0-flash'],
    description: 'Recommended for Chinese users, fast generation'
  },
  openai: {
    name: 'OpenAI DALL-E',
    apiUrl: 'https://api.openai.com/v1/images/generations',
    models: ['dall-e-3', 'dall-e-2'],
    description: 'High quality, supports img2img'
  },
  stability: {
    name: 'Stability AI',
    apiUrl: 'https://api.stability.ai/v1/generation',
    models: ['stable-diffusion-xl-1024-v1-0', 'stable-diffusion-v1-6'],
    description: 'Open source, many variants'
  }
};

const visionProviders: Record<string, ModelProvider> = {
  mimo: {
    name: 'Xiaomi MIMO',
    apiUrl: 'https://api.xiaomimimo.com/v1/chat/completions',
    models: ['mimo-v2-omni'],
    description: 'Recommended for Chinese users, fast'
  },
  openai: {
    name: 'OpenAI GPT-4V',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o', 'gpt-4-vision-preview'],
    description: 'Best quality, expensive'
  },
  anthropic: {
    name: 'Anthropic Claude',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
    description: 'Good quality, supports vision'
  }
};

const platforms: Platform[] = [
  {
    name: 'OpenCode',
    configPath: join(homedir(), '.config', 'opencode', 'opencode.json'),
    format: 'opencode'
  },
  {
    name: 'Claude Desktop',
    configPath: join(homedir(), '.claude', 'mcp.json'),
    format: 'claude'
  },
  {
    name: 'Cursor',
    configPath: join(homedir(), '.cursor', 'mcp.json'),
    format: 'cursor'
  },
  {
    name: 'Windsurf',
    configPath: join(homedir(), '.windsurf', 'mcp.json'),
    format: 'windsurf'
  },
  {
    name: 'Cline (VS Code)',
    configPath: process.platform === 'win32'
      ? join(homedir(), 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
      : process.platform === 'darwin'
        ? join(homedir(), 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
        : join(homedir(), '.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
    format: 'cline'
  }
];

function generateConfig(format: string, imageProvider: string, visionProvider: string, imageKey: string, visionKey: string): string {
  const imageConfig = imageProviders[imageProvider];
  const visionConfig = visionProviders[visionProvider];

  const env: Record<string, string> = {
    IMAGE_PROVIDER: imageProvider,
    IMAGE_API_KEY: imageKey,
    IMAGE_API_URL: imageConfig.apiUrl,
    IMAGE_MODEL: imageConfig.models[0],
    VISION_PROVIDER: visionProvider,
    VISION_API_KEY: visionKey,
    VISION_API_URL: visionConfig.apiUrl,
    VISION_MODEL: visionConfig.models[0]
  };

  switch (format) {
    case 'opencode':
      return JSON.stringify({
        mcp: {
          'generate-image': {
            type: 'local',
            command: ['npx', '--yes', 'generate-image-mcp'],
            enabled: true,
            environment: env,
            timeout: 120000
          }
        },
        experimental: {
          mcp_timeout: 120000
        }
      }, null, 2);

    case 'claude':
    case 'cursor':
    case 'windsurf':
    case 'cline':
      return JSON.stringify({
        mcpServers: {
          'generate-image': {
            command: 'npx',
            args: ['--yes', 'generate-image-mcp'],
            env
          }
        }
      }, null, 2);

    default:
      return '';
  }
}

async function selectProvider(providers: Record<string, ModelProvider>, providerType: string): Promise<string> {
  console.log(`\n=== Select ${providerType} Provider ===\n`);
  
  const providerKeys = Object.keys(providers);
  providerKeys.forEach((key, i) => {
    const provider = providers[key];
    console.log(`${i + 1}. ${provider.name}`);
    console.log(`   ${provider.description}`);
    console.log(`   Models: ${provider.models.join(', ')}\n`);
  });

  const choice = await ask(`Select ${providerType} provider (1-${providerKeys.length}): `);
  const choiceNum = parseInt(choice);
  
  if (choiceNum < 1 || choiceNum > providerKeys.length) {
    console.error('Invalid selection!');
    process.exit(1);
  }

  return providerKeys[choiceNum - 1];
}

export async function runSetup() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         Generate Image MCP - Setup Wizard                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('This wizard will help you configure the Generate Image MCP server.');
  console.log('You will need API keys for:');
  console.log('  1. Image Generation (Agnes, OpenAI DALL-E, or Stability AI)');
  console.log('  2. Vision/Multimodal (MIMO, OpenAI GPT-4V, or Anthropic Claude)\n');
  
  console.log('For detailed information about supported models, see MODELS.md\n');

  // Step 1: Select providers
  const imageProvider = await selectProvider(imageProviders, 'Image Generation');
  const visionProvider = await selectProvider(visionProviders, 'Vision/Multimodal');

  // Step 2: Get API keys
  console.log('\n=== API Keys ===\n');
  console.log(`Get your ${imageProviders[imageProvider].name} API key from:`);
  console.log(`  ${imageProvider === 'agnes' ? 'https://agnes-ai.com' : imageProvider === 'openai' ? 'https://platform.openai.com/api-keys' : 'https://platform.stability.ai/account/keys'}\n`);
  
  const imageKey = await ask(`${imageProviders[imageProvider].name} API Key: `);
  
  console.log(`\nGet your ${visionProviders[visionProvider].name} API key from:`);
  console.log(`  ${visionProvider === 'mimo' ? 'https://api.xiaomimimo.com' : visionProvider === 'openai' ? 'https://platform.openai.com/api-keys' : 'https://console.anthropic.com/settings/keys'}\n`);
  
  const visionKey = await ask(`${visionProviders[visionProvider].name} API Key: `);

  if (!imageKey || !visionKey) {
    console.error('\nError: Both API keys are required!');
    process.exit(1);
  }

  // Step 3: Select platforms
  console.log('\n=== Select Platforms to Configure ===\n');
  platforms.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
  });
  console.log(`${platforms.length + 1}. All platforms`);

  const choice = await ask('\nSelect platform (input number): ');
  const choiceNum = parseInt(choice);

  const selectedPlatforms: Platform[] = [];
  if (choiceNum === platforms.length + 1) {
    selectedPlatforms.push(...platforms);
  } else if (choiceNum >= 1 && choiceNum <= platforms.length) {
    selectedPlatforms.push(platforms[choiceNum - 1]);
  } else {
    console.error('\nInvalid selection!');
    process.exit(1);
  }

  // Step 4: Configure
  console.log('\n=== Configuration Result ===\n');

  for (const platform of selectedPlatforms) {
    const config = generateConfig(platform.format, imageProvider, visionProvider, imageKey, visionKey);
    
    const configDir = join(platform.configPath, '..');
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    let existingConfig = {};
    if (existsSync(platform.configPath)) {
      try {
        existingConfig = JSON.parse(readFileSync(platform.configPath, 'utf-8'));
      } catch (e) {
        // Config file corrupted, use empty object
      }
    }

    const newConfig = JSON.parse(config);
    const mergedConfig = { ...existingConfig, ...newConfig };

    writeFileSync(platform.configPath, JSON.stringify(mergedConfig, null, 2));
    console.log(`✓ ${platform.name} configured: ${platform.configPath}`);
  }

  // Step 5: Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Setup Complete!                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('Configuration Summary:');
  console.log(`  Image Provider: ${imageProviders[imageProvider].name} (${imageProviders[imageProvider].models[0]})`);
  console.log(`  Vision Provider: ${visionProviders[visionProvider].name} (${visionProviders[visionProvider].models[0]})`);
  console.log(`  Platforms: ${selectedPlatforms.map(p => p.name).join(', ')}\n`);
  
  console.log('Next steps:');
  console.log('  1. Restart your AI tool (OpenCode, Claude Desktop, etc.)');
  console.log('  2. The following tools will be available:');
  console.log('     - generate_image: Generate images from text');
  console.log('     - repaint_image: Edit images with natural language\n');
  
  console.log('For more information, see README.md and MODELS.md\n');

  rl.close();
}

// Run if executed directly
if (process.argv[1]?.endsWith('setup.js')) {
  runSetup().catch(console.error);
}
