# NIXHub Assistant MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans implement task-by-task. Steps use checkbox syntax.  
> **Goal:** Ship a production-minded Android MVP for local-first AI chat with Expo, NativeWind UI, custom API providers, secure key storage, and QR-based Expo Go iteration.  
> **Architecture:** Expo Router UI consumes typed application services. Provider adapters and conversation persistence remain independent; custom OpenAI/Anthropic-compatible adapters deliver first working model access, while OAuth integrations require separate compliance validation.  
> **Tech Stack:** Expo / React Native / JavaScript only (`.js` logic/config, `.jsx` UI; no `.ts`/`.tsx`), JSDoc contracts, Expo Router, NativeWind, React Native Reusables, Zustand, TanStack Query, expo-sqlite, Drizzle ORM, expo-secure-store, Jest, React Native Testing Library, Maestro, EAS.  
> **Spec:** `docs/superpowers/specs/2026-11-15-nixhub-assistant-design.md`; product requirements `PRD.md`.

## Global Constraints

- Android 8+ (API 26), iOS 15+; Android first; iOS build via EAS/macOS.
- No USB workflow; Expo Go via QR for compatible features; EAS development build for native features.
- No NIXHub backend/proxy, no MCP, no browser-session scraping, no arbitrary downloaded executable plugins.
- DeepSeek via official API only; ChatGPT/Gemini Tier B OAuth ships only after viability and compliance validation.
- Tokens/API keys only in secure storage; never log secrets; no telemetry without opt-in.
- UI uses NativeWind and React Native Reusables; Indonesian and English; light/dark/system themes.
- Do not claim production readiness until release hardening, compliance review, signed build, automated checks, and no known critical security defects.

## Review Focus

- API keys containing whitespace, quotes, or Unicode never leak to logs and survive secure-store roundtrip; test in secure-storage task.
- Custom provider endpoints with malformed URLs, non-TLS schemes, redirects, and hostile headers fail safely; test validation/transport task.
- SSE split across arbitrary network chunks, `[DONE]`, malformed frames, disconnects, and cancellation do not corrupt messages; test streaming task.
- Empty/very long histories and switching model/provider preserve ordering and prevent accidental message loss; test persistence/chat task.
- Provider returns 401/403/402/429/5xx, timeout, or invalid JSON; show actionable error and retry/failover only where designed; test adapter/router task.

---

## File Structure

