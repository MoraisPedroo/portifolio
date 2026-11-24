# DP Systems — site institucional

Site da DP Systems em três abas:

- **Apresentação** (`/`): manifesto, como a engenharia sob medida aparece nos produtos e o índice da revista.
- **Projetos** (`/projetos`): revista 3D com capa, DP Printer, EstoqueNTO, Credencial Studio e contracapa. O fundo (vídeo, cor e tipografia) e o painel ao lado mudam junto com a página. Cada produto tem uma demonstração interativa.
- **Contato** (`/contato`): WhatsApp com mensagem pronta, formulário de quatro campos, sócios e dados da empresa.

Os textos dos produtos vêm do funcionamento real de cada aplicativo (repositórios do DP Printer, EstoqueNTO e Credencial Studio).

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Para conferir o build de produção: `npm run build`.

## Onde mexer

| O quê | Arquivo |
| --- | --- |
| Textos, links, contatos, produtos e dados das demos | `src/content/site.ts` |
| E-mail oficial e LinkedIn dos sócios | `company.email` e `company.partners[].linkedin` em `src/content/site.ts` (vazios ficam ocultos) |
| Cores e tipografia | `src/app/globals.css` (bloco `@theme`) e `src/lib/fonts.ts` |
| Aba Projetos (revista, paginação, virada automática, teclado) | `src/components/projects/ProjectsStage.tsx` |
| Painel ao lado da revista | `src/components/projects/ProjectHUD.tsx` |
| Fundos de cada página (vídeo, foto, cor, palavra) | `src/components/projects/backgrounds.ts`, vídeos em `public/videos/bg-*.mp4` |
| Demonstrações dos produtos | `src/components/projects/DemoDialog.tsx`, `src/components/dpprinter/`, `src/components/estoquento/`, `src/components/credencial/` |
| Páginas da revista | `src/three/magazine/pages.ts` |
| Som de virar página | `src/lib/pageSound.ts` |
| Sala 3D do EstoqueNTO (demonstração, sem login) | `public/sala3d/` |
| Crachá 3D | `src/three/BadgeScene.tsx`, `src/three/badgeFaces.ts` |
| Contato | `src/components/contact/ContactView.tsx` |

## Como funciona

- Todo texto é HTML de verdade: legível no celular, indexável e acessível.
- Um canvas WebGL fixo no layout (`src/three/SharedCanvas.tsx`) desenha a revista com o `<View>` do drei e continua vivo ao trocar de aba.
- A revista abre 5 s depois de aparecer e vira uma página a cada 10 s; clique, setas, teclas 0–4 ou deslizar no celular reiniciam a contagem. `M` liga e desliga o som. `?p=2` abre direto numa página.
- O som de virar página é sintetizado com Web Audio (sem arquivo) e respeita o botão de mudo, salvo no navegador.
- Os vídeos de fundo foram gerados no Gemini e convertidos em loop sem emenda (`ffmpeg`, sem áudio, ~300 KB cada). Páginas sem vídeo usam a foto com um movimento lento de câmera.
- `/contato?assunto=credencial` já abre o formulário e o WhatsApp com o assunto escolhido.
- Se o FPS cair, o `PerformanceMonitor` reduz a resolução do canvas.

## Paleta

| Token | Cor | Uso |
| --- | --- | --- |
| `ink` | `#0B0D10` | Fundo escuro |
| `paper` | `#F2F0EB` | Fundo claro |
| `dp` | `#10B981` | Marca |
| `brass` | `#E8C38A` | Capa e contracapa |
| `prt` | `#22D3EE` | DP Printer |
| `nto` | `#F26A1B` | EstoqueNTO |
| `cred` | `#3B82F6` | Credencial Studio |

## Publicar

O projeto é publicado na Vercel a partir da branch `main` do GitHub: cada push gera um novo deploy.
