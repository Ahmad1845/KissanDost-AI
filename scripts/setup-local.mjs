#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');
const bundlePath = path.join(__dirname, 'restore-bundle.json');

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
    '   👉 Tip: Get a free Gemini key at https://aistudio.google.com/apikey and set GEMINI_API_KEY=AIza... in .env'
  );
} else {
  const masked = activeKey.slice(0, 6) + '...' + activeKey.slice(-4);
  console.log(`✅ GEMINI_API_KEY        : Configured (${masked})`);
  if (!activeKey.startsWith('AIza')) {
    console.log(
      '   ℹ️  Note: Standard Google AI Studio API keys usually start with "AIza...". If Gemini calls fail, the app will automatically fall back to the built-in MLP + Decision Engine + Browser TTS.'
    );
  }
}

// 4. Verify & Self-Heal Core Project Files
const requiredPaths = [
  'server.ts',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'src/main.tsx',
  'src/index.css',
  'src/App.tsx',
  'src/types/index.ts',
  'src/utils/audioSpeech.ts',
  'src/data/knowledgeBase.ts',
  'src/data/translations.ts',
  'src/ml/cropDiseaseModel.ts',
  'src/backend/api/v1Router.ts',
  'src/backend/community/outbreakService.ts',
  'src/backend/config/settings.ts',
  'src/backend/diagnosis/decisionEngine.ts',
  'src/backend/embeddings/embeddingScorer.ts',
  'src/backend/llm/geminiService.ts',
  'src/backend/medicine/medicineService.ts',
  'src/backend/middleware/apiMiddleware.ts',
  'src/backend/pipelines/diagnosisPipeline.ts',
  'src/backend/rag/ragService.ts',
  'src/backend/repositories/scanRepository.ts',
  'src/backend/schemas/apiSchemas.ts',
  'src/backend/services/orchestrationService.ts',
  'src/backend/vision/imagePipeline.ts',
  'src/backend/weather/weatherService.ts',
  'src/components/Header.tsx',
  'src/components/CropScanModal.tsx',
  'src/components/RecommendationView.tsx',
  'src/components/VoiceGuideModal.tsx',
  'src/components/PesticideVerifier.tsx',
  'src/components/FarmManager.tsx',
  'src/components/CommunityIntelligence.tsx',
  'src/components/GovernmentDashboard.tsx',
];

let bundleData = null;
if (fs.existsSync(bundlePath)) {
  try {
    bundleData = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  } catch {
    bundleData = null;
  }
}

let missingFiles = 0;
let restoredCount = 0;

for (const rel of requiredPaths) {
  const fullPath = path.join(rootDir, rel);
  if (!fs.existsSync(fullPath)) {
    let restored = false;

    // Attempt 1: Restore from restore-bundle.json if available
    if (bundleData && typeof bundleData[rel] === 'string') {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, bundleData[rel], 'utf8');
      console.log(`🔧 Auto-restored file    : ${rel} (from local bundle)`);
      restored = true;
      restoredCount++;
    }

    // Attempt 2: Restore from git HEAD if in a git repository
    if (!restored) {
      try {
        execSync(`git checkout HEAD -- "${rel}"`, { cwd: rootDir, stdio: 'ignore' });
        if (fs.existsSync(fullPath)) {
          console.log(`🔧 Auto-restored file    : ${rel} (from git HEAD)`);
          restored = true;
          restoredCount++;
        }
      } catch {
        // Ignore git errors if not in git repo
      }
    }

    if (!restored) {
      console.error(`❌ Missing required file : ${rel}`);
      missingFiles++;
    }
  }
}

if (restoredCount > 0) {
  console.log(`✅ Self-Healing Complete : Restored ${restoredCount} missing project file(s)`);
}

if (missingFiles === 0) {
  console.log('✅ Project Architecture  : All 35 full-stack AI pipeline & UI modules verified');
} else {
  console.warn(
    `⚠️  ${missingFiles} file(s) could not be found. Please re-sync or pull the latest files from AI Studio / GitHub.`
  );
}

console.log('\n🚀 Ready! The unified Full-Stack App (UI + /api/v1/* Backend) runs on:');
console.log('   👉 http://localhost:3000\n');
