

import AnaliseDaVisita from "@/components/DoencasList";
import { getPLantas } from "@/services/api";


export async function generateStaticParams() {
  const todasAsPlantas = await getPLantas();

  const paramsList = Array.from(
    new Set(todasAsPlantas.map(p =>
      JSON.stringify({
        centro: p.centroCusto,
        data: new Date(p.criadoEm).toISOString().split('T')[0]
      })
    ))
  ).map(s => JSON.parse(s));

  return paramsList;
}


export default async function PaginaAnaliseDaVisita({ params }: any) {
  const { centro, data: dataISO } = params;


  const todasAsPlantas = await getPLantas();


  const dadosDaVisita = todasAsPlantas.filter(p => {
    const itemDateISO = new Date(p.criadoEm).toISOString().split('T')[0];
    return p.centroCusto === centro && itemDateISO === dataISO;
  });


  return <AnaliseDaVisita dadosIniciais={dadosDaVisita} centro={centro} dataVisita={dataISO} />;
}