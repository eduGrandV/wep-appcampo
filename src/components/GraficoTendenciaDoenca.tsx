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
        margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />

        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />

        <YAxis stroke="#9ca3af" fontSize={12} domain={[1, 5]} />

        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #4b5563",
          }}
          labelStyle={{ color: "#e5e7eb" }}
        />

        <Legend />

        <Line
          type="monotone"
          dataKey="notaMedia"
          name="Nota Média"
          stroke="#34d399" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}