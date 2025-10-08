"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import React from "react";

interface DadosGrafico {
  name: string;
  count: number;
}

interface GraficoPrevalenciaProps {
  data: DadosGrafico[];
  onBarClick?: (payload: any) => void;
  selectedItem?: string | null;
}

export default function GraficoPrevalencia({ data, onBarClick, selectedItem }: GraficoPrevalenciaProps) {
  return (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart 
      data={data} 
      layout="horizontal" 
      margin={{ 
        top: 10, 
        right: 10, 
        left: 10, 
        bottom: data.length > 5 ? 120 : 80 
      }}
    >
      <CartesianGrid 
        strokeDasharray="2 4" 
        stroke="rgba(255, 255, 255, 0.05)" 
        vertical={false}
      />
      
      <XAxis 
        type="category" 
        dataKey="name" 
        stroke="#9ca3af" 
        fontSize={11}
        interval={0} 
        angle={data.length > 3 ? -45 : 0} 
        textAnchor={data.length > 3 ? "end" : "middle"}
        height={data.length > 5 ? 80 : 60}
        tick={{ 
          fill: '#d1d5db',
          fontSize: data.length > 8 ? 10 : 11
        }}
        tickMargin={10}
      />
      
      <YAxis 
        type="number" 
        stroke="#9ca3af" 
        fontSize={11}
        allowDecimals={false}
        width={40}
        tick={{ fill: '#d1d5db' }}
        tickCount={6}
      />

      <Tooltip
        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
        contentStyle={{ 
          backgroundColor: '#111827', 
          border: '1px solid #374151',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        }}
        itemStyle={{ color: '#f9fafb' }}
        labelStyle={{ 
          color: '#f3f4f6', 
          fontWeight: 'bold',
          marginBottom: '4px'
        }}
        formatter={(value) => [`${value} registros`, 'Quantidade']}
      />
      
      <Bar 
        dataKey="count" 
        name="Registros" 
        onClick={onBarClick} 
        cursor="pointer" 
        barSize={Math.max(20, 200 / data.length)} 
        radius={[0, 4, 4, 0]}
      >
        {data.map((entry, index) => {
          const getBarColor = (entry: any) => {
            if (entry.name === selectedItem) return '#F97316'; // Laranja para selecionado
            
            const maxCount = Math.max(...data.map(d => d.count));
            const ratio = entry.count / maxCount;
            
            if (ratio > 0.7) return '#ef4444'; // Vermelho para alta prevalência
            if (ratio > 0.4) return '#f59e0b'; // Amarelo para média prevalência
            return '#10b981'; // Verde para baixa prevalência
          };

          return (
            <Cell 
              key={`cell-${index}`} 
              fill={getBarColor(entry)}
              stroke={entry.name === selectedItem ? '#ea580c' : 'transparent'}
              strokeWidth={entry.name === selectedItem ? 2 : 0}
              className="transition-all duration-200 hover:opacity-80"
            />
          );
        })}
      </Bar>

      {/* Label customizado para barras muito pequenas */}
      {data.map((entry, index) => {
        const maxCount = Math.max(...data.map(d => d.count));
        if (entry.count < maxCount * 0.1) { // Mostrar label apenas para barras muito pequenas
          return (
            <text
              key={`label-${index}`}
              x={entry.count + 5}
              y={index * (Math.max(20, 200 / data.length)) + (Math.max(20, 200 / data.length) / 2)}
              textAnchor="start"
              dominantBaseline="middle"
              fill="#9ca3af"
              fontSize={10}
              fontWeight="bold"
            >
              {entry.count}
            </text>
          );
        }
        return null;
      })}
    </BarChart>
  </ResponsiveContainer>
);
}

