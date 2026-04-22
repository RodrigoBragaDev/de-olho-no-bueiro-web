'use client';

import type { FloodArea, Manhole } from '@/features/map/models/MapTypes';
import { groupByMonth, exportMonthAsJson } from '@/features/map/utils/exportUtils';
import './ExportBar.css';

interface ExportBarProps {
  floodAreas: FloodArea[];
  manholes: Manhole[];
}

export default function ExportBar({ floodAreas, manholes }: ExportBarProps) {
  const groups = groupByMonth(floodAreas, manholes);

  if (groups.length === 0) return null;

  return (
    <div className="export-bar">
      <span className="export-bar-label">Exportar dados:</span>
      <div className="export-bar-buttons">
        {groups.map((group) => (
          <button
            key={group.key}
            className="export-bar-btn"
            onClick={() => exportMonthAsJson(group)}
          >
            {group.label}
            <span className="export-bar-count">
              {group.floodAreas.length + group.manholes.length} registros
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
