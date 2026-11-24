/**
 * Conteúdo único do site. Textos e dados vêm do funcionamento real de cada
 * produto (repositórios do DP Printer, EstoqueNTO e Credencial Studio).
 * Ajustes de texto, links e contatos são feitos só aqui.
 */

export type Partner = {
  name: string;
  fullName: string;
  role: string;
  focus: string;
  /** Preencher com o perfil real; sem URL o cartão aparece sem o botão do LinkedIn. */
  linkedin: string | null;
};

export const company = {
  name: "DP Systems",
  legalName: "PEDRO HENRIQUE MORAIS DE ASSIS & CIA LTDA",
  cnpj: "65.147.732/0001-54",
  location: "Pinheiros, São Paulo - SP",
  founded: "2026",
  manifesto: "Transformamos desafios complexos em software exclusivo.",
  manifestoSub: "Engenharia on-demand para impulsionar qualquer modelo de negócio.",
  lead:
    "Escrevemos o software que falta entre o seu sistema e a operação: a impressora que precisa receber a etiqueta do navegador, o estoque que precisa falar com os Correios, o crachá que precisa sair da base antiga. Da arquitetura ao deploy, com quem vai usar no dia a dia.",
  whatsappNumber: "5531971828478",
  whatsappDisplay: "+55 31 97182-8478",
  /** Preencher com o e-mail oficial; sem e-mail o cartão e o envio por e-mail ficam ocultos. */
  email: null as string | null,
  partners: [
    {
      name: "Pedro Henrique",
      fullName: "Pedro H. Morais",
      role: "Sócio, engenharia de software",
      focus: "Middleware de impressão, integrações e sistemas internos",
      linkedin: null,
    },
    {
      name: "Diego",
      fullName: "Diego H. Pereira",
      role: "Sócio, engenharia de software",
      focus: "Automação de operação, APIs e entrega dos produtos",
      linkedin: null,
    },
  ] satisfies Partner[],
};

export type Subject = "sob-medida" | "dpprinter" | "estoquento" | "credencial" | "outro";

