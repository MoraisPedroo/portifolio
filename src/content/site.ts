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
  kicker: "Engenharia sob medida · Pinheiros, São Paulo",
  manifesto: "Software sob medida para o que trava sua operação.",
  lead:
    "Construímos o elo entre o seu sistema e o chão da operação: impressão direta do navegador na térmica, controle de estoque com integrações reais e migração segura de bases antigas.",
  /** Faixa de prova logo abaixo dos botões da primeira tela. */
  proof: ["7.000+ laboratórios com o DP Printer", "2 sócios escrevendo o código", "Da arquitetura ao deploy"],
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

/** Como uma conversa vira projeto. */
export const steps = [
  { title: "Conversa técnica direta", text: "Você explica o gargalo para o Pedro e o Diego, sem intermediário comercial." },
  { title: "Escopo e prazo claros", text: "Devolvemos o desenho da solução, as integrações envolvidas e um cronograma objetivo." },
  { title: "Deploy acompanhado", text: "Entregamos em produção junto com a equipe que vai operar no dia a dia." },
];

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
    text: "Seu sistema web imprime direto na Zebra por USB Raw, TCP/IP ou driver, sem instalar o Zebra Browser Print em cada estação.",
    shift: "Antes: driver travando no balcão. Depois: etiqueta saindo do navegador.",
  },
  {
    title: "Integrações que eliminam redigitação",
    text: "Correios ViPP, rastreio, DocuSign, WhatsApp oficial via Twilio, consulta de CNPJ e CEP e Microsoft 365 no mesmo fluxo.",
    shift: "Antes: cinco sistemas abertos. Depois: um painel.",
  },
  {
    title: "Saída de sistemas antigos",
    text: "Bases em Access e planilhas viram aplicativos em rede, com validação dos dados e controle de revisão.",
    shift: "Antes: um computador com o arquivo. Depois: a equipe inteira na mesma base.",
  },
  {
    title: "Operação rastreável ponta a ponta",
    text: "Cada etiqueta gera registro de laboratório, serial, estação e usuário. Cada equipamento tem histórico do recebimento ao envio.",
    shift: "Antes: quem imprimiu? Depois: está no inventário.",
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
  /** Linha curta do índice da Apresentação. */
  line: string;
  /** Botão que abre a demonstração. */
  demoLabel: string;
  /** Rodapé da demonstração, que leva ao contato com o assunto certo. */
  demoFooter: { question: string; action: string };
};

export const products: Product[] = [
  {
    id: "dpprinter",
    name: "DP Printer",
    page: 1,
    badge: "Em produção · 7.000+ laboratórios Hermes Pardini",
    title: "Impressão térmica do navegador direto na impressora.",
    summary:
      "Aplicativo de bandeja para Windows (7 SP1 ou superior) que recebe comandos em 127.0.0.1:9100 no protocolo do Zebra Browser Print e envia direto por USB Raw, TCP/IP ou driver. Inclui proxy GTI, descoberta na rede, atualização automática e registro de cada impressão no inventário.",
    tags: ["USB Raw e TCP/IP", "Protocolo Browser Print", "Proxy GTI", "Windows 7+"],
    url: "https://dpprinter.com.br/",
    urlLabel: "Abrir dpprinter.com.br",
    subject: "dpprinter",
    line: "Impressão térmica do navegador direto na Zebra, em mais de 7.000 laboratórios.",
    demoLabel: "Testar simulador de impressão",
    demoFooter: { question: "Precisa imprimir do navegador direto na térmica?", action: "Falar sobre impressão" },
  },
  {
    id: "estoquento",
    name: "EstoqueNTO",
    page: 2,
    badge: "Sistema web · Parque em comodato",
    title: "O parque de impressoras inteiro em um painel.",
    summary:
      "Cada equipamento entra pelo patrimônio e número de série, ganha vaga na prateleira (em 2D ou na sala 3D) e sai com postagem ViPP dos Correios e rastreio. Termo de comodato e laudo no DocuSign, aviso pelo WhatsApp oficial, CNPJ e CEP preenchidos sozinhos, planilha no Microsoft 365 e mapa com a telemetria do DP Printer.",
    tags: ["Correios ViPP", "DocuSign", "WhatsApp via Twilio", "Microsoft 365"],
    url: "https://estoquento.vercel.app/",
    urlLabel: "Abrir o sistema",
    subject: "estoquento",
    line: "Parque de impressoras em comodato, da prateleira 3D ao termo no DocuSign.",
    demoLabel: "Explorar sala 3D e integrações",
    demoFooter: { question: "Precisa integrar estoque, Correios ou assinatura digital?", action: "Falar sobre integrações" },
  },
  {
    id: "credencial",
    name: "Credencial Studio",
    page: 3,
    badge: "Desktop Windows · C# / .NET 10",
    title: "Crachás CR80 frente e verso, da planilha à Zebra ZC300.",
    summary:
      "Aplicativo WPF que importou a base antiga do Access, aceita lotes colados do Excel e vincula cada foto pelo número do crachá. Mostra a prévia de frente e verso com a faixa da função e funciona em vários computadores na mesma pasta de rede, com trava e controle de revisão.",
    tags: ["C# · .NET 10 · WPF", "Zebra ZC300", "Lote do Excel e Access", "Pasta de rede"],
    url: null,
    urlLabel: null,
    subject: "credencial",
    line: "Crachás CR80 frente e verso na Zebra ZC300, direto do Excel.",
    demoLabel: "Testar editor de crachá 3D",
    demoFooter: { question: "Quer ver o aplicativo imprimindo na Zebra ZC300?", action: "Pedir demonstração técnica" },
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
  title: "Três sistemas reais rodando em produção.",
  summary:
    "Folheie os projetos para ver a arquitetura, testar as demonstrações no navegador e entender como resolvemos gargalos entre software, hardware e integrações.",
  action: "Abrir primeiro projeto",
};

export const backCover = {
  badge: "Contracapa",
  title: "Sua operação tem um gargalo parecido?",
  summary:
    "Se a sua equipe depende de impressora térmica, de integração com parceiros ou de um sistema antigo que ninguém quer manter, conte o cenário. Você fala direto com quem escreve o código.",
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
  /** Linhas de exemplo, como um lote colado do Excel. */
  batch: [
    { name: "Ana Ribeiro", role: "Analista de Laboratório", fn: 0 },
    { name: "Lucas Andrade", role: "Jovem Aprendiz", fn: 1 },
    { name: "Marina Costa", role: "Manutenção predial", fn: 2 },
    { name: "Rafael Lima", role: "Visita técnica", fn: 3 },
  ],
};
