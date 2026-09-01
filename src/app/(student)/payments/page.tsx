import type { Metadata } from 'next';

import { PaymentsHistoryView } from 'src/sections/payments/view/payments-history-view';

export const metadata: Metadata = {
  title: 'Pembayaran',
};

export default function PaymentsPage() {
  return <PaymentsHistoryView />;
}
