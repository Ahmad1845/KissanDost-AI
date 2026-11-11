# Local Machine Setup Guide (`LOCAL_SETUP.md`)

This project runs on your local machine (**Windows, macOS, or Linux**) identically to how it runs inside Google AI Studio—on a single unified port (**`http://localhost:3000`**) with zero CORS issues or extra database dependencies required.

---

## Fixing the Two Windows Errors from Your Screenshots

### 1. Fixing the PowerShell `npm.ps1 cannot be loaded because running scripts is disabled` Error
Windows PowerShell blocks `.ps1` wrappers (`npm.ps1`) by default. You can either:
- **Option A (Instant — no policy change needed)**: Use **`npm.cmd`** instead of `npm` in PowerShell:
  ```powershell
  npm.cmd install
  npm.cmd run local
  ```
  Or run the batch launcher directly:
  ```powershell
  .\start-local.bat
  ```
- **Option B (Permanent fix for PowerShell)**: Run this one-time command in PowerShell:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```

### 2. Fixing the `Missing required file: server.ts / imagePipeline.ts / decisionEngine.ts / cropDiseaseModel.ts` Error
Those 4 files were deleted earlier when your local agent modified `E:\Projects\KissanDost AI`.
- Every single project file (`server.ts`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src/ml/cropDiseaseModel.ts`, `src/backend/vision/imagePipeline.ts`, `src/backend/diagnosis/decisionEngine.ts`, etc.) has now been explicitly touched and synced so your local workspace receives all 35 files.
- In addition, `scripts/setup-local.mjs` now includes **automatic self-healing** to restore any missing files automatically, and `start-local.bat` now uses `npm.cmd` and `pause` so the terminal window never closes abruptly.

---

## Quickest Way to Run Locally (Windows, macOS, Linux)

### Step 1: Install & Auto-Setup
In PowerShell / Terminal at the project root (`E:\Projects\KissanDost AI`):
```powershell
npm.cmd install
npm.cmd run setup
```

### Step 2: Check Your `.env` File
Open `.env` in the root folder and make sure your Gemini API key from [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) is set:
```env
GEMINI_API_KEY=AIzaSyYourRealApiKeyHere
PORT=3000
```

### Step 3: Start the Server
```powershell
npm.cmd run dev
```
*(Or double-click **`start-local.bat`** in Windows Explorer)* and open **`http://localhost:3000`** in your browser!
