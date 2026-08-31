import { SimpleLayout } from 'src/layouts/simple';

// ----------------------------------------------------------------------
// Layout grup siswa. Fase 1 akan menambahkan route guard (auth required)
// di sini sesuai plan.md §5 (proteksi route).
// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function StudentLayout({ children }: Props) {
  return <SimpleLayout>{children}</SimpleLayout>;
}
