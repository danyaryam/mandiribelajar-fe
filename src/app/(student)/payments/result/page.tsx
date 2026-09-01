import type { Metadata } from 'next';

import { Suspense } from 'react';

import { PaymentsResultView } from 'src/sections/payments/view/payments-result-view';

export const metadata: Metadata = {
  title: 'Hasil Pembayaran',
};

export default function PaymentsResultPage() {
  return (
    <Suspense>
      <PaymentsResultView />
    </Suspense>
  );
}
