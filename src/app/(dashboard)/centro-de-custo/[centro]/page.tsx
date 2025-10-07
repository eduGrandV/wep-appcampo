import PaginaDatasDoCentroDeCusto from "@/components/centroCustoDate";
import { locaPlanta } from "@/data/localPlanta";



export default async function Page({ params }: any) {
  const { centro } = params;
  return <PaginaDatasDoCentroDeCusto centro={centro} />;
}
