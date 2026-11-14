/**
 * Conteúdo único do site. Qualquer ajuste de texto, link ou dado é feito só aqui.
 */

export const company = {
  name: "DP Systems",
  headline: "Software que liga o seu sistema ao mundo físico.",
  intro:
    "Somos uma engenharia de software sob medida em São Paulo. Fazemos impressoras térmicas, estoques e crachás conversarem com a sua operação, do navegador até o hardware.",
  mission: "Transformamos desafios complexos em software exclusivo.",
  missionSub: "Engenharia sob demanda para impulsionar qualquer modelo de negócio.",
  editorial:
    "Cada produto aqui nasceu de um problema real de operação: impressoras que travavam no navegador, estoques sem rastreio e crachás que demoravam a sair. Construímos o software que faltava, sob medida, e seguimos ao lado de quem usa.",
  legalName: "PEDRO HENRIQUE MORAIS DE ASSIS & CIA LTDA",
  cnpj: "65.147.732/0001-54",
  location: "Pinheiros, São Paulo - SP",
  founded: "2026",
  status: "Ativa",
  directors: ["Pedro H. Morais", "Diego H. Pereira"],
  whatsapp:
    "https://wa.me/5531971828478?text=" +
    encodeURIComponent("Olá! Vim pelo site da DP Systems e gostaria de falar com a engenharia."),
};

export const nav = [
  { id: "dpprinter", label: "DP Printer" },
  { id: "estoquento", label: "EstoqueNTO" },
  { id: "credencial", label: "Credencial Studio" },
  { id: "sobre", label: "Sobre" },
] as const;

export const dpprinter = {
  name: "DP Printer",
  version: "Versão 4.0",
  url: "https://dpprinter.com.br/",
  urlLabel: "dpprinter.com.br",
  requirements: "Windows 7 ou superior. Licença sob medida.",
  title: "Imprima etiquetas direto do navegador, sem driver e sem fila.",
  copy: "Fica na bandeja do Windows e recebe os comandos do seu sistema web. A etiqueta sai na hora, pela USB ou pela rede, e cada impressão fica registrada: quem imprimiu, onde e quando.",
  stats: [
    { value: "Zero", label: "configuração de driver" },
    { value: "100%", label: "das impressões auditadas" },
    { value: "Multi", label: "marcas além da Zebra" },
  ],
  features: [
    {
      title: "USB nativa",
      text: "Comunicação direta com a porta USB, sem passar pela fila lenta do Windows.",
    },
    {
      title: "Auditoria de ativos",
      text: "Número de série, estação e usuário registrados a cada etiqueta impressa.",
    },
    {
      title: "Descoberta de rede",
      text: "Encontra as impressoras da rede local sozinho, sem configurar IP à mão.",
    },
    {
      title: "Instalação limpa",
      text: "Remove o Zebra Browser Print e proxies antigos. Funciona com vários logins.",
    },
    {
      title: "Atualização automática",
      text: "Baixa e aplica novas versões e correções sem parar a operação.",
    },
    {
      title: "Registro local",
      text: "Mantém o histórico de impressão na própria máquina, além da nuvem.",
    },
  ],
  // Valores de demonstração do simulador: não são dados de clientes.
  sim: {
    labs: ["LC 0101", "LC 0240", "LC 0387"],
    operators: ["operador.demo", "recepcao-02", "coleta.lab"],
    stations: ["ESTACAO-LAB01", "RECEPCAO-PC04"],
  },
};

export type Integration = {
  name: string;
  text: string;
  ms: number;
  glyph: string;
  color: string;
  endpoint: string;
};

export const estoquento = {
  name: "EstoqueNTO",
  url: "https://estoquento.vercel.app/",
  urlLabel: "estoquento.vercel.app",
  title: "O estoque inteiro em um painel, com o armazém em 3D.",
  copy: "Entrada, prateleira, postagem e rastreio no mesmo painel. As integrações avisam o cliente, assinam o termo e geram a etiqueta dos Correios sozinhas.",
  hubTitle: "Integrações",
  hubStatus: "Todos os sistemas operacionais",
  hubAverage: 753,
  integrations: [
    { name: "Firebase", text: "Banco de dados em tempo real e login", ms: 17, glyph: "Fb", color: "#F59E0B", endpoint: "firestore · onSnapshot /estoque" },
    { name: "WhatsApp Business", text: "Avisos de chegada e conversas pelo WhatsApp oficial", ms: 232, glyph: "Wa", color: "#22C55E", endpoint: "POST /messages · template chegada" },
    { name: "DocuSign", text: "Assinatura eletrônica dos termos de comodato", ms: 1577, glyph: "Ds", color: "#6366F1", endpoint: "POST /envelopes · termo de comodato" },
    { name: "Correios · ViPP", text: "Postagens, etiquetas e códigos de rastreio", ms: 1748, glyph: "Vp", color: "#CA8A04", endpoint: "POST /postagem · etiqueta + código" },
    { name: "Rastreamento", text: "Acompanhamento das entregas dos Correios", ms: 2227, glyph: "Rt", color: "#0EA5E9", endpoint: "GET /rastreio/{codigo}" },
    { name: "Consulta de CNPJ", text: "Razão social preenchida pelo CNPJ", ms: 311, glyph: "Cn", color: "#8B5CF6", endpoint: "GET /cnpj/{numero}" },
    { name: "Consulta de CEP", text: "Endereço preenchido pelo CEP", ms: 731, glyph: "Ce", color: "#EC4899", endpoint: "GET /cep/{numero}" },
    { name: "Microsoft 365 · Excel", text: "Sincronização da Planilha Dany no Excel", ms: 172, glyph: "Xl", color: "#16A34A", endpoint: "PATCH /workbook/tables/rows" },
    { name: "Telemetria DP Printer", text: "Registros das impressoras no controle de parque", ms: 476, glyph: "Dp", color: "#10B981", endpoint: "GET /telemetria/impressoras" },
  ] satisfies Integration[],
};

export const credencial = {
  name: "Credencial Studio",
  title: "Crachás corporativos, do layout à impressora.",
  copy: "Aplicativo desktop para criar, diagramar e emitir crachás em impressoras de cartão PVC, sem retrabalho.",
  features: [
    { title: "Criação", text: "Foto, dados e identidade visual da empresa no mesmo editor." },
    { title: "Diagramação", text: "Layout no formato padrão de cartão CR80, pronto para o PVC." },
    { title: "Emissão rápida", text: "Do cadastro à impressão em poucos cliques." },
    { title: "Impressoras PVC", text: "Feito para impressoras de cartão, direto do desktop." },
  ],
  access: ["Colaborador", "Visitante", "Acesso restrito"],
  finishes: ["Holográfico", "Esmeralda", "Prata escovado"],
  sample: { name: "Ana Ribeiro", role: "Engenharia de Sistemas" },
};

export const contact = {
  title: "Vamos desenhar o sistema da sua operação?",
  copy: "Nossas soluções são feitas sob demanda. Conte o que trava a sua operação hoje e a engenharia responde com um caminho.",
};