export const SUBJECTS: { id: Subject; label: string; message: string }[] = [
  { id: "sob-medida", label: "Projeto sob medida", message: "Olá! Quero conversar sobre um projeto de software sob medida." },
  { id: "dpprinter", label: "DP Printer", message: "Olá! Quero saber mais sobre o DP Printer para a minha operação." },
  { id: "estoquento", label: "EstoqueNTO", message: "Olá! Quero conhecer o EstoqueNTO." },
  { id: "credencial", label: "Credencial Studio", message: "Olá! Quero uma demonstração do Credencial Studio para impressão de crachás." },
  { id: "outro", label: "Outro assunto", message: "Olá! Vim pelo site da DP Systems." },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const nav = [
  { href: "/", label: "Apresentação" },
  { href: "/projetos", label: "Projetos" },
  { href: "/contato", label: "Contato" },
] as const;

/** Como a engenharia sob medida aparece em cada produto real. */
export const practices = [
  {
    title: "Hardware falando com o navegador",
    text: "Seu sistema web imprime direto na Zebra, pela USB ou pela rede, sem driver nem Browser Print. É o que o DP Printer faz escutando em 127.0.0.1:9100.",
  },
  {
    title: "Integrações que eliminam digitação",
    text: "Correios ViPP, rastreio, DocuSign, WhatsApp oficial, consulta de CNPJ e CEP e Microsoft 365 ligados no mesmo fluxo do EstoqueNTO.",
  },
  {
    title: "Saída de sistemas antigos",
    text: "O Credencial Studio importou a base do Access e as artes dos crachás antigos, com backup antes de cada gravação e nenhum registro perdido.",
  },
  {
    title: "Operação rastreável",
    text: "Cada etiqueta vira um registro com laboratório, serial, estação e usuário. Cada equipamento tem histórico do recebimento ao envio.",
  },
];

export type Product = {
  id: "dpprinter" | "estoquento" | "credencial";
  name: string;
  page: number;
  badge: string;
  title: string;
  summary: string;
  tags: string[];
  /** Link externo do produto; sem link, o botão principal abre o contato. */
  url: string | null;
  urlLabel: string | null;
  subject: Subject;
};

export const products: Product[] = [
  {
    id: "dpprinter",
    name: "DP Printer",
    page: 1,
    badge: "Mais de 7.000 laboratórios Hermes Pardini",
    title: "Do sistema web para a impressora de etiquetas, sem driver.",
    summary:
      "Aplicativo de bandeja para Windows que recebe a impressão do navegador em 127.0.0.1:9100, no mesmo protocolo do Zebra Browser Print, e manda o comando bruto para a impressora por USB, rede ou driver. Cada etiqueta gera um registro com laboratório, serial da impressora, estação, usuário e cidade.",
    tags: ["USB Raw", "Rede TCP/IP", "Compatível com Browser Print", "Proxy GTI", "Firebase", "Windows 7 ou superior"],
    url: "https://dpprinter.com.br/",
    urlLabel: "dpprinter.com.br",
    subject: "dpprinter",
  },
  {
    id: "estoquento",
    name: "EstoqueNTO",
    page: 2,
    badge: "Parque de impressoras em comodato",
    title: "Cada impressora do parque, do recebimento ao laboratório.",
    summary:
      "Controla os equipamentos pelo patrimônio SELB e pelo número de série: entrada, vaga na prateleira (em 2D ou na sala 3D), envio com postagem ViPP dos Correios e rastreio, termo de comodato assinado no DocuSign e aviso ao laboratório pelo WhatsApp oficial. O mapa do parque lê a telemetria do DP Printer.",
    tags: ["Correios ViPP", "Rastreio", "DocuSign", "WhatsApp oficial", "Microsoft 365", "Firebase"],
    url: "https://estoquento.vercel.app/",
    urlLabel: "estoquento.vercel.app",
    subject: "estoquento",
  },
  {
    id: "credencial",
    name: "Credencial Studio",
    page: 3,
    badge: "Windows · Zebra ZC300",
    title: "Crachás CR80 em frente e verso, da planilha à impressora.",
    summary:
      "Cadastro, edição e impressão de crachás. Importa a base do Access, aceita uma planilha colada do Excel em lote, vincula a foto pelo número do crachá e mostra frente e verso antes de enviar. Vários computadores usam a mesma pasta de rede sem gravar um por cima do outro.",
    tags: ["C# · .NET 10 · WPF", "CR80 duplex", "Zebra ZC300", "Importação Access e CSV", "Pasta de rede"],
    url: null,
    urlLabel: null,
    subject: "credencial",
  },
];

/** Estados da revista: 0 capa, 1..3 produtos, 4 contracapa. */
export const magazineStates = [
  { page: 0, label: "Capa", background: "institutional" as const },
  { page: 1, label: "DP Printer", background: "dpprinter" as const },
  { page: 2, label: "EstoqueNTO", background: "estoquento" as const },
  { page: 3, label: "Credencial Studio", background: "credencial" as const },
  { page: 4, label: "Contracapa", background: "institutional" as const },
];

export const cover = {
  badge: "Edição 01",
  title: "Portfólio de engenharia e produtos",
  summary:
    "Três produtos em uso real: o middleware que imprime etiquetas direto do navegador, o sistema que controla o parque de impressoras e o estúdio de crachás que substituiu uma base em Access. Vire as páginas para ver cada um.",
};

export const backCover = {
  badge: "Contracapa",
  title: "Engenharia on-demand para o seu modelo de negócio.",
  summary:
    "Se a sua operação depende de uma impressora, de um parceiro com API ou de um sistema antigo que ninguém quer mexer, conte o problema. A conversa é direto com quem escreve o código.",
};

/* ---------- Dados das demonstrações (valores fictícios, não são clientes) ---------- */

export const dpprinterDemo = {
  labs: ["LC 0101", "LC 0240", "LC 0387"],
  operators: ["operador.demo", "recepcao-02", "coleta.lab"],
  stations: ["ESTACAO-LAB01", "RECEPCAO-PC04"],
};

export type Integration = {
  name: string;
  text: string;
  ms: number;
  glyph: string;
  color: string;
  endpoint: string;
};

export const estoquentoHub = {
  title: "Integrações",
  status: "Todos os sistemas operacionais",
  average: 753,
  integrations: [
    { name: "Firebase", text: "Banco em tempo real e login", ms: 17, glyph: "Fb", color: "#F59E0B", endpoint: "firestore · onSnapshot /estoque" },
    { name: "WhatsApp oficial", text: "Aviso de chegada e conversa com o laboratório (Twilio)", ms: 232, glyph: "Wa", color: "#22C55E", endpoint: "POST /api/enviar · template aprovado" },
    { name: "DocuSign", text: "Termo de comodato e laudo técnico assinados", ms: 1577, glyph: "Ds", color: "#6366F1", endpoint: "POST /api/enviar-termo · envelope" },
    { name: "Correios · ViPP", text: "Postagem, etiqueta e código de rastreio", ms: 1748, glyph: "Vp", color: "#CA8A04", endpoint: "POST /api/vipp?action=postar" },
    { name: "Rastreamento", text: "Andamento das entregas dos Correios", ms: 2227, glyph: "Rt", color: "#0EA5E9", endpoint: "GET /api/track?code={codigo}" },
    { name: "Consulta de CNPJ", text: "Razão social preenchida pelo CNPJ", ms: 311, glyph: "Cn", color: "#8B5CF6", endpoint: "GET /api/health?cnpj={numero}" },
    { name: "Consulta de CEP", text: "Endereço preenchido pelo CEP", ms: 731, glyph: "Ce", color: "#EC4899", endpoint: "GET /api/health?cep={numero}" },
    { name: "Microsoft 365 · Excel", text: "Planilha de controle sincronizada", ms: 172, glyph: "Xl", color: "#16A34A", endpoint: "Microsoft Graph · workbook/tables/rows" },
    { name: "Telemetria DP Printer", text: "Impressões por laboratório no mapa do parque", ms: 476, glyph: "Dp", color: "#22D3EE", endpoint: "Realtime DB · inventario/{lc}/{serial}" },
  ] satisfies Integration[],
};

export const credencialDemo = {
  sample: { name: "Ana Ribeiro", nameBack: "Ana", role: "Analista de Laboratório", badge: "001515", admission: "03/02/2026" },
  /** Faixa inferior da frente muda com a função, como no Credencial Studio. */
  functions: [
    { label: "Colaborador", band: "#2563EB", fixed: false },
    { label: "Aprendiz", band: "#4AAD42", fixed: true },
    { label: "Terceiro", band: "#F78331", fixed: true },
    { label: "Visitante", band: "#CA352D", fixed: true },
  ],
  finishes: ["Holográfico", "Brilho", "Fosco"],
};
