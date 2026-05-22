import { createProxyHandlers } from '@/lib/api-proxy';

const { GET, POST, PATCH, PUT, DELETE } = createProxyHandlers({
  backendUrl: process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL ?? 'http://localhost:3101',
  apiPrefix: 'api/v1/hopecard/admin',
  cookieName: 'admin_token',
  serviceName: 'admin service',
});

export { GET, POST, PATCH, PUT, DELETE };
