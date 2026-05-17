const PDF_GENERATED_COUNT_KEY = 'stats:pdf-generated-count';
let fallbackCount = 0;

function hasKvConfig() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvRequest<T>(command: 'get' | 'incr'): Promise<T> {
  const baseUrl = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!baseUrl || !token) {
    throw new Error('KV environment variables are not configured');
  }

  const response = await fetch(`${baseUrl}/${command}/${PDF_GENERATED_COUNT_KEY}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`KV request failed with status ${response.status}`);
  }

  const payload = await response.json().catch(() => null);
  if (payload && typeof payload === 'object' && 'error' in payload) {
    throw new Error(String((payload as { error?: unknown }).error ?? 'KV request failed'));
  }

  return payload?.result as T;
}

export async function getPdfGeneratedCount() {
  if (hasKvConfig()) {
    const value = await kvRequest<number | string | null>('get');
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  return fallbackCount;
}

export async function incrementPdfGeneratedCount() {
  if (hasKvConfig()) {
    const value = await kvRequest<number>('incr');
    return typeof value === 'number' ? value : 0;
  }

  fallbackCount += 1;
  return fallbackCount;
}