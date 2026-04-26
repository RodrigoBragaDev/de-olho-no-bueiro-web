import type { FloodArea } from '@/features/map/models/MapTypes';
import { NIVEL_LABELS, NIVEL_COLORS } from '@/features/map/models/MapTypes';
import './FloodAreaInfoCard.css';

interface FloodAreaInfoCardProps {
  floodArea: FloodArea;
  onFocus?: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FloodAreaInfoCard({ floodArea, onFocus }: FloodAreaInfoCardProps) {
  const colors = NIVEL_COLORS[floodArea.nivel];

  return (
    <div className="info-card info-card--clickable" onClick={onFocus}>
      <div className="info-card-header">
        <h2 className="info-card-title">Área de Alagamento</h2>
        <span
          className="info-card-badge"
          style={{ backgroundColor: colors.badge }}
        >
          {NIVEL_LABELS[floodArea.nivel]}
        </span>
      </div>

      <div className="info-card-grid">
        <div className="info-card-field">
          <span className="info-card-label">ID</span>
          <span className="info-card-value">{floodArea.id}</span>
        </div>

        <div className="info-card-field">
          <span className="info-card-label">Data de criação</span>
          <span className="info-card-value">{formatDate(floodArea.dataHora)}</span>
        </div>

        <div className="info-card-field info-card-field--full">
          <span className="info-card-label">Endereço</span>
          <span className="info-card-value">{floodArea.endereco ?? '—'}</span>
        </div>

        <div className="info-card-field info-card-field--full">
          <span className="info-card-label">Descrição</span>
          <span className="info-card-value">{floodArea.descricao ?? '—'}</span>
        </div>

        <div className="info-card-field info-card-field--full">
          <span className="info-card-label">Coordenadas ({floodArea.coordinates.length} pontos)</span>
          <div className="info-card-coords">
            {floodArea.coordinates.map((c, i) => (
              <span key={i} className="info-card-coord-item">
                P{i + 1}: {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
