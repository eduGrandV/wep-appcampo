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
        margin={{ top: 5, right: 20, left: 0, bottom: 120 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        
        <XAxis 
            type="category" 
            dataKey="name" 
            stroke="#9ca3af" 
            fontSize={12}
            interval={0} 
            angle={-45} 
            textAnchor="end" 
        />
        
        <YAxis 
            type="number" 
            stroke="#9ca3af" 
            fontSize={12} 
            allowDecimals={false} 
        />

        <Tooltip
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
        />
        
        <Bar dataKey="count" name="Registros" onClick={onBarClick} cursor="pointer" barSize={30}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.name === selectedItem ? '#F97316' : '#34d399'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

