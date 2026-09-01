'use client';

import type { Grade, EducationLevel } from 'src/lib/api/catalog';

import { useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
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
  const theme = useTheme();
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
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 5 }}>
      {/* Header */}
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          mb: 4,
          color: '#fff',
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.92)}, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.85)} 55%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.75)})`,
            ],
          }),
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          Jelajahi Katalog
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
          Pilih jenjang untuk melihat kelas dan mata pelajaran yang tersedia.
        </Typography>
      </Box>

      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
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
        <>
          <Typography
            variant="overline"
            sx={{ display: 'block', mt: 4, color: 'text.secondary', fontWeight: 700 }}
          >
            Kelas
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
            {gradesQuery.data?.map((g) => (
              <Chip
                key={g.id}
                label={g.name}
                clickable
                variant={grade?.id === g.id ? 'filled' : 'soft'}
                color={grade?.id === g.id ? 'primary' : 'default'}
                onClick={() => setGrade(g)}
                sx={{
                  fontWeight: grade?.id === g.id ? 800 : 600,
                  px: 1.5,
                  py: 1,
                  ...(grade?.id === g.id && {
                    boxShadow: `0 6px 16px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.35)}`,
                  }),
                }}
              />
            ))}
          </Stack>
        </>
      )}

      {subjectsQuery.data && subjectsQuery.data.length > 0 && (
        <Stack spacing={1.5} sx={{ mt: 5 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Mata Pelajaran
          </Typography>
          {subjectsQuery.data.map((s, i) => (
            <Card
              key={s.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                background: `linear-gradient(135deg, ${varAlpha(i % 2 === 0 ? theme.vars.palette.primary.mainChannel : theme.vars.palette.secondary.mainChannel, 0.06)}, rgba(255,255,255,0))`,
                transition: 'transform .18s, box-shadow .18s',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: '0 8px 22px rgba(0,0,0,.08)',
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 800 }}>{s.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {s.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
