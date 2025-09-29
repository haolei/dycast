#!/usr/bin/env node

/**
 * Script to package the core/ directory as @dycast/core library
 * This script will:
 * 1. Create dycast-core/ directory structure
 * 2. Copy core files and update import paths
 * 3. Copy required dependencies (logUtil.ts)
 * 4. Generate package.json, tsconfig.json, and build configuration
 * 5. Create index.ts for public API exports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyPatches } from './apply-nodejs-patches.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const coreLibPath = path.join(projectRoot, 'dycast-core');

console.log('🚀 Starting @dycast/core packaging...');

// Step 1: Create directory structure
function createDirectoryStructure() {
  console.log('📁 Creating directory structure...');
  
  const dirs = [
    coreLibPath,
    path.join(coreLibPath, 'src'),
    path.join(coreLibPath, 'src/core'),
    path.join(coreLibPath, 'src/utils'),
    path.join(coreLibPath, 'dist'),
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created: ${path.relative(projectRoot, dir)}`);
    }
  });
}

// Step 2: Copy core files and update imports
function copyCoreFiles() {
  console.log('📂 Copying core files...');
  
  const coreSourcePath = path.join(projectRoot, 'src/core');
  const coreDestPath = path.join(coreLibPath, 'src/core');
  
  const coreFiles = fs.readdirSync(coreSourcePath);
  
  coreFiles.forEach(file => {
    const sourceFile = path.join(coreSourcePath, file);
    const destFile = path.join(coreDestPath, file);
    
    let content = fs.readFileSync(sourceFile, 'utf8');
    
    // Update import paths
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      // Replace @/utils/logUtil with ../utils/logUtil
      content = content.replace(/from ['"]@\/utils\/logUtil['"]/g, "from '../utils/logUtil'");
      
      // Update other potential @/ imports
      content = content.replace(/from ['"]@\//g, "from '../");
    }
    
    fs.writeFileSync(destFile, content);
    console.log(`✅ Copied and updated: ${file}`);
  });
}

// Step 3: Copy required dependencies
function copyDependencies() {
  console.log('📦 Copying dependencies...');
  
  // Copy logUtil.ts
  const logUtilSource = path.join(projectRoot, 'src/utils/logUtil.ts');
  const logUtilDest = path.join(coreLibPath, 'src/utils/logUtil.ts');
  
  if (fs.existsSync(logUtilSource)) {
    fs.copyFileSync(logUtilSource, logUtilDest);
    console.log('✅ Copied: logUtil.ts');
  }
}

// Step 4: Generate package.json
function generatePackageJson() {
  console.log('📄 Generating package.json...');
  
  const packageJson = {
    name: '@dycast/core',
    version: '1.0.0',
    description: 'Core library for DyCast - Douyin live streaming message handling',
    main: 'dist/index.js',
    module: 'dist/index.mjs',
    types: 'dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.mjs',
        require: './dist/index.js'
      }
    },
    files: [
      'dist',
      'src',
      'README.md'
    ],
    scripts: {
      build: 'tsup',
      'build:watch': 'tsup --watch',
      'type-check': 'tsc --noEmit',
      prepublishOnly: 'npm run build'
    },
    keywords: [
      'douyin',
      'live-streaming',
      'websocket',
      'dycast',
      'barrage',
      'chat'
    ],
    author: 'Your Name',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'https://github.com/your-username/dycast-core.git'
    },
    dependencies: {
      pako: '^2.1.0'
    },
    devDependencies: {
      '@types/pako': '^2.0.3',
      tsup: '^8.0.0',
      typescript: '~5.8.0'
    },
    engines: {
      node: '>=16'
    }
  };
  
  fs.writeFileSync(
    path.join(coreLibPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  console.log('✅ Generated package.json');
}

// Step 5: Generate tsconfig.json
function generateTsConfig() {
  console.log('⚙️ Generating tsconfig.json...');
  
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      lib: ['ES2020', 'DOM'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      strict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      outDir: './dist',
      rootDir: './src',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      forceConsistentCasingInFileNames: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };
  
  fs.writeFileSync(
    path.join(coreLibPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  console.log('✅ Generated tsconfig.json');
}

// Step 6: Create index.ts for public API exports
function createIndexFile() {
  console.log('📜 Creating index.ts...');
  
  const indexContent = `/**
 * @dycast/core - Core library for DyCast
 * 
 * This library provides core functionality for connecting to Douyin live streams
 * and handling real-time messages including chat, gifts, likes, and more.
 */

// Core classes and types
export { DyCast } from './core/dycast';
export type { 
  ConnectStatus, 
  LiveRoom, 
  DyLiveInfo, 
  DyImInfo 
} from './core/dycast';

// Event emitter
export { Emitter } from './core/emitter';
export type { EventMap } from './core/emitter';

// Message types and decoders
export type {
  Message,
  User,
  GiftStruct,
  Text,
  RoomRankMessage_RoomRank,
  RoomUserSeqMessage_Contributor
} from './core/model';

