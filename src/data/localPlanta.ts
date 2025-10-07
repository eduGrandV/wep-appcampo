export const locaPlanta = [
  { id: 1, name: "GV-F1 MANGA TOMMY 01", centroCusto: "1.5.1.01.01" },
  { id: 2, name: "GV-F1 MANGA PALMER 02", centroCusto: "1.5.1.01.02" },
  { id: 3, name: "GV-F1 MANGA PALMER 03", centroCusto: "1.5.1.01.03" },
  { id: 4, name: "GV-F1 MANGA PALMER 04.1", centroCusto: "1.5.1.01.04" },
  { id: 5, name: "GV-F1 MANGA KEITT 04.2", centroCusto: "1.5.1.01.05" },
  { id: 6, name: "GV-F1 MANGA PALMER 05", centroCusto: "1.5.1.01.06" },
  { id: 7, name: "GV-F1 MANGA TOMMY 06", centroCusto: "1.5.1.01.07" },
  { id: 8, name: "GV-F1 MANGA PALMER 07", centroCusto: "1.5.1.01.08" },
  { id: 9, name: "GV-F1 MANGA TOMMY 08", centroCusto: "1.5.1.01.09" },
  { id: 10, name: "GV-F1 MANGA TOMMY 09", centroCusto: "1.5.1.01.10" },
  { id: 11, name: "GV-F1 MANGA KEITT 10", centroCusto: "1.5.1.01.11" },
  { id: 12, name: "GV-F1 MANGA PALMER 11", centroCusto: "1.5.1.01.12" },
  { id: 13, name: "GV-F1 MANGA PALMER 12", centroCusto: "1.5.1.01.13" },
  { id: 14, name: "GV-F1 MANGA PALMER 13", centroCusto: "1.5.1.01.14" },
  { id: 15, name: "GV-F1 MANGA PALMER 14", centroCusto: "1.5.1.01.15" },
  { id: 16, name: "GV-F1 MANGA PALMER 15.1", centroCusto: "1.5.1.01.16" },
  { id: 17, name: "GV-F1 MANGA KEITT 15.2", centroCusto: "1.5.1.01.17" },
  { id: 18, name: "GV-F1 MANGA PALMER 16", centroCusto: "1.5.1.01.18" },
  { id: 19, name: "GV-F1 MANGA PALMER 17.1", centroCusto: "1.5.1.01.19" },
  { id: 20, name: "GV-F1 MANGA PALMER 17.2", centroCusto: "1.5.1.01.20" },
  { id: 21, name: "GV-F1 MANGA PALMER 18", centroCusto: "1.5.1.01.21" },
  { id: 22, name: "GV-F1 MANGA PALMER 19", centroCusto: "1.5.1.01.22" },
  { id: 23, name: "GV-F1 MANGA KENT 27", centroCusto: "1.5.1.01.23" },
  { id: 24, name: "GV-F1 MANGA KENT 31", centroCusto: "1.5.1.01.24" },
  { id: 25, name: "GV-F1 MANGA KENT 32", centroCusto: "1.5.1.01.25" },
  { id: 26, name: "GV-F1 MANGA KENT 33", centroCusto: "1.5.1.01.26" },
  { id: 27, name: "GV-F1 MANGA KENT 34", centroCusto: "1.5.1.01.27" },
  { id: 28, name: "GV-F2 MANGA TOMMY 22.1", centroCusto: "1.5.1.02.01" },
  { id: 29, name: "GV-F2 MANGA PALMER 22.2", centroCusto: "1.5.1.02.02" },
  { id: 30, name: "GV-F2 MANGA TOMMY 23", centroCusto: "1.5.1.02.03" },
  { id: 31, name: "GV-F2 MANGA TOMMY 24", centroCusto: "1.5.1.02.04" },
  { id: 32, name: "GV-F2 MANGA PALMER 25", centroCusto: "1.5.1.02.05" },
  { id: 33, name: "GV-F2 MANGA TOMMY 26", centroCusto: "1.5.1.02.06" },
  { id: 34, name: "GV-F2 MANGA KEITT 28", centroCusto: "1.5.1.02.07" },
  { id: 35, name: "GV-F2 MANGA KEITT 29", centroCusto: "1.5.1.02.08" },
  { id: 36, name: "GV-F2 MANGA KEITT 30", centroCusto: "1.5.1.02.09" },
  { id: 37, name: "GV-F3 MANGA KEITT 20", centroCusto: "1.5.1.03.01" },
  { id: 38, name: "GV-F3 MANGA PALMER 21", centroCusto: "1.5.1.03.02" },
];

