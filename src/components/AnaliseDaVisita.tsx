"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Importa o router
import { protocolosDeAcao, RegraAcao, Problema, TipoProblema } from "@/data/localPlanta";
import { StatusAcao } from "./Statusacao";

import "jspdf-autotable";


interface Avaliacao {
  doencaOuPraga: string;
  orgao: string | null;
  nota: number;
  lote: number;
  local?: "Bordadura" | "Área interna da parcela" | string;
  ramo?: string | null;
}

export interface Resultado {
  nome: string;
  tipo: TipoProblema;
  orgao: string | null;
  percentual?: number;
  percentualBordadura?: number;
  percentualAreaInterna?: number;
  mediaGeral?: number;
  contagemPresenca?: number;
}

interface AnaliseProblemaProps {
  avaliacoes: Avaliacao[];
  listaProblemas: Problema[];
  lote: string;
  centro: string;
}

const BarraProgresso = ({ percentual, titulo }: { percentual: number; titulo: string }) => {
  let cor = "bg-green-500";
  if (percentual >= 5) cor = "bg-red-500";
  else if (percentual >= 4) cor = "bg-yellow-400";

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-300">{titulo}</span>
        <span className="text-sm font-semibold text-white">{percentual.toFixed(2)}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700">
        <div
          className={`${cor} h-4 transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(percentual, 100)}%` }}
        />
      </div>
    </div>
  );
};

const DisplayContagem = ({ contagem, titulo }: { contagem: number; titulo: string }) => (
  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 text-center shadow-md">
    <p className="text-sm text-blue-300 mb-2">{titulo}</p>
    <p className="text-4xl font-extrabold text-white">{contagem}</p>
    <p className="text-xs text-gray-400 mt-1">registros com presença</p>
  </div>
);


