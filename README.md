# RHEMA VBS — Android Teacher App

A teacher-only Android companion app for the existing VBS Management backend. This repository is intentionally separate from the backend and web application.

## Stack

- Expo SDK 58 / React Native 0.88 / TypeScript
- Expo Router
- TanStack Query
- Expo SecureStore for access and refresh tokens
- Existing Express API: `https://vbs-test.onrender.com/api`

## Current Phase 1 scope

- Expo Router project foundation and RHEMA VBS identity
- Teacher-only login and route protection
- Secure token persistence and refresh-token rotation
- Teacher dashboard
- Assigned-class student directory (backend enforces teacher class scope)
- Attendance window status and per-student Present/Absent submission
- Initial EAS Android build profiles

Attendance submission is integrated using the backend's verified request shape. Live account/device testing remains required before production use.

## Setup

Requirements: Node.js 22.13+ and npm.

```bash
npm install
cp .env.example .env
npx expo install --fix
npm run typecheck
npx expo start
```

Set `EXPO_PUBLIC_API_BASE_URL` in `.env` if the API host changes. Never put credentials, JWT secrets, or private API keys in Expo public environment variables.

## Attendance

The attendance screen loads the teacher-scoped student list, checks the IST attendance window, checks whether a record already exists for today, and lets the teacher mark each student Present or Absent before submitting. The backend validates the assigned class, VBS schedule, time window, and duplicate submission. The app defaults each student to Present, so teachers must review every row before confirmation.

## Android build

Install EAS CLI and sign in:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

The preview profile produces an installable APK. The production profile produces an Android App Bundle (AAB).

## API contract notes

- Login: `POST /auth/login` with `{ "userID": "...", "password": "..." }`.
- Login response tokens are under `data.accessToken` and `data.refreshToken`; user is under `data.user`.
- Session: `GET /auth/me`.
- Refresh: `POST /auth/refresh` with `{ "refreshToken": "..." }`. The backend rotates both tokens.
- Logout: `POST /auth/logout` with `{ "refreshToken": "..." }`.
- Students: `GET /students?page=1&limit=100`; backend filters teacher results to the assigned class.
- Attendance window: `GET /attendance/window-status`.
- Student attendance POST contract: `{ "date": "YYYY-MM-DD", "classId": "...", "records": [{ "studentId": "...", "status": "present" | "absent" }] }`. The server validates class assignment, VBS schedule, date and attendance window.

The mobile client does not replace server authorization. The API remains the source of truth for teacher role and class assignment.

## Important

1. Do not share test or production teacher passwords in source code, GitHub issues, or screenshots.
2. Test with a dedicated teacher account, never an administrator account.
3. The backend's teacher model currently associates a teacher with one assigned class.
4. Native Android requests do not require browser CORS behavior; do not weaken backend CORS settings for the app.
5. Run `npx expo install --fix` after changing Expo SDK dependencies, then run `npx expo-doctor`.

## Roadmap

- Verify real API response shapes and active-year/class details against a test teacher.
- Complete attendance form and duplicate-submission handling.
- QR attendance only after validating the intended teacher scan flow.
- Notifications, offline-friendly caching, accessibility and release hardening.