export type TipoProblema = 'doenca' | 'praga' | 'inimigo natural';

export interface Problema {
  nome: string;
  tipo: TipoProblema;
}


export interface RegraAcao {
  condicao: string; 
  limite?: { tipo: 'doenca' | 'praga-bordadura' | 'praga-interna' | 'praga-media'; valor: number };
}

export interface Protocolo {
  amostragem: string;
  frequencia: string;
  avaliacao?: string;
  nivelDeAcao: RegraAcao[]; 
}


export const problemas: Problema[] = [
  { nome: "Morte Descendente", tipo: "doenca" },
  { nome: "Oídio", tipo: "doenca" },
  { nome: "Malformação e Microácaro", tipo: "doenca" },
  { nome: "Mancha Angular", tipo: "doenca" },
  { nome: "Antracnose", tipo: "doenca" },
  { nome: "Mancha de Alternaria", tipo: "doenca" },
  { nome: "Tripes", tipo: "praga" },
  { nome: "Pulgão", tipo: "praga" },
  { nome: "Lepidópteros", tipo: "praga" },
  { nome: "Mosquinha da Manga", tipo: "praga" },
  { nome: "Cochonilha", tipo: "praga" },
  { nome: "Inimigos Naturais", tipo: "inimigo natural" }
];



export const protocolosDeAcao: Record<string, Protocolo> = {
  TRIPES: {
    amostragem: `Amostrar: 10 plantas (até 5 ha), 14 plantas (>5 a 10 ha) e 18 plantas (>10 a 15 ha). Em plantios com mais de 15 ha, dividi-Ios em talhões menores.\n\nRamos: do início da rotação até o início da floração, efetuar, ao acaso, cinco vezes a batedura (em bandeja plástica branca), de 8 ramos (brotações e/ou folhas novas) por planta, sendo dois em cada quadrante, para observar a presença de tripes.\n\nInflorescência e frutos: a partir do inicio da floração até a fase de chumbinho, efetuar, ao acaso, cinco vezes a batedura de 4 panículas novas, por planta (uma por quadrante), para contagem dos tripes. Da fase de chumbinho até 25 dias antes da colheita, observar, ao acaso, a presença de tripes em 4 frutos por planta (um por quadrante).`,
    frequencia: "Semanal.",
    nivelDeAcao: [
      { condicao: "Ramos: 40% ou mais de ramos infestados por tripes.", limite: { tipo: 'praga-media', valor: 40 } },
      { condicao: "Inflorescências: 10% ou mais de inflorescências com 10 ou mais tripes.", limite: { tipo: 'praga-media', valor: 10 } },
      { condicao: "Frutos: 10% ou mais de frutos infestados por tripes.", limite: { tipo: 'praga-media', valor: 10 } },
    ]
  },
  LEPIDÓPTEROS: {
    amostragem: `Amostrar: 10 plantas (até 5 ha), 14 plantas (>5 a 10 ha) e 18 plantas (>10 a 15 ha). Em plantios com mais de 15 ha, dividi-Ios em talhões menores.\n\nInflorescências: efetuar, ao acaso, a batedura de 4 panículas por planta (uma em cada quadrante), para observar a presença de lagartas. Quando as panículas forem adensadas, devem ser abertas.`,
    frequencia: "Semanal (do início da floração até a fase de chumbinho).",
    nivelDeAcao: [
      { condicao: "Inflorescências: 10% ou mais de inflorescências com presença de lagarta.", limite: { tipo: 'praga-media', valor: 10 } }
    ]
  },
  "MOSQUINHA DA MANGA": {
    amostragem: `Amostrar: 10 plantas (até 5 ha), 14 plantas (>5 a 10 ha) e 18 plantas (>10 a 15 ha). Em plantios com mais de 15 ha, dividi-Ios em talhões menores.\n\nBrotações: observar sintomas da praga ou sintomas, em oito brotações, sendo duas em cada quadrante da planta.\nFolhas novas: observar sintomas da praga ou sintomas em folhas novas de oito ramos por planta, sendo duas em cada quadrante.\nRamos: observar sintomas da praga na haste de oito ramos por planta, sendo dois ramos por quadrante.\nInflorescências: observar sintomas da praga em quatro panículas por planta, sendo uma em cada quadrante.\nFrutos na fase de chumbinho: observar sintomas da praga em um fruto por quadrante.`,
    frequencia: "Semanal. Na fase de floração e frutificação (até a fase de chumbinho). recomenda-se realizar duas amostragens por semana, tendo em vista o potencial de dano da praga.",
    nivelDeAcao: [
      { condicao: "Quando se constatar 5 % ou mais de ramos com sintomas (haste e/ou brotações e/ou folhas novas).", limite: { tipo: 'praga-media', valor: 5 } },
      { condicao: "2% ou mais de inflorescências e/ou frutos com sintomas na fase de chumbinho.", limite: { tipo: 'praga-media', valor: 2 } }
    ]
  },
  PULGÃO: {
    amostragem: `Amostrar: 10 plantas em parcelas com até 05 ha, 14 plantas em parcelas maiores que 05 e até 10 ha e 18 plantas em parcelas maiores que 10 e até 15 ha. Em plantios com mais de 15 ha, dividi-Ios em talhões menores.\n\nFrequência: semanal.\nBrotações: observar a presença da praga, em 8 brotações por planta, sendo duas em cada quadrante.\nInflorescência: observar a presença da praga em 4 panículas por planta, sendo uma em cada quadrante.`,
    frequencia: "Semanal.",
    nivelDeAcao: [
      { condicao: "Quando se constatar 30 % ou mais de brotações e/ou panículas infestadas.", limite: { tipo: 'praga-media', valor: 30 } }
    ]
  },
  COCHONILHA: {
    amostragem: `Amostrar: 10 plantas em parcelas com até 05 ha, 14 plantas em parcelas maiores que 05 e até 10 ha e 18 plantas em parcelas maiores que 10 e até 15 ha. Em plantios com mais de 15 ha, dividi-Ios em talhões menores.\n\nFolhas: observar, ao acaso, a presença de cochonilhas vivas em folhas de dois ramos (da parte mediana e inferior da planta) por quadrante.\nFrutos: da fase de chumbinho até 25 dias antes da colheita, observar, ao acaso, a presença de cochonilhas vivas em um fruto por quadrante (parte interna da planta).`,
    frequencia: "Semanal.",
    nivelDeAcao: [
        { condicao: "A. tubercularis: 10% ou mais de folhas infestadas e/ou presença de cochonilhas nos frutos.", limite: { tipo: 'praga-media', valor: 10 } },
        { condicao: "P. tribitiformis: 50% ou mais de folhas infestadas.", limite: { tipo: 'praga-media', valor: 50 } },
        { condicao: "Pseudococusadonidum: presença de cochonilhas nos frutos." }
    ]
  },
  OÍDIO: {
    amostragem: `Amostrar: 10 plantas em áreas ≤ 5 ha; 14 plantas em áreas > 05 a 10 ha e 18 plantas em áreas > 10 a 15 ha.\n\nFolhas: avaliar as cinco primeiras folhas do último fluxo de oito ramos de cada planta, sendo dois por quadrante.\n\nInflorescências: oito panículas por planta, sendo duas por quadrante.`,
    frequencia: "Semanal (durante todo o ciclo fenológico da cultura).",
    avaliacao: "Cálculo da % de ocorrência em folhas e inflorescências.",
    nivelDeAcao: [
      { condicao: "Medidas preventivas: Inspeções de 2 a 3 vezes por semana em toda a área, quando no 2º semestre do ano o pomar estiver com flores; Tratamento quando o período de floração e brotação coincidir com condições climáticas favoráveis." },
      { condicao: "Medidas reparadoras: Quando ≥ 10% de folhas com sintomas, estando a planta sem flores ou ≥ 5% estando a planta com flores ou frutos.", limite: { tipo: 'doenca', valor: 10 } },
      { condicao: "Será ≥ 5% quando inflorescências com sintomas.", limite: { tipo: 'doenca', valor: 5 } }
    ]
  },
  "MANCHA ANGULAR": {
    amostragem: `Amostrar: 10 plantas em áreas ≤ 5 ha; 14 plantas em áreas >05 a 10 ha e 18 plantas em áreas> 10a 15 ha.\n\nFolhas: avaliar as cinco primeiras folhas do último fluxo de oito ramos de cada planta.\n\nFrutos: avaliar oito frutos por planta, sendo dois por quadrante.`,
    frequencia: "Semanal (durante todo o ciclo fenológico da cultura).",
    avaliacao: "Cálculo da % de ocorrência em folhas e frutos.",
    nivelDeAcao: [
      { condicao: "Medidas preventivas: Nos períodos favoráveis a doença (T ≤ 25°C, chuvas e ventos fortes), deve-se intensificar amostragem." },
      { condicao: "Medidas reparadoras: ≥ 10% de folhas com sintomas e/ou ≥ 5% de frutos com sintomas.", limite: { tipo: 'doenca', valor: 10 } }
    ]
  },
  "MALFORMAÇÃO E MICROÁCARO": {
    amostragem: `Amostrar:10 plantas em áreas ≤ 5 ha; 14 plantas em áreas >05 a 10 ha e 18 plantas em áreas >10 a 15 ha.\n\nBrotações: avaliar a presença de sintomas (superbrotamento) em oito ramos por planta.\n\nInflorescências: avaliar a presença de sintomas (embonecamento floral) em oito inflorescências por planta.`,
    frequencia: "Semanal (durante todo o ciclo fenológico da cultura).",
    avaliacao: "Cálculo da % de ocorrência em folhas, inflorescências e frutos.",
    nivelDeAcao: [
      { condicao: "Medidas preventivas: Recomenda-se o tratamento em pomares que apresentaram na safra anterior sintomas de malformação." },
      { condicao: "Medidas reparadoras: ≥ 5% de brotações e/ou gemas com malformação vegetativa.", limite: { tipo: 'doenca', valor: 5 } },
      { condicao: "Medidas reparadoras: ≥ 10% de inflorescências com malformação floral.", limite: { tipo: 'doenca', valor: 10 } }
    ]
  },
  ANTRACNOSE: {
    amostragem: `Amostrar: 10 plantas em áreas ≤ 5 ha; 14 plantas em áreas >05 a 10 ha e 18 plantas em áreas> 10a 15 ha.\n\nFolhas: avaliar a presença de sintomas em folhas de oito ramos por planta.\n\nInflorescências: avaliar a presença de sintomas em oito inflorescências por planta.\n\nFruto: avaliar a presença de sintomas em oito frutos por planta.`,
    frequencia: "Semanal (durante todo o ciclo fenológico da cultura).",
    avaliacao: "Cálculo da % de ocorrência em folhas, inflorescências e frutos.",
    nivelDeAcao: [
      { condicao: "Medidas preventivas: Inspeções de 2 a 3 vezes por semana quando no 1º semestre o pomar estiver com flores e houver condições favoráveis ( ≥70%, 20-25°C por >48 horas)." },
      { condicao: "Medidas reparadoras: Quando ≥ 10% de folhas com sintomas (sem flores) ou ≥ 5% (com flores ou frutos).", limite: { tipo: 'doenca', valor: 10 } },
      { condicao: "Também será ≥ 5% de inflorescências ou de frutos com sintomas.", limite: { tipo: 'doenca', valor: 5 } }
    ]
  },
  "MORTE DESCENDENTE": {
    amostragem: `Amostrar: 10 plantas em áreas≤5 ha; 14 plantas em áreas >05a 10 ha e 18 plantas em áreas >10a 15 ha.\n\nAvaliar folhas, ramos, inflorescências e frutos em 8 unidades por planta.`,
    frequencia: "Semanal (durante todo o ciclo fenológico da cultura).",
    avaliacao: "Cálculo da % de ocorrência em folhas, ramos, inflorescências e frutos.",
    nivelDeAcao: [
      { condicao: "Medidas preventivas: Recomenda-se o tratamento periódico (anual) de troncos e bifurcações; realizar o pincelamento dos ferimentos da planta." },
      { condicao: "Medidas reparadoras: Quando ≥ 10% de folhas com sintomas ou ≥ 5% de ramos, ou inflorescências e frutos com sintomas.", limite: { tipo: 'doenca', valor: 10 } }
    ]
  },
  "MANCHA DE ALTERNARIA": {
    amostragem: `Amostrar:10 plantas em áreas ≤ 5 ha; 14 plantas em áreas> 05 a 10 ha e 18 plantas em áreas> 10 a 15 ha.\n\nFolhas: avaliar a presença de sintomas em folhas de oito ramos por planta.\n\nFrutos: avaliar a presença de sintomas em oito frutos por planta.`,
    frequencia: "Semanal (durante todo o ciclo fenológico da cultura).",
    avaliacao: "Cálculo da % de ocorrência em folhas e frutos.",
    nivelDeAcao: [
      { condicao: "Medidas preventivas: é permitido o tratamento quando a umidade relativa for alta e temperaturas amenas (≤  25°C) associada a ventos fortes." },
      { condicao: "Medidas reparadoras: ≥ 10% de folhas com sintomas ou ≥ 5% de frutos com sintomas.", limite: { tipo: 'doenca', valor: 10 } }
    ]
  }
};



