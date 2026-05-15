"use client";

import { MapContainer, ImageOverlay, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

type Vec3 = { x: number; y: number; z: number };
export type Blip = { type: string; id: number; name: string; position: Vec3 };

const MAP_SIZE = 2048;

export function GtaMap({ blips }: { blips: Blip[] }) {
  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [MAP_SIZE, MAP_SIZE],
  ];

  const convert = useMemo(() => {
    const WORLD_MIN_X = -4000;
    const WORLD_MAX_X = 4000;
    const WORLD_MIN_Y = -4000;
    const WORLD_MAX_Y = 8000;

    function toLatLng(pos: Vec3): [number, number] {
      const xNorm =
        (pos.x - WORLD_MIN_X) / (WORLD_MAX_X - WORLD_MIN_X);
      const yNorm =
        (pos.y - WORLD_MIN_Y) / (WORLD_MAX_Y - WORLD_MIN_Y);

      const xPixel = xNorm * MAP_SIZE;
      const yPixel = (1 - yNorm) * MAP_SIZE;

      return [yPixel, xPixel];
    }

    return { toLatLng };
  }, []);

  return (
    <div className="h-[70vh] min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-[0_16px_50px_rgba(0,0,0,.18)]">
      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        minZoom={-2}
        maxZoom={4}
        style={{ height: "100%", width: "100%" }}
      >
        <ImageOverlay
          url="/gta-map.png"
          bounds={bounds}
        />

        {blips.map((b) => (
          <Marker
            key={`${b.type}-${b.id}`}
            position={convert.toLatLng(b.position)}
          >
            <Popup>
              <div className="font-semibold">{b.name}</div>
              <div className="text-xs opacity-70">{b.type}</div>
              <div className="text-xs opacity-70">
                {b.position.x.toFixed(1)}, {b.position.y.toFixed(1)}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
