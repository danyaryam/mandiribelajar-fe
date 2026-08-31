import type { EducationLevel } from 'src/lib/api/catalog';

// ----------------------------------------------------------------------
// Presentational list of education levels. The interactive selection lives
// in the client View (catalog-view.tsx); this stateless component only
// renders card tiles.
// ----------------------------------------------------------------------

type Props = {
  levels: EducationLevel[];
  selectedId?: string;
  onSelect: (level: EducationLevel) => void;
};

export function CatalogLevelSection({ levels, selectedId, onSelect }: Props) {
  return (
    <div>
      {levels.map((level) => (
        <button
          key={level.id}
          type="button"
          onClick={() => onSelect(level)}
          style={{
            border: selectedId === level.id ? '2px solid #3f51b5' : '1px solid #e0e0e0',
            background: selectedId === level.id ? '#eef2ff' : '#fff',
            borderRadius: 12,
            padding: '16px 24px',
            fontSize: 18,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {level.name}
        </button>
      ))}
    </div>
  );
}
