
"use client";
import { useMemo } from "react";
import { RegraAcao, TipoProblema } from "@/data/localPlanta"; 

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

interface StatusAcaoProps {
    resultado: Resultado;
    regras: RegraAcao[];
}

export function StatusAcao({ resultado, regras }: StatusAcaoProps) {
    const analise = useMemo(() => {
        let acaoNecessaria = false;
        
        if (!regras) {
            return { acaoNecessaria: false, regrasComStatus: [] };
        }

        const regrasComStatus = regras.map(regra => {
            if (!regra.limite) {
                return { ...regra, acionada: false };
            }

            let valorAtual = 0;
            switch (regra.limite.tipo) {
                case 'doenca': valorAtual = resultado.percentual || 0; break;
                case 'praga-bordadura': valorAtual = resultado.percentualBordadura || 0; break;
                case 'praga-interna': valorAtual = resultado.percentualAreaInterna || 0; break;
                case 'praga-media': valorAtual = resultado.mediaGeral || 0; break;
            }

            const acionada = valorAtual >= regra.limite.valor;
            if (acionada) {
                acaoNecessaria = true;
            }

            return { ...regra, acionada };
        });

        return { acaoNecessaria, regrasComStatus };
    }, [resultado, regras]);

    const corStatus = analise.acaoNecessaria ? "text-red-400" : "text-green-400";
    const textoStatus = analise.acaoNecessaria ? "Ação Recomendada 🚨" : "Nível Seguro ✅";

    return (
        <div className="mt-4">
            <h3 className="font-semibold text-white mb-2">Nível de Ação</h3>
            <div className={`mb-3 p-2 rounded-md font-bold text-center ${analise.acaoNecessaria ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
                <span className={corStatus}>{textoStatus}</span>
            </div>
            <ul className="space-y-1 text-xs text-gray-400">
                {analise.regrasComStatus.map((regra, index) => (
                    <li key={index} className={`transition-colors ${regra.acionada ? 'font-bold text-yellow-300' : ''}`}>
                        • {regra.condicao}
                    </li>
                ))}
            </ul>
        </div>
    );
};