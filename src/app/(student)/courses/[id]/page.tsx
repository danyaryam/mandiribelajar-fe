import type { Metadata } from 'next';

import { PracticeSessionView } from 'src/sections/practice/view/practice-session-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Kerjakan Latihan',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SessionPage({ params }: Props) {
  const { id } = await params;
  return <PracticeSessionView sessionId={id} />;
}
