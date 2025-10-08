"use client";
import { useEffect, useRef, useState } from "react";
import L, { FeatureGroup, Layer, LayerOptions } from "leaflet";
import "leaflet.heat";
import "leaflet.markercluster";

// A declaração de módulo permanece a mesma
declare module 'leaflet' {
  interface MarkerClusterGroupOptions extends LayerOptions {
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyOnMaxZoom?: boolean;
    removeOutsideVisibleBounds?: boolean;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    maxClusterRadius?: number | ((zoom: number) => number);
  }

  class MarkerClusterGroup extends FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: Layer): this;
    removeLayer(layer: Layer): this;
    clearLayers(): this;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}

interface LocalDoenca {
  latitude: number;
  longitude: number;
  quadrante: string;
  ramo: string;
  nota: number;
  doenca: string;
  centroCusto: string;
}

interface MapaDoencasProps {
  locais: LocalDoenca[];
  hoveredCentro?: string | null;
}

const getMarkerIcon = (nota: number) => {
  const color = nota > 4 ? '#f87171' : nota > 2 ? '#fbbf24' : '#4ade80';
  return L.divIcon({
    html: `<svg viewBox="0 0 24 24" fill="${color}" width="24px" height="24px" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    className: 'custom-marker-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
};

export default function MapaDoencas({ locais, hoveredCentro }: MapaDoencasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const clusterLayerRef = useRef<L.MarkerClusterGroup | null>(null);
  const highlightLayerRef = useRef<L.LayerGroup | null>(null);
  const layerControlRef = useRef<L.Control.Layers | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Verificar se o container tem dimensões válidas
  useEffect(() => {
    if (!mapRef.current) return;

    const checkContainerSize = () => {
      if (mapRef.current) {
        const { width, height } = mapRef.current.getBoundingClientRect();
        return width > 0 && height > 0;
      }
      return false;
    };

    // Tentar inicializar imediatamente
    if (checkContainerSize()) {
      setIsMapReady(true);
      return;
    }

    // Se não estiver pronto, aguardar um pouco e tentar novamente
    const timer = setTimeout(() => {
      if (checkContainerSize()) {
        setIsMapReady(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Inicializar o mapa quando o container estiver pronto
  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstanceRef.current) return;

    const satelliteLayer = L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { 
      attribution: "Tiles &copy; Esri" 
    });
    
    const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
    });

    const map = L.map(mapRef.current, {
      layers: [satelliteLayer],
      minZoom: 8,
      maxZoom: 17,
      // Prevenir erros de dimensão
      preferCanvas: true
    });

    mapInstanceRef.current = map;
    highlightLayerRef.current = L.layerGroup().addTo(map);

    const baseMaps = { 
      "Satélite": satelliteLayer, 
      "Ruas": streetLayer 
    };
    
    layerControlRef.current = L.control.layers(baseMaps).addTo(map);

    // Forçar atualização do mapa após um breve delay
    setTimeout(() => {
      map.invalidateSize();
    }, 50);

  }, [isMapReady]);

  // Atualizar dados do mapa
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerControl = layerControlRef.current;
    
    if (!map || !layerControl || !isMapReady) return;

    // Limpar layers existentes
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      layerControl.removeLayer(heatLayerRef.current);
    }
    
    if (clusterLayerRef.current) {
      map.removeLayer(clusterLayerRef.current);
      layerControl.removeLayer(clusterLayerRef.current);
    }

    if (locais.length === 0) {
      map.setView([-15.78, -47.92], 4);
      return;
    }

    // Adicionar mapa de calor
    const heatData = locais.map((l) => [l.latitude, l.longitude, l.nota]);
    heatLayerRef.current = (L as any).heatLayer(heatData, { 
      radius: 25, 
      blur: 20,
      maxZoom: 17
    });

    // Adicionar cluster de marcadores
    clusterLayerRef.current = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50
    });

    locais.forEach((l) => {
      const marker = L.marker([l.latitude, l.longitude], { 
        icon: getMarkerIcon(l.nota) 
      }).bindPopup(`
        <div class="p-2">
          <strong class="text-sm">${l.doenca}</strong><br/>
          <span class="text-xs">Quadrante: ${l.quadrante}</span><br/>
          <span class="text-xs">Nota: ${l.nota}</span>
        </div>
      `);
      
      clusterLayerRef.current!.addLayer(marker);
    });

    // Adicionar layers ao controle
    if (heatLayerRef.current) {
      layerControl.addOverlay(heatLayerRef.current, "Mapa de Calor");
    }
    
    if (clusterLayerRef.current) {
      layerControl.addOverlay(clusterLayerRef.current, "Pontos Agrupados");
      map.addLayer(clusterLayerRef.current);
    }

    // Ajustar bounds apenas se houver locais
    if (locais.length > 0) {
      const bounds = L.latLngBounds(locais.map(l => [l.latitude, l.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }


    setTimeout(() => {
      map.invalidateSize();
    }, 0);

  }, [locais, isMapReady]);

  // Efeito para highlight
  useEffect(() => {
    const highlightLayer = highlightLayerRef.current;
    if (!highlightLayer || !isMapReady) return;
    
    highlightLayer.clearLayers();
    
    if (hoveredCentro && locais.length > 0) {
      const locaisFiltrados = locais.filter(l => l.centroCusto === hoveredCentro);
      locaisFiltrados.forEach(l => {
        L.circleMarker([l.latitude, l.longitude], {
          radius: 15, 
          color: '#f97316', 
          weight: 3, 
          fill: false, 
          interactive: false,
        }).addTo(highlightLayer);
      });
    }
  }, [hoveredCentro, locais, isMapReady]);


  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full bg-gray-800"
      style={{ minHeight: '600px' }}
    />
  );
}