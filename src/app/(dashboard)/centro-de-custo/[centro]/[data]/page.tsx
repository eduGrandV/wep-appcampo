

import AnaliseDaVisita from "@/components/DoencasList";
import { getPLantas } from "@/services/api";





export default async function PaginaAnaliseDaVisita({ params }: any) {
  const { centro, data: dataISO } = params;


  const todasAsPlantas = await getPLantas();


  const dadosDaVisita = todasAsPlantas.filter(p => {
    const itemDateISO = new Date(p.criadoEm).toISOString().split('T')[0];
    return p.centroCusto === centro && itemDateISO === dataISO;
  });


  return <AnaliseDaVisita dadosIniciais={dadosDaVisita} centro={centro} dataVisita={dataISO} />;
}