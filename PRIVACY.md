# Privacy

NIXHub Assistant stores conversations and provider configuration locally on your device. Provider API keys are stored using the operating system secure storage; the local database stores only opaque references to those keys. No NIXHub backend or telemetry is used by this MVP.

When you send a message, its content and relevant conversation context are transmitted directly to the provider endpoint you configured. The provider may process or retain submitted data under its own privacy policy and terms. Do not send sensitive information unless you have reviewed the provider's policy and accept the risk.

Deleting a provider removes its locally stored API key. It does not delete data already received by that provider. You can request provider-side deletion or revoke a key through that provider. Device backups and operating-system behavior are outside this application's control. Exported data may contain conversation content and must be protected by you.
