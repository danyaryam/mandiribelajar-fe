import { MainLayout } from 'src/layouts/main';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function CatalogLayout({ children }: Props) {
  return <MainLayout>{children}</MainLayout>;
}
