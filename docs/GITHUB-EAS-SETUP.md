# GitHub → EAS Android builds

This repository can trigger an EAS Android APK build from GitHub Actions.

## One-time setup

1. Sign in to Expo at https://expo.dev/.
2. On your development computer, clone this repository and run:
   ```bash
   npm install
   npx eas-cli login
   npx eas-cli project:init
   ```
   Select or create the Expo project for RHEMA VBS. This writes the EAS `projectId` into `app.json`. Commit and push that change.
3. Create an Expo access token at https://expo.dev/accounts/[account]/settings/access-tokens.
4. In GitHub, open this repository → Settings → Secrets and variables → Actions → New repository secret.
5. Name the secret `EXPO_TOKEN` and paste the Expo access token. Never commit the token to the repository or share it in chat.

## Trigger a build

Open GitHub → Actions → **Android APK build** → Run workflow.

The workflow installs dependencies, runs TypeScript validation, and starts an EAS preview build that produces an installable APK. A push of a version tag such as `v1.0.0` also triggers the workflow.

## Download

When the workflow finishes, open its EAS build link in the job log or visit the Expo dashboard → RHEMA VBS → Builds. Download the APK from the completed EAS build page.

## Important

- The first-time EAS project linking and token secret setup require your action.
- GitHub Actions starts the build; EAS cloud performs the Android compilation.
- EAS build usage may be subject to Expo plan limits.
- Do not add `EXPO_TOKEN` to `.env`, source files, or Git commits.
