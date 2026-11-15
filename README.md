# NIXHub Assistant

Local-first Android AI chat client. MVP supports user-configured OpenAI-compatible and Anthropic-compatible HTTPS endpoints. API keys stay in Android secure storage; conversation history stays in local SQLite. Messages and relevant history are sent directly to selected provider.

## Try on Android with Expo Go

1. Install Expo Go from Google Play.
2. On computer and phone, join same Wi-Fi network.
3. Run `npm install`, then `npm run start:tunnel`.
4. Scan QR code using Expo Go.

Expo Go supports app's current baseline. Native integrations or later changes requiring custom native modules need development build. No USB required.

## Installable Android preview APK

Build internal APK with EAS:

```sh
npx eas-cli login
npm run build:android:preview
```

EAS prompts for Android signing setup if needed. When build finishes, open EAS build URL on phone and download/install APK. Android may ask permission to install from browser; grant only for trusted download, then disable again.

Local APK build alternative, when Android SDK/NDK toolchain is installed:

```sh
npx eas-cli build --platform android --profile preview --local
```

## First setup

On first launch, read data disclosure. Skip provider setup to view app, or add HTTPS endpoint in Models. Add API key and fetch models; if fetch unavailable, enter model ID manually. Use Test connection before chat. User pays provider charges and must review provider privacy/retention policy.

## Development checks

```sh
npx expo lint
npx jest --runInBand --no-coverage
npx expo-doctor
npx expo export --platform android
```

Read `PRIVACY.md`, `TERMS.md`, and `DISCLAIMER.md` before release. This MVP has no NIXHub backend, OAuth integrations, or telemetry.
