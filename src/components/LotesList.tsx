"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { problemas as listaProblemas, locaPlanta } from "@/data/localPlanta";
import { Planta } from "@/types/types";
import { getPLantas } from "@/services/api";

// --- TIPOS DE DADOS ---
interface AlertaItem {
    nome: string;
    orgao: string | null;
    lote: string;
    centroCusto: string;
    valor: number;
    tipo: 'doenca' | 'praga' | 'inimigo natural';
}

interface ResumoCentroCusto {
    centroCusto: string;
    nome: string;
    lote: string
    count: number;
    ultimaData: Date;
}


export default function LotesList() {
    const [data, setData] = useState<Planta[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [erro, setError] = useState<string | null>(null);
    const router = useRouter();
    const [filtroLote, setFiltroLote] = useState<string>("");
    const [sortBy, setSortBy] = useState<'ultimaData' | 'count' | 'centroCusto'>('ultimaData');
    const [filtroDataInicio, setFiltroDataInicio] = useState<string>("");
    const [filtroDataFim, setFiltroDataFim] = useState<string>("");
    const [filtroPesquisa, setFiltroPesquisa] = useState<string>("");
    const [alertasAberto, setAlertasAberto] = useState(false);
    const [graficoAberto, setGraficoAberto] = useState(false);

 useEffect(() => {
    async function fetchData() {
        setLoading(true);
        setError(null);
        try {
        
            const json = await getPLantas();
            setData(json);

    
            const hoje = new Date();
            const trintaDiasAtras = new Date();
            trintaDiasAtras.setDate(hoje.getDate() - 30);
            setFiltroDataInicio(trintaDiasAtras.toISOString().split("T")[0]);
            setFiltroDataFim(hoje.toISOString().split("T")[0]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
}, []);

    const dadosFiltrados = useMemo(() => {
    return data.filter((item: Planta) => {
        const filtroLoteOk = !filtroLote || item.lote === filtroLote;


        if (!filtroDataInicio || !filtroDataFim) {
            return filtroLoteOk;
        }

        const itemDate = new Date(item.criadoEm);
        
        
        const startDate = new Date(filtroDataInicio + 'T00:00:00Z'); 
 
        const endDate = new Date(filtroDataFim + 'T23:59:59Z'); 
        
        const filtroDataOk = itemDate >= startDate && itemDate <= endDate;
        
        return filtroLoteOk && filtroDataOk;
    });
}, [data, filtroLote, filtroDataInicio, filtroDataFim]);

   
    const resumoPorLoteECentro: ResumoCentroCusto[] = useMemo(() => {
        const grupos = dadosFiltrados.reduce((acc: Record<string, ResumoCentroCusto>, item: Planta) => {
            const { centroCusto, criadoEm, lote } = item;

           
            const chaveUnica = `${lote}-${centroCusto}`;

            const itemDate = new Date(criadoEm);

            if (!acc[chaveUnica]) {
                const infoPlanta = locaPlanta.find(p => p.centroCusto === centroCusto);
                acc[chaveUnica] = {
                    centroCusto,
                    nome: infoPlanta?.name || centroCusto,
                    lote: lote,
                    count: 0,
                    ultimaData: new Date(0)
                };
            }

            acc[chaveUnica].count++;
            if (itemDate > acc[chaveUnica].ultimaData) {
                acc[chaveUnica].ultimaData = itemDate;
            }
            return acc;
        }, {});

        const arrayDeResumos = Object.values(grupos);

        // A ordenação continua funcionando
        switch (sortBy) {
            case 'ultimaData': return arrayDeResumos.sort((a, b) => b.ultimaData.getTime() - a.ultimaData.getTime());
            case 'count': return arrayDeResumos.sort((a, b) => b.count - a.count);
            case 'centroCusto': return arrayDeResumos.sort((a, b) => a.nome.localeCompare(b.nome));
            default: return arrayDeResumos;
        }
    }, [dadosFiltrados, sortBy]);


    const centrosDeCustoVisiveis = useMemo(() => {

        if (!filtroPesquisa) return resumoPorLoteECentro;
        const termo = filtroPesquisa.toLowerCase();

        return resumoPorLoteECentro.filter(cc =>
            cc.nome.toLowerCase().includes(termo) ||
            cc.centroCusto.toLowerCase().includes(termo)
        );
    }, [resumoPorLoteECentro, filtroPesquisa]);


    const painelStats = useMemo(() => {
        const centrosUnicos = centrosDeCustoVisiveis.length;
        const totalRegistros = dadosFiltrados.length;
        // E AQUI
        const centroMaisAtivo = resumoPorLoteECentro.reduce((max, centro) => (centro.count > max.count ? centro : max), { nome: 'N/A', centroCusto: 'N/A', lote: '', count: 0, ultimaData: new Date(0) });
        return { totalDeCentros: centrosUnicos, totalDeRegistros: totalRegistros, centroMaisAtivo: centroMaisAtivo };
    }, [dadosFiltrados, resumoPorLoteECentro, centrosDeCustoVisiveis]);

    const analiseAlertasCriticos = useMemo(() => {
        const alertasCriticos: AlertaItem[] = [];

        const gruposPorLote = dadosFiltrados.reduce((acc: Record<string, Planta[]>, cur: Planta) => {
            if (!acc[cur.lote]) acc[cur.lote] = [];
            acc[cur.lote].push(cur);
            return acc;
        }, {});

        // 2. Itera sobre cada Lote
        for (const loteNum in gruposPorLote) {
            const avaliacoesDoLote = gruposPorLote[loteNum];

            // 3. Agrupa os dados do Lote por Problema + Órgão
            const gruposProblemaOrgao = avaliacoesDoLote.reduce((acc: Record<string, Planta[]>, cur: Planta) => {
                const chave = `${cur.doencaOuPraga}-${cur.orgao}`;
                if (!acc[chave]) acc[chave] = [];
                acc[chave].push(cur);
                return acc;
            }, {});

            // 4. Itera sobre cada grupo de Problema + Órgão para calcular a criticidade
            for (const chave in gruposProblemaOrgao) {
                const avaliacoesDoGrupo = gruposProblemaOrgao[chave];
                if (avaliacoesDoGrupo.length === 0) continue;

                const problemaNome = avaliacoesDoGrupo[0].doencaOuPraga;
                const orgao = avaliacoesDoGrupo[0].orgao;
                const centroCusto = avaliacoesDoGrupo[0].centroCusto;
                const infoProblema = listaProblemas.find(p => p.nome.toUpperCase() === problemaNome.toUpperCase());

                if (!infoProblema) continue;

                const plantasAmostradas = new Set(avaliacoesDoGrupo.map(a => a.planta)).size;

                if (infoProblema.tipo === 'doenca' && plantasAmostradas > 0) {
                    const soma = avaliacoesDoGrupo.reduce((s: number, d: Planta) => s + (d.nota || 0), 0);
                    let maximo = 4 * plantasAmostradas;
                    if (orgao && orgao.toUpperCase() === "FOLHA") maximo = 8 * plantasAmostradas;
                    const percentual = maximo > 0 ? (soma * 10) / maximo : 0;

                    if (percentual >= 5) {
                        alertasCriticos.push({ nome: problemaNome, orgao, lote: loteNum, centroCusto, valor: percentual, tipo: 'doenca' });
                    }
                }
                else if (infoProblema.tipo === 'praga') {
                    const totalBordadura = avaliacoesDoGrupo.filter(r => r.numeroLocal === "Bordadura").reduce((acc, n) => acc + (n.nota || 0), 0);
                    const totalAreaInterna = avaliacoesDoGrupo.filter(r => r.numeroLocal === "Área interna da parcela").reduce((acc, n) => acc + (n.nota || 0), 0);
                    let maxBordadura = 4, maxAreaInterna = 6;
                    if (loteNum === "14") { maxBordadura = 5; maxAreaInterna = 9; }
                    else if (loteNum === "18") { maxBordadura = 6; maxAreaInterna = 12; }
                    const multiplicadorAmostra = avaliacoesDoGrupo.some(r => r.ramo) ? 8 : 4;
                    const divisorBordadura = maxBordadura * multiplicadorAmostra;
                    const divisorAreaInterna = maxAreaInterna * multiplicadorAmostra;
                    const percentualBordadura = divisorBordadura > 0 ? (totalBordadura * 100) / divisorBordadura : 0;
                    const percentualAreaInterna = divisorAreaInterna > 0 ? (totalAreaInterna * 100) / divisorAreaInterna : 0;
                    const mediaGeral = (percentualBordadura + percentualAreaInterna) / 2;

                    if (mediaGeral >= 5) {
                        alertasCriticos.push({ nome: problemaNome, orgao, lote: loteNum, centroCusto, valor: mediaGeral, tipo: 'praga' });
                    }
                }
            }
        }
        return alertasCriticos.sort((a, b) => b.valor - a.valor);
    }, [dadosFiltrados]);

    const lotesUnicosParaFiltro = useMemo(() => Array.from(new Set(data.map((item) => item.lote))).sort((a, b) => a.localeCompare(b)), [data]);

    const handleCentroCustoClick = (centroCusto: string) => router.push(`/centro-de-custo/${centroCusto}`);


    if (loading) return <div className="p-6 text-center text-white min-h-screen bg-gray-900">Carregando Painel...</div>;
    if (erro) return <div className="p-6 text-center text-red-500 min-h-screen bg-gray-900">Erro: {erro}</div>;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-800/80 backdrop-blur-sm border border-white/20 p-3 rounded-lg shadow-lg">
                    <p className="font-bold text-white">{label}</p>
                    <p className="text-sm text-gray-300">Registros: <span className="font-semibold text-green-400">{data.count}</span></p>
                    <p className="text-sm text-gray-300">Última Visita: <span className="font-semibold text-white">{data.ultimaData.toLocaleDateString()}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">

            {/* --- Cabeçalho --- */}
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Painel de Monitoramento</h1>
                <p className="text-gray-400 mt-1">Visão geral dos centros de custo e atividades recentes.</p>
            </div>

            {/* --- Cards de Estatísticas --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Centros de Custo Visíveis */}
                <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="text-green-400 text-3xl sm:text-4xl">🏢</div>
                    <div>
                        <p className="text-gray-400 text-sm">Centros de Custo Visíveis</p>
                        <p className="text-white text-xl sm:text-2xl font-bold">{painelStats.totalDeCentros}</p>
                    </div>
                </div>

                {/* Total de Registros */}
                <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="text-green-400 text-3xl sm:text-4xl">📋</div>
                    <div>
                        <p className="text-gray-400 text-sm">Total de Registros</p>
                        <p className="text-white text-xl sm:text-2xl font-bold">{painelStats.totalDeRegistros}</p>
                    </div>
                </div>

                {/* Centro Mais Ativo */}
                <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                    <div className="text-orange-400 text-3xl sm:text-4xl">🔥</div>
                    <div className="truncate">
                        <p className="text-gray-400 text-sm">CC com Mais Atividade</p>
                        <p className="text-white text-lg sm:text-xl font-bold truncate" title={painelStats.centroMaisAtivo.nome}>
                            {painelStats.centroMaisAtivo.nome}
                            <span className="text-base text-gray-400"> ({painelStats.centroMaisAtivo.count} regs)</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* --- Filtros de Pesquisa --- */}
            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 mb-8">
                <div className="border-b border-white/10 pb-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-white">Explorar Atividades</h2>

                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 flex-wrap">
                        <span className="text-sm text-gray-400">Filtrar por:</span>
                        <select value={filtroLote} onChange={(e) => setFiltroLote(e.target.value)} className="w-full sm:w-auto p-2 rounded bg-gray-800 border border-gray-600 text-white">
                            <option value="">Todos os Lotes</option>
                            {lotesUnicosParaFiltro.map((lote) => (<option key={lote} value={lote}>{lote}</option>))}
                        </select>
                        <input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} className="w-full sm:w-auto p-2 rounded bg-gray-800 border border-gray-600 text-white" />
                        <input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} className="w-full sm:w-auto p-2 rounded bg-gray-800 border border-gray-600 text-white" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <span className="text-sm text-gray-400">Ordenar por:</span>
                        <button onClick={() => setSortBy('ultimaData')} className={`px-3 py-1 text-xs rounded-md transition-colors ${sortBy === 'ultimaData' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Mais Recentes</button>
                        <button onClick={() => setSortBy('count')} className={`px-3 py-1 text-xs rounded-md transition-colors ${sortBy === 'count' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Mais Registros</button>
                        <button onClick={() => setSortBy('centroCusto')} className={`px-3 py-1 text-xs rounded-md transition-colors ${sortBy === 'centroCusto' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Ordem A-Z</button>
                    </div>
                </div>


                <div className="p-4 rounded-xl border-2 border-red-500/50 bg-red-900/20 flex flex-col mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="text-red-400 text-3xl">⚠️</div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white">Alertas Críticos</h3>
                            <p className="text-xs text-red-300">Problemas acima de 5% no período selecionado.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6">
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setAlertasAberto(!alertasAberto)}
                            >
                                <h3 className="text-lg font-semibold text-white">Alertas Críticos <br /> ( Qtde. Planta - 42 )</h3>
                                <span className="text-white text-xl">{alertasAberto ? "▲" : "▼"}</span>
                            </div>

                            {alertasAberto && (
                                <div className="flex-grow space-y-3 overflow-y-auto max-h-56 pr-2  mt-4">
                                    {analiseAlertasCriticos.length > 0 ? (
                                        analiseAlertasCriticos.map((alerta, index) => {
                                            
                                            const infoPlanta = locaPlanta.find(p => p.centroCusto === alerta.centroCusto);
                                            const nomeCentroCusto = infoPlanta ? infoPlanta.name : alerta.centroCusto;

                                            return (
                                                <div
                                                    key={index}
                                                  
                                                    className="bg-black/30 p-3 rounded-lg text-xs cursor-pointer hover:bg-black/50 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        {/* Coluna da Esquerda com as Informações */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-yellow-300 text-sm truncate" title={alerta.nome}>
                                                                {alerta.nome}
                                                            </p>
                                                            <p className="text-gray-400 mt-1">
                                                                Lote: <span className="font-semibold text-white">{alerta.lote}</span> | Órgão: <span className="font-semibold text-white">{alerta.orgao}</span>
                                                            </p>
                                                            <p className="text-gray-400 mt-1 truncate" title={nomeCentroCusto}>
                                                                CC: <span className="font-semibold text-white">{nomeCentroCusto}</span>
                                                            </p>
                                                        </div>

                                                        {/* Coluna da Direita com o Valor */}
                                                        <div className="flex-shrink-0 pl-2">
                                                            <p className="font-extrabold text-red-400 text-lg leading-tight">
                                                                {alerta.valor.toFixed(1)}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-center text-green-300 text-sm">
                                                Tudo sob controle. Nenhum problema crítico detectado no período.
                                            </p>
                                        </div>
                                    )}
                                   
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Gráfico --- */}
                {centrosDeCustoVisiveis.length > 0 && (
                    <div className="w-full bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 mb-8">
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => setGraficoAberto(!graficoAberto)}
                        >
                            <h3 className="text-lg font-semibold text-white">
                                Atividade por Centro de Custo (Visíveis)
                            </h3>
                            <span className="text-white text-xl">{graficoAberto ? "▲" : "▼"}</span>
                        </div>

                        {graficoAberto && (
                            <div className="w-full mt-4" style={{ height: 'auto', minHeight: 300 }}>
                                <ResponsiveContainer width="100%" height={300 + centrosDeCustoVisiveis.length * 10}>
                                    <BarChart
                                        data={centrosDeCustoVisiveis}
                                        layout="vertical"
                                        margin={{ top: 10, right: 20, left: -20, bottom: 20 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorBarra" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.9} />
                                                <stop offset="95%" stopColor="#a7f3d0" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" horizontal={false} />
                                        <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                        <YAxis type="category" dataKey="nome" stroke="#9ca3af" fontSize={11} width={120} interval={0} />
                                        <Tooltip cursor={{ fill: "rgba(37, 99, 71, 0.2)" }} content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Registros" fill="url(#colorBarra)" radius={[0, 4, 4, 0]} barSize={15} style={{ cursor: 'pointer' }} onClick={(data) => {
                                            const payload = data.payload;
                                            if (payload && payload.centroCusto) handleCentroCustoClick(payload.centroCusto);
                                        }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                        )}
                    </div>

                )}


                <input
                    type="search"
                    placeholder="Pesquisar nome ou código..."
                    value={filtroPesquisa}
                    onChange={(e) => setFiltroPesquisa(e.target.value)}
                    className="w-full md:w-1/3 p-2 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">



                    {centrosDeCustoVisiveis.map(({ centroCusto, nome, count, ultimaData, lote }) => (
                        <div

                            key={`${lote}-${centroCusto}`}
                            onClick={() => handleCentroCustoClick(centroCusto)}
                            className="flex flex-col justify-center bg-gray-900/50 border border-transparent rounded-2xl p-6 cursor-pointer text-center hover:border-orange-400/80 hover:scale-105 transition-all duration-300 group"
                        >
                            <p className="text-sm text-green-400">Centro de Custo</p>
                            <h3 className="text-lg font-bold text-white mb-2 sm:mb-3 group-hover:text-orange-300 break-words" title={nome}>
                                {nome}
                            </h3>

                            <p className="text-gray-400 text-xs mt-1">
                                Qtde. Planta: <span className="font-semibold text-white">{lote}</span> | ({centroCusto})
                            </p>

                            <div className="mt-auto pt-3 w-full">
                                <p className="text-sm sm:text-base text-gray-300">Registros: <span className="font-semibold text-white">{count}</span></p>
                                <p className="text-sm mt-1 text-gray-400">Última visita: {ultimaData.toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

}