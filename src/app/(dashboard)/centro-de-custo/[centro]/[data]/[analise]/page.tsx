import AnaliseProblema from "@/components/AnaliseDaVisita";
import { getPLantas } from "@/services/api";
import { problemas as listaProblemas } from "@/data/localPlanta";

type Params = {
  centro: string;
  data: string;
  analise: string;
};

type PageProps = {
  params: Params;
};

export default async function PaginaDeAnaliseEspecifica({ params }: any) {
  const { centro, data: dataISO, analise: nomeDoencaCodificado } = params;
  const nomeDoenca = decodeURIComponent(nomeDoencaCodificado);

  const todasAsPlantas = await getPLantas();

  const dadosDaAnalise = todasAsPlantas.filter(p => {
    const itemDateISO = new Date(p.criadoEm).toISOString().split('T')[0];
    return p.centroCusto === centro &&
           itemDateISO === dataISO &&
           p.doencaOuPraga === nomeDoenca;
  });

  const lote = dadosDaAnalise.length > 0 ? dadosDaAnalise[0].lote : "";
  const avaliacoesParaAnalise = dadosDaAnalise.map(a => ({
    doencaOuPraga: a.doencaOuPraga,
    orgao: a.orgao,
    nota: a.nota,
    lote: Number(a.lote),
    local: a.numeroLocal || undefined,
    ramo: a.ramo,
  }));

  return (
    <AnaliseProblema
      avaliacoes={avaliacoesParaAnalise}
      listaProblemas={listaProblemas}
      lote={lote}
      centro={centro}
    />
  );
}

export async function generateStaticParams() {
  const todasAsPlantas = await getPLantas();

  const paramsList = Array.from(
    new Set(todasAsPlantas.map(p =>
      JSON.stringify({
        centro: p.centroCusto,
        data: new Date(p.criadoEm).toISOString().split('T')[0],
        analise: encodeURIComponent(p.doencaOuPraga)
      })
    ))
  ).map(s => JSON.parse(s));

  return paramsList;
}
