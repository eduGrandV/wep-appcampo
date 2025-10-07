//new
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
        
        // CORREÇÃO: Trata as datas de filtro como UTC para evitar problemas de fuso horário
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
        <main className="p-6 md:p-8 min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
            
            <button onClick={() => router.back()} className="text-gray-300 hover:text-white mb-6 bg-white/5 px-4 py-2 rounded-lg">
                &larr; Voltar para o painel
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{nomeCentroCusto}</h1>
            {numeroLote && (
                <p className="text-lg text-gray-300">
                    Qtde. Planta: <span className="font-semibold text-white">{numeroLote}</span>
                </p>
            )}
            <p className="text-gray-400 mb-8">Cada card representa um dia de inspeção. Clique para ver os detalhes.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-black/20 rounded-lg border border-white/10 items-end">
                <div className="flex-1">
                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-400 mb-1">Data Inicial</label>
                    <input 
                        type="date" 
                        id="startDate"
                        value={filtroDataInicio} 
                        onChange={(e) => setFiltroDataInicio(e.target.value)}
                        className="w-full bg-gray-800 border-gray-600 text-white text-sm rounded-lg p-2"
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-400 mb-1">Data Final</label>
                    <input 
                        type="date" 
                        id="endDate"
                        value={filtroDataFim} 
                        onChange={(e) => setFiltroDataFim(e.target.value)}
                        className="w-full bg-gray-800 border-gray-600 text-white text-sm rounded-lg p-2"
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
                        Análise Geral
                    </button>
                </div>
            </div>

            {visitasPorData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {visitasPorData.map(({ dataISO, dataExibicao, count }) => (
                        <div 
                            key={dataISO} 
                            onClick={() => handleDataClick(dataISO)} 
                            className="flex flex-col justify-center items-center bg-gray-900/50 border border-transparent rounded-2xl p-6 cursor-pointer text-center hover:border-green-400/80 transition-all"
                        >
                            <p className="text-sm text-gray-300">Data da Visita</p>
                            <h3 className="text-2xl font-bold text-white mb-2">{dataExibicao}</h3>
                            <p className="text-sm text-gray-300">Registros: <span className="font-semibold text-white">{count}</span></p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400 mt-16">
                    <p>Nenhuma visita registrada para este centro de custo no período selecionado.</p>
                </div>
            )}
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