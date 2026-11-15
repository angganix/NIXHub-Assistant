const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

function isPrivateLanAddress(hostname) {
  const octets = hostname.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    (octets[0] === 169 && octets[1] === 254);
}

export function validateProviderConfig({ baseUrl, allowInsecureLocal = false, allowInsecurePrivateLan = false }) {
  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error('Invalid provider URL');
  }
  if (parsed.username || parsed.password) throw new Error('Credentials are not allowed in provider URL');
  if (parsed.protocol !== 'https:') {
    const allowedHost = (allowInsecureLocal && loopbackHosts.has(parsed.hostname)) ||
      (allowInsecurePrivateLan && isPrivateLanAddress(parsed.hostname));
    if (!(parsed.protocol === 'http:' && allowedHost)) throw new Error('HTTPS is required');
  }
  return { baseUrl: parsed.toString().replace(/\/$/, ''), origin: parsed.origin };
}

export function validateCustomHeaders(headers = {}) {
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'x-api-key') {
      throw new Error(`Header ${key} conflicts with provider credentials`);
    }
  }
  return headers;
}

export function redactSecrets(value, secrets = []) {
  let text = String(value ?? '');
  for (const secret of secrets.filter((item) => typeof item === 'string' && item.length > 0)) {
    text = text.split(secret).join('[REDACTED]');
  }
  return text.replace(/(authorization|x-api-key)(\s*[:=]\s*)(bearer\s+)?[^\s,;"']+/gi, '$1$2[REDACTED]');
}
