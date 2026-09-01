import { RouteGuard } from 'src/components/auth';

import { AdminQuestionReportsView } from 'src/sections/admin/view/admin-question-reports-view';

export const metadata = {
  title: 'Laporan Soal',
};

export default function AdminQuestionReportsPage() {
  return (
    <RouteGuard>
      <AdminQuestionReportsView />
    </RouteGuard>
  );
}
