import { Suspense } from 'react';
import SiteManagerDashboard from '@/site-manager-components/components/SiteManagerDashboard';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SiteManagerDashboard phase="after" />
    </Suspense>
  );
}
