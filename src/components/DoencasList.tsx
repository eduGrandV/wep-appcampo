// new

"use client";
import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Planta } from "@/types/types";
import { locaPlanta } from "@/data/localPlanta";
import dynamic from "next/dynamic";

const MapaDoencas = dynamic(() => import("@/components/MapaDoencas"), { ssr: false });

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
}
interface DoencaDetalhada {
    doencaOuPraga: string;
    orgaos: string[];
    registros: number;
    locais: LocalParaMapa[];
    quadrantes: string[],
    ramos: string[],
    planta: number[]
}
interface AnaliseProps {
    dadosIniciais: Planta[];
    centro: string;
    dataVisita: string;
}

export default function AnaliseDaVisita({ dadosIniciais, centro, dataVisita }: AnaliseProps) {
    const router = useRouter();
    const [selectedDoenca, setSelectedDoenca] = useState<DoencaDetalhada | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const nomeCentroCusto = useMemo(() => {
        const info = locaPlanta.find(p => p.centroCusto === centro);
        return info ? info.name : `Centro de Custo ${centro}`;
    }, [centro]);

    const doencasResumo = useMemo(() => {
        const mapa = new Map<string, DoencaDetalhada>();
        dadosIniciais.forEach((item) => {
            const key = item.doencaOuPraga;
            if (!mapa.has(key)) {
                mapa.set(key, { doencaOuPraga: key, orgaos: [], registros: 0, locais: [], quadrantes: [], ramos: [], planta: [] });
            }
            const atual = mapa.get(key)!;
            if (item.orgao && !atual.orgaos.includes(item.orgao)) {
                atual.orgaos.push(item.orgao);
            }

            if (item.planta && !atual.planta.includes(item.planta)) {
                atual.planta.push(item.planta)
            }

            if (item.quadrante && !atual.quadrantes.includes(item.quadrante)) {
                atual.quadrantes.push(item.quadrante)
            }

            if (item.ramo && !atual.ramos.includes(item.ramo)) {
                atual.ramos.push(item.ramo)
            }


            atual.registros++;
            if (item.local?.latitude && item.local?.longitude) {
                atual.locais.push({
                    latitude: parseFloat(item.local.latitude),
                    longitude: parseFloat(item.local.longitude),
                    quadrante: item.quadrante || 'N/A',
                    ramo: item.ramo || '',
                    nota: item.nota,
                    doenca: item.doencaOuPraga,
                    centroCusto: item.centroCusto,
                    orgao: item.orgao || 'N/I',
                    planta: item.planta
                });
            }

        });
        const resumo = Array.from(mapa.values());

        if (resumo.length > 0 && !selectedDoenca) {
            setSelectedDoenca(resumo[0]);
        }
        return resumo;
    }, [dadosIniciais, selectedDoenca]);

    const locaisParaMapa = useMemo(() => {
        if (selectedDoenca) return selectedDoenca.locais;

        return doencasResumo.flatMap(d => d.locais);
    }, [selectedDoenca, doencasResumo]);


    const dataFormatada = new Date(dataVisita + "T12:00:00Z").toLocaleDateString('pt-BR', { timeZone: 'UTC' });


    const handleDoencaClick = (doenca: DoencaDetalhada) => {
        const nomeCodificado = encodeURIComponent(doenca.doencaOuPraga);

          router.push(`/centro-de-custo/${centro}/${dataVisita}/${nomeCodificado}`);
    };


    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 lg:flex">

            <div className="lg:w-1/3 xl:w-1/4 p-4 sm:p-6 flex flex-col lg:h-screen">
                <button onClick={() => router.back()} className="text-gray-300 hover:text-white mb-6 bg-white/5 px-4 py-2 rounded-lg w-fit">
                    &larr; Voltar
                </button>
                <h1 className="text-2xl font-bold text-white">{nomeCentroCusto}</h1>
                <p className="text-gray-400 mb-4">Análise da visita de <span className="font-semibold text-white">{dataFormatada}</span></p>

                <div className="flex-grow overflow-y-auto space-y-3 pr-2 border-t border-white/10 pt-4">

                   {doencasResumo.map((doencaItem) => {
    const isSelected = selectedDoenca?.doencaOuPraga === doencaItem.doencaOuPraga;
    return (
        <div
            key={doencaItem.doencaOuPraga}
      
            onMouseEnter={() => setSelectedDoenca(doencaItem)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${isSelected ? 'bg-orange-900/40 border-orange-400' : 'bg-black/20 border-white/10'}`}
        >
           
            <h2 className="font-bold text-lg text-orange-400">{doencaItem.doencaOuPraga}</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400 mt-2">
                <div className="flex items-center gap-2"><span>📝</span><span>{doencaItem.registros} Registros</span></div>
                <div className="flex items-center gap-2"><span>🌿</span><span>{doencaItem.planta.length} Plantas</span></div>
                <div className="flex items-center gap-2"><span>🔬</span><span>{doencaItem.orgaos.length} Órgãos</span></div>
                <div className="flex items-center gap-2"><span>🌐</span><span>{doencaItem.quadrantes.length} Quadrantes</span></div>
            </div>

      
           {doencaItem.locais.length > 0 && (
    <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-green-400 hover:text-green-300 list-inside font-semibold">
            Ver detalhes dos registros
        </summary>
        <div className="mt-2 space-y-2 pl-2 border-l-2 border-green-500/30 max-h-40 overflow-y-auto pr-2">
            {doencaItem.locais.map((local, index) => (
                <div key={index} className="p-2 bg-black/20 rounded-md">
                    <p className="text-gray-300 font-semibold">
                        Planta {local.planta} - <span className="font-bold text-white">Nota: {local.nota}</span>
                    </p>
                    <p className="text-gray-400 text-[11px]">
                        <span className="capitalize">{local.orgao}</span>
                       
                        {local.quadrante !== 'N/A' && ` • Q: ${local.quadrante}`}
                        {local.ramo && ` • Ramo: ${local.ramo}`}
                    </p>
                </div>
            ))}
        </div>
    </details>
)}

            {/* BOTÃO DE AÇÃO SEPARADO */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Impede que o 'onMouseEnter' do card seja acionado
                        handleDoencaClick(doencaItem);
                    }}
                    className="w-full bg-orange-600/20 text-orange-300 hover:bg-orange-500/40 hover:text-white font-bold text-xs py-2 rounded-lg transition-colors"
                >
                    Analisar Problema &rarr;
                </button>
            </div>
        </div>
    );
})}
                </div>
            </div>


            <div ref={mapContainerRef} className="lg:w-2/uduthird xl:w-3/4 p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4 text-left lg:text-right">
                    Visualização: <span className="text-orange-400">{selectedDoenca?.doencaOuPraga || 'Geral'}</span>
                </h2>
                <div className="h-[60vh] lg:h-[calc(100vh-8rem)] w-full rounded-2xl overflow-hidden shadow-lg border border-white/10">
                    {locaisParaMapa.length > 0 ? (
                        <MapaDoencas locais={locaisParaMapa} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <p className="text-gray-400">Nenhum ponto com geolocalização para exibir.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}