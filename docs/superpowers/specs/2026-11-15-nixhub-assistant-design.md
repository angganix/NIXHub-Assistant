# NIXHub Assistant — Product Design

**Status:** Draft for approval  
**Source:** `PRD.md` v0.2  
**Date:** 2026-11-15

## Intent

Build NIXHub Assistant as an open-source, on-device-first React Native app that unifies AI chat across providers, with model switching and later combo failover. Users are AI power users, developers, and mobile-first professionals who want one native interface without a NIXHub proxy or account.

## Goals

- Deliver a usable, production-quality Android MVP in stages, then expand toward PRD v1.0.
- MVP: local chat history; streaming chat; model/account selection; custom OpenAI-compatible and Anthropic-compatible providers; secure local API-key storage; OAuth provider adapter architecture; disclaimers and consent for experimental Tier B providers.
- Provider MVP: ChatGPT and Google Gemini/Antigravity only where a supported flow is technically and legally viable, labeled experimental and gated by explicit consent. DeepSeek only via its official API through custom provider configuration; no session cookies, browser scraping, or anti-bot bypass.
- Follow-up stages: combo fallback/cooldown and routing logs; skills; declarative plugins and permission broker; connected accounts; backup/export; release hardening and community distribution.
- Use Expo Go scanning QR for supported iteration without USB. Use an EAS-built development client for native/provider features unsupported by Expo Go. Use local Android builds where practical, with EAS as cloud build and distribution fallback.
- Keep chat, settings, and credentials local; no telemetry absent explicit opt-in.

## Non-goals

- No NIXHub backend/proxy, account, or synchronization.
- No MCP, arbitrary downloaded native/JavaScript plugin code, or DeepSeek Web session access.
- No USB-dependent development or device test workflow.
- No iOS local build on Linux; iOS builds require EAS cloud or macOS/Xcode.
- Do not claim production readiness for provider OAuth until provider terms, OAuth registration/client IDs, and applicable app-store rules are reviewed.

## Approaches considered

1. **Expo managed + EAS cloud:** fastest setup and low local build load, but less direct native control and external build dependency.
2. **Expo prebuild + local Android build, EAS fallback (selected):** Expo workflow with native project access; local builds possible with installed SDK, EAS covers development APKs and distribution without USB. Local builds will be slow on the 2-core/8-GB laptop.
3. **Bare React Native:** maximum native control, but adds setup and maintenance without clear MVP benefit.

Expo Go remains a separate QR-scanned iteration path, not the universal runtime: custom native modules and some OAuth integrations require a development build. EAS development builds can be installed by downloading/opening the APK on the phone; USB is not required.

## Architecture decisions

- Expo + React Native with JavaScript only (`.js` for logic/config, `.jsx` for UI); Expo Router; NativeWind and React Native Reusables; Lucide. Use JSDoc for public contracts and runtime validation at untrusted boundaries; no `.ts` or `.tsx` files.
- Zustand + TanStack Query for client state; `expo-sqlite` + Drizzle for local durable records; `expo-secure-store` for secrets.
- Provider adapter contract normalizes models, streaming events, capabilities, and errors. Custom OpenAI/Anthropic-compatible adapters are the first supported working providers. OAuth provider adapters are isolated and explicitly tiered.
- Conversation engine, model router, provider adapters, extension runtime, auth manager, and storage remain distinct modules.
- Combo initially uses ordered priority/fallback with bounded attempts, cooldown, and routing records. Other strategies follow later.
- Skills are Markdown/resources; plugins are declarative manifests with scoped network allowlists and a permission broker. No downloaded executable plugin code.
- Test with Jest and React Native Testing Library; Maestro for device flows where practical; GitHub Actions and EAS for CI/release.
- MIT license; include privacy, terms, disclaimer, security, contribution, and architecture documentation before public production release.

## Delivery stages

1. **Foundation and MVP chat:** repository/tooling, navigation and design system, local storage, secure secrets, custom provider streaming, chat history, model picker, onboarding/legal disclosures, tests, and Android installable development/release build path. Add OAuth providers only after viable approved flows and client IDs are established.
2. **Combo:** priority/fallback, error classification, retries, cooldown, routing log, and usage counts.
3. **Skills:** catalog browsing/cache, trust labels, install/update/uninstall, progressive disclosure.
4. **Plugins and connected accounts:** declarative plugin spec/runtime, Google Sheets, Notion, Telegram, WAHA with least privilege, confirmations, and credential revocation.
5. **Production hardening:** encrypted backup/export, accessibility, localization, security/legal review, CI release automation, signed APK and GitHub release process.

Each stage must be independently testable and releasable. “Production” means signed Android artifacts, documented privacy/terms/security posture, automated tests/CI, review of provider and distribution compliance, and no known critical security defects; it does not imply every PRD v1 feature is in the initial MVP.

## Constraints and open implementation details

- Android 8+ (API 26), iOS 15+; local Android build environment is installed, but actual build verification remains pending.
- Developer workflow uses Expo Go QR when compatible; native development build can be distributed through EAS without USB.
- Experimental provider OAuth may require user-provided OAuth client ID or a provider-approved integration. Do not hardcode a third-party official client's credentials or reverse engineer private APIs without a separate compliance decision.
- OAuth client registration, Gemini vs Antigravity provider choice, and permitted ChatGPT OAuth flow require validation before those adapters ship.
- Store credentials in secure storage; never log secrets; warn before custom TLS certificate exceptions; treat remote tool/plugin content as untrusted.
- No USB requirement. Device install and EAS account/signing details remain user-controlled.
