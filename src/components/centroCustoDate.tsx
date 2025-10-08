"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getPLantas } from "@/services/api";
import { locaPlanta } from "@/data/localPlanta";
import { Planta } from "@/types/types";
import ModalAnaliseLote from "./ModalAnaliseLote";

interface ResumoVisita {
    dataISO: string;
    dataExibicao: string;
    count: number;
}

interface PaginaDatasProps {
    centro: string;
}

export default function PaginaDatasDoCentroDeCusto({ centro }: PaginaDatasProps) {
    const router = useRouter();

    const [dadosDoCentro, setDadosDoCentro] = useState<Planta[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroDataInicio, setFiltroDataInicio] = useState<string>("");
    const [filtroDataFim, setFiltroDataFim] = useState<string>("");
    const [numeroLote, setNumeroLote] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const dadosParaModal = useMemo(() => {
        return dadosDoCentro.filter(item => {
            if (!filtroDataInicio || !filtroDataFim) return true;
            const itemDate = new Date(item.criadoEm);
            const startDate = new Date(filtroDataInicio);
            const endDate = new Date(filtroDataFim);
            endDate.setHours(23, 59, 59, 999);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }, [dadosDoCentro, filtroDataInicio, filtroDataFim]);


    const info = locaPlanta.find(p => p.centroCusto === centro);
    const nomeCentroCusto = info ? info.name : `Centro de Custo ${centro}`;

    useEffect(() => {
        async function fetchDataForCentroDeCusto() {
            setLoading(true);
            try {
                const todasAsPlantas = await getPLantas();
                const dadosFiltrados = todasAsPlantas.filter(p => p.centroCusto?.trim() === centro?.trim());
                setDadosDoCentro(dadosFiltrados);

                if (dadosFiltrados.length > 0) {
                    const hoje = new Date();
                    setNumeroLote(dadosFiltrados[0].lote);

                    const trintaDiasAtras = new Date();
                    trintaDiasAtras.setDate(hoje.getDate() - 30);
                    setFiltroDataInicio(trintaDiasAtras.toISOString().split("T")[0]);
                    setFiltroDataFim(hoje.toISOString().split("T")[0]);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do centro de custo:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDataForCentroDeCusto();
    }, [centro]);

    const visitasPorData = useMemo(() => {
    const dadosFiltradosPorData = dadosDoCentro.filter(item => {
        if (!filtroDataInicio || !filtroDataFim) return true;

        const itemDate = new Date(item.criadoEm);
        
        const startDate = new Date(filtroDataInicio + 'T00:00:00Z');
        const endDate = new Date(filtroDataFim + 'T23:59:59Z');

        return itemDate >= startDate && itemDate <= endDate;
    });

    const visitas = dadosFiltradosPorData.reduce((acc: Record<string, ResumoVisita>, item) => {
        const dataISO = new Date(item.criadoEm).toISOString().split('T')[0];
        if (!acc[dataISO]) {
            const dataObj = new Date(dataISO + "T12:00:00Z");
            acc[dataISO] = { 
                dataISO: dataISO, 
                dataExibicao: dataObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
                count: 0 
            };
        }
        acc[dataISO].count++;
        return acc;
    }, {});

    return Object.values(visitas).sort((a, b) => new Date(b.dataISO).getTime() - new Date(a.dataISO).getTime());
}, [dadosDoCentro, filtroDataInicio, filtroDataFim]);

    const handleDataClick = (dataISO: string) => {
        router.push(`/centro-de-custo/${centro}/${dataISO}`);
    };

    if (loading) return <div className="p-6 text-center text-white min-h-screen bg-gray-900">Carregando histórico para {nomeCentroCusto}...</div>;






return (
    <>
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
            {/* Header Section */}
            <div className="p-6 lg:p-8 border-b border-white/10">
                <div className="max-w-7xl mx-auto">
                    <button 
                        onClick={() => router.back()} 
                        className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all duration-200 group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar para o painel
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                                {nomeCentroCusto}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-300">
                                {numeroLote && (
                                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg">
                                        <span className="text-green-400">🌿</span>
                                        <span className="text-sm">
                                            Qtde. Plantas: <span className="font-semibold text-white">{numeroLote}</span>
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>📅</span>
                                    <span>Clique em um card para ver os detalhes da visita</span>
                                </div>
                            </div>
                        </div>

                        {/* Filtros e Análise Geral */}
                        <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                                    <div>
                                        <label htmlFor="startDate" className="block text-xs font-medium text-gray-400 mb-2">
                                            Data Inicial
                                        </label>
                                        <input 
                                            type="date" 
                                            id="startDate"
                                            value={filtroDataInicio} 
                                            onChange={(e) => setFiltroDataInicio(e.target.value)}
                                            className="w-full bg-gray-800/50 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className="block text-xs font-medium text-gray-400 mb-2">
                                            Data Final
                                        </label>
                                        <input 
                                            type="date" 
                                            id="endDate"
                                            value={filtroDataFim} 
                                            onChange={(e) => setFiltroDataFim(e.target.value)}
                                            className="w-full bg-gray-800/50 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 min-w-[140px]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                    </svg>
                                    Análise Geral
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visitas Grid */}
            <div className="p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {visitasPorData.length > 0 ? (
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                            {visitasPorData.map(({ dataISO, dataExibicao, count }) => (
                                <div 
                                    key={dataISO} 
                                    onClick={() => handleDataClick(dataISO)} 
                                    className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/70 border border-gray-700 rounded-2xl p-5 cursor-pointer text-center hover:border-green-400/60 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm overflow-hidden"
                                >
                                    {/* Efeito de brilho no hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    
                                    <div className="relative z-10">
                                        <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                                            Data da Visita
                                        </p>
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 font-mono">
                                            {dataExibicao}
                                        </h3>
                                        <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-gray-600/50">
                                            <span className="text-green-400 text-sm">📊</span>
                                            <span className="text-sm text-gray-300">
                                                <span className="font-semibold text-white">{count}</span> registro{count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Indicador de clique */}
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 lg:py-24">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-300 mb-2">Nenhuma visita encontrada</h3>
                                <p className="text-gray-500 text-sm">
                                    Não há visitas registradas para este centro de custo no período selecionado.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>

        <ModalAnaliseLote
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            data={dadosParaModal}
            lote={numeroLote || ""}
        />
    </>
);
}