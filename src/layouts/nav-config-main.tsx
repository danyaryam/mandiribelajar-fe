import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

// Tambahkan menu baru SETELAH halamannya ada (path dari paths.ts, bukan '#').
export const navData = [
  { title: 'Beranda', path: paths.home },
  { title: 'Katalog', path: paths.catalog.root },
  { title: 'Paket Harga', path: paths.payments.plans },
  { title: 'FAQ', path: paths.support },
];
