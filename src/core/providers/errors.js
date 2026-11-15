export function normalizeProviderError(error) {
  const status = error?.status ?? error?.response?.status;
  if (status === 402 || error?.code === 'insufficient_quota') return { kind: 'QUOTA', status };
  if (status === 401 || status === 403) return { kind: 'AUTH', status };
  if (status === 429) return { kind: 'RATE_LIMIT', status };
  if (status >= 500) return { kind: 'SERVER', status };
  if (status >= 400) return { kind: 'INVALID_REQUEST', status };
  if (error instanceof TypeError || error?.name === 'AbortError') return { kind: 'NETWORK', status: null };
  return { kind: 'UNKNOWN', status: status ?? null };
}
