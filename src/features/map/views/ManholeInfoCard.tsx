import type { Manhole } from '@/features/map/models/MapTypes';
import './ManholeInfoCard.css';

interface ManholeInfoCardProps {
  manhole: Manhole;
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

export default function ManholeInfoCard({ manhole }: ManholeInfoCardProps) {
  return (
    <div className="manhole-card">
      <div className="manhole-card-header">
        <div className="manhole-card-icon">
          <div className="manhole-card-icon-halo" />
          <div className="manhole-card-icon-core" />
        </div>
        <h2 className="manhole-card-title">Bueiro Danificado</h2>
      </div>

      <div className="manhole-card-grid">
        <div className="manhole-card-field">
          <span className="manhole-card-label">ID</span>
          <span className="manhole-card-value">{manhole.id}</span>
        </div>

        <div className="manhole-card-field">
          <span className="manhole-card-label">Data de criação</span>
          <span className="manhole-card-value">{formatDate(manhole.dataHora)}</span>
        </div>

        <div className="manhole-card-field manhole-card-field--full">
          <span className="manhole-card-label">Endereço</span>
          <span className="manhole-card-value">{manhole.endereco ?? '—'}</span>
        </div>

        <div className="manhole-card-field manhole-card-field--full">
          <span className="manhole-card-label">Descrição</span>
          <span className="manhole-card-value">{manhole.descricao ?? '—'}</span>
        </div>

        <div className="manhole-card-field">
          <span className="manhole-card-label">Latitude</span>
          <span className="manhole-card-value manhole-card-value--mono">{manhole.latitude.toFixed(6)}</span>
        </div>

        <div className="manhole-card-field">
          <span className="manhole-card-label">Longitude</span>
          <span className="manhole-card-value manhole-card-value--mono">{manhole.longitude.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
}
