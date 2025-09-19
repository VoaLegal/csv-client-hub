import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// Using a proper Brazil states GeoJSON
const geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

interface BrazilMapProps {
  statesData: { [key: string]: { count: number; cities: { [key: string]: number } } };
  onStateClick?: (stateName: string) => void;
  selectedState?: string | null;
}

const brazilStatesMapping: { [key: string]: string } = {
  'AC': 'Acre',
  'AL': 'Alagoas',
  'AP': 'Amapá',
  'AM': 'Amazonas',
  'BA': 'Bahia',
  'CE': 'Ceará',
  'DF': 'Distrito Federal',
  'ES': 'Espírito Santo',
  'GO': 'Goiás',
  'MA': 'Maranhão',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais',
  'PA': 'Pará',
  'PB': 'Paraíba',
  'PR': 'Paraná',
  'PE': 'Pernambuco',
  'PI': 'Piauí',
  'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia',
  'RR': 'Roraima',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'SE': 'Sergipe',
  'TO': 'Tocantins'
};

export default function BrazilMap({ statesData, onStateClick, selectedState }: BrazilMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const getStateColor = (stateCode: string) => {
    // Check if we have data for this state (using state code like 'SP', 'RJ', etc.)
    if (!statesData[stateCode]) {
      return '#f3f4f6'; // gray-100
    }

    const count = statesData[stateCode].count;
    if (count === 0) return '#f3f4f6';
    if (count <= 5) return '#dbeafe'; // blue-100
    if (count <= 15) return '#bfdbfe'; // blue-200
    if (count <= 30) return '#93c5fd'; // blue-300
    if (count <= 50) return '#60a5fa'; // blue-400
    return '#3b82f6'; // blue-500
  };

  const handleStateClick = (geo: { properties: { name?: string; sigla?: string; NAME?: string } }) => {
    // Try different possible property names for state identification
    const stateCode = geo.properties.sigla || geo.properties.NAME || geo.properties.name;
    if (stateCode && onStateClick) {
      onStateClick(stateCode);
    }
  };

  return (
    <div className="w-full h-[400px] relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [-55, -15],
          scale: 700,
        }}
        width={800}
        height={500}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateCode = geo.properties.sigla || geo.properties.NAME || geo.properties.name;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getStateColor(stateCode)}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      outline: "none",
                      fill: selectedState === stateCode ? "#1d4ed8" : "#2563eb",
                      cursor: "pointer"
                    },
                    pressed: { outline: "none" }
                  }}
                  onMouseEnter={() => setHoveredState(stateCode)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => handleStateClick(geo)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {hoveredState && statesData[hoveredState] && (
        <div className="absolute top-4 left-4 bg-background border rounded-lg p-3 shadow-lg pointer-events-none z-10">
          <p className="font-medium">{hoveredState}</p>
          <p className="text-sm text-muted-foreground">
            {statesData[hoveredState].count} clientes
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">Clientes por estado</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 border"></div>
            <span>0</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border"></div>
            <span>1-5</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-200 border"></div>
            <span>6-15</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 border"></div>
            <span>16-30</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 border"></div>
            <span>31-50</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 border"></div>
            <span>50+</span>
          </div>
        </div>
      </div>
    </div>
  );
}