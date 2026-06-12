import { Suspense } from 'react';
import './page.css';
import DuringCalamityPage from './DuringCalamityPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DuringCalamityPage />
    </Suspense>
  );
}
