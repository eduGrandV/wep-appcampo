"use client";
import { useMemo, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Planta } from "@/types/types";
import GraficoPrevalencia from "./GraficoPrevalencia";
import GraficoTendenciaDoenca from "./GraficoTendenciaDoenca";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Planta[];
  lote: string;
}

export default function ModalAnaliseLote({ isOpen, onClose, data, lote }: ModalProps) {
  const [selectedDoenca, setSelectedDoenca] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const dadosPrevalencia = useMemo(() => {
    const contagem = data.reduce((acc, item) => {
      acc[item.doencaOuPraga] = (acc[item.doencaOuPraga] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(contagem)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  useEffect(() => {
    if (isOpen && dadosPrevalencia.length > 0) {
      setSelectedDoenca(dadosPrevalencia[0].name);
    } else if (!isOpen) {
      setSelectedDoenca(null); 
    }
  }, [isOpen, dadosPrevalencia]);

  const dadosTendencia = useMemo(() => {
    if (!selectedDoenca) return [];

    const registrosDaDoenca = data.filter(p => p.doencaOuPraga === selectedDoenca);

    const notasPorDia = registrosDaDoenca.reduce((acc, item) => {
        const itemDate = new Date(item.criadoEm);
        const year = itemDate.getFullYear();
        const month = String(itemDate.getMonth() + 1).padStart(2, '0');
        const day = String(itemDate.getDate()).padStart(2, '0');
        const diaChave = `${year}-${month}-${day}`;

        if (!acc[diaChave]) {
            acc[diaChave] = [];
        }
        acc[diaChave].push(item.nota);
        return acc;
    }, {} as Record<string, number[]>);

    const diasOrdenados = Object.keys(notasPorDia).sort();

    const dadosFormatados = diasOrdenados.map(diaChave => {
        const notas = notasPorDia[diaChave];
        const soma = notas.reduce((total, nota) => total + nota, 0);
        const media = soma / notas.length;
        
        const dataObj = new Date(diaChave + "T00:00:00Z");
        const dataFormatada = `${String(dataObj.getUTCDate()).padStart(2, '0')}/${String(dataObj.getUTCMonth() + 1).padStart(2, '0')}`;
        
        return { date: dataFormatada, notaMedia: parseFloat(media.toFixed(2)) };
    });
    
    return dadosFormatados;
  }, [data, selectedDoenca]);

  if (!isOpen || !isClient) {
    return null;
  }

  const handleBarClick = (payload: any) => {
    if (payload && payload.name) {
      setSelectedDoenca(payload.name);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Análise de Doenças - Qtde. Planta {lote}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto py-4"> 
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2">Prevalência de Doenças</h3>
            <p className="text-sm text-gray-400 mb-4">Total de registros por tipo. Clique em uma barra para ver a tendência.</p>
            <div className="flex-grow min-h-[300px] bg-black/20 p-4 rounded-lg">
              
                <GraficoPrevalencia 
                    data={dadosPrevalencia} 
                     onBarClick={handleBarClick} 
                    selectedItem={selectedDoenca}
                />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white mb-2">Tendência da Nota Média</h3>
                {selectedDoenca && (
                    <button onClick={() => setSelectedDoenca(null)} className="text-xs text-red-400 hover:text-red-300 mb-2">Limpar Seleção</button>
                )}
            </div>
            <p className="text-sm text-gray-400 mb-4 h-10 flex items-center">{selectedDoenca ? `Mostrando tendência para: ${selectedDoenca}` : "Selecione uma doença no gráfico ao lado para ver sua evolução."}</p>
            <div className="flex-grow min-h-[300px] bg-black/20 p-4 rounded-lg">
                <GraficoTendenciaDoenca data={dadosTendencia} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
}
