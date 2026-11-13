/**
 * Conteúdo único do site. A revista 3D e a versão em texto leem daqui,
 * então qualquer ajuste de copy é feito só neste arquivo.
 */

export const company = {
  name: "DP Systems",
  tagline: "Tecnologia Corporativa",
  mission: "Transformamos desafios complexos em software exclusivo.",
  missionSub: "Engenharia on-demand para impulsionar qualquer modelo de negócio.",
  positioning:
    "Automação de hardware, middlewares de missão crítica e plataformas logísticas inteligentes.",
  editorial:
    "Cada produto desta edição nasceu de um problema real de operação: impressoras que travavam no navegador, estoques sem rastreio e crachás que demoravam a sair. Construímos o software que faltava, sob medida, e seguimos ao lado de quem usa.",
  legalName: "PEDRO HENRIQUE MORAIS DE ASSIS & CIA LTDA",
  cnpj: "65.147.732/0001-54",
  location: "Pinheiros, São Paulo - SP",
  founded: "2026",
  status: "Ativa",
  directors: ["Pedro H. Morais", "Diego H. Pereira"],
  whatsapp:
    "https://wa.me/5531971828478?text=" +
    encodeURIComponent(
      "Olá! Vim pelo portfólio da DP Systems e gostaria de falar com um consultor.",
    ),
};

export const sections = [
  { id: "capa", label: "Capa", short: "Capa" },
  { id: "editorial", label: "Editorial", short: "Editorial" },
  { id: "dpprinter", label: "01 · DP Printer", short: "01" },
  { id: "estoquento", label: "02 · EstoqueNTO", short: "02" },
  { id: "credencial", label: "03 · Credencial Studio", short: "03" },
  { id: "contracapa", label: "Contato", short: "Contato" },
] as const;

export const LAST_PAGE = sections.length - 1;
export const SHEET_COUNT = sections.length - 1;

export const dpprinter = {
  name: "DP Printer",
  version: "Versão estável 4.0",
  url: "https://dpprinter.com.br/",
  urlLabel: "dpprinter.com.br",
  tags: "Software Enterprise · Requer licença · Windows 7+",
  title: "Impressão de etiquetas sem fronteiras",
  kicker: "Poder além do driver",
  copy: "Conecte sua aplicação web diretamente a impressoras USB e de rede. Tenha controle total de quem imprimiu, onde e quando, com compatibilidade além da Zebra.",
  copy2:
    "Projetado para eliminar os gargalos do spooler do Windows, garantir a integridade dos dados de impressão e facilitar o gerenciamento do parque.",
  stats: [
    { value: "Zero", label: "Configuração de driver" },
    { value: "100%", label: "Log de auditoria" },
    { value: "Multi", label: "Marcas suportadas" },
    { value: "Cloud", label: "Integração Firebase" },
  ],
  features: [
    {
      title: "USB Nativa (Raw)",
      text: "Plugou, imprimiu. Comunicação direta com a porta USB, sem a fila lenta do Windows.",
    },
    {
      title: "Auditoria de ativos",
      text: "Número de série, estação e usuário registrados a cada evento de impressão.",
    },
    {
      title: "Descoberta de rede",
      text: "Encontra impressoras na rede local por broadcast UDP, sem configurar IP à mão.",
    },
    {
      title: "Clean Install & Multi-User",
      text: "Remove o Zebra Browser Print e proxies antigos. Rastreio correto com vários logins.",
    },
    {
      title: "Auto-update nativo",
      text: "Detecta, baixa e aplica novas versões e correções sem parar a operação.",
    },
    {
      title: "Tray icon & logs locais",
      text: "Fica na bandeja do sistema e mantém o histórico de impressão na própria máquina.",
    },
  ],
  // Valores fictícios para o simulador: não são dados de clientes.
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
  title: "Estoque com armazém 3D e arquitetura conectada",
  copy: "Plataforma completa de gestão de estoque: entrada, prateleira, postagem e rastreio em um só painel, com visualização 3D do armazém.",
  hubTitle: "APIs & Integrações",
  hubStatus: "Todos os sistemas operacionais",
  hubAverage: 753,
  integrations: [
    {
      name: "Firebase",
      text: "Banco de dados em tempo real e autenticação de login",
      ms: 17,
      glyph: "Fb",
      color: "#F59E0B",
      endpoint: "firestore · onSnapshot /estoque",
    },
    {
      name: "WhatsApp Business",
      text: "Notificações de chegada e conversas pelo WhatsApp oficial",
      ms: 232,
      glyph: "Wa",
      color: "#22C55E",
      endpoint: "POST /messages · template chegada",
    },
    {
      name: "DocuSign",
      text: "Assinatura eletrônica integrada para termos de comodato",
      ms: 1577,
      glyph: "Ds",
      color: "#6366F1",
      endpoint: "POST /envelopes · termo de comodato",
    },
    {
      name: "Correios · ViPP",
      text: "Geração de postagens, etiquetas e códigos de rastreio",
      ms: 1748,
      glyph: "Vp",
      color: "#EAB308",
      endpoint: "POST /postagem · etiqueta + código",
    },
    {
      name: "Rastreamento",
      text: "Acompanhamento em tempo real das entregas dos Correios",
      ms: 2227,
      glyph: "Rt",
      color: "#0EA5E9",
      endpoint: "GET /rastreio/{codigo}",
    },
    {
      name: "Consulta de CNPJ",
      text: "Preenchimento automático da razão social pelo CNPJ",
      ms: 311,
      glyph: "Cn",
      color: "#8B5CF6",
      endpoint: "GET /cnpj/{numero}",
    },
    {
      name: "Consulta de CEP",
      text: "Preenchimento de endereço automático pelo CEP",
      ms: 731,
      glyph: "Ce",
      color: "#EC4899",
      endpoint: "GET /cep/{numero}",
    },
    {
      name: "Microsoft 365 · Excel",
      text: "Sincronização sob demanda da Planilha Dany no Excel",
      ms: 172,
      glyph: "Xl",
      color: "#16A34A",
      endpoint: "PATCH /workbook/tables/rows",
    },
    {
      name: "Telemetria DPPrinter",
      text: "Registros das impressoras direto no Controle de Parque",
      ms: 476,
      glyph: "Dp",
      color: "#10B981",
      endpoint: "GET /telemetria/impressoras",
    },
  ] satisfies Integration[],
};

export const credencial = {
  name: "Credencial Studio",
  title: "Crachás corporativos, do layout à impressora",
  copy: "Aplicativo desktop profissional para criação, diagramação e emissão rápida de crachás corporativos, voltado para impressoras de cartões PVC.",
  features: [
    { title: "Criação", text: "Monte o crachá com foto, dados e identidade visual da empresa." },
    { title: "Diagramação", text: "Layout no formato padrão de cartão CR80, pronto para o PVC." },
    { title: "Emissão rápida", text: "Do cadastro à impressão em poucos cliques, sem retrabalho." },
    { title: "Impressoras PVC", text: "Feito para impressoras de cartão, direto do desktop." },
  ],
  access: ["Colaborador", "Visitante", "Acesso restrito"],
  finishes: ["Holográfico", "Esmeralda", "Prata escovado"],
  sample: { name: "Ana Ribeiro", role: "Engenharia de Sistemas" },
};

export const backCover = {
  title: "Pronto para modernizar seu parque?",
  kicker: "Licença sob medida",
  copy: "Nossas soluções são desenvolvidas 100% sob demanda. Fale com nossos engenheiros e vamos desenhar o ecossistema certo para a sua operação.",
};
