import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export const LANDING = {
  hero: {
    badge: 'Belajar Mandiri, Lebih Percaya Diri',
    title: 'Latihan Soal Berbasis AI untuk Pelajar Indonesia',
    description:
      'Pilih jenjang, kelas, mata pelajaran, dan topik. Gemini AI menyusun soal beserta kunci dan penjelasan. Kerjakan, koreksi otomatis, dan pahami kesalahanmu.',
    cta: 'Mulai Latihan',
    ctaSub: 'Coba Gratis',
    stats: [
      { value: 3, suffix: '', label: 'Jenjang SD · SMP · SMA' },
      { value: 30, suffix: '+', label: 'Mata Pelajaran' },
      { value: 24, suffix: '/7', label: 'Latihan Kapan Saja' },
    ],
    primaryCtaHref: paths.auth.register,
    secondaryCtaHref: paths.catalog.root,
  },

  levels: {
    caption: 'Jenjang',
    title: 'Untuk Semua Jenjang & Kelas',
    description:
      'Mulai dari SD/MI, SMP/MTs, hingga SMA/MA. Pilih kelasmu dan temukan materi yang sesuai kurikulum.',
  },

  how: {
    caption: 'Cara Kerja',
    title: 'Tiga Langkah Mudah',
    items: [
      {
        icon: 'solar:letter-outline',
        step: '01',
        title: 'Pilih Materi',
        description: 'Tentukan jenjang, kelas, mata pelajaran, topik, kesulitan, dan jumlah soal.',
      },
      {
        icon: 'solar:pen-2-outline',
        step: '02',
        title: 'Kerjakan Soal',
        description: 'Jawab soal pilihan ganda atau teks. Jawabanmu tersimpan otomatis (autosave).',
      },
      {
        icon: 'solar:chart-square-outline',
        step: '03',
        title: 'Lihat Hasil & Penjelasan',
        description:
          'Sistem mengoreksi, memberi nilai, dan menjelaskan setiap kesalahan agar kamu paham.',
      },
    ],
  },

  features: {
    caption: 'Keunggulan',
    title: 'Kenapa Mandiri Belajar?',
    items: [
      {
        icon: 'carbon:update-now',
        title: 'Soal dari AI',
        description: 'Soal segar disusun AI sesuai topik dan tingkat kesulitan yang dipilih.',
      },
      {
        icon: 'solar:check-circle-bold',
        title: 'Koreksi Otomatis',
        description: 'Nilai dan jawaban benar langsung tersedia setelah latihan selesai.',
      },
      {
        icon: 'solar:chat-line-outline',
        title: 'Penjelasan Per Soal',
        description: 'Pahami cara penyelesaian lewat penjelasan yang ringkas dan jelas.',
      },
      {
        icon: 'solar:presentation-graph-outline',
        title: 'Pantau Progres',
        description: 'Lihat nilai rata-rata, streak, dan topik yang perlu diulang.',
      },
    ],
  },

  plans: {
    caption: 'Paket Harga',
    title: 'Pilih Paket Sesuai Kebutuhanmu',
    items: [
      {
        name: 'Gratis',
        price: 0,
        period: 'selamanya',
        features: ['Kuota latihan terbatas', 'Soal pilihan ganda', 'Akses katalog materi', 'Riwayat latihan'],
      },
      {
        name: 'Premium',
        price: 49000,
        period: 'per bulan',
        features: [
          'Kuota latihan lebih besar',
          'Soal pilihan ganda & teks',
          'Penjelasan detail per soal',
          'Dashboard progres & streak',
          'Prioritas dukungan',
        ],
      },
    ],
  },
};
