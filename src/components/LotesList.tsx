"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { problemas as listaProblemas, locaPlanta } from "@/data/localPlanta";
import { Planta } from "@/types/types";
import { getPLantas } from "@/services/api";

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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">

            <div className="p-6 lg:p-8 border-b border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center lg:text-left">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                            Painel de Monitoramento
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Visão geral dos centros de custo e atividades recentes
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        {/* Centros de Custo Visíveis */}
                        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-5 sm:p-6 flex items-center gap-4 hover:border-green-400/30 transition-all duration-300">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">🏢</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-sm font-medium mb-1">Centros de Custo Visíveis</p>
                                <p className="text-white text-2xl sm:text-3xl font-bold">{painelStats.totalDeCentros}</p>
                            </div>
                        </div>

                        {/* Total de Registros */}
                        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-5 sm:p-6 flex items-center gap-4 hover:border-green-400/30 transition-all duration-300">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">📋</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-sm font-medium mb-1">Total de Registros</p>
                                <p className="text-white text-2xl sm:text-3xl font-bold">{painelStats.totalDeRegistros}</p>
                            </div>
                        </div>

                        {/* Centro Mais Ativo */}
                        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-5 sm:p-6 flex items-center gap-4 hover:border-orange-400/30 transition-all duration-300 sm:col-span-2 xl:col-span-1">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">🔥</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-sm font-medium mb-1">CC com Mais Atividade</p>
                                <p className="text-white text-lg sm:text-xl font-bold truncate" title={painelStats.centroMaisAtivo.nome}>
                                    {painelStats.centroMaisAtivo.nome}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {painelStats.centroMaisAtivo.count} registros
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left Column - Filters and Alerts */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Search and Filters */}
                            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-5 sm:p-6">
                                <h2 className="text-lg font-semibold text-white mb-4">Explorar Atividades</h2>

                                {/* Search */}
                                <div className="mb-4">
                                    <input
                                        type="search"
                                        placeholder="Pesquisar nome ou código..."
                                        value={filtroPesquisa}
                                        onChange={(e) => setFiltroPesquisa(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Filtrar por Lote</label>
                                        <select
                                            value={filtroLote}
                                            onChange={(e) => setFiltroLote(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                        >
                                            <option value="">Todos os Lotes</option>
                                            {lotesUnicosParaFiltro.map((lote) => (
                                                <option key={lote} value={lote}>{lote}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Data Inicial</label>
                                            <input
                                                type="date"
                                                value={filtroDataInicio}
                                                onChange={(e) => setFiltroDataInicio(e.target.value)}
                                                className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Data Final</label>
                                            <input
                                                type="date"
                                                value={filtroDataFim}
                                                onChange={(e) => setFiltroDataFim(e.target.value)}
                                                className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Sort Buttons */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Ordenar por</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setSortBy('ultimaData')}
                                                className={`px-3 py-2 text-xs rounded-lg transition-all ${sortBy === 'ultimaData'
                                                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    }`}
                                            >
                                                Mais Recentes
                                            </button>
                                            <button
                                                onClick={() => setSortBy('count')}
                                                className={`px-3 py-2 text-xs rounded-lg transition-all ${sortBy === 'count'
                                                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    }`}
                                            >
                                                Mais Registros
                                            </button>
                                            <button
                                                onClick={() => setSortBy('centroCusto')}
                                                className={`px-3 py-2 text-xs rounded-lg transition-all ${sortBy === 'centroCusto'
                                                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    }`}
                                            >
                                                Ordem A-Z
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Critical Alerts */}
                            <div className="bg-red-900/20 backdrop-blur-lg border border-red-500/50 rounded-2xl p-5 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                                        <span className="text-xl">⚠️</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Alertas Críticos</h3>
                                        <p className="text-xs text-red-300">Problemas acima de 5% no período</p>
                                    </div>
                                </div>

                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                    {analiseAlertasCriticos.length > 0 ? (
                                        analiseAlertasCriticos.map((alerta, index) => {
                                            const infoPlanta = locaPlanta.find(p => p.centroCusto === alerta.centroCusto);
                                            const nomeCentroCusto = infoPlanta ? infoPlanta.name : alerta.centroCusto;

                                            return (
                                                <div
                                                    key={index}
                                                    className="bg-black/30 p-3 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all duration-200 cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-yellow-300 text-sm mb-1 truncate">
                                                                {alerta.nome}
                                                            </p>
                                                            <div className="text-xs text-gray-400 space-y-1">
                                                                <p>Lote: <span className="font-semibold text-white">{alerta.lote}</span></p>
                                                                <p>Órgão: <span className="font-semibold text-white">{alerta.orgao}</span></p>
                                                                <p className="truncate">CC: <span className="font-semibold text-white">{nomeCentroCusto}</span></p>
                                                            </div>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <span className="inline-flex items-center px-2 py-1 bg-red-500/20 text-red-300 text-sm font-bold rounded-lg">
                                                                {alerta.valor.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-green-300 text-sm">
                                                ✅ Tudo sob controle
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Nenhum problema crítico detectado
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        <div className="xl:col-span-2 space-y-6">
                            {/* Chart */}
                            {centrosDeCustoVisiveis.length > 0 && (
                                <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-5 sm:p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-white">
                                            Atividade por Centro de Custo
                                        </h3>
                                        <button
                                            onClick={() => setGraficoAberto(!graficoAberto)}
                                            className="text-gray-400 hover:text-white transition-colors"
                                        >
                                            {graficoAberto ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {graficoAberto && (
                                        <div className="w-full" style={{ height: '300px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={centrosDeCustoVisiveis}
                                                    layout="vertical"
                                                    margin={{ top: 10, right: 30, left: -10, bottom: 10 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="colorBarra" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.9} />
                                                            <stop offset="95%" stopColor="#a7f3d0" stopOpacity={0.8} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" horizontal={false} />
                                                    <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                                    <YAxis
                                                        type="category"
                                                        dataKey="nome"
                                                        stroke="#9ca3af"
                                                        fontSize={11}
                                                        width={100}
                                                        interval={0}
                                                        tick={{ fill: '#d1d5db' }}
                                                    />
                                                    <Tooltip
                                                        cursor={{ fill: "rgba(37, 99, 71, 0.2)" }}
                                                        content={<CustomTooltip />}
                                                    />
                                                    <Bar
                                                        dataKey="count"
                                                        name="Registros"
                                                        fill="url(#colorBarra)"
                                                        radius={[0, 4, 4, 0]}
                                                        barSize={20}
                                                        onClick={(data) => {
                                                            const payload = data.payload;
                                                            if (payload && payload.centroCusto) handleCentroCustoClick(payload.centroCusto);
                                                        }}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Centers Grid */}
                            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-5 sm:p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Centros de Custo ({centrosDeCustoVisiveis.length})
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {centrosDeCustoVisiveis.map(({ centroCusto, nome, count, ultimaData, lote }) => (
                                        <div
                                            key={`${lote}-${centroCusto}`}
                                            onClick={() => handleCentroCustoClick(centroCusto)}
                                            className="group bg-gray-800/30 border border-gray-600/30 rounded-xl p-4 cursor-pointer hover:border-orange-400/60 hover:bg-gray-800/50 hover:scale-105 transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-green-400 text-xs font-semibold mb-1">Centro de Custo</p>
                                                    <h3 className="text-white font-bold text-sm leading-tight truncate group-hover:text-orange-300" title={nome}>
                                                        {nome}
                                                    </h3>
                                                </div>
                                                <div className="flex-shrink-0 ml-2">
                                                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                                        <svg className="w-4 h-4 text-green-400 group-hover:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400">Planta:</span>
                                                    <span className="text-white font-semibold">{lote}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400">Registros:</span>
                                                    <span className="text-white font-semibold">{count}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400">Última visita:</span>
                                                    <span className="text-white font-semibold text-xs">{ultimaData.toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-gray-600/30">
                                                <p className="text-gray-400 text-xs truncate" title={centroCusto}>
                                                    Código: {centroCusto}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}