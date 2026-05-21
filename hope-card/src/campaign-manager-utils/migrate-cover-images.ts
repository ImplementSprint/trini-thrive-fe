type ActionResponse = {
  success: boolean;
  error?: string;
  data?: unknown;
};

/**
 * Stub: migrate cover images from legacy storage to current bucket.
 * Replace with real implementation when migration tooling is ready.
 */
export async function migrateCoverImages(): Promise<ActionResponse> {
  return { success: false, error: 'Migration not implemented' };
}
