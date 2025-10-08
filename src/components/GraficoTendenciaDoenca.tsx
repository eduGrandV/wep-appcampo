"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Area,
  ReferenceDot,
} from "recharts";

interface DadosGrafico {
  date: string; 
  notaMedia: number;
}

interface GraficoTendenciaProps {
  data: DadosGrafico[];
}

export default function GraficoTendenciaDoenca({ data }: GraficoTendenciaProps) {
  if (!data || data.length < 2) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-black/20 text-center text-sm text-gray-400">
        Dados insuficientes para exibir uma tendência.
      </div>
    );
  }
return (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart
      data={data}
      margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
    >
      <CartesianGrid 
        strokeDasharray="2 4" 
        stroke="rgba(255, 255, 255, 0.05)" 
        vertical={false}
      />

      <XAxis 
        dataKey="date" 
        stroke="#9ca3af" 
        fontSize={11}
        tick={{ fill: '#d1d5db' }}
        tickMargin={8}
        tickFormatter={(value) => {
         
          if (!value) return '';
          const date = new Date(value);
          return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
          });
        }}
      />

      <YAxis 
        stroke="#9ca3af" 
        fontSize={11}
        domain={[0, 5]}
        tickCount={6}
        width={25}
        tick={{ fill: '#d1d5db' }}
        tickFormatter={(value) => value.toFixed(1)}
      />

      <Tooltip
        contentStyle={{
          backgroundColor: "#111827",
          border: "1px solid #374151",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
        }}
        labelStyle={{ 
          color: "#f3f4f6", 
          fontWeight: "bold",
          marginBottom: "4px"
        }}
        itemStyle={{ color: "#f9fafb" }}
        formatter={(value, name) => {
          const numericValue = Number(value);
          let status = '';
          let color = '#9ca3af';
          
          if (numericValue >= 4) {
            status = ' (Excelente)';
            color = '#10b981';
          } else if (numericValue >= 3) {
            status = ' (Bom)';
            color = '#f59e0b';
          } else {
            status = ' (Atenção)';
            color = '#ef4444';
          }
          
          return [
            <span key="value">
              <span style={{ color, fontWeight: 'bold' }}>{numericValue.toFixed(2)}</span>
              <span style={{ fontSize: '0.8em', color: '#9ca3af' }}>{status}</span>
            </span>,
            'Nota Média'
          ];
        }}
        labelFormatter={(label) => {
          if (!label) return '';
          const date = new Date(label);
          return `Data: ${date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}`;
        }}
      />

      <Legend 
        verticalAlign="top"
        height={36}
        content={({ payload }) => (
          <div className="flex justify-center items-center gap-4 mb-2">
            {payload?.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-1 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-400">{entry.value}</span>
              </div>
            ))}
          </div>
        )}
      />

      {/* Área de fundo com gradiente */}
      <defs>
        <linearGradient id="notaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity={0.3}/>
          <stop offset="100%" stopColor="#34d399" stopOpacity={0.1}/>
        </linearGradient>
      </defs>

      {/* Linha de referência para notas críticas */}
      <ReferenceLine
        y={2.5} 
        stroke="#ef4444" 
        strokeDasharray="3 3" 
        strokeOpacity={0.5}
        label={{
          value: 'Limite de Atenção',
          position: 'right',
          fill: '#ef4444',
          fontSize: 10,
          opacity: 0.7
        }}
      />

      <Line
        type="monotone"
        dataKey="notaMedia"
        name="Nota Média"
        stroke="#34d399"
        strokeWidth={3}
        dot={{ 
          r: 4, 
          fill: "#34d399",
          stroke: "#059669",
          strokeWidth: 2
        }}
        activeDot={{ 
          r: 6, 
          fill: "#059669",
          stroke: "#ffffff",
          strokeWidth: 2
        }}
        strokeLinecap="round"
        connectNulls={true}
      />
      
      {/* Área sob a linha */}
      <Area
        type="monotone"
        dataKey="notaMedia"
        fill="url(#notaGradient)"
        stroke="transparent"
      />

      {/* Pontos de destaque para notas baixas */}
      {data.map((entry, index) => {
        if (entry.notaMedia < 2.5) {
          return (
            <ReferenceDot
              key={`critical-${index}`}
              x={entry.date}
              y={entry.notaMedia}
              r={6}
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth={2}
            />
          );
        }
        return null;
      })}
    </LineChart>
  </ResponsiveContainer>
);
}