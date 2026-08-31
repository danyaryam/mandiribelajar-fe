'use client';

import type { Grade, EducationLevel } from 'src/lib/api/catalog';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import {
  useSubjectsQuery,
  useGradesByLevelQuery,
  useEducationLevelsQuery,
} from 'src/lib/api/use-catalog';

import { CatalogLevelSection } from '../catalog-level-section';

// ----------------------------------------------------------------------
// Landing katalog: pilih jenjang → kelas → lihat daftar mata pelajaran.
// Demo alur interaktif TanStack Query + backend /api/v1 catalog.
// ----------------------------------------------------------------------

export function CatalogView() {
  const [level, setLevel] = useState<EducationLevel | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);

  const levelsQuery = useEducationLevelsQuery();
  const gradesQuery = useGradesByLevelQuery(level?.id);
  const subjectsQuery = useSubjectsQuery({ levelId: level?.id, gradeId: grade?.id });

  if (levelsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 8 }}>
      <Typography variant="h3" gutterBottom>
        Jelajahi Katalog
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Pilih jenjang untuk melihat kelas dan mata pelajaran yang tersedia.
      </Typography>

      <Typography variant="overline" color="text.secondary">
        Jenjang
      </Typography>
      <CatalogLevelSection
        levels={levelsQuery.data ?? []}
        selectedId={level?.id}
        onSelect={(l) => {
          setLevel(l);
          setGrade(null);
        }}
      />

      {level && (
        <Stack direction="row" spacing={1} sx={{ mt: 4, flexWrap: 'wrap' }}>
          {gradesQuery.data?.map((g) => (
            <Chip
              key={g.id}
              label={g.name}
              clickable
              color={grade?.id === g.id ? 'primary' : 'default'}
              onClick={() => setGrade(g)}
            />
          ))}
        </Stack>
      )}

      {subjectsQuery.data && subjectsQuery.data.length > 0 && (
        <Stack spacing={1.5} sx={{ mt: 5 }}>
          <Typography variant="overline" color="text.secondary">
            Mata Pelajaran
          </Typography>
          {subjectsQuery.data.map((s) => (
            <Box
              key={s.id}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>{s.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {s.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
