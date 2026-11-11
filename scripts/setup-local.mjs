#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

console.log('\n============================================================');
console.log(' 🌿 KissanDost AI — Local Environment Bootstrapper & Doctor');
console.log('============================================================\n');

// 1. Check Node.js version
const nodeVersion = process.versions.node;
const major = parseInt(nodeVersion.split('.')[0], 10);
if (major < 18) {
  console.error(`❌ Node.js v${nodeVersion} detected. Please install Node.js v18 or v20+ (LTS).`);
  process.exit(1);
}
console.log(`✅ Node.js Runtime       : v${nodeVersion}`);

// 2. Ensure .env exists (copy from .env.example if missing)
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env          : Copied automatically from .env.example');
  } else {
    fs.writeFileSync(
      envPath,
      [
        'GEMINI_API_KEY=',
        'PORT=3000',
        'NODE_ENV=development',
        'JWT_SECRET_KEY=kissandost-kp-agri-secret-key-2026',
      ].join('\n') + '\n',
      'utf8'
    );
    console.log('✅ Created .env          : Generated default .env file');
  }
} else {
  console.log('✅ Environment File      : .env found');
}

// 3. Inspect GEMINI_API_KEY in .env or process.env
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const keyMatch = envContent.match(/^GEMINI_API_KEY=(.*)$/m);
const fileKey = keyMatch ? keyMatch[1].trim().replace(/^["']|["']$/g, '') : '';
const activeKey = process.env.GEMINI_API_KEY || fileKey;

if (!activeKey || activeKey === 'your_gemini_api_key_here' || activeKey === 'YOUR_GEMINI_API_KEY') {
  console.log(
    '⚠️  GEMINI_API_KEY        : Not set yet (using deterministic MLP + Decision Engine + Browser TTS fallback).'
  );
  console.log(
    '   👉 Tip: Paste your key from https://aistudio.google.com/apikey into .env (GEMINI_API_KEY=AIza...) for Gemini Vision & neural TTS.'
  );
} else {
  const masked = activeKey.slice(0, 6) + '...' + activeKey.slice(-4);
  console.log(`✅ GEMINI_API_KEY        : Configured (${masked})`);
}

// 4. Verify core directories exist
const requiredPaths = [
  'server.ts',
  'src/App.tsx',
  'src/backend/api/v1Router.ts',
  'src/backend/vision/imagePipeline.ts',
  'src/backend/diagnosis/decisionEngine.ts',
  'src/backend/medicine/medicineService.ts',
  'src/backend/llm/geminiService.ts',
  'src/ml/cropDiseaseModel.ts',
];

let missingFiles = 0;
for (const rel of requiredPaths) {
  if (!fs.existsSync(path.join(rootDir, rel))) {
    console.error(`❌ Missing required file : ${rel}`);
    missingFiles++;
  }
}

if (missingFiles === 0) {
  console.log('✅ Project Architecture  : All full-stack AI pipeline & UI modules verified');
} else {
  console.error(`❌ ${missingFiles} required file(s) missing!`);
  process.exit(1);
}

console.log('\n🚀 Ready! The unified Full-Stack App (UI + /api/v1/* Backend) runs on:');
console.log('   👉 http://localhost:3000\n');
