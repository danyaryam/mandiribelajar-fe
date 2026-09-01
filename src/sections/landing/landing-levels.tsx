import type { EducationLevel } from 'src/lib/api/catalog';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { LANDING } from './landing-data';
import { LandingHeading } from './landing-heading';

// ----------------------------------------------------------------------

type Props = {
  levels: EducationLevel[] | null;
};

type LevelCard = {
  id: string;
  name: string;
  description?: string;
};

export function LandingLevels({ levels }: Props) {
  const { levels: section } = LANDING;
  const items: LevelCard[] = levels?.length
    ? levels.map((l) => ({ id: l.id, name: l.name, description: l.code }))
    : [
        { id: 'sd', name: 'SD/MI', description: 'Kelas 1–6' },
        { id: 'smp', name: 'SMP/MTs', description: 'Kelas 7–9' },
        { id: 'sma', name: 'SMA/MA', description: 'Kelas 10–12' },
      ];

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container>
        <LandingHeading
          caption={section.caption}
          title={section.title}
          description={section.description}
        />
        <Box
          sx={{
            gap: 3,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          }}
        >
          {items.map((level) => (
            <Box
              key={level.id}
              sx={{
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 8 },
              }}
            >
              <Typography variant="h4" sx={{ mb: 1 }}>
                {level.name}
              </Typography>
              <Typography color="text.secondary">
                {level.description ?? 'Lihat kelas & mata pelajaran'}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
