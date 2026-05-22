import { getStorageUrl } from '../../src/donor-lib/storage-url';

const MOCK_URL = 'https://abc.supabase.co';

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = MOCK_URL;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_URL;
});

describe('getStorageUrl — null/empty keys', () => {
  it('returns null for null key', () => expect(getStorageUrl('bucket', null)).toBeNull());
  it('returns null for undefined key', () => expect(getStorageUrl('bucket', undefined)).toBeNull());
  it('returns null for empty string', () => expect(getStorageUrl('bucket', '')).toBeNull());
  it('returns null for whitespace-only key', () => expect(getStorageUrl('bucket', '   ')).toBeNull());
});

describe('getStorageUrl — missing env', () => {
  it('returns null when no supabase URL env is set', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(getStorageUrl('bucket', 'file.jpg')).toBeNull();
  });

  it('falls back to SUPABASE_URL when NEXT_PUBLIC is absent', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_URL = MOCK_URL;
    const result = getStorageUrl('images', 'photo.jpg');
    expect(result).toContain(MOCK_URL);
  });
});

describe('getStorageUrl — key sanitisation', () => {
  it('strips path traversal sequences', () => {
    const result = getStorageUrl('bucket', '../../../etc/passwd');
    expect(result).toContain('etc/passwd');
    expect(result).not.toContain('../');
  });

  it('returns null when key is only slashes', () => {
    expect(getStorageUrl('bucket', '/')).toBeNull();
  });

  it('returns null for the reserved campaign default path', () => {
    expect(getStorageUrl('bucket', 'cover-images/campaigns/')).toBeNull();
  });
});

describe('getStorageUrl — regular bucket', () => {
  it('builds correct public storage URL', () => {
    expect(getStorageUrl('images', 'photo.jpg')).toBe(
      `${MOCK_URL}/storage/v1/object/public/images/photo.jpg`
    );
  });

  it('strips trailing slash from base URL', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = `${MOCK_URL}/`;
    expect(getStorageUrl('images', 'photo.jpg')).toBe(
      `${MOCK_URL}/storage/v1/object/public/images/photo.jpg`
    );
  });
});

describe('getStorageUrl — campaigns bucket', () => {
  it('rewrites bucket name to camp-man-files', () => {
    const result = getStorageUrl('campaigns', 'my-image.jpg');
    expect(result).toContain('camp-man-files');
  });

  it('adds cover-images/campaigns/ prefix when missing', () => {
    const result = getStorageUrl('campaigns', 'my-image.jpg');
    expect(result).toContain('cover-images/campaigns/my-image.jpg');
  });

  it('does not double-prefix when path already has cover-images/campaigns/', () => {
    const result = getStorageUrl('campaigns', 'cover-images/campaigns/my-image.jpg');
    expect(result).not.toContain('cover-images/campaigns/cover-images/campaigns/');
  });

  it('is case-insensitive on bucket name', () => {
    const result = getStorageUrl('CAMPAIGNS', 'my-image.jpg');
    expect(result).toContain('camp-man-files');
  });
});