export default function AnaliseProblema({ avaliacoes, listaProblemas, lote, centro }: AnaliseProblemaProps) {
  const router = useRouter(); 
  const [exportLibsLoaded, setExportLibsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined" && !(window as any).XLSX) {
        const xlsx = await import("xlsx");
        (window as any).XLSX = xlsx;
        setExportLibsLoaded(true);
      } else if (typeof window !== "undefined") {
        setExportLibsLoaded(true);
      }
    })();
  }, []);

  const resultados = useMemo(() => {
    const resultadosFinais: Resultado[] = [];
    const grupos = avaliacoes.reduce((acc, cur) => {
      const chave = `${cur.doencaOuPraga}-${cur.orgao}`;
      if (!acc[chave]) acc[chave] = [];
      acc[chave].push(cur);
      return acc;
    }, {} as Record<string, Avaliacao[]>);

    for (const chave in grupos) {
      const avaliacoesDoGrupo = grupos[chave];
      if (avaliacoesDoGrupo.length === 0) continue;
      const problemaNome = avaliacoesDoGrupo[0].doencaOuPraga;
      const orgao = avaliacoesDoGrupo[0].orgao;
      const loteNum = avaliacoesDoGrupo[0].lote;
      const infoProblema = listaProblemas.find(p => p.nome.toUpperCase() === problemaNome.toUpperCase());
      if (!infoProblema) continue;

      if (infoProblema.tipo === 'doenca') {
        const soma = avaliacoesDoGrupo.reduce((s, d) => s + d.nota, 0);
        let maximo = 4 * loteNum;
        if (orgao && orgao.toUpperCase() === "FOLHA") maximo = 8 * loteNum;
        const percentual = maximo > 0 ? (soma * 100) / maximo : 0;
        resultadosFinais.push({ nome: problemaNome, tipo: 'doenca', orgao, percentual });
      }
      else if (infoProblema.tipo === 'praga') {
  
        const totalBordadura = avaliacoesDoGrupo
          .filter(r => r.local === "Bordadura")
          .reduce((acc, n) => acc + n.nota, 0);

        const totalAreaInterna = avaliacoesDoGrupo
          .filter(r => r.local !== "Bordadura")
          .reduce((acc, n) => acc + n.nota, 0);

        let maxBordadura = 4;
        let maxAreaInterna = 6;

        if (loteNum === 14) { maxBordadura = 5; maxAreaInterna = 9; }
        else if (loteNum === 18) { maxBordadura = 6; maxAreaInterna = 12; }

      
        const multiplicador = (orgao && orgao.toUpperCase() === 'FOLHA') ? 8 : 4;

    
        const divisorBordadura = maxBordadura * multiplicador;
        const divisorAreaInterna = maxAreaInterna * multiplicador;

        
        const percentualBordadura = divisorBordadura > 0 ? (totalBordadura * 100) / divisorBordadura : 0;
        const percentualAreaInterna = divisorAreaInterna > 0 ? (totalAreaInterna * 100) / divisorAreaInterna : 0;

       
        const mediaGeral = (percentualBordadura + percentualAreaInterna) / 2;

       
        resultadosFinais.push({
          nome: problemaNome,
          tipo: 'praga',
          orgao,
          percentualBordadura,
          percentualAreaInterna,
          mediaGeral
        });
      } else if (infoProblema.tipo === 'inimigo natural') {
        const contagemPresenca = avaliacoesDoGrupo.filter(r => r.nota > 0).length;
        resultadosFinais.push({ nome: problemaNome, tipo: 'inimigo natural', orgao, contagemPresenca });
      }
    }
    return resultadosFinais;
  }, [avaliacoes, listaProblemas]);

  const exportarExcel = () => {
    if (!exportLibsLoaded) {
      alert('Aguarde, as bibliotecas de exportação estão carregando.');
      return;
    }
    const resultadosCriticos = resultados.filter(item => {
      if (item.tipo === 'doenca') return (item.percentual || 0) >= 5;
      if (item.tipo === 'praga') return (item.mediaGeral || 0) >= 5;
      return false;
    });
    if (resultadosCriticos.length === 0) {
      alert("Nenhum alerta crítico para exportar.");
      return;
    }
    const XLSX = (window as any).XLSX;
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const resumo = [{ Campo: "Centro de Custo", Valor: centro }, { Campo: "Lote", Valor: lote }, { Campo: "Data do Relatório", Valor: dataAtual }];
    const wsResumo = XLSX.utils.json_to_sheet(resumo);
    const dadosParaExportar = resultadosCriticos.map(item => ({
      "Problema": item.nome,
      "Órgão": item.orgao,
      "Tipo": item.tipo,
      "Valor Crítico (%)": item.tipo === 'doenca' ? item.percentual?.toFixed(2) : item.mediaGeral?.toFixed(2),
    }));
    const wsDetalhes = XLSX.utils.json_to_sheet(dadosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");
    XLSX.utils.book_append_sheet(wb, wsDetalhes, "Alertas Críticos");
    XLSX.writeFile(wb, `Alertas_Criticos_${centro}_Lote${lote}_${dataAtual}.xlsx`);
  };


  const exportarPdf = () => {
    if (!exportLibsLoaded) {
      alert("Aguarde, as bibliotecas de exportação estão carregando.");
      return;
    }

    const { jsPDF } = (window as any).jspdf;

    const resultadosCriticos = resultados.filter(item => {
      if (item.tipo === 'doenca') return (item.percentual || 0) >= 5;
      if (item.tipo === 'praga') return (item.mediaGeral || 0) >= 5;
      return false;
    });

    if (resultadosCriticos.length === 0) {
      alert("Nenhum alerta crítico para exportar.");
      return;
    }

    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    doc.setFontSize(20);
    doc.setTextColor(200, 50, 50);
    doc.text("Relatório de Alertas Críticos", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text(`Centro de Custo: ${centro}`, 14, 30);
    doc.text(`Lote: ${lote}`, 14, 36);
    doc.text(`Relatório gerado em: ${dataAtual}`, 14, 42);


    (doc as any).autoTable({
      startY: 50,
      head: [['Problema', 'Órgão', 'Tipo', 'Valor (%)']],
      body: resultadosCriticos.map(item => {
        let valor = 'N/A';
        if (item.tipo === 'doenca') valor = `${item.percentual?.toFixed(2)}%`;
        if (item.tipo === 'praga') valor = `${item.mediaGeral?.toFixed(2)}%`;
        return [item.nome, item.orgao, item.tipo, valor];
      }),
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43], textColor: 255, fontStyle: 'bold' },
      styles: { cellPadding: 2, fontSize: 9 },
      columnStyles: { 3: { halign: 'right' } }
    });

    // Número de páginas
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    }

    doc.save(`Alertas_Criticos_${centro}_Lote${lote}.pdf`);
  };
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      <button onClick={() => router.back()} className="text-gray-300 hover:text-white mb-6 bg-white/5 px-4 py-2 rounded-lg w-fit text-sm transition-colors">
        &larr; Voltar
      </button>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 text-center sm:text-left">
            Análise de Problemas
          </h1>
          <p className="text-gray-400">Qtde. Planta: {lote} | Centro de Custo: {centro}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={exportarExcel} disabled={!exportLibsLoaded} title={!exportLibsLoaded ? "Aguarde..." : "Exportar para Excel"} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Excel
          </button>
          <button onClick={exportarPdf} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resultados.map((item) => {
          const protocolo = protocolosDeAcao[item.nome.toUpperCase()];
          return (
            <div key={`${item.nome}-${item.orgao}`} className="p-6 bg-black/30 rounded-2xl border border-white/20 shadow-lg flex flex-col">
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-orange-400 mb-2">{item.nome}</h2>
                <p className="text-sm text-gray-300 mb-4">Órgão: {item.orgao}</p>
                {item.tipo === 'doenca' && item.percentual !== undefined && (
                  <BarraProgresso percentual={item.percentual} titulo="Severidade" />
                )}
                {item.tipo === 'praga' && (
                  <div className="space-y-3">
                    <BarraProgresso percentual={item.percentualBordadura!} titulo="Infestação (Bordadura)" />
                    <BarraProgresso percentual={item.percentualAreaInterna!} titulo="Infestação (Área Interna)" />
                    <div className="pt-2 border-t border-white/20 text-right">
                      <span className="text-white font-bold">Média Geral: {item.mediaGeral!.toFixed(2)}%</span>
                    </div>
                  </div>
                )}
                {item.tipo === 'inimigo natural' && item.contagemPresenca !== undefined && (
                  <DisplayContagem contagem={item.contagemPresenca} titulo="Contagem de Presença" />
                )}
              </div>
              {protocolo && (item.tipo === 'doenca' || item.tipo === 'praga') && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <StatusAcao resultado={item} regras={protocolo.nivelDeAcao} />
                </div>
              )}
            </div>
          )
        })}
        {resultados.length === 0 && (
          <div className="col-span-full p-8 text-center bg-black/20 rounded-2xl border border-white/20">
            <p className="text-gray-400">Nenhum dado de avaliação encontrado para exibir.</p>
          </div>
        )}
      </div>
    </div>
  );
}