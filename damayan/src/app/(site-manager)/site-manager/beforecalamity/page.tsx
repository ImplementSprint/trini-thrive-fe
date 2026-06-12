import { Suspense } from 'react';
import './page.css';
import BeforeCalamityPage from './BeforeCalamityPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BeforeCalamityPage />
    </Suspense>
  );
}
