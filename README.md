# Notecore

Local-first **secure notes + credential vault** built with React + Vite + Tailwind + Capacitor (Android-ready).

Notecore is a secure, open-source offline notepad app that lets you store important information such as government IDs, social media accounts, gmail accounts, and personal credentials directly on your device.

## Download APK

- **Latest APK (direct):** [Download notecore-latest-debug.apk](https://github.com/feehabcore/notecore/releases/latest/download/notecore-latest-debug.apk)
- **All release assets:** [GitHub Releases](https://github.com/feehabcore/notecore/releases)

## What this app does

- **Notes**: create, edit, delete, and search notes (stored in your browser).
- **Credentials**: add logins (website/app, username/email, password, category).
- **Monthly privacy reminder**: if a credential password hasn’t been changed in **30 days**, it’s flagged as **due**.
  - Optional browser notifications (Settings → Browser notifications).
- **Sensitive note detection (best-effort)**: if a note looks like it contains a username/password + website, it can also be flagged after 30 days.

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev
```

Open `http://localhost:3000/`.

## Android (APK trial build)

This project now includes Capacitor Android files in `android/`.

### 1) Sync latest web app into Android project

```bash
npm run android:sync
```

### 2) Open Android Studio

```bash
npm run android:open
```

Then in Android Studio:

- Wait for Gradle sync
- Build debug APK:
  - **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- Output is usually at:
  - `android/app/build/outputs/apk/debug/app-debug.apk`

### 3) GitHub trial APK download

A workflow is added at `.github/workflows/android-apk.yml`.

After pushing to GitHub:

- Go to **Actions**
- Run **Build Android APK** (or it auto-runs on push to main/master)
- Download artifact: `notecore-debug-apk`
- Install `app-debug.apk` on Android for trial/testing

### 4) Easy install from Releases (recommended)

Use the release workflow `.github/workflows/android-release-apk.yml`:

1. Open **Actions > Build And Release Android APK**
2. Click **Run workflow**
3. Enter tag (example: `v1.0.0`)
4. After success, open **Releases** in your repo
5. Download `notecore-v1.0.0-debug.apk` directly

After each release workflow run, this stable link is updated automatically:

- [Latest direct APK link](https://github.com/feehabcore/notecore/releases/latest/download/notecore-latest-debug.apk)

## Google Play (later)

For Play Store release, generate a **signed release AAB** from Android Studio:

- **Build > Generate Signed Bundle / APK**
- Choose **Android App Bundle (AAB)**
- Use your release keystore
- Upload generated `.aab` to Google Play Console
