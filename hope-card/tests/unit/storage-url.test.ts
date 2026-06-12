import { getStorageUrl } from '../../src/donor-lib/storage-url';

const SUPABASE_URL = 'https://test.supabase.co';

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_URL;
});

describe('getStorageUrl', () => {
  it('returns null for null key', () => {
    expect(getStorageUrl('images', null)).toBeNull();
  });

  it('returns null for undefined key', () => {
    expect(getStorageUrl('images', undefined)).toBeNull();
  });

  it('returns null for empty string key', () => {
    expect(getStorageUrl('images', '')).toBeNull();
  });

  it('returns null for whitespace-only key', () => {
    expect(getStorageUrl('images', '   ')).toBeNull();
  });

  it('returns null when SUPABASE_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(getStorageUrl('images', 'photo.jpg')).toBeNull();
  });

  it('builds correct URL for a regular bucket', () => {
    const result = getStorageUrl('images', 'photo.jpg');
    expect(result).toBe(`${SUPABASE_URL}/storage/v1/object/public/images/photo.jpg`);
  });

  it('strips leading slashes from key', () => {
    const result = getStorageUrl('images', '/photo.jpg');
    expect(result).toBe(`${SUPABASE_URL}/storage/v1/object/public/images/photo.jpg`);
  });

  it('strips path traversal sequences from key', () => {
    const result = getStorageUrl('images', '../../../etc/passwd');
    expect(result).toBe(`${SUPABASE_URL}/storage/v1/object/public/images/etc/passwd`);
  });

  it('remaps campaigns bucket to camp-man-files with prefix', () => {
    const result = getStorageUrl('campaigns', 'hero.jpg');
    expect(result).toBe(
      `${SUPABASE_URL}/storage/v1/object/public/camp-man-files/cover-images/campaigns/hero.jpg`
    );
  });

  it('does not double-add the campaigns prefix if already present', () => {
    const result = getStorageUrl('campaigns', 'cover-images/campaigns/hero.jpg');
    expect(result).toBe(
      `${SUPABASE_URL}/storage/v1/object/public/camp-man-files/cover-images/campaigns/hero.jpg`
    );
  });

  it('returns null for the sentinel empty campaigns path', () => {
    expect(getStorageUrl('campaigns', 'cover-images/campaigns/')).toBeNull();
  });

  it('trims trailing slash from SUPABASE_URL', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = `${SUPABASE_URL}/`;
    const result = getStorageUrl('images', 'photo.jpg');
    expect(result).toBe(`${SUPABASE_URL}/storage/v1/object/public/images/photo.jpg`);
  });

  it('prefers SUPABASE_URL over NEXT_PUBLIC_SUPABASE_URL', () => {
    process.env.SUPABASE_URL = 'https://private.supabase.co';
    const result = getStorageUrl('images', 'photo.jpg');
    expect(result).toBe('https://private.supabase.co/storage/v1/object/public/images/photo.jpg');
  });
});
