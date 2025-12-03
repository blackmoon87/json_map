<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to GitHub Pages.

View your app in AI Studio: https://ai.studio/apps/drive/1fF1nWqD08ThCWxhUIhZfhbxj6GfA_Nbn

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to GitHub Pages

### Option 1: Manual Deployment
1. Build the app:
   ```bash
   npm run build
   ```
2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

### Option 2: Automatic Deployment with GitHub Actions
This repository is configured with a GitHub Actions workflow that automatically deploys your app to GitHub Pages whenever you push to the `main` branch.

### Configure GitHub Pages
1. Go to your repository's Settings
2. Click on "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. Your app will be available at `https://[your-username].github.io/json_map/`

Note: Make sure you've set up your `GEMINI_API_KEY` in the repository's secrets for the deployed version to work.