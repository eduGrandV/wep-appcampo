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
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[2000] p-3 sm:p-4" onClick={onClose}>
    <div 
      className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col shadow-2xl" 
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-start sm:items-center p-4 sm:p-6 border-b border-white/10 bg-gray-900/80 sticky top-0 z-10">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
            Análise de Doenças - Qtde. Planta {lote}
          </h2>
          <p className="text-gray-400 text-sm mt-1 hidden sm:block">
            Visão detalhada da prevalência e tendência das doenças
          </p>
        </div>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white text-2xl sm:text-3xl leading-none p-1 hover:bg-white/10 rounded-lg transition-colors ml-4"
          aria-label="Fechar modal"
        >
          &times;
        </button>
      </div>
      
      {/* Content Grid */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Left Column - Prevalence */}
          <div className="bg-black/20 border border-white/10 rounded-xl p-4 sm:p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <span className="text-green-400">📊</span>
                Prevalência de Doenças
              </h3>
              <p className="text-sm text-gray-400">
                Total de registros por tipo. Clique em uma barra para ver a tendência.
              </p>
            </div>
            
            <div className="flex-grow min-h-[300px] bg-black/30 rounded-lg p-3 sm:p-4">
              <GraficoPrevalencia 
                data={dadosPrevalencia} 
                onBarClick={handleBarClick} 
                selectedItem={selectedDoenca}
              />
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1 text-gray-400">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Baixa prevalência</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Média prevalência</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Alta prevalência</span>
              </div>
            </div>
          </div>

          {/* Right Column - Trend */}
          <div className="bg-black/20 border border-white/10 rounded-xl p-4 sm:p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-400">📈</span>
                  Tendência da Nota Média
                </h3>
                <p className="text-sm text-gray-400 min-h-[40px] flex items-center">
                  {selectedDoenca 
                    ? <span>Mostrando tendência para: <span className="text-orange-400 font-semibold">{selectedDoenca}</span></span>
                    : "Selecione uma doença no gráfico ao lado para ver sua evolução."
                  }
                </p>
              </div>
              
              {selectedDoenca && (
                <button 
                  onClick={() => setSelectedDoenca(null)}
                  className="flex-shrink-0 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-lg transition-colors ml-4 flex items-center gap-1"
                >
                  <span>✕</span>
                  Limpar
                </button>
              )}
            </div>
            
            <div className="flex-grow min-h-[300px] bg-black/30 rounded-lg p-3 sm:p-4">
              <GraficoTendenciaDoenca data={dadosTendencia} />
            </div>
            
            {/* Trend Indicators */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-[2px] bg-blue-400"></div>
                <span className="text-gray-400">Linha de tendência</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">Pontos de dados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl text-green-400 mb-2">📅</div>
            <p className="text-gray-400 text-sm">Período Analisado</p>
            <p className="text-white font-semibold">Últimos 30 dias</p>
          </div>
          
          <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl text-blue-400 mb-2">🔍</div>
            <p className="text-gray-400 text-sm">Total de Doenças</p>
            <p className="text-white font-semibold">{dadosPrevalencia.length} tipos</p>
          </div>
          
        
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition-colors text-sm"
          >
            Fechar
          </button>
         
        </div>
      </div>
    </div>
  </div>,
  document.getElementById('modal-root')!
);
}
