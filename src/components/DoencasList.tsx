

"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import { locaPlanta, problemas as listaProblemas, protocolosDeAcao, TipoProblema } from "@/data/localPlanta";
import dynamic from "next/dynamic";

import { StatusAcao } from "@/components/Statusacao";

import { Planta } from "@/types/types";
import { BarraProgresso, DisplayContagem } from "./bar";

const MapaDoencas = dynamic(() => import("@/components/MapaDoencas"), { ssr: false });


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

interface LocalParaMapa {
    latitude: number;
    longitude: number;
    quadrante: string;
    ramo: string;
    nota: number;
    doenca: string;
    centroCusto: string;
    orgao: string;
    planta: number;
    nome: string
}

interface DoencaDetalhada {
    doencaOuPraga: string;
    orgao: string | null;
    registros: number;
    locais: LocalParaMapa[];
    planta: number[];
    resultado: Resultado;
    quadrantes: string[];
    ramos: string[];
}


interface AnaliseProps {
    dadosIniciais: Planta[];
    centro: string;
    dataVisita: string;
}

export default function AnaliseDaVisita({ dadosIniciais, centro, dataVisita }: AnaliseProps) {
    const router = useRouter();
    const [selectedDoenca, setSelectedDoenca] = useState<DoencaDetalhada | null>(null);
    const [numeroLote, setNumeroLote] = useState<string | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Inicializa lote
    useEffect(() => {
        if (dadosIniciais.length > 0) {
            setNumeroLote(dadosIniciais[0].lote);
        }
    }, [dadosIniciais]);

    const nomeCentroCusto = useMemo(() => {
        const info = locaPlanta.find(p => p.centroCusto === centro);
        return info ? info.name : `Centro de Custo ${centro}`;
    }, [centro]);

    const doencasResumo = useMemo(() => {
        const mapa = new Map<string, any>();
        dadosIniciais.forEach((item) => {
            const key = `${item.doencaOuPraga}-${item.orgao}`;
            if (!mapa.has(key)) {
                mapa.set(key, { doencaOuPraga: item.doencaOuPraga, orgao: item.orgao, registros: 0, locais: [], planta: [] });
            }
            const atual = mapa.get(key)!;
            if (item.planta && !atual.planta.includes(item.planta)) atual.planta.push(item.planta);
            atual.registros++;
            if (item.local?.latitude) {
                atual.locais.push({
                    latitude: parseFloat(item.local.latitude), longitude: parseFloat(item.local.longitude),
                    quadrante: item.quadrante || 'N/A', ramo: item.ramo || '',
                    nota: item.nota ?? 0, doenca: item.doencaOuPraga,
                    centroCusto: item.centroCusto, orgao: item.orgao || 'N/I', planta: item.planta
                });
            }
        });

        mapa.forEach((grupo) => {
            const { doencaOuPraga, orgao } = grupo;
            const avaliacoesDoGrupo = dadosIniciais.filter(p => p.doencaOuPraga === doencaOuPraga && p.orgao === orgao);
            const infoProblema = listaProblemas.find(p => p.nome.toUpperCase() === doencaOuPraga.toUpperCase());


            grupo.quadrantes = Array.from(new Set(avaliacoesDoGrupo.map(a => a.quadrante).filter(Boolean)));
            grupo.ramos = Array.from(new Set(avaliacoesDoGrupo.map(a => a.ramo).filter(Boolean)));

            const resultadoCalculado: Partial<Resultado> = {
                nome: doencaOuPraga, tipo: infoProblema?.tipo || 'doenca', orgao,
                percentual: 0, percentualBordadura: 0, percentualAreaInterna: 0, mediaGeral: 0, contagemPresenca: 0
            };

            if (infoProblema) {
                const plantasAmostradas = new Set(avaliacoesDoGrupo.map(a => a.planta)).size;
                if (infoProblema.tipo === 'doenca' && plantasAmostradas > 0) {
                    const soma = avaliacoesDoGrupo.reduce((s, d) => s + (d.nota ?? 0), 0);
                    const multiplicador = (orgao && orgao.toUpperCase() === "FOLHA") ? 8 : 4;
                    const maximo = multiplicador * plantasAmostradas;
                    resultadoCalculado.percentual = maximo > 0 ? (soma * 10) / maximo : 0;
                } else if (infoProblema.tipo === 'praga' && plantasAmostradas > 0) {
                    const loteNum = dadosIniciais.length > 0 ? Number(dadosIniciais[0].lote) : 0;
                    const totalBordadura = avaliacoesDoGrupo.filter(r => r.numeroLocal === "Bordadura").reduce((acc, n) => acc + (n.nota ?? 0), 0);
                    const totalAreaInterna = avaliacoesDoGrupo.filter(r => r.numeroLocal !== "Bordadura").reduce((acc, n) => acc + (n.nota ?? 0), 0);
                    let maxBordadura = 4, maxAreaInterna = 6;
                    if (loteNum === 14) { maxBordadura = 5; maxAreaInterna = 9; }
                    else if (loteNum === 18) { maxBordadura = 6; maxAreaInterna = 12; }
                    const multiplicador = (orgao && orgao.toUpperCase().includes('FOLHA')) ? 8 : 4;
                    const divisorBordadura = maxBordadura * multiplicador;
                    const divisorAreaInterna = maxAreaInterna * multiplicador;
                    resultadoCalculado.percentualBordadura = divisorBordadura > 0 ? (totalBordadura * 100) / divisorBordadura : 0;
                    resultadoCalculado.percentualAreaInterna = divisorAreaInterna > 0 ? (totalAreaInterna * 100) / divisorAreaInterna : 0;
                    resultadoCalculado.mediaGeral = (resultadoCalculado.percentualBordadura + resultadoCalculado.percentualAreaInterna) / 2;
                } else if (infoProblema.tipo === 'inimigo natural') {
                    resultadoCalculado.contagemPresenca = avaliacoesDoGrupo.filter(r => r.nota > 0).length;
                }
            }
            grupo.resultado = resultadoCalculado as Resultado;
        });

        const resumo: DoencaDetalhada[] = Array.from(mapa.values());
        if (resumo.length > 0 && !selectedDoenca) {
            setSelectedDoenca(resumo[0]);
        }
        return resumo;
    }, [dadosIniciais, selectedDoenca]);

    useEffect(() => {
        if (doencasResumo.length > 0 && !selectedDoenca) {
            setSelectedDoenca(doencasResumo[0]);
        }
    }, [doencasResumo, selectedDoenca]);

    const locaisParaMapa = useMemo(() => {
        if (selectedDoenca) return selectedDoenca.locais;
        return doencasResumo.flatMap(d => d.locais);
    }, [selectedDoenca, doencasResumo]);

    const dataFormatada = new Date(dataVisita + "T12:00:00Z").toLocaleDateString('pt-BR', { timeZone: 'UTC' });





return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
        {/* Mobile & Tablet: Stack vertical */}
        <div className="block lg:hidden">
            {/* Header Mobile */}
            <div className="p-4 sm:p-6 border-b border-white/10">
                <button 
                    onClick={() => router.back()} 
                    className="text-gray-300 hover:text-white mb-4 bg-white/10 px-4 py-2 rounded-xl w-fit text-sm transition-all hover:bg-white/20 flex items-center gap-2"
                >
                    <span>←</span> Voltar
                </button>
                
                <div className="p-4 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-sm">
                    <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-2">
                        {nomeCentroCusto}
                    </h1>
                    <div className="space-y-1 text-sm text-gray-300">
                        {numeroLote && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">📋 Lote:</span>
                                <span className="font-semibold text-white">{numeroLote}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">📅 Visita de:</span>
                            <span className="font-semibold text-white">{dataFormatada}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Map Section - Visível por padrão */}
            <section className="p-4 sm:p-6 border-b border-white/10">
                <div className="mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-100">
                        Visualização: 
                        <span className="text-orange-400 ml-2">
                            {selectedDoenca?.doencaOuPraga || 'Geral'}
                        </span>
                    </h2>
                </div>
                
                <div className="h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-black/20">
                    <MapaDoencas locais={locaisParaMapa} />
                </div>
            </section>

            {/* Mobile Diseases List */}
            <div className="p-4 sm:p-6 overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-100 mb-4">Doenças e Pragas Detectadas</h3>
                <div className="space-y-4">
                    {doencasResumo.map((doencaItem) => {
                        const isSelected = selectedDoenca?.doencaOuPraga === doencaItem.doencaOuPraga && selectedDoenca?.orgao === doencaItem.orgao;
                        const protocolo = protocolosDeAcao[doencaItem.doencaOuPraga.toUpperCase()];

                        return (
                            <div
                                key={`${doencaItem.doencaOuPraga}-${doencaItem.orgao}`}
                                className={`bg-black/30 rounded-2xl border-2 transition-all duration-300 overflow-hidden backdrop-blur-sm
                                    ${isSelected 
                                        ? 'border-orange-400 bg-orange-900/30 shadow-lg shadow-orange-500/20' 
                                        : 'border-white/10 hover:border-white/20 hover:bg-black/40'
                                    }`}
                            >
                                <button
                                    onClick={() => setSelectedDoenca(isSelected ? null : doencaItem)}
                                    className="w-full text-left p-4 flex justify-between items-center font-bold text-white hover:bg-white/5 transition-all duration-200"
                                >
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-orange-400 text-base font-semibold">
                                            {doencaItem.doencaOuPraga}
                                        </span>
                                        <span className="text-xs text-gray-400 font-normal">
                                            Órgão: {doencaItem.orgao}
                                        </span>
                                    </div>
                                    <span className={`text-gray-400 transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>

                                {isSelected && (
                                    <div className="px-4 pb-4 space-y-4 border-t border-white/10 animate-fade-in">
                                        {/* Stats Overview Mobile */}
                                        <div className="grid grid-cols-2 gap-3 text-gray-300 text-sm mt-3">
                                            <div className="flex items-center gap-2 bg-black/20 rounded-lg p-2">
                                                <span>🌿</span>
                                                <div>
                                                    <div className="font-semibold text-white text-xs">{doencaItem.planta.length}</div>
                                                    <div className="text-xs text-gray-400">{doencaItem.planta.length > 1 ? 'Plantas' : 'Planta'}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 bg-black/20 rounded-lg p-2">
                                                <span>📍</span>
                                                <div>
                                                    <div className="font-semibold text-white text-xs">{doencaItem.locais.length}</div>
                                                    <div className="text-xs text-gray-400">{doencaItem.locais.length > 1 ? 'Locais' : 'Local'}</div>
                                                </div>
                                            </div>

                                            {doencaItem.quadrantes.length > 0 && (
                                                <div className="flex items-center gap-2 bg-black/20 rounded-lg p-2 col-span-2">
                                                    <span>🌐</span>
                                                    <div>
                                                        <div className="font-semibold text-white text-xs">Quadrantes</div>
                                                        <div className="text-xs text-gray-400">{doencaItem.quadrantes.join(', ')}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {doencaItem.ramos.length > 0 && (
                                                <div className="flex items-center gap-2 bg-black/20 rounded-lg p-2 col-span-2">
                                                    <span>🌱</span>
                                                    <div>
                                                        <div className="font-semibold text-white text-xs">Ramos</div>
                                                        <div className="text-xs text-gray-400">{doencaItem.ramos.join(', ')}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Individual Records Mobile */}
                                        {doencaItem.locais.length > 0 && (
                                            <div className="border-2 border-white/10 rounded-xl p-3 bg-black/20">
                                                <h4 className="font-semibold text-gray-300 text-sm mb-2 flex items-center gap-2">
                                                    <span>📋</span>
                                                    Registros
                                                </h4>

                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                    <div className="flex text-gray-400 font-semibold text-xs px-1 pb-1 border-b border-white/10">
                                                        <div className="w-2/5">Planta</div>
                                                        <div className="w-2/5 text-center">Local</div>
                                                        <div className="w-1/5 text-right">Nota</div>
                                                    </div>

                                                    {doencaItem.locais.map((local, index) => (
                                                        <div key={index} className="flex items-center bg-black/30 rounded-lg p-2 text-gray-300 text-xs hover:bg-black/40 transition-colors">
                                                            <div className="w-2/5 font-semibold text-white">
                                                                #{local.planta}
                                                            </div>
                                                            <div className="w-2/5 text-center text-[10px]">
                                                                {local.quadrante !== 'N/A' && `Q:${local.quadrante}`}
                                                                {local.ramo && ` R:${local.ramo}`}
                                                            </div>
                                                            <div className="w-1/5 text-right">
                                                                <span className="font-bold text-base text-white bg-orange-500/30 px-2 py-1 rounded">
                                                                    {local.nota}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Progress Bars Mobile */}
                                        <div className="space-y-3">
                                            {doencaItem.resultado.tipo === 'doenca' && 
                                                <BarraProgresso percentual={doencaItem.resultado.percentual!} titulo="Severidade" />
                                            }
                                            {doencaItem.resultado.tipo === 'praga' && (
                                                <div className="space-y-2">
                                                    <BarraProgresso percentual={doencaItem.resultado.percentualBordadura!} titulo="Infest. (Bordadura)" />
                                                    <BarraProgresso percentual={doencaItem.resultado.percentualAreaInterna!} titulo="Infest. (Área Interna)" />
                                                    <p className="text-right text-xs text-gray-300 font-semibold bg-black/20 rounded-lg p-2">
                                                        Média: {doencaItem.resultado.mediaGeral?.toFixed(2)}%
                                                    </p>
                                                </div>
                                            )}
                                            {doencaItem.resultado.tipo === 'inimigo natural' && 
                                                <DisplayContagem contagem={doencaItem.resultado.contagemPresenca!} titulo="Contagem de Presença" />
                                            }
                                        </div>

                                        {/* Action Protocol Mobile */}
                                        {protocolo && (
                                            <div className="p-3 border-2 border-white/10 rounded-xl bg-black/20">
                                                <StatusAcao resultado={doencaItem.resultado} regras={protocolo.nivelDeAcao} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Desktop: Layout horizontal */}
        <div className="hidden lg:flex lg:h-screen">
            {/* Sidebar Desktop */}
            <aside className="lg:w-2/5 xl:w-1/3 p-6 sm:p-8 flex flex-col h-full overflow-y-auto gap-6">
                
                {/* Header Section */}
                <div className="flex-shrink-0 space-y-4">
                    <button 
                        onClick={() => router.back()} 
                        className="text-gray-300 hover:text-white mb-2 bg-white/10 px-4 py-2 rounded-xl w-fit text-sm transition-all hover:bg-white/20 self-start flex items-center gap-2"
                    >
                        <span>←</span> Voltar
                    </button>
                    
                    <div className="p-6 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-sm">
                        <h1 className="text-2xl font-bold text-white leading-tight mb-3">
                            {nomeCentroCusto}
                        </h1>
                        <div className="space-y-2 text-sm text-gray-300">
                            {numeroLote && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📋 Lote:</span>
                                    <span className="font-semibold text-white">{numeroLote}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">📅 Visita de:</span>
                                <span className="font-semibold text-white">{dataFormatada}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diseases List Desktop */}
                <div className="flex-grow overflow-y-auto space-y-5 pr-3 -mr-3 border-t border-white/10 mt-6 pt-6">
                    {doencasResumo.map((doencaItem) => {
                        const isSelected = selectedDoenca?.doencaOuPraga === doencaItem.doencaOuPraga && selectedDoenca?.orgao === doencaItem.orgao;
                        const protocolo = protocolosDeAcao[doencaItem.doencaOuPraga.toUpperCase()];

                        return (
                            <div
                                key={`${doencaItem.doencaOuPraga}-${doencaItem.orgao}`}
                                className={`bg-black/30 rounded-2xl border-2 transition-all duration-300 overflow-hidden backdrop-blur-sm
                                    ${isSelected 
                                        ? 'border-orange-400 bg-orange-900/30 shadow-lg shadow-orange-500/20' 
                                        : 'border-white/10 hover:border-white/20 hover:bg-black/40'
                                    }`}
                            >
                                {/* Header Button */}
                                <button
                                    onClick={() => setSelectedDoenca(isSelected ? null : doencaItem)}
                                    className="w-full text-left p-5 flex justify-between items-center font-bold text-white hover:bg-white/5 transition-all duration-200"
                                >
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-orange-400 text-lg font-semibold">
                                            {doencaItem.doencaOuPraga}
                                        </span>
                                        <span className="text-xs text-gray-400 font-normal">
                                            Órgão: {doencaItem.orgao}
                                        </span>
                                    </div>
                                    <span className={`text-gray-400 text-lg transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>

                                {/* Expanded Content */}
                                {isSelected && (
                                    <div className="px-5 pb-5 space-y-5 border-t border-white/10 animate-fade-in">
                                        {/* Stats Overview */}
                                        <div className="grid grid-cols-2 gap-4 text-gray-300 text-sm mt-4">
                                            <div className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
                                                <span className="text-lg">🌿</span>
                                                <div>
                                                    <div className="font-semibold text-white">{doencaItem.planta.length}</div>
                                                    <div className="text-xs text-gray-400">{doencaItem.planta.length > 1 ? 'Plantas' : 'Planta'}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
                                                <span className="text-lg">📍</span>
                                                <div>
                                                    <div className="font-semibold text-white">{doencaItem.locais.length}</div>
                                                    <div className="text-xs text-gray-400">{doencaItem.locais.length > 1 ? 'Locais' : 'Local'}</div>
                                                </div>
                                            </div>

                                            {doencaItem.quadrantes.length > 0 && (
                                                <div className="flex items-center gap-3 bg-black/20 rounded-lg p-3 col-span-2">
                                                    <span className="text-lg">🌐</span>
                                                    <div>
                                                        <div className="font-semibold text-white">Quadrantes</div>
                                                        <div className="text-xs text-gray-400">{doencaItem.quadrantes.join(', ')}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {doencaItem.ramos.length > 0 && (
                                                <div className="flex items-center gap-3 bg-black/20 rounded-lg p-3 col-span-2">
                                                    <span className="text-lg">🌱</span>
                                                    <div>
                                                        <div className="font-semibold text-white">Ramos</div>
                                                        <div className="text-xs text-gray-400">{doencaItem.ramos.join(', ')}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Individual Records */}
                                        {doencaItem.locais.length > 0 && (
                                            <div className="border-2 border-white/10 rounded-xl p-4 bg-black/20">
                                                <h4 className="font-semibold text-gray-300 text-sm mb-3 flex items-center gap-2">
                                                    <span>📋</span>
                                                    Registros Individuais
                                                </h4>

                                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                                    {/* Table Header */}
                                                    <div className="flex text-gray-400 font-semibold text-xs px-2 pb-2 border-b border-white/10">
                                                        <div className="w-2/5">Planta</div>
                                                        <div className="w-2/5 text-center">Localização</div>
                                                        <div className="w-1/5 text-right">Nota</div>
                                                    </div>

                                                    {/* Table Rows */}
                                                    {doencaItem.locais.map((local, index) => (
                                                        <div key={index} className="flex items-center bg-black/30 rounded-lg p-3 text-gray-300 text-sm hover:bg-black/40 transition-colors">
                                                            <div className="w-2/5 font-semibold text-white">
                                                                Planta {local.planta}
                                                            </div>
                                                            <div className="w-2/5 text-center text-xs">
                                                                {local.quadrante !== 'N/A' && `Q: ${local.quadrante}`}
                                                                {local.ramo && ` / R: ${local.ramo}`}
                                                            </div>
                                                            <div className="w-1/5 text-right">
                                                                <span className="font-bold text-lg text-white bg-orange-500/30 px-3 py-1 rounded-lg">
                                                                    {local.nota}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Progress Bars */}
                                        <div className="space-y-4">
                                            {doencaItem.resultado.tipo === 'doenca' && 
                                                <BarraProgresso percentual={doencaItem.resultado.percentual!} titulo="Severidade" />
                                            }
                                            {doencaItem.resultado.tipo === 'praga' && (
                                                <div className="space-y-3">
                                                    <BarraProgresso percentual={doencaItem.resultado.percentualBordadura!} titulo="Infest. (Bordadura)" />
                                                    <BarraProgresso percentual={doencaItem.resultado.percentualAreaInterna!} titulo="Infest. (Área Interna)" />
                                                    <p className="text-right text-sm text-gray-300 font-semibold bg-black/20 rounded-lg p-3">
                                                        Média Geral: {doencaItem.resultado.mediaGeral?.toFixed(2)}%
                                                    </p>
                                                </div>
                                            )}
                                            {doencaItem.resultado.tipo === 'inimigo natural' && 
                                                <DisplayContagem contagem={doencaItem.resultado.contagemPresenca!} titulo="Contagem de Presença" />
                                            }
                                        </div>

                                        {/* Action Protocol */}
                                        {protocolo && (
                                            <div className="p-4 border-2 border-white/10 rounded-xl bg-black/20">
                                                <StatusAcao resultado={doencaItem.resultado} regras={protocolo.nivelDeAcao} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* Map Section Desktop */}
            <section ref={mapContainerRef} className="lg:w-3/5 xl:w-2/3 p-6 sm:p-8 flex flex-col">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-100 text-left lg:text-right">
                        Visualização: 
                        <span className="text-orange-400 ml-2">
                            {selectedDoenca?.doencaOuPraga || 'Geral'}
                        </span>
                    </h2>
                </div>
                
                <div className="flex-grow rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-black/20">
                    <MapaDoencas locais={locaisParaMapa} />
                </div>
            </section>
        </div>
    </main>
);

}