- `app/` Expo Router routes: onboarding, tab shell, chat, models, settings.
- `src/components/` shared NativeWind / React Native Reusables UI.
- `src/features/chat/`, `src/features/models/`, `src/features/onboarding/` feature screens and state.
- `src/core/providers/` provider contract, registry, custom adapters, SSE parser.
- `src/core/conversations/` conversation/message schema, persistence, repository.
- `src/core/security/` secure secret repository, URL/key validation, redaction.
- `src/core/storage/` SQLite + Drizzle schema and migrations.
- `src/core/theme/`, `src/core/i18n/` design tokens and locales.
- `src/core/config/` environment-safe app config.
- `drizzle/` SQLite migrations.
- `__tests__/` unit/component tests; `e2e/` Maestro flows.
- `.github/workflows/` lint, typecheck, tests, EAS build/release workflows.
- Root config: `package.json`, `app.json`, `eas.json`, `jsconfig.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `jest.config.js`, `README.md`, `LICENSE`, `SECURITY.md`, `DISCLAIMER.md`, `PRIVACY.md`, `TERMS.md`.

## Task 1: Expo foundation and NativeWind design system

**Files:** root Expo configs; `app/_layout.jsx`; `app/(tabs)/_layout.jsx`; `app/(tabs)/index.jsx`; `src/core/theme/*`; `src/core/i18n/*`; shared UI components; `__tests__/app/*`.

- [ ] Create Expo JavaScript project in this repository with Expo Router, NativeWind v4-compatible Expo setup, NativeWind-based React Native Reusables primitives, Lucide icons, JSDoc public contracts, Jest/RNTL, and EAS config. Use `.jsx` only for UI, `.js` for logic/config; no `.ts` or `.tsx` files. Keep existing `PRD.md` and design docs.
- [ ] Define design tokens: neutral zinc/slate surfaces, indigo accent, compact 4/8 spacing, 10–12 radius, accessible contrast; light, dark, system modes.
- [ ] Add Indonesian/English localization with Indonesian default and typed translation keys.
- [ ] Add tab shell Chat, Models, Explore, Library, Settings; MVP-only unavailable tabs show clearly marked “coming later” screen, not fake functionality.
- [ ] Add component tests for tab labels, language switching, theme switching, and minimum 44-point target for primary controls.
- [ ] Run `npx expo-doctor`, `npx eslint .`, `npx jest --runInBand`; fix all errors.

## Task 2: Local storage and secure secrets

**Files:** `src/core/storage/schema.js`; `src/core/storage/database.js`; `src/core/storage/migrations/*`; `src/core/conversations/types.js`; `src/core/conversations/repository.js`; `src/core/security/secrets.js`; tests and fixtures.

- [ ] Write tests for conversation/message create/list/update/delete, stable ordering, transactions, and schema migrations on empty and existing databases.
- [ ] Add Drizzle SQLite schema for `conversations`, `messages`, `provider_accounts`, `model_configs`, and `usage_events`; use UUID IDs and ISO UTC timestamps; persist message role/content/provider/model/status and error metadata.
- [ ] Expose repository interface `ConversationRepository` with `createConversation`, `listConversations`, `getConversation`, `appendMessage`, `updateMessage`, `deleteConversation`, and `searchConversations`.
- [ ] Implement `SecretStore` interface `setSecret(id: string, value: string): Promise<void>`, `getSecret(id: string): Promise<string | null>`, `deleteSecret(id: string): Promise<void>` via expo-secure-store. Persist only opaque secret references in SQLite.
- [ ] Verify tests cover whitespace/Unicode secrets and no secret value appears in thrown errors/log output.
- [ ] Run unit tests and migration test suite.

## Task 3: Provider contracts and safe custom provider configuration

**Files:** `src/core/providers/types.js`; `src/core/providers/registry.js`; `src/core/providers/errors.js`; `src/core/security/provider-config.js`; `src/core/providers/custom/openai.js`; `src/core/providers/custom/anthropic.js`; tests.

- [ ] Write contract tests for `ProviderAdapter`: `listModels(account)`, `streamChat(request, account, signal): AsyncIterable<ChatEvent>`, `capabilities(model)`, and `normalizeError(error): ProviderError`.
- [ ] Define normalized `ChatMessage`, `ChatRequest`, `ChatEvent` (`text_delta`, `usage`, `tool_call`, `done`, `error`), `ModelDescriptor`, `ProviderAccount`, `ProviderError` (`RATE_LIMIT | QUOTA | AUTH | NETWORK | SERVER | INVALID_REQUEST | UNKNOWN`).
- [ ] Implement URL validation: HTTPS required except explicit loopback/private-LAN development opt-in; reject embedded credentials and malformed URLs; prohibit redirect credential forwarding to a different origin; default custom headers must not override authorization silently.
- [ ] Implement OpenAI-compatible `/v1/models` and `/v1/chat/completions` streaming adapter; bearer API key only from `SecretStore`; parse usage and errors.
- [ ] Implement Anthropic-compatible `/v1/messages` streaming adapter; `x-api-key`, `anthropic-version`, streaming events, usage, errors.
- [ ] Add “Test connection” and model fetch services; manual model ID remains allowed when `/models` is unavailable.
- [ ] Add secret redaction utility for authorization/API-key headers and provider response errors.
- [ ] Test arbitrary SSE chunk boundaries, CRLF, multi-line `data:`, `[DONE]`, malformed event, abort, HTTP 401/403/402/429/5xx, timeout, invalid JSON, and malicious redirect.
- [ ] Run provider tests; ensure fixture API keys never appear in captured logs/errors.

## Task 4: Chat streaming and local history

**Files:** `app/(tabs)/index.jsx`; `app/chat/[conversationId].jsx`; `src/features/chat/*`; `src/components/chat/*`; `src/core/conversations/engine.js`; tests.

- [ ] Write tests for sending a user message, assistant streaming deltas, completion, error/cancel, restart restore, model switch retaining history, and provider/model attribution.
- [ ] Implement conversation engine `sendMessage(conversationId, request, adapter, account): Promise<void>`; persist user message before network; persist assistant placeholder and incremental text; ensure cancellation/error leaves recoverable status.
- [ ] Build compact chat list and conversation screen using virtualized `FlatList`; use Markdown renderer with safe links, code block copy, horizontal table handling; include provider/model attribution on assistant responses.
- [ ] Build composer with multiline input, disabled/sending state, cancel generation, draft autosave, and accessible 44-point actions. Attachments deferred (PRD P1).
- [ ] Add model chip/picker with configured custom providers and models; switching sends complete prior history.
- [ ] Add search, pin, archive, delete, export Markdown/JSON for local conversations.
- [ ] Test long history, empty history, rapid duplicate send, app background/reopen, and provider error display.
- [ ] Run unit/component tests and `npx expo export --platform android`.

## Task 5: Onboarding, custom provider management, legal disclosures

**Files:** `app/onboarding.jsx`; `app/(tabs)/models.jsx`; `app/settings/*`; `src/features/models/*`; `src/features/onboarding/*`; `src/core/i18n/locales/*`; legal docs.

- [ ] Write component tests for onboarding first run, custom provider validation, save/delete, API-key masking, and disclosure acknowledgment.
- [ ] Implement onboarding intro, privacy/legal disclosure, first custom provider setup, and “skip for now”; no false promise of zero-setup consumer OAuth.
- [ ] Implement Models screen: add/edit/delete custom endpoint, select OpenAI/Anthropic format, test connection, fetch models, manually add model, capability switches.
- [ ] Keep API key exclusively in `SecretStore`; mask in UI; never export key with config.
- [ ] Add Settings for language/theme, default system prompt, disclaimer, privacy, terms, app version, and local debug log export with redaction.
- [ ] Create `DISCLAIMER.md`, `PRIVACY.md`, `TERMS.md` stating local-first storage, selected provider data transmission, no affiliation, user responsibility, experimental provider risks, and credential revocation.
- [ ] Validate strings in Indonesian and English; test accessibility labels and contrast.

## Task 6: Expo Go QR and EAS Android build workflows (no USB)

**Files:** `app.json`; `eas.json`; `.github/workflows/ci.yml`; `.github/workflows/android-preview.yml`; `README.md`; `e2e/maestro/*`.

- [ ] Configure app scheme `nixhub`, Android package ID, Expo Router plugin, secure-store/sqlite plugins, runtime version, and build profiles `development`, `preview` (APK/internal), `production` (AAB or APK as appropriate).
- [ ] Configure README commands: `npx expo start` + scan QR using Expo Go for compatible project; note native/auth integrations require EAS development build; explicitly state no USB required.
- [ ] Configure EAS profiles to generate installable Android APK for development/preview and production artifact; installation via EAS URL/browser download on phone.
- [ ] Add Maestro smoke flow for first launch, onboarding skip, create chat, settings navigation; CI can run static/unit checks without physical device.
- [ ] Add GitHub Actions for `npm ci`, lint, typecheck, tests, Expo doctor; EAS build/release only on protected/manual/tagged workflow, never expose signing credentials in PR logs.
- [ ] Verify QR workflow starts and app can open via Expo Go for supported baseline; verify `eas build --platform android --profile preview --local` where host resources permit. If local build exceeds laptop limits, verify cloud profile config and report EAS credentials/account prerequisite.

## Task 7: MVP quality gate and release documentation

**Files:** `README.md`; `LICENSE`; `SECURITY.md`; `CONTRIBUTING.md`; `docs/ARCHITECTURE.md`; `.github/ISSUE_TEMPLATE/*`; tests.

- [ ] Add MIT license and contribution/security/architecture docs.
- [ ] Document current supported providers (custom OpenAI/Anthropic-compatible), unsupported DeepSeek Web, and OAuth adapters as blocked pending provider approval/client configuration.
- [ ] Add data export/import for non-secret config, local usage counts, and local routing-ready schema; do not imply backup encryption shipped until implemented/tested.
- [ ] Run `npx expo-doctor`, formatter/linter, Jest, `npx expo export --platform android`, dependency audit, and Android EAS build validation.
- [ ] Verify release artifact installs via phone browser/download flow without USB; verify clean install, upgrade, offline launch, secret persistence, and deletion.
- [ ] Publish no production claim while any P0 test/build/compliance gate fails; record remaining OAuth, provider terms, privacy/legal review, and EAS signing prerequisites.

## Deferred after MVP

Combo failover and cooldown; OAuth providers (approval and OAuth client setup gates); skills registry; declarative plugin runtime and Google Sheets/Notion/Telegram/WAHA plugins; connected accounts and incremental consent; encrypted backup/import; full usage dashboard and Maestro device matrix. Implement as separate approved plans after MVP boundaries pass.