export {
  decodeChatMessage,
  decodeControlMessage,
  decodeEmojiChatMessage,
  decodeGiftMessage,
  decodeLikeMessage,
  decodeMemberMessage,
  decodePushFrame,
  decodeResponse,
  decodeRoomRankMessage,
  decodeRoomStatsMessage,
  decodeRoomUserSeqMessage,
  decodeSocialMessage,
  encodePushFrame
} from './core/model';

// Utility functions
export { 
  makeUrlParams, 
  parseLiveHtml 
} from './core/util';

// Request helpers
export { 
  fetchLiveInfo, 
  getLiveInfo, 
  getImInfo 
} from './core/request';

// Signature utilities
export { 
  getSignature, 
  getMsToken 
} from './core/signature';

// Relay functionality
export { Relay } from './core/relay';

// Long integer utilities
export { Long } from './core/Long';

// Logger utilities
export { CLog, printInfo, printSKMCJ } from './utils/logUtil';
`;
  
  fs.writeFileSync(path.join(coreLibPath, 'src/index.ts'), indexContent);
  console.log('✅ Created index.ts with public API exports');
}

// Step 7: Create README.md
function createReadme() {
  console.log('📖 Creating README.md...');
  
  const readmeContent = `# @dycast/core

Core library for DyCast - Douyin live streaming message handling.

## Features

- 🚀 Real-time connection to Douyin live streams
- 💬 Parse chat messages, gifts, likes, and social interactions
- 🔄 Event-driven architecture with built-in emitter
- 📦 TypeScript support with full type definitions
- 🛠 Modular design for easy integration

## Installation

\`\`\`bash
npm install @dycast/core
# or
yarn add @dycast/core
# or
pnpm add @dycast/core
\`\`\`

## Quick Start

\`\`\`typescript
import { DyCast } from '@dycast/core';

const dycast = new DyCast();

// Connect to a live room
dycast.connect('room_id_here').then(() => {
  console.log('Connected to live room!');
});

// Listen for chat messages
dycast.on('chat', (message) => {
  console.log(\`\${message.user?.nickname}: \${message.content}\`);
});

// Listen for gifts
dycast.on('gift', (gift) => {
  console.log(\`\${gift.user?.nickname} sent \${gift.giftName}\`);
});
\`\`\`

## API Documentation

### Core Classes

- **DyCast**: Main class for connecting to live streams
- **Emitter**: Event emitter for handling real-time messages
- **Relay**: WebSocket relay functionality

### Message Types

- Chat messages
- Gift messages
- Like messages
- Member join/leave messages
- Social interactions
- Room statistics

### Utilities

- Message encoding/decoding
- Signature generation
- Request helpers
- Logging utilities

## Development

\`\`\`bash
# Install dependencies
npm install

# Build the library
npm run build

# Type checking
npm run type-check
\`\`\`

## License

MIT
`;
  
  fs.writeFileSync(path.join(coreLibPath, 'README.md'), readmeContent);
  console.log('✅ Created README.md');
}

// Step 8: Create build configuration
function createBuildConfig() {
  console.log('🔧 Creating build configuration...');
  
  // Create .gitignore
  const gitignoreContent = `node_modules/
dist/
*.log
.DS_Store
.env
.env.local
.env.*.local
`;
  
  fs.writeFileSync(path.join(coreLibPath, '.gitignore'), gitignoreContent);
  console.log('✅ Created .gitignore');
  
  // Create .npmignore
  const npmignoreContent = `src/
tsconfig.json
.gitignore
*.log
.DS_Store
.env
.env.local
.env.*.local
`;
  
  fs.writeFileSync(path.join(coreLibPath, '.npmignore'), npmignoreContent);
  console.log('✅ Created .npmignore');
  
  // Create tsup.config.ts
  const tsupConfigContent = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js'
    };
  },
  splitting: false,
  sourcemap: true,
  target: 'es2020',
  platform: 'node'
});`;
  
  fs.writeFileSync(path.join(coreLibPath, 'tsup.config.ts'), tsupConfigContent);
  console.log('✅ Created tsup.config.ts');
}

// Main execution
async function main() {
  try {
    createDirectoryStructure();
    copyCoreFiles();
    copyDependencies();
    generatePackageJson();
    generateTsConfig();
    createIndexFile();
    createReadme();
    createBuildConfig();
    
    // Apply Node.js compatibility patches
    console.log('\n🔧 Applying Node.js compatibility patches...');
    applyPatches();
    
    console.log('\n🎉 Successfully packaged @dycast/core!');
    console.log('\n📋 Next steps:');
    console.log('1. cd dycast-core');
    console.log('2. npm install');
    console.log('3. npm run build');
    console.log('4. npm publish (when ready)');
    console.log('\n📦 Library created at:', path.relative(process.cwd(), coreLibPath));
    
  } catch (error) {
    console.error('❌ Error packaging core:', error);
    process.exit(1);
  }
}

// Run the script
main();
