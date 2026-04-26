'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { FloodArea, Manhole } from '@/features/map/models/MapTypes';
import { NIVEL_COLORS } from '@/features/map/models/MapTypes';

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  floodAreas?: FloodArea[];
  manholes?: Manhole[];
  focusLocation?: { latitude: number; longitude: number; timestamp: number } | null;
}

const DEFAULT_CENTER: [number, number] = [-23.5505, -46.6333];
const DEFAULT_ZOOM = 13;

// Marcador customizado análogo ao mobile: halo laranja translúcido + núcleo sólido com borda branca
function createManholeIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 149, 0, 0.25);
        "></div>
        <div style="
          position: relative;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FF9500;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        "></div>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function MapController({ focusLocation }: { focusLocation: MapViewProps['focusLocation'] }) {
  const map = useMap();

  useEffect(() => {
    if (focusLocation) {
      map.flyTo([focusLocation.latitude, focusLocation.longitude], 16, {
        duration: 1.5,
      });
    }
  }, [focusLocation, map]);

  return null;
}

export default function MapView({ center, zoom, floodAreas = [], manholes = [], focusLocation }: MapViewProps) {
  useEffect(() => {
    // Leaflet exige que o ícone padrão seja redefinido no Next.js para evitar ícones quebrados
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const manholeIcon = createManholeIcon();

  return (
    <MapContainer
      center={center ?? DEFAULT_CENTER}
      zoom={zoom ?? DEFAULT_ZOOM}
      style={{ width: '100%', height: '100%' }}
      zoomControl
    >
      <MapController focusLocation={focusLocation} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {floodAreas.map((fa) => {
        const colors = NIVEL_COLORS[fa.nivel];
        const positions = fa.coordinates.map(
          (c) => [c.latitude, c.longitude] as [number, number]
        );
        return (
          <Polygon
            key={fa.id}
            positions={positions}
            pathOptions={{
              fillColor: colors.fill,
              fillOpacity: 1,
              color: colors.stroke,
              weight: 2,
            }}
          />
        );
      })}

      {manholes.map((m) => (
        <Marker
          key={m.id}
          position={[m.latitude, m.longitude]}
          icon={manholeIcon}
        />
      ))}
    </MapContainer>
  );
}
