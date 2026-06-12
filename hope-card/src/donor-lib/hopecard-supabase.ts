type SupabaseRecord = Record<string, unknown>;

const HOPECARD_TITLE_KEYS = ['title', 'name', 'campaign_title', 'campaign_name', 'label'];
const HOPECARD_ID_KEYS = ['id', 'hopecard_id'];

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

export function getSupabaseConfig() {
  const url = getEnv('SUPABASE_URL') ?? getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key =
    getEnv('SUPABASE_SERVICE_ROLE_KEY') ??
    getEnv('SUPABASE_ANON_KEY') ??
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return { url, key };
}

export async function supabaseRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Supabase request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function normalizeValue(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeLoose(value: unknown): string {
  return normalizeValue(value).replace(/[^a-z0-9]+/g, '');
}

export function getRecordId(record: SupabaseRecord): string | null {
  for (const key of HOPECARD_ID_KEYS) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return null;
}

export function getRecordTitle(record: SupabaseRecord): string | null {
  for (const key of HOPECARD_TITLE_KEYS) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return null;
}

export function findHopecardRecordByTitle(records: SupabaseRecord[], title: string): SupabaseRecord | null {
  const normalizedTitle = normalizeValue(title);
  const normalizedLooseTitle = normalizeLoose(title);

  return (
    records.find((record) => normalizeValue(getRecordTitle(record)) === normalizedTitle) ??
    records.find((record) => normalizeLoose(getRecordTitle(record)) === normalizedLooseTitle) ??
    records.find((record) => normalizeLoose(getRecordTitle(record)).includes(normalizedLooseTitle)) ??
    records.find((record) => normalizedLooseTitle.includes(normalizeLoose(getRecordTitle(record)))) ??
    null
  );
}
