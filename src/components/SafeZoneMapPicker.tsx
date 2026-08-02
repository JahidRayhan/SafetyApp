import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for bundlers (CDN URLs)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  center: { lat: number; lng: number };
  radius: number;
  onChange: (next: { lat: number; lng: number }) => void;
}

const ClickHandler: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Recenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  const last = useRef<string>('');
  useEffect(() => {
    const key = `${center[0]},${center[1]}`;
    if (key !== last.current) {
      last.current = key;
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

const SafeZoneMapPicker: React.FC<Props> = ({ center, radius, onChange }) => {
  const hasCenter = center.lat !== 0 || center.lng !== 0;
  const view = useMemo<[number, number]>(
    () => (hasCenter ? [center.lat, center.lng] : [20, 0]),
    [center.lat, center.lng, hasCenter],
  );

  return (
    <div className="h-72 w-full rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={view}
        zoom={hasCenter ? 15 : 2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={(lat, lng) => onChange({ lat, lng })} />
        {hasCenter && (
          <>
            <Recenter center={[center.lat, center.lng]} />
            <Marker
              position={[center.lat, center.lng]}
              icon={defaultIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target as L.Marker;
                  const p = m.getLatLng();
                  onChange({ lat: p.lat, lng: p.lng });
                },
              }}
            />
            <Circle
              center={[center.lat, center.lng]}
              radius={radius}
              pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.2 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default SafeZoneMapPicker;
