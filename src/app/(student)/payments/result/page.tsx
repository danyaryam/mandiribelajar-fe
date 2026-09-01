import type { Metadata } from 'next';

import { PaymentsResultView } from 'src/sections/payments/view/payments-result-view';

export const metadata: Metadata = {
  title: 'Hasil Pembayaran',
};

export default function PaymentsResultPage() {
  return <PaymentsResultView />;
}
