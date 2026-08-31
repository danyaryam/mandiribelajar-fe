import type { Metadata } from 'next';

import { PracticeResultView } from 'src/sections/practice/view/practice-result-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Hasil Latihan',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  return <PracticeResultView sessionId={id} />;
}
