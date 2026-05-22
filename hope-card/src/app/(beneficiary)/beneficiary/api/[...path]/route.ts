import { createProxyHandlers } from '@/lib/api-proxy';

const { GET, POST, PATCH, PUT, DELETE } = createProxyHandlers({
  backendUrl: process.env.NEXT_PUBLIC_BENEFICIARY_BACKEND_URL ?? '',
  apiPrefix: 'api/v1/hopecard/beneficiary',
  cookieName: 'beneficiary_token',
  serviceName: 'beneficiary service',
});

export { GET, POST, PATCH, PUT, DELETE };
