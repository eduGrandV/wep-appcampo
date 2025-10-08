import PaginaDatasDoCentroDeCusto from "@/components/centroCustoDate";
import { locaPlanta } from "@/data/localPlanta";

export async function generateStaticParams() {
  return locaPlanta.map(planta => ({
    centro: planta.centroCusto,
  }));
}

export default async function Page({ params }: any) {
  const { centro } = params;
  return <PaginaDatasDoCentroDeCusto centro={centro} />;
}
